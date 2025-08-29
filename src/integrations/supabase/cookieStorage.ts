export const cookieStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem(key: string) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem(key: string, value: string) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
  },
  removeItem(key: string) {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};
