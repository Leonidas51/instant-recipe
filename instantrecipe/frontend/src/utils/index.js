export function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    const onComplete = () => {
      fn.apply(this, args);
      timer = null;
    }

    if(timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, delay);
  }
}

export function is_touch_screen() {
  return Boolean(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
}