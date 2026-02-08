"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { forgetPasswordSchema, ForgetPasswordData } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ForgetPasswordForm = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgetPasswordData>({
        mode: "onSubmit",
        resolver: zodResolver(forgetPasswordSchema),
    });
    const [error, setError] = useState<string | null>(null);
    const [pending, setTransition] = useTransition();
    const submit = (values: ForgetPasswordData) => {
        setError(null);
        setTransition(async () => {
            try {
                const result = await handleRequestPasswordReset(values.email);
                if (result.success) {
                    toast.success("If the email is registered, a reset link has been sent.");
                    return router.push('/login');
                }else{
                    throw new Error(result.message || 'Failed to send reset link');
                }
            } catch (err: Error | any) {
                toast.error(err.message || 'Failed to send reset link');
            }
        })
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 p-6">
            <div className="w-[460px] max-w-[92vw] rounded-3xl border border-slate-200 bg-white px-10 py-12 shadow-lg">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight leading-tight">
                        Forgot Password
                    </h1>
                    <p className="mt-3 mx-auto max-w-[320px] text-sm text-slate-500 leading-relaxed">
                        Enter your email address to receive a password reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-7">
                    {error && (
                        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            {...register("email")}
                            placeholder="example@gmail.com"
                        />
                        {errors.email?.message && (
                            <p className="text-xs font-medium text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || pending}
                        className="mt-4 h-11 w-full rounded-xl bg-[#003145] text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting || pending ? "Sending..." : "Send Link"}
                    </button>

                    <div className="pt-3 text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-blue-600 hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgetPasswordForm;
