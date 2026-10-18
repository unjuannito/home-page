
export function extractNameFromUrl(url: string): string {
  try {
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(baseUrl);
    let hostname = urlObj.hostname;
    
    // Quitar 'www.' si existe
    hostname = hostname.replace(/^www\./, '');
    
    // Obtener la primera parte del dominio (ej: google de google.com)
    const parts = hostname.split('.');
    if (parts.length > 0) {
      const name = parts[0];
      // Capitalizar la primera letra
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return '';
  } catch (e) {
    return '';
  }
}

export async function fetchWebName(url: string): Promise<string> {
  if (!url) return '';

  try {
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Intentar obtener el título del HTML
    const response = await fetch(baseUrl);
    if (response.ok) {
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const title = doc.querySelector('title')?.textContent;
      
      if (title && title.trim()) {
        // Limpiar el título (quitar espacios extras, etc.)
        return title.trim().split(' - ')[0].split(' | ')[0]; // Tomar la primera parte antes de guiones o barras
      }
    }
  } catch (e) {
    // Si falla el fetch (por CORS o red), usamos el fallback del dominio
    console.warn('Could not fetch web title, using fallback:', e);
  }

  return extractNameFromUrl(url);
}
