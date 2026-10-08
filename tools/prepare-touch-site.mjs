import { readFile, writeFile, mkdir } from "node:fs/promises";
await writeFile("dist/index.html", '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>CozyClay Touch</title><meta http-equiv="refresh" content="0;url=/app/"><p><a href="/app/">Open CozyClay Touch</a></p><script>location.replace("/app/"+location.search+location.hash)</script></html>');
await mkdir("dist/source", { recursive: true });
await writeFile("dist/source/index.html", '<!doctype html><html lang="en"><meta charset="utf-8"><title>CozyClay Touch source</title><h1>CozyClay Touch</h1><p>CozyClay by NomaDamas, with mobile modifications in Nerfed-ai’s fork.</p><p><a href="https://github.com/Nerfed-ai/cozyclay/tree/chore/mobile-touch">Complete corresponding source</a> · <a href="https://github.com/Nerfed-ai/cozyclay/blob/chore/mobile-touch/LICENSE">AGPL-3.0 license</a></p></html>');
const app = await readFile("dist/app/index.html", "utf8");
await writeFile("dist/app/index.html", app.replace(/<script[^>]*src=["'][^"']*cloudflareinsights[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, ""));
