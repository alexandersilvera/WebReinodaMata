import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

/**
 * Obtiene los intereses de un usuario desde su perfil de Firestore.
 * @param userId - El UID del usuario.
 * @returns Un array de strings con los intereses del usuario, o null si no se encuentra.
 */
async function getUserInterests(userId: string): Promise<string[] | null> {
  const db = getFirestore();
  const userDocRef = doc(db, 'userProfiles', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    return userData.interests || [];
  }
  
  return null;
}

/**
 * Obtiene artículos personalizados para un usuario basándose en sus intereses.
 * Si el usuario no tiene intereses, devuelve los artículos más recientes.
 * @param userId - El UID del usuario.
 * @returns Una promesa que se resuelve en un array de documentos de artículos.
 */
export async function getPersonalizedArticles(userId: string): Promise<DocumentData[]> {
  const interests = await getUserInterests(userId);
  const db = getFirestore();
  const articlesCol = collection(db, 'articles');

  let articlesQuery;

  if (interests && interests.length > 0) {
    console.log(`Buscando artículos personalizados para el usuario ${userId} con intereses: ${interests.join(', ')}`);
    // Consulta artículos donde el array 'tags' contiene alguno de los intereses del usuario.
    // Firestore limita 'array-contains-any' a 10 valores en el array de entrada.
    const interestsForQuery = interests.slice(0, 10);
    articlesQuery = query(
      articlesCol,
      where('tags', 'array-contains-any', interestsForQuery),
      orderBy('publishedDate', 'desc'),
      limit(20) // Limitar a 20 artículos
    );
  } else {
    console.log(`El usuario ${userId} no tiene intereses definidos. Devolviendo artículos más recientes.`);
    // Si no hay intereses, devuelve los 10 artículos más recientes.
    articlesQuery = query(
      articlesCol,
      orderBy('publishedDate', 'desc'),
      limit(10)
    );
  }

  try {
    const querySnapshot = await getDocs(articlesQuery);
    const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as DocumentData }));
    return articles;
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    // En caso de error (ej: no existe el índice compuesto), devolver los más recientes como fallback.
    const fallbackQuery = query(articlesCol, orderBy('publishedDate', 'desc'), limit(10));
    const fallbackSnapshot = await getDocs(fallbackQuery);
    return fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as DocumentData }));
  }
}
