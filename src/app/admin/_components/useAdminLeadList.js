'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { getAdminLeadDetail, getAdminLeadSummaries } from '@/services/adminLeadService';

const DEFAULT_LIMIT = 50;

export function useAdminLeadList(kind, {
  filters = {},
  limit = DEFAULT_LIMIT
} = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState('');
  const [detailErrorById, setDetailErrorById] = useState({});
  const detailCacheRef = useRef(new Map());
  const listRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(new Map());

  const serializedFilters = useMemo(() => JSON.stringify(filters || {}), [filters]);

  const loadRequests = useCallback(async ({
    append = false,
    cursor = append ? nextCursor : null
  } = {}) => {
    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await getAdminLeadSummaries(kind, {
        ...JSON.parse(serializedFilters),
        limit,
        cursor: cursor || undefined
      });

      if (listRequestIdRef.current !== requestId) {
        return;
      }

      setRequests((currentRequests) => (
        append
          ? [...currentRequests, ...result.rows.filter((row) => !currentRequests.some((current) => current.id === row.id))]
          : result.rows
      ));
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setError(null);
    } catch (loadError) {
      if (listRequestIdRef.current !== requestId) {
        return;
      }

      console.error(loadError);
      setError(loadError.message || 'Erreur lors du chargement des leads.');
    } finally {
      if (listRequestIdRef.current === requestId) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [kind, limit, nextCursor, serializedFilters]);

  const refresh = useCallback(async () => {
    await loadRequests({ append: false, cursor: null });
  }, [loadRequests]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    await loadRequests({ append: true, cursor: nextCursor });
  }, [hasMore, loadRequests, loadingMore, nextCursor]);

  const getDetail = useCallback(async (id, { force = false } = {}) => {
    if (!id) {
      return null;
    }

    if (!force && detailCacheRef.current.has(id)) {
      return detailCacheRef.current.get(id);
    }

    const requestId = (detailRequestIdRef.current.get(id) || 0) + 1;
    detailRequestIdRef.current.set(id, requestId);
    setDetailLoadingId(id);
    setDetailErrorById((current) => ({
      ...current,
      [id]: ''
    }));

    try {
      const detail = await getAdminLeadDetail(kind, id);
      if (detailRequestIdRef.current.get(id) !== requestId) {
        return detailCacheRef.current.get(id) || detail;
      }

      detailCacheRef.current.set(id, detail);
      setRequests((currentRequests) => currentRequests.map((request) => (
        request.id === detail.id ? { ...request, ...detail } : request
      )));

      return detail;
    } catch (loadError) {
      console.error(loadError);
      setDetailErrorById((current) => ({
        ...current,
        [id]: loadError.message || 'Impossible de charger le détail du lead.'
      }));
      throw loadError;
    } finally {
      if (detailRequestIdRef.current.get(id) === requestId) {
        setDetailLoadingId((current) => (current === id ? '' : current));
      }
    }
  }, [kind]);

  const getCachedDetail = useCallback((id) => detailCacheRef.current.get(id) || null, []);

  const upsertLead = useCallback((updatedLead) => {
    if (!updatedLead?.id) {
      return;
    }

    detailCacheRef.current.set(updatedLead.id, updatedLead);
    setRequests((currentRequests) => {
      const existing = currentRequests.some((request) => request.id === updatedLead.id);
      if (!existing) {
        return [updatedLead, ...currentRequests];
      }

      return currentRequests.map((request) => (
        request.id === updatedLead.id ? { ...request, ...updatedLead } : request
      ));
    });
  }, []);

  const invalidateDetail = useCallback((id) => {
    if (!id) {
      return;
    }

    detailCacheRef.current.delete(id);
  }, []);

  return {
    requests,
    setRequests,
    loading,
    loadingMore,
    error,
    hasMore,
    nextCursor,
    loadRequests,
    refresh,
    loadMore,
    getDetail,
    getCachedDetail,
    upsertLead,
    invalidateDetail,
    detailLoadingId,
    detailErrorById
  };
}
