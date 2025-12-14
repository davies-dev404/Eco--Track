import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Recycle, Truck, BarChart3, Users } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/eco-friendly_city_hero_image.png";
import recyclingImage from "@assets/generated_images/community_recycling_illustration.png";
import truckImage from "@assets/generated_images/electric_collection_truck_illustration.png";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-8 animate-in slide-in-from-left-5 duration-700">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-primary bg-primary/10">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                  New Feature: Smart Pickup Scheduling
                </div>
                <h1 className="text-4xl font-heading font-bold tracking-tight sm:text-5xl xl:text-6xl text-foreground">
                  Waste Management for a <span className="text-primary">Greener Future</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                  Track your recycling impact, schedule eco-friendly pickups, and join a community dedicated to sustainable living.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth?tab=register">
                    <Button size="lg" className="h-12 px-8 text-base">
                      Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                      Learn More
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <p>Joined by 10,000+ eco-warriors</p>
                </div>
              </div>
              
              <div className="relative animate-in slide-in-from-right-5 duration-700 delay-200">
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/50">
                   <img 
                    src={heroImage} 
                    alt="Sustainable Future City" 
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 md:bottom-10 md:-left-10 bg-card p-6 rounded-xl shadow-xl border border-border max-w-[240px] animate-in fade-in zoom-in duration-500 delay-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Recycle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Recycled</p>
                      <p className="text-xl font-bold text-foreground">1,240 tons</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">Everything you need to go zero-waste</h2>
              <p className="text-muted-foreground text-lg">
                EcoTrack provides comprehensive tools for individuals and organizations to manage waste responsibly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="h-6 w-6 text-primary" />,
                  title: "Track Your Impact",
                  description: "Visualize your recycling habits with detailed analytics and carbon footprint estimation."
                },
                {
                  icon: <Truck className="h-6 w-6 text-primary" />,
                  title: "Smart Pickups",
                  description: "Schedule waste collection with optimized routing for reduced emissions."
                },
                {
                  icon: <Users className="h-6 w-6 text-primary" />,
                  title: "Community Goals",
                  description: "Join local initiatives and compete in recycling challenges with your neighborhood."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Spotlight 1 */}
        <section className="py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border">
                  <img src={recyclingImage} alt="Community Recycling" className="object-cover w-full h-full" />
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Join the Movement</h2>
                <p className="text-lg text-muted-foreground">
                  Connect with local recycling centers and community groups. See real-time data on how your neighborhood is performing and participate in weekly challenges to reduce landfill waste.
                </p>
                <ul className="space-y-3">
                  {['Local leaderboards', 'Community events', 'Waste sorting guides'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Spotlight 2 */}
        <section className="py-24 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Effortless Pickups</h2>
                <p className="text-lg text-muted-foreground">
                  Need to dispose of e-waste or bulk items? Schedule a pickup in seconds. Our smart routing system ensures the most fuel-efficient collection paths.
                </p>
                <Button size="lg" variant="outline">Schedule a Demo</Button>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border">
                <img src={truckImage} alt="Electric Collection Truck" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to make a difference?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join thousands of individuals and organizations committed to a sustainable future. Start tracking your impact today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?tab=register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base text-foreground font-semibold">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
