import { axios } from "@/shared/lib/axios";
import { AuthResponse } from "../../types/auth";
import { apiUrls } from "@/api/config/endpoints";

export type LoginCredentialsDTO = {
  userName: string;
  password: string;
};

export const loginWithEmailAndPassword = (data: LoginCredentialsDTO) =>
  axios.post<AuthResponse>(apiUrls.auth.login, data).then(res => res.data);
