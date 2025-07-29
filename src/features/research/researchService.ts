import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import type { 
  ResearchLine, 
  ResearchProject, 
  ResearchPaper, 
  Researcher, 
  AcademicEvent,
  ResearchFilters 
} from './types';

// Collections
const RESEARCH_LINES_COLLECTION = 'research-lines';
const RESEARCH_PROJECTS_COLLECTION = 'research-projects';
const RESEARCH_PAPERS_COLLECTION = 'research-papers';
const RESEARCHERS_COLLECTION = 'researchers';
const ACADEMIC_EVENTS_COLLECTION = 'academic-events';

export class ResearchService {
  // Research Lines
  static async createResearchLine(researchLine: Omit<ResearchLine, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, RESEARCH_LINES_COLLECTION), {
      ...researchLine,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getResearchLines(): Promise<ResearchLine[]> {
    const querySnapshot = await getDocs(
      query(collection(db, RESEARCH_LINES_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchLine));
  }

  static async getActiveResearchLines(): Promise<ResearchLine[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, RESEARCH_LINES_COLLECTION), 
        where('isActive', '==', true),
        orderBy('name')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchLine));
  }

  static async getResearchLineById(id: string): Promise<ResearchLine | null> {
    const docRef = doc(db, RESEARCH_LINES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ResearchLine;
    }
    return null;
  }

  static async updateResearchLine(id: string, updates: Partial<ResearchLine>): Promise<void> {
    const docRef = doc(db, RESEARCH_LINES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteResearchLine(id: string): Promise<void> {
    const docRef = doc(db, RESEARCH_LINES_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Research Projects
  static async createResearchProject(project: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, RESEARCH_PROJECTS_COLLECTION), {
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getResearchProjects(filters?: ResearchFilters): Promise<ResearchProject[]> {
    let q = query(collection(db, RESEARCH_PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.researchLine) {
      q = query(q, where('researchLineId', '==', filters.researchLine));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchProject));
  }

  static async getActiveResearchProjects(): Promise<ResearchProject[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, RESEARCH_PROJECTS_COLLECTION), 
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchProject));
  }

  static async getResearchProjectById(id: string): Promise<ResearchProject | null> {
    const docRef = doc(db, RESEARCH_PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ResearchProject;
    }
    return null;
  }

  static async updateResearchProject(id: string, updates: Partial<ResearchProject>): Promise<void> {
    const docRef = doc(db, RESEARCH_PROJECTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteResearchProject(id: string): Promise<void> {
    const docRef = doc(db, RESEARCH_PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Research Papers
  static async createResearchPaper(paper: Omit<ResearchPaper, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, RESEARCH_PAPERS_COLLECTION), {
      ...paper,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getResearchPapers(filters?: ResearchFilters): Promise<ResearchPaper[]> {
    let q = query(collection(db, RESEARCH_PAPERS_COLLECTION), orderBy('publicationDate', 'desc'));

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchPaper));
  }

  static async getPublishedResearchPapers(): Promise<ResearchPaper[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, RESEARCH_PAPERS_COLLECTION), 
        where('isPublished', '==', true),
        orderBy('publicationDate', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchPaper));
  }

  static async getResearchPaperById(id: string): Promise<ResearchPaper | null> {
    const docRef = doc(db, RESEARCH_PAPERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ResearchPaper;
    }
    return null;
  }

  static async updateResearchPaper(id: string, updates: Partial<ResearchPaper>): Promise<void> {
    const docRef = doc(db, RESEARCH_PAPERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteResearchPaper(id: string): Promise<void> {
    const docRef = doc(db, RESEARCH_PAPERS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Researchers
  static async createResearcher(researcher: Omit<Researcher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, RESEARCHERS_COLLECTION), {
      ...researcher,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getResearchers(): Promise<Researcher[]> {
    const querySnapshot = await getDocs(
      query(collection(db, RESEARCHERS_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Researcher));
  }

  static async getActiveResearchers(): Promise<Researcher[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, RESEARCHERS_COLLECTION), 
        where('isActive', '==', true),
        orderBy('name')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Researcher));
  }

  static async getResearcherById(id: string): Promise<Researcher | null> {
    const docRef = doc(db, RESEARCHERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Researcher;
    }
    return null;
  }

  static async updateResearcher(id: string, updates: Partial<Researcher>): Promise<void> {
    const docRef = doc(db, RESEARCHERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteResearcher(id: string): Promise<void> {
    const docRef = doc(db, RESEARCHERS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Academic Events
  static async createAcademicEvent(event: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, ACADEMIC_EVENTS_COLLECTION), {
      ...event,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  static async getAcademicEvents(): Promise<AcademicEvent[]> {
    const querySnapshot = await getDocs(
      query(collection(db, ACADEMIC_EVENTS_COLLECTION), orderBy('date', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AcademicEvent));
  }

  static async getUpcomingAcademicEvents(): Promise<AcademicEvent[]> {
    const now = new Date();
    const querySnapshot = await getDocs(
      query(
        collection(db, ACADEMIC_EVENTS_COLLECTION), 
        where('date', '>=', now),
        where('isActive', '==', true),
        orderBy('date', 'asc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AcademicEvent));
  }

  static async getAcademicEventById(id: string): Promise<AcademicEvent | null> {
    const docRef = doc(db, ACADEMIC_EVENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AcademicEvent;
    }
    return null;
  }

  static async updateAcademicEvent(id: string, updates: Partial<AcademicEvent>): Promise<void> {
    const docRef = doc(db, ACADEMIC_EVENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteAcademicEvent(id: string): Promise<void> {
    const docRef = doc(db, ACADEMIC_EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  // Search and statistics
  static async searchResearchContent(searchTerm: string): Promise<{
    projects: ResearchProject[];
    papers: ResearchPaper[];
    researchers: Researcher[];
  }> {
    const term = searchTerm.toLowerCase();
    
    // Search projects
    const projectsQuery = query(collection(db, RESEARCH_PROJECTS_COLLECTION));
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ResearchProject))
      .filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      );

    // Search papers
    const papersQuery = query(collection(db, RESEARCH_PAPERS_COLLECTION));
    const papersSnapshot = await getDocs(papersQuery);
    const papers = papersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ResearchPaper))
      .filter(paper => 
        paper.title.toLowerCase().includes(term) ||
        paper.abstract.toLowerCase().includes(term) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );

    // Search researchers
    const researchersQuery = query(collection(db, RESEARCHERS_COLLECTION));
    const researchersSnapshot = await getDocs(researchersQuery);
    const researchers = researchersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Researcher))
      .filter(researcher => 
        researcher.name.toLowerCase().includes(term) ||
        researcher.bio.toLowerCase().includes(term) ||
        researcher.specialization.some(spec => spec.toLowerCase().includes(term))
      );

    return { projects, papers, researchers };
  }

  static async getResearchStatistics(): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalPapers: number;
    publishedPapers: number;
    totalResearchers: number;
    activeResearchers: number;
    upcomingEvents: number;
  }> {
    const [
      projectsSnapshot,
      activeProjectsSnapshot,
      papersSnapshot,
      publishedPapersSnapshot,
      researchersSnapshot,
      activeResearchersSnapshot,
      upcomingEventsSnapshot
    ] = await Promise.all([
      getDocs(collection(db, RESEARCH_PROJECTS_COLLECTION)),
      getDocs(query(collection(db, RESEARCH_PROJECTS_COLLECTION), where('status', '==', 'active'))),
      getDocs(collection(db, RESEARCH_PAPERS_COLLECTION)),
      getDocs(query(collection(db, RESEARCH_PAPERS_COLLECTION), where('isPublished', '==', true))),
      getDocs(collection(db, RESEARCHERS_COLLECTION)),
      getDocs(query(collection(db, RESEARCHERS_COLLECTION), where('isActive', '==', true))),
      getDocs(query(collection(db, ACADEMIC_EVENTS_COLLECTION), where('date', '>=', new Date()), where('isActive', '==', true)))
    ]);

    return {
      totalProjects: projectsSnapshot.size,
      activeProjects: activeProjectsSnapshot.size,
      totalPapers: papersSnapshot.size,
      publishedPapers: publishedPapersSnapshot.size,
      totalResearchers: researchersSnapshot.size,
      activeResearchers: activeResearchersSnapshot.size,
      upcomingEvents: upcomingEventsSnapshot.size
    };
  }
}