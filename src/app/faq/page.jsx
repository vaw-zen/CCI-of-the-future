import HeroHeader from '@/utils/components/reusableHeader/HeroHeader'
import content from './faq.json'
import ClientFAQ from './components/ClientFAQ'
import styles from './page.module.css'
import GreenBand from '@/utils/components/GreenBand/GreenBand';

export default function FAQ() {
    const { title, description, faqs } = content;
    
    return (
        <>
            <HeroHeader title='FAQ' />
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
