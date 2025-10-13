'use client';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
      background: '#000',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 20px 0' }}>Reel non trouvé</h2>
      <p style={{ fontSize: '16px', margin: '0 0 30px 0', color: '#aaa' }}>
        Ce reel n'existe pas ou a été supprimé.
      </p>
      <a 
        href="/blogs" 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#333',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#555'}
        onMouseOut={(e) => e.target.style.background = '#333'}
      >
        Retour aux reels
      </a>
    </div>
  );
}