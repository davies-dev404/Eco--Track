import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, ShieldCheck, Users, Mail, MapPin, Phone, Rocket, Eye, BookOpen, Target, Lightbulb, History, Leaf } from "lucide-react";
import teamImage from "@assets/generated_images/diverse_team_working_in_nature.png";
import cleanupImage from "@assets/generated_images/happy_community_cleanup_event.png";
import officeImage from "@assets/generated_images/modern_sustainable_office_interior.png";
import labImage from "@assets/generated_images/innovation_lab_technology.png";
import awardImage from "@assets/generated_images/sustainability_award_ceremony.png";
import missionImage from "@assets/mission_future_city.png";
import visionImage from "@assets/vision_community.png";
import globalImage from "@assets/global_network.png";
import communityImage from "@assets/generated_images/community_success_story.png";
import recyclingIllustration from "@assets/generated_images/community_recycling_illustration.png";
import collaborationImage from "@assets/generated_images/creative_team_collaboration.png";
import cityHeroImage from "@assets/generated_images/eco-friendly_city_hero_image.png";
import truckImage from "@assets/generated_images/electric_collection_truck_illustration.png";
import impactVizImage from "@assets/generated_images/global_environmental_impact_visualization.png";
import recyclingInfoImage from "@assets/generated_images/recycling_process_infographic.png";
import smartSystemImage from "@assets/generated_images/smart_waste_management_system_illustration.png";
import corporateOfficeImage from "@assets/generated_images/sustainable_corporate_office.png";
import blogHeaderImage from "@assets/generated_images/sustainable_living_blog_header.png";

export default function About() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Community", "Team & HQ", "Innovation", "Impact"];

  const galleryItems = [
    { src: communityImage, title: "Success Stories", category: "Community" },
    { src: cleanupImage, title: "Community Cleanup", category: "Community" },
    { src: officeImage, title: "Our Green HQ", category: "Team & HQ" },
    { src: labImage, title: "Innovation Lab", category: "Innovation" },
    { src: teamImage, title: "Concept & Planning", category: "Team & HQ" },
    { src: missionImage, title: "Future Goals", category: "Innovation" },
    { src: visionImage, title: "Community Vision", category: "Community" },
    { src: globalImage, title: "Global Network", category: "Impact" },
    { src: awardImage, title: "Celebrating Our Impact", category: "Impact" },
    { src: recyclingIllustration, title: "Recycling Initiatives", category: "Community" },
    { src: collaborationImage, title: "Creative Collaboration", category: "Team & HQ" },
    { src: cityHeroImage, title: "Eco City Concepts", category: "Innovation" },
    { src: truckImage, title: "Zero-Emission Fleet", category: "Innovation" },
    { src: impactVizImage, title: "Global Impact Viz", category: "Impact" },
    { src: recyclingInfoImage, title: "Circular Economy", category: "Impact" },
    { src: smartSystemImage, title: "Smart Utilities", category: "Innovation" },
    { src: corporateOfficeImage, title: "Corporate Sustainability", category: "Team & HQ" },
    { src: blogHeaderImage, title: "Sustainable Living", category: "Community" }
  ];

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From a neighborhood initiative to a global movement.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: History,
                  title: "The Beginning",
                  content: "It started in a small neighborhood park in 2023. A group of friends noticed that despite best intentions, local recycling bins were contaminated and resources were wasted."
                },
                {
                  icon: Lightbulb,
                  title: "The Realization",
                  content: "We realized the problem wasn't lack of care—it was lack of clarity. Traditional waste management was opaque and disconnected from the people it served."
                },
                {
                  icon: Leaf,
                  title: "The Solution",
                  content: "EcoTrack bridges that gap. We connect individuals and organizations to create a transparent ecosystem where every item has a place and nothing goes to waste."
                }
              ].map((item, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <Target className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold">Our Mission</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    To empower every individual and organization with the tools, knowledge, and community support needed to achieve zero waste. We believe that by making sustainability accessible and transparent, we can collectively regenerate our planet.
                  </p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
                   <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <Eye className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold">Our Vision</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    A world where waste is viewed as a resource history lesson, not a destination. We envision a future where circular economies are the norm and communities thrive in harmony with nature.
                  </p>
                </CardContent>
              </Card>
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

        {/* Gallery Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">Life at EcoTrack</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Only see what you want to see.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="rounded-full px-6"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <div 
                  key={index} 
                  className="group overflow-hidden rounded-xl relative cursor-pointer aspect-square"
                  onClick={() => setSelectedImage(item)}
                >
                  <img 
                    src={item.src} 
                    alt={item.title} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
            {selectedImage && (
              <div className="relative w-full h-full max-h-[85vh] flex flex-col items-center">
                <img 
                  src={selectedImage.src} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-contain rounded-lg shadow-2xl"
                />
                <h3 className="text-white mt-4 text-xl font-medium drop-shadow-md">{selectedImage.title}</h3>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
