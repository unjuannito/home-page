# Home Page

Página de inicio personal con buscador, accesos rápidos y fondos personalizables.

La aplicación se sirve en producción desde la raíz de `https://explore.jcanas.es/`.
Está configurada para no indexarse mediante `robots.txt` y la cabecera `X-Robots-Tag`.

## Desarrollo

Requiere Node.js 24 LTS o superior compatible con el proyecto.

```bash
npm ci
npm run dev
```

Antes de abrir un pull request:

```bash
npm run build
npm run lint
```

## Producción con Docker

La imagen usa una compilación multi-stage: Node 24 compila la aplicación y Nginx sirve
los archivos estáticos con cache de assets, fallback para la SPA y un healthcheck.

```bash
docker build -t home-page .
docker run -d --name home-page --restart unless-stopped -p 127.0.0.1:38741:38741 home-page
```

El proxy inverso debe terminar TLS para `explore.jcanas.es` y reenviar el tráfico a
`http://127.0.0.1:38741`.
