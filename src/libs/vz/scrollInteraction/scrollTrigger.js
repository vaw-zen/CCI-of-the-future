
import scrollManager from "./scrollManager";

export let VzSIFactor = 1;
export function setVzSIFactor(param) { VzSIFactor = param; }

class ScrollInteractionManager {
    constructor() {
        this.instances = new Map();
        this.vw = 0;
        this.boundHandleResize = this.handleResize.bind(this);
        this.resizeTimeout = null;
        this.isListenerAttached = false;
    }

    initialize() {
        if (typeof window === 'undefined') return;
        
        if (!this.isListenerAttached) {
            this.vw = window.innerWidth;
            this.setupResizeListener();
            this.isListenerAttached = true;
        }
    }

    cleanup() {
        if (typeof window === 'undefined') return;

        if (this.isListenerAttached) {
            window.removeEventListener('resize', this.boundHandleResize);
            this.isListenerAttached = false;
        }
        if (this.resizeTimeout) {
            window.cancelAnimationFrame(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        this.instances.clear();
    }

    setupResizeListener() {
        if (typeof window === 'undefined') return;

        const debouncedResize = () => {
            if (this.resizeTimeout) {
                window.cancelAnimationFrame(this.resizeTimeout);
            }

            this.resizeTimeout = window.requestAnimationFrame(() => {
                this.handleResize();
            });
        };

        window.addEventListener('resize', debouncedResize, { passive: true });
    }

    handleResize() {
        if (typeof window === 'undefined') return;

        this.vw = window.innerWidth;
        this.instances.forEach((instance, key) => {
            const { element, options, state } = instance;
            const ref = element.current || element.target || element;
            if (!ref) return;

            const start = this.calcTop(ref, options.startPoint);
            const end = this.calcBot(ref, options.endPoint);
            const scroll = window.scrollY;
            const percentages = [];

            state.scrolled = false;

            if (options.unrestrictedCallback) {
                options.unrestrictedCallback({ ref, vw: this.vw });
            }

            this.triggerScroll(instance, scroll, start, end, percentages);
        });
    }

    createInstance(key, element, options = {}) {
        this.initialize();

        const {
            values = [],
            startPoint = [0.5],
            endPoint = [0.15, 1],
            callback,
            unrestrictedCallback = null,
            isUnrestricted = false
        } = options;

        if (this.instances.has(key)) {
            const existingInstance = this.instances.get(key);
            Object.assign(existingInstance.options, options);
            return existingInstance;
        }

        const instance = {
            element,
            options: {
                values,
                startPoint,
                endPoint,
                callback,
                isUnrestricted,
                unrestrictedCallback
            },
            state: {
                scrolled: false,
                init: false
            }
        };

        this.instances.set(key, instance);
        this.initializeScrollListener(key);

        return instance;
    }

    removeInstance(key) {
        this.instances.delete(key);
        if (scrollManager) {
            scrollManager.removeInstance(key);
        }

        if (this.instances.size === 0) {
            this.cleanup();
        }
    }

    initializeScrollListener(key) {
        const instance = this.instances.get(key);
        if (!instance || !scrollManager) return;

        scrollManager.createInstance(key, () => {
            this.handleScroll(key);
        });
    }

    handleScroll(key) {
        if (typeof window === 'undefined') return;

        const instance = this.instances.get(key);
        if (!instance) return;

        const { element, options, state } = instance;
        const ref = element.current || element.target || element;
        if (!ref) return;

        const start = this.calcTop(ref, options.startPoint);
        const end = this.calcBot(ref, options.endPoint);
        const scroll = window.scrollY;
        const percentages = [];

        if (options.unrestrictedCallback && !state.init) {
            state.init = true;
            this.triggerScroll(instance, scroll, start, end, percentages);
            state.scrolled = true;
            return;
        }

        this.triggerScroll(instance, scroll, start, end, percentages);
    }

    triggerScroll(instance, scroll, start, end, percentages) {
        const { element, options, state } = instance;
        const ref = element.current || element.target || element;

        if (start > scroll && !state.scrolled) {
            this.calculatePercentages(percentages, options.values, 0);
            options.callback({ v: percentages, ref, vw: this.vw });
            state.scrolled = true;
        } else if (scroll > end && !state.scrolled) {
            this.calculatePercentages(percentages, options.values, 1);
            options.callback({ v: percentages, ref, vw: this.vw });
            state.scrolled = true;
        }

        if (scroll <= end && start <= scroll) {
            const progress = (scroll - start) / (end - start);
            this.calculatePercentages(percentages, options.values, progress);
            options.callback({ v: percentages, ref, vw: this.vw, start, end });
            if (state.scrolled) {
                state.scrolled = false;
            }
        }
    }

    calculatePercentages(percentages, values, progress) {
        values.forEach(([start, end]) => {
            percentages.push(start + (end - start) * progress);
        });
    }

    toggleInstance(key, enabled) {
        if (scrollManager) {
            scrollManager.toggleInstance(key, enabled);
        }
    }

    calcTop(ref, customStart) {
        if (typeof window === 'undefined') return 0;

        let dist = this.distance(ref);
        const height = window.innerHeight / VzSIFactor;
        const clientHeight = ref.clientHeight / VzSIFactor;

        if (customStart) {
            if (Array.isArray(customStart) && customStart.length) {
                if (customStart.length === 1) {
                    return dist - (height * (1 - customStart[0]));
                } else if (customStart.length === 2) {
                    return dist - (height * (1 - customStart[0])) + (clientHeight * customStart[1]);
                } else if (customStart.length === 3) {
                    return customStart[2];
                } else if (customStart.length === 4) {
                    return dist - (height * (1 - customStart[0])) + (clientHeight * customStart[1]) + (customStart[3] / VzSIFactor);
                }
            } else {
                return dist - (height * (customStart ? (1 - customStart) : 1));
            }
        }
        return dist - height;
    }

    calcBot(ref, customEnd) {
        if (typeof window === 'undefined') return 0;

        let dist = this.distance(ref);
        const height = window.innerHeight / VzSIFactor;
        const clientHeight = ref.clientHeight / VzSIFactor;

        dist += clientHeight;
        if (customEnd) {
            if (Array.isArray(customEnd) && customEnd.length) {
                if (customEnd.length === 1) {
                    return dist - (height * customEnd[0]);
                } else if (customEnd.length === 2) {
                    return dist - (height * customEnd[0]) - (clientHeight * customEnd[1]);
                } else if (customEnd.length === 3) {
                    return customEnd[2];
                } else if (customEnd.length === 4) {
                    return dist - (height * (1 - customEnd[0])) + (clientHeight * customEnd[1]) + (customEnd[3] / VzSIFactor);
                }
            } else {
                return dist - (height * (customEnd ? customEnd : 1));
            }
        }
        return dist;
    }

    distance(ref) {
        let distance = 0;
        let currentElement = ref;

        while (currentElement.offsetParent) {
            distance += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        }
        return (distance / VzSIFactor);
    }

    calcPercent(start, end, current) {
        return (start === end) ? 100 : ((current - start) / (end - start)) * 100;
    }

    calcCurrent(start, end, percentage) {
        return start + (percentage / 100) * (end - start);
    }

    calcRefTop(element, num) {
        if (Array.isArray(element)) {
            return this.calcTop(element[0].current, num || 0);
        } else {
            return this.calcTop(element.current || element, num || 0);
        }
    }
}

let scrollTriggerInstance = null;

export function getScrollTrigger() {
    if (typeof window === 'undefined') return null;
    
    if (!scrollTriggerInstance) {
        scrollTriggerInstance = new ScrollInteractionManager();
    }
    return scrollTriggerInstance;
}

export default getScrollTrigger();