import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { IconSprite } from '../components/index.ts';

/**
 * App-Shell: Handy-Container (max. 480 px), synchronisiert `--edo-app-h`
 * mit `visualViewport`, damit die fixe Aktionsleiste auch bei geöffneter Tastatur
 * sichtbar bleibt (Muster aus Prototyp v5.4).
 */
export function Shell() {
  useEffect(() => {
    const syncHeight = () => {
      const vv = window.visualViewport;
      const height = vv ? Math.round(vv.height) : window.innerHeight;
      if (height > 0) {
        document.documentElement.style.setProperty('--edo-app-h', `${height}px`);
      }
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);
    window.visualViewport?.addEventListener('resize', syncHeight);

    return () => {
      window.removeEventListener('resize', syncHeight);
      window.visualViewport?.removeEventListener('resize', syncHeight);
    };
  }, []);

  return (
    <main id="app" className="edo-app-shell">
      <IconSprite />
      <Outlet />
    </main>
  );
}
