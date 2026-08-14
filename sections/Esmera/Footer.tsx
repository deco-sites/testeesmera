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

const FOOTER_ART =
  "https://decoims.com/testeesmera/1108e64c-bca6-4592-83de-77f5963deafd/ec1bcbc8-0fbb-4d57-a822-a2282100dd71.png";

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

export default function Footer(
  props: Props & { resolvedHome?: ResolvedHome },
) {
  const source = props.resolvedHome?.footer ?? props;
  if (!source.siteName && !source.contactHref && !source.statement) return null;

  const year = new Date().getFullYear();
  const collections = resolveCollectionLinks(props.collectionLinks ?? []);
  const contactHref = source.contactHref || "#contact";
  const newsletterAction = contactHref;
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
      <section
        class="esv-footer-newsletter"
        aria-labelledby="esv-footer-newsletter-title"
      >
        <div class="esv-footer-newsletter-shell">
          <p class="esv-footer-newsletter-eyebrow">Acompanhe a Esméra</p>
          <div class="esv-footer-newsletter-copy">
            <h2 id="esv-footer-newsletter-title">
              Novos lançamentos, matérias e peças especiais.
            </h2>
            <p>
              Assine nossa newsletter e receba curadorias exclusivas em primeira mão.
            </p>
          </div>
        </div>
        <figure class="esv-footer-newsletter-art" aria-hidden="true">
          <img
            src={FOOTER_ART}
            alt=""
            loading="lazy"
            decoding="async"
            width="760"
            height="760"
          />
        </figure>
      </section>

      <div class="esv-footer-body">
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
              Curadoria autoral de peças e materiais naturais que valorizam a arquitetura
              e revelam a essência dos espaços. Atendimento próximo, soluções sob medida
              e atenção a cada detalhe.
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
            <h2 id="esv-footer-relationship" class="esv-footer-heading">
              Relacionamento
            </h2>

            <form
              class="esv-footer-form"
              action={newsletterAction}
              method="get"
            >
              <label for="esv-footer-email">Assine nossa newsletter</label>
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
                >
                  <Icon id="WhatsApp" size={21} aria-hidden="true" />
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
                  <Icon id="Instagram" size={21} aria-hidden="true" />
                  <span>Instagram</span>
                  <span class="esv-footer-social-arrow" aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </section>
        </div>
      </div>

      <div class="esv-footer-bottom-bar">
        <div class="esv-footer-bottom-inner">
          <span>© {year} {siteName}</span>

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
                <Icon id="Instagram" size={20} aria-hidden="true" />
                <span>Instagram</span>
              </a>
            )}
            {source.whatsappHref && (
              <a
                href={source.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon id="WhatsApp" size={20} aria-hidden="true" />
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
