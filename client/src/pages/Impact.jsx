import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, TreeDeciduous, Droplets, Wind } from "lucide-react";
import { Link } from "wouter";
import impactHero from "@assets/generated_images/global_environmental_impact_visualization.png";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const globalStats = [
  {
    label: "CO2 Emissions Prevented",
    value: "127,543 tons",
    description: "Equivalent to taking 25,400 cars off the road",
    icon: Wind,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    label: "Water Saved",
    value: "4.8M liters",
    description: "Enough to fill 1,920 olympic swimming pools",
    icon: Droplets,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
  },
  {
    label: "Trees Saved",
    value: "21,450+",
    description: "Forest area larger than Central Park",
    icon: TreeDeciduous,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Landfill Diverted",
    value: "92%",
    description: "Of all waste processed through EcoTrack",
    icon: Globe,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
];

const impactData = [
  { year: '2020', waste: 412, recycled: 115 },
  { year: '2021', waste: 378, recycled: 194 },
  { year: '2022', waste: 342, recycled: 267 },
  { year: '2023', waste: 298, recycled: 312 },
  { year: '2024', waste: 235, recycled: 389 },
  { year: '2025', waste: 184, recycled: 456 },
];

export default function Impact() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={impactHero} 
              alt="Global Impact" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 animate-in slide-in-from-bottom-5 duration-700">
              Measuring Our <span className="text-primary-foreground text-green-400">Collective Footprint</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-100">
              Transparency is key to sustainability. See how the EcoTrack community is changing the world, one kilogram at a time.
            </p>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="py-20 -mt-20 relative z-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {globalStats.map((stat, i) => (
                <Card key={i} className="shadow-lg border-none animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium text-muted-foreground mb-1">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground/80">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Visualization Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-bold">The Shift to Circularity</h2>
                <p className="text-lg text-muted-foreground">
                  Our data shows a clear trend: as communities adopt EcoTrack, landfill waste decreases while recycling rates skyrocket. We're not just managing waste; we're eliminating it.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-white h-4 rounded-full overflow-hidden border">
                      <div className="bg-green-500 h-full w-[85%]"></div>
                    </div>
                    <span className="font-bold text-green-700">85% Recycled</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-white h-4 rounded-full overflow-hidden border">
                      <div className="bg-blue-500 h-full w-[60%]"></div>
                    </div>
                    <span className="font-bold text-blue-700">60% Composted</span>
                  </div>
                </div>
                <Link href="/auth?tab=register">
                  <Button size="lg" className="mt-4">
                    Join the Statistics <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <Card className="shadow-none bg-transparent border-none">
                <CardHeader>
                  <CardTitle>Community Waste vs. Recycling</CardTitle>
                  <CardDescription>Metric Tons per Year (2020-2025)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={impactData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Area 
                          type="monotone" 
                          dataKey="recycled" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorRecycled)" 
                          name="Recycled Material"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="waste" 
                          stroke="hsl(var(--destructive))" 
                          fillOpacity={1} 
                          fill="url(#colorWaste)" 
                          name="Landfill Waste"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
