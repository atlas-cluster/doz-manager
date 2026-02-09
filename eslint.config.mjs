import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      'no-relative-import-paths': noRelativeImportPaths,
      boundaries,
    },
    settings: {
      'boundaries/include': ['**/*'],
      'boundaries/elements': [
        {
          type: 'shared',
          pattern: 'features/shared',
          mode: 'folder',
        },
        {
          type: 'feature',
          pattern: 'features/*',
          mode: 'folder',
        },
      ],
    },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: true, rootDir: '.', prefix: '@' },
      ],
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              target: 'shared',
              allow: '**/*',
            },
            {
              target: 'feature',
              allow: 'index.ts',
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Custom ignores:
    'features/shared/components/ui/**',
  ]),
])

export default eslintConfig
