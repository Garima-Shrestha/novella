// backend route paths
export const API = {
    AUTH:{
        REGISTER : '/api/auth/register',  // backend to route path
        LOGIN : '/api/auth/login',
        WHOAMI: "/api/auth/whoami",
        UPDATEPROFILE: "/api/auth/update-profile"
    },
    ADMIN:{
        USER:{
            CREATE: '/api/admin/users/',
            GET_ALL: '/api/admin/users/', 
            GET_ONE: (id: string) => `/api/admin/users/${id}`,
            UPDATE: (id: string) => `/api/admin/users/${id}`,
            DELETE: (id: string) => `/api/admin/users/${id}`,
        }
    }
}