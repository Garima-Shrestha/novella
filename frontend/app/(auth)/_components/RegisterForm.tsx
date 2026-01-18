// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { RegisterType, registerSchema } from "../schema";
// import { useTransition } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";


// export default function RegisterForm() {
//     const router = useRouter();
//     const {
//         register,
//         handleSubmit,
//         formState: { errors, isSubmitting },
//     } = useForm<RegisterType>({
//         resolver: zodResolver(registerSchema),
//         values: { name:"", email: "", phone: "", password: "", confirmPassword: ""},
//         mode: "onSubmit",
//     });

//     const [pending, setTransition] = useTransition()

//     const onSubmit = async (data: RegisterType) => { 
//         alert(data.email)
//         router.push("/login");
//     };

//     return (
//         <div>
//             <Image src = "/images/logo.png" alt="Logo" height={200} width={200} /> 

//             <form onSubmit={handleSubmit(onSubmit)}
//                 className="mx-auto max-w-md p-4 border rounded">
//                     <label>Name</label>
//                     <input 
//                         id="name"
//                         type="text"
//                         autoComplete="name"
//                         className="p-2 border" 
//                         {...register("name")}
//                         placeholder="Ram Thapa"
//                     />
//                     {
//                         errors.name?.message && (
//                             <p className="text-xs text-red-600">{errors.name.message}</p>
//                     )}

//                     <label>Email</label>
//                     <input
//                         id="email"
//                         type="email"
//                         autoComplete="email"
//                         className="p-2 border" 
//                         {...register("email")}
//                         placeholder="example@gmail.com"
//                     />
//                     {
//                         errors.email?.message && (
//                             <p className="text-xs text-red-600">{errors.email.message}</p>
//                         )
//                     }

//                     <label>Phone Number</label>
//                     <input
//                         id="phone"
//                         type="tel"
//                         autoComplete="tel"
//                         inputMode="numeric"  // Numeric keyboard
//                         className="p-2 border" 
//                         {...register("phone")}
//                         placeholder="9800000000"
//                     />
//                     {
//                         errors.phone?.message && (
//                             <p className="text-xs text-red-600">{errors.phone.message}</p>
//                         )
//                     }

//                     <label>Password</label>
//                     <input
//                         id="password"
//                         type="password"
//                         autoComplete="new-password"
//                         className="mx-auto max-w-md p-4 border rounded"
//                         {...register("password")}
//                         placeholder="********"
//                     />
//                     {
//                         errors.password?.message && (
//                             <p className="text-xs text-red-600">{errors.password.message}</p>
//                         )
//                     }

//                     <label>Confirm Password</label>
//                     <input
//                         id="confirmPassword"
//                         type="password"
//                         autoComplete="new-password"
//                         className="mx-auto max-w-md p-4 border rounded"
//                         {...register("confirmPassword")}
//                         placeholder="********"
//                     />
//                     {
//                         errors.confirmPassword?.message && (
//                             <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
//                         )
//                     }

//                     <button
//                         type="submit"
//                         disabled = {isSubmitting || pending }
//                         className="bg-blue-800 p-2 text-white rounded"
//                     >
//                         {isSubmitting || pending ? "Creating account..." : "Create account"}
//                     </button>

//                     <div className="mt-1 text-center text-sm">
//                         Already have an account? 
//                         <Link href="/login" className="font-semibold hover:underline text-blue-500">Log in</Link>
//                     </div>
//             </form>         
//         </div>
//     )
// }


"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterType, registerSchema } from "../schema";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { handleRegister } from "@/lib/actions/auth-action";

export default function RegisterForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterType>({
        resolver: zodResolver(registerSchema),
        values: { name: "", email: "", countryCode: "+977", phone: "", password: "", confirmPassword: "" },
        mode: "onSubmit",
    });

    const [pending, setTransition] = useTransition();

    const [error, setError] = useState("");
    const onSubmit = async (data: RegisterType) => {
        setError("");

        console.log("Form Data:", data);

        const payload = {
            username: data.name,
            email: data.email,
            phone: data.phone,
            countryCode: data.countryCode,
            password: data.password,
        };

        console.log("Payload:", payload);

        try {
            const res = await handleRegister(payload); 
            if (!res.success) {
                throw new Error(res.message || "Registration failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex font-sans bg-white">
            
            {/* LEFT SIDE: Branding */}
            <div className="hidden lg:flex lg:w-[42%] bg-[#001F2B] flex-col justify-start pt-24 px-16 xl:px-20 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center opacity-10 grayscale"></div>
                <div className="relative z-10">
                    <div className="mb-8">
                        <Image src="/images/logo.png" alt="Logo" height={55} width={200} className="brightness-0 invert object-contain" /> 
                    </div>
                    <div className="max-w-md text-white">
                        <h2 className="text-3xl font-light leading-tight mb-3">
                            Join our world of <br/> 
                            <span className="font-semibold italic text-blue-400">stories.</span>
                        </h2>
                        <p className="text-slate-400 text-sm opacity-70">
                            Create your account today to build your own personalized library and explore thousands of untold narratives.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="w-full lg:w-[58%] flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-[460px] bg-white px-8 py-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="mb-5 text-left">
                        <h1 className="text-2xl font-bold text-[#001F2B]">Create Account</h1>
                        <p className="text-slate-500 text-[11px] mt-0.5">Please fill in the details to register.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Full Name</label>
                            <input 
                                id="name"
                                type="text"
                                autoComplete="name"
                                {...register("name")} 
                                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg outline-none text-sm font-normal text-slate-700 placeholder:text-slate-300 placeholder:text-[11px] focus:border-slate-200 transition-none" 
                                placeholder="Ram Thapa" 
                            />
                            {errors.name?.message && (
                                <p className="text-[9px] text-red-500 ml-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Email Address</label>
                            <input 
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register("email")} 
                                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg outline-none text-sm font-normal text-slate-700 placeholder:text-slate-300 placeholder:text-[11px] focus:border-slate-200 transition-none" 
                                placeholder="example@gmail.com" 
                            />
                            {errors.email?.message && (
                                <p className="text-[9px] text-red-500 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Phone Number</label>
                            <input 
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                {...register("phone")} 
                                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg outline-none text-sm font-normal text-slate-700 placeholder:text-slate-300 placeholder:text-[11px] focus:border-slate-200 transition-none" 
                                placeholder="9800000000" 
                            />
                            {errors.phone?.message && ( 
                                <p className="text-[9px] text-red-500 ml-1">{errors.phone.message}</p>
                            )}
                        </div> */}

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">
                                Phone Number
                            </label>
                            <div className="flex">
                                {/* Country Code Selector */}
                                <select
                                    {...register("countryCode")}
                                    className="h-8 px-2 border border-slate-200 rounded-l-lg bg-white text-[11px] text-slate-600 outline-none"
                                    >
                                    <option value="+977">🇳🇵 +977</option>
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+86">🇨🇳 +86</option>
                                </select>
                                {/* Phone Number Input */}
                                <input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    {...register("phone")}
                                    className="w-full h-8 px-3 border-t border-b border-r border-slate-200 rounded-r-lg bg-white text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:border-slate-200 transition-none"
                                    placeholder="9800000000"
                                />
                            </div>
                            {errors.phone?.message && (
                                <p className="text-[9px] text-red-500 ml-1">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password" 
                                {...register("password")} 
                                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg outline-none text-sm font-normal text-slate-700 placeholder:text-slate-300 placeholder:text-[11px] focus:border-slate-200 transition-none" 
                                placeholder="********" 
                            />
                            {errors.password?.message && (
                                <p className="text-[9px] text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Confirm Password</label>
                            <input 
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                {...register("confirmPassword")} 
                                className="w-full h-8 px-3 bg-white border border-slate-200 rounded-lg outline-none text-sm font-normal text-slate-700 placeholder:text-slate-300 placeholder:text-[11px] focus:border-slate-200 transition-none" 
                                placeholder="********" 
                            />
                            {errors.confirmPassword?.message && (
                                <p className="text-[9px] text-red-500 ml-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit"
                                disabled={isSubmitting || pending}  
                                className="w-full h-10 bg-[#001F2B] hover:bg-black text-white rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting || pending ? "Registering..." : "Register"}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-[10px] text-slate-400">Already have an account? </span>
                            <Link href="/login" className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}