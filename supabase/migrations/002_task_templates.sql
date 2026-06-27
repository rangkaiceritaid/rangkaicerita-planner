-- Tambah kolom link_url dan is_active ke tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Tabel template: katalog tugas bawaan yang bisa dipilih user
CREATE TABLE IF NOT EXISTS task_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT NOT NULL, -- 'checklist' | 'seserahan' | 'kua'
  group_label  TEXT NOT NULL,
  sort_group   INT NOT NULL DEFAULT 0,
  title        TEXT NOT NULL,
  description  TEXT,
  link_url     TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_templates_read" ON task_templates FOR SELECT USING (true);

-- Pivot table: template mana yang diaktifkan per wedding
CREATE TABLE IF NOT EXISTS wedding_task_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id   UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  template_id  UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  task_id      UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, template_id)
);

ALTER TABLE wedding_task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wedding_task_templates_own" ON wedding_task_templates
  FOR ALL USING (wedding_id IN (SELECT auth_user_wedding_ids()));
