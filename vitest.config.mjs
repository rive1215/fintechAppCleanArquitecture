import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    // Las integraciones tocan la misma DB: evitar carreras entre archivos
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/use-cases/**/*.ts',
        'src/domain/**/*.ts',
        'src/infrastructure/repositories/**/*.ts',
      ],
      exclude: ['src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@use-cases': path.resolve(rootDir, 'src/use-cases'),
      '@infrastructure': path.resolve(rootDir, 'src/infrastructure'),
    },
  },
});
