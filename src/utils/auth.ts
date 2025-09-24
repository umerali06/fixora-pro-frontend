// Utility functions for authentication and token handling

export const getOrgIdFromToken = (): string => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.orgId || '';
  } catch (error) {
    console.error('Error decoding token:', error);
    return '';
  }
};

export const getUserIdFromToken = (): string => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || '';
  } catch (error) {
    console.error('Error decoding token:', error);
    return '';
  }
};

export const isTokenValid = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const getTokenPayload = (): any => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
