export function registerReadOnlyTheme(monaco) {
  monaco.editor.defineTheme('styloReadOnly', {
    base: 'vs',
    inherit: true,
    rules: [{ background: 'EDF9FA' }],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#fafafa',
      'editor.lineHighlightBackground': '#fafafa',
      'editorLineNumber.foreground': '#7d7d7d',
      'editor.selectionHighlightBackground': '#fafafa',
      'editorLineNumber.activeForeground': '#7d7d7d',
    },
  })
}

export class BibliographyCompletionProvider {
  constructor(bibTeXEntries) {
    this.monaco = undefined
    this._bibTeXEntries = bibTeXEntries
  }

  get bibTeXEntries() {
    return this._bibTeXEntries
  }

  set bibTeXEntries(value) {
    this._bibTeXEntries = value
  }

  register(monaco) {
    const self = this
    return monaco.languages.registerCompletionItemProvider('markdown', {
      triggerCharacters: '@',
      provideCompletionItems: function (model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: 1,
          endColumn: position.column,
        })
        const match = textUntilPosition.match(
          /(?:^|\W)(?<square_bracket>\[?)@[^{},~#%\s\\]*$/
        )
        if (!match) {
          return { suggestions: [] }
        }
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        const endCharacter = model.getValueInRange({
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column + 1,
        })
        const startsWithSquareBracket = match.groups.square_bracket === '['
        return {
          suggestions: self.createBibliographyProposals(
            range,
            { startsWithSquareBracket, endCharacter },
            monaco
          ),
        }
      },
    })
  }

  createBibliographyProposals(range, ctx, monaco) {
    const { startsWithSquareBracket, endCharacter } = ctx
    return this._bibTeXEntries.map((entry) => ({
      label: entry.key,
      kind: monaco.languages.CompletionItemKind.Reference,
      documentation: entry.title,
      insertText:
        startsWithSquareBracket && endCharacter !== ']'
          ? `${entry.key}] `
          : `${entry.key} `,
      range: range,
    }))
  }
}

export function defineFlippedDiffTheme(monaco) {
  monaco.editor.defineTheme('flippedDiffTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'diffEditor.insertedTextBackground': '#ff000033',
      'diffEditor.removedTextBackground': '#28d22833',
    },
  })
  monaco.editor.setTheme('flippedDiffTheme')
}
