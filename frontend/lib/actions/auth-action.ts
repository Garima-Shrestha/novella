// server side processing
"use server"

import { redirect } from "next/navigation";
import { registerUser, loginUser, updateUserProfile, fetchWhoAmI, changePassword, requestPasswordReset, resetPassword } from "../api/auth"
import { setUserData, setAuthToken, clearAuthCookies } from '../cookie'
import { revalidatePath } from 'next/cache';

export const handleRegister = async(formData: any) => {
    try {
        const result = await registerUser(formData);
        if(result.success) {
            return {
                success: true,
                message: "Registration successful",
                data: result.data
            };
        } 
        return {
            success: false,
            message: result.message || "Registration failed"
        }
    } catch(err: Error | any) {
        return {
            success: false, message: err.message || "Registration failed"
        }
    }
}


export const handleLogin = async(formData: any) => {
    try {
        const result = await loginUser(formData);
        if(result.success) {
            await setAuthToken(result.token)
            await setUserData(result.data)
              
            return {
                success: true,
                message: "Login successful",
                data: result.data
            };
        } 
        return {
            success: false,
            message: result.message || "Login failed"
        }
    } catch(err: Error | any) {
        return {
            success: false, message: err.message || "Login failed"
        }
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    return redirect('/login');
}


// fetch the current logged-in user[particular set of user can only fetch]
export const handleWhoAmI = async() => {
    try {
        const result = await fetchWhoAmI();
        if(result.success) {
              
            return {
                success: true,
                data: result.data
            };
        } 
        return {
            success: false,
            message: result.message || "Whoami failed" 
        }
    } catch(err: Error | any) {
        return {
            success: false, message: err.message || "Fetch whoami failed" 
        }
    }
}

export async function handleUpdateProfile(profileData: FormData) {
    try {
        const result = await updateUserProfile(profileData);
        if (result.success) {
            await setUserData(result.data); // update cookie 
            revalidatePath('/user/profile'); // revalidate profile page/ refresh new data
            return {
                success: true,
                message: 'Profile updated successfully',
                data: result.data
            };
        }
        return { success: false, message: result.message || 'Failed to update profile' };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}

export const handleChangePassword = async (formData: any) => {
    try {
        const result = await changePassword(formData);

        if (result.success) {
            return {
                success: true,
                message: result.message || "Password changed successfully",
            };
        }

        return {
            success: false,
            message: result.message || "Change password failed",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Change password failed",
        };
    }
};

export const handleRequestPasswordReset = async (email: string) => {
    try {
        const response = await requestPasswordReset(email);
        if (response.success) {
            return {
                success: true,
                message: 'Password reset email sent successfully'
            }
        }
        return { success: false, message: response.message || 'Request password reset failed' }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Request password reset action failed' }
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await resetPassword(token, newPassword);
        if (response.success) {
            return {
                success: true,
                message: 'Password has been reset successfully'
            }
        }
        return { success: false, message: response.message || 'Reset password failed' }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Reset password action failed' }
    }
};