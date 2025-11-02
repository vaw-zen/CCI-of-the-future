import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllArticles } from '../data/articles.js';
import styles from './article.module.css';
import HeroHeader from '@/utils/components/reusableHeader/HeroHeader';
import RelatedServices from '@/utils/components/relatedServices/relatedServices';
import ArticleAnalyticsWrapper from './ArticleAnalyticsWrapper';
import { 
  TrackedBreadcrumbs, 
  TrackedTableOfContents, 
  TrackedArticleNav,
  TrackedBackToCTA 
} from './ArticleNavigation';

// Générer les métadonnées pour chaque article
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    return {
      title: 'Article non trouvé',
      description: 'Cet article n\'existe pas.'
    };
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  // Handle different keyword property names and ensure it's always an array
  const keywords = article.keywords || article.seoKeywords || [];
  const keywordsArray = Array.isArray(keywords) ? keywords : [];

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: keywordsArray.join(', '),
    authors: [{ name: article.author }],
    publishedTime: article.publishedDate,
    modifiedTime: article.updatedDate,
    alternates: {
      canonical: `${SITE_URL}/conseils/${resolvedParams.slug}`
    },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `${SITE_URL}/conseils/${resolvedParams.slug}`,
      siteName: 'CCI Services Tunis',
      images: [
        {
          url: `${SITE_URL}${article.image}`,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ],
      locale: 'fr_TN',
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: ['CCI Services'],
      section: 'Conseils Nettoyage',
      tags: keywordsArray,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [`${SITE_URL}${article.image}`],
    },
  };
}

// Générer les pages statiques pour tous les articles
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Get related services based on article category
  const getRelatedServices = (category) => {
    const serviceMap = {
      'tapis': [
        {
          title: "Nettoyage Tapis & Moquettes",
          description: "Service professionnel de nettoyage par injection-extraction pour tous types de tapis et moquettes.",
          link: "/tapis",
          icon: "/icons/polisher.png",
          ctaText: "Obtenir un devis"
        }
      ],
      'marbre': [
        {
          title: "Restauration & Polissage Marbre",
          description: "Ponçage, lustrage, cristallisation et protection professionnelle de vos sols en marbre.",
          link: "/marbre", 
          icon: "/icons/crystal3.png",
          ctaText: "Voir nos réalisations"
        }
      ],
      'salon': [
        {
          title: "Nettoyage Salons & Canapés",
          description: "Nettoyage professionnel de tous types de tapisserie d'ameublement et salons.",
          link: "/salon",
          icon: "/icons/shield.png", 
          ctaText: "Demander un devis"
        }
      ],
      'tapisserie': [
        {
          title: "Retapissage & Tapisserie", 
          description: "Création de tapisseries sur mesure et retapissage professionnel de meubles.",
          link: "/tapisserie",
          icon: "/icons/polisher1.png",
          ctaText: "Voir nos créations"
        }
      ],
      'post-chantier': [
        {
          title: "Nettoyage Post-Chantier",
          description: "Nettoyage complet après travaux de construction ou rénovation.",
          link: "/tfc",
          icon: "/icons/shield.png",
          ctaText: "Planifier intervention"
        }
      ]
    };

    return serviceMap[category] || [
      {
        title: "Tous Nos Services",
        description: "Découvrez l'ensemble de nos services de nettoyage et restauration professionnels.",
        link: "/services",
        icon: "/icons/polisher.png",
        ctaText: "Voir tous les services"
      }
    ];
  };

  const relatedServices = getRelatedServices(article.category);

  // Handle different keyword property names and ensure it's always an array
  const keywords = article.keywords || article.seoKeywords || [];
  const keywordsArray = Array.isArray(keywords) ? keywords : [];

  // Générer le schema Article pour SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online'}${article.image}`,
    "datePublished": article.publishedDate,
    "dateModified": article.updatedDate,
    "author": {
      "@type": "Organization",
      "name": "CCI Services",
      "url": "https://cciservices.online"
    },
    "publisher": {
      "@type": "LocalBusiness",
      "name": "CCI Services",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cciservices.online/logo.png"
      },
      "telephone": "+216-98-557-766",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "06 Rue Galant de nuit",
        "addressLocality": "L'Aouina",
        "addressRegion": "Tunis",
        "postalCode": "2045",
        "addressCountry": "TN"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cciservices.online/conseils/${resolvedParams.slug}`
    },
    "keywords": keywordsArray.join(', '),
    "wordCount": article.content.replace(/<[^>]*>/g, '').split(' ').length,
    "inLanguage": "fr-TN",
    "about": [
      {
        "@type": "Service",
        "name": "Nettoyage Tapis et Moquettes",
        "provider": {
          "@type": "LocalBusiness",
          "name": "CCI Services"
        }
      }
    ]
  };

  // Générer le breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://cciservices.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Conseils",
        "item": "https://cciservices.online/conseils"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://cciservices.online/conseils/${resolvedParams.slug}`
      }
    ]
  };

  // FAQ Schema si l'article contient des FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien de temps pour nettoyer un tapis de salon ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Entre 30 minutes et 2 heures selon la taille et l'état. Un tapis standard 2x3m prend environ 45 minutes avec notre méthode injection-extraction."
        }
      },
      {
        "@type": "Question",
        "name": "Le tapis sèche en combien de temps ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Moins d'1 heure avec notre méthode injection-extraction professionnelle, contre 6-12h avec les méthodes traditionnelles."
        }
      },
      {
        "@type": "Question",
        "name": "Intervenez-vous le week-end ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui, nous travaillons le samedi de 8h à 13h. Interventions d'urgence possibles le dimanche avec supplément de 50 DT."
        }
      },
      {
        "@type": "Question",
        "name": "Faut-il vider la pièce avant le nettoyage ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Non, nous déplaçons les meubles légers. Pour les gros meubles, nous nettoyons autour et vous pouvez les déplacer après séchage."
        }
      }
    ]
  };

  // Trouver les articles précédent et suivant
  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex(a => a.slug === resolvedParams.slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <ArticleAnalyticsWrapper articleTitle={article.title}>
      <main className={styles.main}>
        {/* Schema markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

          <HeroHeader sty title={article.categoryLabel} />
        <div className={styles.container}>
        {/* Breadcrumbs with tracking */}
        <TrackedBreadcrumbs article={article} />

        {/* Header de l'article */}
        <header className={styles.articleHeader}>
          <span className={styles.category}>{article.categoryLabel}</span>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>
          
          <div className={styles.meta}>
            <span>👤 {article.author}</span>
            <span>📅 {new Date(article.publishedDate).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>⏱️ {article.readTime}</span>
            <span>🏷️ {keywordsArray.slice(0, 2).join(', ')}</span>
          </div>
        </header>

        {/* Image hero */}
        <div className={styles.heroImage}>
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Table des matières with tracking */}
        <TrackedTableOfContents articleTitle={article.title} />

        {/* Contenu de l'article */}
        <article 
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Navigation between articles with tracking */}
        <TrackedArticleNav prevArticle={prevArticle} nextArticle={nextArticle} />

        {/* Back to conseils CTA with tracking */}
        <TrackedBackToCTA articleTitle={article.title} articleCategory={article.category} />
      </div>
      
      {/* Related Services - en dehors du container pour utiliser ses propres styles */}
      <RelatedServices 
        services={relatedServices}
        sectionTitle="Nos Services Professionnels"
        sourceArticle={article.title}
      />
    </main>
    </ArticleAnalyticsWrapper>
  );
}