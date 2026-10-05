'use client';

import * as React from 'react';
import { CatalogItem, CatalogItemType } from '../domain/catalog.types';
import { CatalogApi } from '../infrastructure/catalog.api';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';

export type FilterTab = 'ALL' | CatalogItemType;

export function useCatalog() {
  const { user } = useCurrentUser();
  const businessId = user?.businessId;

  const [items, setItems] = React.useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters state
  const [activeTab, setActiveTab] = React.useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const loadItems = React.useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await CatalogApi.fetchCatalogItems(businessId);
      setItems(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los artículos del catálogo';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Derived filtered items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (activeTab === CatalogItemType.SERVICE && item.itemType !== CatalogItemType.SERVICE) return false;
      if (activeTab === CatalogItemType.PRODUCT && item.itemType !== CatalogItemType.PRODUCT) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

      // Search query (name, category, description, sku)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query) ?? false;
        const matchesSku = item.sku?.toLowerCase().includes(query) ?? false;

        return matchesName || matchesCategory || matchesDesc || matchesSku;
      }

      return true;
    });
  }, [items, activeTab, selectedCategory, searchQuery]);

  // Metrics
  const metrics = React.useMemo(() => {
    const totalServices = items.filter((i) => i.itemType === CatalogItemType.SERVICE).length;
    const totalProducts = items.filter((i) => i.itemType === CatalogItemType.PRODUCT).length;
    const totalActive = items.filter((i) => i.isActive).length;

    return {
      total: items.length,
      services: totalServices,
      products: totalProducts,
      active: totalActive,
    };
  }, [items]);

  return {
    items,
    filteredItems,
    isLoading,
    error,
    metrics,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    reload: loadItems,
  };
}
