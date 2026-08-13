from pathlib import Path

old = "2026-08-12-media-fidelity-modal-v23"
new = "2026-08-12-gallery-behavior-v24"
path = Path("tests/esmera/product_card_css_test.ts")
text = path.read_text()
if old not in text:
    raise SystemExit("product card revision contract not found")
path.write_text(text.replace(old, new))
