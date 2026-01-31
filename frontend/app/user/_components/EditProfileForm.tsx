"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {  useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";

import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const editProfileSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  countryCode: z.string().regex(/^\+\d{1,3}$/, { message: "Invalid country code" }),
  phone: z.string().regex(/^\d{8,15}$/, { message: "Invalid phone number" }),
  image: z
    .instanceof(File)
    .optional()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, {
      message: "Max file size is 5MB",
    })
    .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png and .webp formats are supported",
    }),
});

export type EditProfileData = z.infer<typeof editProfileSchema>;

export default function EditProfileForm({ user }: { user: any }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<EditProfileData>({
      resolver: zodResolver(editProfileSchema),
      values: {
        username: user?.username || '',
        email: user?.email || '',
        countryCode: user?.countryCode || '',
        phone: user?.phone || '',
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

    const onSubmit = async (data: EditProfileData) => {
    setError(null);
    try{
        const formData = new FormData();
        formData.append('username', data.username);
        formData.append('email', data.email);
        formData.append('countryCode', data.countryCode);
        formData.append('phone', data.phone);
        if (data.image) {
            formData.append('image', data.image);
        }
        const response = await handleUpdateProfile(formData);
        if (!response.success) {
            throw new Error(response.message || 'Profile update failed');
        }
        handleDismissImage();
            toast.success('Profile updated successfully');
        } catch (error: Error | any) {
            toast.error(error.message || 'Profile update failed');
            setError(error.message || 'Profile update failed');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Profile Image */}
                <div className="mb-4">
                    { previewImage ? (
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
                    ) : user?.imageUrl ? (
                        <Image
                            src={process.env.NEXT_PUBLIC_API_BASE_URL + user.imageUrl}
                            alt="Profile Image"
                            width={100}
                            height={100}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600">No Image</span>
                        </div>
                    )}
                </div>

                {/* Edit Profile Image Input */}
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
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        {...register("username")}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Country Code & Phone */}
                <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium mb-1" htmlFor="phone">
                        Phone
                    </label>
                    <div className="flex">
                        {/* Country Code Selector */}
                        <Controller
                            name="countryCode"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="h-8 px-2 border border-gray-300 rounded-l-md bg-white text-sm text-gray-700 outline-none"
                                >
                                    <option value="+977">🇳🇵 +977</option>
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+86">🇨🇳 +86</option>
                                </select>
                            )}
                        />

                        {/* Phone Input */}
                        <input
                            id="phone"
                            type="text"
                            {...register("phone")}
                            className="flex-1 h-8 px-3 border-t border-b border-r border-gray-300 rounded-r-md outline-none"
                            placeholder="9800000000"
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                </div>


                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
}