import { eq, inArray } from 'drizzle-orm';
import { db } from './index.ts';
import {
  accompaniedGroups,
  appUsers,
  attendances,
  beneficiaries,
  errorReports,
  knowledgeProducts,
  learnings,
  mediaCoverages,
  projects,
  reports,
  storiesOfChange,
  workspaceMeta,
} from './schema.ts';
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
} from '../types.ts';
import { INITIAL_PROJECTS, INITIAL_BENEFICIARIES, INITIAL_ATTENDANCES } from '../data/initialData.ts';
import { INITIAL_ACCOMPANIED_GROUPS } from '../data/groupData.ts';
import { INITIAL_KNOWLEDGE_PRODUCTS, INITIAL_STORIES_OF_CHANGE, INITIAL_MEDIA_COVERAGES } from '../data/publicationData.ts';
import { INITIAL_PROJECT_LEARNINGS } from '../data/learningData.ts';
import { INITIAL_REPORTS } from '../data/reportData.ts';
import { INITIAL_USERS } from '../data/userData.ts';
import { INITIAL_ERROR_REPORTS } from '../data/errorData.ts';

export type CloudCollectionName =
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

export interface WorkspacePayload {
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

export interface PublicPortalPayload {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  knowledgeProducts: KnowledgeProduct[];
  storiesOfChange: StoryOfChange[];
  mediaCoverages: MediaCoverage[];
  learnings: ProjectLearning[];
}

function stripNullFields<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== null && v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

function sanitizeMovDocs(docs: unknown) {
  if (!Array.isArray(docs)) return [];
  return docs.map((d) => {
    if (!d || typeof d !== 'object') return d;
    const clone = { ...(d as Record<string, unknown>) };
    delete clone.fileData;
    return clone;
  });
}

function sanitizeIndicators(inds: unknown) {
  if (!Array.isArray(inds)) return [];
  return inds.map((ind) => {
    if (!ind || typeof ind !== 'object') return ind;
    const clone = { ...(ind as Record<string, unknown>) };
    if (clone.movDocuments) clone.movDocuments = sanitizeMovDocs(clone.movDocuments);
    if (Array.isArray(clone.progressHistory)) {
      clone.progressHistory = clone.progressHistory.map((h) => {
        if (!h || typeof h !== 'object') return h;
        const hClone = { ...(h as Record<string, unknown>) };
        if (hClone.movDocuments) hClone.movDocuments = sanitizeMovDocs(hClone.movDocuments);
        return hClone;
      });
    }
    return clone;
  });
}

let seedPromise: Promise<void> | null = null;

export async function ensureDatabaseSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const existingMeta = await db
        .select()
        .from(workspaceMeta)
        .where(eq(workspaceMeta.key, 'default'))
        .limit(1);

      if (existingMeta.length > 0 && existingMeta[0].seeded) {
        return;
      }

      const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
      if (existingProjects.length > 0) {
        await db
          .insert(workspaceMeta)
          .values({
            key: 'default',
            seeded: true,
            seededAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: workspaceMeta.key,
            set: { seeded: true },
          });
        return;
      }

      await batchUpsertRecords('projects', INITIAL_PROJECTS);
      await batchUpsertRecords('beneficiaries', INITIAL_BENEFICIARIES);
      await batchUpsertRecords('attendances', INITIAL_ATTENDANCES);
      await batchUpsertRecords('accompaniedGroups', INITIAL_ACCOMPANIED_GROUPS);
      await batchUpsertRecords('knowledgeProducts', INITIAL_KNOWLEDGE_PRODUCTS);
      await batchUpsertRecords('storiesOfChange', INITIAL_STORIES_OF_CHANGE);
      await batchUpsertRecords('mediaCoverages', INITIAL_MEDIA_COVERAGES);
      await batchUpsertRecords('learnings', INITIAL_PROJECT_LEARNINGS);
      await batchUpsertRecords('reports', INITIAL_REPORTS);
      await batchUpsertRecords('appUsers', INITIAL_USERS);
      await batchUpsertRecords('errorReports', INITIAL_ERROR_REPORTS);

      await db
        .insert(workspaceMeta)
        .values({
          key: 'default',
          seeded: true,
          seededAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: workspaceMeta.key,
          set: { seeded: true, seededAt: new Date().toISOString() },
        });
    } catch (error) {
      seedPromise = null;
      console.error('Database seed failed:', error);
      throw new Error('Failed to initialize workspace database.', { cause: error });
    }
  })();

  return seedPromise;
}

export async function getFullWorkspaceData(): Promise<WorkspacePayload> {
  try {
    await ensureDatabaseSeeded();

    const [
      projectRows,
      beneficiaryRows,
      attendanceRows,
      groupRows,
      productRows,
      storyRows,
      mediaRows,
      learningRows,
      reportRows,
      userRows,
      errorRows,
    ] = await Promise.all([
      db.select().from(projects),
      db.select().from(beneficiaries),
      db.select().from(attendances),
      db.select().from(accompaniedGroups),
      db.select().from(knowledgeProducts),
      db.select().from(storiesOfChange),
      db.select().from(mediaCoverages),
      db.select().from(learnings),
      db.select().from(reports),
      db.select().from(appUsers),
      db.select().from(errorReports),
    ]);

    return {
      projects: projectRows.map((r) => stripNullFields(r) as unknown as Project),
      beneficiaries: beneficiaryRows.map((r) => stripNullFields(r) as unknown as Beneficiary),
      attendances: attendanceRows.map((r) => stripNullFields(r) as unknown as ActivityAttendance),
      accompaniedGroups: groupRows.map((r) => stripNullFields(r) as unknown as AccompaniedGroup),
      knowledgeProducts: productRows.map((r) => stripNullFields(r) as unknown as KnowledgeProduct),
      storiesOfChange: storyRows.map((r) => stripNullFields(r) as unknown as StoryOfChange),
      mediaCoverages: mediaRows.map((r) => stripNullFields(r) as unknown as MediaCoverage),
      learnings: learningRows.map((r) => stripNullFields(r) as unknown as ProjectLearning),
      reports: reportRows.map((r) => stripNullFields(r) as unknown as ReportItem),
      users: userRows.map((r) => stripNullFields(r) as unknown as UserAccount),
      errorReports: errorRows.map((r) => stripNullFields(r) as unknown as ErrorReport),
    };
  } catch (error) {
    console.error('Database query failed in getFullWorkspaceData:', error);
    throw new Error('Failed to load workspace data from database.', { cause: error });
  }
}

export async function getPublicPortalData(): Promise<PublicPortalPayload> {
  try {
    await ensureDatabaseSeeded();

    const [
      projectRows,
      beneficiaryRows,
      attendanceRows,
      productRows,
      storyRows,
      mediaRows,
      learningRows,
    ] = await Promise.all([
      db.select().from(projects),
      db.select().from(beneficiaries),
      db.select().from(attendances),
      db.select().from(knowledgeProducts),
      db.select().from(storiesOfChange),
      db.select().from(mediaCoverages),
      db.select().from(learnings),
    ]);

    // Strip PII and private blobs before serving public portal statistics
    const safeProjects = projectRows.map((row) => {
      const p = stripNullFields(row) as unknown as Project;
      return {
        ...p,
        goalIndicators: sanitizeIndicators(p.goalIndicators) as Project['goalIndicators'],
        outcomes: (p.outcomes || []).map((oc) => ({
          ...oc,
          indicators: sanitizeIndicators(oc.indicators) as Project['goalIndicators'],
          outputs: (oc.outputs || []).map((op) => ({
            ...op,
            indicators: sanitizeIndicators(op.indicators) as Project['goalIndicators'],
            activities: (op.activities || []).map((act) => ({
              ...act,
              indicators: sanitizeIndicators(act.indicators) as Project['goalIndicators'],
            })),
          })),
        })),
        teamMembers: (p.teamMembers || []).map((tm) => ({
          id: tm.id,
          name: tm.name,
          role: tm.role,
          email: '',
          phone: '',
          ...(tm.assignedOutcomes ? { assignedOutcomes: tm.assignedOutcomes } : {}),
        })),
      };
    });

    const safeBeneficiaries: Beneficiary[] = beneficiaryRows.map((row) => {
      const b = stripNullFields(row) as unknown as Beneficiary;
      return {
        id: b.id,
        nikOrIdentifier: '-',
        fullName: 'Anonim',
        gender: b.gender,
        birthYear: b.birthYear,
        age: b.age,
        ageGroup: b.ageGroup,
        hasDisability: b.hasDisability,
        ...(b.disabilityType ? { disabilityType: b.disabilityType } : {}),
        ...(b.disabilityDifficultyLevel ? { disabilityDifficultyLevel: b.disabilityDifficultyLevel } : {}),
        iplcStatus: b.iplcStatus,
        ...(b.customIplcCommunityName ? { customIplcCommunityName: b.customIplcCommunityName } : {}),
        ...(b.targetGroup ? { targetGroup: b.targetGroup } : {}),
        ...(b.beneficiaryLevel ? { beneficiaryLevel: b.beneficiaryLevel } : {}),
        ...(b.levelName ? { levelName: b.levelName } : {}),
        ...(b.institutionOrAgency ? { institutionOrAgency: b.institutionOrAgency } : {}),
        province: b.province,
        regency: b.regency,
        ...(b.district ? { district: b.district } : {}),
        village: b.village,
        ...(b.registeredProjectId ? { registeredProjectId: b.registeredProjectId } : {}),
        createdAt: b.createdAt || '',
      };
    });

    const safeAttendances: ActivityAttendance[] = attendanceRows.map((a) => ({
      id: a.id,
      activityId: a.activityId,
      projectId: a.projectId,
      beneficiaryId: a.beneficiaryId,
      attendanceDate: a.attendanceDate,
      attendanceStatus: a.attendanceStatus as ActivityAttendance['attendanceStatus'],
    }));

    return {
      projects: safeProjects,
      beneficiaries: safeBeneficiaries,
      attendances: safeAttendances,
      knowledgeProducts: productRows.map((r) => stripNullFields(r) as unknown as KnowledgeProduct),
      storiesOfChange: storyRows.map((r) => stripNullFields(r) as unknown as StoryOfChange),
      mediaCoverages: mediaRows.map((r) => stripNullFields(r) as unknown as MediaCoverage),
      learnings: learningRows.map((r) => stripNullFields(r) as unknown as ProjectLearning),
    };
  } catch (error) {
    console.error('Database query failed in getPublicPortalData:', error);
    throw new Error('Failed to load public portal statistics.', { cause: error });
  }
}

export async function upsertRecord(
  colName: CloudCollectionName,
  item: Record<string, unknown>
): Promise<void> {
  await batchUpsertRecords(colName, [item]);
}

export async function batchUpsertRecords(
  colName: CloudCollectionName,
  items: unknown[]
): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return;

  try {
    for (const raw of items) {
      const item = raw as Record<string, unknown>;
      switch (colName) {
        case 'projects': {
          const p = item as unknown as Project;
          const values = {
            id: p.id,
            code: p.code,
            title: p.title,
            donor: p.donor || '',
            partnerOrg: p.partnerOrg || '',
            budgetTotal: Number(p.budgetTotal) || 0,
            budgetCurrency: p.budgetCurrency || 'IDR',
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            status: p.status || 'Aktif',
            province: p.province || '',
            targetLocations: p.targetLocations || [],
            targetVillages: p.targetVillages ?? null,
            goalStatement: p.goalStatement || '',
            goalIndicators: (p.goalIndicators || []) as unknown[],
            outcomes: (p.outcomes || []) as unknown[],
            teamMembers: (p.teamMembers || []) as unknown[],
            createdAt: p.createdAt || new Date().toISOString().slice(0, 10),
          };
          await db.insert(projects).values(values).onConflictDoUpdate({ target: projects.id, set: values });
          break;
        }
        case 'beneficiaries': {
          const b = item as unknown as Beneficiary;
          const values = {
            id: b.id,
            nikOrIdentifier: b.nikOrIdentifier || '',
            fullName: b.fullName,
            gender: b.gender,
            birthYear: Number(b.birthYear) || 1990,
            age: Number(b.age) || 30,
            ageGroup: b.ageGroup || '25-40',
            hasDisability: Boolean(b.hasDisability),
            disabilityType: b.disabilityType ?? null,
            disabilityDifficultyLevel: b.disabilityDifficultyLevel ?? null,
            disabilityBarrierNotes: b.disabilityBarrierNotes ?? null,
            iplcStatus: b.iplcStatus,
            customIplcCommunityName: b.customIplcCommunityName ?? null,
            targetGroup: b.targetGroup ?? null,
            beneficiaryLevel: b.beneficiaryLevel ?? null,
            levelName: b.levelName ?? null,
            institutionOrAgency: b.institutionOrAgency ?? null,
            province: b.province || '',
            regency: b.regency || '',
            district: b.district ?? null,
            village: b.village || '',
            phone: b.phone ?? null,
            occupation: b.occupation ?? null,
            registeredProjectId: b.registeredProjectId ?? null,
            createdAt: b.createdAt || new Date().toISOString().slice(0, 10),
          };
          await db.insert(beneficiaries).values(values).onConflictDoUpdate({ target: beneficiaries.id, set: values });
          break;
        }
        case 'attendances': {
          const a = item as unknown as ActivityAttendance;
          const values = {
            id: a.id,
            activityId: a.activityId,
            projectId: a.projectId,
            beneficiaryId: a.beneficiaryId,
            attendanceDate: a.attendanceDate,
            roleInActivity: a.roleInActivity ?? null,
            attendanceStatus: a.attendanceStatus || 'Hadir Penuh',
            notes: a.notes ?? null,
            verifiedBy: a.verifiedBy ?? null,
          };
          await db.insert(attendances).values(values).onConflictDoUpdate({ target: attendances.id, set: values });
          break;
        }
        case 'accompaniedGroups': {
          const g = item as unknown as AccompaniedGroup;
          const values = {
            id: g.id,
            projectId: g.projectId,
            code: g.code,
            name: g.name,
            type: g.type,
            customType: g.customType ?? null,
            village: g.village || '',
            district: g.district ?? null,
            regency: g.regency || '',
            province: g.province || '',
            establishmentDate: g.establishmentDate ?? null,
            legalStatus: g.legalStatus ?? null,
            legalDocumentNumber: g.legalDocumentNumber ?? null,
            leaderName: g.leaderName ?? null,
            leaderPhone: g.leaderPhone ?? null,
            focusArea: g.focusArea ?? null,
            status: g.status || 'Aktif',
            notes: g.notes ?? null,
            members: (g.members || []) as unknown[],
            createdAt: g.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: g.updatedAt ?? null,
          };
          await db.insert(accompaniedGroups).values(values).onConflictDoUpdate({ target: accompaniedGroups.id, set: values });
          break;
        }
        case 'knowledgeProducts': {
          const k = item as unknown as KnowledgeProduct;
          const values = {
            id: k.id,
            projectId: k.projectId ?? null,
            type: k.type,
            title: k.title,
            description: k.description || '',
            language: k.language || 'Indonesia',
            publisherAuthor: k.publisherAuthor || '',
            contributeToOutputOutcome: k.contributeToOutputOutcome || '',
            linkDocument: k.linkDocument || '',
            fileFormat: k.fileFormat ?? null,
            fileSize: k.fileSize ?? null,
            releaseDate: k.releaseDate ?? null,
            coverImageUrl: k.coverImageUrl ?? null,
            createdAt: k.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: k.updatedAt ?? null,
          };
          await db.insert(knowledgeProducts).values(values).onConflictDoUpdate({ target: knowledgeProducts.id, set: values });
          break;
        }
        case 'storiesOfChange': {
          const s = item as unknown as StoryOfChange;
          const values = {
            id: s.id,
            projectId: s.projectId ?? null,
            storyTitle: s.storyTitle,
            storiesLocation: s.storiesLocation || '',
            whoHasChanged: s.whoHasChanged || '',
            beneficiaryId: s.beneficiaryId ?? null,
            highlightBefore: s.highlightBefore || '',
            highlightAfter: s.highlightAfter || '',
            importantQuotes: s.importantQuotes || '',
            noteFullStory: s.noteFullStory || '',
            categoryTheme: s.categoryTheme ?? null,
            photoUrl: s.photoUrl ?? null,
            authorOrWriter: s.authorOrWriter ?? null,
            dateRecorded: s.dateRecorded || '',
            createdAt: s.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: s.updatedAt ?? null,
          };
          await db.insert(storiesOfChange).values(values).onConflictDoUpdate({ target: storiesOfChange.id, set: values });
          break;
        }
        case 'mediaCoverages': {
          const m = item as unknown as MediaCoverage;
          const values = {
            id: m.id,
            projectId: m.projectId ?? null,
            title: m.title,
            type: m.type,
            platform: m.platform,
            publisherMedia: m.publisherMedia ?? null,
            linkToPublication: m.linkToPublication || '',
            releaseDate: m.releaseDate || '',
            summaryNotes: m.summaryNotes ?? null,
            createdAt: m.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: m.updatedAt ?? null,
          };
          await db.insert(mediaCoverages).values(values).onConflictDoUpdate({ target: mediaCoverages.id, set: values });
          break;
        }
        case 'learnings': {
          const l = item as unknown as ProjectLearning;
          const values = {
            id: l.id,
            projectId: l.projectId ?? null,
            title: l.title,
            learningFocus: l.learningFocus,
            customFocus: l.customFocus ?? null,
            keyLearning: l.keyLearning || '',
            whatWeDidDifferently: l.whatWeDidDifferently || '',
            nextPhaseConduct: l.nextPhaseConduct || '',
            internalCapacityAdvocacyComm: l.internalCapacityAdvocacyComm || '',
            whenToLearnImplement: l.whenToLearnImplement || '',
            status: l.status ?? null,
            recordedBy: l.recordedBy ?? null,
            dateRecorded: l.dateRecorded || '',
            createdAt: l.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: l.updatedAt ?? null,
          };
          await db.insert(learnings).values(values).onConflictDoUpdate({ target: learnings.id, set: values });
          break;
        }
        case 'reports': {
          const r = item as unknown as ReportItem;
          const values = {
            id: r.id,
            projectId: r.projectId,
            title: r.title,
            type: r.type,
            period: r.period,
            year: Number(r.year) || new Date().getFullYear(),
            submissionDeadline: r.submissionDeadline || '',
            submittedDate: r.submittedDate ?? null,
            authorOrLead: r.authorOrLead || '',
            reviewerOrDonor: r.reviewerOrDonor ?? null,
            status: r.status || 'Draft',
            summaryHighlights: r.summaryHighlights || '',
            keyAchievements: r.keyAchievements ?? null,
            challengesAndMitigation: r.challengesAndMitigation ?? null,
            fileUrl: r.fileUrl ?? null,
            fileName: r.fileName ?? null,
            fileSize: r.fileSize ?? null,
            fileData: r.fileData ?? null,
            fileType: r.fileType ?? null,
            targetBeneficiariesPeriod: r.targetBeneficiariesPeriod ?? null,
            actualBeneficiariesPeriod: r.actualBeneficiariesPeriod ?? null,
            budgetSpentPeriod: r.budgetSpentPeriod ?? null,
            reviewNotes: r.reviewNotes ?? null,
            ratingOrScore: r.ratingOrScore ?? null,
            createdAt: r.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: r.updatedAt ?? null,
          };
          await db.insert(reports).values(values).onConflictDoUpdate({ target: reports.id, set: values });
          break;
        }
        case 'appUsers': {
          const u = item as unknown as UserAccount;
          const values = {
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            email: u.email,
            password: u.password ?? null,
            role: u.role,
            assignedProjectIds: u.assignedProjectIds || ['all'],
            status: u.status || 'Aktif',
            phone: u.phone ?? null,
            avatarUrl: u.avatarUrl ?? null,
            createdAt: u.createdAt || new Date().toISOString().slice(0, 10),
            lastLogin: u.lastLogin ?? null,
          };
          await db.insert(appUsers).values(values).onConflictDoUpdate({ target: appUsers.id, set: values });
          break;
        }
        case 'errorReports': {
          const e = item as unknown as ErrorReport;
          const values = {
            id: e.id,
            title: e.title,
            module: e.module,
            severity: e.severity,
            status: e.status,
            description: e.description,
            stepsToReproduce: e.stepsToReproduce ?? null,
            expectedBehavior: e.expectedBehavior ?? null,
            actualBehavior: e.actualBehavior ?? null,
            screenshotUrl: e.screenshotUrl ?? null,
            systemInfo: e.systemInfo ?? null,
            reportedBy: e.reportedBy,
            reporterEmail: e.reporterEmail ?? null,
            assignedTo: e.assignedTo ?? null,
            resolutionNotes: e.resolutionNotes ?? null,
            createdAt: e.createdAt || new Date().toISOString().slice(0, 10),
            resolvedAt: e.resolvedAt ?? null,
          };
          await db.insert(errorReports).values(values).onConflictDoUpdate({ target: errorReports.id, set: values });
          break;
        }
      }
    }
  } catch (error) {
    console.error(`Database batchUpsertRecords failed (${colName}):`, error);
    throw new Error('Failed to save records to database.', { cause: error });
  }
}

export async function deleteRecord(colName: CloudCollectionName, id: string): Promise<void> {
  await batchDeleteRecords(colName, [id]);
}

export async function batchDeleteRecords(colName: CloudCollectionName, ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) return;

  try {
    switch (colName) {
      case 'projects':
        await db.delete(projects).where(inArray(projects.id, ids));
        break;
      case 'beneficiaries':
        await db.delete(beneficiaries).where(inArray(beneficiaries.id, ids));
        break;
      case 'attendances':
        await db.delete(attendances).where(inArray(attendances.id, ids));
        break;
      case 'accompaniedGroups':
        await db.delete(accompaniedGroups).where(inArray(accompaniedGroups.id, ids));
        break;
      case 'knowledgeProducts':
        await db.delete(knowledgeProducts).where(inArray(knowledgeProducts.id, ids));
        break;
      case 'storiesOfChange':
        await db.delete(storiesOfChange).where(inArray(storiesOfChange.id, ids));
        break;
      case 'mediaCoverages':
        await db.delete(mediaCoverages).where(inArray(mediaCoverages.id, ids));
        break;
      case 'learnings':
        await db.delete(learnings).where(inArray(learnings.id, ids));
        break;
      case 'reports':
        await db.delete(reports).where(inArray(reports.id, ids));
        break;
      case 'appUsers':
        await db.delete(appUsers).where(inArray(appUsers.id, ids));
        break;
      case 'errorReports':
        await db.delete(errorReports).where(inArray(errorReports.id, ids));
        break;
    }
  } catch (error) {
    console.error(`Database batchDeleteRecords failed (${colName}):`, error);
    throw new Error('Failed to delete records from database.', { cause: error });
  }
}

export async function restoreWorkspaceBackup(payload: Partial<WorkspacePayload>): Promise<void> {
  try {
    if (Array.isArray(payload.projects)) {
      await db.delete(projects);
      await batchUpsertRecords('projects', payload.projects);
    }
    if (Array.isArray(payload.beneficiaries)) {
      await db.delete(beneficiaries);
      await batchUpsertRecords('beneficiaries', payload.beneficiaries);
    }
    if (Array.isArray(payload.attendances)) {
      await db.delete(attendances);
      await batchUpsertRecords('attendances', payload.attendances);
    }
    if (Array.isArray(payload.accompaniedGroups)) {
      await db.delete(accompaniedGroups);
      await batchUpsertRecords('accompaniedGroups', payload.accompaniedGroups);
    }
    if (Array.isArray(payload.knowledgeProducts)) {
      await db.delete(knowledgeProducts);
      await batchUpsertRecords('knowledgeProducts', payload.knowledgeProducts);
    }
    if (Array.isArray(payload.storiesOfChange)) {
      await db.delete(storiesOfChange);
      await batchUpsertRecords('storiesOfChange', payload.storiesOfChange);
    }
    if (Array.isArray(payload.mediaCoverages)) {
      await db.delete(mediaCoverages);
      await batchUpsertRecords('mediaCoverages', payload.mediaCoverages);
    }
    if (Array.isArray(payload.learnings)) {
      await db.delete(learnings);
      await batchUpsertRecords('learnings', payload.learnings);
    }
    if (Array.isArray(payload.reports)) {
      await db.delete(reports);
      await batchUpsertRecords('reports', payload.reports);
    }
    if (Array.isArray(payload.users)) {
      await db.delete(appUsers);
      await batchUpsertRecords('appUsers', payload.users);
    }
    if (Array.isArray(payload.errorReports)) {
      await db.delete(errorReports);
      await batchUpsertRecords('errorReports', payload.errorReports);
    }
  } catch (error) {
    console.error('Database restoreWorkspaceBackup failed:', error);
    throw new Error('Failed to restore backup into database.', { cause: error });
  }
}
