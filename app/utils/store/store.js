import { create } from './provider';

const updateState = (set, stateKey, value) => {
    set((state) => ({
        [stateKey]: typeof value === 'function' ? value(state[stateKey]) : value,
    }));
};

export const dimensionsStore = create((set) => ({
    vw: 0, // viewport width
    setVw: (width) => set({ vw: width }),

    // Optional: Add breakpoint helpers
    isMobile: () => {
        const { vw } = dimensionsStore.getState();
        return vw <= 480;
    },
    isTablet: () => {
        const { vw } = dimensionsStore.getState();
        return vw > 480 && vw <= 1024;
    },
    isDesktop: () => {
        const { vw } = dimensionsStore.getState();
        return vw >= 1024;
    }
}));
