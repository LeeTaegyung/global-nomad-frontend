import { setTokenCookies } from '@/src/app/api/_lib/tokenUtils';
import { KakaoLoginRequestBody } from '@/src/services/pages/login/api';
import { TokenUserResponseType } from '@/src/types/userType';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body: KakaoLoginRequestBody = await req.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/oauth/sign-in/kakao`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const data: TokenUserResponseType = await res.json();

  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const { accessToken, refreshToken } = data;

  await setTokenCookies(accessToken, refreshToken);

  return NextResponse.json(data);
}
