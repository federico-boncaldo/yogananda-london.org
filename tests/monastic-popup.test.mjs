import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const moduleUrl = new URL(
  '../resources/assets/scripts/components/monastic-popup.js',
  import.meta.url,
);
const modulePath = fileURLToPath(moduleUrl);

test('popup dismissal uses a content-versioned local storage key', async () => {
  assert.ok(existsSync(modulePath), 'monastic popup script should exist');

  const { rememberPopupDismissal, shouldOpenPopup, storageKeyFor } = await import(moduleUrl);
  const storage = createStorage();

  assert.equal(storageKeyFor('visit-2026'), 'yogananda:monastic-visit-popup:visit-2026');
  assert.equal(shouldOpenPopup({ version: 'visit-2026', storage }), true);

  rememberPopupDismissal({ version: 'visit-2026', storage });

  assert.equal(shouldOpenPopup({ version: 'visit-2026', storage }), false);
  assert.equal(shouldOpenPopup({ version: 'visit-2027', storage }), true);
});

test('popup can be dismissed once per day or browser session', async () => {
  assert.ok(existsSync(modulePath), 'monastic popup script should exist');

  const { rememberPopupDismissal, shouldOpenPopup, storageKeyFor } = await import(moduleUrl);
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const morning = new Date(2026, 6, 2, 9, 30);
  const evening = new Date(2026, 6, 2, 19, 0);
  const tomorrow = new Date(2026, 6, 3, 9, 30);

  assert.equal(
    storageKeyFor('visit-2026', { frequency: 'daily', now: morning }),
    'yogananda:monastic-visit-popup:visit-2026:daily:2026-07-02',
  );
  assert.equal(
    shouldOpenPopup({
      version: 'visit-2026',
      frequency: 'daily',
      storage: localStorage,
      now: morning,
    }),
    true,
  );

  rememberPopupDismissal({
    version: 'visit-2026',
    frequency: 'daily',
    storage: localStorage,
    now: morning,
  });

  assert.equal(
    shouldOpenPopup({
      version: 'visit-2026',
      frequency: 'daily',
      storage: localStorage,
      now: evening,
    }),
    false,
  );
  assert.equal(
    shouldOpenPopup({
      version: 'visit-2026',
      frequency: 'daily',
      storage: localStorage,
      now: tomorrow,
    }),
    true,
  );

  rememberPopupDismissal({
    version: 'visit-2026',
    frequency: 'session',
    storage: sessionStorage,
    now: morning,
  });

  assert.equal(
    shouldOpenPopup({
      version: 'visit-2026',
      frequency: 'session',
      storage: sessionStorage,
      now: evening,
    }),
    false,
  );
  assert.equal(
    shouldOpenPopup({
      version: 'visit-2026',
      frequency: 'session',
      storage: createStorage(),
      now: evening,
    }),
    true,
  );
});

test('popup opens if browser storage is unavailable', async () => {
  assert.ok(existsSync(modulePath), 'monastic popup script should exist');

  const { rememberPopupDismissal, shouldOpenPopup } = await import(moduleUrl);
  const storage = {
    getItem() {
      throw new Error('storage unavailable');
    },
    setItem() {
      throw new Error('storage unavailable');
    },
  };

  assert.equal(shouldOpenPopup({ version: 'visit-2026', storage }), true);
  assert.doesNotThrow(() => rememberPopupDismissal({ version: 'visit-2026', storage }));
});

function createStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}
