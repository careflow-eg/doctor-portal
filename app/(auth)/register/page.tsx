"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useNotificationStore } from "@/stores/notificationStore";
import Link from "next/link";

const schema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
    role: z.enum(["DOCTOR", "ASSISTANT"]),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "DOCTOR" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      addNotification({
        type: "success",
        title: "Account created!",
        message: "You can now sign in with your credentials.",
      });
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      addNotification({ type: "error", title: "Registration failed", message: msg });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl border border-border">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register for CareFlow Doctor Portal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Full name
          </label>
          <input
            type="text"
            {...register("full_name")}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 focus:border-careflow-teal transition-all"
            placeholder="Dr. Jane Smith"
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 focus:border-careflow-teal transition-all"
            placeholder="doctor@clinic.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Role
          </label>
          <select
            {...register("role")}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 focus:border-careflow-teal transition-all"
          >
            <option value="DOCTOR">Doctor</option>
            <option value="ASSISTANT">Clinic Assistant</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 focus:border-careflow-teal transition-all"
              placeholder="Min 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Confirm password
          </label>
          <input
            type="password"
            {...register("confirm_password")}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-careflow-teal/50 focus:border-careflow-teal transition-all"
            placeholder="Re-enter password"
          />
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-careflow-teal hover:bg-careflow-teal-hover text-white font-semibold py-3 text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-careflow-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
