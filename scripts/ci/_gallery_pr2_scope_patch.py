from pathlib import Path

p = Path("scripts/ci/product-modal-media-fidelity.mjs")
s = p.read_text()

anchor = '''  await openFixture(desktop, fixtures.singleLandscape);'''
assert anchor in s
s = s.replace(anchor, '''  const desktopFrame = desktop.locator(".esv-product-modal-gallery-frame.is-desktop");

  await openFixture(desktop, fixtures.singleLandscape);''', 1)

replacements = {
    'desktop.locator(".esv-product-modal-slide").first()': 'desktopFrame.locator(".esv-product-modal-slide").first()',
    'desktop.locator(".esv-product-modal-gallery img").first()': 'desktopFrame.locator(".esv-product-modal-gallery img").first()',
    'desktop.locator(".esv-product-modal-gallery img")': 'desktopFrame.locator(".esv-product-modal-gallery img")',
    'desktop.locator(".esv-product-modal-slide")': 'desktopFrame.locator(".esv-product-modal-slide")',
    'desktop.locator(".esv-product-modal-image.is-active img")': 'desktopFrame.locator(".esv-product-modal-image.is-active img")',
    'desktop.getByRole("button", { name: "Próximo slide da galeria" })': 'desktopFrame.getByRole("button", { name: "Próximo slide da galeria" })',
    'desktop.locator(".esv-product-modal-image").count()': 'desktopFrame.locator(".esv-product-modal-image").count()',
    'desktop.locator(".esv-product-modal-image.is-active")': 'desktopFrame.locator(".esv-product-modal-image.is-active")',
}
for old, new in replacements.items():
    s = s.replace(old, new)

s = s.replace(
    '''  await desktop.waitForFunction(() =>
    document.querySelector(".esv-product-modal-gallery-controls span")?.textContent?.trim() === "02 / 02"
  );''',
    '''  await desktopFrame.locator(".esv-product-modal-gallery-controls span").waitFor({ state: "visible" });
  await desktopFrame.locator(".esv-product-modal-gallery-controls span").filter({ hasText: "02 / 02" }).waitFor();''',
)

anchor = '''  const mobileGallery = mobile.locator(".esv-product-modal-gallery");'''
assert anchor in s
s = s.replace(anchor, '''  const mobileFrame = mobile.locator(".esv-product-modal-gallery-frame.is-compact");
  const mobileGallery = mobileFrame.locator(".esv-product-modal-gallery");''', 1)
s = s.replace(
    '''  await mobile.waitForFunction(() =>
    document.querySelector(".esv-product-modal-gallery-mobile-counter")?.textContent?.trim() === "02 / 02"
  );''',
    '''  await mobileFrame.locator(".esv-product-modal-gallery-mobile-counter").filter({ hasText: "02 / 02" }).waitFor();''',
)

p.write_text(s)
