"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthSheet } from "@/features/auth/components/auth-sheet";
import { MetalButton } from "@/features/auth/components/metal-button";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";

export function ForgotPasswordForm() {
  const {
    requestPasswordReset,
    isRequestingReset,
    confirmPasswordReset,
    isConfirmingReset,
  } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  if (email === null) {
    return (
      <RequestStep
        loading={isRequestingReset}
        onSubmit={(values) =>
          requestPasswordReset(values, {
            // Always advances (the API is intentionally silent about whether
            // the account exists) so the user can enter the emailed code.
            onSuccess: () => setEmail(values.email),
          })
        }
      />
    );
  }

  return (
    <ConfirmStep
      email={email}
      loading={isConfirmingReset}
      onSubmit={(values) => confirmPasswordReset({ email, ...values })}
    />
  );
}

function RequestStep({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (values: ForgotPasswordFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <AuthSheet
      title="Reset your password"
      description="Enter your email and we'll send you a reset code."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
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
        <MetalButton type="submit" disabled={loading} className="mt-2">
          {loading ? "Sending…" : "Send reset code"}
        </MetalButton>
        <BackToLogin />
      </form>
    </AuthSheet>
  );
}

function ConfirmStep({
  email,
  loading,
  onSubmit,
}: {
  email: string;
  loading: boolean;
  onSubmit: (values: ResetPasswordFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", new_password: "", new_password_confirm: "" },
  });

  return (
    <AuthSheet
      title="Choose a new password"
      description={
        <>
          Enter the code sent to <strong>{email}</strong> and your new password.
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 lg:space-y-3.5"
      >
        <AuthField
          id="otp"
          label="Reset code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="text-center text-lg tracking-[0.5em]"
          error={errors.otp?.message}
          {...register("otp")}
        />
        <AuthField
          id="new_password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          {...register("new_password")}
        />
        <AuthField
          id="new_password_confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.new_password_confirm?.message}
          {...register("new_password_confirm")}
        />
        <MetalButton type="submit" disabled={loading} className="mt-2">
          {loading ? "Resetting…" : "Reset password"}
        </MetalButton>
        <BackToLogin />
      </form>
    </AuthSheet>
  );
}

function BackToLogin() {
  return (
    <p className="text-center text-sm text-[#7A6258]">
      Remembered it?{" "}
      <Link
        href={ROUTES.login}
        className="font-medium text-[#C75B39] underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </p>
  );
}
