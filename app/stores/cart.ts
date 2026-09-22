import { getMerchant } from "~/data/merchants";
import type { Product } from "~/data/products";

export interface CartItem {
  id: string;
  productSlug: string;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  qty: number;
  merchantSlug: string;
  merchantName: string;
}

export interface CartMerchantGroup {
  merchantSlug: string;
  merchantName: string;
  deliveryEta: string;
  items: CartItem[];
  subtotal: number;
}

function seedCartItems(): CartItem[] {
  return [];
}

export const useCartStore = defineStore(
  "cart",
  () => {
    const items = ref<CartItem[]>(seedCartItems());

    function addItem(product: Product, variantLabel?: string, qty = 1) {
      const id = `${product.id}-${(variantLabel ?? "default").toLowerCase().replace(/\s+/g, "-")}`;
      const existing = items.value.find((item) => item.id === id);
      if (existing) {
        existing.qty += qty;
        return;
      }
      const merchant = getMerchant(product.merchantSlug);
      items.value.push({
        id,
        productSlug: product.slug,
        name: product.name,
        variantLabel,
        unitPrice: product.price,
        qty,
        merchantSlug: product.merchantSlug,
        merchantName: merchant?.name ?? product.merchantSlug,
      });
    }

    function removeItem(id: string) {
      items.value = items.value.filter((item) => item.id !== id);
    }

    function updateQty(id: string, qty: number) {
      const item = items.value.find((entry) => entry.id === id);
      if (!item) return;
      if (qty < 1) {
        removeItem(id);
        return;
      }
      item.qty = qty;
    }

    function clear() {
      items.value = [];
    }

    const groups = computed<CartMerchantGroup[]>(() => {
      const bySlug = new Map<string, CartMerchantGroup>();
      for (const item of items.value) {
        if (!bySlug.has(item.merchantSlug)) {
          bySlug.set(item.merchantSlug, {
            merchantSlug: item.merchantSlug,
            merchantName: item.merchantName,
            deliveryEta: getMerchant(item.merchantSlug)?.deliveryEta ?? "Delivery time varies by seller",
            items: [],
            subtotal: 0,
          });
        }
        const group = bySlug.get(item.merchantSlug)!;
        group.items.push(item);
        group.subtotal += item.unitPrice * item.qty;
      }
      return Array.from(bySlug.values());
    });

    const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0));
    const sellerCount = computed(() => groups.value.length);
    const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.unitPrice * item.qty, 0));
    const isEmpty = computed(() => items.value.length === 0);

    return { items, groups, itemCount, sellerCount, subtotal, isEmpty, addItem, removeItem, updateQty, clear };
  },
  { persist: true },
);
