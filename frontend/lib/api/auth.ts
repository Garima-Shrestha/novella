// backend api call only
import axios from "./axios";
import { API  } from "./endpoints";

export const registerUser = async (registerData : any ) => {
    try {
        const response = await axios.post(
            API.AUTH.REGISTER, 
            registerData 
        );
        return response.data; 
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message 
            || err.message 
            || "Registration failed" 
        )
    }
}

export const loginUser = async (loginData: any) => {
    try {
        const response = await axios.post (
            API.AUTH.LOGIN, 
            loginData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message 
            || err.message 
            || "Login failed" 
        )
    }
}

// fetch the current logged-in user[particular set of user can only fetch]
export const fetchWhoAmI = async () => {
    try {
        const response = await axios.get (
            API.AUTH.WHOAMI, 
        );
        return response.data; 
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message 
            || err.message 
            || "Fetch whoami failed" 
        )
    }
}

export const updateUserProfile = async (updateData: any) => {
    try{
        const response = await axios.put(
            API.AUTH.UPDATEPROFILE, 
            updateData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                }
            }
        );
        return response.data;
    }catch(err: Error | any){
        throw new Error
            (
                err.response?.data?.message  
                || err.message 
                || "Update profile failed" 
            );
    }
}

export const changePassword = async (passwordData: any) => {
    try {
        const response = await axios.put(
            API.AUTH.CHANGEPASSWORD,
            passwordData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Change password failed"
        );
    }
};