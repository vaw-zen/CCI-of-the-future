import React from 'react';
import './ariana.module.css';

export async function generateMetadata() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cciservices.online';
  
  return {
    title: "Nettoyage Professionnel Ariana | CCI Services | Devis Gratuit",
    description: "Nettoyage professionnel Ariana ✓ Moquettes, salon, marbre ✓ Intervention rapide ✓ Devis gratuit ✓ +216 98 557 766",
    keywords: [
      "nettoyage ariana",
      "services nettoyage ariana",
      "nettoyage tapis ariana",
      "marbre ariana",
      "CCI services ariana"
    ],
    alternates: {
      canonical: `${SITE_URL}/ariana`
    },
    openGraph: {
      title: "Nettoyage Professionnel Ariana | CCI Services",
      description: "Nettoyage professionnel Ariana ✓ Moquettes, salon, marbre ✓ Intervention rapide",
      url: `${SITE_URL}/ariana`,
      type: 'website',
      locale: 'fr_TN'
    }
  };
}

export default function ArianaPage() {
  return (
    <div className="ariana-container">
      <header className="ariana-hero">
        <h1>Nettoyage Professionnel Ariana | CCI Services</h1>
        <p className="hero-subtitle">
          CCI Services intervient dans toute la région d'Ariana pour vos besoins de nettoyage professionnel. 
          Intervention rapide et devis gratuit.
        </p>
        <div className="hero-cta">
          <a href="/devis" className="cta-button primary">Devis Gratuit Ariana</a>
          <a href="tel:+21698557766" className="cta-button secondary">📞 98 557 766</a>
        </div>
      </header>

      <section className="services-ariana">
        <h2>Nos Services de Nettoyage à Ariana</h2>
        
        <div className="services-grid">
          <div className="service-card">
            <h3>🏠 Nettoyage Moquettes Ariana</h3>
            <p>Injection-extraction professionnelle pour tous types de moquettes. Séchage rapide et résultats garantis.</p>
            <ul>
              <li>✓ Nettoyage en profondeur</li>
              <li>✓ Traitement anti-acariens</li>
              <li>✓ Intervention à domicile</li>
            </ul>
            <a href="/tapis" className="service-link">En savoir plus</a>
          </div>
          
          <div className="service-card">
            <h3>🛋️ Nettoyage Salon Ariana</h3>
            <p>Nettoyage professionnel de canapés, fauteuils et salon à domicile dans toute la région d'Ariana.</p>
            <ul>
              <li>✓ Toutes matières (cuir, tissu)</li>
              <li>✓ Détachage spécialisé</li>
              <li>✓ Désinfection incluse</li>
            </ul>
            <a href="/salon" className="service-link">En savoir plus</a>
          </div>
          
          <div className="service-card">
            <h3>💎 Marbre Ariana</h3>
            <p>Restauration, ponçage et polissage de marbre. Experts certifiés pour tous vos sols en pierre naturelle.</p>
            <ul>
              <li>✓ Ponçage professionnel</li>
              <li>✓ Polissage haute brillance</li>
              <li>✓ Cristallisation durable</li>
            </ul>
            <a href="/marbre" className="service-link">En savoir plus</a>
          </div>
        </div>
      </section>

      <section className="zones-intervention">
        <h2>Zones d'Intervention à Ariana</h2>
        
        <div className="zones-grid">
          <div className="zone-card">
            <h3>Centre-ville Ariana</h3>
            <p>Intervention rapide dans le centre d'Ariana. Service disponible 7j/7.</p>
            <span className="zone-time">⏱️ Délai: 30 minutes</span>
          </div>
          
          <div className="zone-card">
            <h3>Raoued</h3>
            <p>Nettoyage professionnel à Raoued. Équipe locale expérimentée.</p>
            <span className="zone-time">⏱️ Délai: 45 minutes</span>
          </div>
          
          <div className="zone-card">
            <h3>Soukra</h3>
            <p>Services de nettoyage à Soukra. Intervention programmée ou urgente.</p>
            <span className="zone-time">⏱️ Délai: 40 minutes</span>
          </div>
          
          <div className="zone-card">
            <h3>Kalâat el-Andalous</h3>
            <p>Nettoyage professionnel à Kalâat el-Andalous. Devis gratuit sur place.</p>
            <span className="zone-time">⏱️ Délai: 50 minutes</span>
          </div>
          
          <div className="zone-card">
            <h3>Ettadhamen</h3>
            <p>Service de nettoyage à Ettadhamen. Tarifs préférentiels pour la zone.</p>
            <span className="zone-time">⏱️ Délai: 35 minutes</span>
          </div>
          
          <div className="zone-card">
            <h3>Mnihla</h3>
            <p>Intervention à Mnihla pour tous vos besoins de nettoyage professionnel.</p>
            <span className="zone-time">⏱️ Délai: 55 minutes</span>
          </div>
        </div>
      </section>

      <section className="local-testimonials">
        <h2>Témoignages Clients Ariana</h2>
        
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Excellent service à Ariana ! Mon salon en cuir a retrouvé son éclat d'origine. Je recommande vivement CCI Services."</p>
            </div>
            <div className="testimonial-author">
              <strong>Mme Fatma B.</strong>
              <span>Centre-ville Ariana</span>
              <div className="rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Intervention rapide à Raoued. L'équipe était très professionnelle et le résultat sur ma moquette est parfait !"</p>
            </div>
            <div className="testimonial-author">
              <strong>M. Ahmed K.</strong>
              <span>Raoued</span>
              <div className="rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          
          <div className="testimonial">
            <div class_name="testimonial-content">
              <p>"Restauration de marbre impeccable à Soukra. Prix très correct et délai respecté. Merci à l'équipe CCI !"</p>
            </div>
            <div className="testimonial-author">
              <strong>Mme Leila M.</strong>
              <span>Soukra</span>
              <div className="rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      <section className="local-advantages">
        <h2>Pourquoi Choisir CCI Services à Ariana ?</h2>
        
        <div className="advantages-grid">
          <div className="advantage">
            <div className="advantage-icon">🚗</div>
            <h3>Déplacement Gratuit</h3>
            <p>Intervention sans frais de déplacement dans toute la région d'Ariana</p>
          </div>
          
          <div className="advantage">
            <div className="advantage-icon">⚡</div>
            <h3>Intervention Rapide</h3>
            <p>Délai d'intervention moyen de 45 minutes dans toute la zone d'Ariana</p>
          </div>
          
          <div className="advantage">
            <div className="advantage-icon">💰</div>
            <h3>Tarifs Locaux</h3>
            <p>Tarifs adaptés à la région avec possibilité de remises pour les clients fidèles</p>
          </div>
          
          <div className="advantage">
            <div className="advantage-icon">🔧</div>
            <h3>Équipe Locale</h3>
            <p>Techniciens résidant à Ariana, connaissance parfaite de la région</p>
          </div>
        </div>
      </section>

      <section className="contact-ariana">
        <h2>Contactez CCI Services Ariana</h2>
        
        <div className="contact-info">
          <div className="contact-card">
            <h3>📞 Appelez-nous</h3>
            <p>Service client disponible 7j/7</p>
            <a href="tel:+21698557766" className="contact-link">+216 98 557 766</a>
          </div>
          
          <div className="contact-card">
            <h3>📧 Email</h3>
            <p>Réponse garantie sous 2h</p>
            <a href="mailto:ariana@cciservices.online" className="contact-link">ariana@cciservices.online</a>
          </div>
          
          <div className="contact-card">
            <h3>📍 Zone d'Action</h3>
            <p>Toute la région d'Ariana</p>
            <span className="contact-link">Déplacement gratuit</span>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <h2>Demandez Votre Devis Gratuit à Ariana</h2>
        <p>Intervention rapide dans toute la région. Devis gratuit et sans engagement.</p>
        <div className="cta-buttons">
          <a href="/devis" className="cta-button primary large">Devis Gratuit Ariana</a>
          <a href="/contact" className="cta-button secondary large">Nous Contacter</a>
        </div>
      </section>

      {/* Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "CCI Services Ariana",
          "description": "Service de nettoyage professionnel à Ariana - moquettes, salon, marbre",
          "telephone": "+216-98-557-766",
          "email": "ariana@cciservices.online",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ariana",
            "addressRegion": "Ariana",
            "addressCountry": "TN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 36.8665,
            "longitude": 10.1647
          },
          "areaServed": [
            {
              "@type": "City",
              "name": "Ariana"
            },
            {
              "@type": "City", 
              "name": "Raoued"
            },
            {
              "@type": "City",
              "name": "Soukra"
            }
          ],
          "serviceType": [
            "Nettoyage moquettes",
            "Nettoyage salon",
            "Restauration marbre"
          ],
          "priceRange": "15-35 DT"
        })
      }} />
    </div>
  );
}