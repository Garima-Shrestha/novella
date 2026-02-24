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
    BOOK: {
        GET_ALL: '/api/books/',
        GET_ONE: (id: string) => `/api/books/${id}`,
    },
    BOOK_ACCESS: {
        RENT: (bookId: string) => `/api/book-access/rent/${bookId}`,
        GET_ALL: "/api/book-access/",
        GET_ONE: (bookId: string) => `/api/book-access/${bookId}`,
        ADD_BOOKMARK: (bookId: string) => `/api/book-access/${bookId}/bookmarks`,
        REMOVE_BOOKMARK: (bookId: string) => `/api/book-access/${bookId}/bookmarks`,
        ADD_QUOTE: (bookId: string) => `/api/book-access/${bookId}/quotes`,
        REMOVE_QUOTE: (bookId: string) => `/api/book-access/${bookId}/quotes`,
        UPDATE_LAST_POSITION: (bookId: string) => `/api/book-access/${bookId}/last-position`,
    },
    MY_LIBRARY: "/api/book-access/my-library",
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
        },
        PDF: {
            CREATE: '/api/admin/admin-pdf/',
            GET_ALL: '/api/admin/admin-pdf/',
            GET_ONE: (id: string) => `/api/admin/admin-pdf/${id}`,
            UPDATE: (id: string) => `/api/admin/admin-pdf/${id}`,
            DELETE: (id: string) => `/api/admin/admin-pdf/${id}`,
        },
        BOOK_ACCESS: {
            GET_ALL: '/api/admin/book-access/',
            GET_ONE: (id: string) => `/api/admin/book-access/${id}`, 
            UPDATE: (id: string) => `/api/admin/book-access/${id}`, 
            DELETE: (id: string) => `/api/admin/book-access/${id}`,
            CREATE: '/api/admin/book-access/',   
            AVAILABLE_BOOKS: "/api/admin/book-access/available-books",             
        }
    }
}