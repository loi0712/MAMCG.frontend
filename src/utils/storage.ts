const storagePrefix = 'mam_cg_app_';

const storage = {
  getAccessToken: () => {
    return JSON.parse(window.localStorage.getItem(`${storagePrefix}token`) ?? 'null') as string;
  },
  getRefreshToken: () => {
    return JSON.parse(window.localStorage.getItem(`${storagePrefix}refresh_token`) ?? 'null') as string;
  },
  setAccessToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}token`, JSON.stringify(token));
  },
  setRefreshToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}refresh_token`, JSON.stringify(token));
  },
  clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`);
    window.localStorage.removeItem(`${storagePrefix}refresh_token`);
  },
};

export default storage;
