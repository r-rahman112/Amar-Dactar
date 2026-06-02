export const apiClient = async (url: string, options?: RequestInit) => {
  return fetch(url, options);
};
