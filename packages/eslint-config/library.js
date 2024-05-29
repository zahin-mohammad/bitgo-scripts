const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "prettier", "eslint-config-turbo", "plugin:import/errors", "plugin:import/warnings"],
  plugins: ["only-warn", "import"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      packageDir: [
        './packages/**/',
      ],
    }],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
      node: {
        paths: ['node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
  ],
};
