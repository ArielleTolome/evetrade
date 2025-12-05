import { vi } from 'vitest';

vi.mock('../hooks/useResources', () => ({
    useLocationLookup: vi.fn(() => ({
        searchStations: vi.fn(),
        searchRegions: vi.fn(),
    })),
    useResources: () => ({
        invTypes: { '34': { typeID: 34, typeName: 'Tritanium' } },
        stationList: ['Jita IV-4'],
        regionList: ['The Forge'],
        loadInvTypes: vi.fn(),
        loading: false,
        error: null,
    }),
    ResourceProvider: ({ children }) => children,
}));
