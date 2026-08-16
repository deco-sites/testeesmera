import { useState } from "preact/hooks";

type Feedback = { tone: "success" | "error"; message: string } | null;

const E164_BR_PATTERN = /^55\d{10,11}$/;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 || digits.length === 11
    ? `55${digits}`
    : digits;
  return E164_BR_PATTERN.test(withCountryCode) ? `+${withCountryCode}` : null;
}

/**
 * Ilha do formulário de contato do rodapé. Envia o WhatsApp do visitante para
 * o CMS (mesmo padrão same-origin do BuyFlow/esmera-reserve), em vez do antigo
 * <form action="mailto:..."> que o navegador sinalizava como não seguro.
 */
export default function FooterLeadForm() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    if (busy) return;

    const phone = normalizePhone(value);
    if (!phone) {
      setFeedback({
        tone: "error",
        message: "Informe um WhatsApp válido, com DDD.",
      });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/esmera-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (response.ok) {
        setFeedback({
          tone: "success",
          message: "Recebemos seu WhatsApp. Em breve entramos em contato.",
        });
        setValue("");
      } else {
        setFeedback({
          tone: "error",
          message: "Não foi possível enviar agora. Tente novamente.",
        });
      }
    } catch {
      setFeedback({
        tone: "error",
        message: "Falha de conexão. Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form class="esv-footer-form" onSubmit={onSubmit}>
      <label class="esv-sr-only" for="esv-footer-whatsapp">
        Seu WhatsApp
      </label>
      <div class="esv-footer-form-row">
        <input
          id="esv-footer-whatsapp"
          type="tel"
          name="whatsapp"
          inputmode="tel"
          placeholder="Seu WhatsApp"
          autocomplete="tel"
          required
          disabled={busy}
          value={value}
          onInput={(event) =>
            setValue((event.target as HTMLInputElement).value)}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Enviando..." : "Receber novidades"}
        </button>
      </div>
      {feedback && (
        <p
          class={`esv-footer-form-feedback esv-footer-form-feedback-${feedback.tone}`}
          role="status"
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
