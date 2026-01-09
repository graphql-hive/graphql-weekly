// Typescript custom
typescript.displayName = 'typescript'
typescript.aliases = ['ts']
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prism language registration requires any
function typescript(Prism: any) {
  Prism.languages.typescript = Prism.languages.extend('javascript', {
    // From JavaScript Prism keyword list and TypeScript language spec: https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
    builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console)\b/,
    keyword:
      /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield|module|declare|constructor|namespace|abstract|require|type)\b/,
    typedef: /\b(?:Comment|User|Post|Author|List|Array)\b/,
  })
  Prism.languages.ts = Prism.languages.typescript
}

// eslint-disable-next-line import/no-default-export -- Prism language registration format
export default typescript
