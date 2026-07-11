import { AuthHeader } from "@/components/layout/auth-header";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { ThreadSpool } from "@/features/auth/components/keepsake-props";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F5EAD9]">
      {/* Warm desk wash behind the whole page */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255,214,170,0.5) 0%, transparent 62%), radial-gradient(ellipse 60% 50% at 85% 95%, rgba(200,150,90,0.28) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="kyndl-grain pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      />

      {/* A spool of binding thread resting on the desk */}
      <ThreadSpool
        className="pointer-events-none absolute -right-6 bottom-8 hidden size-40 rotate-[8deg] opacity-90 xl:block"
        aria-hidden
      />

      <AuthHeader />

      <main className="relative flex flex-1 items-center justify-center px-4 pb-12 pt-2 sm:px-8">
        <div className="grid w-full max-w-5xl items-stretch gap-10 lg:grid-cols-2">
          <AuthBrandPanel />
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
