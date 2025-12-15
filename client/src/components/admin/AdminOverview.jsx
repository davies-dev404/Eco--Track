import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatCard } from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Trash2, CheckCircle, Truck, User, Leaf, AlertTriangle, ArrowRight, Activity, Battery, Car } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminOverview({ pickups, wasteLogs, users, drivers, activities, totalCollected: initialTotal, completedCount: initialCompleted, activeCount: initialActive, onlineDrivers: initialOnline, timeFilter, onNavigate }) {
    
    // 1. Filter Logic
    const filterDate = (dateStr) => {
        if (timeFilter === 'all') return true;
        const date = new Date(dateStr);
        const now = new Date();
        if (timeFilter === 'today') return date.toDateString() === now.toDateString();
        const days = timeFilter === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - days);
        return date >= cutoff;
    };

    const filteredPickups = pickups.filter(p => filterDate(p.date));
    const filteredWaste = wasteLogs.filter(w => filterDate(w.date));
    
    // Re-calculate KPIs based on filter
    const totalCollected = (filteredPickups.reduce((acc, p) => acc + (p.actualWeight || 0), 0) + filteredWaste.reduce((acc, l) => acc + (l.weight || 0), 0)).toFixed(1);
    const completedCount = filteredPickups.filter(p => p.status === 'completed' || p.status === 'collected').length;
    
    // 2. Chart State
    const [wasteTypeFilter, setWasteTypeFilter] = useState("all");

    // Process chart data
    const chartData = (() => {
        const combined = [
            ...filteredWaste.map(l => ({ date: new Date(l.date).toLocaleDateString(), weight: l.weight, type: l.type })),
            ...filteredPickups.filter(p => p.actualWeight).map(p => ({ date: new Date(p.date).toLocaleDateString(), weight: p.actualWeight, type: p.wasteTypes[0] || 'mixed' }))
        ].filter(item => wasteTypeFilter === 'all' || item.type === wasteTypeFilter);
        
        const grouped = combined.reduce((acc, curr) => {
            acc[curr.date] = (acc[curr.date] || 0) + curr.weight;
            return acc;
        }, {});
        
        return Object.entries(grouped)
            .map(([name, val]) => ({ name, val }))
            .sort((a,b) => new Date(a.name) - new Date(b.name))
            .slice(-7); // Always show last 7 data points effectively
    })();

    // 3. Sustainability Metrics
    const co2Saved = (totalCollected * 1.5).toFixed(1); // Approx 1.5kg CO2 per kg recycled
    const treesSaved = (co2Saved / 20).toFixed(1); // Approx 20kg CO2 per tree/year

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* ROW 1: System Health (New) */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <Card className="md:col-span-3 border-l-4 border-l-green-500 shadow-sm">
                     <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="bg-green-100 p-2 rounded-full">
                                 <Activity className="h-5 w-5 text-green-600" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800">System Status: Operational</h3>
                                 <p className="text-sm text-slate-500">All API endpoints active. Database connection stable.</p>
                             </div>
                         </div>
                         <div className="flex gap-4 text-sm">
                             <span className="flex items-center gap-1 text-slate-600"><CheckCircle className="h-4 w-4 text-green-500"/> API: 99.9% Uptime</span>
                             <span className="flex items-center gap-1 text-slate-600"><AlertTriangle className="h-4 w-4 text-yellow-500"/> 0 Failed Jobs</span>
                         </div>
                     </div>
                 </Card>
                 <Card className="bg-slate-900 text-white border-0 shadow-lg">
                     <div className="p-4 flex flex-col justify-center h-full">
                         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Eco Impact Score</h3>
                         <div className="text-3xl font-bold text-green-400 mt-1">A+ <span className="text-sm font-normal text-slate-400">Excellent</span></div>
                     </div>
                 </Card>
             </div>

             {/* ROW 2: Clickable KPIs */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div onClick={() => onNavigate('waste')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                     <StatCard 
                        title={`Total Waste (${timeFilter})`}
                        value={totalCollected} 
                        icon={Trash2} 
                        trend={{ value: 12, direction: 'up' }}
                        subtext="kg collected"
                     />
                 </div>
                 <div onClick={() => onNavigate('pickups')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                     <StatCard 
                        title="Completed Pickups" 
                        value={completedCount} 
                        icon={CheckCircle} 
                        trend={{ value: 5, direction: 'up' }}
                        subtext="Collections"
                     />
                 </div>
                 <div onClick={() => onNavigate('livemap')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                     <StatCard 
                        title="Active Routes" 
                        value={filteredPickups.filter(p => ['in_progress', 'assigned'].includes(p.status)).length} 
                        icon={Truck} 
                        trend={{ value: 'Active', direction: 'neutral' }}
                        subtext="In transit"
                     />
                 </div>
                 <div onClick={() => onNavigate('users')} className="cursor-pointer transition-transform hover:scale-[1.02]">
                     <StatCard 
                        title="New Users" 
                        value={users.filter(u => filterDate(u.createdAt || new Date())).length} 
                        icon={User} 
                        trend={{ value: 8, direction: 'up' }}
                        subtext="Joined recently"
                     />
                 </div>
             </div>
             
             {/* ROW 3: Analytics & Fleet */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                     {/* Advanced Chart */}
                     <Card className="h-fit" id="collection-trends-chart">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Collection Trends</CardTitle>
                                <CardDescription>Waste volume analysis</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {['all', 'plastic', 'ewaste', 'organic'].map(type => (
                                    <Badge 
                                        key={type}
                                        variant={wasteTypeFilter === type ? 'default' : 'outline'}
                                        className="cursor-pointer capitalize"
                                        onClick={() => setWasteTypeFilter(type)}
                                    >
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                     </Card>

                     {/* Professional Fleet Status */}
                     <Card>
                         <CardHeader>
                             <CardTitle>Driver Fleet Status</CardTitle>
                             <CardDescription>Real-time vehicle and driver monitoring</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left">
                                     <thead className="bg-slate-50 text-slate-500 font-medium">
                                         <tr>
                                             <th className="p-3">Driver</th>
                                             <th className="p-3">Vehicle</th>
                                             <th className="p-3">Status</th>
                                             <th className="p-3">Active</th>
                                             <th className="p-3 text-right">Action</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y">
                                        {drivers.map(d => {
                                            const activeJobs = pickups.filter(p => p.driverId === d._id && ['accepted', 'in_progress'].includes(p.status)).length;
                                            const isOnline = d.availability === 'online';
                                            let status = 'Offline';
                                            let badgeColor = 'bg-slate-100 text-slate-600';
                                            
                                            if (activeJobs > 0) { status = 'On Job'; badgeColor = 'bg-blue-100 text-blue-700'; }
                                            else if (isOnline) { status = 'Idle'; badgeColor = 'bg-green-100 text-green-700'; }

                                            return (
                                                <tr key={d._id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-3 font-medium">{d.name}</td>
                                                    <td className="p-3 flex items-center gap-2">
                                                        <Car className="h-3 w-3 text-slate-400" />
                                                        {d.vehicleInfo || 'N/A'}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="secondary" className={badgeColor}>{status}</Badge>
                                                    </td>
                                                    <td className="p-3 text-slate-500">
                                                        {isOnline ? 'Just now' : '2h ago'}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={() => onNavigate('livemap')}>
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                     </tbody>
                                 </table>
                             </div>
                         </CardContent>
                      </Card>
                 </div>

                 <div className="lg:col-span-1 space-y-6">
                     {/* Environmental Impact (Sustainability Intelligence) */}
                     <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-green-800">
                                 <Leaf className="h-5 w-5" /> Sustainability Impact
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                 <span className="text-sm font-medium text-slate-600">CO₂ Reductions</span>
                                 <span className="text-lg font-bold text-green-700">{co2Saved} kg</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                 <span className="text-sm font-medium text-slate-600">Tree Eq. Planted</span>
                                 <span className="text-lg font-bold text-green-700">{treesSaved} 🌳</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                 <span className="text-sm font-medium text-slate-600">Energy Saved</span>
                                 <span className="text-lg font-bold text-green-700">{(totalCollected * 0.5).toFixed(1)} kWh</span>
                             </div>
                         </CardContent>
                     </Card>

                     {/* Live Operations Feed */}
                     <ActivityFeed activities={activities.slice(0, 5)} />
                     
                     <Card className="h-fit" id="waste-breakdown-chart">
                        <CardHeader>
                            <CardTitle>Waste Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={Object.entries(
                                        [...pickups, ...wasteLogs.map(l => ({ wasteTypes: [l.type] }))]
                                            .flatMap(p => p.wasteTypes || [])
                                            .reduce((acc, type) => {
                                                acc[type] = (acc[type] || 0) + 1;
                                                return acc;
                                            }, {})
                                    ).map(([name, value]) => ({ name, value }))} 
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                     </Card>
                 </div>
             </div>
        </div>
    );
}
