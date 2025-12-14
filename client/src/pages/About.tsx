import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShieldCheck, Users, Mail, MapPin, Phone } from "lucide-react";
import teamImage from "@assets/generated_images/diverse_team_working_in_nature.png";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 animate-in slide-in-from-bottom-5 duration-700">
              Building a <span className="text-primary">Zero-Waste</span> World
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground animate-in slide-in-from-bottom-5 duration-700 delay-100">
              EcoTrack was founded on a simple belief: that smart technology and community action can solve the global waste crisis.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={teamImage} 
                  alt="Our Team" 
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-heading font-bold">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    It started in a small neighborhood park in 2023. A group of friends noticed that despite best intentions, local recycling bins were often contaminated, and valuable resources were ending up in landfills.
                  </p>
                  <p>
                    We realized the problem wasn't lack of care—it was lack of clarity and tools. Traditional waste management systems were opaque and disconnected from the people they served.
                  </p>
                  <p>
                    EcoTrack bridges that gap. By connecting individuals, organizations, and waste management providers, we create a transparent, efficient ecosystem where every item has a place, and nothing goes to waste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-heading font-bold mb-4">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide every decision we make and every feature we build.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Sustainability First",
                  description: "We prioritize long-term environmental health over short-term gains in everything we do."
                },
                {
                  icon: Users,
                  title: "Community Power",
                  description: "Real change happens when neighbors work together. We build tools that foster connection."
                },
                {
                  icon: ShieldCheck,
                  title: "Radical Transparency",
                  description: "We believe you have the right to know exactly where your waste goes and the impact it has."
                }
              ].map((value, i) => (
                <div key={i} className="bg-background p-8 rounded-xl shadow-sm border text-center hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <Card className="bg-sidebar text-sidebar-foreground border-none overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 space-y-6">
                  <h2 className="text-3xl font-heading font-bold text-white">Get in Touch</h2>
                  <p className="text-sidebar-foreground/80">
                    Have questions about enterprise solutions or want to partner with us? We'd love to hear from you.
                  </p>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>hello@ecotrack.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>123 Green Street, Eco City, EC 90210</span>
                    </div>
                  </div>
                </div>
                <div className="bg-sidebar-accent/50 p-8 md:p-12 flex flex-col justify-center">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <input className="w-full p-2 rounded bg-background/10 border border-white/20 focus:outline-none focus:border-primary text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea className="w-full p-2 rounded bg-background/10 border border-white/20 focus:outline-none focus:border-primary text-white h-24 resize-none" />
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
