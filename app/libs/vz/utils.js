export function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export function addTransitionEnd(element, func, cancel, repeat) {
  function handleTransitionEnd(event) {
    func(event)
    if (!repeat) { element.removeEventListener('transitionend', handleTransitionEnd); }
    if (cancel) { element.removeEventListener('transitioncancel', handleTransitionEnd); }
  }
  element.addEventListener('transitionend', handleTransitionEnd);
  if (cancel) { element.addEventListener('transitioncancel', handleTransitionEnd); }
}
export function foreach(arr, f, end, start) {
  for (let i = (start || 0); (end || arr.length) > i; i++) {
    f(arr[i], i)
  }
}