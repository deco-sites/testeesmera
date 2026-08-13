from pathlib import Path

modal_path = Path("islands/ProductModal.tsx")
modal = modal_path.read_text()
old = '                      fetchPriority={plateIndex === 0 ? "high" : "auto"}\n'
new = '                      {...{\n                        fetchPriority: plateIndex === 0 ? "high" : "auto",\n                      }}\n'
if old not in modal:
    raise SystemExit("fetchPriority JSX anchor not found")
modal_path.write_text(modal.replace(old, new, 1))

contract_path = Path("tests/product/product_modal_contract_test.ts")
contract = contract_path.read_text()
old_assert = '  assertStringIncludes(modal, \'fetchPriority={plateIndex === 0 ? "high" : "auto"}\');\n'
new_assert = '  assertStringIncludes(modal, \'fetchPriority: plateIndex === 0 ? "high" : "auto"\');\n'
if old_assert not in contract:
    raise SystemExit("fetchPriority test anchor not found")
contract_path.write_text(contract.replace(old_assert, new_assert, 1))
