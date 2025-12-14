import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Database, Activity, Archive, Globe, Lock, Share2, UserCheck, RefreshCw, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Info,
      title: "1. Introduction",
      content: "EcoTrack respects your privacy and is committed to protecting your personal data. This privacy policy informs you how we look after your data when you visit our website."
    },
    {
      icon: Database,
      title: "2. Data We Collect",
      content: "We collect Personal Identification Data (Name, email, address), Usage Data (tracking history), and Location Data (with permission for routing)."
    },
    {
      icon: Activity,
      title: "3. How We Use Your Data",
      content: "We use data to provide the Service, notify you of changes, allow interactive features, provide support, monitor usage, and prevent technical issues."
    },
    {
      icon: Archive,
      title: "4. Data Retention",
      content: "We retain your Personal Data only for as long as necessary for the purposes set out in this policy and to comply with legal obligations."
    },
    {
      icon: Globe,
      title: "5. Data Transfer",
      content: "Your information may be transferred to computers located outside of your jurisdiction where data protection laws may differ."
    },
    {
      icon: Lock,
      title: "6. Security of Data",
      content: "We strive to use commercially acceptable means to protect your Personal Data, though no method of transmission over the Internet is 100% secure."
    },
    {
      icon: Share2,
      title: "7. Third-Party Service Providers",
      content: "We may employ third parties to facilitate our Service. They have access to your data only to perform specific tasks on our behalf."
    },
    {
      icon: UserCheck,
      title: "8. Your Data Rights",
      content: "You can update your Personal Data within account settings. Contact us if you are unable to make required changes or wish to exercise other rights."
    },
    {
      icon: RefreshCw,
      title: "9. Changes to Policy",
      content: "We may update our Privacy Policy. We will notify you of any changes by posting the new policy on this page."
    },
    {
      icon: Mail,
      title: "10. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at privacy@ecotrack.com."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We care about your data and your trust.
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
                Questions? Email us at <a href="mailto:privacy@ecotrack.com" className="text-primary hover:underline font-medium">privacy@ecotrack.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
