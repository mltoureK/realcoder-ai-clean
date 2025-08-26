export const languageConfig = {
  javascript: {
    extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte'],
    concepts: ['closures', 'async/await', 'event loop', 'prototypes', 'modules', 'hoisting', 'destructuring'],
    keywords: ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'await', 'async'],
    frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
    questionTypes: ['mcq', 'fill-blank-drag', 'fill-blank-manual', 'reorder', 'match', 'debug', 'predict-output']
  },
  python: {
    extensions: ['.py', '.pyw', '.pyx', '.pyi', '.ipynb'],
    concepts: ['decorators', 'generators', 'context managers', 'metaclasses', 'list comprehensions'],
    keywords: ['def', 'class', 'import', 'from', 'as', 'with', 'yield', 'lambda'],
    frameworks: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
    questionTypes: ['mcq', 'fill-blank-drag', 'fill-blank-manual', 'reorder', 'match', 'debug']
  },
  java: {
    extensions: ['.java', '.kt', '.groovy'],
    concepts: ['inheritance', 'polymorphism', 'encapsulation', 'interfaces', 'generics'],
    keywords: ['public', 'private', 'protected', 'static', 'final', 'interface', 'class'],
    frameworks: ['Spring', 'Hibernate', 'Maven', 'Gradle'],
    questionTypes: ['mcq', 'fill-blank-drag', 'fill-blank-manual', 'reorder', 'match', 'debug']
  },
  cpp: {
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h', '.hxx', '.c'],
    concepts: ['pointers', 'references', 'templates', 'memory management', 'operator overloading'],
    keywords: ['class', 'struct', 'template', 'namespace', 'virtual', 'const'],
    frameworks: ['STL', 'Boost', 'Qt', 'OpenGL'],
    questionTypes: ['mcq', 'fill-blank-drag', 'fill-blank-manual', 'reorder', 'match', 'debug']
  },
  csharp: {
    extensions: ['.cs', '.csx', '.razor'],
    concepts: ['LINQ', 'delegates', 'events', 'properties', 'async/await'],
    keywords: ['public', 'private', 'protected', 'static', 'readonly', 'var', 'async'],
    frameworks: ['.NET', 'ASP.NET', 'Entity Framework', 'Xamarin'],
    questionTypes: ['mcq', 'fill-blank-drag', 'fill-blank-manual', 'reorder', 'match', 'debug']
  }
};

export const getLanguageConfig = (language) => {
  return languageConfig[language.toLowerCase()] || languageConfig.javascript;
};

export const getFileExtensions = (language) => {
  const config = getLanguageConfig(language);
  return config.extensions;
};
