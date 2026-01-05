import { fetchWithAccessToken } from '@/src/app/api/_lib/proxyRequest';
import { handleApiResponse } from '@/src/app/api/_lib/proxyResponse';
import { setTokenCookies } from '@/src/app/api/_lib/tokenUtils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface TokenReissueResponse {
  accessToken: string;
  refreshToken: string;
}

const PUBLIC_PATH_PATTERNS = [
  /^\/$/,
  /^\/detail\/\d+$/,
  /^\/login$/,
  /^\/login\/social\/kakao$/,
  /^\/signup$/,
  /^\/signup\/social\/kakao$/,
];

const handleProxyRequest = async (
  req: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const res = await fetchWithAccessToken(req, params);

  // 액세스 토큰 만료 + 리프레시 토큰이 있다면,
  if (res.status === 401 && refreshToken) {
    const refreshHeaders = new Headers();
    refreshHeaders.set('Authorization', `Bearer ${refreshToken}`);

    const refreshTokenRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/tokens`,
      {
        method: 'POST',
        headers: refreshHeaders,
      }
    );
    const data: TokenReissueResponse = await refreshTokenRes.json();

    // 갱신 실패시
    if (!refreshTokenRes.ok) {
      // 로그인 페이지로 리다이렉트
      const response = new NextResponse(null);

      // 쿠키 삭제
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      const currentPath = req.nextUrl.pathname;
      const isPublicPath = PUBLIC_PATH_PATTERNS.some((regex) =>
        regex.test(currentPath)
      );

      if (!isPublicPath) {
        // 인증 필요 -> 로그인 페이지로 redirect
        return NextResponse.redirect(`/login?redirect_path=${currentPath}`);
      }

      // 인증 필요 없는 Public Path -> 그냥 상태만 초기화
      return response;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

    // 새롭게 발급 받은 토큰 재설정
    await setTokenCookies(newAccessToken, newRefreshToken);

    // 다시 api 요청
    const retryRes = await fetchWithAccessToken(req, params);

    return handleApiResponse(retryRes);
  }

  return handleApiResponse(res);
};

export async function GET(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  const params = await ctx.params;
  return handleProxyRequest(req, params);
}
export async function POST(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  const params = await ctx.params;
  return handleProxyRequest(req, params);
}
export async function PATCH(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  const params = await ctx.params;
  return handleProxyRequest(req, params);
}
export async function DELETE(
  req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  const params = await ctx.params;
  return handleProxyRequest(req, params);
}
