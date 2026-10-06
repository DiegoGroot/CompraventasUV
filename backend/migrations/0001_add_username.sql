ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username varchar;

UPDATE usuarios
SET username = 'uv_' || replace(id::text, '-', '')
WHERE username IS NULL OR btrim(username) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios (username);

ALTER TABLE usuarios ALTER COLUMN username SET NOT NULL;