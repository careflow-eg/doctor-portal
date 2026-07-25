import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-careflow-teal/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-careflow-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Image
              src="/assets/img/logo.png"
              alt="CareFlow Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/assets/img/logo_white.png"
              alt="CareFlow Logo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain hidden dark:block"
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground">Doctor & Clinic Portal</p>
        </div>

        {children}
      </div>
    </div>
  );
}
