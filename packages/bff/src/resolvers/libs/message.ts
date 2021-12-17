const isMessageRead = (currentUserId: string, messageOwnerId: string, readUserIds: string[]) => {
  const isMessageOwner = currentUserId === messageOwnerId;
  return isMessageOwner || readUserIds.includes(currentUserId);
};

export { isMessageRead };
