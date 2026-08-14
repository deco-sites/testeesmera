import type { Handlers, PageProps } from "$fresh/server.ts";
import StorefrontLayout from "../../components/esmera/StorefrontLayout.tsx";
import { toSEO } from "../../lib/payload/adapters.ts";
import { getPageChrome } from "../../lib/payload/pageData.ts";
import type { SEOModel } from "../../lib/payload/types.ts";
import AboutHero from "../../sections/Esmera/About/AboutHero.tsx";
import AboutProcess from "../../sections/Esmera/About/AboutProcess.tsx";
import AboutManifesto from "../../sections/Esmera/About/AboutManifesto.tsx";
import AboutMaterials from "../../sections/Esmera/About/AboutMaterials.tsx";

/**
 * Página institucional dedicada, servida estaticamente em /pagina/a-esmera.
 * O Fresh resolve rotas estáticas antes de [slug].tsx, então esta rota
 * assume a URL sem competir com o handler genérico de páginas editoriais
 * do Payload (que continua servindo as demais páginas em /pagina/:slug).
 * Todo o conteúdo é local ao frontend — nada aqui lê ou grava no Payload.
 */

const MEDIA_BASE = "https://esmeracms-green.vercel.app/api/media/file";

const hero = {
  eyebrow: "A ESMÉRA",
  title: "A ESMÉRA",
  text:
    "A Esméra nasce do encontro entre a natureza e o olhar humano. Transformamos pedras naturais e minerais em peças únicas que carregam história, presença e propósito.",
  ctaLabel: "NOSSA ESSÊNCIA",
  ctaHref: "#nossa-essencia",
  image: `${MEDIA_BASE}/29ad265a-de27-425f-9fbe-d790f498b430.png`,
  imageAlt:
    "Trio de vasos de mármore verde-escuro em formatos geométricos sobre prateleira neutra, com hastes de flores brancas em composição minimalista.",
};

const process_ = {
  eyebrow: "NOSSO PROCESSO",
  title: "Da matéria até o produto",
  text:
    "Cada peça percorre um caminho cuidadoso, onde técnica e sensibilidade se encontram para revelar a essência da pedra.",
  steps: [
    {
      number: "01",
      title: "Origem",
      text:
        "Selecionamos pedras e minerais de origem natural, com rastreabilidade e respeito à terra que as formou.",
      image: `${MEDIA_BASE}/Sem%20T%C3%ADtulo-3.2-1.jpg`,
      imageAlt:
        "Peça esculpida em Bege Bahia, rocha natural brasileira de tonalidades suaves e veios únicos.",
    },
    {
      number: "02",
      title: "Transformação",
      text:
        "Lapidamos, esculpimos e polimos cada detalhe com técnicas que valorizam a beleza única de cada material.",
      image: `${MEDIA_BASE}/3f2a2b25-b10a-4933-9273-42a4afb938b1.png`,
      imageAlt:
        "Bandeja retangular em mármore verde-escuro sobre bancada clara em composição minimalista.",
    },
    {
      number: "03",
      title: "Registro",
      text:
        "Cada peça é registrada e catalogada, garantindo sua autenticidade e história para quem a escolhe.",
      image: `${MEDIA_BASE}/37994651-8854-45b7-bd31-e400b15e2f31.jpg`,
      imageAlt:
        "Conjunto de acessórios de banheiro em travertino bege sobre bandeja, catalogado em composição editorial.",
    },
  ],
};

const manifesto = {
  eyebrow: "NOSSA ESSÊNCIA",
  text: "Mais do que objetos, criamos presenças que atravessam o tempo.",
  image: `${MEDIA_BASE}/1gXKaekGEitGS5V79qMXjkw3vvyYe0_hl-w2000`,
  imageAlt: "Bandeja esculpida em mármore verde Esmeralda, veios naturais em close editorial.",
};

const materials = {
  eyebrow: "MATERIAIS E CUIDADOS",
  title: "Beleza que permanece",
  image: `${MEDIA_BASE}/Sem%20T%C3%ADtulo-1.jpg`,
  imageAlt:
    "Conjunto de acessórios de banheiro em travertino bege sobre bandeja, com difusor, porta-sabonete líquido, porta-escovas, pote, vela acesa e tigela com cristais.",
  principles: [
    {
      icon: "stone" as const,
      title: "Pedras naturais",
      text: "Materiais únicos, formados pela natureza ao longo de milhões de anos.",
    },
    {
      icon: "handmade" as const,
      title: "Acabamento artesanal",
      text: "Cada detalhe recebe acabamento manual para realçar textura, cor e brilho.",
    },
    {
      icon: "care" as const,
      title: "Durabilidade e cuidado",
      text: "Instruções simples que preservam a beleza e a integridade da sua peça.",
    },
    {
      icon: "unique" as const,
      title: "Peças únicas",
      text: "Nenhuma pedra é igual à outra. Cada escolha é exclusiva.",
    },
  ],
};

interface Data {
  chrome: Awaited<ReturnType<typeof getPageChrome>>;
  seo: SEOModel;
  canonical: string;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const chrome = await getPageChrome();
    const url = new URL(req.url);
    const baseSeo = toSEO(null, chrome.settings);
    return ctx.render({
      chrome,
      seo: {
        ...baseSeo,
        title: baseSeo.title || "A Esméra",
        description: baseSeo.description || hero.text,
        canonical: `${url.origin}${url.pathname}`,
      },
      canonical: `${url.origin}${url.pathname}`,
    });
  },
};

export default function AboutEsmeraPage({ data }: PageProps<Data>) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: new URL("/", data.canonical).toString() },
      { "@type": "ListItem", position: 2, name: "A Esméra", item: data.canonical },
    ],
  };

  return (
    <StorefrontLayout
      {...data.chrome}
      seo={data.seo}
      canonical={data.canonical}
      jsonLd={[breadcrumbJsonLd]}
    >
      <AboutHero {...hero} />
      <div id="nossa-essencia">
        <AboutProcess {...process_} />
      </div>
      <AboutManifesto {...manifesto} />
      <AboutMaterials {...materials} />
    </StorefrontLayout>
  );
}
