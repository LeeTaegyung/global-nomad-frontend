import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = isProduction
  ? 'https://global-nomad-frontend.vercel.app'
  : 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api/proxy`,
});
