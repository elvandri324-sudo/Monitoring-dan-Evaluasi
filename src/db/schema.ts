import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Auth-linked users table (Firebase UID linkage per Cloud SQL setup spec)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Track one-time initial database seed
export const workspaceMeta = pgTable('workspace_meta', {
  key: text('key').primaryKey(),
  seeded: boolean('seeded').notNull().default(true),
  seededAt: text('seeded_at').notNull(),
});

// Core M&E Projects (stores nested indicators, outcomes, outputs, activities, and team members as typed jsonb)
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  donor: text('donor').notNull().default(''),
  partnerOrg: text('partner_org').notNull().default(''),
  budgetTotal: doublePrecision('budget_total').notNull().default(0),
  budgetCurrency: text('budget_currency').notNull().default('IDR'),
  startDate: text('start_date').notNull().default(''),
  endDate: text('end_date').notNull().default(''),
  status: text('status').notNull().default('Aktif'),
  province: text('province').notNull().default(''),
  targetLocations: jsonb('target_locations').$type<string[]>().notNull().default([]),
  targetVillages: jsonb('target_villages').$type<string[]>(),
  goalStatement: text('goal_statement').notNull().default(''),
  goalIndicators: jsonb('goal_indicators').$type<unknown[]>().notNull().default([]),
  outcomes: jsonb('outcomes').$type<unknown[]>().notNull().default([]),
  teamMembers: jsonb('team_members').$type<unknown[]>().notNull().default([]),
  createdAt: text('created_at').notNull().default(''),
});

// Beneficiaries
export const beneficiaries = pgTable('beneficiaries', {
  id: text('id').primaryKey(),
  nikOrIdentifier: text('nik_or_identifier').notNull().default(''),
  fullName: text('full_name').notNull(),
  gender: text('gender').notNull(),
  birthYear: integer('birth_year').notNull(),
  age: integer('age').notNull(),
  ageGroup: text('age_group').notNull(),
  hasDisability: boolean('has_disability').notNull().default(false),
  disabilityType: text('disability_type'),
  disabilityDifficultyLevel: text('disability_difficulty_level'),
  disabilityBarrierNotes: text('disability_barrier_notes'),
  iplcStatus: text('iplc_status').notNull(),
  customIplcCommunityName: text('custom_iplc_community_name'),
  targetGroup: text('target_group'),
  beneficiaryLevel: text('beneficiary_level'),
  levelName: text('level_name'),
  institutionOrAgency: text('institution_or_agency'),
  province: text('province').notNull().default(''),
  regency: text('regency').notNull().default(''),
  district: text('district'),
  village: text('village').notNull().default(''),
  phone: text('phone'),
  occupation: text('occupation'),
  registeredProjectId: text('registered_project_id'),
  createdAt: text('created_at').notNull().default(''),
});

// Activity Attendance records
export const attendances = pgTable('attendances', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull(),
  projectId: text('project_id').notNull(),
  beneficiaryId: text('beneficiary_id').notNull(),
  attendanceDate: text('attendance_date').notNull(),
  roleInActivity: text('role_in_activity'),
  attendanceStatus: text('attendance_status').notNull().default('Hadir'),
  notes: text('notes'),
  verifiedBy: text('verified_by'),
});

// Accompanied Groups (Kelompok Dampingan)
export const accompaniedGroups = pgTable('accompanied_groups', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  customType: text('custom_type'),
  village: text('village').notNull().default(''),
  district: text('district'),
  regency: text('regency').notNull().default(''),
  province: text('province').notNull().default(''),
  establishmentDate: text('establishment_date'),
  legalStatus: text('legal_status'),
  legalDocumentNumber: text('legal_document_number'),
  leaderName: text('leader_name'),
  leaderPhone: text('leader_phone'),
  focusArea: text('focus_area'),
  status: text('status').notNull().default('Aktif'),
  notes: text('notes'),
  members: jsonb('members').$type<unknown[]>().notNull().default([]),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Knowledge Products
export const knowledgeProducts = pgTable('knowledge_products', {
  id: text('id').primaryKey(),
  projectId: text('project_id'),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  language: text('language').notNull().default('Indonesia'),
  publisherAuthor: text('publisher_author').notNull().default(''),
  contributeToOutputOutcome: text('contribute_to_output_outcome').notNull().default(''),
  linkDocument: text('link_document').notNull().default(''),
  fileFormat: text('file_format'),
  fileSize: text('file_size'),
  releaseDate: text('release_date'),
  coverImageUrl: text('cover_image_url'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Stories of Change
export const storiesOfChange = pgTable('stories_of_change', {
  id: text('id').primaryKey(),
  projectId: text('project_id'),
  storyTitle: text('story_title').notNull(),
  storiesLocation: text('stories_location').notNull().default(''),
  whoHasChanged: text('who_has_changed').notNull().default(''),
  beneficiaryId: text('beneficiary_id'),
  highlightBefore: text('highlight_before').notNull().default(''),
  highlightAfter: text('highlight_after').notNull().default(''),
  importantQuotes: text('important_quotes').notNull().default(''),
  noteFullStory: text('note_full_story').notNull().default(''),
  categoryTheme: text('category_theme'),
  photoUrl: text('photo_url'),
  authorOrWriter: text('author_or_writer'),
  dateRecorded: text('date_recorded').notNull().default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Media Coverages
export const mediaCoverages = pgTable('media_coverages', {
  id: text('id').primaryKey(),
  projectId: text('project_id'),
  title: text('title').notNull(),
  type: text('type').notNull(),
  platform: text('platform').notNull(),
  publisherMedia: text('publisher_media'),
  linkToPublication: text('link_to_publication').notNull().default(''),
  releaseDate: text('release_date').notNull().default(''),
  summaryNotes: text('summary_notes'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Project Learnings
export const learnings = pgTable('learnings', {
  id: text('id').primaryKey(),
  projectId: text('project_id'),
  title: text('title').notNull(),
  learningFocus: text('learning_focus').notNull(),
  customFocus: text('custom_focus'),
  keyLearning: text('key_learning').notNull().default(''),
  whatWeDidDifferently: text('what_we_did_differently').notNull().default(''),
  nextPhaseConduct: text('next_phase_conduct').notNull().default(''),
  internalCapacityAdvocacyComm: text('internal_capacity_advocacy_comm').notNull().default(''),
  whenToLearnImplement: text('when_to_learn_implement').notNull().default(''),
  status: text('status'),
  recordedBy: text('recorded_by'),
  dateRecorded: text('date_recorded').notNull().default(''),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Project Reports
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  period: text('period').notNull(),
  year: integer('year').notNull(),
  submissionDeadline: text('submission_deadline').notNull().default(''),
  submittedDate: text('submitted_date'),
  authorOrLead: text('author_or_lead').notNull().default(''),
  reviewerOrDonor: text('reviewer_or_donor'),
  status: text('status').notNull().default('Draft'),
  summaryHighlights: text('summary_highlights').notNull().default(''),
  keyAchievements: jsonb('key_achievements').$type<string[]>(),
  challengesAndMitigation: text('challenges_and_mitigation'),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileSize: text('file_size'),
  fileData: text('file_data'),
  fileType: text('file_type'),
  targetBeneficiariesPeriod: integer('target_beneficiaries_period'),
  actualBeneficiariesPeriod: integer('actual_beneficiaries_period'),
  budgetSpentPeriod: doublePrecision('budget_spent_period'),
  reviewNotes: text('review_notes'),
  ratingOrScore: doublePrecision('rating_or_score'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at'),
});

// Application User Accounts (managed in UserManagement & LoginPage)
export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  password: text('password'),
  role: text('role').notNull(),
  assignedProjectIds: jsonb('assigned_project_ids').$type<string[]>().notNull().default(['all']),
  status: text('status').notNull().default('Aktif'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(''),
  lastLogin: text('last_login'),
});

// Error Reports
export const errorReports = pgTable('error_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  module: text('module').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull(),
  description: text('description').notNull(),
  stepsToReproduce: text('steps_to_reproduce'),
  expectedBehavior: text('expected_behavior'),
  actualBehavior: text('actual_behavior'),
  screenshotUrl: text('screenshot_url'),
  systemInfo: text('system_info'),
  reportedBy: text('reported_by').notNull(),
  reporterEmail: text('reporter_email'),
  assignedTo: text('assigned_to'),
  resolutionNotes: text('resolution_notes'),
  createdAt: text('created_at').notNull().default(''),
  resolvedAt: text('resolved_at'),
});
