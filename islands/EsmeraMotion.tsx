import { useEffect } from "preact/hooks";

const revealSelectors = [
  ".esv-hero-content",
  ".esv-maison-copy",
  ".esv-maison-main",
  ".esv-maison-secondary",
  ".esv-selected-head",
  ".esv-product-card",
  ".esv-matter-category-copy",
  ".esv-signature-media",
  ".esv-signature-copy",
  ".esv-provenance-head > .esv-kicker",
  ".esv-provenance-head > h2",
  ".esv-provenance-intro",
  ".esv-provenance-evidence article",
  ".esv-provenance-strip",
  ".esv-context-copy > .esv-kicker",
  ".esv-context-copy > h2",
  ".esv-context-copy > p:last-child",
  ".esv-experience-main",
  ".esv-experience-copy > .esv-kicker",
  ".esv-experience-copy > h2",
  ".esv-experience-text",
  ".esv-experience-pillars article",
  ".esv-private-grid > .esv-kicker",
  ".esv-private-copy",
];

const staggerSelectors = [
  ".esv-product-card",
  ".esv-provenance-evidence article",
  ".esv-experience-pillars article",
];

export default function EsmeraMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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
      if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
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
        threshold: 0.1,
        rootMargin: "0px 0px -6% 0px",
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
