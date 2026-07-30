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
        <span class="esv-whatsapp-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.891-9.884a9.82 9.82 0 0 1 6.988 2.897 9.83 9.83 0 0 1 2.893 6.99c-.003 5.45-4.437 9.89-9.888 9.89m8.413-18.297A11.82 11.82 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892a11.86 11.86 0 0 0 1.588 5.946L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.688 1.448h.005c6.558 0 11.893-5.336 11.896-11.893a11.82 11.82 0 0 0-3.487-8.413"
            />
          </svg>
        </span>
        <span class="esv-whatsapp-label">{whatsappLabel}</span>
      </a>
    </footer>
  );
}
