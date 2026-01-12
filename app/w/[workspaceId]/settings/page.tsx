import { createClient } from '@/utils/supabase/server'
import { UserPlus } from 'lucide-react'
import { UserProfileSettings } from './user-profile-settings'

export default async function SettingsPage({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params
    const supabase = await createClient()

    const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

    const { data: members } = await supabase
        .from('workspace_members')
        .select('*, users(full_name, email)')
        .eq('workspace_id', workspaceId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Not authenticated</div> // Or redirect

    // Fetch current user profile with language
    const { data: profile } = await supabase
        .from('users')
        .select('full_name, email, language')
        .eq('id', user.id)
        .single()

    // Load Dictionary
    const lang = profile?.language || 'en'
    const { getDictionary } = await import('@/utils/get-dictionary')
    const dict = await getDictionary(lang)

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{dict.settings.title}</h1>
                <p className="text-muted-foreground">{dict.settings.subtitle}</p>
            </div>

            <div className="grid gap-8">
                {/* User Profile Settings - We can pass dict or let it fetch? It client component. */}
                {/* UserProfileSettings is Client, so it uses useTranslation (which uses context dict). */}
                {/* Wait, SettingsPage is Server, but UserProfileSettings is Client. */}
                {/* The Provider wraps the layout. So Client components inside SettingsPage HAVE access to context. */}
                {/* So I don't need to pass dict to UserProfileSettings if it uses useTranslation. */}
                {/* I just need to translate the Server rendered parts here. */}
                <UserProfileSettings workspaceId={workspaceId} profile={profile} />

                <div className="border-t border-border pt-8"></div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-lg">{dict.settings.workspace.title}</h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dict.settings.workspace.company_name}</label>
                        <input
                            disabled
                            className="flex h-10 w-full max-w-md rounded-md border border-input bg-secondary px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                            value={workspace?.name}
                        />
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-lg">{dict.settings.workspace.team_title}</h2>
                            <p className="text-sm text-muted-foreground">{dict.settings.workspace.team_subtitle}</p>
                        </div>
                        <button disabled className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md opacity-50 cursor-not-allowed">
                            <UserPlus className="w-4 h-4" />
                            {dict.settings.workspace.invite_button}
                        </button>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {members?.map(m => (
                                    <tr key={m.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium">{m.profiles?.full_name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.profiles?.email}</td>
                                        <td className="px-4 py-3 capitalize">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground">
                                                {m.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
