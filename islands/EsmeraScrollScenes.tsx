import { useEffect } from "preact/hooks";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const px = (value: number) => `${value.toFixed(2)}px`;

/**
 * Motion constitution:
 * - this coordinator may animate transforms/opacity only;
 * - it must not redefine consolidated section layout, grid, spacing or flow;
 * - Maison and Matter keep their established visual composition and receive
 *   only lightweight scroll response on top of it.
 */
export default function EsmeraScrollScenes() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = globalThis.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      root.classList.add("esv-motion-reduced");
      return () => root.classList.remove("esv-motion-reduced");
    }

    const hero = document.querySelector<HTMLElement>(
      '[data-motion-scene="hero"]',
    );
    const maison = document.querySelector<HTMLElement>(
      '[data-motion-scene="maison"]',
    );
    const territory = document.querySelector<HTMLElement>(
      '[data-motion-scene="territory-stack"]',
    );
    const interlude = document.querySelector<HTMLElement>(
      '[data-motion-scene="interlude"]',
    );

    const scenes = [hero, maison, territory, interlude].filter(
      (scene): scene is HTMLElement => Boolean(scene),
    );
    if (scenes.length === 0) return;

    const activeScenes = new Set<HTMLElement>();
    let frame = 0;

    const clearMaison = () => {
      maison?.style.removeProperty("--esv-maison-main-y");
      maison?.style.removeProperty("--esv-maison-secondary-y");
      maison?.style.removeProperty("--esv-maison-main-clip");
      maison?.style.removeProperty("--esv-maison-secondary-clip");
    };

    const clearTerritory = () => {
      territory?.querySelectorAll<HTMLElement>(".esv-territory-panel").forEach(
        (panel) => {
          panel.style.removeProperty("--esv-territory-scale");
          panel.style.removeProperty("--esv-territory-dim");
          panel.classList.remove("is-active");
        },
      );
    };

    const clearInterlude = () => {
      interlude?.style.removeProperty("--esv-interlude-y");
      interlude?.style.removeProperty("--esv-interlude-scale");
    };

    const updateHero = () => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const viewport = Math.max(globalThis.innerHeight || 1, 1);
      const progress = clamp(-rect.top / Math.max(rect.height, 1));
      hero.style.setProperty("--esv-hero-y", px(-viewport * .035 * progress));
    };

    const updateMaison = () => {
      if (!maison) return;
      if ((globalThis.innerWidth || 0) <= 767) {
        clearMaison();
        return;
      }

      const rect = maison.getBoundingClientRect();
      const viewport = Math.max(globalThis.innerHeight || 1, 1);
      const progress = clamp(
        (viewport - rect.top) / Math.max(viewport + rect.height, 1),
      );

      // Zero displacement near the section's visual midpoint. The original
      // grid, sizing and absolute image placement remain untouched.
      const mainY = 12 - 24 * progress;
      const secondaryY = 28 - 56 * progress;

      maison.style.setProperty("--esv-maison-main-y", px(mainY));
      maison.style.setProperty("--esv-maison-secondary-y", px(secondaryY));
      maison.style.setProperty("--esv-maison-main-clip", "0%");
      maison.style.setProperty("--esv-maison-secondary-clip", "0%");
    };

    const updateTerritory = () => {
      if (!territory) return;
      const panels = Array.from(
        territory.querySelectorAll<HTMLElement>(".esv-territory-panel"),
      );
      if (panels.length === 0) return;

      if ((globalThis.innerWidth || 0) <= 767) {
        clearTerritory();
        return;
      }

      const viewport = Math.max(globalThis.innerHeight || 1, 1);
      const viewportCenter = viewport * .5;

      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const panelCenter = rect.top + rect.height * .5;
        const distance = Math.abs(panelCenter - viewportCenter);
        const proximity = 1 - clamp(distance / Math.max(viewport * .85, 1));

        // At most 0.8% scale: interaction without changing the established
        // three-column composition or image crop.
        panel.style.setProperty(
          "--esv-territory-scale",
          (1 + proximity * .008).toFixed(4),
        );
      });
    };

    const updateInterlude = () => {
      if (!interlude) return;
      if ((globalThis.innerWidth || 0) <= 767) {
        clearInterlude();
        return;
      }

      const rect = interlude.getBoundingClientRect();
      const viewport = Math.max(globalThis.innerHeight || 1, 1);
      const progress = clamp(
        (viewport - rect.top) / Math.max(viewport + rect.height, 1),
      );
      const y = viewport * .03 - viewport * .06 * progress;
      const scale = 1.035 - .035 * progress;

      interlude.style.setProperty("--esv-interlude-y", px(y));
      interlude.style.setProperty(
        "--esv-interlude-scale",
        scale.toFixed(4),
      );
    };

    const update = () => {
      frame = 0;
      if (hero && activeScenes.has(hero)) updateHero();
      if (maison && activeScenes.has(maison)) updateMaison();
      if (territory && activeScenes.has(territory)) updateTerritory();
      if (interlude && activeScenes.has(interlude)) updateInterlude();
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const observer = "IntersectionObserver" in globalThis
      ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const scene = entry.target as HTMLElement;
            if (entry.isIntersecting) activeScenes.add(scene);
            else activeScenes.delete(scene);
          });
          schedule();
        },
        { threshold: 0, rootMargin: "40% 0px 40% 0px" },
      )
      : null;

    if (observer) scenes.forEach((scene) => observer.observe(scene));
    else scenes.forEach((scene) => activeScenes.add(scene));

    root.classList.add("esv-scenes-ready");
    globalThis.addEventListener("scroll", schedule, { passive: true });
    globalThis.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      globalThis.removeEventListener("scroll", schedule);
      globalThis.removeEventListener("resize", schedule);
      root.classList.remove("esv-scenes-ready");
      hero?.style.removeProperty("--esv-hero-y");
      clearMaison();
      clearTerritory();
      clearInterlude();
    };
  }, []);

  return null;
}
