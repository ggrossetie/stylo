# Guide de migration vers Atomic Design

## Vue d'ensemble

Cette migration réorganise les composants selon les principes d'Atomic Design pour améliorer la maintenabilité et la réutilisabilité du code.

## Nouvelle structure

```
src/
├── components/
│   ├── atoms/           # Composants de base réutilisables
│   ├── molecules/       # Combinaisons d'atoms
│   ├── organisms/       # Sections complexes par domaine
│   │   ├── Header/
│   │   ├── Forms/
│   │   ├── Modals/
│   │   ├── Tables/
│   │   ├── Editor/
│   │   └── Bibliography/
│   ├── templates/       # Layouts réutilisables
│   └── utils/          # Composants techniques
├── pages/              # Pages complètes
└── ...
```

## Migration progressive

### Phase 1 : Utiliser les nouveaux composants (✅ Fait)

```jsx
// ❌ Ancien
import Button from '../components/atoms/Button.jsx'
import ContactSearch from '../components/ContactSearch.jsx'

// ✅ Nouveau
import { Button } from '../components/atoms/index.js'
import { SearchBox } from '../components/molecules/index.js'
```

### Phase 2 : Migrer les imports

**Atoms disponibles :**
- Button, Checkbox, Field, Select, PageTitle, TimeAgo
- Input, Icon, Badge, Link (nouveaux)

**Molecules disponibles :**
- Alert, Avatar, Loading, Toggle, Version, FormActions, MonacoEditor
- SearchBox, UserCard, TagItem (nouveaux)

**Organisms disponibles :**
- Header, LoginForm, BaseModal

**Templates disponibles :**
- AppLayout, AuthLayout

### Phase 3 : Exemples de migration

#### Utilisation du nouveau SearchBox

```jsx
// ❌ Ancien ContactSearch
import ContactSearch from './ContactSearch.jsx'

<ContactSearch 
  onUserUpdated={handleUserUpdate}
  members={members}
/>

// ✅ Nouveau SearchBox + UserCard
import { SearchBox, UserCard } from '../components/index.js'

<SearchBox 
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Rechercher des utilisateurs"
/>
{filteredUsers.map(user => (
  <UserCard
    key={user._id}
    user={user}
    selectable
    onUserUpdated={handleUserUpdate}
  />
))}
```

#### Utilisation des nouveaux layouts

```jsx
// ❌ Structure manuelle
import Header from './Header.jsx'
import Footer from './Footer.jsx'

<div>
  <Header />
  <main>{children}</main>
  <Footer />
</div>

// ✅ Template AppLayout
import { AppLayout } from '../components/templates/index.js'

<AppLayout>
  {children}
</AppLayout>
```

#### Utilisation des nouvelles pages

```jsx
// ❌ Composant Login avec gestion complexe
import Login from './Login.jsx'

// ✅ Page LoginPage avec template
import { LoginPage } from '../pages/index.js'
```

## Règles de migration

### 1. Imports optimisés

```jsx
// ✅ Utiliser les barrel exports
import { Button, Input, Icon } from '../components/atoms/index.js'
import { SearchBox, UserCard } from '../components/molecules/index.js'
import { Header, LoginForm } from '../components/organisms/index.js'
import { AppLayout } from '../components/templates/index.js'

// ❌ Éviter les imports directs
import Button from '../components/atoms/Button/Button.jsx'
```

### 2. Props standardisées

```jsx
// ✅ Props cohérentes entre composants
<Button variant="primary" size="large" />
<Badge variant="success" size="small" />
<Alert variant="danger" />
```

### 3. Composition plutôt qu'héritage

```jsx
// ✅ Composer avec les atoms/molecules
<UserCard user={user}>
  <TagItem tag={tag} variant="badge" />
</UserCard>

// ✅ Utiliser les templates pour la structure
<AuthLayout title="Connexion">
  <LoginForm onSuccess={handleSuccess} />
</AuthLayout>
```

## Checklist de migration

### Pour chaque composant à migrer :

- [ ] Identifier le niveau Atomic Design approprié
- [ ] Vérifier s'il existe déjà un composant équivalent
- [ ] Migrer les props vers les nouveaux standards
- [ ] Utiliser les barrel exports
- [ ] Tester la compatibilité
- [ ] Mettre à jour la documentation

### Pour les nouveaux composants :

- [ ] Créer dans le bon dossier selon Atomic Design
- [ ] Utiliser les atoms/molecules existants
- [ ] Ajouter au barrel export approprié
- [ ] Suivre les conventions de nommage
- [ ] Ajouter les tests

## Avantages de la migration

1. **Réutilisabilité** : Composants atomiques utilisables partout
2. **Cohérence** : Design system unifié
3. **Maintenabilité** : Structure claire et prévisible
4. **Performance** : Meilleur tree-shaking
5. **DX** : Développement facilité
6. **Testing** : Composants plus petits, plus testables

## Prochaines étapes

1. Migrer progressivement les composants existants
2. Créer les organisms manquants (Tables, Editor, Bibliography)
3. Finaliser tous les templates
4. Supprimer les anciens composants
5. Mettre à jour tous les imports