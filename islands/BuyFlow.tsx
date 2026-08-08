import { useEffect, useState } from "preact/hooks";

type BuyDetail = {
  productId?: string;
  productSlug?: string;
  product?: { slug?: string } | null;
};

type Feedback = { tone: "success" | "sold" | "error"; message: string } | null;

function newIdempotencyKey(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid.replace(/-/g, "");
  return `k${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Ponte cliente do CTA COMPRAR (plano §16). Escuta `esmera:buy`, reserva a peça
 * no servidor (fonte de verdade) e trata concorrência: 409 → peça já reservada.
 * O checkout/pagamento em si é o próximo passo — aqui garantimos a reserva.
 */
export default function BuyFlow() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onBuy = async (event: Event) => {
      const detail = (event as CustomEvent<BuyDetail>).detail ?? {};
      const slug = detail.productSlug ?? detail.product?.slug ?? "";
      if (!slug || busy) return;

      setBusy(true);
      setFeedback(null);
      try {
        const response = await fetch("/api/esmera-reserve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug, idempotencyKey: newIdempotencyKey() }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          setFeedback({
            tone: "success",
            message:
              "Peça reservada por 15 minutos. Finalize a compra para garanti-la.",
          });
          globalThis.dispatchEvent(
            new CustomEvent("esmera:buy-reserved", {
              detail: { slug, reservation: data.reservation },
            }),
          );
        } else if (response.status === 409) {
          setFeedback({
            tone: "sold",
            message:
              "Esta peça única acabou de ser reservada por outra pessoa.",
          });
        } else {
          setFeedback({
            tone: "error",
            message: "Não foi possível reservar agora. Tente novamente.",
          });
        }
      } catch {
        setFeedback({
          tone: "error",
          message: "Falha de conexão ao reservar. Tente novamente.",
        });
      } finally {
        setBusy(false);
      }
    };

    globalThis.addEventListener("esmera:buy", onBuy);
    return () => globalThis.removeEventListener("esmera:buy", onBuy);
  }, [busy]);

  if (!feedback && !busy) return null;

  return (
    <div class="esv-buy-flow" role="status" aria-live="polite">
      {busy
        ? <p class="esv-buy-flow-msg is-busy">Reservando…</p>
        : feedback && (
          <p class={`esv-buy-flow-msg is-${feedback.tone}`}>
            {feedback.message}
            <button
              type="button"
              class="esv-buy-flow-close"
              aria-label="Fechar aviso"
              onClick={() => setFeedback(null)}
            >
              ×
            </button>
          </p>
        )}
    </div>
  );
}
