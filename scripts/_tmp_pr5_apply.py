from pathlib import Path
import re

REVISION_OLD = "2026-08-12-media-fidelity-modal-v23"
REVISION_NEW = "2026-08-12-gallery-behavior-v24"

modal_path = Path("islands/ProductModal.tsx")
modal = modal_path.read_text()

modal = modal.replace(
'''import {
  buildGalleryPlates,
  type GalleryPlate,
  orderGalleryMedia,
} from "../lib/esmera/gallery.ts";''',
'''import {
  buildGalleryPlates,
  cellSizes,
  type GalleryPlate,
  mediaIndexForKeys,
  orderGalleryMedia,
  plateIndexOfMedia,
  plateLabel,
} from "../lib/esmera/gallery.ts";''',
)

modal = re.sub(
    r'\nfunction formatImagePosition\(value: number\): string \{\n  return String\(value\)\.padStart\(2, "0"\);\n\}\n',
    '\n',
    modal,
    count=1,
)

old_header = '''  const positionLabel = `${formatImagePosition(activeIndex + 1)} / ${
    formatImagePosition(plates.length)
  }`;
  const changeSlide = (delta: number) => {
    onActiveIndexChange(
      (activeIndex + delta + plates.length) % plates.length,
    );
  };

  return (
    <div class={`esv-product-modal-gallery-frame is-${view}`}>'''
new_header = '''  const positionLabel = plateLabel(activeIndex, plates.length);
  const changeSlide = (delta: number) => {
    onActiveIndexChange(
      (activeIndex + delta + plates.length) % plates.length,
    );
  };
  const preloadPlate = (index: number) => {
    if (plates.length === 0 || typeof Image === "undefined") return;
    const normalizedIndex = (index + plates.length) % plates.length;
    const plate = plates[normalizedIndex];
    plate.indices.forEach((imageIndex) => {
      const image = images[imageIndex];
      if (!image?.src) return;
      const preload = new Image();
      const srcSet = modalImageSrcSet(image);
      if (srcSet) preload.srcset = srcSet;
      preload.sizes = cellSizes(plate);
      preload.src = image.src;
    });
  };
  const onGalleryKeyDown = (event: KeyboardEvent) => {
    if (plates.length < 2) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + plates.length) % plates.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (activeIndex + 1) % plates.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = plates.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    onActiveIndexChange(nextIndex);
  };

  return (
    <div
      class={`esv-product-modal-gallery-frame is-${view}`}
      onKeyDown={onGalleryKeyDown}
    >'''
if old_header not in modal:
    raise SystemExit("GalleryFrame header contract not found")
modal = modal.replace(old_header, new_header, 1)

modal = modal.replace(
'''        {plates.map((plate, plateIndex) => {
          const pairPresentation = plate.columns === 2 ||
            plate.mount === "mounted";
          return (''',
'''        {plates.map((plate, plateIndex) => {
          return (''',
1,
)

old_img = '''                      sizes={pairPresentation
                        ? "(min-width: 1024px) 35vw, 100vw"
                        : "(min-width: 1024px) 70vw, 100vw"}
                      alt={image.alt}
                      width={image.width ?? image.fullWidth}
                      height={image.height ?? image.fullHeight}
                      loading={imageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"'''
new_img = '''                      sizes={cellSizes(plate)}
                      alt={image.alt}
                      width={image.width ?? image.fullWidth}
                      height={image.height ?? image.fullHeight}
                      loading={plateIndex === 0 ? "eager" : "lazy"}
                      fetchPriority={plateIndex === 0 ? "high" : "auto"}
                      decoding="async"'''
if old_img not in modal:
    raise SystemExit("image loading/sizes block not found")
modal = modal.replace(old_img, new_img, 1)

modal = modal.replace(
'''              aria-label="Slide anterior da galeria"
              onClick={() => changeSlide(-1)}''',
'''              aria-label="Slide anterior da galeria"
              onPointerEnter={() => preloadPlate(activeIndex - 1)}
              onClick={() => changeSlide(-1)}''',
1,
)
modal = modal.replace(
'''              aria-label="Próximo slide da galeria"
              onClick={() => changeSlide(1)}''',
'''              aria-label="Próximo slide da galeria"
              onPointerEnter={() => preloadPlate(activeIndex + 1)}
              onClick={() => changeSlide(1)}''',
1,
)

viewer_anchor = '''  const closeViewer = () => {
    updateZoomIndex(null);
    globalThis.setTimeout(() => viewerTriggerRef.current?.focus(), 0);
  };
'''
variant_logic = '''  const closeViewer = () => {
    updateZoomIndex(null);
    globalThis.setTimeout(() => viewerTriggerRef.current?.focus(), 0);
  };

  const chooseVariant = (next: EsmeraVariant | undefined) => {
    setSelectedVariant(next);
    if (!next || next.mediaKeys.length === 0) return;
    const mediaIndex = mediaIndexForKeys(images, next.mediaKeys);
    if (mediaIndex < 0) return;

    const desktopIndex = plateIndexOfMedia(desktopPlates, mediaIndex);
    if (desktopIndex >= 0) setActiveDesktopIndex(desktopIndex);

    const compactIndex = plateIndexOfMedia(compactPlates, mediaIndex);
    if (compactIndex < 0) return;
    setActiveCompactIndex(compactIndex);

    if (
      typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia("(max-width: 767px)").matches
    ) {
      requestAnimationFrame(() => {
        const gallery = compactGalleryRef.current;
        if (!gallery) return;
        gallery.scrollTo({
          left: compactIndex * gallery.clientWidth,
          behavior: "smooth",
        });
      });
    }
  };
'''
if viewer_anchor not in modal:
    raise SystemExit("viewer close anchor not found")
modal = modal.replace(viewer_anchor, variant_logic, 1)

old_select = '''                    onChange={(event) =>
                      setSelectedVariant(
                        availableVariants.find((variant) =>
                          variant.sku === event.currentTarget.value
                        ),
                      )}'''
new_select = '''                    onChange={(event) =>
                      chooseVariant(
                        availableVariants.find((variant) =>
                          variant.sku === event.currentTarget.value
                        ),
                      )}'''
if old_select not in modal:
    raise SystemExit("variant select block not found")
modal = modal.replace(old_select, new_select, 1)
modal_path.write_text(modal)

css_path = Path("static/esmera-product-modal.css")
css = css_path.read_text()
active_block = '''.esv-product-modal-slide.is-active {
  visibility: visible;
  pointer-events: auto;
}
'''
crossfade = '''.esv-product-modal-slide.is-active {
  visibility: visible;
  pointer-events: auto;
}

@media (min-width: 1024px) {
  .esv-product-modal-slide {
    opacity: 0;
    transition:
      opacity 240ms cubic-bezier(.4, 0, .2, 1),
      visibility 0s linear 240ms;
  }

  .esv-product-modal-slide.is-active {
    opacity: 1;
    transition-delay: 0s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .esv-product-modal-slide {
    transition: none;
  }
}
'''
if active_block not in css:
    raise SystemExit("active slide CSS anchor not found")
css = css.replace(active_block, crossfade, 1)
css_path.write_text(css)

app_path = Path("routes/_app.tsx")
app = app_path.read_text().replace(REVISION_OLD, REVISION_NEW)
app_path.write_text(app)

cache_path = Path("tests/product/product_modal_cache_contract_test.ts")
cache = cache_path.read_text().replace(REVISION_OLD, REVISION_NEW)
cache_path.write_text(cache)

contract_path = Path("tests/product/product_modal_contract_test.ts")
contract = contract_path.read_text()
needle = '  assertStringIncludes(modal, "orderGalleryMedia");\n'
addition = '''  assertStringIncludes(modal, "orderGalleryMedia");
  assertStringIncludes(modal, "plateLabel(activeIndex, plates.length)");
  assertStringIncludes(modal, "cellSizes(plate)");
  assertStringIncludes(modal, "mediaIndexForKeys(images, next.mediaKeys)");
  assertStringIncludes(modal, "plateIndexOfMedia(desktopPlates, mediaIndex)");
  assertStringIncludes(modal, 'event.key === "ArrowLeft"');
  assertStringIncludes(modal, 'event.key === "ArrowRight"');
  assertStringIncludes(modal, 'event.key === "Home"');
  assertStringIncludes(modal, 'event.key === "End"');
  assertStringIncludes(modal, 'fetchPriority={plateIndex === 0 ? "high" : "auto"}');
  assertFalse(modal.includes("(min-width: 1024px) 35vw, 100vw"));
  assertFalse(modal.includes("(min-width: 1024px) 70vw, 100vw"));
'''
if needle not in contract:
    raise SystemExit("modal contract anchor not found")
contract = contract.replace(needle, addition, 1)
css_needle = '  assertStringIncludes(css, "object-fit: contain");\n'
css_add = '''  assertStringIncludes(css, "object-fit: contain");
  assertStringIncludes(css, "opacity 240ms cubic-bezier(.4, 0, .2, 1)");
  assertStringIncludes(css, "@media (prefers-reduced-motion: reduce)");
'''
if css_needle not in contract:
    raise SystemExit("CSS contract anchor not found")
contract = contract.replace(css_needle, css_add, 1)
contract_path.write_text(contract)

ci_path = Path("scripts/ci/product-modal-media-fidelity.mjs")
ci = ci_path.read_text().replace(REVISION_OLD, REVISION_NEW)
ci = ci.replace('hasText: "02 / 02"', 'hasText: "02 — 02"')
ci_path.write_text(ci)

# Guard against stale fixed presentation strings or old counter in product-modal CI.
for path in [modal_path, ci_path]:
    text = path.read_text()
    if "02 / 02" in text:
        raise SystemExit(f"stale slash counter remains in {path}")
if "35vw, 100vw" in modal_path.read_text() or "70vw, 100vw" in modal_path.read_text():
    raise SystemExit("stale fixed modal sizes remain")
