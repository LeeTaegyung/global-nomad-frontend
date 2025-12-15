import { loginRequestBody } from '@/src/services/pages/login/api';
import { TokenUserResponseType } from '@/src/types/userType';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const body: loginRequestBody = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: TokenUserResponseType = await res.json();

  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const { accessToken, refreshToken } = data;
  const cookieStore = await cookies();

  // 액세스 토큰 저장
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 60 * 30, // 30분
  });

  // 리프레시 토큰 저장
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 14, // 14일
  });

  return NextResponse.json(data);
}
