'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    UsersRound,
    Briefcase,
    Truck,
    CreditCard,
    Settings,
    LogOut,
    House,
    MessageSquare,
    ClipboardList,
    Package
} from 'lucide-react'
import { useTranslation } from './i18n-provider'

export function Sidebar({ workspaceId, userEmail, workspaceName }: { workspaceId: string, userEmail: string, workspaceName: string }) {
    const { t } = useTranslation()

    // Navigation Groups
    const mainNav = [
        { name: t('sidebar.dashboard'), href: `/w/${workspaceId}`, icon: House },
    ]

    const eventsNav = [
        { name: t('sidebar.events'), href: `/w/${workspaceId}/events`, icon: CalendarDays },
        // Future: Contacts, Comms
    ]

    const staffNav = [
        { name: t('sidebar.staff'), href: `/w/${workspaceId}/staff`, icon: UsersRound },
        { name: t('sidebar.assignments'), href: `/w/${workspaceId}/assignments`, icon: ClipboardList },
        { name: t('sidebar.payroll'), href: `/w/${workspaceId}/payroll`, icon: CreditCard },
    ]

    const resourcesNav = [
        { name: t('sidebar.providers'), href: `/w/${workspaceId}/providers`, icon: Truck },
        // Future: Inventory
    ]

    const settingsNav = [
        { name: t('sidebar.settings'), href: `/w/${workspaceId}/settings`, icon: Settings },
    ]

    const renderNavGroup = (title: string | null, items: any[]) => (
        <div className="mb-4">
            {title && (
                <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </h4>
            )}
            <div className="space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    )

    return (
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        CT
                    </div>
                    <span>Catery</span>
                </div>
                <div className="mt-4 px-3 py-2 rounded-lg bg-secondary/50 text-sm font-medium border border-border truncate">
                    {workspaceName}
                </div>
            </div>

            <nav className="flex-1 px-3 overflow-y-auto no-scrollbar">
                {renderNavGroup(null, mainNav)}
                {renderNavGroup(t('sidebar.section.events') || 'Eventos', eventsNav)}
                {renderNavGroup(t('sidebar.section.staff') || 'Personal', staffNav)}
                {renderNavGroup(t('sidebar.section.resources') || 'Recursos', resourcesNav)}

                <div className="my-4 border-t border-border opacity-50"></div>
                {renderNavGroup(null, settingsNav)}
            </nav>

            <div className="p-4 border-t border-border">
                <form action="/auth/signout" method="post">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                        <LogOut className="w-4 h-4 group-hover:text-destructive transition-colors" />
                        Sign Out
                    </button>
                </form>
                <div className="mt-2 px-3 text-xs text-muted-foreground truncate" title={userEmail}>
                    {userEmail}
                </div>
            </div>
        </aside>
    )
}
