import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { wasteTypeColors } from "@/lib/constants";
import { ArrowUpRight, Leaf, Scale, Truck, CalendarClock, MapPin, CheckCircle, TrendingUp, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Trophy, Gift, CreditCard, Heart, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusStepper } from "@/components/ui/StatusStepper";
import ImpactCertificate from "@/components/ImpactCertificate";

import { useSocket } from "@/context/SocketContext";
import { Link } from "wouter";

export default function DashboardOverview() {
  const { toast } = useToast();
  const socket = useSocket();
  const [records, setRecords] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Get user from local storage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || user?._id;

  const fetchData = (silent = false) => {
      if (!silent) setIsLoading(true);
      Promise.all([
            api.get(`/waste?userId=${userId}`),
            api.get(`/pickup?userId=${userId}`),
            api.get(`/auth/${userId}`) // Fetch fresh user data (credits)
      ]).then(([{ data: wasteData }, { data: pickupData }, { data: freshUser }]) => {
            setRecords(wasteData);
            setPickups(pickupData);
            setUserData(freshUser);
            setIsLoading(false);
      }).catch(err => {
            console.error(err);
            setIsLoading(false);
      });
  };

  useEffect(() => {
    if (userId) {
        fetchData();
        const intervalId = setInterval(() => fetchData(true), 15000);
        return () => clearInterval(intervalId);
    }
  }, [userId]);

  // Real-Time Listeners
  useEffect(() => {
      if (!socket || !userId) return;

      socket.on("pickup_updated", (updatedPickup) => {
           if (updatedPickup.userId === userId || updatedPickup.user?._id === userId) {
                toast({ 
                    title: "Status Update", 
                    description: `Pickup is now ${updatedPickup.status.replace('_', ' ')}` 
                });
                fetchData(true);
           }
      });
      
      socket.on("waste_logged", (record) => {
          if (record.userId === userId) fetchData(true);
      });

      return () => {
          socket.off("pickup_updated");
          socket.off("waste_logged");
      };
  }, [socket, userId, toast]);

  const handleRedeem = async (item, cost) => {
      if (!userData || (userData.points || 0) < cost) {
          toast({ title: "Insufficient Points", description: "Collect more waste to earn points!", variant: "destructive" });
          return;
      }
      setIsRedeeming(true);
      setTimeout(() => {
           toast({ title: "Redeemed!", description: `Enjoy your ${item}. Check your email.` });
           setIsRedeeming(false);
      }, 1000); // Simulate API call
  };

  // Data Calculations
  const totalWeight = records.reduce((acc, r) => acc + r.weight, 0);
  const totalCarbon = records.reduce((acc, r) => acc + (r.carbonSaved || 0), 0);
  const walletBalance = userData?.wallet?.balance || 0;
  const points = userData?.points || 0;

  // Status Tracker Logic
  const activePickup = pickups
    .filter(p => ['pending', 'assigned', 'accepted', 'in_progress'].includes(p.status))
    .sort((a,b) => new Date(a.date) - new Date(b.date))[0];

  // Charts Logic
  const wasteByType = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + record.weight;
    return acc;
  }, {});

  const pieData = Object.entries(wasteByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value.toFixed(1)),
    color: wasteTypeColors[name]
  }));

  const recentData = records.slice(0, 7).reverse().map(record => ({
      date: new Date(record.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'}),
      weight: record.weight
  }));

  if (isLoading) return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-slate-200 rounded-3xl col-span-3"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* 1. HERO SECTION: Impact Statement */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                        <Leaf className="h-3 w-3" /> Sustainability Champion
                   </div>
                   <h1 className="text-4xl font-bold mb-2 leading-tight">You've saved <span className="text-emerald-400">{totalCarbon.toFixed(1)}kg</span> <br/>of CO2 emissions.</h1>
                   <p className="text-slate-400 text-lg max-w-xl">
                       That’s equivalent to planting <span className="text-white font-bold">{(totalCarbon / 20).toFixed(1)} trees</span> this month. Keep up the great work!
                   </p>
                   
                   <div className="flex gap-4 mt-8">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 h-12 font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                                  <Gift className="mr-2 h-4 w-4" /> Redeem Rewards
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Gift className="h-6 w-6 text-orange-500" /> Rewards Store
                                </DialogTitle>
                                <DialogDescription>Redeem your {points} points for exciting rewards.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                {[
                                    { name: "$5 Amazon Card", cost: 50, icon: CreditCard },
                                    { name: "$10 Safaricom Airtime", cost: 100, icon: Phone }, 
                                    { name: "Tree Donation", cost: 20, icon: Leaf },
                                    { name: "Eco-Track Merch", cost: 200, icon: Trophy },
                                ].map((reward, i) => (
                                    <div key={i} className={`group border rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-md ${points >= reward.cost ? 'bg-white border-slate-200 hover:border-green-400' : 'bg-slate-50 opacity-60'}`}
                                            onClick={() => handleRedeem(reward.name, reward.cost)}
                                    >
                                        <div className="bg-orange-100 group-hover:bg-orange-200 p-4 rounded-full mb-3 text-orange-600 transition-colors">
                                            <reward.icon className="h-6 w-6" />
                                        </div>
                                        <h4 className="font-bold text-slate-800">{reward.name}</h4>
                                        <p className="text-xs font-bold text-emerald-600 mt-1">{reward.cost} Points</p>
                                    </div>
                                ))}
                            </div>
                          </DialogContent>
                      </Dialog>

                       <Link href="/dashboard/impact">
                           <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full px-6 h-12 font-medium backdrop-blur-md">
                               View Detailed Report
                           </Button>
                       </Link>
                   </div>
              </div>
              
              {/* Floating Certificate Card */}
              <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-72 text-center transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer shadow-2xl">
                       <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-3 drop-shadow-md" />
                       <h3 className="font-bold text-xl text-white mb-1">Impact Certified</h3>
                       <p className="text-sm text-slate-300 mb-4">Silver Tier Recycler</p>
                       <Dialog>
                          <DialogTrigger asChild>
                             <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">Download PDF</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <ImpactCertificate user={user || {}} totalWeight={totalWeight} totalCarbon={totalCarbon} />
                          </DialogContent>
                       </Dialog>
                  </div>
              </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-5 flex items-start justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wallet</p>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">KES {walletBalance}</h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors">
                      <CreditCard className="h-5 w-5" />
                  </div>
              </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-5 flex items-start justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Points</p>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{points} pts</h3>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-500 group-hover:bg-orange-100 transition-colors">
                      <Gift className="h-5 w-5" />
                  </div>
              </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-5 flex items-start justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recycled</p>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{totalWeight.toFixed(0)} kg</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <Scale className="h-5 w-5" />
                  </div>
              </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-5 flex items-start justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Impact</p>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">High</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <TrendingUp className="h-5 w-5" />
                  </div>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3. CHART: RECYCLING TRENDS (cleaner) */}
            <Card className="col-span-2 border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Recycling Trends</CardTitle>
                    <CardDescription>Your weekly contribution weight</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={recentData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} tickFormatter={(v) => `${v}kg`} />
                                <Tooltip cursor={{stroke: '#10b981', strokeWidth: 2}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 4. ACTIVE STATUS (Compact) */}
            <div className="space-y-6">
                <div>
                     <h3 className="text-lg font-bold text-slate-800 mb-4">Live Status</h3>
                     {activePickup ? (
                        <Card className="border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/5 bg-white overflow-hidden">
                            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Pickup</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">{new Date(activePickup.date).toLocaleDateString()}</span>
                            </div>
                            <CardContent className="pt-6">
                                <StatusStepper status={activePickup.status} />
                                <p className="text-center text-sm font-medium text-slate-600 mt-6">
                                    {activePickup.status === 'in_progress' ? 'Driver is on the way!' : 'Processing your request...'}
                                </p>
                            </CardContent>
                        </Card>
                     ) : (
                         <div className="bg-slate-50 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
                             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                 <Truck className="h-8 w-8 text-slate-300" />
                             </div>
                             <h4 className="text-slate-900 font-bold mb-1">No Active Pickups</h4>
                             <p className="text-slate-500 text-sm mb-4">Ready to clear some space?</p>
                             <Button className="rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800" asChild>
                                 <a href="/dashboard/log">Schedule Pickup</a>
                             </Button>
                         </div>
                     )}
                </div>

                {/* Waste Distribution */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Waste Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '11px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
      </div>
    </div>
  );
}
