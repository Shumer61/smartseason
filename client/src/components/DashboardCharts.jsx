import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_COLORS = {
    Active: '#22c55e',
    AtRisk: '#f59e0b',
    Completed: '#94a3b8'
}

const STAGE_COLORS = {
    Planted: '#93c5fd',
    Growing: '#34d399',
    Ready: '#fbbf24',
    Harvested: '#6b7280'
}

function DashboardCharts({ summary, isAdmin }) {
    if(!summary) return null

    const statusData = [
        { name: 'Active', value: summary.byStatus.Active },
        { name: 'At Risk', value: summary.byStatus.AtRisk },
        { name: 'Completed', value: summary.byStatus.Completed }
    ].filter(d => d.value > 0)

    const stageData = [
        { name: 'Planted', value: summary.byStage.Planted },
        { name: 'Growing', value: summary.byStage.Growing },
        { name: 'Ready', value: summary.byStage.Ready },
        { name: 'Harvested', value: summary.byStage.Harvested }
    ]

    return (
        <div className="charts-container">
            {isAdmin && statusData.length > 0 && (
                <div className="chart-card">
                    <h4>Field Status</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {statusData.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={STATUS_COLORS[entry.name.replace(' ', '')]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="chart-card">
                <h4>Fields by Stage</h4>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stageData} barSize={32}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#718096' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#718096' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {stageData.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={STAGE_COLORS[entry.name]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DashboardCharts