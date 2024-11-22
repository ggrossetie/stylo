import { useState } from 'react'

export function useMenuItem() {
  const [activeIndex, setActiveIndex] = useState(-1);
  return {
    toggle: (index) => activeIndex === index ? setActiveIndex(-1) : setActiveIndex(index),
    activeIndex
  }
}
