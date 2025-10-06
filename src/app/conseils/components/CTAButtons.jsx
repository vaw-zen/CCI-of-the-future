'use client';

import Link from 'next/link';

export default function CTAButtons() {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      justifyContent: 'center',
      flexWrap: 'wrap' 
    }}>
      <a 
        href="tel:+21698557766" 
        style={{
          background: 'var(--ac-primary)',
          color: 'var(--bg-base)',
          padding: '12px 30px',
          borderRadius: '8vw',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        📞 Appelez: 98-557-766
      </a>
      
      <Link 
        href="/devis" 
        style={{
          background: 'var(--ac-primary)',
          color: 'var(--bg-base)',
          padding: '12px 30px',
          borderRadius: '8vw',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        📝 Devis Gratuit
      </Link>
      
      <a 
        href="https://wa.me/21698557766?text=Bonjour,%20je%20souhaite%20des%20informations" 
        style={{
          background: 'var(--ac-primary)',
          color: 'var(--bg-base)',
          padding: '12px 30px',
          borderRadius: '8vw',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        💬 WhatsApp
      </a>
    </div>
  );
}