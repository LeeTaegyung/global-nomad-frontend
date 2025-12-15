'use client';

import Button from '@/src/components/primitives/Button';
import FormInput from '@/src/components/primitives/input/FormInput';
import AlertModal from '@/src/components/primitives/modal/AlertModal';
import { loginRequestBody, loginUser } from '@/src/services/pages/login/api';
import { queries } from '@/src/services/primitives/queries';
import { TokenUserResponseType } from '@/src/types/userType';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormDataType {
  email: string;
  password: string;
}

const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect_path');
  const [alertOpen, setAlertOpen] = useState(false);
  const loginMutation = useMutation({
    mutationFn: (data: loginRequestBody) => loginUser(data),
    onSuccess: (data: TokenUserResponseType) => {
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
      const err = error as AxiosError;
      if (err?.response?.status === 400 || err?.response?.status === 404) {
        setAlertOpen(true);
      }
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormDataType>({ mode: 'onChange' });

  const handleSubmitForm = (formData: FormDataType) => {
    loginMutation.mutate(formData);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className='flex flex-col gap-4 md:gap-5'
      >
        <FormInput
          label='이메일'
          variant='auth'
          type='text'
          placeholder='이메일을 입력해 주세요'
          errorMessage={errors.email?.message}
          {...register('email', {
            required: '이메일을 입력해 주세요.',
            pattern: {
              value: EMAIL_REGEXP,
              message: '이메일 형식으로 작성해주세요.',
            },
            setValueAs: (v) => v.trim(),
          })}
        />
        <FormInput
          label='비밀번호'
          isPassword
          variant='auth'
          type='password'
          placeholder='비밀번호를 입력해 주세요'
          errorMessage={errors.password?.message}
          {...register('password', {
            required: '비밀번호를 입력해 주세요.',
            minLength: {
              value: 8,
              message: '8자 이상 입력해주세요.',
            },
            setValueAs: (v) => v.trim(),
          })}
        />
        <Button
          size='lg'
          full
          className='mt-2 md:mt-[10px]'
          disabled={!isValid || isSubmitting}
        >
          로그인하기
        </Button>
      </form>
      <AlertModal
        isOpen={alertOpen}
        message='로그인 정보를 다시 확인해주세요.'
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
}
