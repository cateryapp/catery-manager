import Link from 'next/link'
import { getCatalogSettings } from '@/app/actions/catalog'
import { Package, List, Tag, Settings, Database, BadgeDollarSign } from 'lucide-react'

export default async function CatalogLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params
    const settings = await getCatalogSettings()

    return (
        <div className="flex flex-col h-full">
            <div className="bg-background border-b border-border sticky top-0 z-10">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between overflow-x-auto">
                        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Tabs">
                            <NavLink href={`/w/${workspaceId}/catalog/products`} icon={Package} label="Products" />
                            <NavLink href={`/w/${workspaceId}/catalog/phases`} icon={List} label="Phases" />
                            <NavLink href={`/w/${workspaceId}/catalog/categories`} icon={Tag} label="Categories" />

                            {settings.resources_enabled && (
                                <NavLink href={`/w/${workspaceId}/catalog/resources`} icon={Database} label="Resources" />
                            )}

                            {settings.costing_enabled && (
                                <NavLink href={`/w/${workspaceId}/catalog/costing`} icon={BadgeDollarSign} label="Costing" />
                            )}

                            <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>

                            <NavLink href={`/w/${workspaceId}/catalog/settings`} icon={Settings} label="Settings" />
                        </nav>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

function NavLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    // Ideally we use usePathname to highlight active state, but this is a server component layout.
    // To highlight active state, we'd need a client component wrapper for the nav.
    // For now, simple links.

    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
        >
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    )
}
