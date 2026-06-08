import test from 'node:test';
import assert from 'node:assert/strict';

import { getArticleBySlug } from '../src/app/conseils/data/articles.js';
import { getArticleView } from '../src/app/conseils/articleOverrides.mjs';

test('car interior article routes into the salon/service path', () => {
  const article = getArticleView(getArticleBySlug('nettoyage-voiture-interieur-tunis-2025'));

  assert.equal(article.category, 'salon');
  assert.equal(article.categoryLabel, 'Sellerie & Habitacle');
  assert.match(article.metaTitle, /Sellerie/i);
  assert.match(article.content, /service nettoyage textiles & sellerie/i);
  assert.match(article.content, /Voir le service sellerie/i);
  assert.match(article.content, /href="\/contact"/i);
  assert.match(article.content, /cluster-links-2026/);
});

test('retapissage article promotes the tapisserie service path earlier', () => {
  const article = getArticleView(
    getArticleBySlug('retapissage-rembourrage-professionnel-tunis-sur-mesure')
  );

  assert.match(article.content, /service principal à Tunis/i);
  assert.match(article.content, /service tapisserie sur mesure/i);
  assert.match(article.content, /Intervention Grand Tunis/i);
  assert.match(article.content, /href="\/contact"/i);
  assert.match(article.content, /Devis gratuit/i);
});

test('pricing article behaves more like a transactional moquette asset', () => {
  const article = getArticleView(getArticleBySlug('prix-nettoyage-tapis-tunis-tarifs-2025'));

  assert.match(article.metaTitle, /Tarif Moquette/i);
  assert.match(article.content, /services nettoyage tapis & moquette/i);
  assert.match(article.content, /Repères Grand Tunis/i);
  assert.match(article.content, /Service moquette/i);
  assert.match(article.content, /href="\/contact"/i);
});
