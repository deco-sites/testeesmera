from pathlib import Path

OLD_REV = "2026-08-12-gallery-behavior-v24"
NEW_REV = "2026-08-12-gallery-hardening-v25"

css_path = Path("static/esmera-product-modal.css")
css = css_path.read_text()

# Recommendation media belongs to the modal contract too: never crop.
old_related = '''.esv-product-modal-related-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 260ms var(--ease-esmera);
}'''
new_related = old_related.replace("object-fit: cover;", "object-fit: contain;")
if old_related not in css:
    raise SystemExit("related media block not found")
css = css.replace(old_related, new_related, 1)

# The footer owns sticky positioning; the button must not create a second sticky layer.
css = css.replace(
'''  appearance: none;
  position: sticky;
  z-index: 4;
  bottom: 0;
  display: flex;''',
'''  appearance: none;
  display: flex;''',
1,
)

# These scrollbar declarations are inert because the inner buybox area is not the scroll owner.
css = css.replace(
'''  overflow-y: visible;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}''',
'''  overflow-y: visible;
  overscroll-behavior: contain;
}''',
1,
)

# Base gallery already owns height/min-height; remove the duplicate compact block.
css = css.replace(
'''  .esv-product-modal-gallery {
    height: 100%;
    min-height: 0;
  }

''',
'',
1,
)
css_path.write_text(css)

# Bump shared storefront revision everywhere that deliberately asserts it.
for filename in [
    "routes/_app.tsx",
    "tests/product/product_modal_cache_contract_test.ts",
    "tests/esmera/product_card_css_test.ts",
    "scripts/ci/product-modal-media-fidelity.mjs",
]:
    path = Path(filename)
    text = path.read_text()
    if OLD_REV not in text:
        raise SystemExit(f"revision anchor missing in {filename}")
    path.write_text(text.replace(OLD_REV, NEW_REV))

contract_path = Path("tests/product/product_modal_contract_test.ts")
contract = contract_path.read_text()
anchor = '  assertFalse(css.includes("!important"));\n'
addition = '''  assertFalse(css.includes("!important"));
  assertFalse(css.includes("object-fit: cover"));
  assertFalse(css.includes("is-two-stage"));
  assertFalse(css.includes("is-double"));
  assertFalse(css.includes("is-multiple"));
  assertFalse(css.includes("esv-product-modal-empty-cell"));
  assertStringIncludes(
    css,
    "grid-template-columns: repeat(2, minmax(0, 1fr));",
  );
  assertFalse(modal.includes("gallerySize"));
  assertFalse(modal.includes("galleryFrameRef"));
  assertFalse(modal.includes("ResizeObserver"));
'''
if anchor not in contract:
    raise SystemExit("hardening test anchor not found")
contract_path.write_text(contract.replace(anchor, addition, 1))
