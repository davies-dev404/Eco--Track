import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our platform, enterprise solutions, or just want to say hello? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-20 -mt-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className="font-bold text-lg mb-4">Contact Information</h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg text-primary">
                            <Mail className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <a href="mailto:support@ecotrack.com" className="text-muted-foreground hover:text-primary transition-colors">support@ecotrack.com</a>
                            <br />
                            <a href="mailto:sales@ecotrack.com" className="text-muted-foreground hover:text-primary transition-colors">sales@ecotrack.com</a>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg text-primary">
                            <Phone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-muted-foreground">+1 (555) 123-4567</p>
                            <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9am-6pm EST</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg text-primary">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Office</p>
                            <p className="text-muted-foreground">
                              123 Green Street<br />
                              Suite 400<br />
                              Eco City, EC 90210
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t">
                      <h3 className="font-bold text-lg mb-4">Live Chat</h3>
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg text-primary">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Chat with us</p>
                          <p className="text-muted-foreground text-sm">Available 24/7 for urgent issues</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="p-8 md:p-12">
                    <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="first-name" className="text-sm font-medium">First Name</label>
                          <Input id="first-name" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="last-name" className="text-sm font-medium">Last Name</label>
                          <Input id="last-name" placeholder="Doe" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input id="email" type="email" placeholder="john@example.com" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input id="subject" placeholder="How can we help?" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <Textarea id="message" placeholder="Tell us more about your inquiry..." className="min-h-[150px]" />
                      </div>

                      <Button type="submit" size="lg" className="w-full md:w-auto">
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
