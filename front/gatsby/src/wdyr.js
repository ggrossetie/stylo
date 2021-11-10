import React from 'react'
import whyDidYouRender from '@welldone-software/why-did-you-render'

console.log('whyDidYouRender', whyDidYouRender)
whyDidYouRender(React, {
  trackAllPureComponents: true,
})
