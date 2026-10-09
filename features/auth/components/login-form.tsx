"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthSheet } from "@/features/auth/components/auth-sheet";
import { MetalButton } from "@/features/auth/components/metal-button";
import {
  type LoginFormValues,
  loginSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { withCallbackUrl } from "@/lib/navigation";

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const callbackUrl = useSearchParams().get("callbackUrl");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthSheet
      title="Welcome back"
      description="Sign in to open your Memory Bank and keep sending warmth."
    >
      <form
        onSubmit={handleSubmit((data) => login(data))}
        className="space-y-4 lg:space-y-3.5"
      >
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          action={
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs font-medium text-[#C75B39] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />
        <MetalButton type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </MetalButton>
        <p className="text-center text-sm text-[#7A6258]">
          New to Kyndl?{" "}
          <Link
            href={withCallbackUrl(ROUTES.register, callbackUrl)}
            className="font-medium text-[#C75B39] underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthSheet>
  );
}
