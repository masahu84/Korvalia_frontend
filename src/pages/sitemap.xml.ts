import type { APIRoute } from 'astro';

const SITE_URL = 'https://korvalia.es';
const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export const GET: APIRoute = async () => {
  // Páginas estáticas
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/propiedades', priority: '0.9', changefreq: 'daily' },
    { url: '/sobre-nosotros', priority: '0.7', changefreq: 'monthly' },
    { url: '/contacto', priority: '0.7', changefreq: 'monthly' },
    { url: '/aviso-legal', priority: '0.3', changefreq: 'yearly' },
    { url: '/politica-privacidad', priority: '0.3', changefreq: 'yearly' },
    { url: '/politica-cookies', priority: '0.3', changefreq: 'yearly' },
  ];

  // Obtener propiedades dinámicas
  let propertyUrls: { url: string; priority: string; changefreq: string; lastmod?: string }[] = [];

  try {
    const response = await fetch(`${API_BASE}/api/properties?status=available&limit=1000`);
    if (response.ok) {
      const result = await response.json();
      const properties = result.data?.properties || result.data || [];

      propertyUrls = properties.map((property: any) => ({
        url: `/propiedades/${property.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: property.updatedAt ? new Date(property.updatedAt).toISOString().split('T')[0] : undefined,
      }));
    }
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  const allPages = [...staticPages, ...propertyUrls];
  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
