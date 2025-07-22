import useSWR from 'swr'

import { applicationConfig } from '../config.js'

const { hypothesisEndpoint } = applicationConfig

const fetcher = (url) => fetch(url).then((response) => response.json())

export default function useHypothesisSearch({ uri }) {
  const { data, error, isLoading } = useSWR(
    `${hypothesisEndpoint}/search?uri=${encodeURIComponent(uri)}`,
    fetcher,
    { fallbackData: [] }
  )

  const annotations = data?.rows

  const topLevelAnnotations = annotations?.filter(
    (r) => r.references === undefined
  )

  for (let topLevelAnnotation of topLevelAnnotations) {
    const replies = annotations.filter((r) =>
      r.references?.includes(topLevelAnnotation.id)
    )
    if (replies) {
      topLevelAnnotation.replies = replies
    }
  }

  return {
    annotations: topLevelAnnotations,
    error,
    isLoading,
  }
}
