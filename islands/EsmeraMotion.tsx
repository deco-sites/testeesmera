import { useEffect } from "preact/hooks";

const revealSelectors = [
  ".esv-hero-statement",
  ".esv-hero-cta",
  ".esv-maison-copy",
  ".esv-maison-main",
  ".esv-maison-secondary",
  ".esv-selected-head > .esv-kicker",
  ".esv-selected-head > h2",
  ".esv-selected-head > p:last-child",
  ".esv-product-card",
  ".esv-territory-copy",
  ".esv-signature-media",
  ".esv-signature-copy",
  ".esv-matter-interlude-meta",
  ".esv-matter-interlude-title",
  ".esv-provenance-intro-grid > .esv-kicker",
  ".esv-provenance-intro-copy",
  ".esv-provenance-stage-media",
  ".esv-provenance-stage-copy",
  ".esv-private-grid > .esv-kicker",
  ".esv-private-copy",
];

const staggerSelectors = [
  ".esv-product-card",
];

export default function EsmeraMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in globalThis)) return;

    const elements = Array.from(
      new Set(
        revealSelectors.flatMap((selector) =>
          Array.from(document.querySelectorAll<HTMLElement>(selector))
        ),
      ),
    );

    if (elements.length === 0) return;

    elements.forEach((element) => element.classList.add("esv-reveal"));

    staggerSelectors.forEach((selector) => {
      const groups = new Map<Element, HTMLElement[]>();
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        const parent = element.parentElement;
        if (!parent) return;
        const current = groups.get(parent) ?? [];
        current.push(element);
        groups.set(parent, current);
      });

      groups.forEach((group) => {
        group.forEach((element, index) => {
          element.style.setProperty(
            "--esv-reveal-delay",
            `${Math.min(index * 70, 210)}ms`,
          );
        });
      });
    });

    const viewportHeight = globalThis.innerHeight || 800;
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < viewportHeight * .94 && rect.bottom > 0) {
        element.classList.add("is-visible");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("is-visible");
          observer.unobserve(element);
        });
      },
      {
        threshold: .08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    });

    const frame = requestAnimationFrame(() => root.classList.add("esv-motion-ready"));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("esv-motion-ready");
      elements.forEach((element) => {
        element.classList.remove("esv-reveal", "is-visible");
        element.style.removeProperty("--esv-reveal-delay");
      });
    };
  }, []);

  return null;
}