export interface Props {
  siteName?: string;
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

export default function Footer(props: Props) {
  if (!props.siteName && !props.contactHref && !props.statement) return null;
  const year = new Date().getFullYear();
  return (
    <footer id="footer" class="esv-footer">
      <div class="esv-shell">
        <div class="esv-footer-main">
          {props.siteName && (
            <a class="esv-footer-wordmark" href="/">{props.siteName}</a>
          )}
          {props.statement && (
            <p class="esv-footer-statement">{props.statement}</p>
          )}
          {props.contactHref && (
            <div id="contact" class="esv-footer-contact">
              <span class="esv-kicker">Contato</span>
              <a href={props.contactHref}>{props.contactLabel}</a>
            </div>
          )}
        </div>
        <div class="esv-footer-bottom">
          {props.siteName && (
            <span class="esv-kicker">© {year} {props.siteName}</span>
          )}
          <nav aria-label="Informações legais">
            {props.privacyHref && (
              <a class="esv-kicker" href={props.privacyHref}>
                {props.privacyLabel}
              </a>
            )}
            {props.termsHref && (
              <a class="esv-kicker" href={props.termsHref}>
                {props.termsLabel}
              </a>
            )}
          </nav>
          {props.location && <span class="esv-kicker">{props.location}</span>}
        </div>
      </div>
      {props.whatsappHref && (
        <a
          class="esv-whatsapp-sticky"
          href={props.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a Esméra no WhatsApp"
        >
          <span class="esv-whatsapp-label">
            {props.whatsappLabel || "WhatsApp"}
          </span>
        </a>
      )}
    </footer>
  );
}
