import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  apiFunc: (...args: never[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (...args: Parameters<typeof apiFunc>) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await apiFunc(...args)
        setData(result)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ocurrió un error'
        setError(message)
        options.onError?.(err instanceof Error ? err : new Error(message))
        toast.error(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunc, options]
  )

  return { data, error, isLoading, execute, setData }
}

export function useFetch<T>(
  apiFunc: (...args: never[]) => Promise<T>,
  args?: Parameters<typeof apiFunc>,
  options: UseApiOptions = {}
) {
  const { data, error, isLoading, execute } = useApi<T>(apiFunc, options)

  useEffect(() => {
    if (args) {
      execute(...args)
    }
  }, [])

  return { data, error, isLoading, refetch: () => args && execute(...args) }
}
