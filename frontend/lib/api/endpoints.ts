// backend route paths
export const API = {
    AUTH:{
        REGISTER : '/api/auth/register',  // backend to route path
        LOGIN : '/api/auth/login',
        WHOAMI: "/api/auth/whoami",
        UPDATEPROFILE: "/api/auth/update-profile",
        CHANGEPASSWORD: "/api/auth/change-password",
        REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    },
    CATEGORY: {
        GET_ALL: '/api/categories/',
        GET_ONE: (id: string) => `/api/categories/${id}`,
    },
    ADMIN:{
        USER:{
            CREATE: '/api/admin/users/',
            GET_ALL: '/api/admin/users/', 
            GET_ONE: (id: string) => `/api/admin/users/${id}`,
            UPDATE: (id: string) => `/api/admin/users/${id}`,
            DELETE: (id: string) => `/api/admin/users/${id}`,
        },
        BOOK: {
            CREATE: '/api/admin/books/',
            GET_ALL: '/api/admin/books/',
            GET_ONE: (id: string) => `/api/admin/books/${id}`,
            UPDATE: (id: string) => `/api/admin/books/${id}`,
            DELETE: (id: string) => `/api/admin/books/${id}`,
        },
        CATEGORY: {
            CREATE: '/api/admin/categories/',
            GET_ALL: '/api/admin/categories/',
            GET_ONE: (id: string) => `/api/admin/categories/${id}`,
            UPDATE: (id: string) => `/api/admin/categories/${id}`,
            DELETE: (id: string) => `/api/admin/categories/${id}`,
        }
    }
}