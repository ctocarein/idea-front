import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Isolation des features (ARCHITECTURE_FRONTEND.md §4.1, §5) :
    // un feature/shared s'importe par son barrel, jamais par ses internes.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message:
                "Importe un feature par son barrel : @/features/<nom> (pas ses internes).",
            },
            {
              group: ["@/shared/ui/*"],
              message:
                "Importe le design system par son barrel : @/shared/ui (pas ses internes).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
