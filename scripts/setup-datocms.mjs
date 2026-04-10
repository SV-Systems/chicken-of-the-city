import { buildClient } from '@datocms/cma-client-node';
import { readFileSync } from 'fs';

// Load .env.local manually
const env = readFileSync('.env.local', 'utf-8');
const token = env.match(/DATOCMS_FULL_ACCESS_API_TOKEN=(.+)/)?.[1]?.trim();

if (!token) {
  console.error('Brak DATOCMS_FULL_ACCESS_API_TOKEN w .env.local');
  process.exit(1);
}

const client = buildClient({ apiToken: token });

async function setup() {
  console.log('Tworzenie modeli DatoCMS...\n');

  // --- MODEL: Category ---
  console.log('Pobieram istniejący model: Category');
  const allTypes = await client.itemTypes.list();
  const category = allTypes.find(t => t.api_key === 'category');
  console.log('Category OK\n');

  // --- MODEL: Product ---
  console.log('Tworzę model: Product');
  const product = await client.itemTypes.create({
    name: 'Product',
    api_key: 'product',
    singleton: false,
    all_locales_required: true,
    draft_mode_active: false,
  });

  await client.fields.create(product.id, {
    label: 'Name',
    field_type: 'string',
    api_key: 'name',
    validators: { required: {} },
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  await client.fields.create(product.id, {
    label: 'Description',
    field_type: 'text',
    api_key: 'description',
    validators: {},
    appearance: { editor: 'textarea', parameters: {}, addons: [] },
  });

  await client.fields.create(product.id, {
    label: 'Price',
    field_type: 'float',
    api_key: 'price',
    validators: { required: {} },
    appearance: { editor: 'float', parameters: {}, addons: [] },
  });

  await client.fields.create(product.id, {
    label: 'Image',
    field_type: 'file',
    api_key: 'image',
    validators: { required: {}, extension: { extensions: [], predefined_list: 'image' } },
    appearance: { editor: 'file', parameters: {}, addons: [] },
  });

  await client.fields.create(product.id, {
    label: 'Category',
    field_type: 'link',
    api_key: 'category',
    validators: { required: {}, item_item_type: { item_types: [category.id] } },
    appearance: { editor: 'link_select', parameters: {}, addons: [] },
  });

  await client.fields.create(product.id, {
    label: 'Allergens',
    field_type: 'string',
    api_key: 'allergens',
    validators: {},
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  console.log('Product OK\n');

  // --- MODEL: Restaurant Info (singleton) ---
  console.log('Tworzę model: Restaurant Info');
  const restaurantInfo = await client.itemTypes.create({
    name: 'Restaurant Info',
    api_key: 'restaurant_info',
    singleton: true,
    all_locales_required: true,
    draft_mode_active: false,
  });

  await client.fields.create(restaurantInfo.id, {
    label: 'Phone',
    field_type: 'string',
    api_key: 'phone',
    validators: {},
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  await client.fields.create(restaurantInfo.id, {
    label: 'Address',
    field_type: 'string',
    api_key: 'address',
    validators: {},
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  await client.fields.create(restaurantInfo.id, {
    label: 'Email',
    field_type: 'string',
    api_key: 'email',
    validators: {},
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  await client.fields.create(restaurantInfo.id, {
    label: 'Opening Hours',
    field_type: 'text',
    api_key: 'opening_hours',
    validators: {},
    appearance: { editor: 'textarea', parameters: {}, addons: [] },
  });

  console.log('Restaurant Info OK\n');

  // --- MODEL: SEO Settings (singleton) ---
  console.log('Tworzę model: SEO Settings');
  const seoSettings = await client.itemTypes.create({
    name: 'SEO Settings',
    api_key: 'seo_setting',
    singleton: true,
    all_locales_required: true,
    draft_mode_active: false,
  });

  await client.fields.create(seoSettings.id, {
    label: 'Meta Title',
    field_type: 'string',
    api_key: 'meta_title',
    validators: {},
    appearance: { editor: 'single_line', parameters: { heading: false }, addons: [] },
  });

  await client.fields.create(seoSettings.id, {
    label: 'Meta Description',
    field_type: 'text',
    api_key: 'meta_description',
    validators: {},
    appearance: { editor: 'textarea', parameters: {}, addons: [] },
  });

  await client.fields.create(seoSettings.id, {
    label: 'Favicon',
    field_type: 'file',
    api_key: 'favicon',
    validators: {},
    appearance: { editor: 'file', parameters: {}, addons: [] },
  });

  console.log('SEO Settings OK\n');

  console.log('Wszystkie modele utworzone pomyslnie!');
}

setup().catch((err) => {
  console.error('Blad:', err.message);
  process.exit(1);
});
