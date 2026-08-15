import Icon from "../../components/ui/Icon.tsx";
import {
  loadResolvedHome,
  type ResolvedHome,
} from "../../lib/esmera/homeData.ts";
import type { NavigationLink } from "../../lib/payload/types.ts";

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
  instagramHref?: string;
  collectionLinks?: NavigationLink[];
}

export const loader = async (props: Props) => ({
  ...props,
  resolvedHome: await loadResolvedHome(),
});

const COLLECTION_ORDER = [
  "Pronta Entrega",
  "Sob Encomenda",
  "Kit Lavabo",
  "Bandejas",
  "Vasos",
  "Esculturas",
];

const FALLBACK_COLLECTIONS: NavigationLink[] = [
  { label: "Pronta Entrega", href: "/colecao/pronta-entrega", external: false },
  { label: "Sob Encomenda", href: "/colecao/sob-encomenda", external: false },
  { label: "Kit Lavabo", href: "/colecao/kit-lavabo", external: false },
  { label: "Bandejas", href: "/colecao/bandejas", external: false },
  { label: "Vasos", href: "/colecao/vasos", external: false },
  { label: "Esculturas", href: "/colecao/esculturas", external: false },
];

function normalizedLabel(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function resolveCollectionLinks(links: NavigationLink[]): NavigationLink[] {
  if (links.length === 0) return FALLBACK_COLLECTIONS;

  const selected: NavigationLink[] = [];
  for (const label of COLLECTION_ORDER) {
    const match = links.find((link) =>
      normalizedLabel(link.label) === normalizedLabel(label)
    );
    if (match) selected.push(match);
  }

  for (const link of links) {
    if (selected.length >= 6) break;
    if (selected.some((candidate) => candidate.href === link.href)) continue;
    selected.push(link);
  }

  return selected.length > 0 ? selected.slice(0, 6) : FALLBACK_COLLECTIONS;
}

function ExternalAttrs({ external }: { external: boolean }) {
  if (!external) return null;
  return <span class="esv-sr-only">Abre em uma nova janela</span>;
}

function InstagramGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.25"
        y="3.25"
        width="17.5"
        height="17.5"
        rx="4.75"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <circle cx="17.35" cy="6.75" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Footer(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  const source = props.resolvedHome?.footer ?? props;
  if (!source.siteName && !source.contactHref && !source.statement) return null;

  const year = new Date().getFullYear();
  const collections = resolveCollectionLinks(props.collectionLinks ?? []);
  const contactHref = source.contactHref || "#contact";
  const instagramHref = props.instagramHref || "";
  const siteName = source.siteName || "ESMÉRA";

  const institutionalLinks = [
    { label: "A Esméra", href: "/pagina/a-esmera" },
    { label: "Matéria e Registro", href: "/pagina/a-esmera#nossa-essencia" },
    { label: "Presença em Escala Real", href: "/#context" },
    { label: "Contato", href: contactHref },
  ];

  return (
    <footer id="footer" class="esv-footer esv-footer-premium">
      <div class="esv-footer-shell">
        <div class="esv-footer-grid">
          <section class="esv-footer-brand" aria-label={`Sobre ${siteName}`}>
            <a
              class="esv-footer-wordmark"
              href="/"
              aria-label={`${siteName} — início`}
            >
              <img
                class="esv-brand-image esv-footer-logo-image"
                src="/esmera-logo.png"
                alt=""
                width="1225"
                height="369"
                loading="lazy"
                decoding="async"
              />
            </a>
            <span class="esv-footer-accent-line" aria-hidden="true" />
            <p class="esv-footer-tagline">
              Objetos, matérias e composições para interiores com presença.
            </p>
            <p class="esv-footer-description">
              Curadoria autoral de peças e materiais naturais, com atendimento próximo
              e soluções sob medida.
            </p>
            <span class="esv-footer-curation-badge">Curadoria autoral</span>
          </section>

          <nav class="esv-footer-column" aria-labelledby="esv-footer-collections">
            <h2 id="esv-footer-collections" class="esv-footer-heading">
              Coleções
            </h2>
            <ul class="esv-footer-links">
              {collections.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    <span>{link.label}</span>
                    <ExternalAttrs external={link.external} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav class="esv-footer-column" aria-labelledby="esv-footer-institutional">
            <h2 id="esv-footer-institutional" class="esv-footer-heading">
              Institucional
            </h2>
            <ul class="esv-footer-links">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <section
            id="contact"
            class="esv-footer-column esv-footer-relationship"
            aria-labelledby="esv-footer-relationship"
          >
            <p class="esv-footer-newsletter-eyebrow">Acompanhe a Esméra</p>
            <h2 id="esv-footer-relationship" class="esv-footer-newsletter-title">
              Novos lançamentos, matérias e peças especiais.
            </h2>
            <p class="esv-footer-newsletter-copy">
              Receba curadorias e novidades em primeira mão.
            </p>

            <form class="esv-footer-form" action={contactHref} method="get">
              <label class="esv-sr-only" for="esv-footer-email">
                Seu melhor e-mail
              </label>
              <div class="esv-footer-form-row">
                <input
                  id="esv-footer-email"
                  type="email"
                  name="email"
                  placeholder="Seu melhor e-mail"
                  autocomplete="email"
                  required
                />
                <button type="submit">Receber novidades</button>
              </div>
            </form>

            <div class="esv-footer-socials">
              {source.whatsappHref && (
                <a
                  class="esv-footer-social"
                  href={source.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style="padding-right:16px"
                >
                  <Icon id="WhatsApp" size={20} aria-hidden="true" />
                  <span>{source.whatsappLabel || "WhatsApp"}</span>
                  <span class="esv-footer-social-arrow" aria-hidden="true">→</span>
                </a>
              )}
              {instagramHref && (
                <a
                  class="esv-footer-social"
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramGlyph size={20} />
                  <span>Instagram</span>
                  <span class="esv-footer-social-arrow" aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </section>
        </div>

        <div class="esv-footer-bottom-bar">
          <span class="esv-footer-copyright">© {year} {siteName}</span>

          <nav class="esv-footer-legal" aria-label="Informações legais">
            {source.privacyHref && (
              <a href={source.privacyHref}>{source.privacyLabel}</a>
            )}
            {source.termsHref && (
              <a href={source.termsHref}>{source.termsLabel}</a>
            )}
          </nav>

          <div class="esv-footer-bottom-socials">
            {instagramHref && (
              <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                <InstagramGlyph size={18} />
                <span>Instagram</span>
              </a>
            )}
            {source.whatsappHref && (
              <a
                href={source.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon id="WhatsApp" size={18} aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}
            <span class="esv-footer-mark" aria-hidden="true">
              <svg viewBox="0 0 32 42" role="presentation">
                <path d="M16 1 29 21 16 41 3 21 16 1Z" />
                <path d="M16 8 24 21 16 34 8 21 16 8Z" />
              </svg>
            </span>
          </div>
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
          <Icon id="WhatsApp" size={18} aria-hidden="true" />
          <span class="esv-whatsapp-label">
            {source.whatsappLabel || "WhatsApp"}
          </span>
        </a>
      )}
    </footer>
  );
}
