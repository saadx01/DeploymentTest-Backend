// policies/userPolicy.js
export const canEditUser = (currentUser, targetUserId) => {
  return currentUser.role === 'admin' || currentUser.id === targetUserId;
};
export const canDeleteUser = (currentUser, targetUserId) => {
  return currentUser.role === 'admin' || currentUser.id === targetUserId;
};