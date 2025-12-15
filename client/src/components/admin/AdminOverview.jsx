import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatCard } from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Trash2, CheckCircle, Truck, User, Leaf, AlertTriangle, ArrowRight, Activity, Battery, Car, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminOverview({ pickups, wasteLogs, users, drivers, activities, totalCollected: initialTotal, completedCount: initialCompleted, activeCount: initialActive, onlineDrivers: initialOnline, timeFilter, onNavigate }) {
    const { toast } = useToast();
    
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
            .slice(-7); 
    })();

    // 3. Sustainability Metrics
    const co2Saved = (totalCollected * 1.5).toFixed(1); 
    const treesSaved = (co2Saved / 20).toFixed(1); 

    const exportPDF = async () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Eco-Track Impact Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Capture Chart
        const chartElement = document.getElementById("analytics-chart");
        if (chartElement) {
             const canvas = await html2canvas(chartElement);
             const imgData = canvas.toDataURL("image/png");
             doc.addImage(imgData, 'PNG', 14, 40, 180, 100);
        }

        autoTable(doc, {
            startY: 150,
            head: [['Statistic', 'Value']],
            body: [
                ['Total Waste Collected', `${totalCollected} kg`],
                ['Completed Pickups', completedCount],
                ['Active Users', users.length],
                ['CO2 Saved', `${co2Saved} kg`],
            ],
        });

        doc.save("eco-track-report.pdf");
        toast({ title: "Report Downloaded", description: "Your PDF report has been generated." });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
             
             {/* ROW 1: System Health & Quick Status (New Design) */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <Card className="md:col-span-3 border-l-4 border-l-emerald-500 shadow-sm bg-white hover:shadow-md transition-shadow">
                     <div className="p-6 flex items-center justify-between">
                         <div className="flex items-center gap-5">
                             <div className="bg-emerald-100 p-3 rounded-2xl">
                                 <Activity className="h-6 w-6 text-emerald-600" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800 text-lg">System Status: Operational</h3>
                                 <p className="text-sm text-slate-500 mt-1">All services running optimally. Sync operational.</p>
                             </div>
                         </div>
                         <div className="flex gap-6 text-sm font-medium">
                             <span className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> API Online</span>
                             <span className="flex items-center gap-2 text-slate-600"><CheckCircle className="h-4 w-4 text-emerald-500"/> DB Healthy</span>
                         </div>
                     </div>
                 </Card>
                 <Card className="bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors"></div>
                     <div className="p-6 flex flex-col justify-center h-full relative z-10">
                         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Eco Impact Score</h3>
                         <div className="text-4xl font-bold text-emerald-400 flex items-center gap-2">
                             A+ 
                             <TrendingUp className="h-6 w-6 text-emerald-500" />
                         </div>
                         <p className="text-xs text-slate-400 mt-2">Top 5% Performance</p>
                     </div>
                 </Card>
             </div>

             {/* ROW 2: KPIs */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div onClick={() => onNavigate('pickups')} className="cursor-pointer">
                     <StatCard 
                        title={`Total Waste (${timeFilter})`}
                        value={totalCollected} 
                        icon={Trash2} 
                        trend={{ value: 12, direction: 'up' }}
                        subtext="kg collected"
                        color="blue"
                     />
                 </div>
                 <div onClick={() => onNavigate('pickups')} className="cursor-pointer">
                     <StatCard 
                        title="Completed Pickups" 
                        value={completedCount} 
                        icon={CheckCircle} 
                        trend={{ value: 5, direction: 'up' }}
                        subtext="jobs finished"
                        color="green"

                     />
                 </div>
                 <div onClick={() => onNavigate('users')} className="cursor-pointer">
                     <StatCard 
                        title="Active Users" 
                        value={users.length} 
                        icon={User} 
                        trend={{ value: 3, direction: 'up' }}
                        subtext="registered accounts"
                        color="indigo"
                     />
                 </div>
                 <div onClick={() => onNavigate('map')} className="cursor-pointer">
                     <StatCard 
                        title="Live Fleet" 
                        value={initialOnline} 
                        icon={Truck} 
                        trend={{ value: initialOnline, direction: 'neutral' }}
                        subtext="drivers online"
                        color="orange"
                     />
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* LEFT: Analytics Chart */}
                 <Card className="col-span-2 border-0 shadow-sm bg-white">
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <div>
                             <CardTitle className="text-lg font-bold text-slate-800">Collection Analytics</CardTitle>
                             <CardDescription>Daily waste collection volume</CardDescription>
                         </div>
                         <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setWasteTypeFilter('all')} className={wasteTypeFilter === 'all' ? 'bg-slate-100' : ''}>All</Button>
                            <Button size="sm" variant="outline" onClick={() => setWasteTypeFilter('Plastic')} className={wasteTypeFilter === 'Plastic' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}>Plastic</Button>
                            <Button size="sm" onClick={exportPDF}>Export Report</Button>
                         </div>
                     </CardHeader>
                     <CardContent id="analytics-chart" className="pt-4">
                         <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `${v}kg`}/>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                    />
                                    <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                     </CardContent>
                 </Card>

                 {/* RIGHT: Recent Activity */}
                 <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
                     <CardHeader className="pb-4 border-b border-slate-50">
                         <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                             <Activity className="h-5 w-5 text-indigo-500" /> Live Feed
                         </CardTitle>
                     </CardHeader>
                     <CardContent className="flex-1 overflow-y-auto max-h-[400px] p-0 custom-scrollbar">
                         <ActivityFeed activities={activities.slice(0, 8)} />
                     </CardContent>
                     <div className="p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-xl">
                         <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-white font-medium">View All Activity</Button>
                     </div>
                 </Card>
             </div>
        </div>
    );
}
