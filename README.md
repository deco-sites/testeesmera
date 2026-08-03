# Start — deco.cx template 

Welcome to your [deco.cx](https://deco.cx) site!

## Usage

1 - [Install deno](https://docs.deno.com/runtime/manual/getting_started/installation/)

2 - Create the local environment file

```sh
cp .env.example .env
```

3 - Run the command

```sh
deno task start
```

This will install all dependencies and start your project.

Access `http://localhost:8000` to see your site.

## Payload CMS environment

The storefront reads the Payload origin only on the server through `Deno.env`.
The value must contain only the HTTPS origin, without `/api` or a trailing path:

```env
PAYLOAD_API_URL=https://esmeracms-green.vercel.app
```

Local `.env` files are ignored by Git. The public fallback remains available in
`lib/payload/client.ts`, but the same variable must also be registered in the
**Production** environment of the Deco Admin and followed by a publish/redeploy.
Do not add database credentials, Payload admin credentials, storage keys, or any
other CMS secret to this frontend.

## Recommended extensions (VSCode)

- [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

- [Tailwind IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Dependencies

Keep your dependencies updated by running:

```sh
deno task update
```

## Help

- 📚 [Docs](https://www.deco.cx/docs/en/overview)

- 🚨 [Troubleshooting](https://deco.cx/docs/en/reference/troubleshooting)

- 🔤 [Glossary](https://deco.cx/glossary)

- 👥 [Discord](https://deco.cx/discord)

## Contributing

We are working on the instructions, for now feel free to contribute to this project.

Take a look on this ones:
- [deco](https://github.com/deco-cx/deco/)
- [apps](https://github.com/deco-cx/apps/)
