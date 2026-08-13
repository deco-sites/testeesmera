from pathlib import Path
p = Path('scripts/ci/product-modal-media-fidelity.mjs')
s = p.read_text()
s = s.replace('desktopFrame.locator(".esv-product-modal-image.is-active img")', 'desktopFrame.locator(".esv-product-modal-slide.is-active img").first()')
s = s.replace('desktopFrame.locator(".esv-product-modal-image.is-active")', 'desktopFrame.locator(".esv-product-modal-slide.is-active .esv-product-modal-image").first()')
p.write_text(s)
