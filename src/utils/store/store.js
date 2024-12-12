import { create } from '../../libs/vz/store/provider';

export const dimensionsStore = create((set) => ({
    vw: 0, 
    setVw: (width) => set({ vw: width }),

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
