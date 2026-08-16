import type { Handlers } from "$fresh/server.ts";
import { getPayloadBaseURL } from "../../lib/payload/client.ts";

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Proxy same-origin para o formulário de WhatsApp do rodapé, mesmo padrão de
 * esmera-reserve.ts: mantém a chamada na mesma origem (sem CORS) e concentra
 * a URL do CMS no servidor.
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

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (!PHONE_PATTERN.test(phone)) {
      return Response.json({
        error: { code: "invalid_request", message: "Telefone inválido." },
      }, {
        status: 400,
        headers: { "cache-control": "no-store" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const upstream = await fetch(
        new URL("/api/storefront/leads", getPayloadBaseURL()),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ phone }),
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
          code: "lead_unavailable",
          message: "Não foi possível enviar agora.",
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
