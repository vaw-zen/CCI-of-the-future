"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import styles from './login.module.css';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const router = useRouter();
  const { user, isAdmin, loading, error, signInWithEmail } = useAdminAuth();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push('/admin/devis');
    }
  }, [user, isAdmin, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setResetMessage('');

    try {
      const result = await signInWithEmail(credentials.email, credentials.password);
      
      if (result.success) {
        // The useAdminAuth hook will handle the admin check and redirect
        console.log('Login successful, checking admin privileges...');
      }
      // Error is handled by the useAdminAuth hook
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!credentials.email) {
      setResetMessage('Veuillez saisir votre email d\'abord');
      return;
    }

    try {
      const { supabase } = await import('@/libs/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setResetMessage(`Erreur: ${error.message}`);
      } else {
        setResetMessage('Email de réinitialisation envoyé ! Vérifiez votre boîte email.');
      }
    } catch (err) {
      setResetMessage('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1>Administration CCI</h1>
            <p>Vérification de l'authentification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Administration CCI</h1>
          <p>Connexion au tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email administrateur</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="admin@cci.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Votre mot de passe"
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {resetMessage && (
            <div className={resetMessage.includes('Erreur') ? styles.error : styles.success}>
              {resetMessage}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            className={styles.resetButton}
            disabled={isLoading}
          >
            Mot de passe oublié ?
          </button>
        </form>

        <div className={styles.footer}>
          <p>Accès réservé aux administrateurs autorisés</p>
        </div>
      </div>
    </div>
  );
}