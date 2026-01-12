'use client'

import { useState } from 'react'
import { Check, Loader2, Globe } from 'lucide-react'
import { updateProfileLanguage } from './actions'

export function UserProfileSettings({
    workspaceId,
    profile
}: {
    workspaceId: string,
    profile: any
}) {
    const [loading, setLoading] = useState(false)

    // languages
    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'pt', label: 'Português' },
    ]

    async function handleLanguageChange(code: string) {
        setLoading(true)
        await updateProfileLanguage(workspaceId, code)
        setLoading(false)
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {profile.full_name?.[0] || '?'}
                </div>
                <div>
                    <h2 className="font-semibold text-lg">My Profile</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Language Preference
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                disabled={loading}
                                className={`
                                    relative flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all
                                    ${profile.language === lang.code
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-secondary/50 border-border hover:bg-secondary hover:border-primary/50 text-muted-foreground'
                                    }
                                `}
                            >
                                {loading && profile.language === lang.code && <Loader2 className="w-3 h-3 animate-spin absolute left-2" />}
                                {lang.label}
                                {profile.language === lang.code && !loading && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
