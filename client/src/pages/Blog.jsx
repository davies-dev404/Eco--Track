import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Calendar, User, ArrowRight } from "lucide-react";
import { useState } from "react";

// Images
import blogHeader from "@assets/generated_images/sustainable_living_blog_header.png";
import recyclingInfo from "@assets/generated_images/recycling_process_infographic.png";
import smartSystem from "@assets/generated_images/smart_waste_management_system_illustration.png";

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);

  const posts = [
    {
      title: "Zero-Waste Living: A Beginner's Guide",
      category: "Lifestyle",
      author: "Sarah Jenkins",
      date: "Oct 12, 2024",
      image: blogHeader,
      excerpt: "Transitioning to a zero-waste lifestyle doesn't happen overnight. Discover actionable steps to reduce your household waste.",
      content: `
        <p class="mb-4">Living a zero-waste lifestyle is a journey, not a destination. It's about being conscious of your consumption and making small, sustainable choices every day. Here are some simple ways to get started:</p>
        
        <h3 class="text-xl font-bold mb-2">1. The Big 4: Refuse, Reduce, Reuse, Recycle</h3>
        <p class="mb-4">You've heard of the 3 R's, but "Refuse" is the most important one. Refuse single-use plastics like straws, bags, and cutlery. If you don't bring it home, it doesn't become waste.</p>
        
        <h3 class="text-xl font-bold mb-2">2. Composting is Key</h3>
        <p class="mb-4">Almost 30% of household waste is organic. By composting your food scraps, you divert waste from landfills and create nutrient-rich soil for your plants.</p>
        
        <h3 class="text-xl font-bold mb-2">3. Mindful Shopping</h3>
        <p class="mb-4">Buy in bulk using your own containers. Choose products with minimal or plastic-free packaging. Support local farmer's markets where produce is often sold loose.</p>

        <p>Remember, we don't need a handful of people doing zero waste perfectly. We need millions of people doing it imperfectly.</p>
      `
    },
    {
      title: "Demystifying Recycling Symbols",
      category: "Education",
      author: "David Chen",
      date: "Oct 08, 2024",
      image: recyclingInfo,
      excerpt: "Ever confused by the numbers on plastic containers? We break down what each symbol means for your recycling bin.",
      content: `
        <p class="mb-4">Recycling contamination is a major issue in waste management. Putting the wrong item in the recycle bin can spoil an entire batch. Let's clear up the confusion around plastic resin codes:</p>
        
        <h3 class="text-xl font-bold mb-2">#1 PET (Polyethylene Terephthalate)</h3>
        <p class="mb-4">Commonly found in soda and water bottles. <strong>Widely recycled.</strong> Ensure they are empty and rinsed.</p>
        
        <h3 class="text-xl font-bold mb-2">#2 HDPE (High-Density Polyethylene)</h3>
        <p class="mb-4">Found in milk jugs and detergent bottles. <strong>Widely recycled.</strong> Leave the caps on in most modern facilities.</p>
        
        <h3 class="text-xl font-bold mb-2">#3 PVC (Polyvinyl Chloride)</h3>
        <p class="mb-4">Used in plumbing pipes and some food wrap. <strong>Briefly: Rarely recycled.</strong> Keep these out of your curbside bin.</p>

        <p>Always check your local municipal guidelines, as recycling capabilities vary by region.</p>
      `
    },
    {
      title: "Smart Cities and Waste Management",
      category: "Technology",
      author: "Maria Rodriguez",
      date: "Sep 28, 2024",
      image: smartSystem,
      excerpt: "How IoT sensors and data analytics are optimizing collection routes and reducing carbon emissions in urban areas.",
      content: `
        <p class="mb-4">The garbage truck of the future isn't just a truck; it's a data center on wheels. Smart city technologies are revolutionizing how we handle urban waste:</p>
        
        <h3 class="text-xl font-bold mb-2">IoT Sensors</h3>
        <p class="mb-4">Smart bins equipped with fill-level sensors notify collectors only when they are full. This eliminates unnecessary pickups of empty bins and prevents overflowing bins.</p>
        
        <h3 class="text-xl font-bold mb-2">Route Optimization</h3>
        <p class="mb-4">Using real-time traffic and fill-level data, AI algorithms calculate the most efficient collection routes, reducing fuel consumption and traffic congestion by up to 30%.</p>
        
        <h3 class="text-xl font-bold mb-2">Predictive Maintenance</h3>
        <p class="mb-4">Data analytics help fleet managers predict when vehicles need maintenance before a breakdown occurs, ensuring reliable service for residents.</p>

        <p>EcoTrack is at the forefront of this revolution, partnering with municipalities to implement these smart solutions today.</p>
      `
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">The EcoTrack Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tips, and news about sustainability, waste management, and the circular economy.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <Card key={i} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 shadow-md flex flex-col h-full bg-card">
                  <div className="aspect-video overflow-hidden relative cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <Badge className="absolute top-4 left-4 bg-background/90 text-foreground hover:bg-background/90 backdrop-blur-sm">
                      {post.category}
                    </Badge>
                  </div>
                  
                  <CardHeader className="space-y-3 pb-2">
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <h3 
                      className="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer leading-tight"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.title}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="flex-1 text-sm text-muted-foreground">
                    <p className="line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 mt-auto">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {post.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{post.author}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                        onClick={() => setSelectedPost(post)}
                      >
                        Read More <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Read More Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-border/50">
            {selectedPost && (
              <>
                <div className="absolute right-4 top-4 z-10">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full h-8 w-8 bg-background/80 hover:bg-background backdrop-blur-md"
                    onClick={() => setSelectedPost(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="h-48 md:h-64 relative shrink-0">
                  <img 
                    src={selectedPost.image} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <Badge className="mb-2 bg-primary text-primary-foreground border-none">
                      {selectedPost.category}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight shadow-sm">
                      {selectedPost.title}
                    </h2>
                  </div>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto">
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedPost.date}</span>
                      </div>
                    </div>
                    
                    <div 
                      className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t bg-muted/20 shrink-0 flex justify-end">
                   <Button onClick={() => setSelectedPost(null)}>Close Article</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z M50 20 C33.4 20 20 33.4 20 50 C20 66.6 33.4 80 50 80 C66.6 80 80 66.6 80 50 C80 33.4 66.6 20 50 20 Z" />
            </svg>
          </div>

          <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
            <h2 className="text-3xl font-heading font-bold mb-6">Stay in the loop</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Subscribe to our newsletter for the latest sustainability tips and product updates.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 rounded-md border-none text-foreground focus:ring-2 focus:ring-offset-2 focus:ring-primary-foreground"
              />
              <Button variant="secondary" className="font-semibold">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
