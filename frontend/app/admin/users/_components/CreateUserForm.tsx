"use client";
import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleCreateUser } from "@/lib/actions/admin/user-action";

export default function CreateUserForm() {
    const [pending, startTransition] = useTransition();

     const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserData>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
            countryCode: "+977",
        },
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: UserData) => {
        setError(null);
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('username', data.username);
                formData.append('email', data.email);
                formData.append('countryCode', data.countryCode);
                formData.append("phone", data.phone);
                formData.append('password', data.password);
                formData.append('confirmPassword', data.confirmPassword);

                if (data.image) {
                    formData.append('image', data.image);
                }
                const response = await handleCreateUser(formData);

                if (!response.success) {
                    throw new Error(response.message || 'Create user profile failed');
                }
                reset();
                handleDismissImage();
                toast.success('Profile Created successfully');

            } catch (error: Error | any) {
                toast.error(error.message || 'Create user profile failed');
                setError(error.message || 'Create user profile failed');
            }
        });
    };

    return (    
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> 
            {/* Profile Image Display */}
            <div className="mb-4">
                {previewImage ? (
                    <div className="relative w-24 h-24">
                        <img
                            src={previewImage}
                            alt="Profile Image Preview"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <Controller
                            name="image"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <button
                                    type="button"
                                    onClick={() => handleDismissImage(onChange)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                >
                                    ✕
                                </button>
                            )}
                       />
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600">No Image</span>
                    </div>
                )}
            </div>

             {/* Profile Image Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Profile Image</label>
                <Controller
                    name="image"
                    control={control}
                    render={({ field: { onChange } }) => (
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                            accept=".jpg,.jpeg,.png,.webp"
                        />
                    )}
                />
                {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
            </div>

            {/* Username */}
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    autoComplete="given-name"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("username")}
                    placeholder="Ram"
                />
                {errors.username?.message && (
                    <p className="text-xs text-red-600">{errors.username.message}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("email")}
                    placeholder="you@example.com"
                />
                {errors.email?.message && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>

            {/* Phone number and Country Code */}
            <div>
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex">
                    {/* Country Code */}
                    <select
                        {...register("countryCode")}
                        className="h-10 px-2 border rounded-l text-sm"
                    >
                        <option value="+977">🇳🇵 +977</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+86">🇨🇳 +86</option>
                    </select>
                    {/* Phone Number */}
                    <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        {...register("phone")}
                        className="h-10 w-full border-t border-b border-r rounded-r px-3 text-sm"
                        placeholder="9800000000"
                    />
                </div>
                {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("password")}
                    placeholder="••••••"
                />
                {errors.password?.message && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
            </div>
            
            {/* Confirm Password */}
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("confirmPassword")}
                    placeholder="********"
                />
                {errors.confirmPassword?.message && (
                    <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
            </div>

            {/* General Error */}
            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting || pending}
                className="w-full h-10 bg-[#001F2B] hover:bg-black text-white rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isSubmitting || pending ? "Creating account..." : "Create account"}
            </button>

        </form>
    )
}