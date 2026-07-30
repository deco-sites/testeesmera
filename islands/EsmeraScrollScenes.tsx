import { useEffect } from "preact/hooks";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const px = (value: number) => `${value.toFixed(2)}px`;

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

    const headerHeight = () => {
      const value = Number.parseFloat(
        getComputedStyle(root).getPropertyValue("--header-h"),
      );
      return Number.isFinite(value) ? value : 60;
    };

    const clearMaison = () => {
      if (!maison) return;
      maison.style.removeProperty("--esv-maison-main-y");
      maison.style.removeProperty("--esv-maison-secondary-y");
      maison.style.removeProperty("--esv-maison-main-clip");
      maison.style.removeProperty("--esv-maison-secondary-clip");
    };

    const clearTerritory = () => {
      if (!territory) return;
      territory.querySelectorAll<HTMLElement>(".esv-territory-panel").forEach(
        (panel) => {
          panel.style.removeProperty("--esv-territory-scale");
          panel.style.removeProperty("--esv-territory-dim");
          panel.classList.remove("is-active");
        },
      );
    };

    const clearInterlude = () => {
      if (!interlude) return;
      interlude.style.removeProperty("--esv-interlude-y");
      interlude.style.removeProperty("--esv-interlude-scale");
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
      const header = headerHeight();
      const stickyViewport = Math.max(viewport - header, 1);
      const travel = Math.max(rect.height - stickyViewport, 1);
      const progress = clamp((header - rect.top) / travel);

      const mainStart = Math.min(viewport * .03, 30);
      const mainEnd = -Math.min(viewport * .01, 10);
      const secondaryStart = Math.min(viewport * .08, 76);
      const secondaryEnd = -Math.min(viewport * .02, 20);

      const mainY = mainStart + (mainEnd - mainStart) * progress;
      const secondaryY = secondaryStart +
        (secondaryEnd - secondaryStart) * progress;
      const mainClip = 10 * (1 - progress);
      const secondaryClip = 15 * (1 - progress);

      maison.style.setProperty("--esv-maison-main-y", px(mainY));
      maison.style.setProperty("--esv-maison-secondary-y", px(secondaryY));
      maison.style.setProperty(
        "--esv-maison-main-clip",
        `${mainClip.toFixed(2)}%`,
      );
      maison.style.setProperty(
        "--esv-maison-secondary-clip",
        `${secondaryClip.toFixed(2)}%`,
      );
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
      const header = headerHeight();
      let activeIndex = 0;

      panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        if (rect.top <= header + viewport * .52) activeIndex = index;

        const next = panels[index + 1];
        const cover = next
          ? clamp(
            (viewport - next.getBoundingClientRect().top) /
              Math.max(viewport - header, 1),
          )
          : 0;

        panel.style.setProperty(
          "--esv-territory-scale",
          (1.02 - .02 * cover).toFixed(4),
        );
        panel.style.setProperty(
          "--esv-territory-dim",
          (.28 * cover).toFixed(3),
        );
      });

      panels.forEach((panel, index) =>
        panel.classList.toggle("is-active", index === activeIndex)
      );
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
        { threshold: 0, rootMargin: "50% 0px 50% 0px" },
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
