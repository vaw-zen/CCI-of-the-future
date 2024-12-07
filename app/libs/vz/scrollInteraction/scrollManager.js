class ScrollEventManager {
  constructor() {
    this.instances = new Map();
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.isListenerAttached = false;
  }

  // Create a new scroll event instance
  createInstance(key, callback, options = {}) {
    const {
      enabled = true,
      throttle = 0
    } = options;

    // If instance already exists, update it
    if (this.instances.has(key)) {
      const existingInstance = this.instances.get(key);
      existingInstance.callback = callback;
      existingInstance.enabled = enabled;
      return existingInstance;
    }

    // Create new instance
    const instance = {
      key,
      callback,
      enabled,
      lastCall: 0,
      throttle
    };

    this.instances.set(key, instance);
    this.attachGlobalListener();

    return instance;
  }

  // Global scroll event handler
  handleScroll(event) {
    const now = Date.now();

    this.instances.forEach(instance => {
      // Skip if instance is disabled
      if (!instance.enabled) return;

      // Check throttling
      if (now - instance.lastCall >= instance.throttle) {
        instance.lastCall = now;
        try {
          instance.callback(event);
        } catch (error) {
          console.error(`Scroll event error for ${instance.key}:`, error);
        }
      }
    });
  }

  // Attach global scroll listener only once
  attachGlobalListener() {
    if (!this.isListenerAttached) {
      window.addEventListener('scroll', this.boundHandleScroll);
      this.isListenerAttached = true;
    }
  }

  // Remove a specific scroll instance
  removeInstance(key) {
    this.instances.delete(key);

    // Remove global listener if no instances remain
    if (this.instances.size === 0) {
      window.removeEventListener('scroll', this.boundHandleScroll);
      this.isListenerAttached = false;
    }
  }

  // Toggle an instance's enabled state
  toggleInstance(key, enabled) {
    const instance = this.instances.get(key);
    if (instance) {
      instance.enabled = enabled;
    }
  }

  // Get all current instances
  getInstances() {
    return Array.from(this.instances.keys());
  }
}

// Global singleton instance
const scrollManager = new ScrollEventManager();


export default scrollManager