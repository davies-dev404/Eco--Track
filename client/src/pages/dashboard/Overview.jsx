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
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockWasteRecords, wasteTypeColors } from "@/lib/mockData";
import { ArrowUpRight, Leaf, Scale, Truck } from "lucide-react";

export default function DashboardOverview() {
  // Aggregate data for charts
  const wasteByType = mockWasteRecords.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + record.weight;
    return acc;
  }, {});

  const pieData = Object.entries(wasteByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value.toFixed(1)),
    color: wasteTypeColors[name]
  }));

  // Aggregate by date (last 7 days for simplicity in this view)
  const recentData = mockWasteRecords.slice(0, 7).reverse().map(record => ({
    date: record.date.split('-').slice(1).join('/'),
    weight: record.weight
  }));

  const totalWeight = mockWasteRecords.reduce((acc, r) => acc + r.weight, 0);
  const totalCarbon = mockWasteRecords.reduce((acc, r) => acc + r.carbonSaved, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your sustainability impact.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarbon.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pickups</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next scheduled: Tomorrow
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recycling Trends</CardTitle>
            <CardDescription>Daily weight collected over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}kg`} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="weight" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Waste Breakdown</CardTitle>
            <CardDescription>Distribution by material type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Your latest recycling activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWasteRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: wasteTypeColors[record.type] }}
                  >
                    {record.type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none capitalize">{record.type}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                </div>
                <div className="font-medium">
                  {record.weight} kg
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
