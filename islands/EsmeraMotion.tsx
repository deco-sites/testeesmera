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
  ".esv-provenance-head",
  ".esv-provenance-evidence article",
  ".esv-provenance-strip",
  ".esv-context-copy",
  ".esv-experience-main",
  ".esv-experience-copy",
  ".esv-experience-pillars article",
  ".esv-private-grid",
];

export default function EsmeraMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      root.classList.add("esv-reduced-motion");
      return;
    }

    root.classList.add("esv-motion-ready");

    const elements = revealSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector))
    );

    elements.forEach((element) => {
      element.classList.add("esv-reveal");

      const parent = element.parentElement;
      if (!parent) return;

      const siblings = Array.from(parent.children).filter((child) =>
        child instanceof HTMLElement && revealSelectors.some((selector) => child.matches(selector))
      );
      const index = siblings.indexOf(element);
      if (index > 0) {
        element.style.setProperty("--esv-reveal-delay", `${Math.min(index * 70, 210)}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("esv-motion-ready");
    };
  }, []);

  return null;
}
