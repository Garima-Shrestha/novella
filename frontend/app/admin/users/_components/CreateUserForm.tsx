"use client";
import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { handleCreateUser } from "@/lib/actions/admin/user-action";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";


export default function CreateUserForm() {
    const router = useRouter();
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
        // startTransition(async () => {
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
                    // Field duplicate errors
                    if (response.message?.includes("duplicate key")) {
                        if (response.message.includes("username")) {
                            toast.error("Username already exists", { containerId: "admin-user-create" });
                        } else if (response.message.includes("email")) {
                            toast.error("Email already exists", { containerId: "admin-user-create" });
                        } else if (response.message.includes("phone")) {
                            toast.error("Phone number already exists", { containerId: "admin-user-create" });
                        } else {
                            toast.error("Duplicate value error", { containerId: "admin-user-create" });
                        }
                        return;
                    } else {
                        toast.error(response.message || "Create user profile failed", { containerId: "admin-user-create" });
                        setError(response.message || "Create user profile failed");
                        return;
                    }
                }

                // Success message
                toast.success("Profile Created successfully", {
                    containerId: "admin-user-create",
                    autoClose: 1000,
                    onClose: () => router.push("/admin/users"),
                });


            } catch (error: Error | any) {
                toast.error(error.message || 'Create user profile failed', { containerId: "admin-user-create" });
                setError(error.message || 'Create user profile failed');
            }
        // });
    };

    return (    
        <div className="p-8 max-w-lg mx-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-6">
                  <ToastContainer containerId="admin-user-create" position="top-right" autoClose={3000} />

                    <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">Create user account</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> 
                <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-4">UPLOAD PROFILE PICTURE</label>
                    
                    {/* Profile Image Display */}
                    <div className="mb-4">
                        {previewImage ? (
                            <div className="relative">
                                <img
                                    src={previewImage}
                                    alt="Profile Image Preview"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleDismissImage(onChange)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                                        >
                                            ✕
                                        </button>
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex flex-col items-center justify-center text-slate-300">
                                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </div>
                        )}
                    </div>

                    {/* Profile Image Input */}
                    <div className="w-full flex justify-center pl-12">
                        <Controller
                            name="image"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="text-[12px] text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8] cursor-pointer"
                                    onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                    accept=".jpg,.jpeg,.png,.webp"
                                />
                            )}
                        />
                    </div>
                    {errors.image && <p className="text-xs text-red-600 mt-2 font-medium">{errors.image.message}</p>}
                </div>


                {/* Username */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="given-name"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                            {...register("username")}
                            placeholder="e.g. Ram"
                        />
                        {errors.username?.message && (
                            <p className="text-xs text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                            {...register("email")}
                            placeholder="example@gmail.com"
                        />
                        {errors.email?.message && (
                            <p className="text-xs text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone number and Country Code */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Phone Number</label>
                        <div className="flex rounded-md border border-slate-300 overflow-hidden">
                            {/* Country Code */}
                            <select
                                {...register("countryCode")}
                                className="h-9 px-2 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                            >
                                <option value="+977">🇳🇵 +977</option>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+86">🇨🇳 +86</option>
                            </select>
                            <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                {...register("phone")}
                                className="h-9 w-full px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                                placeholder="9800000000"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-600">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                            {...register("password")}
                            placeholder="********"
                        />
                        {errors.password?.message && (
                            <p className="text-xs text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                            {...register("confirmPassword")}
                            placeholder="********"
                        />
                        {errors.confirmPassword?.message && (
                            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                {/* General Error */}
                { error && (
                    <p className="text-xs text-red-600 text-center font-bold bg-red-50 py-2 rounded border border-red-100">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md font-bold text-xs uppercase transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-sm"
                >
                    {isSubmitting || pending ? "Creating account..." : "Create account"}
                </button>
            </form>
        </div>
    )
}



// "use client";
// import { Controller, useForm } from "react-hook-form";
// import { UserData, UserSchema } from "@/app/admin/users/schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRef, useState, useTransition } from "react";
// import Link from "next/link";
// import { toast, ToastContainer } from "react-toastify";
// import { handleCreateUser } from "@/lib/actions/admin/user-action";
// import { useRouter } from "next/navigation";
// import "react-toastify/dist/ReactToastify.css";


// export default function CreateUserForm() {
//     const router = useRouter();
//     const [pending, startTransition] = useTransition();

//      const {
//         register,
//         handleSubmit,
//         control,
//         reset,
//         formState: { errors, isSubmitting },
//     } = useForm<UserData>({
//         resolver: zodResolver(UserSchema),
//         defaultValues: {
//             countryCode: "+977",
//         },
//     });

//     const [error, setError] = useState<string | null>(null);
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setPreviewImage(reader.result as string);
//             };
//             reader.readAsDataURL(file);
//         } else {
//             setPreviewImage(null);
//         }
//         onChange(file);
//     };

//     const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
//         setPreviewImage(null);
//         onChange?.(undefined);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const onSubmit = async (data: UserData) => {
//         setError(null);
//         // startTransition(async () => {
//             try {
//                 const formData = new FormData();
//                 formData.append('username', data.username);
//                 formData.append('email', data.email);
//                 formData.append('countryCode', data.countryCode);
//                 formData.append("phone", data.phone);
//                 formData.append('password', data.password);
//                 formData.append('confirmPassword', data.confirmPassword);

//                 if (data.image) {
//                     formData.append('image', data.image);
//                 }
//                 const response = await handleCreateUser(formData);

//                 if (!response.success) {
//                     // Field duplicate errors
//                     if (response.message?.includes("duplicate key")) {
//                         if (response.message.includes("username")) {
//                             toast.error("Username already exists");
//                         } else if (response.message.includes("email")) {
//                             toast.error("Email already exists");
//                         } else if (response.message.includes("phone")) {
//                             toast.error("Phone number already exists");
//                         } else {
//                             toast.error("Duplicate value error");
//                         }
//                         return;
//                     } else {
//                         toast.error(response.message || "Create user profile failed");
//                         setError(response.message || "Create user profile failed");
//                         return;
//                     }
//                 }

//                 // Success message
//                 toast.success('Profile Created successfully');

//                 // give user a moment to see toast
//                 setTimeout(() => {
//                     router.push("/admin/users");
//                 }, 1000);

//             } catch (error: Error | any) {
//                 toast.error(error.message || 'Create user profile failed');
//                 setError(error.message || 'Create user profile failed');
//             }
//         // });
//     };

//     return (    
//         <div className="p-6 max-w-md mx-auto">
//             <ToastContainer />
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> 
//                 {/* Profile Image Display */}
//                 <div className="mb-4">
//                     {previewImage ? (
//                         <div className="relative w-24 h-24">
//                             <img
//                                 src={previewImage}
//                                 alt="Profile Image Preview"
//                                 className="w-24 h-24 rounded-full object-cover"
//                             />
//                             <Controller
//                                 name="image"
//                                 control={control}
//                                 render={({ field: { onChange } }) => (
//                                     <button
//                                         type="button"
//                                         onClick={() => handleDismissImage(onChange)}
//                                         className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
//                                     >
//                                         ✕
//                                     </button>
//                                 )}
//                         />
//                         </div>
//                     ) : (
//                         <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
//                             <span className="text-gray-600">No Image</span>
//                         </div>
//                     )}
//                 </div>

//                 {/* Profile Image Input */}
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-1">Profile Image</label>
//                     <Controller
//                         name="image"
//                         control={control}
//                         render={({ field: { onChange } }) => (
//                             <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
//                                 accept=".jpg,.jpeg,.png,.webp"
//                             />
//                         )}
//                     />
//                     {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
//                 </div>

//                 {/* Username */}
//                 <div className="space-y-1">
//                     <label className="text-sm font-medium" htmlFor="username">Username</label>
//                     <input
//                         id="username"
//                         type="text"
//                         autoComplete="given-name"
//                         className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
//                         {...register("username")}
//                         placeholder="Ram"
//                     />
//                     {errors.username?.message && (
//                         <p className="text-xs text-red-600">{errors.username.message}</p>
//                     )}
//                 </div>

//                 {/* Email */}
//                 <div className="space-y-1">
//                     <label className="text-sm font-medium" htmlFor="email">Email</label>
//                     <input
//                         id="email"
//                         type="email"
//                         autoComplete="email"
//                         className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
//                         {...register("email")}
//                         placeholder="you@example.com"
//                     />
//                     {errors.email?.message && (
//                         <p className="text-xs text-red-600">{errors.email.message}</p>
//                     )}
//                 </div>

//                 {/* Phone number and Country Code */}
//                 <div>
//                     <label className="text-sm font-medium">Phone Number</label>
//                     <div className="flex">
//                         {/* Country Code */}
//                         <select
//                             {...register("countryCode")}
//                             className="h-10 px-2 border rounded-l text-sm"
//                         >
//                             <option value="+977">🇳🇵 +977</option>
//                             <option value="+91">🇮🇳 +91</option>
//                             <option value="+1">🇺🇸 +1</option>
//                             <option value="+44">🇬🇧 +44</option>
//                             <option value="+86">🇨🇳 +86</option>
//                         </select>
//                         {/* Phone Number */}
//                         <input
//                             id="phone"
//                             type="tel"
//                             autoComplete="tel"
//                             {...register("phone")}
//                             className="h-10 w-full border-t border-b border-r rounded-r px-3 text-sm"
//                             placeholder="9800000000"
//                         />
//                     </div>
//                     {errors.phone && (
//                         <p className="text-xs text-red-600">{errors.phone.message}</p>
//                     )}
//                 </div>

//                 {/* Password */}
//                 <div className="space-y-1">
//                     <label className="text-sm font-medium" htmlFor="password">Password</label>
//                     <input
//                         id="password"
//                         type="password"
//                         autoComplete="new-password"
//                         className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
//                         {...register("password")}
//                         placeholder="••••••"
//                     />
//                     {errors.password?.message && (
//                         <p className="text-xs text-red-600">{errors.password.message}</p>
//                     )}
//                 </div>
                
//                 {/* Confirm Password */}
//                 <div className="space-y-1">
//                     <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm password</label>
//                     <input
//                         id="confirmPassword"
//                         type="password"
//                         autoComplete="new-password"
//                         className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
//                         {...register("confirmPassword")}
//                         placeholder="********"
//                     />
//                     {errors.confirmPassword?.message && (
//                         <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
//                     )}
//                 </div>

//                 {/* General Error */}
//                 { error && (
//                     <p className="text-sm text-red-600 text-center py-2 rounded-lg">{error}</p>
//                 )}

//                 <button
//                     type="submit"
//                     disabled={isSubmitting || pending}
//                     className="w-full h-10 bg-[#001F2B] hover:bg-black text-white rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50"
//                 >
//                     {isSubmitting || pending ? "Creating account..." : "Create account"}
//                 </button>
//             </form>
//         </div>
//     )
// }