from pathlib import Path
p = Path('scripts/ci/editorial-modal-smoke.mjs')
s = p.read_text()
old = '''    await page.keyboard.press("Escape");
    await page.waitForSelector(".esv-product-viewer", { state: "detached" });
    await page.waitForSelector(".esv-product-modal", { state: "visible" });'''
new = '''    await page.getByRole("button", { name: "Fechar visualizador" }).click();
    await page.waitForSelector(".esv-product-viewer", { state: "detached" });
    await page.waitForSelector(".esv-product-modal", { state: "visible" });'''
assert old in s
p.write_text(s.replace(old, new, 1))
