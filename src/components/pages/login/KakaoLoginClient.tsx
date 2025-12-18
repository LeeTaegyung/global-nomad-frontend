'use client';
import LoadingSpinner from '@/src/components/primitives/LoadingSpinner';
import { KAKAO_REDIRECT_URI_LOGIN } from '@/src/constants/social';
import {
  KakaoLoginRequestBody,
  kakaoLoginUser,
} from '@/src/services/pages/login/api';
import { queries } from '@/src/services/primitives/queries';
import { useToastStore } from '@/src/store/useToastStore';
import { TokenUserResponseType } from '@/src/types/userType';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function KakaoLoginClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const flagRef = useRef(false);
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const redirectPath = searchParams.get('state');
  const createToast = useToastStore((state) => state.createToast);
  const kakaoLoginMutation = useMutation({
    mutationFn: async (data: KakaoLoginRequestBody) =>
      await kakaoLoginUser(data),
    onSuccess: async (data: TokenUserResponseType) => {
      queryClient.setQueryData(queries.user(), data.user); // 리액트 쿼리 데이터 캐싱

      // redirectPath 값이 있으면, 해당 페이지로 다시 이동
      // 보안 취약점을 강화하기 위해 redirectPath.startsWith('/')로 현재 도메인내의 경로인지 확인
      if (redirectPath && redirectPath.startsWith('/')) {
        router.replace(redirectPath);
      } else {
        router.replace('/');
      }
    },
    onError: (error) => {
      console.error(error);
      createToast({
        message: '로그인에 실패하였습니다. 다시 시도 해주세요.',
        type: 'failed',
      });
      router.replace('/login');
    },
  });

  useEffect(() => {
    if (!code) {
      createToast({
        message: '인가 코드가 없습니다. 다시 시도해주세요.',
        type: 'failed',
      });
      router.replace('/login');
      return;
    }

    if (flagRef.current) return;

    flagRef.current = true;

    kakaoLoginMutation.mutate({
      redirectUri: KAKAO_REDIRECT_URI_LOGIN,
      token: code,
    });
  }, [code, kakaoLoginMutation, router, createToast]);

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <LoadingSpinner className='w-[40px] h-[40px] border-8' />
      <p>카카오 로그인중...</p>
    </div>
  );
}
