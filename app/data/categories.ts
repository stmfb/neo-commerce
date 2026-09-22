export interface Category {
  slug: string;
  name: string;
  tileColor: string;
  barColor: string;
}

export const categories: Category[] = [
  { slug: "phones-tablets", name: "Phones & Tablets", tileColor: "bg-primary-dark", barColor: "bg-butter-500" },
  { slug: "generators-power", name: "Generators & Power", tileColor: "bg-blue-700", barColor: "bg-primary-100" },
  { slug: "home-kitchen", name: "Home & Kitchen", tileColor: "bg-primary-400", barColor: "bg-primary-100" },
  { slug: "electronics", name: "Electronics", tileColor: "bg-blue-600", barColor: "bg-primary-100" },
  { slug: "health-beauty", name: "Health & Beauty", tileColor: "bg-red-700", barColor: "bg-primary-100" },
  { slug: "groceries", name: "Groceries", tileColor: "bg-green-600", barColor: "bg-primary-100" },
  { slug: "fashion", name: "Fashion", tileColor: "bg-orange-500", barColor: "bg-primary-100" },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
