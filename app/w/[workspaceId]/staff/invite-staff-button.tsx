'use client'

import { useState } from 'react'
import { generateStaffInvitation } from './actions'
import { Loader2, Link as LinkIcon, CheckCircle, Smartphone } from 'lucide-react'

export default function InviteStaffButton({
    workspaceId,
    staffId,
    email,
    isLinked,
    hasPendingInvite
}: {
    workspaceId: string
    staffId: string
    email: string
    isLinked: boolean
    hasPendingInvite: boolean
}) {
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)
    const [showDialog, setShowDialog] = useState(false)

    const handleInvite = async () => {
        setLoading(true)
        try {
            const res = await generateStaffInvitation(workspaceId, staffId)
            if (res.deepLink) {
                setInviteLink(res.deepLink)
                setShowDialog(true)
            } else if (res.error) {
                alert(res.error)
            }
        } catch (e) {
            alert('Failed to send invitation')
        } finally {
            setLoading(false)
        }
    }

    if (isLinked) {
        return (
            <div className="text-emerald-500 text-xs flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                <span>Portal Active</span>
            </div>
        )
    }

    return (
        <>
            <button
                onClick={handleInvite}
                disabled={loading}
                className="text-primary hover:text-primary/80 text-xs flex items-center gap-1 font-medium disabled:opacity-50 transition-colors"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Smartphone className="w-3 h-3" />}
                <span>{hasPendingInvite ? 'Resend Invite' : 'Invite App'}</span>
            </button>

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-popover text-popover-foreground border shadow-xl rounded-xl max-w-md w-full p-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Invitation Sent</h3>
                            <p className="text-sm text-muted-foreground">
                                We've sent an email to <strong>{email}</strong>.
                            </p>
                            <div className="bg-muted p-3 rounded-lg text-xs font-mono break-all border">
                                {inviteLink}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                (In a real app, this link is inside the email button.)
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
