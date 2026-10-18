
export async function fetchIcon(url: string): Promise<string> {
  if (!url) return '';

  let bestIcon = '';
  let bestSize = 0;

  try {
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;
    const origin = new URL(baseUrl).origin;

    // Función auxiliar para actualizar el mejor icono encontrado
    const updateBestIcon = (iconUrl: string, size: number) => {
      if (size >= 128) return true; // Encontramos uno excelente, podemos parar
      if (size > bestSize) {
        bestIcon = iconUrl;
        bestSize = size;
      }
      return false;
    };

    // 1. PRIMERO: Google Favicon Service (Muy rápido y confiable)
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${origin}&sz=128`;
    const googleDimensions = await getImageDimensions(googleFavicon);
    if (googleDimensions) {
      if (updateBestIcon(googleFavicon, Math.max(googleDimensions.width, googleDimensions.height))) {
        return googleFavicon;
      }
    }

    // 2. Intentar cargar el manifest.json (Suele tener la mejor calidad si existe)
    try {
      const manifestData = await findManifest(baseUrl);
      if (manifestData && manifestData.icons && Array.isArray(manifestData.icons)) {
        const sortedIcons = sortManifestIcons(manifestData.icons);
        for (const icon of sortedIcons) {
          const fullUrl = normalizeUrl(icon.src, manifestData.url);
          const dimensions = await getImageDimensions(fullUrl);
          if (dimensions) {
            if (updateBestIcon(fullUrl, Math.max(dimensions.width, dimensions.height))) return fullUrl;
          }
        }
      }
    } catch (e) {
      if (!(e instanceof TypeError)) console.warn('Error fetching manifest:', e);
    }

    // 2. Orden de rutas alternativas (A-E)
    const fallbackPaths = [
      '/manifest-icon-192.maskable.png',
      '/img/logo-dark.svg',
      '/favicon.ico',
      '/logo.png',
      '/assets/logo.png'
    ];

    for (const path of fallbackPaths) {
      const fullPath = `${origin}${path}`;
      const dimensions = await getImageDimensions(fullPath);
      if (dimensions) {
        if (updateBestIcon(fullPath, Math.max(dimensions.width, dimensions.height))) return fullPath;
      }
    }

    // 3. Meta tags del HTML (F)
    try {
      const htmlResponse = await fetch(baseUrl);
      if (htmlResponse.ok) {
        const htmlText = await htmlResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const metaIcons = [
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
          doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href'),
          doc.querySelector('link[rel="icon"]')?.getAttribute('href')
        ].filter(Boolean) as string[];

        for (const metaIcon of metaIcons) {
          const fullMetaIcon = metaIcon.startsWith('http') ? metaIcon : new URL(metaIcon, origin).href;
          const dimensions = await getImageDimensions(fullMetaIcon);
          if (dimensions) {
            if (updateBestIcon(fullMetaIcon, Math.max(dimensions.width, dimensions.height))) return fullMetaIcon;
          }
        }
      }
    } catch (e) {
      if (!(e instanceof TypeError)) console.warn('Error parsing HTML for icons:', e);
    }

    // Si ya tenemos un "bestIcon" (aunque sea pequeño), lo devolvemos
    if (bestIcon) return bestIcon;

    return '';

  } catch (e) {
    console.error('Error in fetchIcon:', e);
  }

  return '';
}

async function findManifest(baseUrl: string): Promise<{ icons: any[], url: string } | null> {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) return null;
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const manifestLink = doc.querySelector('link[rel="manifest"]')?.getAttribute('href') || 
                         doc.querySelector('link[rel="web-app-manifest"]')?.getAttribute('href');
    
    const manifestUrl = manifestLink 
      ? (manifestLink.startsWith('http') ? manifestLink : new URL(manifestLink, baseUrl).href)
      : new URL('/manifest.json', baseUrl).href;

    const manifestRes = await fetch(manifestUrl);
    if (manifestRes.ok) {
      const json = await manifestRes.json();
      return { icons: json.icons, url: manifestUrl };
    }
  } catch (e) {
    // Si falla por CORS, intentamos la ruta por defecto directamente si es el mismo origen
    // o simplemente fallamos si es externo
    const isSameOrigin = new URL(baseUrl).origin === window.location.origin;
    if (isSameOrigin) {
      try {
        const defaultUrl = new URL('/manifest.json', baseUrl).href;
        const res = await fetch(defaultUrl);
        if (res.ok) {
          const json = await res.json();
          return { icons: json.icons, url: defaultUrl };
        }
      } catch (e) {}
    }
  }
  return null;
}

function sortManifestIcons(icons: any[]): any[] {
  return [...icons].sort((a, b) => {
    const sizeA = parseSize(a.sizes);
    const sizeB = parseSize(b.sizes);
    
    // Prioridad a maskable si tienen el mismo tamaño o similar
    const purposeA = a.purpose?.includes('maskable') ? 1 : 0;
    const purposeB = b.purpose?.includes('maskable') ? 1 : 0;
    
    if (sizeB !== sizeA) return sizeB - sizeA;
    return purposeB - purposeA;
  });
}

function parseSize(sizeStr: string): number {
  if (!sizeStr) return 0;
  // Puede ser "192x192" o "192x192 512x512"
  const sizes = sizeStr.split(' ');
  let maxSize = 0;
  for (const s of sizes) {
    const width = parseInt(s.split('x')[0]);
    if (!isNaN(width) && width > maxSize) maxSize = width;
  }
  return maxSize;
}

function normalizeUrl(src: string, baseUrl: string): string {
  try {
    return new URL(src, baseUrl).href;
  } catch (e) {
    return src;
  }
}

async function getImageDimensions(url: string): Promise<{ width: number, height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > 1 && img.height > 1) {
        resolve({ width: img.width, height: img.height });
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
