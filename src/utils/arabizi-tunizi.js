// utils/arabizi-tunizi.js

// Mapping chiffres → lettres arabes phonétiques courantes
const arabiziMap = {
  '2': 'أ',
  '3': 'ع',
  '5': 'خ',
  '6': 'ط',
  '7': 'ح',
  '8': 'غ',
  '9': 'ص',
};

// Détecter si le texte est très probablement Arabizi tunisien
export function isTunizi(text) {
  // Contient au moins une lettre latine et un chiffre arabe/phonétique
  return /[a-zA-Z]/.test(text) && /[2-9]/.test(text);
}

// Convertit Arabizi → Arabe
export function arabiziToArabic(text) {
  return text.replace(/[2-9]/g, match => arabiziMap[match] || match);
}

// Convertit Arabe → Arabizi (simple inverse)
export function arabicToArabizi(text) {
  const inverseMap = Object.fromEntries(Object.entries(arabiziMap).map(([k, v]) => [v, k]));
  return text.replace(/[\u0621-\u064A]/g, char => inverseMap[char] || char);
}
