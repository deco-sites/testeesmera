import { useEffect } from "preact/hooks";

const fallbackRevealSelectors = [
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

const legacyStaggerSelectors = [".esv-product-card"];

export default function EsmeraMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in globalThis)) return;

    const declared = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-motion="reveal"], [data-motion="media-reveal"]',
      ),
    );

    const fallback = fallbackRevealSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
        (element) =>
          !element.matches("[data-motion]") &&
          !element.querySelector("[data-motion]"),
      )
    );

    const elements = Array.from(new Set([...declared, ...fallback]));
    if (elements.length === 0) return;

    elements.forEach((element) => {
      element.classList.add("esv-reveal");
      if (element.dataset.motion === "media-reveal") {
        element.classList.add("esv-reveal-media");
      }

      const order = Number.parseInt(element.dataset.motionOrder ?? "", 10);
      if (Number.isFinite(order)) {
        element.style.setProperty(
          "--esv-reveal-delay",
          `${Math.min(Math.max(order, 0) * 55, 275)}ms`,
        );
      }
    });

    legacyStaggerSelectors.forEach((selector) => {
      const groups = new Map<Element, HTMLElement[]>();
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (element.matches("[data-motion]") || element.querySelector("[data-motion]")) {
          return;
        }
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
        element.classList.remove("esv-reveal", "esv-reveal-media", "is-visible");
        element.style.removeProperty("--esv-reveal-delay");
      });
    };
  }, []);

  return null;
}
