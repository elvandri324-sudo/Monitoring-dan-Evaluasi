import { UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-002',
    username: 'elvandri.me',
    fullName: 'Elvandri, S.Stat, M.Sc (M&E Lead)',
    email: 'elvandri.me@monitoring.org',
    password: 'password123',
    role: 'Super Admin',
    assignedProjectIds: ['all'],
    status: 'Aktif',
    phone: '+62 811-2233-4455',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15',
    lastLogin: '2026-08-22 15:45'
  },
  {
    id: 'user-003',
    username: 'budi.santoso',
    fullName: 'Budi Santoso, S.Kom',
    email: 'budi.santoso@monitoring.org',
    password: 'password123',
    role: 'Staff M&E',
    assignedProjectIds: ['proj-01', 'proj-02'],
    status: 'Aktif',
    phone: '+62 813-8899-1122',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01',
    lastLogin: '2026-08-21 09:20'
  },
  {
    id: 'user-004',
    username: 'siti.nurhaliza',
    fullName: 'Siti Nurhaliza, S.P (Koordinator Lapangan Kalbar)',
    email: 'siti.nur@partner-kalbar.org',
    password: 'password123',
    role: 'Field Coordinator',
    assignedProjectIds: ['proj-01'],
    status: 'Aktif',
    phone: '+62 852-7788-9900',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    createdAt: '2024-03-10',
    lastLogin: '2026-08-20 16:15'
  },
  {
    id: 'user-005',
    username: 'yulius.tefa',
    fullName: 'Drs. Yulius Tefa (Koordinator NTT)',
    email: 'yulius.tefa@inklusi-ntt.org',
    password: 'password123',
    role: 'Field Coordinator',
    assignedProjectIds: ['proj-02'],
    status: 'Aktif',
    phone: '+62 821-4455-6677',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    createdAt: '2024-05-18',
    lastLogin: '2026-08-19 11:00'
  },
  {
    id: 'user-006',
    username: 'donor.auditor',
    fullName: 'Donor & External Evaluator',
    email: 'auditor@donor-consortium.org',
    password: 'password123',
    role: 'Viewer / Guest',
    assignedProjectIds: ['all'],
    status: 'Aktif',
    phone: '+62 818-0909-8877',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    createdAt: '2024-06-01',
    lastLogin: '2026-08-15 10:30'
  }
];
