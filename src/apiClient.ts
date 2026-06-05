import { auth } from './lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = async (url: string, options: RequestInit = {}) => {
  const isRelative = url.startsWith('/');
  const finalUrl = isRelative ? `${API_BASE_URL}${url}` : url;
  const headers = new Headers(options.headers);

  if (auth?.currentUser && !headers.has('Authorization')) {
    const idToken = await auth.currentUser.getIdToken();
    headers.set('Authorization', `Bearer ${idToken}`);
  }

  return fetch(finalUrl, {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  });
};
