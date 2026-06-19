import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Pricing",
  description: "Simple, transparent pricing for teams of every size.",
  path: "/pricing",
});

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For individuals exploring Kyndl",
    features: ["Up to 3 users", "Basic CRM", "Community support"],
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing teams that need more power",
    features: ["Unlimited users", "AI workflows", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: ["SSO & SAML", "Dedicated SLA", "Custom integrations"],
  },
] as const;

export default function PricingPage() {
  return (
    <PageContainer className="py-16 md:py-24">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Choose the plan that fits your stage. Upgrade anytime.
        </p>
      </FadeIn>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <FadeIn key={plan.name} delay={0.1}>
            <Card
              className={
                "highlighted" in plan && plan.highlighted
                  ? "border-primary shadow-lg"
                  : undefined
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <ButtonLink
                  className="w-full"
                  variant={
                    "highlighted" in plan && plan.highlighted
                      ? "default"
                      : "outline"
                  }
                  href={ROUTES.register}
                >
                  Get started
                </ButtonLink>
              </CardFooter>
            </Card>
          </FadeIn>
        ))}
      </div>
    </PageContainer>
  );
}
