import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/login/social/kakao',
  '/signup/social/kakao',
];
const PUBLIC_PATH_PATTERNS = [/^\/$/, /^\/detail\/\d+$/];

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 라우트 핸들러 요청은 리다이렉트 처리에서 제외
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isPublicPath = PUBLIC_PATH_PATTERNS.some((regex) =>
    regex.test(pathname)
  );

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isUnauthenticated =
    accessToken === undefined && refreshToken === undefined;

  // 로그인시
  if (!isUnauthenticated) {
    // auth 페이지(로그인/회원가입) 라우트시
    if (isAuthPath) {
      return NextResponse.redirect(`${origin}/`);
    }
  }
  // 로그아웃시
  if (isUnauthenticated) {
    // 프로텍트 페이지 (/, /detail, /login, /signup 제외) 접속시
    if (!isPublicPath && !isAuthPath) {
      // 로그인페이지로 리다이렉트, 이때 params에 ?&redirect_uri=현재페이지경로를 추가해줘서 로그인 완료시 접속시도했던 페이지로 리다이렉트되도록 처리
      return NextResponse.redirect(`${origin}/login?redirect_path=${pathname}`);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|_next/image).*)',
  ],
};
