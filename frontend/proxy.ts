import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData} from "@/lib/cookie";

const publicRoutes = [ '/landingpage', '/login', '/register', '/forget-password', '/reset-password'];
const adminRoutes = ['/admin'];
const userRoutes = ['/user'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

    // Redirect unauthenticated users trying to access protected routes to login page
     if(!token && !isPublicRoute){
        return NextResponse.redirect(new URL('/login', request.url));
    }

    
    // Role-based access control for logged-in users
    if(token && user){
        // Only admin can access /admin. If admin than access homepage
        if(isAdminRoute && user.role !== 'admin'){
            return NextResponse.redirect(new URL('/homepage', request.url));
        }
        // Only user or admin can access /user. If user than access homepage
        if(isUserRoute && user.role !== 'user' && user.role !=='admin'){
            return NextResponse.redirect(new URL('/homepage', request.url));
        }
    }

    // Prevent logged-in users from accessing public pages like /login or /register
    if(isPublicRoute && token) {
        return NextResponse.redirect(new URL('/homepage', request.url));
    }

     return NextResponse.next();
}
export const config = {
    matcher: [
        // what routes to protect/match
        '/admin/:path*',
        '/user/:path*',
        '/login',
        '/register',
        '/landingpage',
        '/forget-password',
        '/reset-password/:path*'
    ]
}