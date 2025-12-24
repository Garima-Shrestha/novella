"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterType, registerSchema } from "../schema";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function RegisterForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterType>({
        resolver: zodResolver(registerSchema),
        values: { name:"", email: "", phone: "", password: "", confirmPassword: ""},
        mode: "onSubmit",
    });

    const [pending, setTransition] = useTransition()

    const onSubmit = async (data: RegisterType) => { 
        alert(data.email)
        router.push("/login");
    };

    return (
        <div>
            <Image src = "/images/logo.png" alt="Logo" height={200} width={200} /> 

            <form onSubmit={handleSubmit(onSubmit)}
                className="mx-auto max-w-md p-4 border rounded">
                    <label>Name</label>
                    <input 
                        id="name"
                        type="text"
                        autoComplete="name"
                        className="p-2 border" 
                        {...register("name")}
                        placeholder="Ram Thapa"
                    />
                    {
                        errors.name?.message && (
                            <p className="text-xs text-red-600">{errors.name.message}</p>
                    )}

                    <label>Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="p-2 border" 
                        {...register("email")}
                        placeholder="example@gmail.com"
                    />
                    {
                        errors.email?.message && (
                            <p className="text-xs text-red-600">{errors.email.message}</p>
                        )
                    }

                    <label>Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"  // Numeric keyboard
                        className="p-2 border" 
                        {...register("phone")}
                        placeholder="9800000000"
                    />
                    {
                        errors.phone?.message && (
                            <p className="text-xs text-red-600">{errors.phone.message}</p>
                        )
                    }

                    <label>Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className="mx-auto max-w-md p-4 border rounded"
                        {...register("password")}
                        placeholder="********"
                    />
                    {
                        errors.password?.message && (
                            <p className="text-xs text-red-600">{errors.password.message}</p>
                        )
                    }

                    <label>Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="mx-auto max-w-md p-4 border rounded"
                        {...register("confirmPassword")}
                        placeholder="********"
                    />
                    {
                        errors.confirmPassword?.message && (
                            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                        )
                    }

                    <button
                        type="submit"
                        disabled = {isSubmitting || pending }
                        className="bg-blue-800 p-2 text-white rounded"
                    >
                        {isSubmitting || pending ? "Creating account..." : "Create account"}
                    </button>

                    <div className="mt-1 text-center text-sm">
                        Already have an account? 
                        <Link href="/login" className="font-semibold hover:underline text-blue-500">Log in</Link>
                    </div>
            </form>         
        </div>
    )
}