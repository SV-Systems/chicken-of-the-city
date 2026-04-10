/**
 * One-time migration script — adds the brand_setting model to an existing DatoCMS project.
 * Run once: node scripts/add-brand-settings.mjs
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
  // Check if model already exists
  const allTypes = await client.itemTypes.list();
  if (allTypes.find(t => t.api_key === 'brand_setting')) {
    console.log('Model brand_setting już istnieje — pomijam tworzenie.');
    console.log('Sprawdź czy rekord jest już wypełniony w DatoCMS Dashboard.');
    process.exit(0);
  }

  console.log('Tworzę model: Brand Settings...');

  const model = await client.itemTypes.create({
    name: 'Brand Settings',
    api_key: 'brand_setting',
    singleton: true,
    all_locales_required: true,
    draft_mode_active: false,
  });

  const fields = [
    { label: 'Restaurant Name',    api_key: 'restaurant_name',    field_type: 'string', hint: 'Główna część nazwy (np. "Chicken")' },
    { label: 'Restaurant Tagline', api_key: 'restaurant_tagline', field_type: 'string', hint: 'Podtytuł nazwy (np. "of the City"). Pozostaw puste jeśli brak.' },
    { label: 'Hero Label',         api_key: 'hero_label',         field_type: 'string', hint: 'Mały tekst nad tytułem hero (np. "Zamów online")' },
    { label: 'Hero Title',         api_key: 'hero_title',         field_type: 'string', hint: 'Pierwsza linia tytułu hero (np. "Najlepszy kurczak")' },
    { label: 'Hero Highlight',     api_key: 'hero_highlight',     field_type: 'string', hint: 'Druga linia tytułu hero — wyświetlana w kolorze marki (np. "w mieście.")' },
    { label: 'Hero Subtitle',      api_key: 'hero_subtitle',      field_type: 'text',   hint: 'Opis pod tytułem hero' },
    { label: 'Category Emoji',     api_key: 'category_emoji',     field_type: 'string', hint: 'Emoji pokazywane przy kategoriach i produktach bez zdjęcia (np. 🍗)' },
    { label: 'Brand Color',        api_key: 'brand_color',        field_type: 'string', hint: 'Główny kolor marki w formacie hex (np. #f97316)' },
  ];

  for (const f of fields) {
    await client.fields.create(model.id, {
      label: f.label,
      field_type: f.field_type,
      api_key: f.api_key,
      validators: f.field_type === 'string' && !['restaurant_tagline'].includes(f.api_key)
        ? { required: {} }
        : {},
      hint: f.hint,
      appearance: {
        editor: f.field_type === 'text' ? 'textarea' : 'single_line',
        parameters: f.field_type === 'string' ? { heading: false } : {},
        addons: [],
      },
    });
    console.log(`  Pole: ${f.label} OK`);
  }

  console.log('\nModel Brand Settings utworzony. Wypełniam domyślne dane...');

  const record = await client.items.create({
    item_type: { type: 'item_type', id: model.id },
    restaurant_name: 'Chicken',
    restaurant_tagline: 'of the City',
    hero_label: 'Zamów online',
    hero_title: 'Najlepszy kurczak',
    hero_highlight: 'w mieście.',
    hero_subtitle: 'Świeże składniki, wyjątkowe smaki. Zamów teraz i odbierz gotowe danie.',
    category_emoji: '🍗',
    brand_color: '#f97316',
  });

  await client.items.publish(record.id);

  console.log('Brand Settings OK (opublikowany)\n');
  console.log('Gotowe! Możesz edytować ustawienia w DatoCMS Dashboard > Brand Settings.');
}

run().catch((err) => {
  console.error('Błąd:', err.message);
  process.exit(1);
});
