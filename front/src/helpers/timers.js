/**
 * @param {Function} fn
 * @param {number} delay
 * @param {{ leading?: boolean, trailing?: boolean }} [options]
 * @returns {Function}
 */
export function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timeoutId = null

  return function (...args) {
    const callLeading = leading && timeoutId === null
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      if (trailing) fn.apply(this, args)
    }, delay)
    if (callLeading) fn.apply(this, args)
  }
}

/**
 * @param {Function} fn
 * @param {number} delay
 * @param {{ leading?: boolean, trailing?: boolean }} [options]
 * @returns {Function}
 */
export function throttle(fn, delay, { leading = true, trailing = true } = {}) {
  let timeoutId = null
  let lastTime = null
  let lastArgs = null
  let lastThis = null

  return function (...args) {
    const now = Date.now()
    lastArgs = args
    lastThis = this

    if (lastTime === null) {
      if (leading) {
        lastTime = now
        fn.apply(this, args)
        return
      }
      lastTime = now
    }

    const elapsed = now - lastTime
    if (elapsed >= delay) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastTime = now
      fn.apply(lastThis, lastArgs)
      return
    }

    if (timeoutId === null && trailing) {
      timeoutId = setTimeout(() => {
        timeoutId = null
        lastTime = Date.now()
        fn.apply(lastThis, lastArgs)
        lastArgs = lastThis = null
      }, delay - elapsed)
    }
  }
}