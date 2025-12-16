'use client';
import LoadingSpinner from '@/src/components/primitives/LoadingSpinner';
import ToastContainer from '@/src/components/primitives/toast/ToastContainer';
import { queries } from '@/src/services/primitives/queries';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AuthProvicder({ children }: Props) {
  // 리액트쿼리는 액세스 토큰이 있고, 유효한 액세스 토큰을 넘겨주었을 때에만 페칭을 시작함.
  const { isLoading } = useQuery({
    ...queries.userOptions(),
    retry: false,
    staleTime: 0,
    gcTime: Infinity,
  });

  // 리액트 쿼리 페칭중이라면 로딩 보여주기.
  if (isLoading)
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
