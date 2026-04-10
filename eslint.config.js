import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
    { ignores: ['dist', 'amplify-codegen-temp', 'coverage', 'src/API.ts', 'src/graphql', 'src/ui-components', 'src/aws-exports.js'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
        ecmaVersion: 2020,
        globals: {
            window: 'readonly',
            document: 'readonly',
            navigator: 'readonly',
            console: 'readonly',
            setTimeout: 'readonly',
            clearTimeout: 'readonly',
            setInterval: 'readonly',
            clearInterval: 'readonly',
            fetch: 'readonly',
            URL: 'readonly',
            URLSearchParams: 'readonly',
            localStorage: 'readonly',
            sessionStorage: 'readonly',
            location: 'readonly',
            history: 'readonly',
            HTMLElement: 'readonly',
            HTMLInputElement: 'readonly',
            Event: 'readonly',
            CustomEvent: 'readonly',
        },
        },
        plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
        },
        rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        },
    },
    {
        files: ['src/test/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
)