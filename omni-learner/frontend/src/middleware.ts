import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register');
    const isProtectedPage = request.nextUrl.pathname.startsWith('/boards') ||
        request.nextUrl.pathname.startsWith('/cards') ||
        request.nextUrl.pathname.startsWith('/sprints');

    // Redirect to login if accessing protected page without token
    if (isProtectedPage && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to boards if accessing auth page with token
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/boards', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
