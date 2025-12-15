import { cookies } from 'next/headers';

export const setTokenCookies = async (
  accessToken: string,
  refreshToken: string
) => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

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
};
