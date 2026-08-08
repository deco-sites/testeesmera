import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { NavigationNode } from "../lib/payload/navigation.ts";

type CreatePortal = typeof import("preact/compat").createPortal;

export interface Props {
  items: NavigationNode[];
  whatsappHref?: string;
  instagramHref?: string;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function Chevron({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
      <path
        d={direction === "right" ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"}
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.35"
      />
    </svg>
  );
}

function MenuGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M3 7.5h18M3 16.5h18"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.4"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M5 5l14 14M19 5 5 19"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.35"
      />
    </svg>
  );
}

function findNode(items: NavigationNode[], id: string): NavigationNode | null {
  for (const item of items) {
    if (item.id === id) return item;
    const nested = findNode(item.children, id);
    if (nested) return nested;
  }
  return null;
}

function filterByVisibility(
  items: NavigationNode[],
  mode: "desktop" | "mobile",
): NavigationNode[] {
  return items.flatMap((item) => {
    if (item.visibility !== "both" && item.visibility !== mode) return [];
    return [{
      ...item,
      children: filterByVisibility(item.children, mode),
    }];
  });
}

function openHeaderControl(selector: string) {
  const control = document.querySelector<HTMLButtonElement>(selector);
  control?.click();
}

function normalizedPath(value: string): string {
  if (!value) return "/";
  const path = value.split(/[?#]/, 1)[0] || "/";
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

function isCurrentPath(href: string, pathname: string): boolean {
  if (!href || href.startsWith("#") || /^[a-z]+:/i.test(href)) return false;
  const target = normalizedPath(href);
  const current = normalizedPath(pathname);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

export default function DynamicMenu(
  { items, whatsappHref = "", instagramHref = "" }: Props,
) {
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const [pathname, setPathname] = useState("");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [createPortalFn, setCreatePortalFn] = useState<CreatePortal | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const desktopItems = useMemo(
    () => filterByVisibility(items, "desktop"),
    [items],
  );
  const mobileRootItems = useMemo(
    () => filterByVisibility(items, "mobile"),
    [items],
  );
  const activeDesktop = useMemo(
    () => desktopItems.find((item) => item.id === desktopOpen) ?? null,
    [desktopItems, desktopOpen],
  );
  const activeMobile = path.length > 0
    ? findNode(mobileRootItems, path[path.length - 1])
    : null;
  const mobileItems = activeMobile?.children ?? mobileRootItems;

  const cancelDesktopOpen = () => {
    if (openTimer.current) globalThis.clearTimeout(openTimer.current);
    openTimer.current = null;
  };
  const scheduleDesktopOpen = (id: string, pointerType: string) => {
    if (pointerType !== "mouse") return;
    cancelDesktopOpen();
    openTimer.current = globalThis.setTimeout(() => {
      setDesktopOpen(id);
      openTimer.current = null;
    }, 120);
  };
  const scheduleDesktopClose = () => {
    if (closeTimer.current) globalThis.clearTimeout(closeTimer.current);
    closeTimer.current = globalThis.setTimeout(() => setDesktopOpen(null), 140);
  };
  const cancelDesktopClose = () => {
    if (closeTimer.current) globalThis.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  useEffect(() => {
    let active = true;
    const syncPath = () => setPathname(globalThis.location.pathname);
    syncPath();
    globalThis.addEventListener("popstate", syncPath);
    void import("preact/compat").then(({ createPortal }) => {
      if (!active) return;
      setCreatePortalFn(() => createPortal);
      setPortalRoot(document.body);
    });
    return () => {
      active = false;
      globalThis.removeEventListener("popstate", syncPath);
    };
  }, []);

  useEffect(() => () => {
    cancelDesktopOpen();
    cancelDesktopClose();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = globalThis.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        .filter((element) => element.offsetParent !== null);
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusables();
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      globalThis.removeEventListener("keydown", onKeyDown);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      globalThis.scrollTo({ top: scrollY, behavior: "auto" });
      triggerRef.current?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) setPath([]);
  }, [mobileOpen]);

  useEffect(() => {
    const closeDesktop = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      cancelDesktopOpen();
      cancelDesktopClose();
      setDesktopOpen(null);
    };
    globalThis.addEventListener("keydown", closeDesktop);
    return () => globalThis.removeEventListener("keydown", closeDesktop);
  }, []);

  const mega = portalRoot && createPortalFn && activeDesktop &&
      activeDesktop.children.length > 0
    ? createPortalFn(
      <>
        <div class="esv-mega-backdrop" aria-hidden="true" />
        <div
          key={activeDesktop.id}
          class="esv-mega-v2"
          onPointerEnter={cancelDesktopClose}
          onPointerLeave={scheduleDesktopClose}
        >
          <div class="esv-mega-v2-inner">
            <div class="esv-mega-v2-heading">
              <p class="esv-kicker">{activeDesktop.label}</p>
              {activeDesktop.description && <p>{activeDesktop.description}</p>}
              {activeDesktop.href && (
                <a href={activeDesktop.href}>Ver tudo <span>↗</span></a>
              )}
            </div>
            <div class="esv-mega-v2-columns">
              {activeDesktop.children.map((group, index) => (
                <div
                  class="esv-mega-v2-column"
                  key={group.id}
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <a
                    class="esv-mega-v2-column-title"
                    href={group.href || undefined}
                    target={group.external ? "_blank" : undefined}
                    rel={group.external ? "noopener noreferrer" : undefined}
                  >
                    {group.label}
                  </a>
                  {group.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href || undefined}
                      target={child.external ? "_blank" : undefined}
                      rel={child.external ? "noopener noreferrer" : undefined}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            {(activeDesktop.highlights.length > 0 || activeDesktop.image) && (
              <div class="esv-mega-v2-editorial">
                {activeDesktop.highlights.slice(0, 1).map((highlight) => (
                  <a
                    key={highlight.title}
                    href={highlight.href || activeDesktop.href || undefined}
                    target={highlight.external ? "_blank" : undefined}
                    rel={highlight.external ? "noopener noreferrer" : undefined}
                  >
                    {highlight.image && (
                      <img src={highlight.image} alt={highlight.alt ?? ""} />
                    )}
                    <strong>{highlight.title}</strong>
                    {highlight.copy && <span>{highlight.copy}</span>}
                  </a>
                ))}
                {activeDesktop.highlights.length === 0 && activeDesktop.image && (
                  <a href={activeDesktop.href || undefined}>
                    <img
                      src={activeDesktop.image.url}
                      alt={activeDesktop.image.alt}
                    />
                    <strong>{activeDesktop.label}</strong>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </>,
      portalRoot,
    )
    : null;

  const drawer = portalRoot && createPortalFn && mobileOpen
    ? createPortalFn(
      <div class="esv-nav-v2-backdrop" onClick={() => setMobileOpen(false)}>
        <aside
          ref={drawerRef}
          class="esv-nav-v2-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          onClick={(event) => event.stopPropagation()}
        >
          <header class="esv-nav-v2-drawer-header">
            {activeMobile
              ? (
                <button
                  type="button"
                  class="esv-nav-v2-back"
                  onClick={() => setPath((current) => current.slice(0, -1))}
                >
                  <Chevron direction="left" /> Voltar
                </button>
              )
              : <span class="esv-nav-v2-drawer-title">Menu</span>}
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              <CloseGlyph />
            </button>
          </header>

          <div class="esv-nav-v2-mobile-level">
            {activeMobile && (
              <div class="esv-nav-v2-level-heading">
                <p class="esv-kicker">{activeMobile.label}</p>
                {activeMobile.description && <p>{activeMobile.description}</p>}
                {activeMobile.href && <a href={activeMobile.href}>Ver tudo</a>}
              </div>
            )}
            <div class="esv-nav-v2-mobile-links">
              {mobileItems.map((item) => (
                <div class="esv-nav-v2-mobile-row" key={item.id}>
                  <a
                    href={item.href || undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    aria-current={!item.external && isCurrentPath(item.href, pathname)
                      ? "page"
                      : undefined}
                    onClick={() => item.children.length === 0 && setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                  {item.children.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Abrir ${item.label}`}
                      onClick={() => setPath((current) => [...current, item.id])}
                    >
                      <Chevron />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer class="esv-nav-v2-drawer-footer">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                globalThis.setTimeout(
                  () => openHeaderControl(".esv-search-trigger"),
                  0,
                );
              }}
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                globalThis.setTimeout(
                  () => openHeaderControl(".esv-cart-link"),
                  0,
                );
              }}
            >
              Carrinho
            </button>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
            {instagramHref && (
              <a href={instagramHref} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
          </footer>
        </aside>
      </div>,
      portalRoot,
    )
    : null;

  return (
    <>
      <div class="esv-nav-v2-root">
        <nav
          class="esv-nav-v2-desktop"
          aria-label="Navegação principal"
          onPointerEnter={cancelDesktopClose}
          onPointerLeave={scheduleDesktopClose}
          onFocusIn={cancelDesktopClose}
          onFocusOut={(event) => {
            const next = event.relatedTarget as Node | null;
            if (!event.currentTarget.contains(next)) scheduleDesktopClose();
          }}
        >
          {desktopItems.map((item) => (
            <a
              key={item.id}
              class="esv-nav-v2-root-link"
              href={item.href || undefined}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-haspopup={item.children.length > 0 ? "true" : undefined}
              aria-expanded={item.children.length > 0
                ? desktopOpen === item.id
                : undefined}
              aria-current={!item.external && isCurrentPath(item.href, pathname)
                ? "page"
                : undefined}
              onPointerEnter={(event) => {
                cancelDesktopClose();
                if (item.children.length > 0) {
                  scheduleDesktopOpen(item.id, event.pointerType);
                } else {
                  cancelDesktopOpen();
                  scheduleDesktopClose();
                }
              }}
              onPointerLeave={cancelDesktopOpen}
              onFocus={() => {
                cancelDesktopOpen();
                if (item.children.length > 0) setDesktopOpen(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          ref={triggerRef}
          class="esv-nav-v2-mobile-trigger"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <MenuGlyph />
        </button>
      </div>
      {mega}
      {drawer}
    </>
  );
}
