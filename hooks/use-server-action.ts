'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import * as Sentry from '@sentry/nextjs'

export type ActionResponse = {
    success: boolean
    message: string
    data?: any
    error?: any
}

export function useServerAction<T = any>(
    action: (...args: any[]) => Promise<ActionResponse>,
    onSuccess?: (data?: T) => void
) {
    const [loading, setLoading] = useState(false)

    const execute = async (...args: any[]) => {
        setLoading(true)
        try {
            const result = await action(...args)
            if (result.success) {
                toast.success(result.message)
                if (onSuccess) onSuccess(result.data)
                return result
            } else {
                console.error('Server Action Error:', result.error || result.message)
                toast.error(result.message || 'An error occurred')
                if (result.error) {
                    Sentry.captureException(result.error)
                } else if (!result.success && result.message) {
                    Sentry.captureMessage(`Action Failed: ${result.message}`, 'warning')
                }
                return result
            }
        } catch (error: any) {
            console.error('Unexpected Action Error:', error)
            toast.error('An unexpected error occurred. Support has been notified.') // Friendly generic error
            Sentry.captureException(error)
            return { success: false, message: error.message, error }
        } finally {
            setLoading(false)
        }
    }

    return { execute, loading }
}
