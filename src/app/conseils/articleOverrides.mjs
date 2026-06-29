const ARTICLE_OVERRIDES = {
  'prix-nettoyage-tapis-tunis-tarifs-2025': {
    metaTitle: 'Prix Nettoyage Tapis Tunis 2025 | Tarif Moquette & Devis | CCI Services',
    metaDescription:
      'Prix nettoyage tapis à Tunis : tarif moquette, injection-extraction, devis rapide et intervention Grand Tunis avec CCI Services.',
  },
  'nettoyage-voiture-interieur-tunis-2025': {
    metaTitle: 'Nettoyage Intérieur Voiture Tunis | Sièges, Moquettes & Sellerie | CCI Services',
    metaDescription:
      "Nettoyage intérieur voiture à Tunis : sièges textile ou cuir, moquettes, odeurs et sellerie légère. Devis rapide CCI Services dans le Grand Tunis.",
    excerpt:
      "L'intérieur de votre voiture mérite un nettoyage en profondeur ? CCI Services Tunisie traite sièges, moquettes, odeurs et sellerie légère avec un devis rapide dans le Grand Tunis.",
    category: 'salon',
    categoryLabel: 'Sellerie & Habitacle',
    keywords: [
      'nettoyage voiture intérieur',
      'nettoyage auto tunis',
      'entretien voiture tunis',
      'lavage intérieur voiture',
      'sellerie auto tunis',
      'nettoyage siège voiture tunis',
      'odeur voiture tunis',
      'CCI services',
    ],
  },
};

function replaceSegment(content, from, to) {
  return content.includes(from) ? content.replace(from, to) : content;
}

function enhancePricingArticle(content) {
  let next = content;

  next = replaceSegment(
    next,
    `<div class="info-box">
        <p>📞 <strong>Devis Express :</strong> Appelez le <a href="tel:+21698557766" style="color: var(--ac-primary); font-weight: 600;">+216 98-557-766</a> ou demandez un <a href="/devis" style="color: var(--ac-primary); font-weight: 600;">devis en ligne gratuit</a>.</p>
      </div>

      <div class="related-services">
        <p>🔗 <strong>Guides détaillés :</strong> Consultez notre guide complet <a href="/conseils/guide-nettoyage-tapis-tunis-2025" style="color: var(--ac-primary); font-weight: 600;">nettoyage tapis tunis</a>, découvrez nos techniques de <a href="/conseils/nettoyage-salon-canape-tunis-2026" style="color: var(--ac-primary); font-weight: 600;">shampouinage moquette tunis</a> et nos services <a href="/conseils/nettoyage-post-chantier-tunisie-fin-travaux" style="color: var(--ac-primary); font-weight: 600;">nettoyage post-chantier tunisie</a>.</p>
      </div>`,
    `<div class="info-box">
        <p>📞 <strong>Devis Express :</strong> comparez nos <a href="/tapis" style="color: var(--ac-primary); font-weight: 600;">services nettoyage tapis & moquette</a>, appelez le <a href="tel:+21698557766" style="color: var(--ac-primary); font-weight: 600;">+216 98-557-766</a> ou lancez votre <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">demande de devis sur la page contact</a>.</p>
      </div>

      <div class="related-services">
        <p>🔗 <strong>Guides détaillés :</strong> consultez notre guide complet <a href="/conseils/guide-nettoyage-tapis-tunis-2025" style="color: var(--ac-primary); font-weight: 600;">nettoyage tapis tunis</a>, la méthode <a href="/conseils/injection-extraction-tapis-tunis-2025" style="color: var(--ac-primary); font-weight: 600;">injection-extraction</a>, le dossier <a href="/conseils/nettoyage-moquette-bureau-tunis-2026" style="color: var(--ac-primary); font-weight: 600;">moquette bureau</a> et notre <a href="/tapis" style="color: var(--ac-primary); font-weight: 600;">page service moquette</a>.</p>
      </div>

      <div class="info-box">
        <p>📍 <strong>Repères Grand Tunis :</strong> nous intervenons à Tunis, Ariana, La Marsa, Carthage et Ben Arous. Pour un budget rapide, envoyez les dimensions et 1 à 3 photos via <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">notre formulaire de devis</a> ou appelez-nous directement.</p>
      </div>`
  );

  next = replaceSegment(
    next,
    `<div class="info-box">
        <p>🔗 <strong>Services Complémentaires :</strong> Profitez aussi de nos tarifs préférentiels pour le <a href="/salon" style="color: var(--ac-primary); font-weight: 600;">nettoyage de salons</a> et <a href="/marbre" style="color: var(--ac-primary); font-weight: 600;">traitement du marbre</a>.</p>
      </div>`,
    `<div class="info-box">
        <p>🧭 <strong>Passage à l'action :</strong> ce guide prix est notre page d'intention tarifaire. Si vous êtes prêt à réserver, allez vers <a href="/tapis" style="color: var(--ac-primary); font-weight: 600;">le service nettoyage tapis & moquette</a> puis lancez votre <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis gratuit</a>.</p>
      </div>`
  );

  next = replaceSegment(
    next,
    `<a href="/" class="btn-website">
            🌐 cciservices.online
          </a>`,
    `<a href="/tapis" class="btn-website">
            🧶 Service moquette
          </a>`
  );

  return next;
}

function enhanceVoitureArticle(content) {
  let next = content;

  next = replaceSegment(
    next,
    `<div class="info-box">
    <p><b>Cas pris en charge :</b> moisissures, odeurs persistantes, taches incrustées, assises textiles encrassées et remises en état après immobilisation ou humidité.</p>
  </div>`,
    `<div class="info-box">
    <p><b>Cas pris en charge :</b> moisissures, odeurs persistantes, taches incrustées, assises textiles encrassées et remises en état après immobilisation ou humidité.</p>
  </div>

  <div class="info-box">
    <p>🚗 <strong>Parcours le plus rapide :</strong> si votre besoin concerne la sellerie textile, les sièges, les moquettes ou une désinfection d'habitacle dans le Grand Tunis, passez par notre <a href="/salon" style="color: var(--ac-primary); font-weight: 600;">service nettoyage textiles & sellerie</a> ou demandez un <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis rapide</a>.</p>
  </div>`
  );

  next = replaceSegment(
    next,
    `<h2 id="section-tarifs">Tarifs et Zones d'Intervention</h2>`,
    `<div class="info-box">
    <p><b>Zone couverte :</b> Tunis, Ariana, La Marsa, Carthage, El Aouina et Ben Arous. Nous intervenons sur citadines, SUV, utilitaires légers et véhicules de société avec diagnostic avant devis.</p>
  </div>

  <h2 id="section-tarifs">Tarifs et Zones d'Intervention</h2>`
  );

  next = replaceSegment(
    next,
    `<div class="contact-section">
        <a href="tel:+21698557766" class="button">Appeler maintenant (+216 98-557-766)</a>
        <a href="mailto:contact@cciservices.online" class="button">Envoyer un email</a>
        <p><b>CCI Services Tunisie</b><br>06 Rue Galant de nuit, L'Aouina, Tunis 2045</p>
    </div>`,
    `<div class="contact-section">
        <a href="tel:+21698557766" class="button">Appeler maintenant (+216 98-557-766)</a>
        <a href="/contact" class="button">Demander un devis</a>
        <a href="/salon" class="button">Voir le service sellerie</a>
        <p><b>CCI Services Tunisie</b><br>06 Rue Galant de nuit, L'Aouina, Tunis 2045</p>
    </div>`
  );

  next = replaceSegment(
    next,
    `  <p>N'oubliez pas, un <b>nettoyage voiture intérieur</b> régulier est un investissement dans le confort, l'hygiène et la valeur de votre véhicule. Confiez cette tâche à des professionnels pour un résultat impeccable!</p>
</div>`,
    `  <p>N'oubliez pas, un <b>nettoyage voiture intérieur</b> régulier est un investissement dans le confort, l'hygiène et la valeur de votre véhicule. Confiez cette tâche à des professionnels pour un résultat impeccable!</p>
</div>

<div class="info-box cluster-links-2026"><p>🔗 <strong>Continuer :</strong> comparez notre <a href="/salon" style="color: var(--ac-primary); font-weight: 600;">service nettoyage salon & sellerie</a>, le guide <a href="/conseils/nettoyage-salon-canape-tunis-2026" style="color: var(--ac-primary); font-weight: 600;">salon & canapé</a>, les <a href="/conseils/tarif-nettoyage-salon-tunis-2026" style="color: var(--ac-primary); font-weight: 600;">tarifs nettoyage salon</a> et lancez votre <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis gratuit</a>.</p></div>`
  );

  return next;
}

function enhanceRetapissageArticle(content) {
  let next = content;

  if (!next.includes('Service principal à Tunis')) {
    next = next.replace(
      `<p>Que ce soit pour un fauteuil vintage de famille, un canapé designer ou des banquettes professionnelles, notre expertise en retapissage garantit un résultat à la hauteur de vos attentes, alliant esthétique, confort et durabilité.</p>`,
      `<p>Que ce soit pour un fauteuil vintage de famille, un canapé designer ou des banquettes professionnelles, notre expertise en retapissage garantit un résultat à la hauteur de vos attentes, alliant esthétique, confort et durabilité.</p>

      <div class="info-box">
        <p>🧵 <strong>Service principal à Tunis :</strong> si vous cherchez un tapissier à Tunis pour retapissage, changement de mousse ou rénovation d'assises, allez directement vers notre <a href="/tapisserie" style="color: var(--ac-primary); font-weight: 600;">service tapisserie sur mesure</a>, demandez un <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis personnalisé</a> ou utilisez notre <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">contact rapide</a>.</p>
      </div>

      <div class="info-box">
        <p>📍 <strong>Intervention Grand Tunis :</strong> L'Aouina, Tunis, Ariana, La Marsa et Carthage. Nous prenons en charge fauteuils, chaises de bureau, banquettes, têtes de lit et assises commerciales avec diagnostic atelier avant devis.</p>
      </div>`
    );
  }

  next = replaceSegment(
    next,
    `<div class="info-box">
        <p>🛋️ <strong>Expertise complète :</strong> Découvrez nos spécialités en <a href="/salon" style="color: var(--ac-primary); font-weight: 600;">nettoyage de mobilier</a>, <a href="/conseils/tapisserie-nautique-ignifuge-carthage-tanit-ferry" style="color: var(--ac-primary); font-weight: 600;">tapisserie nautique</a> et obtenez un <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis personnalisé</a>.</p>
      </div>

      <div class="related-services">
        <p>🔗 <strong>Services connexes :</strong> Maîtrisez l'<a href="/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet" style="color: var(--ac-primary); font-weight: 600;">entretien canapé cuir</a>, découvrez le <a href="/conseils/nettoyage-salon-canape-tunis-2026" style="color: var(--ac-primary); font-weight: 600;">nettoyage tissus d'ameublement</a> et consultez nos <a href="/conseils/prix-nettoyage-tapis-tunis-tarifs-2025" style="color: var(--ac-primary); font-weight: 600;">tarifs transparents</a>.</p>
      </div>`,
    `<div class="info-box">
        <p>🧵 <strong>Service principal à Tunis :</strong> si vous cherchez un tapissier à Tunis pour retapissage, changement de mousse ou rénovation d'assises, allez directement vers notre <a href="/tapisserie" style="color: var(--ac-primary); font-weight: 600;">service tapisserie sur mesure</a>, demandez un <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">devis personnalisé</a> ou utilisez notre <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">contact rapide</a>.</p>
      </div>

      <div class="related-services">
        <p>🔗 <strong>Services connexes :</strong> consultez notre page <a href="/tapisserie" style="color: var(--ac-primary); font-weight: 600;">tapisserie sur mesure</a>, notre retour d'expérience <a href="/conseils/tapisserie-nautique-ignifuge-carthage-tanit-ferry" style="color: var(--ac-primary); font-weight: 600;">tapisserie nautique</a> et notre guide <a href="/conseils/changement-mousse-siege-professionnel-tunis-renovation" style="color: var(--ac-primary); font-weight: 600;">changement de mousse</a>.</p>
      </div>

      <div class="info-box">
        <p>📍 <strong>Intervention Grand Tunis :</strong> L'Aouina, Tunis, Ariana, La Marsa et Carthage. Nous prenons en charge fauteuils, chaises de bureau, banquettes, têtes de lit et assises commerciales avec diagnostic atelier avant devis.</p>
      </div>`
  );

  next = replaceSegment(
    next,
    `<div class="info-box">
        <p>📋 <strong>Vous avez des sièges de bureau usés ?</strong> Nous rénovons les chaises, fauteuils direction, assises d'accueil et banquettes professionnelles. <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">Demander un devis</a>.</p>
      </div>`,
    `<div class="info-box">
        <p>📋 <strong>Vous avez des sièges de bureau usés ?</strong> Nous rénovons les chaises, fauteuils direction, assises d'accueil et banquettes professionnelles. <a href="/tapisserie" style="color: var(--ac-primary); font-weight: 600;">Voir le service tapisserie</a> ou <a href="/contact" style="color: var(--ac-primary); font-weight: 600;">demander un devis</a>.</p>
      </div>`
  );

  next = replaceSegment(
    next,
    `<p><strong>Contactez-nous pour votre projet de retapissage sur mesure :</strong></p>`,
    `<p><strong>Contactez-nous pour votre projet de retapissage sur mesure, changement de mousse ou rénovation d'assise :</strong></p>`
  );

  next = replaceSegment(
    next,
    `<a href="mailto:contact@cciservices.online" class="btn-email">
            📧 contact@cciservices.online
          </a>`,
    `<a href="/contact" class="btn-email">
            📧 Devis gratuit
          </a>`
  );

  next = replaceSegment(
    next,
    `<p><strong>Retapissage • Rembourrage • Confection Sur Mesure • Garantie 2 ans</strong></p>`,
    `<p><strong>Retapissage • Rembourrage • Confection Sur Mesure • Grand Tunis • Garantie 2 ans</strong></p>`
  );

  return next;
}

const ARTICLE_CONTENT_OVERRIDES = {
  'prix-nettoyage-tapis-tunis-tarifs-2025': enhancePricingArticle,
  'nettoyage-voiture-interieur-tunis-2025': enhanceVoitureArticle,
  'retapissage-rembourrage-professionnel-tunis-sur-mesure': enhanceRetapissageArticle,
};

export function getArticleView(article) {
  if (!article) {
    return article;
  }

  const override = ARTICLE_OVERRIDES[article.slug] ?? {};
  const mergedArticle = {
    ...article,
    ...override,
  };

  const enhanceContent = ARTICLE_CONTENT_OVERRIDES[article.slug];
  mergedArticle.content = enhanceContent ? enhanceContent(mergedArticle.content) : mergedArticle.content;

  return mergedArticle;
}
