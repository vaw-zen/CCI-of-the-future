import vm from 'vm';

const FILE_HEADER = `// Base de données des articles de blog SEO
`;

const FILE_HELPERS = `

// Fonction utilitaire pour récupérer un article par slug
export function getArticleBySlug(slug) {
  return articles.find(article => article.slug === slug);
}

// Fonction utilitaire pour récupérer tous les articles
export function getAllArticles() {
  return articles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
}

// Fonction utilitaire pour récupérer les articles par catégorie
export function getArticlesByCategory(category) {
  return articles.filter(article => article.category === category);
}

// Fonction utilitaire pour récupérer les articles en vedette
export function getFeaturedArticles() {
  return articles.filter(article => article.featured);
}
`;

function extractArticlesArrayLiteral(source) {
  const exportToken = 'export const articles =';
  const exportIndex = source.indexOf(exportToken);

  if (exportIndex === -1) {
    throw new Error('Could not find articles export in articles.js');
  }

  const arrayStart = source.indexOf('[', exportIndex);
  if (arrayStart === -1) {
    throw new Error('Could not find articles array start in articles.js');
  }

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === '\'' || char === '`') {
      quote = char;
      continue;
    }

    if (char === '[') {
      depth += 1;
      continue;
    }

    if (char === ']') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(arrayStart, index + 1);
      }
    }
  }

  throw new Error('Could not find articles array end in articles.js');
}

export function parseArticlesFile(source) {
  const arrayLiteral = extractArticlesArrayLiteral(source);
  const parsedArticles = vm.runInNewContext(`(${arrayLiteral})`);

  if (!Array.isArray(parsedArticles)) {
    throw new Error('Parsed articles content is not an array');
  }

  return parsedArticles;
}

export function generateArticlesFileContent(articles) {
  const articlesJson = JSON.stringify(articles, null, 2);
  const exportStatement = `export const articles = ${articlesJson};`;

  return FILE_HEADER + exportStatement + FILE_HELPERS;
}
