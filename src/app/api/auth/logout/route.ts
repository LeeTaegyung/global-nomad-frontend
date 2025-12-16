import { NextResponse } from 'next/server';

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.delete('accessToken');
  res.cookies.delete('refreshToken');

  return res;
}
