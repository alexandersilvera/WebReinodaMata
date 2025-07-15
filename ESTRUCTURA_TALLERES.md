# Estructura de Datos para Talleres

## Colección: `workshops`

### Estructura del documento:

```javascript
{
  // Información básica del taller
  title: "Introducción a la Umbanda",
  slug: "introduccion-umbanda", // Para URL amigable
  description: "Un taller introductorio sobre los fundamentos de la Umbanda, sus orígenes y prácticas principales.",
  
  // Fecha y hora
  date: Timestamp, // Fecha del taller
  time: "18:00 - 21:00", // Horario en string
  duration: "3 horas", // Duración estimada
  
  // Lugar
  location: "Centro Umbandista Reino Da Mata",
  address: "Dirección específica del lugar",
  virtualLink: null, // Para talleres virtuales
  
  // Organización
  instructor: "Nombre del instructor",
  instructorBio: "Breve biografía del instructor",
  
  // Detalles del taller
  requirements: "Ropa cómoda, libreta y lápiz",
  materials: "Todos los materiales serán proporcionados",
  maxParticipants: 20,
  currentParticipants: 0,
  
  // Precio
  price: "Gratuito", // o "R$ 50,00"
  paymentMethods: ["Efectivo", "Transferencia", "PIX"],
  
  // Estados
  active: true, // Si está disponible para inscripción
  published: true, // Si está visible públicamente
  featured: false, // Si es destacado
  
  // Control de emails
  invitationSent: false, // Si ya se envió la invitación automática
  invitationSentAt: null, // Timestamp cuando se envió
  invitationStats: {
    totalSent: 0,
    totalFailed: 0,
    totalRecipients: 0
  },
  
  // Metadatos
  category: "Introducción", // Categorías: Introducción, Avanzado, Práctico, Teórico
  tags: ["umbanda", "fundamentos", "principiantes"],
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user_id", // UID del admin que creó
  
  // Adicionales
  images: ["url1", "url2"], // URLs de imágenes
  attachments: ["url_programa.pdf"], // Archivos adjuntos
  
  // Inscripciones
  registrationOpen: true,
  registrationDeadline: Timestamp,
  
  // Información adicional
  notes: "Notas internas para organizadores",
  publicNotes: "Notas visibles para participantes"
}
```

## Colección: `workshop_registrations`

### Estructura del documento:

```javascript
{
  workshopId: "workshop_document_id",
  workshopTitle: "Nombre del taller",
  
  // Información del participante
  userId: "user_id", // Si está registrado
  email: "participante@email.com",
  name: "Nombre Completo",
  phone: "+55 11 99999-9999",
  
  // Datos de inscripción
  registeredAt: Timestamp,
  status: "confirmed", // confirmed, pending, cancelled
  
  // Información adicional
  notes: "Notas del participante",
  specialRequirements: "Necesidades especiales",
  
  // Confirmación
  confirmed: true,
  confirmedAt: Timestamp,
  
  // Pago (si aplica)
  paymentRequired: false,
  paymentStatus: "paid", // paid, pending, free
  paymentMethod: "pix",
  
  // Asistencia
  attended: null, // Se marca después del evento
  attendedAt: null,
  
  // Comunicaciones
  reminderSent: false,
  reminderSentAt: null
}
```

## Ejemplos de documentos:

### Ejemplo 1: Taller básico gratuito

```javascript
{
  title: "Fundamentos de la Umbanda",
  slug: "fundamentos-umbanda",
  description: "Aprende los conceptos básicos de la Umbanda, sus orígenes africanos y la práctica moderna.",
  date: new Date("2025-08-15T18:00:00Z"),
  time: "18:00 - 21:00",
  duration: "3 horas",
  location: "Centro Umbandista Reino Da Mata",
  address: "Calle Principal 123, São Paulo",
  instructor: "Pai João da Silva",
  instructorBio: "Babalorixá con 25 años de experiencia",
  requirements: "Ropa blanca, cuaderno y lápiz",
  maxParticipants: 15,
  currentParticipants: 0,
  price: "Gratuito",
  active: true,
  published: true,
  featured: true,
  invitationSent: false,
  category: "Introducción",
  tags: ["umbanda", "principiantes", "fundamentos"],
  createdAt: new Date(),
  updatedAt: new Date(),
  registrationOpen: true,
  registrationDeadline: new Date("2025-08-13T23:59:59Z")
}
```

### Ejemplo 2: Taller avanzado con costo

```javascript
{
  title: "Desarrollo Mediúmnico Avanzado",
  slug: "desarrollo-mediumnico-avanzado",
  description: "Taller intensivo para médiums con experiencia que buscan profundizar su desarrollo espiritual.",
  date: new Date("2025-09-20T14:00:00Z"),
  time: "14:00 - 18:00",
  duration: "4 horas",
  location: "Centro Umbandista Reino Da Mata",
  instructor: "Mãe Maria das Flores",
  instructorBio: "Ialorixá y medium con 30 años de experiencia",
  requirements: "Experiencia previa en trabajos mediúmnicos, ropa blanca",
  materials: "Velas, inciensos y cristales (incluidos)",
  maxParticipants: 10,
  currentParticipants: 0,
  price: "R$ 80,00",
  paymentMethods: ["PIX", "Transferencia", "Efectivo"],
  active: true,
  published: true,
  featured: false,
  invitationSent: false,
  category: "Avanzado",
  tags: ["mediumismo", "desarrollo", "avanzado"],
  createdAt: new Date(),
  updatedAt: new Date(),
  registrationOpen: true,
  registrationDeadline: new Date("2025-09-18T23:59:59Z"),
  notes: "Verificar experiencia previa de participantes",
  publicNotes: "Se requiere experiencia previa en trabajos mediúmnicos"
}
```

## Funcionamiento del sistema automático:

1. **Creación del taller**: Admin crea documento en colección `workshops`
2. **Trigger automático**: Se ejecuta `sendWorkshopInvitation` cuando se crea el documento
3. **Validación**: Verifica que `active: true` e `invitationSent: false`
4. **Envío de emails**: Se envían invitaciones a todos los suscriptores activos
5. **Actualización**: Se marca `invitationSent: true` y se guardan estadísticas

## Campos requeridos mínimos:

- `title`: Título del taller
- `date`: Fecha del evento
- `active`: true para activar el envío automático
- `invitationSent`: false para permitir envío

## Campos opcionales que mejoran el email:

- `description`: Mejora el contenido del email
- `time`: Especifica horario
- `location`: Ubicación del taller
- `price`: Costo o "Gratuito"
- `requirements`: Qué debe llevar el participante
- `slug`: Para URL personalizada