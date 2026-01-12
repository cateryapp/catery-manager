import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Menu } from 'lucide-react'
import { I18nProvider } from '@/components/i18n-provider'
import { Sidebar } from '@/components/sidebar'

// Import dictionaries directly on server
import en from '@/dictionaries/en.json'
import es from '@/dictionaries/es.json'
import pt from '@/dictionaries/pt.json'

const DICTIONARIES: Record<string, any> = { en, es, pt }

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params
    const supabase = await createClient()

    // 1. Verify User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let language = 'en';
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('language')
            .eq('id', user.id)
            .single()

        if (profile?.language) {
            language = profile.language;
        }
    }
    const dictionary = DICTIONARIES[language] || en

    // 3. Verify Membership & Fetch Workspace Details
    const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('*, workspace_members!inner(role)')
        .eq('id', workspaceId)
        .eq('workspace_members.user_id', user.id)
        .single()

    if (error || !workspace) {
        redirect('/') // or 404
    }

    return (
        <I18nProvider dictionary={dictionary}>
            <div className="flex h-screen bg-background text-foreground overflow-hidden">
                {/* Client Sidebar */}
                <Sidebar
                    workspaceId={workspaceId}
                    userEmail={user.email!}
                    workspaceName={workspace.name}
                />

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Mobile Header (Simplified for now, also needs i18n if text used) */}
                    <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50">
                        <div className="font-bold">Catery</div>
                        <button><Menu className="w-6 h-6" /></button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                        {children}
                    </div>
                </main>
            </div>
        </I18nProvider>
    )
}
