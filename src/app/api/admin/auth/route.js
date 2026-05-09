import { NextResponse } from 'next/server';
import { createServiceClient } from '@/libs/supabase';
import { authenticateAdminRequest } from '@/libs/adminApiAuth';

function buildResponse({ status, message, data = null }, httpStatus) {
  return NextResponse.json(
    {
      status,
      message,
      data
    },
    { status: httpStatus }
  );
}

async function verifyAdminRequest(request) {
  let supabase;

  try {
    supabase = createServiceClient();
  } catch (error) {
    return buildResponse(
      {
        status: 'config_error',
        message: 'Service de base de données non configuré.',
        data: {
          user: null,
          isAdmin: false
        }
      },
      500
    );
  }

  try {
    const authResult = await authenticateAdminRequest(request, supabase);

    if (authResult.error) {
      const statusMap = {
        missing_token: 401,
        invalid_token: 401,
        forbidden: 403
      };

      return buildResponse(
        {
          status: authResult.error,
          message: authResult.error === 'forbidden'
            ? 'Accès administrateur requis.'
            : 'Session administrateur invalide.',
          data: {
            user: authResult.user
              ? {
                  id: authResult.user.id,
                  email: authResult.user.email || ''
                }
              : null,
            isAdmin: false
          }
        },
        statusMap[authResult.error] || 401
      );
    }

    const user = authResult.user;
    const shouldRecordLastLogin = request.headers.get('x-record-last-login') === '1';

    if (shouldRecordLastLogin && user?.email) {
      const { error } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', user.email)
        .eq('is_active', true);

      if (error) {
        console.warn('[admin][auth] failed to update last_login:', error.message);
      }
    }

    return buildResponse(
      {
        status: 'success',
        message: 'Session administrateur vérifiée.',
        data: {
          user: {
            id: user.id,
            email: user.email || ''
          },
          isAdmin: true
        }
      },
      200
    );
  } catch (error) {
    console.error('[admin][auth] verification failed:', error);

    return buildResponse(
      {
        status: 'auth_check_failed',
        message: 'Impossible de vérifier la session administrateur.',
        data: {
          user: null,
          isAdmin: false
        }
      },
      500
    );
  }
}

export async function GET(request) {
  return verifyAdminRequest(request);
}

export async function POST(request) {
  return verifyAdminRequest(request);
}
