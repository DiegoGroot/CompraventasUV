CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reportante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    motivo VARCHAR(30) NOT NULL CHECK (motivo IN (
        'imagen_inapropiada','producto_prohibido','informacion_falsa','posible_fraude',
        'publicacion_enganosa','producto_defectuoso','conducta_inapropiada','otro')),
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','en_revision','resuelto','rechazado')),
    respuesta_admin TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    CHECK (reportante_id <> vendedor_id)
);

CREATE INDEX IF NOT EXISTS idx_reportes_reportante ON reportes(reportante_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reportes_unico_producto
    ON reportes(reportante_id, producto_id)
    WHERE producto_id IS NOT NULL AND estado IN ('pendiente','en_revision');

CREATE UNIQUE INDEX IF NOT EXISTS idx_reportes_unico_usuario
    ON reportes(reportante_id, vendedor_id)
    WHERE producto_id IS NULL AND estado IN ('pendiente','en_revision');