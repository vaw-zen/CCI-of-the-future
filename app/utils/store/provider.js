import { useSyncExternalStore } from 'react';

class StoreManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  // Subscribe mechanism
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState = () => {
    return this.state;
  }

  // Create a hook for selecting specific state slice
  createHook() {
    const useStoreHook = (selector = state => state) => {
      const state = useSyncExternalStore(
        this.subscribe.bind(this),
        () => selector(this.state),
        () => selector(this.state)
      );

      return state;
    };

    // Attach getState method to the hook
    useStoreHook.getState = this.getState;

    return useStoreHook;
  }

  // Update state with flexible options
  createSetter() {
    return (updater) => {
      const nextState = typeof updater === 'function'
        ? updater(this.state)
        : { ...this.state, ...updater };

      // Only update if state actually changes
      if (!this.isEqual(this.state, nextState)) {
        this.state = nextState;
        this.listeners.forEach(listener => listener());
      }
    };
  }

  // Deep comparison to prevent unnecessary updates
  isEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!this.isEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  // Helper method to update a specific key
  createKeyUpdater(key) {
    return (value) => {
      this.createSetter()((state) => ({
        [key]: typeof value === 'function' ? value(state[key]) : value
      }));
    };
  }
}

// Utility to create a store similar to Zustand
export function create(storeCreator) {
  const storeManager = new StoreManager();

  // Initialize the store
  const initialStore = storeCreator(
    storeManager.createSetter(),
    storeManager.getState
  );

  // Set initial state
  storeManager.state = initialStore;

  // Create hook and setter methods
  const useStore = storeManager.createHook();

  // Add methods to the hook
  useStore.setState = storeManager.createSetter();

  return useStore;
}