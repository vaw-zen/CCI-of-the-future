import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import content from './faq.json'
import ClientFAQ from './components/ClientFAQ'
import styles from './page.module.css'
import GreenBand from '@/utils/components/GreenBand/GreenBand';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: 'FAQ — CCI',
    description: 'Questions fréquentes sur nos services : nettoyage de tapis, restauration de marbre, tapisserie et nettoyages post-chantier. Astuces pratiques sur le détachage, solutions maison au vinaigre et entretien du marbre.',
    alternates: {
      canonical: `${SITE_URL}/faq`
    },
    openGraph: {
      title: 'FAQ — CCI',
      description: 'Questions fréquentes sur nos services : nettoyage de tapis, restauration de marbre, tapisserie et nettoyages post-chantier. Astuces pratiques sur le détachage, solutions maison au vinaigre et entretien du marbre.',
      url: `${SITE_URL}/faq`,
      type: 'website'
    },
    twitter: {
      title: 'FAQ — CCI',
      description: 'Questions fréquentes sur nos services : nettoyage de tapis, restauration de marbre, tapisserie et nettoyages post-chantier. Astuces pratiques sur le détachage, solutions maison au vinaigre et entretien du marbre.'
    }
  };
}

export default function FAQ() {
  const { title, description, faqs } = content;

  // Improved Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
        // If the answer contains a step-by-step (like stain removal), add HowTo markup
        potentialAction: {
          "@type": "HowTo",
          name: `Astuce - ${q.question}`,
          description: q.answer.length > 150 
            ? q.answer.substring(0, 150) + "..." 
            : q.answer,
          supply: ["Eau", "Vinaigre blanc", "Chiffon propre"],
          tool: ["Éponge", "Brosse douce"],
          step: [
            {
              "@type": "HowToStep",
              name: "Préparer la solution",
              text: "Mélanger du vinaigre blanc avec de l’eau tiède."
            },
            {
              "@type": "HowToStep",
              name: "Appliquer",
              text: "Appliquer la solution sur la tache avec une éponge."
            },
            {
              "@type": "HowToStep",
              name: "Rincer et sécher",
              text: "Rincer avec un chiffon humide puis laisser sécher."
            }
          ]
        }
      },
      url: "https://cciservices.online/faq"
    }))
  };

  return (
    <>
      <HeroHeader title="Questions Fréquemment Posées - CCI Tunisie" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className={styles.section}>
        <div className={styles.header}>
          <h3 className={styles.faqTitle}>FAQ</h3>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {/* Pass data to client component */}
        <ClientFAQ faqs={faqs} />
        <GreenBand className={styles.greenBand} />
      </section>
    </>
  );
}
