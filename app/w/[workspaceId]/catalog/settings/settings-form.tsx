'use client'

import { useState } from 'react'
import { updateCatalogSettings } from '@/app/actions/catalog'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Save } from 'lucide-react'

type Settings = {
    advanced_enabled: boolean
    bundles_enabled: boolean
    resources_enabled: boolean
    costing_enabled: boolean
    pricing_advanced_enabled: boolean
}

export function SettingsForm({ initialSettings, workspaceId }: { initialSettings: Settings, workspaceId: string }) {
    const [settings, setSettings] = useState<Settings>(initialSettings)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleToggle = (key: keyof Settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        setSuccess(false)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setSuccess(false)
        try {
            const res = await updateCatalogSettings(settings)
            if (res.success) {
                setSuccess(true)
                router.refresh()
                setTimeout(() => setSuccess(false), 3000)
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-foreground/90">Feature Configuration</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Enable or disable modules to tailor the catalog complexity to your organization's needs.
                </p>

                <div className="space-y-6">
                    <ToggleItem
                        title="Advanced Catalog Mode"
                        description="Enables extended product attributes and management options."
                        checked={settings.advanced_enabled}
                        onChange={() => handleToggle('advanced_enabled')}
                    />
                    <ToggleItem
                        title="Product Bundles"
                        description="Create complex products with sub-selections (e.g., Menus with choices)."
                        checked={settings.bundles_enabled}
                        onChange={() => handleToggle('bundles_enabled')}
                    />
                    <ToggleItem
                        title="Resources & Logistics"
                        description="Manage internal resources (ingredients, equipment) independent of sellable products."
                        checked={settings.resources_enabled}
                        onChange={() => handleToggle('resources_enabled')}
                    />
                    <ToggleItem
                        title="Costing & Margins"
                        description="Calculate estimated costs based on resource usage and view margins."
                        checked={settings.costing_enabled}
                        onChange={() => handleToggle('costing_enabled')}
                        disabled={!settings.resources_enabled}
                    />
                    <ToggleItem
                        title="Advanced Pricing"
                        description="Use complex pricing formulas and multipliers."
                        checked={settings.pricing_advanced_enabled}
                        onChange={() => handleToggle('pricing_advanced_enabled')}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-all focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {success && (
                <div className="fixed bottom-6 right-6 bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-5 fade-in">
                    <Check className="w-5 h-5" />
                    Settings saved successfully
                </div>
            )}
        </div>
    )
}

function ToggleItem({
    title,
    description,
    checked,
    onChange,
    disabled = false
}: {
    title: string
    description: string
    checked: boolean
    onChange: () => void
    disabled?: boolean
}) {
    return (
        <div className={`flex items-start justify-between p-4 rounded-lg border border-transparent transition-colors ${checked ? 'bg-primary/5 border-primary/10' : 'hover:bg-muted/50'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex-1 pr-4">
                <div className="font-medium text-foreground">{title}</div>
                <div className="text-sm text-muted-foreground mt-1">{description}</div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${checked ? 'bg-primary' : 'bg-input'}
                `}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    )
}
