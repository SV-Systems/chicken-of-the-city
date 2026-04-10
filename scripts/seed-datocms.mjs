import { buildClient } from '@datocms/cma-client-node';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const token = env.match(/DATOCMS_FULL_ACCESS_API_TOKEN=(.+)/)?.[1]?.trim();
const client = buildClient({ apiToken: token });

const types = await client.itemTypes.list();
const categoryType = types.find(t => t.api_key === 'category');
const productType = types.find(t => t.api_key === 'product');
const restaurantInfoType = types.find(t => t.api_key === 'restaurant_info');
const seoType = types.find(t => t.api_key === 'seo_setting');
const brandType = types.find(t => t.api_key === 'brand_setting');

console.log('Dodaję przykładowe dane...\n');

// --- Kategorie ---
const categories = [
  { name: 'Burgery', order: 1 },
  { name: 'Skrzydełka', order: 2 },
  { name: 'Dodatki', order: 3 },
  { name: 'Napoje', order: 4 },
];

const createdCategories = {};
for (const cat of categories) {
  const created = await client.items.create({
    item_type: { type: 'item_type', id: categoryType.id },
    name: cat.name,
    order: cat.order,
  });
  createdCategories[cat.name] = created.id;
  console.log(`Kategoria: ${cat.name}`);
}

// --- Produkty ---
const products = [
  { name: 'Classic Burger', description: 'Soczysta wołowina, sałata, pomidor, ogórek, sos własny.', price: 24.99, allergens: 'gluten, mleko, jaja', category: 'Burgery' },
  { name: 'Spicy Burger', description: 'Pikantna wołowina, jalapeño, sos sriracha, cheddar.', price: 27.99, allergens: 'gluten, mleko', category: 'Burgery' },
  { name: 'Cheese Burger', description: 'Podwójny ser cheddar, bekon, karmelizowana cebula.', price: 29.99, allergens: 'gluten, mleko', category: 'Burgery' },
  { name: 'Skrzydełka BBQ (6 szt.)', description: 'Chrupiące skrzydełka w sosie BBQ.', price: 22.99, allergens: 'gluten, soja', category: 'Skrzydełka' },
  { name: 'Skrzydełka Honey (6 szt.)', description: 'Skrzydełka glazurowane miodem i czosnkiem.', price: 23.99, allergens: 'gluten, soja', category: 'Skrzydełka' },
  { name: 'Frytki', description: 'Złociste frytki z solą morską.', price: 9.99, allergens: 'gluten', category: 'Dodatki' },
  { name: 'Onion Rings', description: 'Panierowane krążki cebulowe.', price: 11.99, allergens: 'gluten, mleko, jaja', category: 'Dodatki' },
  { name: 'Cola 0.5L', description: 'Coca-Cola zimna.', price: 7.99, allergens: '', category: 'Napoje' },
  { name: 'Lemoniada', description: 'Świeża lemoniada miętowa.', price: 9.99, allergens: '', category: 'Napoje' },
];

for (const prod of products) {
  await client.items.create({
    item_type: { type: 'item_type', id: productType.id },
    name: prod.name,
    description: prod.description,
    price: prod.price,
    allergens: prod.allergens,
    category: createdCategories[prod.category],
  });
  console.log(`Produkt: ${prod.name}`);
}

// --- Restaurant Info ---
await client.items.create({
  item_type: { type: 'item_type', id: restaurantInfoType.id },
  phone: '+48 123 456 789',
  address: 'ul. Kurczakowa 1, 00-001 Warszawa',
  email: 'kontakt@chickenofthecity.pl',
  opening_hours: 'Pn-Pt: 11:00-22:00\nSb-Nd: 12:00-23:00',
});
console.log('\nRestaurant Info OK');

// --- SEO Settings ---
await client.items.create({
  item_type: { type: 'item_type', id: seoType.id },
  meta_title: 'Chicken of the City – Najlepsze burgery i skrzydełka',
  meta_description: 'Zamów online najlepsze burgery, skrzydełka i dodatki. Szybka dostawa, płatność BLIK i kartą.',
});
console.log('SEO Settings OK');

// --- Brand Settings ---
const brandRecord = await client.items.create({
  item_type: { type: 'item_type', id: brandType.id },
  restaurant_name: 'Chicken',
  restaurant_tagline: 'of the City',
  hero_label: 'Zamów online',
  hero_title: 'Najlepszy kurczak',
  hero_highlight: 'w mieście.',
  hero_subtitle: 'Świeże składniki, wyjątkowe smaki. Zamów teraz i odbierz gotowe danie.',
  category_emoji: '🍗',
  brand_color: '#f97316',
});
await client.items.publish(brandRecord.id);
console.log('Brand Settings OK (opublikowany)');

console.log('\nWszystkie dane dodane pomyslnie!');
