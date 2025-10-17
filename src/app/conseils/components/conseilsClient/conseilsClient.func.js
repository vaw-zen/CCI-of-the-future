import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllArticles, getArticlesByCategory } from '../../data/articles';
import { dimensionsStore } from '@/utils/store/store';

export function useConseilsLogic() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [activeFilter, setActiveFilter] = useState(categoryParam || 'all');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  const isMobile = dimensionsStore((state) => state.isMobile());

  // Use consistent filter order - start with desktop filters to avoid hydration mismatch
  const desktopFilters = [
    { key: 'all', label: '🔍 Tous les guides', category: null },
    { key: 'tapis', label: '🧽 Nettoyage Tapis', category: 'tapis' },
    { key: 'tapisserie', label: '🛋️ Nettoyage Tapisserie', category: 'tapisserie' },
    { key: 'marbre', label: '💎 Traitement Marbre', category: 'marbre' },
    { key: 'post-chantier', label: '🔧 Post-Chantier', category: 'post-chantier' }
  ];

  const mobileFilters = [
    { key: 'all', label: '🔍 Tous les guides', category: null },
    { key: 'marbre', label: '💎 Traitement Marbre', category: 'marbre' },
    { key: 'post-chantier', label: '🔧 Post-Chantier', category: 'post-chantier' },
    { key: 'tapis', label: '🧽 Nettoyage Tapis', category: 'tapis' },
    { key: 'tapisserie', label: '🛋️ Nettoyage Tapisserie', category: 'tapisserie' }
  ];

  // Always use desktop filters during SSR to prevent hydration mismatch
  const filters = isClient && isMobile ? mobileFilters : desktopFilters;

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const allArticles = getAllArticles();

    if (activeFilter === 'all') {
      const sortedArticles = [...allArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      const latestTwoFeatured = sortedArticles.slice(0, 2);
      const remainingArticles = sortedArticles.slice(2);

      setFeaturedArticles(latestTwoFeatured);
      setFilteredArticles(remainingArticles);
    } else {
      const categoryArticles = getArticlesByCategory(activeFilter);
      const sortedCategoryArticles = [...categoryArticles].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      const featuredFromCategory = sortedCategoryArticles.slice(0, Math.min(2, sortedCategoryArticles.length));
      const remainingFromCategory = sortedCategoryArticles.slice(featuredFromCategory.length);

      setFeaturedArticles(featuredFromCategory);
      setFilteredArticles(remainingFromCategory);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(categoryParam);
    }
  }, [categoryParam]);

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey);

    const url = new URL(window.location);
    if (filterKey === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', filterKey);
    }
    window.history.pushState({}, '', url);
  };

  return {
    activeFilter,
    filteredArticles,
    featuredArticles,
    filters,
    handleFilterClick,
    isClient
  };
}
