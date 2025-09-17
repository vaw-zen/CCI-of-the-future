import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import content from './faq.json'
import ClientFAQ from './components/ClientFAQ'
import styles from './page.module.css'
import GreenBand from '@/utils/components/GreenBand/GreenBand';

export const metadata = {
    title: 'FAQ — CCI',
    description: 'Questions fréquentes sur nos services : nettoyage de tapis, restauration de marbre, tapisserie et nettoyages post-chantier. Informations pratiques et délais.',
};

export default function FAQ() {
    const { title, description, faqs } = content;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer
            },
            url:"https://cciservices.online/faq"
        }))
    };

    return (
        <>
            <HeroHeader title='FAQ' />
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            <section className={styles.section}>
                <div className={styles.header}>
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
