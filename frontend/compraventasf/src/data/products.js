export const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'books', label: 'Libros' },
  { id: 'technology', label: 'Tecnología' },
  { id: 'home', label: 'Hogar' },
  { id: 'sports', label: 'Deporte' },
  { id: 'accessories', label: 'Accesorios' },
]

export const campuses = ['Xalapa', 'Veracruz', 'Orizaba-Córdoba', 'Poza Rica-Tuxpan', 'Coatzacoalcos-Minatitlán']

export const products = [
  { id: 'p-101', title: 'Manual de biología celular', category: 'books', price: 18, condition: 'Buen estado', seller: 'Clara M.', campus: campuses[0], postedAt: 'Hace 2 h', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=760&q=85', description: 'Edición actual, subrayado mínimo y páginas en muy buen estado. Ideal para primero.' },
  { id: 'p-102', title: 'Auriculares inalámbricos', category: 'technology', price: 32, condition: 'Como nuevo', seller: 'Pau R.', campus: campuses[1], postedAt: 'Hace 4 h', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=760&q=85', description: 'Se entregan con estuche y cable de carga. Funcionan perfectamente.' },
  { id: 'p-103', title: 'Bicicleta urbana', category: 'sports', price: 95, condition: 'Buen estado', seller: 'Marc A.', campus: campuses[2], postedAt: 'Ayer', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=760&q=85', description: 'Bicicleta ligera de ciudad, revisada hace poco. Se puede probar en el campus.' },
  { id: 'p-104', title: 'Lámpara de escritorio', category: 'home', price: 14, condition: 'Buen estado', seller: 'Núria S.', campus: campuses[1], postedAt: 'Ayer', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=760&q=85', description: 'Luz regulable y brazo articulado. Perfecta para estudiar en casa.' },
  { id: 'p-105', title: 'Fundamentos de derecho civil', category: 'books', price: 22, condition: 'Buen estado', seller: 'Joan F.', campus: campuses[3], postedAt: 'Hace 1 día', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=760&q=85', description: 'Libro de texto con apuntes en los márgenes de algunos temas.' },
  { id: 'p-106', title: 'Mochila para portátil', category: 'accessories', price: 20, condition: 'Como nuevo', seller: 'Aina L.', campus: campuses[4], postedAt: 'Hace 2 días', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=760&q=85', description: 'Compartimento acolchado para portátil de hasta 15 pulgadas.' },
  { id: 'p-107', title: 'Calculadora científica', category: 'technology', price: 16, condition: 'Buen estado', seller: 'Sergio T.', campus: campuses[0], postedAt: 'Hace 3 días', image: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&w=760&q=85', description: 'Lista para clase y exámenes. Incluye funda protectora.' },
  { id: 'p-108', title: 'Esterilla de yoga', category: 'sports', price: 12, condition: 'Buen estado', seller: 'Laia P.', campus: campuses[0], postedAt: 'Hace 4 días', image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=760&q=85', description: 'Esterilla antideslizante, ligera y fácil de transportar.' },
]