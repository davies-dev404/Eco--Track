import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import careersImage from "@assets/generated_images/creative_team_collaboration.png";

export default function Careers() {
  const jobs = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time"
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Sustainability Analyst",
      department: "Operations",
      location: "London, UK",
      type: "Full-time"
    },
    {
      title: "Community Manager",
      department: "Marketing",
      location: "New York, NY",
      type: "Full-time"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={careersImage} 
              alt="Careers at EcoTrack" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 text-white text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 animate-in slide-in-from-bottom-5 duration-700">
              Join the <span className="text-green-400">Green Revolution</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-white/90 mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-100">
              We're looking for passionate individuals who want to use their skills to build a more sustainable future.
            </p>
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white border-none animate-in slide-in-from-bottom-5 duration-700 delay-200">
              View Open Positions
            </Button>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">Why Work With Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Beyond competitive pay and benefits, we offer the chance to do work that actually matters.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-24">
              {[
                { title: "Mission Driven", desc: "Every line of code and design decision contributes to a cleaner planet." },
                { title: "Remote First", desc: "Work from where you're most productive. We value output over hours." },
                { title: "Growth Budget", desc: "$2,000 annual stipend for conferences, courses, and personal development." }
              ].map((perk, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <h3 className="text-xl font-bold mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground">{perk.desc}</p>
                </div>
              ))}
            </div>

            <div id="positions" className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <Card key={i} className="hover:border-primary transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.type}</span>
                        </div>
                      </div>
                      <Button variant="ghost" className="shrink-0 group-hover:translate-x-1 transition-transform">
                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
