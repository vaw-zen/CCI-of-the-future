import { NextResponse } from 'next/server';

// Simple admin credentials - In production, use a proper authentication system
const ADMIN_CREDENTIALS = {
  email: 'cci.services.tn@gmail.com',
  username: 'admin',
  password: 'cci2025'
};

const ADMIN_TOKEN = 'cci-admin-token-2025-secure';

export async function POST(request) {
  try {
    console.log('Admin auth API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { username, password, email } = body;

    if ((!username && !email) || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email/Username et mot de passe requis'
      }, { status: 400 });
    }

    // Validate credentials - support both email and username
    const isValidCredentials = (
      (email === ADMIN_CREDENTIALS.email || username === ADMIN_CREDENTIALS.username) && 
      password === ADMIN_CREDENTIALS.password
    );

    if (isValidCredentials) {
      console.log('Login successful');
      
      return NextResponse.json({
        success: true,
        token: ADMIN_TOKEN,
        message: 'Connexion réussie',
        user: {
          email: ADMIN_CREDENTIALS.email,
          username: ADMIN_CREDENTIALS.username,
          role: 'admin'
        }
      });
    } else {
      console.log('Invalid credentials');
      
      return NextResponse.json({
        success: false,
        error: 'Email/Username ou mot de passe incorrect'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin authentication endpoint',
    status: 'active'
  });
}