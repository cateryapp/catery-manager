'use client'

import Link from 'next/link'
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Briefcase,
    Truck,
    CreditCard,
    Settings,
    LogOut
} from 'lucide-react'
import { useTranslation } from './i18n-provider'

export function Sidebar({ workspaceId, userEmail, workspaceName }: { workspaceId: string, userEmail: string, workspaceName: string }) {
    const { t } = useTranslation()

    const navItems = [
        { name: t('sidebar.dashboard'), href: `/w/${workspaceId}`, icon: LayoutDashboard },
        { name: t('sidebar.events'), href: `/w/${workspaceId}/events`, icon: CalendarDays },
        { name: t('sidebar.staff'), href: `/w/${workspaceId}/staff`, icon: Users },
        { name: t('sidebar.assignments'), href: `/w/${workspaceId}/assignments`, icon: Briefcase },
        { name: t('sidebar.providers'), href: `/w/${workspaceId}/providers`, icon: Truck },
        { name: t('sidebar.payroll'), href: `/w/${workspaceId}/payroll`, icon: CreditCard },
        { name: t('sidebar.settings'), href: `/w/${workspaceId}/settings`, icon: Settings },
    ]

    return (
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        CT
                    </div>
                    <span>Catery</span>
                </div>
                <div className="mt-4 px-3 py-2 rounded-lg bg-secondary/50 text-sm font-medium border border-border">
                    {workspaceName}
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href} // Use href as key since name might change with language
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <form action="/auth/signout" method="post">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </form>
                <div className="mt-2 px-3 text-xs text-muted-foreground">
                    {userEmail}
                </div>
            </div>
        </aside>
    )
}
