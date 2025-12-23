export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const expiredResetCode = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10); // Code valid for 10 minutes
  return now;
}