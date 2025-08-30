export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
export const USERNAME_PATTERN = USERNAME_REGEX.source;

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}
