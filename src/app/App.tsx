import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './router.tsx';
import { ThemeProvider } from './ThemeProvider.tsx';

/**
 * Wurzelkomponente der Edovita-App.
 * Provider bleiben strikt nach Bereich getrennt (ADR-001 Regel 6).
 */
export function App() {
  const router = useMemo(() => createAppRouter(), []);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
