"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to Keycloak for authentication
export default function SignInRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Keycloak login
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8181';
    // Use the exact redirect URI configured in Keycloak (must match valid redirect URIs)
    const redirectUri = encodeURIComponent('http://localhost:3001/auth/callback');
    const keycloakLoginUrl = `${keycloakUrl}/realms/zammunda-security-realm/protocol/openid-connect/auth?client_id=zammunda-web&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;
    
    window.location.href = keycloakLoginUrl;
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Redirecting to secure login...</p>
      </div>
    </div>
  );
}
