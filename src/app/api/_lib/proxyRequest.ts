import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface CustomRequestInit extends RequestInit {
  duplex?: 'half' | 'full' | string;
}

export const fetchWithAccessToken = async (
  req: NextRequest,
  params: { path: string[] }
) => {
  const cookieStore = await cookies();
  const headers = new Headers(req.headers);
  const accessToken = cookieStore.get('accessToken')?.value;

  const pathname = `/${params.path.join('/')}`;
  const search = req.nextUrl.search;
  const targetPath = pathname + search;

  // 액세스 토큰 주입
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const fetchOptions: CustomRequestInit = {
    method: req.method,
    headers,
    body: req.body ? req.clone().body : null,
    duplex: 'half',
  };

  // request 요청
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${targetPath}`,
    fetchOptions
  );
};
