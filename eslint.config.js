import { createRequire } from "module";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { FlatCompat } = require("@eslint/eslintrc");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "dist/**",
      ".cache/**",
      "build/**",
    ],
  },

  // Extend Next.js configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom overrides
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "none",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        },
      ],

      // Next.js specific rules
      "@next/next/no-html-link-for-pages": "error",

      // Disable react-refresh rule (not applicable to Next.js)
      // Next.js has its own Fast Refresh implementation
      "react-refresh/only-export-components": "off",
    },
  },
];
