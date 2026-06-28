'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'masuk' | 'daftar'>('masuk')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email atau kata sandi salah.')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-10">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold" style={{ color: '#B5704F' }}>rangkai</span>
          <span className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>cerita</span>
        </Link>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl p-1 mb-8" style={{ backgroundColor: '#EDE5DC' }}>
        {(['daftar', 'masuk'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError('') }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              backgroundColor: tab === t ? '#B5704F' : 'transparent',
              color: tab === t ? '#fff' : '#6B6560',
            }}
          >
            {t === 'daftar' ? 'Daftar' : 'Masuk'}
          </button>
        ))}
      </div>

      {tab === 'masuk' ? (
        <>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>Selamat datang kembali</h2>
          <p className="text-sm mb-8" style={{ color: '#6B6560' }}>Masuk untuk lanjutkan persiapan pernikahanmu.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Kata sandi"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              error={error}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </>
                    )}
                  </svg>
                </button>
              }
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Masuk
            </Button>
          </form>
        </>
      ) : (
        <RegisterForm />
      )}

    </div>
  )
}

function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok.')
      return
    }
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(181,112,79,0.1)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#B5704F" strokeWidth={2} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Cek emailmu!</h3>
        <p className="text-sm" style={{ color: '#6B6560' }}>
          Kami mengirim link konfirmasi ke <strong>{email}</strong>. Klik link tersebut untuk mengaktifkan akun.
        </p>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>Buat akunmu</h2>
      <p className="text-sm mb-8" style={{ color: '#6B6560' }}>Rencanakan pernikahan impianmu bersama Rangkai Cerita.</p>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          label="Nama lengkap"
          type="text"
          placeholder="Nama kamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Kata sandi"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          }
        />
        <Input
          label="Konfirmasi kata sandi"
          type="password"
          placeholder="Ulangi kata sandi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={error}
        />

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Daftar sekarang
        </Button>
      </form>
    </>
  )
}
