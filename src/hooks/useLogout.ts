import { queries } from '@/src/services/primitives/queries';
import { getQueryClient } from '@/src/utils/getQueryClient';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATH_PATTERNS = [
  /^\/$/,
  /^\/detail\/\d+$/,
  /^\/login$/,
  /^\/login\/social\/kakao$/,
  /^\/signup$/,
  /^\/signup\/social\/kakao$/,
];

export default function useLogout() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    // 1. 토큰 삭제
    axios.delete('/api/auth/logout');

    // 2. 리액트 쿼리 유저 정보 초기화
    const queryClient = getQueryClient();
    queryClient.setQueryData(queries.user(), null);

    const isPublicPath = PUBLIC_PATH_PATTERNS.some((regex) =>
      regex.test(pathname)
    );

    if (!isPublicPath) {
      // 3. 인증 필요 O - 로그인 페이지 이동
      router.replace('/login');
    }
    // 3. 인증 필요 X - 현재 페이지 유지
  };

  return logout;
}
