import { setTokenCookies } from '@/src/app/api/_lib/tokenUtils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface TokenReissueResponse {
  accessToken: string;
  refreshToken: string;
}

const handleProxyRequest = async (req: NextRequest): Promise<NextResponse> => {
  const { pathname, search } = req.nextUrl;
  const targetPath = pathname.replace('/api/proxy', '') + search;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const body = req.method !== 'GET' ? await req.text() : undefined;

  const headers = new Headers();

  // Content-Type이 있으면 적용
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  // 액세스 토큰 주입
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // request 요청
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${targetPath}`, {
    method: req.method,
    headers,
    body,
  });

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
      const response = NextResponse.json(
        { error: '토큰 갱신 실패' },
        { status: 401 }
      );

      // 쿠키 삭제
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');

      return response;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

    // 새롭게 발급 받은 토큰 재설정
    await setTokenCookies(newAccessToken, newRefreshToken);

    // headers 재설정
    headers.set('Authorization', `Bearer ${newAccessToken}`);

    // 다시 api 요청
    const retryRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${targetPath}`,
      {
        method: req.method,
        headers,
        body,
      }
    );
    const retryResData = await retryRes.json();

    return NextResponse.json(retryResData, {
      status: retryRes.status,
    });
  }

  const resData = await res.json();

  if (!res.ok) return NextResponse.json(resData, { status: res.status });

  return NextResponse.json(resData, {
    status: res.status,
  });
};

export async function GET(req: NextRequest) {
  return handleProxyRequest(req);
}
export async function POST(req: NextRequest) {
  return handleProxyRequest(req);
}
export async function PATCH(req: NextRequest) {
  return handleProxyRequest(req);
}
export async function DELETE(req: NextRequest) {
  return handleProxyRequest(req);
}
