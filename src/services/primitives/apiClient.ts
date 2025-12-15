import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api/proxy`,
});
