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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  const { userId } = await params;
  const updates = await request.json();

  const currentResponse = await fetch(`${keycloakBaseUrl}/admin/realms/${realm}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const currentText = await currentResponse.text();
  if (!currentResponse.ok) {
    return new NextResponse(currentText || 'Failed to load user', { status: currentResponse.status });
  }

  const currentUser = currentText ? JSON.parse(currentText) : {};
  const payload = {
    ...currentUser,
    ...updates,
  };

  const updateResponse = await fetch(`${keycloakBaseUrl}/admin/realms/${realm}/users/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const updateText = await updateResponse.text();
  if (!updateResponse.ok) {
    return new NextResponse(updateText || 'Failed to update user', { status: updateResponse.status });
  }

  return new NextResponse(null, { status: 204 });
}
