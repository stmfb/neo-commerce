import type { ApiEtaRange } from "~/models/cart_model";
import type { ApiAddress, ApiBankLink, ApiPlan } from "~/models/checkout_model";

export function useCheckout() {
  const store = useCheckoutStore();
  const { quote, checkoutId, plan, planCode, addresses, addressId, address, sellerCount, disclosures, transfer, status } =
    storeToRefs(store);
  return {
    quote,
    checkoutId,
    plan,
    planCode,
    addresses,
    addressId,
    address,
    sellerCount,
    disclosures,
    transfer,
    status,
    startQuote: store.startQuote,
    requote: store.requote,
    fetchAddresses: store.fetchAddresses,
    addAddress: store.addAddress,
    fetchDisclosures: store.fetchDisclosures,
    acknowledge: store.acknowledge,
    authorise: store.authorise,
    submitEmployment: store.submitEmployment,
    linkBank: store.linkBank,
    fetchStatus: store.fetchStatus,
  };
}

/** `instalmentKobo` is the largest instalment; true when the others differ, to say "Up to". */
export function instalmentsVary(plan: ApiPlan) {
  return plan.instalments.some((i) => i.amountKobo !== plan.instalmentKobo);
}

export function formatAddress(a: ApiAddress) {
  const line = [a.line1, a.line2, a.city, a.state].filter(Boolean).join(", ");
  return a.phone ? `${line} · ${a.phone}` : line;
}

export function formatEta(eta?: ApiEtaRange) {
  if (!eta) return "Delivery time varies by seller";
  return eta.min === eta.max ? `Delivery in ${eta.min} days` : `Delivery in ${eta.min}–${eta.max} days`;
}

/** "9 Nov, 3:45 pm" in Lagos time. */
export function formatCheckoutTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });
}

const MONO_SCRIPT = "https://connect.withmono.com/connect.js";

type MonoConnect = new (config: Record<string, unknown>) => { setup(): void; open(): void };

/** Mono's bundle has exposed its constructor under different names across versions. */
function monoConstructor(): MonoConnect | null {
  const w = window as any;
  return [w.MonoConnect, w.MonoConnect?.default, w.Connect, w.Connect?.default].find((c) => typeof c === "function") ?? null;
}

function loadMono(): Promise<MonoConnect> {
  const ready = monoConstructor();
  if (ready) return Promise.resolve(ready);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${MONO_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = MONO_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => {
      const ctor = monoConstructor();
      if (ctor) resolve(ctor);
      else reject(new Error("We couldn't open your bank's sign-in. Please try again."));
    });
    script.addEventListener("error", () => reject(new Error("We couldn't open your bank's sign-in. Please try again.")));
  });
}

/** Opens Mono Connect. Resolves true once the shopper links their account, false if they close it. */
export async function openMonoConnect(link: ApiBankLink): Promise<boolean> {
  const Connect = await loadMono();
  return new Promise((resolve) => {
    const config: Record<string, unknown> = {
      key: link.publicKey,
      reference: link.reference,
      onSuccess: () => resolve(true),
      onClose: () => resolve(false),
    };
    // Mono takes one scope; leave it out to get Mono's default.
    if (link.scope?.[0]) config.scope = link.scope[0];
    if (link.customerId) config.data = { customer: { id: link.customerId } };
    const widget = new Connect(config);
    widget.setup();
    widget.open();
  });
}
