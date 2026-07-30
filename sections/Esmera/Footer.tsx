export interface Props {
  statement?: string;
  contactLabel?: string;
  contactHref?: string;
  privacyLabel?: string;
  privacyHref?: string;
  termsLabel?: string;
  termsHref?: string;
  location?: string;
  whatsappLabel?: string;
  whatsappHref?: string;
}

const defaultWhatsAppHref = `https://wa.me/?text=${
  encodeURIComponent("Olá, gostaria de falar com a Esméra.")
}`;

export default function Footer({
  statement = "Natureza. Matéria. Permanência.",
  contactLabel = "contact@esmera.com",
  contactHref = "mailto:contact@esmera.com",
  privacyLabel = "Privacidade",
  privacyHref = "#contact",
  termsLabel = "Termos",
  termsHref = "#contact",
  location = "Brasil",
  whatsappLabel = "WhatsApp",
  whatsappHref = defaultWhatsAppHref,
}: Props) {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" class="esv-footer">
      <div class="esv-shell">
        <div class="esv-footer-main">
          <a class="esv-footer-wordmark" href="#main-content">ESMÉRA</a>
          <p class="esv-footer-statement">{statement}</p>
          <div id="contact" class="esv-footer-contact">
            <span class="esv-kicker">Contato</span>
            <a href={contactHref}>{contactLabel}</a>
          </div>
        </div>

        <div class="esv-footer-bottom">
          <span class="esv-kicker">© {year} Esméra</span>
          <nav aria-label="Informações legais">
            <a class="esv-kicker" href={privacyHref}>{privacyLabel}</a>
            <a class="esv-kicker" href={termsHref}>{termsLabel}</a>
          </nav>
          {location && <span class="esv-kicker">{location}</span>}
        </div>
      </div>

      <a
        class="esv-whatsapp-sticky"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a Esméra no WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.45"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 11.4a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.4Z" />
          <path d="M8.7 8.2c.2 2.8 2.4 5 5.2 5.3" />
          <path d="m8.8 8.2 1.4-.5 1 2-1 .8" />
          <path d="m13.9 13.5.8-1 2 .9-.4 1.4" />
        </svg>
        <span>{whatsappLabel}</span>
      </a>
    </footer>
  );
}
