# Home Page

Página de inicio personal con buscador, accesos rápidos y fondos personalizables.

La aplicación se sirve en producción desde la raíz de `https://explore.jcanas.es/`.

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
docker run --rm -p 8080:80 home-page
```

El proxy inverso o proveedor de hosting debe terminar TLS para `explore.jcanas.es` y
reenviar el tráfico HTTP al puerto 80 del contenedor.
