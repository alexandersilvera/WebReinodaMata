import { useState, useEffect } from 'react';
import { auth, db } from '../core/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface UserProfile {
  displayName?: string;
  photoURL?: string;
  bio?: string;
  // otros campos que pueda tener el perfil
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  createdAt: Timestamp;
  postId: string;
  edited?: boolean;
}

interface CommentSectionProps {
  postId: string;
  postTitle: string;
}

export default function CommentSection({ postId, postTitle: _postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  // Manejar la autenticación y cargar el perfil
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Cargar el perfil de usuario desde Firestore
          const profileRef = doc(db, 'userProfiles', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data() as UserProfile);
          } else {
            console.log('No existe perfil del usuario, usando datos de auth');
            // Si no hay perfil, usar datos básicos de auth
            setUserProfile({
              displayName: currentUser.displayName || 'Usuario',
              photoURL: currentUser.photoURL || '/images/default-avatar.png'
            });
          }
        } catch (error) {
          console.error('Error al cargar perfil de usuario:', error);
          // En caso de error, usar datos básicos de auth
          setUserProfile({
            displayName: currentUser.displayName || 'Usuario',
            photoURL: currentUser.photoURL || '/images/default-avatar.png'
          });
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar comentarios
  useEffect(() => {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Comment);
      
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  // Publicar un nuevo comentario
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim() || !userProfile) return;
    
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'comments'), {
        text: newComment.trim(),
        userId: user.uid,
        userDisplayName: userProfile.displayName || 'Usuario',
        userPhotoURL: userProfile.photoURL || '/images/default-avatar.png',
        createdAt: serverTimestamp(),
        postId: postId,
        edited: false
      });
      
      setNewComment('');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      alert('No se pudo publicar tu comentario. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Comenzar a editar un comentario
  const handleStartEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.text);
  };

  // Cancelar la edición de un comentario
  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditedText('');
  };

  // Guardar la edición de un comentario
  const handleSaveEdit = async (commentId: string) => {
    if (!user || !editedText.trim()) return;
    
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        text: editedText.trim(),
        edited: true
      });
      
      setEditingCommentId(null);
      setEditedText('');
    } catch (error) {
      console.error('Error al editar comentario:', error);
      alert('No se pudo editar tu comentario. Inténtalo de nuevo.');
    }
  };

  // Eliminar un comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
      } catch (error) {
        console.error('Error al eliminar comentario:', error);
        alert('No se pudo eliminar el comentario. Inténtalo de nuevo.');
      }
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div className="flex justify-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="mt-12 pt-8 border-t border-green-900/30">
      <h3 className="text-2xl font-bold text-green-400 mb-6">Comentarios</h3>
      
      {/* Formulario de comentario o botón de inicio de sesión */}
      {user && userProfile ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-4">
            <img 
              src={userProfile.photoURL || '/images/default-avatar.png'} 
              alt={userProfile.displayName || 'Usuario'} 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-white font-medium">{userProfile.displayName || 'Usuario'}</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-3 bg-green-900/20 border border-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white min-h-[100px] resize-y"
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></span>
                      Publicando...
                    </>
                  ) : 'Publicar comentario'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-green-900/30 rounded-lg p-6 mb-8 text-center">
          <p className="text-white mb-4">Para dejar un comentario debes iniciar sesión primero.</p>
          <div className="flex gap-4 justify-center">
            <a href="/login" className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors">
              Iniciar sesión
            </a>
            <a href="/register" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
              Registrarse
            </a>
          </div>
        </div>
      )}
      
      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Sé el primero en comentar este artículo.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-green-900/20 rounded-lg p-5 border border-green-900/30">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={comment.userPhotoURL || '/images/default-avatar.png'} 
                    alt={comment.userDisplayName} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-white">{comment.userDisplayName}</h4>
                    <p className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                      {comment.edited && <span className="ml-2 text-green-400">(editado)</span>}
                    </p>
                  </div>
                </div>
                
                {/* Botones de acción para el autor del comentario */}
                {user && user.uid === comment.userId && (
                  <div className="flex gap-2">
                    {editingCommentId !== comment.id && (
                      <>
                        <button 
                          onClick={() => handleStartEditing(comment)}
                          className="text-gray-400 hover:text-green-500 transition-colors"
                          title="Editar comentario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar comentario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Modo de edición o visualización del comentario */}
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full p-3 bg-green-900/30 border border-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white min-h-[80px] resize-y"
                    required
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      onClick={handleCancelEditing}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editedText.trim()}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 whitespace-pre-line break-words">{comment.text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 