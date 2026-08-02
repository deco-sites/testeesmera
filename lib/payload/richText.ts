type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

function collect(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  const content = (node.children ?? []).map(collect).join("");
  return ["paragraph", "heading", "listitem"].includes(node.type ?? "")
    ? `${content}\n`
    : content;
}

export function lexicalToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const root = (value as { root?: LexicalNode }).root ?? value as LexicalNode;
  return collect(root).replace(/\n{3,}/g, "\n\n").trim();
}
