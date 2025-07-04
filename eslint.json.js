{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "env": { 
    "node": true 
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/eslint-recommended",
    "@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2020
  },
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
    "@typescript-eslint/ban-ts-comment": "off",
    "no-prototype-builtins": "off",
    "@typescript-eslint/no-empty-function": "off"
  }
}