# Setup RangkaiCerita

## 1. Buat Supabase Project

1. Buka https://supabase.com → New Project
2. Copy **Project URL** dan **anon public key** dari Settings → API

## 2. Isi .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 3. Jalankan Migration di Supabase

1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/migrations/001_initial_schema.sql`
3. Paste dan klik **Run**

## 4. (Opsional) Setup Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google
2. Isi Google Client ID & Secret dari Google Cloud Console
3. Tambahkan redirect URL: `https://your-domain.com/api/auth/callback`

## 5. Jalankan App

```bash
npm run dev
```

Buka http://localhost:3000 di browser.

## Struktur Halaman

| Route | Deskripsi |
|---|---|
| `/login` | Register & Login |
| `/onboarding/step-1` | Input tanggal nikah |
| `/onboarding/step-2` | Input budget |
| `/onboarding/summary` | Konfirmasi & seed data |
| `/beranda` | Dashboard utama |
| `/checklist` | Milestone checklist |
| `/checklist/seserahan` | List seserahan |
| `/checklist/kua` | Dokumen KUA |
| `/anggaran` | Budget & pengeluaran |
| `/undangan` | Daftar tamu |
| `/profil` | Profil & pengaturan |

## Deploy ke Vercel

```bash
npx vercel
```

Set env vars di Vercel Dashboard, dan set Supabase redirect URL ke domain Vercel.
