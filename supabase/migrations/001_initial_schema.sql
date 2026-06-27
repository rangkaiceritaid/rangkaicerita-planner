-- =============================================
-- RangkaiCerita - Initial Schema
-- =============================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  groom_name      TEXT NOT NULL DEFAULT '',
  bride_name      TEXT NOT NULL DEFAULT '',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WEDDINGS
CREATE TABLE IF NOT EXISTS weddings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  akad_date         DATE,
  akad_time         TIME,
  resepsi_date      DATE,
  resepsi_time      TIME,
  has_resepsi       BOOLEAN NOT NULL DEFAULT true,
  kota_pernikahan   TEXT,
  total_budget      BIGINT NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- BUDGET CATEGORIES
CREATE TABLE IF NOT EXISTS budget_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  icon            TEXT,
  allocated_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  allocated_amount BIGINT NOT NULL DEFAULT 0,
  color           TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          BIGINT NOT NULL,
  paid_date       DATE,
  vendor_name     TEXT,
  notes           TEXT,
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MILESTONES
CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  months_before   INT,
  weeks_before    INT,
  days_before     INT,
  target_date     DATE,
  sort_order      INT NOT NULL DEFAULT 0,
  is_system       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  milestone_id    UUID REFERENCES milestones(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at    TIMESTAMPTZ,
  due_date        DATE,
  category        TEXT DEFAULT 'persiapan',
  assigned_to     TEXT DEFAULT 'both',
  reminder_sent   BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  is_system       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SESERAHAN ITEMS
CREATE TABLE IF NOT EXISTS seserahan_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  estimated_price BIGINT NOT NULL DEFAULT 0,
  is_checked      BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KUA DOCUMENTS
CREATE TABLE IF NOT EXISTS kua_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  required_for    TEXT NOT NULL DEFAULT 'both',
  is_checked      BOOLEAN NOT NULL DEFAULT false,
  copies_needed   INT NOT NULL DEFAULT 1,
  notes           TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GUESTS
CREATE TABLE IF NOT EXISTS guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  group_label     TEXT,
  invitation_type TEXT NOT NULL DEFAULT 'both',
  rsvp_status     TEXT NOT NULL DEFAULT 'pending',
  seat_number     TEXT,
  gift_notes      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id      UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category        TEXT NOT NULL,
  name            TEXT NOT NULL,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  instagram       TEXT,
  price_quoted    BIGINT,
  status          TEXT NOT NULL DEFAULT 'prospek',
  notes           TEXT,
  contract_url    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PUSH TOKENS (for n8n notifications)
CREATE TABLE IF NOT EXISTS push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL DEFAULT 'web',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seserahan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kua_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());

-- weddings policies
CREATE POLICY "weddings_own" ON weddings FOR ALL USING (user_id = auth.uid());

-- child table helper function
CREATE OR REPLACE FUNCTION auth_user_wedding_ids()
RETURNS SETOF UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id FROM weddings WHERE user_id = auth.uid()
$$;

-- budget_categories
CREATE POLICY "budget_categories_own" ON budget_categories
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- expenses
CREATE POLICY "expenses_own" ON expenses
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- milestones
CREATE POLICY "milestones_own" ON milestones
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- tasks
CREATE POLICY "tasks_own" ON tasks
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- seserahan_items
CREATE POLICY "seserahan_items_own" ON seserahan_items
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- kua_documents
CREATE POLICY "kua_documents_own" ON kua_documents
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- guests
CREATE POLICY "guests_own" ON guests
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- vendors
CREATE POLICY "vendors_own" ON vendors
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));

-- push_tokens
CREATE POLICY "push_tokens_own" ON push_tokens
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- AUTO CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, groom_name, bride_name)
  VALUES (new.id, '', '');
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED WEDDING DATA FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION seed_wedding_data(p_wedding_id UUID, p_akad_date DATE)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  m_id UUID;
BEGIN

  -- ===== BUDGET CATEGORIES =====
  INSERT INTO budget_categories (wedding_id, name, icon, allocated_pct, allocated_amount, color, sort_order)
  SELECT
    p_wedding_id,
    cat.name,
    cat.icon,
    cat.pct,
    FLOOR((SELECT total_budget FROM weddings WHERE id = p_wedding_id) * cat.pct / 100),
    cat.color,
    cat.ord
  FROM (VALUES
    ('Venue & Gedung', '🏛️', 30, '#B5704F', 1),
    ('Katering', '🍽️', 25, '#8B9D6A', 2),
    ('Foto & Video', '📸', 15, '#6B8FA3', 3),
    ('Dekorasi & Bunga', '💐', 12, '#D4A5A5', 4),
    ('Busana Pengantin', '👗', 8, '#A8855A', 5),
    ('Undangan', '✉️', 3, '#7B9E87', 6),
    ('Transportasi', '🚗', 3, '#9B8DB0', 7),
    ('Lain-lain', '📦', 4, '#C4B49A', 8)
  ) AS cat(name, icon, pct, color, ord);

  -- ===== SESERAHAN ITEMS =====
  INSERT INTO seserahan_items (wedding_id, name, quantity, sort_order)
  VALUES
    (p_wedding_id, 'Mahar (uang/logam mulia)', 1, 1),
    (p_wedding_id, 'Al-Qur''an & Sajadah', 1, 2),
    (p_wedding_id, 'Perlengkapan Sholat', 1, 3),
    (p_wedding_id, 'Seperangkat Pakaian', 1, 4),
    (p_wedding_id, 'Kosmetik & Perawatan', 1, 5),
    (p_wedding_id, 'Perhiasan', 1, 6),
    (p_wedding_id, 'Buah-buahan', 1, 7),
    (p_wedding_id, 'Makanan Tradisional', 1, 8),
    (p_wedding_id, 'Tas & Sepatu', 1, 9),
    (p_wedding_id, 'Mukena', 1, 10);

  -- ===== KUA DOCUMENTS =====
  INSERT INTO kua_documents (wedding_id, name, description, required_for, copies_needed, sort_order)
  VALUES
    (p_wedding_id, 'N1 - Surat Pengantar Nikah', 'Dari RT/RW setempat', 'both', 1, 1),
    (p_wedding_id, 'N2 - Akta Kelahiran', 'Asli + fotokopi', 'both', 3, 2),
    (p_wedding_id, 'N4 - Surat Keterangan Asal-Usul', 'Keterangan orang tua', 'both', 1, 3),
    (p_wedding_id, 'KTP Asli', 'Kartu Tanda Penduduk asli', 'both', 1, 4),
    (p_wedding_id, 'Fotokopi KTP', '3 lembar untuk calon pengantin', 'both', 3, 5),
    (p_wedding_id, 'Fotokopi KTP Wali', '3 lembar wali nikah', 'wali', 3, 6),
    (p_wedding_id, 'Kartu Keluarga (KK) Asli', 'Bersama fotokopi', 'both', 1, 7),
    (p_wedding_id, 'Fotokopi KK', '3 lembar', 'both', 3, 8),
    (p_wedding_id, 'Pas Foto 2x3', '5 lembar latar belakang biru/merah', 'both', 5, 9),
    (p_wedding_id, 'Pas Foto 3x4', '5 lembar latar belakang biru/merah', 'both', 5, 10),
    (p_wedding_id, 'Surat Pernyataan Belum Menikah', 'Bermaterai Rp 10.000', 'both', 1, 11),
    (p_wedding_id, 'Surat Izin Orang Tua', 'Jika usia < 21 tahun', 'both', 1, 12),
    (p_wedding_id, 'Buku Nikah Orang Tua', 'Jika wali kandung', 'wali', 1, 13),
    (p_wedding_id, 'Surat Baptis / Akta Kelahiran', 'Bagi yang pindah agama', 'both', 1, 14),
    (p_wedding_id, 'Akta Cerai / Surat Kematian', 'Jika janda/duda', 'both', 1, 15);

  -- ===== MILESTONES & TASKS =====

  -- H-12 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-12 Bulan', 'Persiapan Awal', 12, p_akad_date - INTERVAL '12 months', 1)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Tentukan konsep & tema pernikahan', 1),
    (p_wedding_id, m_id, 'Survey 3-5 venue pilihan', 2),
    (p_wedding_id, m_id, 'Buat anggaran awal & alokasi', 3),
    (p_wedding_id, m_id, 'Tentukan tanggal akad & resepsi', 4),
    (p_wedding_id, m_id, 'Diskusi dengan kedua keluarga', 5),
    (p_wedding_id, m_id, 'Buat moodboard inspirasi', 6);

  -- H-9 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-9 Bulan', 'Pilih & Booking Venue', 9, p_akad_date - INTERVAL '9 months', 2)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Booking venue & bayar DP', 1),
    (p_wedding_id, m_id, 'Booking fotografer & videografer', 2),
    (p_wedding_id, m_id, 'Buat daftar tamu awal', 3),
    (p_wedding_id, m_id, 'Tentukan jumlah undangan', 4),
    (p_wedding_id, m_id, 'Survey katering pilihan', 5);

  -- H-6 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-6 Bulan', 'Cari Vendor Utama', 6, p_akad_date - INTERVAL '6 months', 3)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Booking katering & bayar DP', 1),
    (p_wedding_id, m_id, 'Booking dekorasi & florist', 2),
    (p_wedding_id, m_id, 'Pilih & booking baju pengantin', 3),
    (p_wedding_id, m_id, 'Fitting baju pertama', 4),
    (p_wedding_id, m_id, 'Booking MC & hiburan', 5),
    (p_wedding_id, m_id, 'Desain konsep undangan', 6),
    (p_wedding_id, m_id, 'Urus dokumen KUA awal', 7);

  -- H-4 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-4 Bulan', 'Seserahan & Mahar', 4, p_akad_date - INTERVAL '4 months', 4)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Finalisasi daftar seserahan', 1),
    (p_wedding_id, m_id, 'Konfirmasi dekorasi pelaminan', 2),
    (p_wedding_id, m_id, 'Cetak undangan gelombang 1', 3),
    (p_wedding_id, m_id, 'Kirim undangan gelombang 1 (keluarga jauh)', 4),
    (p_wedding_id, m_id, 'Fitting baju kedua', 5),
    (p_wedding_id, m_id, 'Booking penginapan untuk tamu jauh', 6);

  -- H-2 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-2 Bulan', 'Finalisasi Semua', 2, p_akad_date - INTERVAL '2 months', 5)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Lengkapi semua dokumen KUA', 1),
    (p_wedding_id, m_id, 'Daftar & konsultasi ke KUA', 2),
    (p_wedding_id, m_id, 'Konfirmasi jadwal semua vendor', 3),
    (p_wedding_id, m_id, 'Final fitting baju pengantin', 4),
    (p_wedding_id, m_id, 'Cetak undangan gelombang 2', 5),
    (p_wedding_id, m_id, 'Beli & siapkan seserahan', 6),
    (p_wedding_id, m_id, 'Pesan kendaraan pengantin', 7);

  -- H-1 Bulan
  INSERT INTO milestones (wedding_id, title, description, months_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-1 Bulan', 'Detail Akhir', 1, p_akad_date - INTERVAL '1 month', 6)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Kirim undangan gelombang 2', 1),
    (p_wedding_id, m_id, 'Konfirmasi jumlah tamu ke katering', 2),
    (p_wedding_id, m_id, 'Gladi resik di venue', 3),
    (p_wedding_id, m_id, 'Konfirmasi rundown dengan MC', 4),
    (p_wedding_id, m_id, 'Siapkan amplop & souvenir', 5),
    (p_wedding_id, m_id, 'Briefing keluarga dan pendamping', 6);

  -- H-2 Minggu
  INSERT INTO milestones (wedding_id, title, description, weeks_before, target_date, sort_order)
  VALUES (p_wedding_id, 'H-2 Minggu', 'Persiapan Final', 2, p_akad_date - INTERVAL '2 weeks', 7)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Konfirmasi ulang semua vendor', 1),
    (p_wedding_id, m_id, 'Cek final seserahan & mahar', 2),
    (p_wedding_id, m_id, 'Update daftar tamu hadir/tidak', 3),
    (p_wedding_id, m_id, 'Kirim final jumlah tamu ke katering', 4),
    (p_wedding_id, m_id, 'Siapkan tas pengantin (isi semua kebutuhan H-0)', 5),
    (p_wedding_id, m_id, 'Istirahat & rawat kesehatan', 6);

  -- H-0 (Hari-H)
  INSERT INTO milestones (wedding_id, title, description, days_before, target_date, sort_order)
  VALUES (p_wedding_id, 'Hari-H', 'Hari Pernikahan', 0, p_akad_date, 8)
  RETURNING id INTO m_id;
  INSERT INTO tasks (wedding_id, milestone_id, title, sort_order) VALUES
    (p_wedding_id, m_id, 'Briefing vendor pagi hari', 1),
    (p_wedding_id, m_id, 'Cek dekorasi venue', 2),
    (p_wedding_id, m_id, 'Make up & dress sesuai jadwal', 3),
    (p_wedding_id, m_id, 'Proses akad nikah', 4),
    (p_wedding_id, m_id, 'Resepsi & foto bersama tamu', 5),
    (p_wedding_id, m_id, 'Istirahat cukup & nikmati momen', 6);

END;
$$;
