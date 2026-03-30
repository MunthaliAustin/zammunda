const ACCESS_TOKEN_KEY = 'auth-token';
const ID_TOKEN_KEY = 'id-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const LEGACY_KEYCLOAK_TOKEN_KEY = 'keycloak-token';
const TOKEN_REFRESH_SKEW_MS = 60_000;

const decodeJwtPayload = (token: string): any => {
  return JSON.parse(atob(token.split('.')[1]));
};

const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_KEYCLOAK_TOKEN_KEY);
};

const storeTokens = (tokenData: {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
}) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.access_token);

  if (tokenData.id_token) {
    localStorage.setItem(ID_TOKEN_KEY, tokenData.id_token);
  }

  if (tokenData.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token);
  }
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    clearStoredTokens();
    throw new Error('No refresh token found');
  }

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    throw new Error('Failed to refresh authentication token');
  }

  const tokenData = await response.json();
  storeTokens({
    access_token: tokenData.access_token,
    id_token: tokenData.id_token,
    refresh_token: tokenData.refresh_token || refreshToken,
  });

  window.dispatchEvent(new Event('auth-change'));
  return tokenData.access_token;
};

export const getAuthToken = async (): Promise<string> => {
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    try {
      const payload = decodeJwtPayload(storedToken);
      const expiry = payload.exp * 1000;

      if (Date.now() >= expiry - TOKEN_REFRESH_SKEW_MS) {
        return await refreshAccessToken();
      }

      return storedToken;
    } catch {
      clearStoredTokens();
      throw new Error('Invalid token format');
    }
  }

  const legacyKeycloakToken = localStorage.getItem(LEGACY_KEYCLOAK_TOKEN_KEY);
  if (legacyKeycloakToken) {
    try {
      const parsed = JSON.parse(legacyKeycloakToken);
      if (parsed?.access_token) {
        storeTokens({
          access_token: parsed.access_token,
          id_token: parsed.id_token,
          refresh_token: parsed.refresh_token,
        });
        localStorage.removeItem(LEGACY_KEYCLOAK_TOKEN_KEY);
        return parsed.access_token;
      }
    } catch {
      localStorage.removeItem(LEGACY_KEYCLOAK_TOKEN_KEY);
    }
  }

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }
  }

  throw new Error('No authentication token found');
};

export const initKeycloak = () => {
  if (typeof window !== 'undefined' && (window as any).keycloak) {
    return (window as any).keycloak;
  }
  return null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getAuthToken();
    return true;
  } catch {
    return false;
  }
};

export const clearAuthTokens = () => {
  clearStoredTokens();
};

export const getUserInfo = (): any => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    try {
      const payload = decodeJwtPayload(token);
      return {
        sub: payload.sub,
        email: payload.email,
        preferred_username: payload.preferred_username || payload.name,
        name: payload.name,
        roles: payload.realm_access?.roles || payload.roles || []
      };
    } catch {
      return null;
    }
  }
  return null;
};
