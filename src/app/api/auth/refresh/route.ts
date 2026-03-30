import { NextRequest, NextResponse } from 'next/server';

const keycloakBaseUrl =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8181';
const realm = 'zammunda-security-realm';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Missing refreshToken' },
        { status: 400 }
      );
    }

    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'zammunda-web';
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    });

    if (clientSecret) {
      body.set('client_secret', clientSecret);
    }

    const response = await fetch(
      `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        cache: 'no-store',
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Refresh token exchange failed',
          details: text,
        },
        { status: response.status }
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Refresh route error:', error);
    return NextResponse.json(
      { error: 'Internal refresh error' },
      { status: 500 }
    );
  }
}
