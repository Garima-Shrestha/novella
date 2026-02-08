"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { changePasswordSchema, ChangePasswordData } from "../schema";
import { handleChangePassword } from "@/lib/actions/auth-action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountDetailsForm() {
    const router = useRouter();
    const { logout } = useAuth();

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const [error, setError] = useState<string | null>(null);

    // Toggle states for each password field
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false)

    const onSubmit = async (data: ChangePasswordData) => {
        setError(null);
        try {
            const response = await handleChangePassword(data);
            if (!response.success) {
                throw new Error(response.message || "Password change failed");
            }
            toast.success("Password updated successfully");

            await logout();

            reset(); // clear form
        } catch (err: any) {
        setError(err.message || "Password change failed");
        toast.error(err.message || "Password change failed");
        }
    };

    return (
    <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-6 mb-16">
        <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">Change Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Old Password */}
        <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="oldPassword">Old Password</label>
            <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                autoComplete="current-password"
                {...register("oldPassword")}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="********"
            />
            
            {errors.oldPassword && <p className="text-xs text-red-600">{errors.oldPassword.message}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="password">New Password</label>
            <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="********"
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="confirmPassword">Confirm Password</label>
            <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="********"
            />
            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* General error from backend */}
        {error && (
            <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">{error}</p>
        )}

        {/* Submit Button */}
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
        >
            {isSubmitting ? "Changing password..." : "Change Password"}
        </button>
        </form>
    </div>
    );
}
