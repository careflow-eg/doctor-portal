import type { Metadata } from "next";

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
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-careflow-teal flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">
              Care<span style={{ color: "var(--careflow-teal)" }}>Flow</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Doctor & Clinic Portal</p>
        </div>

        {children}
      </div>
    </div>
  );
}
