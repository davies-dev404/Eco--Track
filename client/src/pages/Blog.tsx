import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import blogHeader from "@assets/generated_images/sustainable_living_blog_header.png";

export default function Blog() {
  const posts = [
    {
      title: "10 Simple Ways to Reduce Plastic at Home",
      category: "Lifestyle",
      author: "Sarah Jenkins",
      date: "Oct 12, 2024",
      excerpt: "Small changes can add up to a massive impact. Here are our top tips for a plastic-free kitchen and bathroom.",
      image: blogHeader
    },
    {
      title: "Understanding the New E-Waste Regulations",
      category: "Policy",
      author: "David Chen",
      date: "Oct 08, 2024",
      excerpt: "What you need to know about the upcoming legislation regarding electronic waste disposal and recycling.",
      image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "The Future of Composting Technology",
      category: "Tech",
      author: "Maria Rodriguez",
      date: "Sep 28, 2024",
      excerpt: "From smart bins to industrial biodigesters, technology is making composting more efficient and accessible than ever.",
      image: "https://images.unsplash.com/photo-1533626904905-cc52fd9920fd?auto=format&fit=crop&q=80&w=800"
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
                <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md flex flex-col">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <Link href="/blog/post-1">
                      <h3 className="text-xl font-bold hover:text-primary cursor-pointer leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{post.author}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto text-center">
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
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
