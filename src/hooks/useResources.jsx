import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCached, setCached } from './useCache';
import { fetchResource } from '../api/client';
import { RESOURCE_FILES } from '../utils/constants';
import { getStationData, getRegionData } from '../utils/stations';
import { ErrorBoundary, ResourceErrorFallback } from '../components/common/ErrorBoundary';

/**
 * Resource Context
 */
const RESOURCE_CONTEXT_KEY = '__EVETRADE_RESOURCE_CONTEXT__';

function getResourceContext() {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis[RESOURCE_CONTEXT_KEY]) {
      globalThis[RESOURCE_CONTEXT_KEY] = createContext(null);
    }
    return globalThis[RESOURCE_CONTEXT_KEY];
  }
  // Fallback for environments without globalThis (shouldn't happen in browser, but keeps SSR/tests happy)
  return createContext(null);
}

const ResourceContext = getResourceContext();

/**
 * Build nearby regions map from universe data
 * @param {object} universeList - Universe data
 * @returns {object} Nearby regions mapping
 */
function buildNearbyRegions(universeList) {
  const nearby = {};

  if (!universeList) return nearby;

  for (const [name, data] of Object.entries(universeList)) {
    if (data.around) {
      nearby[name] = data.around;
    }
  }

  return nearby;
}

/**
 * Resource Provider Component
 */
export function ResourceProvider({ children }) {
  const [resources, setResources] = useState({
    universeList: null,
    regionList: null,
    stationList: null,
    structureList: null,
    structureInfo: null,
    functionDurations: null,
    nearbyRegions: null,
    invTypes: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: RESOURCE_FILES.length });

  // Ref to access current resources without triggering re-renders or causing stale closures
  const resourcesRef = useRef(resources);
  // Ref to track pending loadInvTypes promise to prevent race conditions
  const loadInvTypesPromiseRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);
  /**
   * Load a single resource with caching
   */
  const loadResource = async (name) => {
    // Check cache first
    let data = await getCached(name);

    if (!data) {
      // Fetch from S3
      data = await fetchResource(name);
      // Cache the data
      await setCached(name, data);
    }

    return data;
  };

  /**
   * Load all resources
   */
  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loaded = {};
      // Use ref for atomic progress counter to avoid race conditions
      const progressRef = { current: 0 };

      // Load resources in parallel
      const promises = RESOURCE_FILES.map(async (name) => {
        const data = await loadResource(name);
        loaded[name] = data;
        // Increment atomically and update state
        progressRef.current++;
        setLoadingProgress({ current: progressRef.current, total: RESOURCE_FILES.length });
        return { name, data };
      });

      await Promise.all(promises);

      // Merge structures into stationList
      if (loaded.structureList && loaded.stationList) {
        loaded.stationList = [
          ...loaded.stationList,
          ...loaded.structureList.map((s) => `${s}*`),
        ];
      }

      // Build nearby regions map
      loaded.nearbyRegions = buildNearbyRegions(loaded.universeList);

      setResources(loaded);
      setLoading(false);
    } catch (_err) {
      console.error('Failed to load resources:', err);
      setError(err);
      setLoading(false);
    }
  }, []);

  /**
   * Reload resources (force refresh)
   */
  const reloadResources = useCallback(async () => {
    // Clear cache for each resource
    for (const name of RESOURCE_FILES) {
      await setCached(name, null);
    }
    // Reload
    await loadResources();
  }, [loadResources]);

  /**
   * Load invTypes on demand (for orders page)
   * Uses promise caching to prevent race conditions when called multiple times
   */
  const loadInvTypes = useCallback(async () => {
    // Check current state via ref to avoid stale closure
    if (resourcesRef.current.invTypes) {
      return resourcesRef.current.invTypes;
    }

    // Return existing promise if one is already in flight (prevents race conditions)
    if (loadInvTypesPromiseRef.current) {
      return loadInvTypesPromiseRef.current;
    }

    // Create and cache the promise
    loadInvTypesPromiseRef.current = (async () => {
      try {
        let data = await getCached('invTypes');

        if (!data) {
          data = await fetchResource('invTypes');
          await setCached('invTypes', data);
        }

        setResources((prev) => ({ ...prev, invTypes: data }));
        return data;
      } catch (_err) {
        console.error('Failed to load invTypes:', err);
        throw err;
      } finally {
        // Clear the promise ref after completion
        loadInvTypesPromiseRef.current = null;
      }
    })();

    return loadInvTypesPromiseRef.current;
  }, []); // Empty dependency array - uses ref to avoid stale closure

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const value = {
    ...resources,
    loading,
    error,
    loadingProgress,
    reloadResources,
    loadInvTypes,
  };

  // Show error fallback if resource loading failed
  if (error && !loading) {
    return (
      <ResourceErrorFallback
        error={error}
        resetError={loadResources}
        loadingProgress={loadingProgress}
      />
    );
  }

  return (
    <ErrorBoundary
      title="Resource Loading Error"
      message="Failed to load game resources. Please try again."
      onReset={loadResources}
    >
      <ResourceContext.Provider value={value}>
        {children}
      </ResourceContext.Provider>
    </ErrorBoundary>
  );
}

/**
 * Hook to access resources
 */
export function useResources() {
  const context = useContext(ResourceContext);

  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }

  return context;
}

/**
 * Hook to get location data from universe list
 */
export function useLocationLookup() {
  const { universeList, stationList, regionList } = useResources();

  const getLocationData = useCallback(
    (locationName) => {
      if (!universeList || !locationName) return null;
      return getStationData(locationName, universeList);
    },
    [universeList]
  );

  const getRegionDataFn = useCallback(
    (regionName) => {
      if (!universeList || !regionName) return null;
      return getRegionData(regionName, universeList);
    },
    [universeList]
  );

  const searchStations = useCallback(
    (query, limit = 10) => {
      if (!stationList || !query) return [];

      const lowerQuery = query.toLowerCase();
      return stationList
        .filter((station) => station.toLowerCase().includes(lowerQuery))
        .slice(0, limit);
    },
    [stationList]
  );

  const searchRegions = useCallback(
    (query, limit = 10) => {
      if (!regionList || !query) return [];

      const lowerQuery = query.toLowerCase();
      return regionList
        .filter((region) => region.toLowerCase().includes(lowerQuery))
        .slice(0, limit);
    },
    [regionList]
  );

  return {
    getLocationData,
    getRegionData: getRegionDataFn,
    searchStations,
    searchRegions,
  };
}
