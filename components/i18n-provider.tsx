'use client'

import { createContext, useContext, ReactNode } from 'react'

// Define a type for the dictionary structure loosely, or strictly if preferred.
// For now, any is practical for rapid MVP evolution, but we can do better.
type Dictionary = any

const I18nContext = createContext<Dictionary | null>(null)

export function I18nProvider({
    dictionary,
    children
}: {
    dictionary: Dictionary,
    children: ReactNode
}) {
    return (
        <I18nContext.Provider value={dictionary}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(I18nContext)
    if (context === null) {
        throw new Error('useTranslation must be used within an I18nProvider')
    }

    // Helper to get nested properties, e.g. t('sidebar.dashboard')
    const t = (path: string) => {
        return path.split('.').reduce((obj, key) => obj?.[key], context) || path
    }

    return { t }
}
