export const STOREFRONT_CONTRACT_VERSION = "1" as const;
export const STOREFRONT_CONTRACT_HEADER = "x-esmera-storefront-contract";

export const supportedStorefrontContractVersions = new Set<string>([
  STOREFRONT_CONTRACT_VERSION,
]);

export function isSupportedStorefrontContractVersion(
  value: unknown,
): value is typeof STOREFRONT_CONTRACT_VERSION {
  return typeof value === "string" &&
    supportedStorefrontContractVersions.has(value);
}
