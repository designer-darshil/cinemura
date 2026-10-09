import React, { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show' | 'profile' | 'article';
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description = 'Discover movies. Explore series. Find your next obsession. A premium cinematic entertainment discovery platform.',
  image = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
  type = 'website',
  canonicalUrl,
  structuredData,
}) => {
  useEffect(() => {
    // 1. Document Title
    const formattedTitle = title ? `${title} — CINEMURA` : 'CINEMURA — Premium Cinematic Movie & Series Editorial';
    document.title = formattedTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMetaTag('name', 'description', description);

    // 3. Open Graph
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:type', type);
    if (canonicalUrl || typeof window !== 'undefined') {
      setMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    }

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // 5. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonicalUrl || typeof window !== 'undefined') {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl || window.location.href);
    }

    // 6. JSON-LD Structured Data
    const existingScript = document.getElementById('cinemura-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    if (structuredData) {
      const script = document.createElement('script');
      script.id = 'cinemura-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const cleanupScript = document.getElementById('cinemura-jsonld');
      if (cleanupScript) cleanupScript.remove();
    };
  }, [title, description, image, type, canonicalUrl, structuredData]);

  return null;
};
