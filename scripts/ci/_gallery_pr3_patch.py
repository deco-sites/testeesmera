from pathlib import Path

modal_path = Path('islands/ProductModal.tsx')
s = modal_path.read_text()

s = s.replace('''import {\n  buildGallerySlides,\n  calculateGalleryFrameRatio,\n  type GallerySlide,\n} from "../lib/esmera/productMediaPresentation.ts";''', '''import {\n  buildGalleryPlates,\n  mediaAspectRatio,\n  orderGalleryMedia,\n  type GalleryPlate,\n} from "../lib/esmera/gallery.ts";''')

s = s.replace('''interface ProductModalImage {\n  src: string;\n  fullSrc?: string;\n  alt: string;\n  width?: number;\n  height?: number;\n  fullWidth?: number;\n  fullHeight?: number;\n}''', '''interface ProductModalImage {\n  src: string;\n  fullSrc?: string;\n  alt: string;\n  key?: string;\n  role?: string;\n  width?: number;\n  height?: number;\n  fullWidth?: number;\n  fullHeight?: number;\n}''')

start = s.index('function toModalImage(')
end = s.index('\nexport function getProductFacts', start)
new_block = '''function toModalImage(\n  media: EsmeraObject["gallery"][number],\n  product: EsmeraObject,\n): ProductModalImage {\n  const src = normalized(media.url);\n  return {\n    src,\n    fullSrc: normalized(media.fullUrl) || src,\n    alt: normalized(media.alt) || `${product.title} — ${media.role}`,\n    key: media.key,\n    role: media.role,\n    width: media.width,\n    height: media.height,\n    fullWidth: media.fullWidth,\n    fullHeight: media.fullHeight,\n  };\n}\n\nexport function getProductModalImages(\n  product: EsmeraObject,\n): ProductModalImage[] {\n  const ordered = orderGalleryMedia(product.gallery);\n  const candidates = ordered.map((media) => toModalImage(media, product));\n\n  if (candidates.length === 0) {\n    const primarySrc = normalized(product.image);\n    candidates.push({\n      src: primarySrc,\n      fullSrc: primarySrc,\n      alt: normalized(product.alt),\n      role: "cover",\n    });\n    if (product.detailImage) {\n      const detailSrc = normalized(product.detailImage);\n      candidates.push({\n        src: detailSrc,\n        fullSrc: detailSrc,\n        alt: `${product.title} — detalhe`,\n        role: "detail",\n      });\n    }\n  }\n\n  const seen = new Set<string>();\n  return candidates.filter((image) => {\n    if (!image.src || seen.has(image.src)) return false;\n    seen.add(image.src);\n    return true;\n  });\n}\n'''
s = s[:start] + new_block + s[end:]

anchor = '''function modalImageSrcSet(image: ProductModalImage): string | undefined {\n  const candidates = [\n    image.width && `${image.src} ${image.width}w`,\n    image.fullWidth && image.fullSrc && image.fullSrc !== image.src &&\n    `${image.fullSrc} ${image.fullWidth}w`,\n  ].filter((candidate): candidate is string => Boolean(candidate));\n  return candidates.length > 1 ? candidates.join(", ") : undefined;\n}\n'''
assert anchor in s
compat = anchor + '''\n// PR 3 keeps the previous frame geometry until PR 4 moves the stage ratio to CSS.\nfunction legacyGalleryFrameRatio(\n  plates: readonly GalleryPlate[],\n  images: readonly ProductModalImage[],\n  view: "desktop" | "compact",\n): number {\n  const minimum = view === "desktop" ? 4 / 5 : 3 / 4;\n  const ratios = plates.map((plate) => {\n    const mediaRatios = plate.indices.map((index) =>\n      mediaAspectRatio(images[index]) ?? 4 / 5\n    );\n    if (plate.columns === 2 || plate.mount === "mounted") {\n      return 2 * Math.min(...mediaRatios);\n    }\n    return mediaRatios[0] ?? 4 / 5;\n  });\n  const raw = ratios.length > 0 ? Math.min(...ratios) : 4 / 5;\n  return Math.min(16 / 9, Math.max(minimum, raw));\n}\n'''
s = s.replace(anchor, compat, 1)

s = s.replace('''interface GalleryFrameProps {\n  view: "desktop" | "compact";\n  slides: GallerySlide[];\n  frameRatio: number;''', '''interface GalleryFrameProps {\n  view: "desktop" | "compact";\n  plates: GalleryPlate[];\n  frameRatio: number;''')
s = s.replace('''  view,\n  slides,\n  frameRatio,''', '''  view,\n  plates,\n  frameRatio,''')
s = s.replace('formatImagePosition(slides.length)', 'formatImagePosition(plates.length)')
s = s.replace('(activeIndex + delta + slides.length) % slides.length', '(activeIndex + delta + plates.length) % plates.length')
s = s.replace('{slides.map((slide, slideIndex) => (', '{plates.map((plate, plateIndex) => {\n          const pairPresentation = plate.columns === 2 || plate.mount === "mounted";\n          return (')
s = s.replace('''            class={`esv-product-modal-slide is-${slide.kind}${\n              slideIndex === activeIndex ? " is-active" : ""\n            }`}\n            data-gallery-index={slideIndex}\n            key={`${slide.kind}-${slide.indices.join("-")}`}''', '''            class={`esv-product-modal-slide is-${\n              pairPresentation ? "pair" : "single"\n            }${plateIndex === activeIndex ? " is-active" : ""}`}\n            data-gallery-index={plateIndex}\n            key={`${plate.mount}-${plate.indices.join("-")}`}''')
s = s.replace('{slide.indices.map((imageIndex) => {', '{plate.indices.map((imageIndex) => {')
s = s.replace('sizes={slide.kind === "pair"', 'sizes={pairPresentation')
s = s.replace('''            {slide.kind === "pair" && slide.indices.length === 1 && (\n              <div class="esv-product-modal-empty-cell" aria-hidden="true" />\n            )}\n          </div>\n        ))}\n\n        {slides.length > 1 && (''', '''            {plate.mount === "mounted" && (\n              <div class="esv-product-modal-empty-cell" aria-hidden="true" />\n            )}\n          </div>\n          );\n        })}\n\n        {plates.length > 1 && (''')
s = s.replace('{slides.length > 1 && (', '{plates.length > 1 && (')

s = s.replace('''  const desktopSlides = useMemo(\n    () => buildGallerySlides(images, "desktop"),\n    [images],\n  );\n  const compactSlides = useMemo(\n    () => buildGallerySlides(images, "compact"),\n    [images],\n  );\n  const desktopFrameRatio = useMemo(\n    () => calculateGalleryFrameRatio(desktopSlides, "desktop"),\n    [desktopSlides],\n  );\n  const compactFrameRatio = useMemo(\n    () => calculateGalleryFrameRatio(compactSlides, "compact"),\n    [compactSlides],\n  );''', '''  const desktopPlates = useMemo(\n    () => buildGalleryPlates(images, "editorial"),\n    [images],\n  );\n  const compactPlates = useMemo(\n    () => buildGalleryPlates(images, "compact"),\n    [images],\n  );\n  const desktopFrameRatio = useMemo(\n    () => legacyGalleryFrameRatio(desktopPlates, images, "desktop"),\n    [desktopPlates, images],\n  );\n  const compactFrameRatio = useMemo(\n    () => legacyGalleryFrameRatio(compactPlates, images, "compact"),\n    [compactPlates, images],\n  );''')
s = s.replace('slides={desktopSlides}', 'plates={desktopPlates}')
s = s.replace('slides={compactSlides}', 'plates={compactPlates}')

modal_path.write_text(s)

# Align the modal contract fixtures with the gallery-as-source-of-truth contract.
test_path = Path('tests/product/product_modal_contract_test.ts')
t = test_path.read_text().replace('https://origin.example.com/object-cover.jpg', 'https://cdn.example.com/object-cover.jpg')

t = t.replace('''      {\n        url: context,\n        alt: "Objeto I em contexto",\n        key: "context",\n        role: "context",\n      },''', '''      {\n        url: detail,\n        alt: "Detalhe do Objeto I",\n        key: "detail",\n        role: "detail",\n      },\n      {\n        url: context,\n        alt: "Objeto I em contexto",\n        key: "context",\n        role: "context",\n      },''', 1)

t = t.replace('''      {\n        url: "https://cdn.example.com/object-detail-2.jpg",\n        alt: "Outro detalhe",\n        key: "detail-2",\n        role: "detail",\n      },''', '''      {\n        url: "https://cdn.example.com/object-detail.jpg",\n        alt: "Detalhe principal",\n        key: "detail-1",\n        role: "detail",\n      },\n      {\n        url: "https://cdn.example.com/object-detail-2.jpg",\n        alt: "Outro detalhe",\n        key: "detail-2",\n        role: "detail",\n      },''', 1)

t = t.replace('assertStringIncludes(modal, "buildGallerySlides");', 'assertStringIncludes(modal, "buildGalleryPlates");')
t = t.replace('assertStringIncludes(modal, "calculateGalleryFrameRatio");', 'assertStringIncludes(modal, "orderGalleryMedia");')
t = t.replace('assertStringIncludes(modal, "slide.indices.map");', 'assertStringIncludes(modal, "plate.indices.map");')

test_path.write_text(t)
