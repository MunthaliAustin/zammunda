export const getAuthToken = async (): Promise<string> => {
  // Check for JWT token in localStorage (from Keycloak redirect)
  const token = localStorage.getItem('auth-token');
  if (token) {
    try {
      // Parse JWT to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      
      // Check if token is expired
      if (Date.now() >= expiry) {
        localStorage.removeItem('auth-token');
        throw new Error('Authentication token expired');
      }
      
      return token;
    } catch (error) {
      localStorage.removeItem('auth-token');
      throw new Error('Invalid token format');
    }
  }
  
  // Check URL for token from Keycloak redirect
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token
      localStorage.setItem('auth-token', token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }
  }
  
  // Fallback to existing auth system
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      return 'fallback-token';
    }
  } catch (error) {
    // Ignore and throw no token error
  }
  
  throw new Error('No authentication token found');
};

// Initialize Keycloak configuration
export const initKeycloak = () => {
  // This would be the Keycloak initialization logic
  // For now, we'll check if Keycloak is available in window
  if (typeof window !== 'undefined' && (window as any).keycloak) {
    return (window as any).keycloak;
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getAuthToken();
    return true;
  } catch (error) {
    return false;
  }
};

// Get user info from JWT token
export const getUserInfo = (): any => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        sub: payload.sub,
        email: payload.email,
        preferred_username: payload.preferred_username || payload.name,
        name: payload.name,
        roles: payload.realm_access?.roles || payload.roles || []
      };
    } catch (error) {
      return null;
    }
  }
  return null;
};