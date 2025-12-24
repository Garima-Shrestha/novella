// "use client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from '@hookform/resolvers/zod';
// import Link from "next/link";
// import { startTransition, useTransition } from "react";
// import { loginSchema, LoginType } from "../schema";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export default function LoginForm(){
//     const router = useRouter();
//     const {
//         register,
//         handleSubmit,
//         formState: {errors, isSubmitting},
//     } = useForm<LoginType>(
//         {
//             resolver: zodResolver(loginSchema),
//             values: { email: "", password: ""},
//             mode: "onSubmit",
//         }
//     );

//     const [pending, setTransition] = useTransition()

//     const onSubmit = async (data: LoginType) => { 
//         alert(data.email)
//     }

//     return(
//         <div>
//             <Image src = "/images/logo.png" alt="Logo" height={200} width={200} /> 

//             <form onSubmit={ handleSubmit(onSubmit)}
//                 className="mx-auto max-w-md p-4 border rounded">
//                     <label>Email</label>
//                     <input 
//                         id="email"
//                         type="email"  //  type tells the browser what kind of input this is.
//                         autoComplete="email"
//                         className="p-2 border" 
//                         { ...register("email")} 
//                         placeholder="example@gmail.com"
//                     />
//                     {
//                         errors.email?.message && (
//                         <p className="text-xs text-red-600">{errors.email.message}</p>
//                     )}

//                     <label>Password</label>
//                     <input
//                         id="password"
//                         type="password"
//                         autoComplete="current-password"
//                         className="mx-auto max-w-md p-4 border rounded"
//                         {...register("password")}
//                         placeholder="********"
//                     />
//                     {
//                         errors.password?.message && (
//                             <p className="text-xs text-red-600">{errors.password.message}</p>
//                         )
//                     }


//                     <button 
//                         type="submit" 
//                         disabled={isSubmitting || pending}   // If either isSubmitting or pending is true, the button is disabled. 
//                         className="bg-blue-800 p-2 text-white rounded"
//                     >
//                         { isSubmitting || pending ? "Logging in..." : "Log in"}
//                     </button>

//                     <div className="m-2 text-center">
//                         Don't have account?
//                         <Link href = "/register" className="font-semibold hover:underline text-blue-500">
//                             Register
//                         </Link>
//                     </div>
//                 </form>
//         </div>
//     )
// }


"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { startTransition, useTransition } from "react";
import { loginSchema, LoginType } from "../schema";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm(){
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginType>(
        {
            resolver: zodResolver(loginSchema),
            values: { email: "", password: ""},
            mode: "onSubmit",
        }
    );

    const [pending, setTransition] = useTransition()

    const onSubmit = async (data: LoginType) => { 
        alert(data.email)
    }

    return(
        <div className="h-screen w-screen overflow-hidden flex font-sans bg-white">
            
            {/* LEFT SIDE: Branding */}
            <div className="hidden lg:flex lg:w-[42%] bg-[#001F2B] flex-col justify-center px-16 xl:px-20 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000')] bg-cover bg-center opacity-10 grayscale"></div>
                <div className="relative z-10">
                    <div className="mb-8">
                        <Image src="/images/logo.png" alt="Logo" height={55} width={200} className="brightness-0 invert object-contain" /> 
                    </div>
                    <div className="max-w-md text-white">
                        <h2 className="text-3xl font-light leading-tight mb-3">
                            Discover the world of <br/> 
                            <span className="font-semibold italic text-blue-400">stories.</span>
                        </h2>
                        <p className="text-slate-400 text-sm opacity-70">
                            Access your personalized library and continue your journey where you left off.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="w-full lg:w-[58%] flex items-center justify-center bg-white px-6">
                <div className="w-full max-w-[320px]">
                    <div className="mb-10 text-left">
                        <h1 className="text-2xl font-bold text-[#001F2B]">Login</h1>
                        <p className="text-slate-500 text-xs mt-1">Access your account to continue.</p>
                    </div>

                    <form onSubmit={ handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Email</label>
                            <input 
                                id="email"
                                type="email"  //  type tells the browser what kind of input this is.
                                autoComplete="email"
                                {...register("email")}
                                className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300 ${
                                    errors.email ? "border-red-500" : "border-slate-300"
                                }`} 
                                placeholder="example@gmail.com"
                            />
                            {errors.email?.message && (
                                <p className="text-[10px] text-red-600 font-medium ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                {...register("password")}
                                className={`w-full px-3 py-2 bg-white border rounded-lg outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300 ${
                                    errors.password ? "border-red-500" : "border-slate-300"
                                }`}
                                placeholder="********"
                            />
                            
                            {errors.password?.message && (
                                <p className="text-[10px] text-red-600 font-medium ml-1">{errors.password.message}</p>
                            )}
                            <div className="flex justify-end">
                                <Link href="#" className="text-[10px] text-blue-600 font-bold hover:underline uppercase tracking-tighter">Forgot Password?</Link>
                            </div>
                        </div>

                        {/* Button */}
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting || pending}
                                className="w-full bg-[#003145] hover:bg-[#002535] text-white py-3 rounded-lg font-bold transition-all active:scale-[0.98] disabled:opacity-50 text-[11px] tracking-[0.2em] uppercase"
                            >
                                { isSubmitting || pending ? "Logging in..." : "Login"}
                            </button>
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
                            Don't have account? 
                            <Link href="/register" className="text-blue-600 font-bold ml-1.5 hover:underline uppercase tracking-wide">
                                Register
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}