import { useCallback } from 'react';
import { useResources } from './useResourcesHook';
import { getStationData, getRegionData } from '../utils/stations';

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
