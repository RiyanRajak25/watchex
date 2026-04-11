/**
 * BreadcrumbSchema — JSON-LD BreadcrumbList Structured Data
 * 
 * Injects https://schema.org/BreadcrumbList to help Google's crawler
 * instantly understand the site architecture and internal linking mesh.
 * 
 * Dynamically maps route hierarchy:
 * Home > Movies Like > Inception > Ending Explained
 */

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbSchema({ items, baseUrl = 'https://watchex.com' }: BreadcrumbSchemaProps) {
  if (items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
