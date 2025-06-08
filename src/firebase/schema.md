# Esquema de Base de Datos: Sistema de Comentarios

Este documento describe el esquema de datos utilizado para el sistema de comentarios del blog.

## Colección: `comments`

Cada documento en esta colección representa un comentario individual en un artículo del blog.

### Campos:

| Campo           | Tipo       | Descripción                                     |
|-----------------|------------|-------------------------------------------------|
| text            | string     | El contenido del comentario                     |
| userId          | string     | ID del usuario que realizó el comentario        |
| userDisplayName | string     | Nombre visible del usuario                      |
| userPhotoURL    | string     | URL de la imagen de perfil del usuario          |
| createdAt       | timestamp  | Fecha y hora de creación del comentario         |
| postId          | string     | ID del artículo al que pertenece el comentario  |

### Índices recomendados:

1. Índice compuesto para consultas de comentarios por artículo:
   - Campos: `postId` (ascendente), `createdAt` (descendente)
   - Permite consultar comentarios ordenados por fecha de publicación para un artículo específico

## Reglas de seguridad recomendadas:

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura de comentarios a cualquier usuario
    match /comments/{commentId} {
      allow read: if true;
      
      // Permitir escritura solo a usuarios autenticados
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
      
      // Permitir eliminar solo al autor del comentario
      allow delete: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
  }
}
```

## Consideraciones:

1. Los comentarios están vinculados directamente a los artículos mediante el campo `postId`
2. Solo los usuarios autenticados pueden crear comentarios
3. Solo el autor de un comentario puede eliminarlo
4. Los moderadores del blog podrían necesitar permisos adicionales para moderar comentarios (no implementado en este esquema inicial)

## Colección: `subscribers`

Cada documento en esta colección representa un usuario suscrito al blog para recibir actualizaciones.

### Campos:

| Campo           | Tipo       | Descripción                                     |
|-----------------|------------|-------------------------------------------------|
| firstName       | string     | Nombre del suscriptor                           |
| lastName        | string     | Apellido del suscriptor (opcional)              |
| email           | string     | Correo electrónico del suscriptor               |
| createdAt       | timestamp  | Fecha y hora de suscripción                     |
| active          | boolean    | Estado de la suscripción (activo/inactivo)      |

### Índices recomendados:

1. Índice único para correos electrónicos:
   - Campo: `email` (ascendente)
   - Garantiza que no haya duplicados en la base de datos

### Reglas de seguridad recomendadas:

```
service cloud.firestore {
  match /databases/{database}/documents {
    // ... reglas existentes ...
    
    // Proteger la colección de suscriptores
    match /subscribers/{subscriberId} {
      // Solo administradores pueden leer la lista de suscriptores
      allow read: if request.auth != null && 
                  request.auth.token.admin == true;
      
      // Cualquier usuario puede crear una suscripción
      allow create: if true;
      
      // Solo el mismo usuario o un administrador puede actualizar/eliminar
      allow update, delete: if request.auth != null && 
                            (request.auth.token.admin == true || 
                             resource.data.email == request.auth.token.email);
    }
  }
}
```

## Consideraciones:

1. Se debe implementar un sistema de verificación de correo electrónico para confirmar las suscripciones
2. Es importante mantener medidas de seguridad para proteger la información de contacto de los suscriptores
3. Se pueden agregar campos adicionales como `preferences` para personalizar el tipo de contenido que recibe cada suscriptor 