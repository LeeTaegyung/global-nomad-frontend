import { setTokenCookies } from '@/src/app/api/_lib/tokenUtils';
import { loginRequestBody } from '@/src/services/pages/login/api';
import { TokenUserResponseType } from '@/src/types/userType';
import { NextRequest, NextResponse } from 'next/server';

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

  await setTokenCookies(accessToken, refreshToken);

  return NextResponse.json(data);
}
