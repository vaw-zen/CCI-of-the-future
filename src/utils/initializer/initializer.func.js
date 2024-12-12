const resizeEvent = (setVw) => () => {
    setVw(window.innerWidth);
};

export const useInitializerLogic = () => {
    return {
        resizeEvent
    };
};