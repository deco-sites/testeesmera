import { useEffect, useRef } from "preact/hooks";

export interface MatterPanel {
  /** @format image-uri */
  image: string;
  alt: string;
  caption?: string;
}

export interface Props {
  eyebrow: string;
  title: string;
  text: string;
  panels: MatterPanel[];
}

export default function SpatialMatter({
  eyebrow,
  title,
  text,
  panels,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = globalThis.matchMedia("(min-width: 1024px)");
    const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    if (!media.matches || reduced.matches) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>(".esv-matter-panel"),
    );
    let raf = 0;
    const update = () => {
      raf = 0;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(
            0,
            (globalThis.innerHeight - rect.top) / globalThis.innerHeight,
          ),
        );
        item.style.setProperty("--panel-scale", `${0.985 + progress * 0.015}`);
      });
    };
    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    globalThis.addEventListener("scroll", requestUpdate, { passive: true });
    globalThis.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      globalThis.removeEventListener("scroll", requestUpdate);
      globalThis.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      class="esv-matter"
      aria-labelledby="esv-matter-title"
    >
      <div class="esv-shell esv-matter-intro">
        <p class="esv-kicker esv-kicker-light">{eyebrow}</p>
        <h2 id="esv-matter-title">{title}</h2>
        <p>{text}</p>
      </div>
      <div class="esv-matter-stack">
        {panels.map((panel, index) => (
          <figure
            class="esv-matter-panel"
            style={{ "--panel-index": index }}
          >
            <img
              src={panel.image}
              alt={panel.alt}
              loading="lazy"
              decoding="async"
              width="2200"
              height="1500"
            />
            <div class="esv-matter-panel-shade" />
            <figcaption>
              <span>0{index + 1}</span>
              <span>{panel.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
