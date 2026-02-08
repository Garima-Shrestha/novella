"use client";
import { useForm } from "react-hook-form";
import { resetPasswordSchema, ResetPasswordData } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
const ResetPasswordForm = (
    { token }: { token: string }
) => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordData>({
        mode: "onSubmit",
        resolver: zodResolver(resetPasswordSchema),
    });
    const [error, setError] = useState<string | null>(null);
    const [pending, setTransition] = useTransition();
    const submit = (values: ResetPasswordData) => {
        setError(null);
        setTransition(async () => {
            try {
                const result = await handleResetPassword(token, values.newPassword);
                if (result.success) {
                    toast.success("Password reset successful.");
                    return router.push('/login');
                }
                else {
                    throw new Error(result.message || 'Failed to reset password');
                }
            } catch (err: Error | any) {
                toast.error(err.message || 'Failed to reset password');
            }
        })
    }
    return (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 p-6">
            <div className="w-[460px] max-w-[92vw] rounded-3xl border border-slate-200 bg-white px-10 py-12 shadow-md">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight leading-tight">
                        Reset Password
                    </h1>
                    <p className="mt-3 mx-auto max-w-[320px] text-sm text-slate-500 leading-relaxed">
                        Choose a new password and confirm it below.
                    </p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-8">
                    {error && (
                        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="space-y-2 mb-3">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            {...register("newPassword")}
                            placeholder="********"
                        />
                        {errors.newPassword?.message && (
                            <p className="text-xs font-medium text-red-600">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 mb-2">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            {...register("confirmNewPassword")}
                            placeholder="********"
                        />
                        {errors.confirmNewPassword?.message && (
                            <p className="text-xs font-medium text-red-600">
                                {errors.confirmNewPassword.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || pending}
                        className="mt-2 h-11 w-full rounded-xl bg-[#003145] text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting || pending ? "Resetting password..." : "Reset password"}
                    </button>

                    <div className="pt-3 text-center text-sm text-slate-600">
                        Remembered your password?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-blue-600 hover:underline underline-offset-4"
                        >
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordForm;

