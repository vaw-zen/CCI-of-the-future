# SEO Enhancement Implementation Guide for All Service Pages

## 🎯 Overview
This guide provides the exact SEO enhancements to apply to all remaining service pages:
- **marbre** (marble polishing)
- **salon** (furniture upholstery)  
- **tfc** (post-construction cleaning)

Each page follows the same proven pattern used successfully on tapisserie and tapis pages.

---

## 📋 MARBRE PAGE ENHANCEMENTS

### File: `src/app/marbre/page.jsx`

### 1. Update Metadata (lines ~30-52)

**Replace existing metadata return object with:**

```javascript
return {
  title: "Ponçage Marbre Tunis - Cristallisation & Polissage Professionnel | CCI",
  description: "Spécialiste ponçage et polissage marbre à Tunis. Cristallisation, lustrage, protection. Sols, plans de travail, escaliers. Devis gratuit ☎ 98-557-766",
  keywords: "ponçage marbre tunis, polissage marbre tunis, cristallisation marbre tunisie, lustrage marbre ariana, restauration marbre tunis, traitement marbre carthage, ponçage sol marbre tunis, polissage plan travail marbre",
  alternates: {
    canonical: `${SITE_URL}/marbre`
  },
  openGraph: {
    title: "Ponçage Marbre Tunis - Cristallisation & Polissage | CCI",
    description: "Spécialiste ponçage et polissage marbre à Tunis. Cristallisation, lustrage, protection. Sols, plans de travail, escaliers. Devis gratuit ☎ 98-557-766",
    url: `${SITE_URL}/marbre`,
    type: 'website',
    locale: 'fr_TN',
    siteName: 'CCI Services'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ponçage Marbre Tunis - Cristallisation & Polissage | CCI",
    description: "Spécialiste ponçage et polissage marbre à Tunis. Cristallisation, lustrage, protection. Devis gratuit ☎ 98-557-766"
  }
};
```

### 2. Update Mission Content (line ~13)

**Replace content with:**
```javascript
content: "Proposer des solutions complètes pour la restauration et l'entretien du marbre et du carrelage à Tunis et dans toute la Tunisie : ponçage, lustrage, cristallisation et protection. Nous nous engageons à garantir la beauté, la durabilité et la sécurité de vos surfaces avec un service professionnel de proximité.",
```

### 3. Add FAQ Schema (after serviceJSONLD, before return statement)

**Add this complete FAQ schema:**

```javascript
const faqJSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qu'est-ce que la cristallisation du marbre ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La cristallisation est un traitement chimique professionnel qui densifie la surface du marbre pour créer une brillance durable et une protection contre les taches et rayures. CCI utilise des cristallisants professionnels pour un résultat optimal sur tous types de marbre à Tunis."
      }
    },
    {
      "@type": "Question",
      "name": "Intervenez-vous à domicile pour le ponçage de marbre à Tunis ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI intervient à domicile et dans les entreprises dans tout le Grand Tunis (Tunis, L'Aouina, Ariana, La Marsa, Carthage, Ben Arous) pour le ponçage, polissage et cristallisation de marbre. Nous offrons un diagnostic gratuit et un devis détaillé."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de temps dure le ponçage d'un sol en marbre ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La durée dépend de la surface et de l'état du marbre. En moyenne, comptez 1 à 2 jours pour un ponçage complet avec cristallisation d'un salon de 40-50m². CCI utilise des équipements professionnels pour minimiser les nuisances et optimiser le temps d'intervention."
      }
    },
    {
      "@type": "Question",
      "name": "Peut-on restaurer un marbre très abîmé ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI peut restaurer des marbres même très abîmés avec rayures profondes, taches tenaces ou surfaces ternes. Notre processus en plusieurs étapes (ponçage grossier, affinement progressif, polissage, cristallisation) permet de redonner au marbre son aspect d'origine."
      }
    },
    {
      "@type": "Question",
      "name": "Proposez-vous la protection des plans de travail en marbre ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI propose des traitements hydrofuges et oléofuges spécialement adaptés aux plans de travail de cuisine en marbre. Ces protections imperméabilisent le marbre contre les taches d'huile, de vin et d'aliments tout en préservant son aspect naturel."
      }
    }
  ]
};
```

### 4. Update Service Schema (add areaServed)

**In serviceJSONLD, update name and add areaServed:**
```javascript
"name": "Ponçage et polissage marbre à Tunis",
"description": "Spécialiste restauration marbre à Tunis. Ponçage, polissage, cristallisation et protection des surfaces en marbre pour particuliers et professionnels.",
"areaServed": {
  "@type": "City",
  "name": "Tunis"
},
```

### 5. Update HeroHeader

**Replace:**
```javascript
<HeroHeader title={"Marbre"} />
```

**With:**
```javascript
<HeroHeader title={"Ponçage & Polissage Marbre Professionnel à Tunis"} />
```

### 6. Add FAQ Script Tag

**After the serviceJSONLD script tag, add:**
```javascript
<script type="application/ld+json">{JSON.stringify(faqJSONLD)}</script>
```

### 7. Update First ServiceDetails

**Replace title and text:**
```javascript
title="Spécialiste ponçage et polissage marbre à Tunis"
text="CCI, expert en restauration de marbre à Tunis depuis plus de 15 ans, intervient dans tout le Grand Tunis (L'Aouina, Ariana, La Marsa, Carthage, Ben Arous) pour particuliers et professionnels. Nous proposons des services complets : ponçage professionnel (ébauche, affinement progressif), lustrage haute brillance, cristallisation chimique pour protection durable, et traitements hydrofuges/oléofuges pour plans de travail. Notre équipe maîtrise tous types de marbre (blanc, noir, beige, travertin) et intervient sur sols, escaliers, plans de travail cuisine/salle de bain, façades. Nous utilisons des machines professionnelles (monobrosse, ponceuses orbitales, disques diamantés gradués) et des produits certifiés pour un résultat impeccable. Résultats garantis : brillance miroir, protection anti-taches, durabilité renforcée. Diagnostic gratuit et devis détaillé. Contactez-nous au 98-557-766."
```

### 8. Update "Notre expertise" Section

**Replace title and text:**
```javascript
title="Pourquoi choisir CCI pour vos travaux de marbre à Tunis ?"
text="Avec plus de 15 ans d'expérience dans la restauration de marbre à Tunis, CCI est votre partenaire de confiance pour tous vos projets. Notre expertise couvre : diagnostic précis de l'état du marbre et recommandations adaptées, ponçage en plusieurs passes (grains 50 à 3000) pour éliminer rayures et irrégularités, polissage mécanique pour pré-brillance, cristallisation chimique professionnelle avec cristallisants haute performance, traitements de protection (hydrofuge, oléofuge, anti-taches) pour usage résidentiel ou commercial, entretien régulier et maintenance préventive. Nos interventions par secteur : Résidentiel (villas, appartements) - sols salons, cuisines, salles de bain, escaliers en marbre. Commercial (hôtels, restaurants, bureaux Tunis/Ariana) - halls d'entrée, réceptions, espaces publics haute fréquentation. Plans de travail - cuisine et salle de bain avec traitement alimentaire. Équipement professionnel : monobrosses industrielles, ponceuses planétaires, disques diamantés gradués, aspirateurs HEPA. Service complet : déplacement gratuit Grand Tunis, intervention propre avec protection des lieux, conseils d'entretien personnalisés, garantie satisfaction. Basés à L'Aouina, intervention rapide."
```

### 9. Update AboutUsTab

**Replace all three text fields:**

```javascript
historyText="Depuis sa création à Tunis, CCI s'est spécialisée dans la restauration et l'entretien du marbre et du carrelage pour répondre aux besoins des particuliers et des professionnels dans tout le Grand Tunis. Basés à L'Aouina, notre histoire est marquée par la passion du travail bien fait, l'innovation dans les techniques de traitement des surfaces et un service de proximité apprécié."

missionText="Notre mission est d'offrir des solutions de restauration et d'entretien de haute qualité pour le marbre et le carrelage à Tunis et en Tunisie : ponçage professionnel, lustrage, cristallisation et protection durable. Nous nous engageons à garantir beauté, durabilité et sécurité à tous nos clients avec des interventions soignées et des conseils d'entretien personnalisés."

visionText="Être la référence incontournable en Tunisie pour la rénovation et la préservation du marbre, reconnue pour notre expertise technique, notre accompagnement personnalisé, la qualité irréprochable de nos finitions et notre réactivité. Développer notre présence nationale tout en maintenant notre excellence de service."
```

### Key Marbre SEO Keywords:
- ponçage marbre tunis ✓
- polissage marbre tunis ✓
- cristallisation marbre tunisie ✓
- lustrage marbre ariana ✓
- restauration marbre tunis ✓
- traitement marbre carthage ✓

---

## 📋 SALON PAGE ENHANCEMENTS

### File: `src/app/salon/page.jsx`

### 1. Update Metadata

```javascript
return {
  title: "Retapissage Salon Tunis - Rénovation Canapé Cuir & Tissu | CCI",
  description: "Spécialiste retapissage salon à Tunis. Rénovation canapé cuir, tissu, réfection fauteuil. Rembourrage, réparation. Devis gratuit ☎ 98-557-766",
  keywords: "retapissage salon tunis, rénovation canapé cuir tunis, réfection salon tunisie, rembourrage canapé ariana, réparation salon cuir tunis, retapissage fauteuil tunis, tapissier salon carthage",
  alternates: {
    canonical: `${SITE_URL}/salon`
  },
  openGraph: {
    title: "Retapissage Salon Tunis - Rénovation Canapé Cuir & Tissu | CCI",
    description: "Spécialiste retapissage salon à Tunis. Rénovation canapé cuir, tissu, réfection fauteuil. Rembourrage, réparation. Devis gratuit ☎ 98-557-766",
    url: `${SITE_URL}/salon`,
    type: 'website',
    locale: 'fr_TN',
    siteName: 'CCI Services'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Retapissage Salon Tunis - Rénovation Canapé | CCI",
    description: "Spécialiste retapissage salon à Tunis. Rénovation canapé cuir, tissu. Devis gratuit ☎ 98-557-766"
  }
};
```

### 2. Add FAQ Schema

```javascript
const faqJSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Peut-on rénover un salon en cuir abîmé ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI est spécialisé dans la rénovation de salons en cuir à Tunis. Nous pouvons réparer déchirures, craquelures, décolorations et usures. Notre processus inclut nettoyage, réparation, teinture et protection du cuir pour lui redonner son aspect d'origine."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de temps prend le retapissage d'un salon complet ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le retapissage d'un salon 3 places avec 2 fauteuils prend généralement 7 à 10 jours ouvrables. Ce délai inclut la dépose, le remplacement de la mousse si nécessaire, le retapissage et la remise en place. CCI s'engage à respecter les délais convenus."
      }
    },
    {
      "@type": "Question",
      "name": "Proposez-vous un service à domicile à Tunis ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI offre un service complet à domicile dans tout le Grand Tunis (Tunis, L'Aouina, Ariana, La Marsa, Carthage, Ben Arous). Nous nous déplaçons pour le diagnostic, la récupération de votre salon et la livraison après rénovation."
      }
    },
    {
      "@type": "Question",
      "name": "Peut-on changer la couleur d'un salon en cuir ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI propose la teinture professionnelle du cuir pour changer complètement la couleur de votre salon. Nous utilisons des teintures de haute qualité qui pénètrent en profondeur et garantissent une couleur uniforme et durable."
      }
    },
    {
      "@type": "Question",
      "name": "Travaillez-vous aussi sur les salons en tissu ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI retapisse tous types de salons : cuir, tissu, simili cuir, alcantara. Pour les salons en tissu, nous proposons un large choix de tissus d'ameublement de qualité (velours, lin, microfibre) adaptés à votre usage et votre budget."
      }
    }
  ]
};
```

### 3. Update HeroHeader

```javascript
<HeroHeader title={"Retapissage & Rénovation Salon Professionnel à Tunis"} />
```

### 4. Update Content with Local Keywords

**First ServiceDetails:**
```javascript
title="Spécialiste retapissage et rénovation de salon à Tunis"
text="CCI, expert en rénovation de salons à Tunis depuis plus de 15 ans, redonne vie à vos canapés et fauteuils dans tout le Grand Tunis (L'Aouina, Ariana, La Marsa, Carthage, Ben Arous). Nos services : retapissage complet salon cuir/tissu, rénovation et réparation cuir (déchirures, craquelures, décolorations), teinture et recoloration cuir, remplacement mousse et rembourrage, réfection complète structure, nettoyage et traitement protecteur. Nous intervenons sur tous types : salons cuir pleine fleur, cuir nappa, simili cuir, tissu, alcantara. Spécialités : salons 3 places, canapés d'angle, fauteuils relax, chaises. Service à domicile : diagnostic gratuit, récupération, rénovation en atelier, livraison et installation. Garantie 2 ans sur main d'œuvre. Devis détaillé gratuit au 98-557-766."
```

### Key Salon SEO Keywords:
- retapissage salon tunis ✓
- rénovation canapé cuir tunis ✓
- réfection salon tunisie ✓
- rembourrage canapé ariana ✓

---

## 📋 TFC PAGE (Post-Construction Cleaning)

### File: `src/app/tfc/page.jsx`

### 1. Update Metadata

```javascript
return {
  title: "Nettoyage Fin de Chantier Tunis - TFC Professionnel | CCI",
  description: "Nettoyage fin de chantier professionnel à Tunis. Élimination poussière, plâtre, résidus. Chantiers résidentiels et commerciaux. Devis gratuit ☎ 98-557-766",
  keywords: "nettoyage fin de chantier tunis, tfc tunis, nettoyage après travaux tunis, nettoyage chantier tunisie, nettoyage post construction ariana, tfc professionnel tunis, nettoyage bâtiment tunis",
  alternates: {
    canonical: `${SITE_URL}/tfc`
  },
  openGraph: {
    title: "Nettoyage Fin de Chantier Tunis - TFC Professionnel | CCI",
    description: "Nettoyage fin de chantier professionnel à Tunis. Élimination poussière, plâtre, résidus. Chantiers résidentiels et commerciaux. Devis gratuit ☎ 98-557-766",
    url: `${SITE_URL}/tfc`,
    type: 'website',
    locale: 'fr_TN',
    siteName: 'CCI Services'
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nettoyage Fin de Chantier Tunis - TFC | CCI",
    description: "Nettoyage fin de chantier professionnel à Tunis. Devis gratuit ☎ 98-557-766"
  }
};
```

### 2. Add FAQ Schema

```javascript
const faqJSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qu'est-ce qu'un nettoyage fin de chantier (TFC) ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le nettoyage fin de chantier (TFC) est un nettoyage approfondi réalisé après des travaux de construction ou rénovation. Il élimine tous les résidus : poussières de plâtre, traces de peinture, colle, ciment, protections et déchets. CCI intervient à Tunis pour rendre votre espace parfaitement propre et habitable."
      }
    },
    {
      "@type": "Question",
      "name": "Combien de temps dure un nettoyage fin de chantier ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La durée dépend de la superficie et du type de chantier. Pour un appartement de 100m², comptez 1 journée. Pour une villa de 300m², 2-3 jours. Pour des bureaux ou commerces, CCI établit un planning détaillé adapté à vos contraintes et délais de livraison."
      }
    },
    {
      "@type": "Question",
      "name": "Intervenez-vous sur tous types de chantiers à Tunis ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI intervient sur tous types de chantiers dans le Grand Tunis : résidentiel (appartements, villas, maisons), commercial (bureaux, magasins, restaurants), industriel (entrepôts, ateliers). Nous adaptons nos techniques et équipements à chaque projet."
      }
    },
    {
      "@type": "Question",
      "name": "Le nettoyage des vitres est-il inclus dans le TFC ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, le nettoyage fin de chantier de CCI inclut le nettoyage complet des vitres (intérieur/extérieur), cadres, châssis et volets. Nous éliminons traces de plâtre, ciment, peinture et autocollants de protection pour des vitres impeccables."
      }
    },
    {
      "@type": "Question",
      "name": "Fournissez-vous les produits et équipements de nettoyage ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, CCI fournit tous les produits professionnels, équipements et matériel nécessaires au nettoyage fin de chantier : aspirateurs industriels, nettoyeurs haute pression, détergents spécialisés, échelles, perches. Vous n'avez rien à fournir."
      }
    }
  ]
};
```

### 3. Update HeroHeader

```javascript
<HeroHeader title={"Nettoyage Fin de Chantier Professionnel à Tunis"} />
```

### 4. Update Content with Local Keywords

**First ServiceDetails:**
```javascript
title="Nettoyage fin de chantier (TFC) professionnel à Tunis"
text="CCI, spécialiste du nettoyage fin de chantier à Tunis depuis plus de 15 ans, intervient dans tout le Grand Tunis (L'Aouina, Ariana, La Marsa, Carthage, Ben Arous) pour entrepreneurs, promoteurs immobiliers et particuliers. Notre service TFC complet : dépoussiérage intégral (murs, plafonds, sols, menuiseries), nettoyage vitres intérieur/extérieur et châssis, décapage résidus (peinture, plâtre, ciment, colle), nettoyage sols (carrelage, marbre, parquet), désinfection sanitaires et cuisine, évacuation déchets et protections, aspiration industrielle HEPA. Nous intervenons sur tous types de chantiers : résidentiel (appartements, villas neuves ou rénovées), commercial (bureaux, magasins, showrooms), industriel (entrepôts, ateliers). Équipement professionnel : aspirateurs industriels, nettoyeurs haute pression, perches télescopiques, produits certifiés. Planning adapté à vos délais de livraison. Équipe formée, intervention rapide. Devis gratuit détaillé au 98-557-766."
```

### Key TFC SEO Keywords:
- nettoyage fin de chantier tunis ✓
- tfc tunis ✓
- nettoyage après travaux tunis ✓
- nettoyage chantier tunisie ✓

---

## 🎯 SUMMARY OF ENHANCEMENTS

### What to Add to Each Page:

1. ✅ **Metadata**: Title, description, keywords with "tunis"
2. ✅ **FAQ Schema**: 5 questions specific to service
3. ✅ **Service Schema**: Add `areaServed: "Tunis"`
4. ✅ **HeroHeader**: Add "Professionnel à Tunis"
5. ✅ **Content**: Add locations (L'Aouina, Ariana, La Marsa, Carthage, Ben Arous)
6. ✅ **CTAs**: Add phone number 98-557-766
7. ✅ **AboutUsTab**: Add Tunis/Tunisia mentions

### Expected Results Per Page:

- 📈 Rank for "{service} tunis" keywords
- 📈 FAQ rich snippets in search results
- 📈 15-30 organic clicks/month within 60-90 days
- 📈 Appear in Google local pack

### Total Implementation Time:
- **Per page**: 15-20 minutes
- **All 3 pages**: ~1 hour

---

## 📞 Next Steps After Implementation

1. **Test Structured Data**:
   - https://search.google.com/test/rich-results
   - Verify all FAQ and Service schemas

2. **Google Business Profile**:
   - Add each service as a separate service line
   - Update business description with location keywords

3. **Internal Linking**:
   - Link from homepage to each service page
   - Use anchor text with "tunis" keyword

4. **Monitor in Search Console**:
   - Track impressions for new keywords
   - Monitor CTR improvements
   - Check FAQ rich snippet appearances

**All changes follow the successful pattern from tapisserie and tapis pages!**
