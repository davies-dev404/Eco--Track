import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, UserCog, UserPlus, Truck, Shield, Ban, AlertTriangle, RefreshCw, Mail } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      content: "By accessing and using EcoTrack (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services."
    },
    {
      icon: FileText,
      title: "2. Description of Service",
      content: "EcoTrack provides a waste management and tracking platform designed to help individuals and organizations monitor their recycling habits and schedule pickups. The Service is provided \"as is\" and EcoTrack assumes no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings."
    },
    {
      icon: Ban,
      title: "3. User Conduct",
      content: "You agree to use the Service only for lawful purposes. You are prohibited from posting violating content, infringing on rights, or encouraging criminal offenses."
    },
    {
      icon: UserPlus,
      title: "4. Registration and Account Security",
      content: "To access certain features, you must register. You agree to provide accurate information and are responsible for safeguarding your password and all account activities."
    },
    {
      icon: Truck,
      title: "5. Waste Pickup Services",
      content: "Pickup requests are subject to availability. We reserve the right to refuse service for hazardous materials. Cancellation fees may apply for pickups cancelled less than 24 hours in advance."
    },
    {
      icon: Shield,
      title: "6. Intellectual Property",
      content: "The content, organization, graphics, design, and other matters related to the Site are protected under applicable copyrights and trademarks. Copying or redistribution is strictly prohibited."
    },
    {
      icon: UserCog,
      title: "7. Termination",
      content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      icon: AlertTriangle,
      title: "8. Limitation of Liability",
      content: "In no event shall EcoTrack be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of the Service."
    },
    {
      icon: RefreshCw,
      title: "9. Changes to Terms",
      content: "We reserve the right to modify these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect."
    },
    {
      icon: Mail,
      title: "10. Contact Us",
      content: "If you have any questions about these Terms, please contact us at legal@ecotrack.com."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Terms of Service</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using our service.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
              <RefreshCw className="h-4 w-4" />
              <span>Last updated: December 14, 2025</span>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {sections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-primary/10 group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold">{section.title}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                Questions? Email us at <a href="mailto:legal@ecotrack.com" className="text-primary hover:underline font-medium">legal@ecotrack.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
