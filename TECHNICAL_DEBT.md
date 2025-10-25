# 🔧 Technical Debt & Mejoras Técnicas

## 📊 Análisis del Estado Actual

### **Salud del Proyecto**: 7/10 ⭐
- ✅ **Fortalezas**: Arquitectura feature-based, TypeScript, Firebase bien integrado
- ⚠️ **Áreas de mejora**: Testing, Performance, Code duplication
- ❌ **Deuda técnica**: Algunas páginas muy largas, falta documentación

---

## 🚨 Technical Debt Identificado

### **🔴 CRÍTICO - Arreglar ASAP**

#### **TD-1: Páginas Admin muy largas**
**Archivos afectados**:
- `src/pages/admin/articles.astro` (840+ líneas)
- `src/pages/admin/articles/edit/[id].astro` (1000+ líneas)
- `src/pages/admin/articles/new.astro` (1200+ líneas)

**Problema**:
- Difícil de mantener
- Lógica mezclada con presentación
- Hard to test

**Solución propuesta**:
```
Refactorizar en:
1. Componentes React separados
2. Custom hooks para lógica
3. Services para data fetching

Estructura sugerida:
src/features/blog/
├── components/
│   ├── ArticleEditor/
│   │   ├── index.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Preview.tsx
│   │   └── AutoSave.tsx
│   └── ArticleList/
│       ├── index.tsx
│       ├── ArticleCard.tsx
│       └── Filters.tsx
├── hooks/
│   ├── useArticleEditor.ts
│   ├── useArticleList.ts
│   └── useAutoSave.ts
└── services/
    └── articleService.ts ✅ (ya existe)
```

**Esfuerzo**: 3-4 días
**Beneficio**: Mantenibilidad++, Testability++

---

#### **TD-2: Falta de Error Boundaries**
**Problema**:
- Si un componente React falla, puede romper toda la página
- No hay manejo graceful de errores

**Solución**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Algo salió mal</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Uso**:
```astro
---
import ErrorBoundary from '@/components/ErrorBoundary';
---
<ErrorBoundary>
  <ComponenteRiesgoso client:load />
</ErrorBoundary>
```

**Esfuerzo**: 0.5 día
**Beneficio**: Stability++

---

#### **TD-3: No hay Loading States consistentes**
**Problema**:
- Cada página implementa loading diferente
- No hay skeleton loaders
- Experiencia inconsistente

**Solución**:
```typescript
// src/components/Loading/Skeleton.tsx
export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-700 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

// src/hooks/useAsyncData.ts
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchFn()
      .then(result => {
        if (!cancelled) setData(result);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
}
```

**Esfuerzo**: 1 día
**Beneficio**: UX++

---

### **🟡 MEDIO - Mejorar pronto**

#### **TD-4: Duplicación de código en servicios**
**Archivos afectados**:
- `src/services/articleService.ts`
- `src/features/events/services/eventService.ts`
- `src/features/subscriptions/services/subscriptionService.ts`

**Problema**:
- Patrón CRUD repetido
- Error handling duplicado

**Solución**:
```typescript
// src/core/firebase/baseService.ts
export abstract class BaseFirestoreService<T> {
  constructor(protected collectionName: string) {}

  async getAll(): Promise<T[]> {
    const ref = collection(db, this.collectionName);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async getById(id: string): Promise<T | null> {
    const ref = doc(db, this.collectionName, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    const ref = collection(db, this.collectionName);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // ... update, delete
}

// Uso:
class ArticleService extends BaseFirestoreService<Article> {
  constructor() {
    super('articles');
  }

  // Métodos específicos de artículos
  async getBySlug(slug: string) {
    // Implementación específica
  }
}
```

**Esfuerzo**: 2 días
**Beneficio**: DRY++, Maintainability++

---

#### **TD-5: No hay validación de formularios centralizada**
**Problema**:
- Cada formulario valida diferente
- Mensajes de error inconsistentes

**Solución**:
```bash
npm install react-hook-form zod @hookform/resolvers
```

```typescript
// src/schemas/articleSchema.ts
import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido'),
  content: z.string().min(100, 'Contenido muy corto'),
  tags: z.array(z.string()).min(1, 'Agregar al menos 1 tag'),
  image: z.string().url('URL de imagen inválida'),
});

// En componente:
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(articleSchema)
});
```

**Esfuerzo**: 1 día
**Beneficio**: UX++, Type safety++

---

#### **TD-6: Performance - Bundle size grande**
**Problema**:
- Bundle size no optimizado
- Componentes React cargados en cada página

**Solución**:
```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'admin': [
              './src/features/admin',
              './src/features/blog',
            ],
          },
        },
      },
    },
  },
});
```

**Análisis actual**:
```bash
npm run build
npx vite-bundle-visualizer
```

**Objetivo**: Reducir bundle inicial en 30%

**Esfuerzo**: 1 día
**Beneficio**: Performance++

---

### **🟢 BAJO - Mejorar eventualmente**

#### **TD-7: Falta documentación de componentes**
**Problema**:
- No hay JSDoc
- Props no documentadas
- Difícil onboarding

**Solución**:
```typescript
/**
 * Card para mostrar un artículo del blog
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del artículo
 * @param {string} props.image - URL de imagen destacada
 * @param {string[]} props.tags - Tags del artículo
 * @param {() => void} props.onClick - Handler al hacer clic
 *
 * @example
 * <ArticleCard
 *   title="Mi artículo"
 *   image="/image.jpg"
 *   tags={['umbanda', 'espiritualidad']}
 *   onClick={() => navigate('/blog/mi-articulo')}
 * />
 */
export function ArticleCard({ title, image, tags, onClick }: ArticleCardProps) {
  // ...
}
```

**Herramienta**: TSDoc, Storybook (opcional)

**Esfuerzo**: Ongoing (10min por componente)
**Beneficio**: Developer experience++

---

#### **TD-8: Inconsistencia en nombres de variables**
**Problema**:
```typescript
// A veces camelCase, a veces snake_case
const userEmail = user.email;
const user_name = user.displayName;

// A veces español, a veces inglés
const artículos = [];
const articles = [];
```

**Solución**:
- **Convención**: camelCase para variables, PascalCase para componentes
- **Idioma**: Inglés para código, español para UI
- **ESLint rule**: `naming-convention`

**Esfuerzo**: 1 día (buscar y reemplazar + configurar lint)
**Beneficio**: Consistency++

---

#### **TD-9: No hay tests**
**Problema**:
- 0% test coverage
- Refactors riesgosos
- Regressions no detectadas

**Solución**:
```bash
# Ya tienes Vitest instalado ✅
npm run test
```

**Empezar con**:
1. **Unit tests de servicios** (más fácil)
```typescript
// src/services/__tests__/articleService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createArticle } from '../articleService';

vi.mock('@/core/firebase/config', () => ({
  db: mockFirestore
}));

describe('ArticleService', () => {
  it('should create an article', async () => {
    const articleData = {
      title: 'Test',
      slug: 'test',
      content: 'Content',
      // ...
    };

    const id = await createArticle(articleData);
    expect(id).toBeDefined();
  });
});
```

2. **Component tests** (medio)
```typescript
// src/components/__tests__/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import Hero from '../Hero';

it('renders hero title', () => {
  render(<Hero title="Welcome" />);
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

3. **E2E tests** (avanzado - después)

**Objetivo**: 60% coverage en 1 mes

**Esfuerzo**: Ongoing
**Beneficio**: Confidence++, Maintainability++

---

## 📊 Priorización de Tech Debt

### **Esta Semana**
1. ✅ TD-2: Error Boundaries (0.5 día)
2. ✅ TD-3: Loading States (1 día)

### **Próximas 2 Semanas**
1. TD-5: Validación de formularios (1 día)
2. TD-6: Bundle optimization (1 día)
3. TD-9: Empezar tests de servicios (ongoing)

### **Mes 1-2**
1. TD-1: Refactorizar páginas admin (3-4 días)
2. TD-4: BaseService pattern (2 días)
3. TD-8: Naming consistency (1 día)

### **Backlog**
1. TD-7: Documentación (ongoing)
2. Tests completos (ongoing)

---

## 🛠️ Mejoras de Arquitectura

### **Propuesta 1: Design System**
**Problema**: Componentes inconsistentes

**Solución**:
```
src/design-system/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.test.tsx
│   ├── Input/
│   ├── Card/
│   └── Modal/
├── tokens/
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
└── index.ts
```

**Beneficio**: Consistency++, Reusability++

---

### **Propuesta 2: State Management**
**Problema**: Prop drilling, estado global no estructurado

**Opciones**:
1. **Zustand** (recomendado - ligero)
```typescript
// src/stores/userStore.ts
import create from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

2. **React Context + useReducer** (ya lo tienes, mejorar)
3. **Redux Toolkit** (overkill para este proyecto)

**Recomendación**: Zustand para estado global simple

---

### **Propuesta 3: API Layer**
**Problema**: Llamadas a Firebase dispersas por componentes

**Solución**:
```typescript
// src/api/client.ts
class APIClient {
  async get<T>(endpoint: string): Promise<T> {
    // Wrapper con error handling, retry, cache
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    // ...
  }
}

export const api = new APIClient();

// En componente:
const articles = await api.get<Article[]>('/articles');
```

**Beneficio**: Testability++, Error handling centralizado

---

## 📋 Checklist de Mejoras Técnicas

### **Corto Plazo (1-2 semanas)**
- [ ] Error boundaries en componentes críticos
- [ ] Loading states consistentes
- [ ] Validación con react-hook-form + zod
- [ ] Bundle size analysis y optimization

### **Medio Plazo (1 mes)**
- [ ] Refactorizar admin/articles páginas
- [ ] BaseService pattern
- [ ] Tests de servicios (60% coverage)
- [ ] Naming consistency

### **Largo Plazo (2-3 meses)**
- [ ] Design system completo
- [ ] State management (Zustand)
- [ ] E2E tests (Playwright)
- [ ] API Layer abstraction
- [ ] Documentación completa

---

## 🎯 Métricas de Calidad

### **Objetivos**
- [ ] Lighthouse Performance: 90+
- [ ] Test Coverage: 60%+
- [ ] TypeScript strict mode: Enabled
- [ ] ESLint errors: 0
- [ ] Bundle size: < 500KB (initial)
- [ ] Build time: < 30s

### **Tracking**
```bash
# Añadir a package.json
"scripts": {
  "quality:check": "npm run lint && npm run test && npm run build",
  "quality:report": "lighthouse https://localhost:4321 --output=html"
}
```

---

## 💡 Recursos

### **Tools**
- [Vite Bundle Visualizer](https://www.npmjs.com/package/vite-bundle-visualizer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [SonarQube](https://www.sonarqube.org/) (code quality)

### **Learning**
- [Refactoring Guru](https://refactoring.guru/) - Patrones
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Testing Library Docs](https://testing-library.com/)

---

**Última actualización**: 2025-10-25
**Prioridad review**: Cada sprint
