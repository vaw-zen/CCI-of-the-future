import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAllArticles, getArticlesByCategory } from '../../data/articles.js';
import { dimensionsStore } from '@/utils/store/store';

export function useConseilsLogic() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const activeFilter = categoryParam || 'all';

  const isMobile = dimensionsStore((state) => state.isMobile());

  // Use consistent filter order - start with desktop filters to avoid hydration mismatch
  const desktopFilters = [
    { key: 'all', label: '🔍 Tous les guides', category: null },
    { key: 'tapis', label: '🧽 Nettoyage Tapis', category: 'tapis' },
    { key: 'tapisserie', label: '🛋️ Nettoyage Tapisserie', category: 'tapisserie' },
    { key: 'marbre', label: '💎 Traitement Marbre', category: 'marbre' },
    { key: 'post-chantier', label: '🔧 Post-Chantier', category: 'post-chantier' },
    { key: 'commercial', label: '🏢 Nettoyage Commercial', category: 'commercial' }
  ];

  const mobileFilters = [
    { key: 'all', label: '🔍 Tous les guides', category: null },
    { key: 'commercial', label: '🏢 Nettoyage Commercial', category: 'commercial' },
    { key: 'marbre', label: '💎 Traitement Marbre', category: 'marbre' },
    { key: 'post-chantier', label: '🔧 Post-Chantier', category: 'post-chantier' },
    { key: 'tapis', label: '🧽 Nettoyage Tapis', category: 'tapis' },
    { key: 'tapisserie', label: '🛋️ Nettoyage Tapisserie', category: 'tapisserie' }
  ];

  const filters = isMobile ? mobileFilters : desktopFilters;

  const { featuredArticles, filteredArticles } = useMemo(() => {
    const allArticles = getAllArticles();

    if (activeFilter === 'all') {
      const sortedArticles = [...allArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      const latestTwoFeatured = sortedArticles.slice(0, 2);
      const remainingArticles = sortedArticles.slice(2);

      return {
        featuredArticles: latestTwoFeatured,
        filteredArticles: remainingArticles
      };
    }

    const categoryArticles = getArticlesByCategory(activeFilter);
    const sortedCategoryArticles = [...categoryArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    const featuredFromCategory = sortedCategoryArticles.slice(0, Math.min(2, sortedCategoryArticles.length));
    const remainingFromCategory = sortedCategoryArticles.slice(featuredFromCategory.length);

    return {
      featuredArticles: featuredFromCategory,
      filteredArticles: remainingFromCategory
    };
  }, [activeFilter]);

  const handleFilterClick = (filterKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterKey === 'all') {
      params.delete('category');
    } else {
      params.set('category', filterKey);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return {
    activeFilter,
    filteredArticles,
    featuredArticles,
    filters,
    handleFilterClick
  };
}
