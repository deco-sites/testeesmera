import { useEffect, useState } from "preact/hooks";

export interface WishlistButtonProps {
  productId: string;
  productTitle: string;
}

const STORAGE_KEY = "esmera:wishlist";

function readWishlist(): Set<string> {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function writeWishlist(ids: Set<string>): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Armazenamento indisponível (modo privado/quota): estado só em memória.
  }
}

/**
 * Favorito é estado do cliente, nunca campo do produto (plano §14).
 * Primeira versão: localStorage. Sincronização por conta fica para depois.
 */
export default function WishlistButton(
  { productId, productTitle }: WishlistButtonProps,
) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(readWishlist().has(productId));
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; favorited: boolean }>)
        .detail;
      if (detail?.id === productId) setFavorited(detail.favorited);
    };
    globalThis.addEventListener("esmera:wishlist-sync", onSync);
    return () => globalThis.removeEventListener("esmera:wishlist-sync", onSync);
  }, [productId]);

  const toggle = () => {
    const ids = readWishlist();
    const next = !ids.has(productId);
    if (next) ids.add(productId);
    else ids.delete(productId);
    writeWishlist(ids);
    setFavorited(next);
    globalThis.dispatchEvent(
      new CustomEvent("esmera:wishlist-sync", {
        detail: { id: productId, favorited: next },
      }),
    );
  };

  return (
    <button
      type="button"
      class="esv-card-wishlist"
      aria-pressed={favorited ? "true" : "false"}
      aria-label={favorited
        ? `Remover ${productTitle} dos favoritos`
        : `Adicionar ${productTitle} aos favoritos`}
      data-favorited={favorited ? "true" : "false"}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 20.5 4.6 13a4.5 4.5 0 0 1 6.4-6.3l1 1 1-1a4.5 4.5 0 0 1 6.4 6.3Z"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  );
}
