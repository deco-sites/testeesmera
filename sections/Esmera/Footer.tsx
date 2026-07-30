export interface Props {
  statement?: string;
  contactLabel?: string;
  contactHref?: string;
  privacyLabel?: string;
  privacyHref?: string;
  termsLabel?: string;
  termsHref?: string;
  location?: string;
}

export default function Footer({
  statement = "Natureza. Matéria. Permanência.",
  contactLabel = "Consulta privada",
  contactHref = "mailto:contact@esmera.com",
  privacyLabel = "Privacidade",
  privacyHref = "#contact",
  termsLabel = "Termos",
  termsHref = "#contact",
  location = "Brasil",
}: Props) {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" class="esv-footer">
      <div class="esv-shell">
        <div class="esv-footer-main">
          <a class="esv-footer-wordmark" href="#main-content">ESMÉRA</a>
          <p>{statement}</p>
          <div id="contact" class="esv-footer-contact">
            <small>Contato</small>
            <a href={contactHref}>{contactLabel}</a>
          </div>
        </div>

        <div class="esv-footer-bottom">
          <span>© {year} Esméra</span>
          <nav aria-label="Informações legais">
            <a href={privacyHref}>{privacyLabel}</a>
            <a href={termsHref}>{termsLabel}</a>
          </nav>
          {location && <span>{location}</span>}
        </div>
      </div>
    </footer>
  );
}
