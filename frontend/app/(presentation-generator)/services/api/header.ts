export const getHeader = () => {
  // Get auth token from cookie
  const token = typeof window !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1] : 
    null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",  
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getHeaderForFormData = () => {
  // Get auth token from cookie
  const token = typeof window !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1] : 
    null;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization",
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};
