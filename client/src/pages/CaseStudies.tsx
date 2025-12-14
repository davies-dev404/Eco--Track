import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import caseStudyImage from "@assets/generated_images/community_success_story.png";

export default function CaseStudies() {
  const cases = [
    {
      title: "How Portland Reduced Landfill Waste by 40%",
      category: "Municipality",
      excerpt: "By implementing smart sensors and community incentives, the city of Portland transformed its waste management approach.",
      image: caseStudyImage,
      stats: { "Waste Reduced": "40%", "Cost Savings": "$2.5M", "Participation": "85%" }
    },
    {
      title: "TechGiant Corp's Journey to Zero Waste",
      category: "Enterprise",
      excerpt: "A look inside the massive campus overhaul that led to a 95% diversion rate for one of the world's largest tech companies.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      stats: { "Diversion Rate": "95%", "CO2 Saved": "12k tons", "ROI": "18 mos" }
    },
    {
      title: "The Green Neighborhood Initiative",
      category: "Community",
      excerpt: "How a single neighborhood association used EcoTrack to organize weekly cleanups and shared composting.",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
      stats: { "Compost Gen": "500kg/mo", "Members": "250+", "Events": "52/yr" }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how organizations and communities around the world are using EcoTrack to make a measurable difference.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12">
              {cases.map((study, i) => (
                <div key={i} className="group grid md:grid-cols-2 gap-8 items-center border rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-shadow">
                  <div className={`aspect-video md:aspect-auto md:h-full overflow-hidden ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <img 
                      src={study.image} 
                      alt={study.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 space-y-6">
                    <Badge variant="secondary" className="mb-2">{study.category}</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold">{study.title}</h2>
                    <p className="text-muted-foreground text-lg">{study.excerpt}</p>
                    
                    <div className="grid grid-cols-3 gap-4 py-4 border-y">
                      {Object.entries(study.stats).map(([label, value]) => (
                        <div key={label}>
                          <div className="text-2xl font-bold text-primary">{value}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
                        </div>
                      ))}
                    </div>

                    <Button variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent">
                      Read Full Story <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
