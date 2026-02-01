'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 text-slate-900">
                    <div className="max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold">Something went wrong!</h2>
                        <p className="text-muted-foreground">
                            We apologize for the inconvenience. An unexpected error occurred.
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground font-mono bg-slate-100 p-2 rounded">
                                Error ID: {error.digest}
                            </p>
                        )}
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
