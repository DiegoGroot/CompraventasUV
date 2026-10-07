-- Habilitar la generación automática de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Crear las tablas de catálogo geográfico
CREATE TABLE regiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE facultades (
    id SERIAL PRIMARY KEY,
    region_id INT NOT NULL REFERENCES regiones(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL
);

-- 2. Crear los tipos ENUM para los usuarios
CREATE TYPE estado_usuario AS ENUM ('inactivo', 'activo', 'suspendido');
CREATE TYPE rol_usuario AS ENUM ('estudiante', 'profesor', 'administrador');

-- 3. Crear la tabla usuarios vinculada a las regiones y facultades
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL;
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    region_id INT NOT NULL REFERENCES regiones(id),
    facultad_id INT NOT NULL REFERENCES facultades(id),
    rol rol_usuario DEFAULT 'estudiante',
    estado estado_usuario DEFAULT 'inactivo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear estado del producto
CREATE TYPE estado_producto AS ENUM ('disponible', 'reservado', 'vendido', 'oculto');

-- 1. Tabla de Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);


-- 2. Tabla de Tiendas (imagen_link opcional)
CREATE TABLE tiendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_principal_id INT NOT NULL REFERENCES categorias(id),
    region_id INT NOT NULL REFERENCES regiones(id),
    facultad_id INT NOT NULL REFERENCES facultades(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_link VARCHAR(255), -- Es NULLABLE por defecto
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Productos (imagen_link NOT NULL)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE, -- NULL si es venta independiente
    categoria_id INT NOT NULL REFERENCES categorias(id),
    region_id INT NOT NULL REFERENCES regiones(id),
    facultad_id INT NOT NULL REFERENCES facultades(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 1,
    estado estado_producto DEFAULT 'disponible',
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE imagenes_producto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    peso_mb DECIMAL(5,2),
    es_principal BOOLEAN DEFAULT false
);
-- ==========================================
-- DATOS DE PRUEBA (SEEDERS)
-- ==========================================
-- Insertar categorías de prueba
INSERT INTO categorias (nombre, descripcion) VALUES 
('Alimentos y Bebidas', 'Comida, dulces, postres y snacks'),
('Tecnología', 'Computadoras, celulares, cables y accesorios'),
('Artículos Universitarios', 'Libros, calculadoras, batas y material de dibujo');

-- Insertar las 5 regiones de la Universidad Veracruzana
INSERT INTO regiones (nombre) VALUES 
('Xalapa'), 
('Veracruz'), 
('Orizaba-Córdoba'), 
('Poza Rica-Tuxpan'), 
('Coatzacoalcos-Minatitlán');

-- Insertar algunas facultades de prueba asociadas a sus regiones (IDs 1 y 3)
INSERT INTO facultades (region_id, nombre) VALUES 
(3, 'Facultad de Ciencias Químicas (FCQ)'),
(3, 'Facultad de Ingeniería (FIME)'),
(1, 'Facultad de Estadística e Informática (FEI)'),
(1, 'Facultad de Contaduría y Administración (FCA)'),
(2, 'Facultad de Ingeniería (Boca del Río)');
