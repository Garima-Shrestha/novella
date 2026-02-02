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
  const [error, setError] = useState<string | null>(null);


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
        password: "", // ignore
        image: undefined,  // image will be handled separately
      });

      setValue("username", u.username);
      setValue("email", u.email);
      setValue("phone", u.phone);
      setValue("countryCode", u.countryCode);

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
    if (!id || !oldUser) return;

  const isChanged =
    data.username !== oldUser.username ||
    data.email !== oldUser.email ||
    data.phone !== oldUser.phone ||
    data.countryCode !== oldUser.countryCode ||
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
          setError(res.message || "Update failed");
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <ToastContainer />

      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">
          Edit User
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            {newImagePreview || oldImage ? (
              <img
                src={newImagePreview || oldImage!}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border border-blue-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl font-bold text-blue-600">
                {oldUser?.username ? oldUser.username.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <div className="flex-1 mt-2">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-blue-600 file:bg-white file:text-blue-600 hover:file:bg-blue-50 transition"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setValue("image", file);
                  setNewImagePreview(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>

          {/* Form Fields (more space from image) */}
          <div className="mt-10 space-y-6">

            {/* Username */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase">
                Username
              </label>
              <input
                {...register("username")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900
                focus:outline-none focus:shadow-sm"
              />
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase">
                Email address
              </label>
              <input
                {...register("email")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900
                focus:outline-none focus:shadow-sm"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase">
                Phone number
              </label>
              <div className="flex gap-3">
                <select
                  {...register("countryCode")}
                  className="border border-gray-300 rounded-md px-3 py-2 text-gray-900
                  focus:outline-none focus:shadow-sm"
                >
                  <option value="+977">🇳🇵 +977</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+86">🇨🇳 +86</option>
                </select>
                <input
                  {...register("phone")}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900
                  focus:outline-none focus:shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase">
                New password
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="Leave empty to keep current password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900
                focus:outline-none focus:shadow-sm"
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Action */}
          <div className="pt-4">
            <button
              disabled={isSubmitting}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60
              text-white font-semibold py-3 rounded-md transition"
            >
              {isSubmitting ? "Updating user..." : "Update User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );

}






// "use client";

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useParams, useRouter } from "next/navigation";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { UserEditSchema, UserEditData } from "../../schema";
// import { getUserById, updateUser } from "@/lib/api/admin/user";

// export default function EditUserPage() {
//   const router = useRouter();
//   const params = useParams();
//   const id = Array.isArray(params.id) ? params.id[0] : params.id;

//   const [loading, setLoading] = useState(true);
//   const [oldImage, setOldImage] = useState<string | null>(null);
//   const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
//   const [oldUser, setOldUser] = useState<UserEditData | null>(null);
//   const [error, setError] = useState<string | null>(null);


//   const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

//   const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UserEditData>({
//     resolver: zodResolver(UserEditSchema),
//   });

//   // Load user
//   useEffect(() => {
//     if (!id) return;

//     const fetchUser = async () => {
//       const res = await getUserById(id);
//       if (!res?.success) {
//         toast.error(res?.message || "Failed to load user");
//         return;
//       }

//       const u = res.data;
//       if (u.imageUrl) {
//         setOldImage(`${BASE_URL}${u.imageUrl}`);
//       }
//       else {
//         setOldImage(null);
//       }

//       // TODO
//       setOldUser({
//         username: u.username,
//         email: u.email,
//         phone: u.phone,
//         countryCode: u.countryCode,
//         password: "", // ignore
//         image: undefined,  // image will be handled separately
//       });

//       setValue("username", u.username);
//       setValue("email", u.email);
//       setValue("phone", u.phone);
//       setValue("countryCode", u.countryCode);

//       setLoading(false);
//     };

//     fetchUser();
//   }, [id, setValue]);


//   useEffect(() => {
//     return () => {
//       if (newImagePreview) {
//         URL.revokeObjectURL(newImagePreview);
//       }
//     };
//   }, [newImagePreview]);


//   // Submit
//   const onSubmit = async (data: UserEditData) => {
//     if (!id || !oldUser) return;

//   const isChanged =
//     data.username !== oldUser.username ||
//     data.email !== oldUser.email ||
//     data.phone !== oldUser.phone ||
//     data.countryCode !== oldUser.countryCode ||
//     (data.password?.trim() || "") !== "" ||
//     !!data.image; // image changed

//   if (!isChanged) {
//     toast.info("No changes detected");
//     return;
//   }

//     const formData = new FormData();
//     if (data.username) formData.append("username", data.username);
//     if (data.email) formData.append("email", data.email);
//     if (data.phone) formData.append("phone", data.phone);
//     if (data.countryCode) formData.append("countryCode", data.countryCode);

//     // Only append password if typed
//     if (data.password?.trim()) {
//       formData.append("password", data.password);
//     }

//     // Append image if selected
//     if (data.image) {
//       formData.append("image", data.image);
//     }

//     try {
//       const res = await updateUser(id, formData);

//       if (!res?.success) {
//         if (res.message?.includes("duplicate key")) {
//           if (res.message.includes("username")) {
//             toast.error("Username already exists");
//           } else if (res.message.includes("email")) {
//             toast.error("Email already exists");
//           } else if (res.message.includes("phone")) {
//             toast.error("Phone number already exists");
//           } else {
//             toast.error("Duplicate value error");
//           }
//         } else {
//           toast.error(res.message || "Update failed");
//           setError(res.message || "Update failed");
//         }
//         return;
//       }

//       toast.success("User updated successfully");

//       // Delay redirect so user can see the toast
//       setTimeout(() => {
//         router.push("/admin/users");
//       }, 1000);

//     } catch (err: any) {
//       toast.error(err.message || "Something went wrong");
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="p-6 max-w-md mx-auto">
//       <ToastContainer />
//       <h2 className="text-2xl mb-4">Edit User</h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//         <div>
//         <p className="text-sm mb-1">Profile Image</p>
//         {newImagePreview || oldImage ? (
//           <img
//             src={newImagePreview || oldImage!}
//             alt="Profile preview"
//             className="w-24 h-24 object-cover border rounded-full"
//           />
//         ) : (
//           <div className="w-24 h-24 border rounded-full flex items-center justify-center bg-gray-200 text-gray-700 text-xl font-bold">
//             {oldUser?.username ? oldUser.username.charAt(0).toUpperCase() : "?"}
//           </div>
//         )}
//       </div>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => {
//             const file = e.target.files?.[0];
//             if (!file) return;
//             setValue("image", file);
//             setNewImagePreview(URL.createObjectURL(file));
//           }}
//         />

//         <input {...register("username")} className="border p-2" />
//         {errors.username && <p className="text-red-500">{errors.username.message}</p>}

//         <input {...register("email")} className="border p-2" />
//         {errors.email && <p className="text-red-500">{errors.email.message}</p>}

//         <div className="flex gap-2">
//           <select {...register("countryCode")} className="border p-2">
//             <option value="+977">🇳🇵 +977</option>
//             <option value="+91">🇮🇳 +91</option>
//             <option value="+1">🇺🇸 +1</option>
//             <option value="+44">🇬🇧 +44</option>
//             <option value="+86">🇨🇳 +86</option>
//           </select>
//           <input {...register("phone")} className="border p-2 flex-1" />
//         </div>

//         <input
//           type="password"
//           {...register("password")}
//           placeholder="New password (optional)"
//           className="border p-2"
//         />
//         {errors.password && <p className="text-red-500">{errors.password.message}</p>}

//           { error && (
//             <p className="text-sm text-red-600 text-center py-2 rounded-lg">{error}</p>
//           )}

//         <button
//           disabled={isSubmitting}
//           className="bg-blue-500 text-white p-2 rounded"
//         >
//           {isSubmitting ? "Updating..." : "Update User"}
//         </button>
//       </form>
//     </div>
//   );
// }