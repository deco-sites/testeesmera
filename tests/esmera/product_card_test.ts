import { assertEquals } from "@std/assert";
import { toProductCardViewModel } from "../../lib/esmera/productCard.ts";
import type { StorefrontProductV2 } from "../../lib/esmera/storefront.ts";

function product(
  overrides: Partial<StorefrontProductV2> = {},
): StorefrontProductV2 {
  return {
    id: "42",
    slug: "ponta-de-esmeralda",
    title: "Gelato",
    priceUnit: "cent",
    price: 49000,
    image: {
      id: "1",
      url: "/pc.jpg",
      alt: "Ponta de Esmeralda",
      width: 900,
      height: 1200,
    },
    identity: {
      name: "Gelato",
      pieceType: "Ponta de Esmeralda",
      material: "Rocha de Esmeralda Natural",
    },
    pieceType: "Ponta de Esmeralda",
    material: "Rocha de Esmeralda Natural",
    state: "available",
    isUnique: true,
    purchasable: true,
    specs: { heightMm: 180, widthMm: null, depthMm: null, weightGrams: 1200 },
    pricing: {
      mode: "fixed",
      priceCents: 49000,
      installment: { count: 12, amountCents: 4083, interestFree: true },
    },
    ...overrides,
  };
}

Deno.test("reproduz o card do mockup", () => {
  const vm = toProductCardViewModel(product());
  assertEquals(vm.eyebrow, "GELATO · ROCHA DE ESMERALDA NATURAL");
  assertEquals(vm.title, "Ponta de Esmeralda");
  assertEquals(vm.status, "PEÇA ÚNICA · DISPONÍVEL");
  assertEquals(vm.specs, "18 cm · 1,2 kg");
  assertEquals(vm.price, "R$ 490,00");
  assertEquals(vm.installment, {
    prefix: "ou ",
    emphasis: "12x de R$ 40,83",
    suffix: " sem juros",
  });
  assertEquals(vm.image, "/pc.jpg");
  assertEquals(vm.isPurchasable, true);
});

Deno.test("título cai para o nome quando não há pieceType", () => {
  const vm = toProductCardViewModel(
    product({
      pieceType: null,
      identity: { name: "Gelato", pieceType: null, material: "X" },
    }),
  );
  assertEquals(vm.title, "Gelato");
});

Deno.test("sem peso mostra apenas a dimensão", () => {
  const vm = toProductCardViewModel(
    product({
      specs: { heightMm: 180, widthMm: null, depthMm: null, weightGrams: null },
    }),
  );
  assertEquals(vm.specs, "18 cm");
});

Deno.test("sem dimensão nem peso, specs é nulo", () => {
  const vm = toProductCardViewModel(
    product({
      specs: {
        heightMm: null,
        widthMm: null,
        depthMm: null,
        weightGrams: null,
      },
    }),
  );
  assertEquals(vm.specs, null);
});

Deno.test("preço sob consulta esconde preço e parcelamento", () => {
  const vm = toProductCardViewModel(
    product({
      purchasable: false,
      pricing: { mode: "inquiry", priceCents: null, installment: null },
    }),
  );
  assertEquals(vm.price, null);
  assertEquals(vm.installment, null);
  assertEquals(vm.isPurchasable, false);
});

Deno.test("sob encomenda não repete PEÇA ÚNICA quando não é única", () => {
  const vm = toProductCardViewModel(
    product({ state: "made_to_order", isUnique: false }),
  );
  assertEquals(vm.status, "SOB ENCOMENDA");
});

Deno.test("parcelamento com juros omite 'sem juros'", () => {
  const vm = toProductCardViewModel(
    product({
      pricing: {
        mode: "fixed",
        priceCents: 49000,
        installment: { count: 12, amountCents: 4083, interestFree: false },
      },
    }),
  );
  assertEquals(vm.installment?.suffix, "");
});

Deno.test("altura fracionária e peso abaixo de 1 kg", () => {
  const vm = toProductCardViewModel(
    product({
      specs: { heightMm: 185, widthMm: null, depthMm: null, weightGrams: 800 },
    }),
  );
  assertEquals(vm.specs, "18,5 cm · 800 g");
});
