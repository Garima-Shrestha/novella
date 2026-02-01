"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserEditSchema, UserEditData } from "../../schema";
import { getUserById, updateUser } from "@/lib/api/admin/user";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [oldUser, setOldUser] = useState<UserEditData | null>(null);


  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UserEditData>({
    resolver: zodResolver(UserEditSchema),
  });

  // Load user
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const res = await getUserById(id);
      if (!res?.success) {
        toast.error(res?.message || "Failed to load user");
        return;
      }

      const u = res.data;
      if (u.imageUrl) {
        setOldImage(`${BASE_URL}${u.imageUrl}`);
      }
      else {
        setOldImage(null);
      }

      // TODO
      setOldUser({
        username: u.username,
        email: u.email,
        phone: u.phone,
        countryCode: u.countryCode,
        role: u.role,
        password: "", // ignore
        image: undefined,  // image will be handled separately
      });

      setValue("username", u.username);
      setValue("email", u.email);
      setValue("phone", u.phone);
      setValue("countryCode", u.countryCode);
      setValue("role", u.role);

      setLoading(false);
    };

    fetchUser();
  }, [id, setValue]);


  useEffect(() => {
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [newImagePreview]);


  // Submit
  const onSubmit = async (data: UserEditData) => {
    // if (!id) return;

    if (!id || !oldUser) return;

  const isChanged =
    data.username !== oldUser.username ||
    data.email !== oldUser.email ||
    data.phone !== oldUser.phone ||
    data.countryCode !== oldUser.countryCode ||
    data.role !== oldUser.role ||
    (data.password?.trim() || "") !== "" ||
    !!data.image; // image changed

  if (!isChanged) {
    toast.info("No changes detected");
    return;
  }

    const formData = new FormData();
    if (data.username) formData.append("username", data.username);
    if (data.email) formData.append("email", data.email);
    if (data.phone) formData.append("phone", data.phone);
    if (data.countryCode) formData.append("countryCode", data.countryCode);
    if (data.role) formData.append("role", data.role);

    // Only append password if typed
    if (data.password?.trim()) {
      formData.append("password", data.password);
    }

    // Append image if selected
    if (data.image) {
      formData.append("image", data.image);
    }

    try {
      const res = await updateUser(id, formData);

      if (!res?.success) {
        if (res.message?.includes("duplicate key")) {
          if (res.message.includes("username")) {
            toast.error("Username already exists");
          } else if (res.message.includes("email")) {
            toast.error("Email already exists");
          } else if (res.message.includes("phone")) {
            toast.error("Phone number already exists");
          } else {
            toast.error("Duplicate value error");
          }
        } else {
          toast.error(res.message || "Update failed");
        }
        return;
      }

      toast.success("User updated successfully");

      // Delay redirect so user can see the toast
      setTimeout(() => {
        router.push("/admin/users");
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <ToastContainer />
      <h2 className="text-2xl mb-4">Edit User</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <p className="text-sm mb-1">Profile Image</p>
          {(newImagePreview || oldImage) ? (
            <img
              src={newImagePreview || oldImage!}
              alt="Profile preview"
              className="w-24 h-24 object-cover border"
            />
          ) : (
            <div className="w-24 h-24 border flex items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setValue("image", file);
            setNewImagePreview(URL.createObjectURL(file));
          }}
        />

        <input {...register("username")} className="border p-2" />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}

        <input {...register("email")} className="border p-2" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <div className="flex gap-2">
          <select {...register("countryCode")} className="border p-2">
            <option value="+977">+977</option>
            <option value="+91">+91</option>
            <option value="+1">+1</option>
          </select>
          <input {...register("phone")} className="border p-2 flex-1" />
        </div>

        <select {...register("role")} className="border p-2">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          {...register("password")}
          placeholder="New password (optional)"
          className="border p-2"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}

        <button
          disabled={isSubmitting}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {isSubmitting ? "Updating..." : "Update User"}
        </button>
      </form>
    </div>
  );
}