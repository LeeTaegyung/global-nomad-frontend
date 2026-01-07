import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction
  ? 'https://global-nomad-frontend.vercel.app'
  : 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api/proxy`,
});

const REDIRECT_STATE = {
  isRedirecting: false,
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error.response;

    // refresh token 만료로 인한 인증 실패 시
    if (
      res?.status === 401 &&
      res?.headers?.['x-auth-error'] === 'REFRESH_TOKEN_EXPIRED'
    ) {
      // SSR 에러 방지용 플래그
      if (typeof window !== 'undefined') {
        // 중복 리다이렉트 방지용 플래그
        if (!REDIRECT_STATE.isRedirecting) {
          REDIRECT_STATE.isRedirecting = true;
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect_path=${currentPath}`;
        }
      }
    }
    return Promise.reject(error);
  }
);
