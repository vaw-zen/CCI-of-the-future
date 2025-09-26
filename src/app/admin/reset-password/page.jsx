"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/login.module.css';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si nous avons les paramètres de réinitialisation
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    
    if (!access_token || !refresh_token) {
      setError('Lien de réinitialisation invalide ou expiré');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { supabase } = await import('@/libs/supabase');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(`Erreur: ${error.message}`);
      } else {
        setMessage('Mot de passe mis à jour avec succès !');
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Réinitialiser le mot de passe</h1>
          <p>Saisissez votre nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Nouveau mot de passe"
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Confirmer le mot de passe"
              minLength={6}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {message && (
            <div className={styles.success}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            <a href="/admin/login" style={{color: '#667eea', textDecoration: 'none'}}>
              ← Retour à la connexion
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1>Réinitialiser le mot de passe</h1>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}