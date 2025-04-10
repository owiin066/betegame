module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Désactiver les règles qui causent des problèmes
    'no-unused-vars': 'off',
    'vue/no-unused-components': 'off',
    // Désactiver la règle qui cause l'erreur actuelle
    'vue/multi-word-component-names': 'off'
  }
}
