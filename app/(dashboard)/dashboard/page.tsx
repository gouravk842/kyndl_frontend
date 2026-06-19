import { FadeIn } from "@/components/animations/fade-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Your Kyndl workspace overview",
  path: "/dashboard",
  noIndex: true,
});

const stats = [
  { label: "Active deals", value: "24", change: "+12%" },
  { label: "Revenue (MTD)", value: "$48.2k", change: "+8%" },
  { label: "AI sessions", value: "1,204", change: "+34%" },
  { label: "Team members", value: "18", change: "0%" },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back. Here is what is happening today.
          </p>
        </div>
      </FadeIn>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={0.05 * i}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
