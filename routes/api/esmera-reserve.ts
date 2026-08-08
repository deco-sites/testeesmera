import type { Handlers } from "$fresh/server.ts";
import { getPayloadBaseURL } from "../../lib/payload/client.ts";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,120}$/;

/**
 * Proxy same-origin para a reserva transacional do backend (plano §16).
 * Mantém a chamada de COMPRAR na mesma origem (sem CORS) e concentra a URL do
 * CMS no servidor.
 */
export const handler: Handlers = {
  async POST(req) {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({
        error: { code: "invalid_request", message: "Corpo inválido." },
      }, {
        status: 400,
        headers: { "cache-control": "no-store" },
      });
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const idempotencyKey = typeof body.idempotencyKey === "string"
      ? body.idempotencyKey.trim()
      : "";
    if (!SLUG_PATTERN.test(slug) || !KEY_PATTERN.test(idempotencyKey)) {
      return Response.json({
        error: { code: "invalid_request", message: "Requisição inválida." },
      }, {
        status: 400,
        headers: { "cache-control": "no-store" },
      });
    }

    const payload = {
      idempotencyKey,
      variantSku: typeof body.variantSku === "string"
        ? body.variantSku
        : undefined,
      buyerRef: typeof body.buyerRef === "string" ? body.buyerRef : undefined,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const upstream = await fetch(
        new URL(
          `/api/storefront/products/${slug}/reserve`,
          getPayloadBaseURL(),
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          "content-type": upstream.headers.get("content-type") ??
            "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    } catch {
      return Response.json({
        error: {
          code: "reserve_unavailable",
          message: "Não foi possível reservar agora.",
        },
      }, {
        status: 502,
        headers: { "cache-control": "no-store" },
      });
    } finally {
      clearTimeout(timeout);
    }
  },
};
