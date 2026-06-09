import test from 'node:test';
import assert from 'node:assert/strict';

import { getLegacySafeDevisFieldDefaults } from '../src/libs/devisInsertPayload.mjs';

test('getLegacySafeDevisFieldDefaults provides legacy-safe defaults when contact fields are blank', () => {
  assert.deepEqual(
    getLegacySafeDevisFieldDefaults({
      typeLogement: '',
      heurePreferee: ''
    }),
    {
      type_logement: 'appartement',
      heure_preferee: 'matin'
    }
  );
});

test('getLegacySafeDevisFieldDefaults preserves explicit non-empty values', () => {
  assert.deepEqual(
    getLegacySafeDevisFieldDefaults({
      typeLogement: 'villa',
      heurePreferee: 'soir'
    }),
    {
      type_logement: 'villa',
      heure_preferee: 'soir'
    }
  );
});
