import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import type {
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

export interface WorkspaceData {
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

export interface PublicPortalData {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  knowledgeProducts: KnowledgeProduct[];
  storiesOfChange: StoryOfChange[];
  mediaCoverages: MediaCoverage[];
  learnings: ProjectLearning[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Autentikasi belum aktif.');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function signInWithGoogleFirebase(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function fetchPublicPortal(): Promise<PublicPortalData> {
  const res = await fetch('/api/public-portal', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Gagal memuat data portal publik dari database.');
  }
  return res.json();
}

export async function fetchWorkspace(): Promise<WorkspaceData> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/workspace', {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Gagal memuat data workspace dari database.');
  }
  return res.json();
}

export async function connectAndFetchWorkspace(): Promise<{ user: User; workspace: WorkspaceData }> {
  const user = await signInWithGoogleFirebase();
  const token = await user.getIdToken();
  const res = await fetch('/api/workspace', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Gagal menyambung ke database Cloud SQL.');
  }
  const workspace = (await res.json()) as WorkspaceData;
  return { user, workspace };
}

export async function upsertRecordToCloud<T extends { id: string }>(
  colName: CollectionName,
  item: T
): Promise<void> {
  if (!auth.currentUser) return;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/collections/${encodeURIComponent(colName)}/${encodeURIComponent(item.id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error(`Failed saving ${colName}/${item.id}:`, errBody.error || res.statusText);
  }
}

export async function batchUpsertRecordsToCloud<T extends { id: string }>(
  colName: CollectionName,
  items: T[]
): Promise<void> {
  if (!auth.currentUser || items.length === 0) return;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/collections/${encodeURIComponent(colName)}/batch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error(`Failed batch saving ${colName}:`, errBody.error || res.statusText);
  }
}

export async function deleteRecordFromCloud(colName: CollectionName, id: string): Promise<void> {
  if (!auth.currentUser) return;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/collections/${encodeURIComponent(colName)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error(`Failed deleting ${colName}/${id}:`, errBody.error || res.statusText);
  }
}

export async function batchDeleteRecordsFromCloud(colName: CollectionName, ids: string[]): Promise<void> {
  if (!auth.currentUser || ids.length === 0) return;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/collections/${encodeURIComponent(colName)}/batch-delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error(`Failed batch deleting ${colName}:`, errBody.error || res.statusText);
  }
}

export async function restoreBackupToCloud(backupData: Partial<WorkspaceData>): Promise<WorkspaceData | null> {
  if (!auth.currentUser) return null;
  const headers = await getAuthHeaders();
  const res = await fetch('/api/workspace/restore', {
    method: 'POST',
    headers,
    body: JSON.stringify(backupData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error('Failed restoring backup:', errBody.error || res.statusText);
    return null;
  }
  return res.json();
}
