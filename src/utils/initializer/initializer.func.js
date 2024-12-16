const resizeEvent = (setVw, setVh) => () => {
    setVw(window.innerWidth);
    setVh(window.innerHeight);
};

export const useInitializerLogic = () => {
    return {
        resizeEvent
    };
};