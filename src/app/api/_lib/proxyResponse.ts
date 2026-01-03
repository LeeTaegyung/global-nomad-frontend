import { NextResponse } from 'next/server';

export const handleApiResponse = async (res: Response) => {
  // 204 코드시 처리
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    // json 처리
    const resData = await res.json();
    return NextResponse.json(resData, { status: res.status });
  }

  if (contentType.startsWith('text/')) {
    // text 처리
    const resText = await res.text();
    return NextResponse.json(resText, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  }

  // 바이너리/파일 처리
  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
};
