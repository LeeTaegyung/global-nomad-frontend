import { fetchWithAccessToken } from '@/src/app/api/_lib/proxyRequest';
import { handleApiResponse } from '@/src/app/api/_lib/proxyResponse';
import { setTokenCookies } from '@/src/app/api/_lib/tokenUtils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface TokenReissueResponse {
  accessToken: string;
  refreshToken: string;
}

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

    // 갱신 실패시
    if (!refreshTokenRes.ok) {
      const response = NextResponse.json(
        { error: 'TOKEN_REFRESH_FAILED' },
        { status: 401 }
      );

      // 커스텀 헤더 추가
      response.headers.set('X-Auth-Error', 'REFRESH_TOKEN_EXPIRED');

      // 쿠키 삭제
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }

    const data: TokenReissueResponse = await refreshTokenRes.json();
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
