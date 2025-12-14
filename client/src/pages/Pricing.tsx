import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const plans = [
    {
      name: "Individual",
      price: "Free",
      description: "Perfect for households wanting to track their impact.",
      features: [
        "Waste tracking dashboard",
        "Basic recycling guide",
        "Community leaderboard access",
        "1 pickup request per month",
        "Mobile app access"
      ],
      limitations: [
        "Advanced analytics",
        "Custom reporting",
        "Priority support"
      ],
      cta: "Sign Up Free",
      popular: false
    },
    {
      name: "Organization",
      price: "$49",
      period: "/month",
      description: "For small businesses and community groups.",
      features: [
        "Everything in Individual",
        "Multi-user management",
        "Weekly waste analytics",
        "Unlimited pickup requests",
        "Carbon footprint certification",
        "Email support"
      ],
      limitations: [
        "API access",
        "Dedicated account manager"
      ],
      cta: "Start 14-Day Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for cities and large corporations.",
      features: [
        "Everything in Organization",
        "IoT sensor integration",
        "Custom API access",
        "White-label options",
        "SLA guarantees",
        "Dedicated account manager",
        "24/7 Phone support"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your sustainability goals. No hidden fees, cancel anytime.
            </p>
          </div>
        </section>

        <section className="py-20 -mt-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <Card key={i} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'shadow-lg'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground opacity-60">
                          <X className="h-4 w-4 shrink-0" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/auth?tab=register"}>
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Have questions?</h2>
            <p className="text-muted-foreground mb-8">
              Check out our FAQ or contact our support team.
            </p>
            <Link href="/contact">
              <Button variant="link">Contact Support &rarr;</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
