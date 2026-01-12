export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to your operations center.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Cards */}
                {[
                    { label: 'Upcoming Events', value: '12', sub: 'Next 7 days' },
                    { label: 'Missing Staff', value: '3', sub: 'Urgent attention' },
                    { label: 'Pending Payroll', value: '€4.2k', sub: '2 events unfinished' },
                    { label: 'Active Staff', value: '48', sub: 'In roster' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                        <div className="mt-2 text-3xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6">
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Chart Placeholder (Events/Revenue)
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Urgent Actions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <div className="text-sm">
                                    <div className="font-medium">Assign Head Chef</div>
                                    <div className="text-muted-foreground text-xs">Wedding at Villa Rosa • Tomorrow</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
