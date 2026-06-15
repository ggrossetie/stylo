# Migration de `graphql/` CommonJS → ESM (par lots)

> Plan de migration progressive, fichier par fichier, sans big-bang.
> Le paquet reste fonctionnel à chaque étape : on peut s'arrêter / livrer entre deux lots.

## Contexte

- Cible : **Node 24** (`volta.node = 24.16.0`, `engines.node >= 22`).
- État actuel : `graphql/` est en **CommonJS** (pas de `"type"` dans `package.json`, donc `commonjs` par défaut). 87 fichiers `.js`.
- L'interop Node 24 fonctionne **dans les deux sens**, donc CJS et ESM peuvent cohabiter dans le même paquet pendant toute la migration. On garde `"type": "commonjs"` jusqu'au bout (flip final optionnel).

### Faits vérifiés (Node 24.11)

| Cas | Résultat |
|---|---|
| ESM `import X from './cjs.js'` | ✅ `X = module.exports` (propre, pas de `.default`) |
| ESM `import { foo } from './cjs.js'` (named) | ✅ détecté via cjs-module-lexer pour `exports.foo = …` |
| CJS `require('./esm.mjs')` | ⚠️ renvoie un namespace : `module.exports` est sous **`.default`** |
| CJS `require('./esm')` **sans extension** | ❌ `MODULE_NOT_FOUND` (require ne résout pas `.mjs`) |
| CJS `require('./esm.mjs')` quand l'ESM a un **top-level `await`** | ❌ `ERR_REQUIRE_ASYNC_MODULE` |

## Règle d'or : migrer **de la racine vers les feuilles** (top-down)

On migre dans l'ordre **reverse-topologique** : un fichier n'est converti que lorsque **tous ses importateurs sont déjà en ESM**.

Conséquence : on n'a **jamais** un fichier CJS qui `require()` un fichier ESM. Donc :
- jamais de `.default` à rajouter côté consommateur (l'interop ESM→CJS est propre) ;
- jamais de `ERR_REQUIRE_ASYNC_MODULE` → on peut introduire du top-level `await` librement dès qu'un fichier est en ESM ;
- chaque renommage `.js` → `.mjs` n'impacte que des importateurs déjà ESM, dont on met simplement à jour le chemin.

> Intuition inverse de ce qu'on attend : on commence par `app.js` (le point d'entrée), pas par les helpers.

## Recettes mécaniques (à appliquer dans chaque fichier converti)

| CommonJS | ESM |
|---|---|
| renommer `xxx.js` | → `xxx.mjs` |
| `const x = require('./mod')` | `import x from './mod.mjs'` (ou `.js` si la cible est encore CJS) |
| `const { a, b } = require('pkg')` | `import { a, b } from 'pkg'` (paquet) ; pour un module **CJS** local, préférer `import mod from './mod.js'` puis `const { a, b } = mod` si le named ne sort pas |
| `module.exports = X` | `export default X` |
| `exports.foo = …` | `export const foo = …` / `export function foo …` |
| `require('./package.json')` | `import pkg from './package.json' with { type: 'json' }` |
| `__dirname` / `__filename` | `import.meta.dirname` / `import.meta.filename` (Node 22+) |
| `require('./dir')` (dossier) | `import x from './dir/index.mjs'` (ESM n'a pas de résolution de dossier/index) |
| `require('./mod')` (sans ext) | **toujours mettre l'extension** : `'./mod.js'` ou `'./mod.mjs'` |

### À NE PAS migrer

- **`migrations/`** : chargées par `db-migrate` qui les `require()` en CJS. Les laisser en `.js` CommonJS (db-migrate ne garantit pas le chargement ESM). Elles n'importent pas le reste du code applicatif.
- `bin/delete-user.mjs` : déjà en ESM.

### Détails `package.json` (à faire avec le Lot 1)

- `"main": "app.js"` → `"app.mjs"`
- `"start": "node app.js"` → `"node app.mjs"`
- `"prod": "... app.js"` → `"... app.mjs"`
- script de test : le glob `**/*.test.js` ignore les `.mjs`. Passer à
  `node --test "**/*.test.?(m)js"` (ou migrer chaque `.test.js` en `.test.mjs` au fil de l'eau et ajuster le glob). `c8` est agnostique.

## Les lots (ordre à respecter)

Chaque lot est livrable indépendamment (CI verte à la fin de chaque lot). Convertir chaque fichier `*.test.js` **en même temps** que le module qu'il teste (les tests sont des feuilles, importés par personne).

### Lot 1 — Point d'entrée et feuilles sans importateur
```
app.js  helpers/paginate.js  helpers/performance.js  policies/isAdmin.js  tests/harness.js
```
+ mises à jour `package.json` (main/start/prod) et glob de test ci-dessus.
`app.js` importe encore des fichiers CJS : utiliser `import x from './xxx.js'` avec extensions explicites (et `'./backup/index.js'`, `'./auth/index.js'` pour les dossiers).

### Lot 2 — Modules importés uniquement par le Lot 1
```
auth/index.js  backup/index.js  events.js  schema.js
```

### Lot 3
```
auth/humanid.js  auth/hypothesis.js  auth/local.js  auth/zotero.js
backup/json.js  backup/zip.js  loaders.js  resolvers/index.js
```

### Lot 4 — Resolvers
```
resolvers/articleResolver.js  resolvers/authResolver.js  resolvers/corpusResolver.js
resolvers/jsonScalar.js  resolvers/statsResolver.js  resolvers/tagResolver.js
resolvers/userResolver.js  resolvers/versionResolver.js  resolvers/workspaceResolver.js
```

### Lot 5 — Helpers et modèles (niveau intermédiaire)
```
helpers/bibliography.js  helpers/bibtex.js  helpers/diff.js  helpers/errors.js
helpers/metadata.js  helpers/token.js
models/article.js  models/corpus.js  models/workspace.js  policies/isUser.js
```

### Lot 6 — Feuilles très partagées
```
config.js  logger.js  helpers/preview.js  helpers/versions.js
models/tag.js  models/user.js  models/version.js
```

### Lot 7 — Dernière feuille
```
data/defaultsData.js
```

## Validation après chaque lot

```bash
cd graphql
npm run lint        # biome
npm test            # node --test + c8
node --check app.mjs   # (ou le fichier converti) : vérifie la syntaxe ESM
npm start           # démarrage réel : repère les MODULE_NOT_FOUND / mauvaises extensions
```

Points de vigilance au runtime (non détectés par le lint) :
- import relatif **sans extension** → `ERR_MODULE_NOT_FOUND` ;
- import de dossier (`./backup`) → idem, mettre `/index.mjs` ;
- named import qui ne « sort » pas d'un module CJS → basculer en `import default` + destructuration.

## Étape finale (optionnelle, cosmétique)

Une fois tous les lots faits, on peut basculer le paquet en ESM natif :
1. ajouter `"type": "module"` dans `graphql/package.json` ;
2. renommer les `*.mjs` → `*.js` ;
3. renommer en `*.cjs` ce qui doit rester CJS (les `migrations/`), et adapter leurs `require` croisés ;
4. ajuster `main`/`start`/`prod` et le glob de test en conséquence.

Sans intérêt fonctionnel — à ne faire que pour l'esthétique des extensions.