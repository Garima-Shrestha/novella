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
        <div>
            <Image src = "/images/logo.png" alt="Logo" height={200} width={200} /> 

            <form onSubmit={ handleSubmit(onSubmit)}
                className="mx-auto max-w-md p-4 border rounded">
                    <label>Email</label>
                    <input 
                        id="email"
                        type="email"  //  type tells the browser what kind of input this is.
                        autoComplete="email"
                        className="p-2 border" 
                        { ...register("email")} 
                        placeholder="example@gmail.com"
                    />
                    {
                        errors.email?.message && (
                        <p className="text-xs text-red-600">{errors.email.message}</p>
                    )}

                    <label>Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="mx-auto max-w-md p-4 border rounded"
                        {...register("password")}
                        placeholder="********"
                    />
                    {
                        errors.password?.message && (
                            <p className="text-xs text-red-600">{errors.password.message}</p>
                        )
                    }


                    <button 
                        type="submit" 
                        disabled={isSubmitting || pending}   // If either isSubmitting or pending is true, the button is disabled. 
                        className="bg-blue-800 p-2 text-white rounded"
                    >
                        { isSubmitting || pending ? "Logging in..." : "Log in"}
                    </button>

                    <div className="m-2 text-center">
                        Don't have account?
                        <Link href = "/register" className="font-semibold hover:underline text-blue-500">
                            Register
                        </Link>
                    </div>
                </form>
        </div>
    )
}