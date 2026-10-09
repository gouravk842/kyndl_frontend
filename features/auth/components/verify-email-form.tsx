"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ROUTES } from "@/constants/routes";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthSheet } from "@/features/auth/components/auth-sheet";
import { MetalButton } from "@/features/auth/components/metal-button";
import {
  type VerifyEmailFormValues,
  verifyEmailSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/hooks/use-auth";

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { verifyEmail, isVerifying, resendOtp, isResendingOtp } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const handleResend = () => {
    if (!email || cooldown > 0) return;
    resendOtp(email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <AuthSheet
      title="Verify your email"
      description={
        email ? (
          <>
            Enter the code we sent to <strong>{email}</strong>.
          </>
        ) : (
          "Enter the verification code we emailed you."
        )
      }
    >
      <form
        onSubmit={handleSubmit(({ otp }) => verifyEmail({ email, otp }))}
        className="space-y-4 lg:space-y-3.5"
      >
        <AuthField
          id="otp"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="text-center text-lg tracking-[0.5em]"
          error={errors.otp?.message}
          {...register("otp")}
        />
        <MetalButton
          type="submit"
          disabled={isVerifying || !email}
          className="mt-2"
        >
          {isVerifying ? "Verifying…" : "Verify email"}
        </MetalButton>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResendingOtp || cooldown > 0 || !email}
          className="w-full text-center text-sm text-[#7A6258] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : isResendingOtp
              ? "Sending…"
              : "Resend code"}
        </button>
        <p className="text-center text-sm text-[#7A6258]">
          Wrong email?{" "}
          <Link
            href={ROUTES.register}
            className="font-medium text-[#C75B39] underline-offset-4 hover:underline"
          >
            Start over
          </Link>
        </p>
      </form>
    </AuthSheet>
  );
}
