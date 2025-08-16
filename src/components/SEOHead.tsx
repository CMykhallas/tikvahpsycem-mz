import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Tikvah Psychological Center & Multiservice",
  description = "Centro psicológico e multiservice em Maputo, Moçambique. Especializados em desenvolvimento humano integral, integrando psicologia, filosofia e valores cristãos.",
  keywords = "psicologia, terapia, consultoria, desenvolvimento humano, Maputo, Moçambique, saúde mental, coaching, mindfulness",
  canonicalUrl,
  ogImage = "/og-image.jpg",
  ogType = "website",
  structuredData
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', ogType, 'property');

    // Update Twitter Card tags
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', ogImage, 'name');

    // Update canonical URL
    if (canonicalUrl) {
      updateCanonicalTag(canonicalUrl);
    }

    // Add structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData]);

  return null;
};

const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
};

const updateCanonicalTag = (url: string) => {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  
  element.href = url;
};

const updateStructuredData = (data: any) => {
  let element = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(data);
};