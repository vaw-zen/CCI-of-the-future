export function getBearerAccessToken(request) {
  const authorizationHeader = request.headers.get('authorization') || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
}

export async function authenticateAdminRequest(request, supabase) {
  const accessToken = getBearerAccessToken(request);

  if (!accessToken) {
    return { error: 'missing_token', status: 401 };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData?.user?.email) {
    return { error: 'invalid_token', status: 401 };
  }

  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', authData.user.email)
    .eq('is_active', true)
    .single();

  if (adminError || !adminData) {
    return {
      error: 'forbidden',
      status: 403,
      user: authData.user
    };
  }

  return { user: authData.user };
}
