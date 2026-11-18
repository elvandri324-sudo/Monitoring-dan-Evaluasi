import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  AccompaniedGroup,
  ActivityAttendance,
  Beneficiary,
  ErrorReport,
  KnowledgeProduct,
  MediaCoverage,
  Project,
  ProjectLearning,
  ReportItem,
  StoryOfChange,
  UserAccount,
} from '../types';

export type CollectionName =
  | 'projects'
  | 'beneficiaries'
  | 'attendances'
  | 'accompaniedGroups'
  | 'knowledgeProducts'
  | 'storiesOfChange'
  | 'mediaCoverages'
  | 'learnings'
  | 'reports'
  | 'appUsers'
  | 'errorReports';

// Collections that use recordCreatedAt (preserving human string date) alongside Firestore server timestamps
const COLLECTIONS_WITH_RECORD_CREATED_AT = new Set<CollectionName>([
  'projects',
  'beneficiaries',
  'accompaniedGroups',
  'knowledgeProducts',
  'storiesOfChange',
  'mediaCoverages',
  'learnings',
  'reports',
  'appUsers',
  'errorReports',
]);

// Collections that support optional recordUpdatedAt string
const COLLECTIONS_WITH_RECORD_UPDATED_AT = new Set<CollectionName>([
  'accompaniedGroups',
  'knowledgeProducts',
  'storiesOfChange',
  'mediaCoverages',
  'learnings',
  'reports',
]);

// Track known Firestore documents so updates preserve immutable createdAt & ownerUid
const knownRemoteDocTimestamps = new Map<string, Timestamp>();

function getDocCacheKey(colName: CollectionName, docId: string): string {
  return `${colName}/${docId}`;
}

export function clearKnownRemoteDocs() {
  knownRemoteDocTimestamps.clear();
}

export function sanitizeFirestoreId(id: string): string {
  const cleaned = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '-');
  return (cleaned || `doc-${Date.now()}`).slice(0, 128);
}

function clampString(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.length > maxLen ? val.slice(0, maxLen) : val;
}

function stripUndefinedDeep<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object' && !(input instanceof Timestamp)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (value !== undefined) {
        out[key] = stripUndefinedDeep(value);
      }
    }
    return out as T;
  }
  return input;
}

/**
 * Defensive payload sanitizer matching firebase-blueprint.json & Firestore 1MB doc limit
 */
function prepareFirestorePayload(
  colName: CollectionName,
  rawItem: Record<string, unknown>,
  ownerUid: string
): Record<string, unknown> {
  const item = stripUndefinedDeep({ ...rawItem });
  const safeId = sanitizeFirestoreId(String(item.id || `doc-${Date.now()}`));
  item.id = safeId;
  item.ownerUid = ownerUid;

  // Map string dates to recordCreatedAt / recordUpdatedAt so Firestore createdAt/updatedAt remain strict server timestamps
  if (COLLECTIONS_WITH_RECORD_CREATED_AT.has(colName)) {
    const existingRecordCreated =
      typeof item.recordCreatedAt === 'string'
        ? item.recordCreatedAt
        : typeof item.createdAt === 'string'
        ? item.createdAt
        : new Date().toISOString().slice(0, 10);
    item.recordCreatedAt = clampString(existingRecordCreated, 40);
  }
  delete item.createdAt;

  if (COLLECTIONS_WITH_RECORD_UPDATED_AT.has(colName)) {
    if (typeof item.updatedAt === 'string') {
      item.recordUpdatedAt = clampString(item.updatedAt, 40);
    } else if (typeof item.recordUpdatedAt === 'string') {
      item.recordUpdatedAt = clampString(item.recordUpdatedAt, 40);
    }
  }
  delete item.updatedAt;

  // Enforce volumetric string limits per firebase-blueprint.json & firestore.rules
  if (typeof item.title === 'string') item.title = clampString(item.title, 300);
  if (typeof item.storyTitle === 'string') item.storyTitle = clampString(item.storyTitle, 300);
  if (typeof item.fullName === 'string') item.fullName = clampString(item.fullName, 200);
  if (typeof item.name === 'string') item.name = clampString(item.name, 200);
  if (typeof item.goalStatement === 'string') item.goalStatement = clampString(item.goalStatement, 2000);
  if (typeof item.description === 'string') {
    item.description = clampString(item.description, colName === 'knowledgeProducts' ? 3000 : 4000);
  }
  if (typeof item.notes === 'string') {
    item.notes = clampString(item.notes, colName === 'attendances' ? 1000 : 2000);
  }
  if (typeof item.summaryHighlights === 'string') item.summaryHighlights = clampString(item.summaryHighlights, 5000);
  if (typeof item.challengesAndMitigation === 'string') item.challengesAndMitigation = clampString(item.challengesAndMitigation, 4000);
  if (typeof item.highlightBefore === 'string') item.highlightBefore = clampString(item.highlightBefore, 4000);
  if (typeof item.highlightAfter === 'string') item.highlightAfter = clampString(item.highlightAfter, 4000);
  if (typeof item.noteFullStory === 'string') item.noteFullStory = clampString(item.noteFullStory, 4000);
  if (typeof item.importantQuotes === 'string') item.importantQuotes = clampString(item.importantQuotes, 2000);
  if (typeof item.keyLearning === 'string') item.keyLearning = clampString(item.keyLearning, 4000);
  if (typeof item.whatWeDidDifferently === 'string') item.whatWeDidDifferently = clampString(item.whatWeDidDifferently, 4000);
  if (typeof item.nextPhaseConduct === 'string') item.nextPhaseConduct = clampString(item.nextPhaseConduct, 4000);
  if (typeof item.internalCapacityAdvocacyComm === 'string') item.internalCapacityAdvocacyComm = clampString(item.internalCapacityAdvocacyComm, 4000);
  if (typeof item.stepsToReproduce === 'string') item.stepsToReproduce = clampString(item.stepsToReproduce, 3000);
  if (typeof item.resolutionNotes === 'string') item.resolutionNotes = clampString(item.resolutionNotes, 3000);
  if (typeof item.expectedBehavior === 'string') item.expectedBehavior = clampString(item.expectedBehavior, 2000);
  if (typeof item.actualBehavior === 'string') item.actualBehavior = clampString(item.actualBehavior, 2000);
  if (typeof item.summaryNotes === 'string') item.summaryNotes = clampString(item.summaryNotes, 2000);
  if (typeof item.reviewNotes === 'string') item.reviewNotes = clampString(item.reviewNotes, 2000);
  if (typeof item.fileName === 'string') item.fileName = clampString(item.fileName, 260);
  if (typeof item.fileUrl === 'string') item.fileUrl = clampString(item.fileUrl, 2000);
  if (typeof item.linkDocument === 'string') item.linkDocument = clampString(item.linkDocument, 2000);
  if (typeof item.linkToPublication === 'string') item.linkToPublication = clampString(item.linkToPublication, 2000);
  if (typeof item.fileData === 'string' && item.fileData.length > 480000) {
    delete item.fileData;
  }
  if (typeof item.avatarUrl === 'string' && item.avatarUrl.length > 480000) {
    item.avatarUrl = '';
  }
  if (typeof item.photoUrl === 'string' && item.photoUrl.length > 380000) {
    delete item.photoUrl;
  }
  if (typeof item.coverImageUrl === 'string' && item.coverImageUrl.length > 380000) {
    delete item.coverImageUrl;
  }
  if (typeof item.screenshotUrl === 'string' && item.screenshotUrl.length > 380000) {
    delete item.screenshotUrl;
  }

  // Guard total serialized project payload (e.g. inline base64 MoV attachments) below 1MB Firestore ceiling
  if (colName === 'projects') {
    const approxBytes = JSON.stringify(item).length;
    if (approxBytes > 820000) {
      const trimMovs = (docs: unknown) => {
        if (!Array.isArray(docs)) return docs;
        return docs.map((d) => {
          if (d && typeof d === 'object' && 'fileData' in d) {
            const clone = { ...(d as Record<string, unknown>) };
            if (typeof clone.fileData === 'string' && clone.fileData.length > 30000) {
              delete clone.fileData;
            }
            return clone;
          }
          return d;
        });
      };
      const trimIndicators = (inds: unknown) => {
        if (!Array.isArray(inds)) return inds;
        return inds.map((ind) => {
          if (!ind || typeof ind !== 'object') return ind;
          const clone = { ...(ind as Record<string, unknown>) };
          if (clone.movDocuments) clone.movDocuments = trimMovs(clone.movDocuments);
          if (Array.isArray(clone.progressHistory)) {
            clone.progressHistory = clone.progressHistory.map((h) => {
              if (!h || typeof h !== 'object') return h;
              const hClone = { ...(h as Record<string, unknown>) };
              if (hClone.movDocuments) hClone.movDocuments = trimMovs(hClone.movDocuments);
              return hClone;
            });
          }
          return clone;
        });
      };
      if (item.goalIndicators) item.goalIndicators = trimIndicators(item.goalIndicators);
      if (Array.isArray(item.outcomes)) {
        item.outcomes = item.outcomes.map((oc) => {
          if (!oc || typeof oc !== 'object') return oc;
          const ocClone = { ...(oc as Record<string, unknown>) };
          if (ocClone.indicators) ocClone.indicators = trimIndicators(ocClone.indicators);
          if (Array.isArray(ocClone.outputs)) {
            ocClone.outputs = ocClone.outputs.map((op) => {
              if (!op || typeof op !== 'object') return op;
              const opClone = { ...(op as Record<string, unknown>) };
              if (opClone.indicators) opClone.indicators = trimIndicators(opClone.indicators);
              if (Array.isArray(opClone.activities)) {
                opClone.activities = opClone.activities.map((act) => {
                  if (!act || typeof act !== 'object') return act;
                  const actClone = { ...(act as Record<string, unknown>) };
                  if (actClone.indicators) actClone.indicators = trimIndicators(actClone.indicators);
                  return actClone;
                });
              }
              return opClone;
            });
          }
          return ocClone;
        });
      }
    }
  }

  return item;
}

function mapFromFirestoreDoc<T>(colName: CollectionName, docId: string, data: Record<string, unknown>): T {
  const clone: Record<string, unknown> = { ...data };
  if (data.createdAt instanceof Timestamp) {
    knownRemoteDocTimestamps.set(getDocCacheKey(colName, docId), data.createdAt);
  }
  delete clone.ownerUid;

  if (COLLECTIONS_WITH_RECORD_CREATED_AT.has(colName)) {
    const recCreated = clone.recordCreatedAt;
    delete clone.recordCreatedAt;
    if (typeof recCreated === 'string') {
      clone.createdAt = recCreated;
    } else if (data.createdAt instanceof Timestamp) {
      clone.createdAt = data.createdAt.toDate().toISOString().slice(0, 10);
    } else {
      clone.createdAt = new Date().toISOString().slice(0, 10);
    }
  } else {
    delete clone.createdAt;
  }

  if (COLLECTIONS_WITH_RECORD_UPDATED_AT.has(colName)) {
    const recUpdated = clone.recordUpdatedAt;
    delete clone.recordUpdatedAt;
    if (typeof recUpdated === 'string') {
      clone.updatedAt = recUpdated;
    } else {
      delete clone.updatedAt;
    }
  } else {
    delete clone.updatedAt;
  }

  return clone as T;
}

export async function signInWithGoogleFirebase(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  clearKnownRemoteDocs();
  await signOut(auth);
}

export async function upsertDocToFirestore<T extends { id: string }>(
  colName: CollectionName,
  item: T
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const safeId = sanitizeFirestoreId(item.id);
  const path = `${colName}/${safeId}`;
  const docRef = doc(db, colName, safeId);
  const payload = prepareFirestorePayload(colName, item as unknown as Record<string, unknown>, user.uid);
  const cacheKey = getDocCacheKey(colName, safeId);

  try {
    if (knownRemoteDocTimestamps.has(cacheKey)) {
      await updateDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        const ts = existingSnap.data()?.createdAt;
        if (ts instanceof Timestamp) {
          knownRemoteDocTimestamps.set(cacheKey, ts);
        }
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDocFromFirestore(colName: CollectionName, id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const safeId = sanitizeFirestoreId(id);
  const path = `${colName}/${safeId}`;
  try {
    await deleteDoc(doc(db, colName, safeId));
    knownRemoteDocTimestamps.delete(getDocCacheKey(colName, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchUpsertToFirestore<T extends { id: string }>(
  colName: CollectionName,
  items: T[]
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || items.length === 0) return;

  const chunkSize = 300;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const safeId = sanitizeFirestoreId(item.id);
      const docRef = doc(db, colName, safeId);
      const payload = prepareFirestorePayload(colName, item as unknown as Record<string, unknown>, user.uid);
      const cacheKey = getDocCacheKey(colName, safeId);

      if (knownRemoteDocTimestamps.has(cacheKey)) {
        batch.update(docRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, colName);
    }
  }
}

export async function batchDeleteFromFirestore(colName: CollectionName, ids: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || ids.length === 0) return;

  const chunkSize = 350;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const id of chunk) {
      const safeId = sanitizeFirestoreId(id);
      batch.delete(doc(db, colName, safeId));
      knownRemoteDocTimestamps.delete(getDocCacheKey(colName, safeId));
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, colName);
    }
  }
}

export interface WorkspaceSeedData {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  accompaniedGroups: AccompaniedGroup[];
  knowledgeProducts: KnowledgeProduct[];
  storiesOfChange: StoryOfChange[];
  mediaCoverages: MediaCoverage[];
  learnings: ProjectLearning[];
  reports: ReportItem[];
  users: UserAccount[];
  errorReports: ErrorReport[];
}

export async function ensureWorkspaceSeeded(
  user: User,
  localData: WorkspaceSeedData
): Promise<boolean> {
  if (!user || !user.emailVerified) return false;

  const metaId = sanitizeFirestoreId(`ws-${user.uid}`);
  const metaRef = doc(db, 'workspaceMeta', metaId);

  try {
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists() && metaSnap.data()?.seeded === true) {
      return false; // Already seeded in cloud; remote snapshots are source of truth
    }

    // Check if projects already exist for this user
    const existingProjects = await getDocs(
      query(collection(db, 'projects'), where('ownerUid', '==', user.uid))
    );
    if (!existingProjects.empty) {
      await setDoc(metaRef, {
        id: metaId,
        ownerUid: user.uid,
        seeded: true,
        lastSyncedByEmail: clampString(user.email || '', 200),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return false;
    }

    // First-time cloud sync: seed all initial/local collections to Firestore
    const entries: Array<{ colName: CollectionName; items: Array<{ id: string }> }> = [
      { colName: 'projects', items: localData.projects },
      { colName: 'beneficiaries', items: localData.beneficiaries },
      { colName: 'attendances', items: localData.attendances },
      { colName: 'accompaniedGroups', items: localData.accompaniedGroups },
      { colName: 'knowledgeProducts', items: localData.knowledgeProducts },
      { colName: 'storiesOfChange', items: localData.storiesOfChange },
      { colName: 'mediaCoverages', items: localData.mediaCoverages },
      { colName: 'learnings', items: localData.learnings },
      { colName: 'reports', items: localData.reports },
      { colName: 'appUsers', items: localData.users },
      { colName: 'errorReports', items: localData.errorReports },
    ];

    const allOps: Array<{ colName: CollectionName; item: Record<string, unknown> }> = [];
    for (const entry of entries) {
      for (const item of entry.items) {
        allOps.push({
          colName: entry.colName,
          item: item as unknown as Record<string, unknown>,
        });
      }
    }

    const chunkSize = 300;
    for (let i = 0; i < allOps.length; i += chunkSize) {
      const chunk = allOps.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const op of chunk) {
        const safeId = sanitizeFirestoreId(String(op.item.id || `doc-${Date.now()}`));
        const ref = doc(db, op.colName, safeId);
        const payload = prepareFirestorePayload(op.colName, op.item, user.uid);
        batch.set(ref, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }

    await setDoc(metaRef, {
      id: metaId,
      ownerUid: user.uid,
      seeded: true,
      lastSyncedByEmail: clampString(user.email || '', 200),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `workspaceMeta/${metaId}`);
  }
}

export interface WorkspaceCallbacks {
  onProjects: (data: Project[]) => void;
  onBeneficiaries: (data: Beneficiary[]) => void;
  onAttendances: (data: ActivityAttendance[]) => void;
  onAccompaniedGroups: (data: AccompaniedGroup[]) => void;
  onKnowledgeProducts: (data: KnowledgeProduct[]) => void;
  onStoriesOfChange: (data: StoryOfChange[]) => void;
  onMediaCoverages: (data: MediaCoverage[]) => void;
  onLearnings: (data: ProjectLearning[]) => void;
  onReports: (data: ReportItem[]) => void;
  onUsers: (data: UserAccount[]) => void;
  onErrorReports: (data: ErrorReport[]) => void;
  onSyncUpdate?: () => void;
}

export function subscribeToWorkspace(
  user: User,
  callbacks: WorkspaceCallbacks
): Unsubscribe {
  if (!user || !user.emailVerified) {
    return () => {};
  }

  const unsubscribers: Unsubscribe[] = [];

  const listen = <T>(
    colName: CollectionName,
    setter: (items: T[]) => void
  ) => {
    const q = query(collection(db, colName), where('ownerUid', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) =>
          mapFromFirestoreDoc<T>(colName, d.id, d.data() as Record<string, unknown>)
        );
        setter(list);
        callbacks.onSyncUpdate?.();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, colName);
      }
    );
    unsubscribers.push(unsub);
  };

  listen<Project>('projects', callbacks.onProjects);
  listen<Beneficiary>('beneficiaries', callbacks.onBeneficiaries);
  listen<ActivityAttendance>('attendances', callbacks.onAttendances);
  listen<AccompaniedGroup>('accompaniedGroups', callbacks.onAccompaniedGroups);
  listen<KnowledgeProduct>('knowledgeProducts', callbacks.onKnowledgeProducts);
  listen<StoryOfChange>('storiesOfChange', callbacks.onStoriesOfChange);
  listen<MediaCoverage>('mediaCoverages', callbacks.onMediaCoverages);
  listen<ProjectLearning>('learnings', callbacks.onLearnings);
  listen<ReportItem>('reports', callbacks.onReports);
  listen<UserAccount>('appUsers', callbacks.onUsers);
  listen<ErrorReport>('errorReports', callbacks.onErrorReports);

  return () => {
    unsubscribers.forEach((u) => u());
  };
}
