const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = async (url: string, options?: RequestInit) => {
  const isRelative = url.startsWith('/');
  const finalUrl = isRelative ? `${API_BASE_URL}${url}` : url;
  return fetch(finalUrl, options);
};
