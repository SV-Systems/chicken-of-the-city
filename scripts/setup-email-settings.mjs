import { buildClient } from '@datocms/cma-client-node';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const token = env.match(/DATOCMS_FULL_ACCESS_API_TOKEN=(.+)/)?.[1]?.trim();

if (!token) {
  console.error('Brak DATOCMS_FULL_ACCESS_API_TOKEN w .env.local');
  process.exit(1);
}

const client = buildClient({ apiToken: token });

async function setup() {
  console.log('Sprawdzam czy model email_setting już istnieje...');
  const allTypes = await client.itemTypes.list();
  const existing = allTypes.find(t => t.api_key === 'email_setting');

  if (existing) {
    console.log('Model email_setting już istnieje — pomijam tworzenie.');
    return;
  }

  console.log('Tworzę singleton model: Email Settings');
  const model = await client.itemTypes.create({
    name: 'Email Settings',
    api_key: 'email_setting',
    singleton: true,
    all_locales_required: true,
    draft_mode_active: false,
  });

  const fields = [
    {
      label: 'Owner Subject',
      api_key: 'owner_subject',
      field_type: 'string',
      hint: 'Temat maila do właściciela. Dostępne zmienne: {amount}, {name}, {orderId}',
      default: 'Nowe zamówienie — {amount} PLN',
    },
    {
      label: 'Owner Body',
      api_key: 'owner_body',
      field_type: 'text',
      hint: 'Treść maila do właściciela. Zmienne: {name}, {email}, {amount}, {orderId}, {items}, {notes}',
      default: `Nowe zamówienie od: {name} <{email}>
Kwota: {amount} PLN
Nr zamówienia: {orderId}

Pozycje:
{items}

Uwagi do pozycji:
{notes}`,
    },
    {
      label: 'Customer Subject',
      api_key: 'customer_subject',
      field_type: 'string',
      hint: 'Temat maila do klienta. Zmienne: {amount}, {name}, {orderId}',
      default: 'Dziękujemy za zamówienie! — {amount} PLN',
    },
    {
      label: 'Customer Body',
      api_key: 'customer_body',
      field_type: 'text',
      hint: 'Treść maila do klienta. Zmienne: {name}, {amount}, {orderId}, {items}',
      default: `Cześć {name},

Dziękujemy za zamówienie! Przyjęliśmy je i wkrótce się nim zajmiemy.

Podsumowanie:
{items}

Łączna kwota: {amount} PLN
Nr zamówienia: {orderId}

Do zobaczenia!`,
    },
  ];

  for (const f of fields) {
    const { default: _default, hint, ...fieldDef } = f;
    await client.fields.create(model.id, {
      ...fieldDef,
      validators: { required: {} },
      appearance: {
        editor: f.field_type === 'text' ? 'textarea' : 'single_line',
        parameters: f.field_type === 'string' ? { heading: false } : {},
        addons: [],
      },
      ...(hint && { hint }),
    });
    console.log(`  Pole "${f.label}" OK`);
  }

  console.log('\nModel Email Settings gotowy!');
  console.log('Przejdź do DatoCMS > Content > Email Settings i uzupełnij treści maili.');
}

setup().catch(err => {
  console.error(err);
  process.exit(1);
});
