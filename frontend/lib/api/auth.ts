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