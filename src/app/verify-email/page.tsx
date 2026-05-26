'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import '../page.css'

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token manquant')
      return
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage(data.message)
          setTimeout(() => router.push('/auth/login'), 3000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Erreur de vérification')
        }
      } catch {
        setStatus('error')
        setMessage('Erreur serveur')
      }
    }

    verify()
  }, [token])

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        backdropFilter: 'blur(16px)',
        background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '20px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
      }}>
        {status === 'loading' && (
          <>
            <p style={{ fontSize: '40px' }}>⏳</p>
            <h2 style={{ color: '#1B1843', fontFamily: 'Quicksand' }}>Vérification en cours...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <p style={{ fontSize: '40px' }}>✅</p>
            <h2 style={{ color: '#1B1843', fontFamily: 'Quicksand' }}>Email vérifié !</h2>
            <p style={{ color: '#444', fontFamily: 'DM Sans', marginTop: '12px' }}>{message}</p>
            <p style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>Redirection vers la connexion...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <p style={{ fontSize: '40px' }}>❌</p>
            <h2 style={{ color: '#1B1843', fontFamily: 'Quicksand' }}>Erreur</h2>
            <p style={{ color: '#444', fontFamily: 'DM Sans', marginTop: '12px' }}>{message}</p>
            <Link href="/auth/register" style={{
              display: 'inline-block',
              marginTop: '20px',
              background: '#F9C464',
              color: '#1B1843',
              padding: '12px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '700',
              fontFamily: 'DM Sans',
            }}>
              Réessayer
            </Link>
          </>
        )}
      </div>
    </div>
  )
}