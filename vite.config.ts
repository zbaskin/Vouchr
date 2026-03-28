import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Instrument the utility modules that were introduced as part of these
      // three targeted bug fixes plus ticketService for context. UI components
      // require a full React render harness and are out of scope here.
      include: [
        'src/utils/**/*.ts',
        'src/ticketService.tsx',
      ],
      exclude: ['src/test/**'],
      thresholds: {
        // Enforce 80%+ on the pure utility modules only.
        // ticketService has many functions outside the scope of these three
        // fixes (fetchTickets, fetchUser, addTicket, etc.) that are tested
        // separately. Per-file thresholds let us target only the fixed code.
        'src/utils/timestamp.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/utils/ticketCount.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
