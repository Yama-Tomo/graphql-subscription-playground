const userIdKey = 'sample-app-user-id';
const getUserId = () => localStorage.getItem(userIdKey) ?? '';
const setUserId = (userId: string) => localStorage.setItem(userIdKey, userId);

export { getUserId, setUserId };
