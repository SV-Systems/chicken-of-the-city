const DATOCMS_API_URL = 'https://graphql.datocms.com';

async function fetchDatoCMS<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(DATOCMS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DATOCMS_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// --- Types ---
export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string;
  image: { url: string; alt: string } | null;
  category: { id: string; name: string };
}

export interface RestaurantInfo {
  phone: string;
  address: string;
  email: string;
  openingHours: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  favicon: { url: string } | null;
}

// --- Queries ---
export async function getAllCategories(): Promise<Category[]> {
  const data = await fetchDatoCMS<{ allCategories: Category[] }>(`
    query {
      allCategories(orderBy: order_ASC) {
        id
        name
        order
      }
    }
  `);
  return data.allCategories;
}

export async function getAllProducts(): Promise<Product[]> {
  const data = await fetchDatoCMS<{ allProducts: Product[] }>(`
    query {
      allProducts {
        id
        name
        description
        price
        allergens
        image { url alt }
        category { id name }
      }
    }
  `);
  return data.allProducts;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const data = await fetchDatoCMS<{ allProducts: Product[] }>(
    `
    query($categoryId: ItemId!) {
      allProducts(filter: { category: { eq: $categoryId } }) {
        id
        name
        description
        price
        allergens
        image { url alt }
        category { id name }
      }
    }
  `,
    { categoryId }
  );
  return data.allProducts;
}

export async function getRestaurantInfo(): Promise<RestaurantInfo> {
  const data = await fetchDatoCMS<{ restaurantInfo: RestaurantInfo }>(`
    query {
      restaurantInfo {
        phone
        address
        email
        openingHours
      }
    }
  `);
  return data.restaurantInfo;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const data = await fetchDatoCMS<{ seoSetting: SeoSettings }>(`
    query {
      seoSetting {
        metaTitle
        metaDescription
        favicon { url }
      }
    }
  `);
  return data.seoSetting;
}
