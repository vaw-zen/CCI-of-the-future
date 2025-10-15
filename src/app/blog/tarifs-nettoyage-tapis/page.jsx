import React from 'react';
import './tarifs-nettoyage-tapis.module.css';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "Tarif Nettoyage Tapis Tunis 2025 | Prix Transparents | CCI Services",
    description: "Tarifs nettoyage tapis Tunis ✓ Prix transparents ✓ Devis gratuit ✓ 15-25 DT/m² ✓ CCI Services +216 98 557 766",
    keywords: [
      "tarif nettoyage tapis",
      "tarif nettoyage tapis tunis", 
      "prix nettoyage tapis",
      "cout nettoyage tapis tunisie",
      "devis nettoyage tapis"
    ],
    alternates: {
      canonical: `${SITE_URL}/blog/tarifs-nettoyage-tapis`
    },
    openGraph: {
      title: "Tarif Nettoyage Tapis Tunis 2025 | CCI Services",
      description: "Tarifs nettoyage tapis Tunis ✓ Prix transparents ✓ Devis gratuit ✓ 15-25 DT/m²",
      url: `${SITE_URL}/blog/tarifs-nettoyage-tapis`,
      type: 'article',
      locale: 'fr_TN'
    }
  };
}

export default function TarifsNettoyageTapis() {
  return (
    <div className="tarifs-container">
      <header className="tarifs-hero">
        <h1>Tarif Nettoyage Tapis Tunis 2025 | Prix Transparents CCI</h1>
        <p className="hero-subtitle">
          Découvrez nos tarifs transparents pour le nettoyage professionnel de tapis à Tunis. 
          Devis gratuit et intervention rapide garantie.
        </p>
      </header>

      <section className="pricing-section">
        <h2>Tarifs Nettoyage Tapis Professionnels</h2>
        
        <div className="price-table">
          <div className="price-item">
            <h3>Nettoyage Standard</h3>
            <div className="price">15 DT/m²</div>
            <ul>
              <li>✓ Injection-extraction professionnelle</li>
              <li>✓ Séchage rapide (moins d'1h)</li>
              <li>✓ Garantie résultat</li>
              <li>✓ Déplacement inclus Grand Tunis</li>
            </ul>
            <a href="/devis" className="cta-button">Demander un Devis</a>
          </div>
          
          <div className="price-item featured">
            <h3>Nettoyage Premium</h3>
            <div className="price">25 DT/m²</div>
            <div className="popular-badge">Plus Populaire</div>
            <ul>
              <li>✓ Pré-détachage spécialisé</li>
              <li>✓ Traitement anti-acariens</li>
              <li>✓ Protection textile</li>
              <li>✓ Garantie 6 mois</li>
            </ul>
            <a href="/devis" className="cta-button primary">Devis Gratuit Immédiat</a>
          </div>
          
          <div className="price-item">
            <h3>Nettoyage Intensif</h3>
            <div className="price">35 DT/m²</div>
            <ul>
              <li>✓ Restauration complète</li>
              <li>✓ Taches tenaces et anciennes</li>
              <li>✓ Neutralisation odeurs</li>
              <li>✓ Remise à neuf garantie</li>
            </ul>
            <a href="/contact" className="cta-button">Consultation Expert</a>
          </div>
        </div>
      </section>

      <section className="pricing-factors">
        <h2>Facteurs Influençant le Tarif Nettoyage Tapis</h2>
        
        <div className="factors-grid">
          <div className="factor">
            <h3>🏠 Surface à Nettoyer</h3>
            <p>Le prix est calculé au m². Plus la surface est importante, plus le tarif unitaire devient avantageux.</p>
          </div>
          
          <div className="factor">
            <h3>🧵 Type de Tapis</h3>
            <p>Laine, synthétique, soie... Chaque matière nécessite une technique spécifique qui influence le tarif.</p>
          </div>
          
          <div className="factor">
            <h3>🔍 État du Tapis</h3>
            <p>Taches anciennes, usure importante ou odeurs nécessitent des traitements supplémentaires.</p>
          </div>
          
          <div className="factor">
            <h3>📍 Localisation</h3>
            <p>Intervention gratuite dans le Grand Tunis. Frais de déplacement pour les autres régions.</p>
          </div>
        </div>
      </section>

      <section className="comparison-section">
        <h2>Pourquoi Choisir CCI pour le Nettoyage de Vos Tapis ?</h2>
        
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>CCI Services</th>
                <th>Concurrence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tarif nettoyage tapis</td>
                <td>15-35 DT/m²</td>
                <td>20-50 DT/m²</td>
              </tr>
              <tr>
                <td>Devis</td>
                <td>Gratuit & Immédiat</td>
                <td>Payant (50 DT)</td>
              </tr>
              <tr>
                <td>Délai intervention</td>
                <td>24-48h</td>
                <td>1-2 semaines</td>
              </tr>
              <tr>
                <td>Garantie</td>
                <td>Résultat garanti</td>
                <td>Limitée</td>
              </tr>
              <tr>
                <td>Séchage</td>
                <td>Moins d'1h</td>
                <td>4-6h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="testimonials">
        <h2>Avis Clients sur Nos Tarifs</h2>
        
        <div className="testimonial-grid">
          <div className="testimonial">
            <p>"Tarif très correct pour la qualité du service. Mon tapis persan a retrouvé ses couleurs d'origine !"</p>
            <cite>- Mme Fatma, Tunis</cite>
          </div>
          
          <div className="testimonial">
            <p>"Prix transparents, pas de surprises. Le devis gratuit m'a convaincu de faire appel à CCI."</p>
            <cite>- M. Ahmed, Ariana</cite>
          </div>
          
          <div className="testimonial">
            <p>"Excellent rapport qualité-prix. Je recommande CCI pour le nettoyage de tapis."</p>
            <cite>- Mme Leila, La Marsa</cite>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>Questions Fréquentes sur les Tarifs</h2>
        
        <div className="faq-list">
          <details>
            <summary>Quel est le tarif minimum pour un nettoyage de tapis ?</summary>
            <p>Notre tarif minimum est de 50 DT, correspondant à environ 3-4 m² de surface. Ce minimum couvre les frais de déplacement et de mise en route de l'équipement.</p>
          </details>
          
          <details>
            <summary>Y a-t-il des frais supplémentaires ?</summary>
            <p>Non, nos tarifs sont tout compris pour le Grand Tunis. Seuls les traitements spéciaux (anti-acariens, protection) peuvent engendrer un supplément, toujours annoncé dans le devis.</p>
          </details>
          
          <details>
            <summary>Proposez-vous des réductions pour plusieurs tapis ?</summary>
            <p>Oui, nous accordons une remise de 10% dès 20 m² et 15% dès 50 m². Idéal pour les entreprises et les grandes surfaces.</p>
          </details>
          
          <details>
            <summary>Le devis est-il vraiment gratuit ?</summary>
            <p>Absolument ! Notre devis est gratuit et sans engagement. Nous nous déplaçons pour évaluer vos tapis et vous proposer le tarif le plus juste.</p>
          </details>
        </div>
      </section>

      <section className="cta-final">
        <h2>Obtenez Votre Devis Gratuit Maintenant</h2>
        <p>Tarif nettoyage tapis transparent et compétitif. Intervention rapide dans tout Tunis.</p>
        <div className="cta-buttons">
          <a href="/devis" className="cta-button primary large">Devis Gratuit Immédiat</a>
          <a href="tel:+21698557766" className="cta-button secondary large">Appeler +216 98 557 766</a>
        </div>
      </section>

      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Nettoyage Tapis Tunis",
          "description": "Service professionnel de nettoyage de tapis à Tunis avec tarifs transparents",
          "provider": {
            "@type": "LocalBusiness",
            "name": "CCI Services",
            "telephone": "+216-98-557-766",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Tunis",
              "addressCountry": "TN"
            }
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "TND",
            "price": "15-35",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "15-35",
              "priceCurrency": "TND",
              "unitCode": "MTK"
            }
          },
          "areaServed": {
            "@type": "City",
            "name": "Tunis"
          }
        })
      }} />
    </div>
  );
}