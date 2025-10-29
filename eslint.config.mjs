// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript'; // optional if you don't use TS
import prettier from 'eslint-plugin-prettier'; // optional

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  },
  // keep Next's default ignores (and add your own if needed)
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
