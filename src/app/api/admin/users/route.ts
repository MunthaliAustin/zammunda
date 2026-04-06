import { NextRequest, NextResponse } from 'next/server';

const keycloakBaseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8181';
const realm = process.env.KEYCLOAK_ISSUER?.split('/realms/')[1] || 'zammunda-security-realm';

const extractAccessToken = (request: NextRequest) => {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring('Bearer '.length);
};

const mapUser = (user: any) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  enabled: user.enabled,
  emailVerified: user.emailVerified,
  createdTimestamp: user.createdTimestamp,
  roles: user.realmRoles || [],
});

export async function GET(request: NextRequest) {
  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get('search') || '';
  const url = new URL(`${keycloakBaseUrl}/admin/realms/${realm}/users`);
  url.searchParams.set('max', '100');
  if (search) {
    url.searchParams.set('search', search);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const text = await response.text();
  if (!response.ok) {
    return new NextResponse(text || 'Failed to fetch users', { status: response.status });
  }

  const users = JSON.parse(text || '[]');
  return NextResponse.json(users.map(mapUser));
}
