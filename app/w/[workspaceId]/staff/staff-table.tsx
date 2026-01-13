'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Filter,
    MoreHorizontal,
    User,
    CheckCircle,
    Clock,
    Mail,
    Phone
} from 'lucide-react'
import Link from 'next/link'

interface StaffMember {
    id: string
    first_name: string
    last_name: string | null
    email: string | null
    phone: string | null
    attributes: { role?: string }
    user_id: string | null
    assiduity_score?: number
    staff_invitations: { status: string }[]
}

export default function StaffTable({
    workspaceId,
    staff,
    roles
}: {
    workspaceId: string
    staff: StaffMember[]
    roles: string[]
}) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // Filter Logic (Client-side for now, can be server-side later)
    const filteredStaff = staff.filter(s => {
        const fullName = `${s.first_name} ${s.last_name || ''}`.toLowerCase()
        const term = search.toLowerCase()

        const matchesSearch =
            fullName.includes(term) ||
            (s.email && s.email.toLowerCase().includes(term))

        const matchesRole = roleFilter === 'all' || s.attributes?.role === roleFilter

        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        className="bg-card border border-border rounded-md text-sm px-3 py-2 focus:outline-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium hidden md:table-cell">Contact</th>
                            <th className="px-6 py-4 font-medium hidden sm:table-cell">Role</th>
                            <th className="px-6 py-4 font-medium text-center">Status</th>
                            <th className="px-6 py-4 font-medium text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    No staff members found matching your filters.
                                </td>
                            </tr>
                        ) : filteredStaff.map((member) => {
                            const isLinked = !!member.user_id
                            const hasPendingInvite = member.staff_invitations?.some(i => i.status === 'pending')

                            return (
                                <tr
                                    key={member.id}
                                    className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/w/${workspaceId}/staff/${member.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {member.first_name[0]}{member.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="sm:hidden text-xs text-muted-foreground capitalize">
                                                    {(member.attributes as any)?.role || 'Staff'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            {member.email && (
                                                <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                                                    <Mail className="w-3.5 h-3.5" /> {member.email}
                                                </span>
                                            )}
                                            {member.phone && (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5" /> {member.phone}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-foreground capitalize border border-border/50">
                                            {(member.attributes as any)?.role || 'Staff'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isLinked ? (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                                <CheckCircle className="w-3 h-3" />
                                                <span className="hidden lg:inline">Active</span>
                                            </div>
                                        ) : hasPendingInvite ? (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                                                <Mail className="w-3 h-3" />
                                                <span className="hidden lg:inline">Invited</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-muted-foreground border border-border">
                                                <span className="w-2 h-2 rounded-full bg-muted-foreground/30"></span>
                                                <span className="hidden lg:inline">Draft</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:text-foreground inline-block" />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
