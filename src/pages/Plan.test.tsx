import { afterEach, describe, expect, it } from '@rstest/core';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from '../app/App.tsx';
import {
  PLAN_EXPORT_KIND,
  addDaysIso,
  asRecipeId,
  todayIso,
} from '../domain/index.ts';
import { createMemoryStorage } from '../storage/index.ts';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
  document.documentElement.removeAttribute('data-eff');
  document.documentElement.removeAttribute('data-pref');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('Paket E10: Essensplan-Screen, PlanSheet & Datenschutz-Export/Import (Issue #35)', () => {
  it('startet leer (5 Tage), schaltet 3–7 Tage um, plant über + Rezept, tauscht und entfernt Einträge', async () => {
    const storage = createMemoryStorage();
    const today = todayIso();
    window.location.hash = '#/plan';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    expect(
      await screen.findByRole('heading', { name: 'Plan' }),
    ).toBeInTheDocument();

    // Standard: 5 Tage, keine Demo-Einträge, noch kein E11-Button «Einkaufsliste erstellen»
    const list = screen.getByTestId('plan-list');
    expect(within(list).getAllByTestId(/^plan-day-\d{4}-\d{2}-\d{2}$/)).toHaveLength(5);
    expect(screen.queryByText('Einkaufsliste erstellen')).toBeNull();
    expect(screen.getByTestId('plan-days-5')).toHaveAttribute('aria-pressed', 'true');

    // Zeitraum auf 3 Tage und 7 Tage umschalten
    fireEvent.click(screen.getByTestId('plan-days-3'));
    await waitFor(() => {
      expect(within(list).getAllByTestId(/^plan-day-\d{4}-\d{2}-\d{2}$/)).toHaveLength(3);
    });
    expect((await storage.plan.get()).days).toBe(3);

    fireEvent.click(screen.getByTestId('plan-days-7'));
    await waitFor(() => {
      expect(within(list).getAllByTestId(/^plan-day-\d{4}-\d{2}-\d{2}$/)).toHaveLength(7);
    });

    // Über «+ Rezept» in Abendessen heute ein Rezept wählen
    fireEvent.click(screen.getByTestId(`plan-add-${today}-dinner`));
    expect(screen.getByTestId('plan-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('plan-pick-oven_salmon')).toBeInTheDocument();

    // Escape schliesst das Sheet ohne Änderung
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('plan-sheet')).toBeNull();

    // Erneut öffnen, Ofen-Lachs wählen, Portionen auf 3 erhöhen und übernehmen
    fireEvent.click(screen.getByTestId(`plan-add-${today}-dinner`));
    fireEvent.click(screen.getByTestId('plan-pick-oven_salmon'));
    expect(screen.getByTestId('plan-form')).toBeInTheDocument();
    expect(screen.getByTestId('plan-portions-output')).toHaveTextContent('2');
    fireEvent.click(screen.getByTestId('plan-portions-inc'));
    expect(screen.getByTestId('plan-portions-output')).toHaveTextContent('3');
    fireEvent.click(screen.getByTestId('plan-sheet-confirm'));

    await waitFor(async () => {
      expect((await storage.plan.get()).items).toHaveLength(1);
    });

    const savedItem = (await storage.plan.get()).items[0]!;
    expect(savedItem.recipeId).toBe(asRecipeId('oven_salmon'));
    expect(savedItem.portions).toBe(3);

    // Eintrag und Tagestotal erscheinen; Abendessen zeigt keinen zweiten «+ Rezept»-Knopf
    expect(screen.getByTestId(`plan-item-${savedItem.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`plan-day-total-${today}`)).toHaveTextContent('kcal');
    expect(screen.queryByTestId(`plan-add-${today}-dinner`)).toBeNull();

    // Zwei Snacks am selben Tag sind erlaubt («+ Rezept» bleibt sichtbar)
    fireEvent.click(screen.getByTestId(`plan-add-${today}-snack`));
    fireEvent.click(screen.getByTestId('plan-pick-birchermuesli'));
    fireEvent.click(screen.getByTestId('plan-sheet-confirm'));
    await waitFor(async () => {
      expect((await storage.plan.get()).items).toHaveLength(2);
    });
    expect(screen.getByTestId(`plan-add-${today}-snack`)).toBeInTheDocument();

    // Tauschen des Abendessens auf Dal mit roten Linsen (gleiche ID wird aktualisiert)
    fireEvent.click(screen.getByTestId(`plan-swap-${savedItem.id}`));
    fireEvent.click(screen.getByTestId('plan-pick-lentil_curry'));
    fireEvent.click(screen.getByTestId('plan-sheet-confirm'));
    await waitFor(async () => {
      const updated = (await storage.plan.get()).items.find(
        (it) => it.id === savedItem.id,
      );
      expect(updated?.recipeId).toBe(asRecipeId('lentil_curry'));
    });

    // Entfernen des Abendessens -> «+ Rezept» erscheint wieder
    fireEvent.click(screen.getByTestId(`plan-remove-${savedItem.id}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`plan-item-${savedItem.id}`)).toBeNull();
      expect(screen.getByTestId(`plan-add-${today}-dinner`)).toBeInTheDocument();
    });
  });

  it('übernimmt aus der Rezept-Detailseite in den Plan und öffnet das Rezept per Titelklick wieder', async () => {
    const storage = createMemoryStorage();
    const today = todayIso();
    const tomorrow = addDaysIso(today, 1);
    window.location.hash = '#/rezept/oven_salmon';

    render(<App navigatorLanguages={['de-CH']} storage={storage} />);

    const addBtn = await screen.findByTestId('add-to-plan-btn');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('plan-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('plan-slot-opt-dinner')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Auf Morgen und 4 Portionen stellen
    fireEvent.click(screen.getByTestId(`plan-day-opt-${tomorrow}`));
    fireEvent.click(screen.getByTestId('plan-portions-inc'));
    fireEvent.click(screen.getByTestId('plan-portions-inc'));
    expect(screen.getByTestId('plan-portions-output')).toHaveTextContent('4');

    fireEvent.click(screen.getByTestId('plan-sheet-confirm'));

    // Navigiert zu #/plan und zeigt Toast + Eintrag
    expect(
      await screen.findByRole('heading', { name: 'Plan' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Zum Plan hinzugefügt',
    );

    const saved = (await storage.plan.get()).items[0]!;
    expect(saved.date).toBe(tomorrow);
    expect(saved.slot).toBe('dinner');
    expect(saved.portions).toBe(4);

    // Klick auf Titel öffnet das Rezept wieder
    fireEvent.click(screen.getByTestId(`plan-open-${saved.id}`));
    expect(
      await screen.findByRole('heading', { level: 1, name: /Ofenlachs/ }),
    ).toBeInTheDocument();
  });

  it('Datenschutz-Seite: Export ohne Körperdaten, Import-Vorschau mit Abbrechen, Ungültig-Ablehnung, Übernahme & F1b-Fehlerbehandlung', async () => {
    const storage = createMemoryStorage();
    const today = todayIso();
    await storage.plan.set({
      days: 4,
      items: [
        {
          id: 'pinit01',
          date: today,
          slot: 'breakfast',
          recipeId: asRecipeId('birchermuesli'),
          portions: 2,
        },
      ],
    });

    // Blob-URL-Helfer in jsdom stubben
    let exportedBlob: Blob | null = null;
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      if (blob instanceof Blob) {
        exportedBlob = blob;
      }
      return 'blob:edovita-test';
    };
    URL.revokeObjectURL = () => {};

    try {
      window.location.hash = '#/profil';
      render(<App navigatorLanguages={['de-CH']} storage={storage} />);

      fireEvent.click(await screen.findByTestId('profil-datenschutz-btn'));
      expect(
        await screen.findByRole('heading', { name: 'Datenschutz' }),
      ).toBeInTheDocument();

      // Export auslösen
      fireEvent.click(screen.getByTestId('data-export-btn'));
      expect(await screen.findByTestId('toast')).toHaveTextContent(
        'Datei gespeichert',
      );
      expect(exportedBlob).not.toBeNull();
      const exportedText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsText(exportedBlob!);
      });
      const exportedJson = JSON.parse(exportedText) as Record<string, unknown>;
      expect(exportedJson.v).toBe(1);
      expect(exportedJson.kind).toBe(PLAN_EXPORT_KIND);
      expect('settings' in exportedJson).toBe(false);
      expect('profile' in exportedJson).toBe(false);

      // Ungültige Datei -> Fehler-Toast, Bestand bleibt unverändert
      const fileInput = screen.getByTestId('data-import-file') as HTMLInputElement;
      const badFile = new File(['{ungültig'], 'bad.json', {
        type: 'application/json',
      });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent(
          'Datei ungültig, nichts geändert',
        );
      });
      expect((await storage.plan.get()).days).toBe(4);

      // Gültige Datei -> Bestätigungs-Sheet mit Vorschau -> Abbrechen ändert nichts
      const validPayload = JSON.stringify({
        v: 1,
        kind: PLAN_EXPORT_KIND,
        plan: {
          days: 6,
          items: [
            {
              id: 'pimp001',
              date: today,
              slot: 'dinner',
              recipeId: 'oven_salmon',
              portions: 3,
            },
          ],
        },
        shopItems: [],
        shopStatus: {},
      });
      const validFile = new File([validPayload], 'edovita-plan-einkauf.json', {
        type: 'application/json',
      });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(await screen.findByTestId('data-import-sheet')).toBeInTheDocument();
      expect(screen.getByTestId('data-import-preview-plan')).toHaveTextContent(
        'Plan: 1 Einträge, 6 Tage',
      );
      fireEvent.click(screen.getByTestId('data-import-cancel'));
      expect(screen.queryByTestId('data-import-sheet')).toBeNull();
      expect((await storage.plan.get()).days).toBe(4);

      // Erneut laden -> Übernehmen speichert den neuen Plan
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      expect(await screen.findByTestId('data-import-sheet')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('data-import-apply'));

      await waitFor(async () => {
        const nextPlan = await storage.plan.get();
        expect(nextPlan.days).toBe(6);
        expect(nextPlan.items).toHaveLength(1);
        expect(nextPlan.items[0]?.recipeId).toBe(asRecipeId('oven_salmon'));
      });
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent(
          'Daten übernommen',
        );
      });
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });
});
