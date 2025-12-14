import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Shield, Zap, BarChart, Smartphone, Globe, ArrowRight, Scan, Truck, Recycle, Database } from "lucide-react";
import { Link } from "wouter";
import featuresImage from "@assets/generated_images/smart_waste_management_system_illustration.png";
import processImage from "@assets/generated_images/recycling_process_infographic.png";

export default function Features() {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile Tracking App",
      description: "Scan barcodes to identify recyclable materials instantly. Track your personal recycling history and earn rewards for consistent habits.",
    },
    {
      icon: BarChart,
      title: "Real-time Analytics",
      description: "Visual dashboards showing waste diversion rates, carbon savings, and contamination reduction trends over time.",
    },
    {
      icon: Globe,
      title: "Smart Routing",
      description: "AI-powered collection routes that adapt based on bin fullness sensors, reducing fuel consumption and emissions by up to 30%.",
    },
    {
      icon: Shield,
      title: "Compliance Management",
      description: "Automated reporting for local regulations and sustainability certifications. Never miss a compliance deadline again.",
    },
    {
      icon: Zap,
      title: "Instant Pickup Requests",
      description: "On-demand scheduling for bulk items, e-waste, and hazardous materials with transparent pricing and tracking.",
    },
    {
      icon: Check,
      title: "Contamination Alerts",
      description: "Image recognition technology to identify and alert users about non-recyclable items before they contaminate the bin.",
    }
  ];

  const steps = [
    {
      icon: Scan,
      title: "1. Scan & Sort",
      description: "Use the mobile app to scan items and get instant disposal instructions."
    },
    {
      icon: Recycle,
      title: "2. Smart Collection",
      description: "IoT-enabled bins notify collection teams when they are full."
    },
    {
      icon: Truck,
      title: "3. Optimized Pickup",
      description: "Electric fleets follow AI-optimized routes to collect waste efficiently."
    },
    {
      icon: Database,
      title: "4. Track Impact",
      description: "View your environmental impact and earn community rewards."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-heading font-bold animate-in slide-in-from-left-5 duration-700">
                  Technology for a <span className="text-primary">Cleaner World</span>
                </h1>
                <p className="text-xl text-muted-foreground animate-in slide-in-from-left-5 duration-700 delay-100">
                  Our comprehensive platform combines IoT sensors, mobile apps, and data analytics to revolutionize how you manage waste.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link href="/auth?tab=register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline">View Pricing</Button>
                  </Link>
                </div>
              </div>
              <div className="relative animate-in slide-in-from-right-5 duration-700 delay-200">
                <img 
                  src={featuresImage} 
                  alt="Smart Waste Features" 
                  className="rounded-2xl shadow-2xl w-full max-h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">How EcoTrack Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A seamless ecosystem connecting waste generators with sustainable disposal solutions.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
               <div className="relative order-2 lg:order-1">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border bg-muted">
                   <img 
                    src={processImage} 
                    alt="How it works process" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-8 order-1 lg:order-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                 Everything you need to manage waste responsibly and efficiently.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <Card key={i} className="border-none shadow-lg hover:-translate-y-1 transition-transform duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-6">Ready to upgrade your waste management?</h2>
            <Link href="/auth?tab=register">
              <Button size="lg" variant="secondary" className="font-semibold">
                Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
