import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Automatically append ?react to SVG imports that use `ReactComponent as` (CRA-style),
// so component imports keep working without touching every file.
function svgrReactComponentImport() {
  return {
    name: 'svgr-react-component-import',
    enforce: 'pre',
    transform(code, id) {
      // Only run on JS/TS/JSX/TSX source files
      if (!/\.(t|j)sx?$/.test(id)) return null;
      if (!code.includes('ReactComponent as') || !code.includes('.svg')) return null;

      const transformed = code.replace(
        /from\s+['"]([^'"]+\.svg)['"]/g,
        (match, path) => (path.includes('?react') ? match : `from '${path}?react'`),
      );

      if (transformed === code) return null;
      return { code: transformed, map: null };
    },
  };
}

function reactAppEnvCompatibility(mode) {
  const loaded = loadEnv(mode, process.cwd(), '');

  return {
    name: 'react-app-env-compatibility',
    config() {
      // Expose REACT_APP_* via process.env.REACT_APP_* so we can avoid touching app code.
      const reactAppDefines = Object.fromEntries(
        Object.entries(loaded)
          .filter(([k]) => k.startsWith('REACT_APP_'))
          .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
      );

      // Provide process.env.NODE_ENV for any code that expects it.
      reactAppDefines['process.env.NODE_ENV'] = JSON.stringify(mode);

      return {
        define: reactAppDefines,
      };
    },
    transformIndexHtml: {
      // Run before Vite's built-in HTML processing to avoid decodeURI issues with "%PUBLIC_URL%" etc.
      order: 'pre',
      handler(html) {
        // Replace CRA placeholders in HTML without changing the template.
        // - %PUBLIC_URL% -> '' (root)
        // - %REACT_APP_FOO% -> value from env (or empty string)
        return html
          .replace(/%PUBLIC_URL%/g, '')
          .replace(/%REACT_APP_([A-Z0-9_]+)%/g, (_m, key) => {
            const fullKey = `REACT_APP_${key}`;
            return loaded?.[fullKey] ?? '';
          });
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Keep aliases identical to craco.config.js to avoid breaking imports
  const alias = {
    src: path.resolve(__dirname, 'src/'),
    app: path.resolve(__dirname, 'src/app'),
    assets: path.resolve(__dirname, 'src/assets'),
    helper: path.resolve(__dirname, 'src/helper'),
    utils: path.resolve(__dirname, 'src/utils'),
    salesPages: path.resolve(__dirname, 'src/app/sales/pages'),
    commonComponents: path.resolve(__dirname, 'src/app/components/common'),
    salesComponents: path.resolve(__dirname, 'src/app/components/salesComponents'),
    globalUtils: path.resolve(__dirname, 'src/utils'),
    services: path.resolve(__dirname, 'src/services'),
    assetsComponents: path.resolve(__dirname, 'src/assets'),
    routerComponent: path.resolve(__dirname, 'src/app/router'),
  };

  return {
    plugins: [
      reactAppEnvCompatibility(mode),
      svgrReactComponentImport(),
      svgr({
        // Match CRA behavior: `import { ReactComponent as Icon } from './icon.svg'`
        // Only transform SVGs explicitly imported as React components (via ?react).
        // This avoids breaking default SVG URL imports.
        include: '**/*.svg?react',
        svgrOptions: {
          exportType: 'named',
          namedExport: 'ReactComponent',
        },
      }),
      react(),
    ],
    resolve: { alias },
    // Provide a Node-style `global` for older libs like fbjs/draft-js that expect it in browser.
    define: {
      global: 'globalThis',
    },

    // CRA allows JSX in .js files; enable that globally to avoid renaming a large codebase.
    // Also allow modern syntax like top-level await by targeting a modern JS output.
    esbuild: {
      loader: 'jsx',
      jsx: 'automatic',
      target: 'esnext',
    },
    cacheDir: 'node_modules/.vite',

    server: {
      port: 3000,
      strictPort: true,
      // Helpful in bigger apps to avoid full reloads on large CSS / i18n change bursts
      watch: {
        ignored: ['**/coverage/**', '**/build/**'],
      },
    },

    preview: {
      port: 3000,
    },

    optimizeDeps: {
      // Speed up dev start by pre-bundling heavy, frequently-used deps
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        'dayjs',
        'date-fns',
        'react-toastify',
        '@mui/material',
        '@mui/icons-material',
      ],
      exclude: [
        // Keep MSW and test-only libs out of dev pre-bundle
        'msw',
      ],
    },

    // Keep CRA's output dir name so Azure SWA / pipelines don't need to change.
    build: {
      outDir: 'build',
      emptyOutDir: true,
      target: 'esnext',
      cssTarget: 'chrome90',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@mui/lab'],
            redux: ['react-redux', '@reduxjs/toolkit', 'redux-persist'],
          },
        },
      },
    },
  };
});

