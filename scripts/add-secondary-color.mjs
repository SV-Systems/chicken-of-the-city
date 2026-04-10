/**
 * Adds secondary_color field to the existing brand_setting model in DatoCMS.
 * Run once: node scripts/add-secondary-color.mjs
 */
import { buildClient } from '@datocms/cma-client-node';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const token = env.match(/DATOCMS_FULL_ACCESS_API_TOKEN=(.+)/)?.[1]?.trim();

if (!token) {
  console.error('Brak DATOCMS_FULL_ACCESS_API_TOKEN w .env.local');
  process.exit(1);
}

const client = buildClient({ apiToken: token });

async function run() {
  const allTypes = await client.itemTypes.list();
  const model = allTypes.find(t => t.api_key === 'brand_setting');

  if (!model) {
    console.error('Model brand_setting nie istnieje. Najpierw uruchom add-brand-settings.mjs');
    process.exit(1);
  }

  // Check if field already exists
  const fields = await client.fields.list(model.id);
  if (fields.find(f => f.api_key === 'secondary_color')) {
    console.log('Pole secondary_color już istnieje — pomijam.');
  } else {
    await client.fields.create(model.id, {
      label: 'Secondary Color',
      field_type: 'string',
      api_key: 'secondary_color',
      validators: {},
      hint: 'Drugi kolor marki w formacie hex (np. #3b82f6). Używany do tła sekcji, akcentów i gradientów.',
      appearance: {
        editor: 'single_line',
        parameters: { heading: false },
        addons: [],
      },
    });
    console.log('Pole secondary_color dodane do modelu Brand Settings.');
  }

  // Update existing record with default value
  const items = await client.items.list({ filter: { type: 'brand_setting' } });
  if (items.length > 0) {
    const record = items[0];
    if (!record.secondary_color) {
      await client.items.update(record.id, { secondary_color: '#1d4ed8' });
      await client.items.publish(record.id);
      console.log('Rekord zaktualizowany — secondary_color: #1d4ed8');
    } else {
      console.log(`Rekord już ma secondary_color: ${record.secondary_color}`);
    }
  }

  console.log('\nGotowe! Możesz zmienić Secondary Color w DatoCMS Dashboard > Brand Settings.');
}

run().catch((err) => {
  console.error('Błąd:', err.message);
  process.exit(1);
});
