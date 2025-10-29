/**
 * Constantes de imágenes para Landing Page
 * Centro Umbandista Reino Da Mata
 */

export const LANDING_IMAGES = {
  // Hero Section - Imagen principal de ceremonia espiritual
  hero: {
    url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/congal_1.webp?alt=media&token=cce2241f-fa25-4dca-9aa4-5b248ca2dd68',
    alt: 'Ceremonia espiritual en Centro Umbandista Reino Da Mata',
    title: 'Nuestra Práctica Espiritual'
  },

  // Galería para sección "Sobre Nosotros" y otras secciones
  gallery: [
    {
      id: 'templo-1',
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_112.jpg?alt=media&token=bcf09534-6397-4ad9-b21e-919b2f7ef59c',
      alt: 'Interior del Templo',
      title: 'Nuestro Espacio Sagrado',
      category: 'templo'
    },
    {
      id: 'templo-2',
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_110.jpg?alt=media&token=17e7f62b-6609-4436-964c-ca13e73cb357',
      alt: 'Interior del Templo 2',
      title: 'Altar Sagrado',
      category: 'templo'
    },
    {
      id: 'comunidad',
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/comunidad_2.jpeg?alt=media&token=e4087073-729d-43f1-a23d-dfb8d8426bd6',
      alt: 'Comunidad reunida',
      title: 'Nuestra Comunidad',
      category: 'comunidad'
    },
    {
      id: 'grupo-interno',
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/grupo_interno.jpeg?alt=media&token=e796a669-de3d-4c61-8382-6ea4d83ef426',
      alt: 'Grupo de estudio',
      title: 'Aprendizaje Conjunto',
      category: 'comunidad'
    },
    {
      id: 'evento-especial',
      url: 'https://firebasestorage.googleapis.com/v0/b/reino-da-mata-160a9.appspot.com/o/torre_de_antel_actividad.webp?alt=media&token=077234e5-09c5-420a-8804-094f418e25c1',
      alt: 'Actividad especial',
      title: 'Eventos Especiales',
      category: 'eventos'
    }
  ]
};

/**
 * Obtener imágenes por categoría
 */
export function getImagesByCategory(category: string) {
  return LANDING_IMAGES.gallery.filter(img => img.category === category);
}

/**
 * Obtener imagen por ID
 */
export function getImageById(id: string) {
  return LANDING_IMAGES.gallery.find(img => img.id === id);
}
