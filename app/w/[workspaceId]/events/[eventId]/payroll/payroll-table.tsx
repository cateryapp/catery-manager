'use client'

import { useState } from 'react'
import { updatePayroll } from './actions'
import { Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PayrollTable({
    assignments,
    eventId,
    workspaceId
}: {
    assignments: any[],
    eventId: string,
    workspaceId: string
}) {
    const [values, setValues] = useState<Record<string, number>>(
        assignments.reduce((acc, a) => ({ ...acc, [a.id]: a.net_amount || 0 }), {})
    )
    const [loading, setLoading] = useState(false)
    const [changed, setChanged] = useState(false)

    function handleChange(id: string, val: string) {
        setValues(prev => ({ ...prev, [id]: parseFloat(val) || 0 }))
        setChanged(true)
    }

    async function onSave() {
        setLoading(true)
        const payload = Object.entries(values).map(([id, amount]) => ({ id, net_amount: amount }))
        await updatePayroll(payload, eventId, workspaceId)
        setLoading(false)
        setChanged(false)
    }

    return (
        <div className="space-y-4">
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium">Staff Member</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Net Amount (€)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No assignments. Add staff first.</td>
                            </tr>
                        )}
                        {assignments.map(a => (
                            <tr key={a.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {a.staff?.first_name} {a.staff?.last_name}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground capitalize">
                                    {a.role}
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="h-9 w-32 rounded-md border border-input bg-background/50 px-3 py-1 text-sm tabular-nums focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={values[a.id]}
                                        onChange={(e) => handleChange(a.id, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {changed && (
                <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in">
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    )
}
