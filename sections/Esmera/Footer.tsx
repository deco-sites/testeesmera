import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";

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

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

export default function Footer(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  const source = props.resolvedHome?.footer ?? props;
  if (!source.siteName && !source.contactHref && !source.statement) return null;
  const year = new Date().getFullYear();
  return (
    <footer id="footer" class="esv-footer">
      <div class="esv-shell">
        <div class="esv-footer-main">
          {source.siteName && (
            <a
              class="esv-footer-wordmark"
              href="/"
              aria-label={`${source.siteName} — início`}
            >
              <img
                class="esv-brand-image esv-footer-logo-image"
                src="/esmera-logo.png"
                alt=""
                width="1369"
                height="305"
                loading="lazy"
                decoding="async"
              />
            </a>
          )}
          {source.statement && (
            <p class="esv-footer-statement">{source.statement}</p>
          )}
          {source.contactHref && (
            <div id="contact" class="esv-footer-contact">
              <span class="esv-kicker">Contato</span>
              <a href={source.contactHref}>{source.contactLabel}</a>
            </div>
          )}
        </div>
        <div class="esv-footer-bottom">
          {source.siteName && (
            <span class="esv-kicker">© {year} {source.siteName}</span>
          )}
          <nav aria-label="Informações legais">
            {source.privacyHref && (
              <a class="esv-kicker" href={source.privacyHref}>
                {source.privacyLabel}
              </a>
            )}
            {source.termsHref && (
              <a class="esv-kicker" href={source.termsHref}>
                {source.termsLabel}
              </a>
            )}
          </nav>
          {source.location && <span class="esv-kicker">{source.location}</span>}
        </div>
      </div>
      {source.whatsappHref && (
        <a
          class="esv-whatsapp-sticky"
          href={source.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a Esméra no WhatsApp"
        >
          <span class="esv-whatsapp-label">
            {source.whatsappLabel || "WhatsApp"}
          </span>
        </a>
      )}
    </footer>
  );
}
