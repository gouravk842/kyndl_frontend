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
  type RegisterFormValues,
  registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { withCallbackUrl } from "@/lib/navigation";

export function RegisterForm() {
  const { signup, isSigningUp } = useAuth();
  const callbackUrl = useSearchParams().get("callbackUrl");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  return (
    <AuthSheet
      title="Start keeping"
      description="Create an account to keep the days — then grow them into gifts."
    >
      <form
        onSubmit={handleSubmit((data) => signup(data))}
        className="space-y-4 lg:space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <AuthField
            id="first_name"
            label="First name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <AuthField
            id="last_name"
            label="Last name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthField
          id="password_confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirm?.message}
          {...register("password_confirm")}
        />
        <MetalButton type="submit" disabled={isSigningUp}>
          {isSigningUp ? "Creating account…" : "Create account"}
        </MetalButton>
        <p className="text-center text-sm text-[#7A6258]">
          Already a member?{" "}
          <Link
            href={withCallbackUrl(ROUTES.login, callbackUrl)}
            className="font-medium text-[#C75B39] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthSheet>
  );
}
