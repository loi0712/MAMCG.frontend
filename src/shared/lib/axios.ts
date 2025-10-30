// import type { AuthResponse } from "@/features/auth/types/auth";
import type {InternalAxiosRequestConfig } from "axios";

import Axios from 'axios';

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
// import { apiUrls } from '@/api/config/endpoints';
// import { paths } from "@/routes/path"

export const axios = Axios.create({
    baseURL: env.apiUrl,
})

const onRequestSuccess = (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().auth.accessToken
  
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
  
    config.headers.set('Accept', 'application/json')
  
    return config
  }

// If the error status is 401 and there is no originalRequest._retry flag,
// it means the token has expired, and we need to refresh it
// const shouldRefreshToken = (error: AxiosError) => {
//     const originalRequest = error.config as TOriginalRequest;
//     const isUnauthorized = error.response?.status === 401;
  
//     return isUnauthorized && !originalRequest._retry;
//   };

//   type TOriginalRequest = {
//     _retry: boolean;
//   } & InternalAxiosRequestConfig;

axios.interceptors.request.use(onRequestSuccess, (error) => Promise.reject(error))
//   axios.interceptors.response.use(
//     response => response,
//     async (error: AxiosError) => {
//       if (shouldRefreshToken(error)) {
//         const refreshToken = storage.getRefreshToken();
  
//         if (window.location.pathname === paths.login) return Promise.reject(error);
  
//         if (refreshToken) {
//           let originalRequest = error.config as TOriginalRequest;
  
//           originalRequest = {
//             ...originalRequest,
//             _retry: true,
//           };
  
//           try {
//             const response = await axios.post<AuthResponse>(apiUrls.auth.refreshToken, { refreshToken });
//             const { accessToken } = response.data.data;
  
//             const authResponse = await handleAuthResponse(response.data);
  
//             queryClient.setQueryData(['authenticated-user'], authResponse);
  
//             originalRequest.headers.Authorization = `Bearer ${accessToken}`;
  
//             return axios(originalRequest);
//           } catch (refreshError) {
//             logoutFn();
//             window.location.assign(window.location.origin);
//           }
//         } else {
//           logoutFn();
//           window.location.assign(window.location.origin);
//         }
//       }
  
//       return Promise.reject(error);
//     },
//   );
  