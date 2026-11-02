import {
  Beneficiary,
  ActivityAttendance,
  Activity,
  Project,
  AgeGroup,
  DisaggregationSummary
} from '../types';

export function calculateAgeGroup(age: number): AgeGroup {
  if (age <= 5) return '0-5';
  if (age <= 12) return '6-12';
  if (age <= 17) return '13-17';
  if (age <= 24) return '18-24';
  if (age <= 40) return '25-40';
  if (age <= 64) return '41-64';
  return '65+';
}

export function calculateAgeFromBirthYear(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - birthYear);
}

/**
 * Calculates comprehensive disaggregations with STRICT Zero Double-Counting
 * (Deduplicating participants by unique beneficiary ID).
 */
export function calculateDisaggregations(
  beneficiaries: Beneficiary[],
  attendances: ActivityAttendance[],
  filterProjectId?: string,
  filterActivityId?: string
): DisaggregationSummary {
  // Filter attendances first
  let filteredAttendances = attendances;
  if (filterProjectId && filterProjectId !== 'all') {
    filteredAttendances = filteredAttendances.filter(a => a.projectId === filterProjectId);
  }
  if (filterActivityId && filterActivityId !== 'all') {
    filteredAttendances = filteredAttendances.filter(a => a.activityId === filterActivityId);
  }

  const grossParticipation = filteredAttendances.length;

  // Track unique IDs and frequency of participation
  const participantFrequencyMap = new Map<string, number>();
  filteredAttendances.forEach(att => {
    participantFrequencyMap.set(
      att.beneficiaryId,
      (participantFrequencyMap.get(att.beneficiaryId) || 0) + 1
    );
  });

  const uniqueBeneficiaryIds = Array.from(participantFrequencyMap.keys());
  const uniqueBeneficiaries = beneficiaries.filter(b => uniqueBeneficiaryIds.includes(b.id));
  const totalUnique = uniqueBeneficiaries.length;

  // Repeated participants count (participated in > 1 activity session)
  let repeatedCount = 0;
  participantFrequencyMap.forEach(count => {
    if (count > 1) repeatedCount++;
  });

  // Gender Breakdown (based on UNIQUE direct beneficiaries)
  let lakiLaki = 0;
  let perempuan = 0;
  uniqueBeneficiaries.forEach(b => {
    if (b.gender === 'Laki-laki') lakiLaki++;
    else if (b.gender === 'Perempuan') perempuan++;
  });

  const percentLakiLaki = totalUnique > 0 ? Math.round((lakiLaki / totalUnique) * 100) : 0;
  const percentPerempuan = totalUnique > 0 ? Math.round((perempuan / totalUnique) * 100) : 0;

  // Age Group Breakdown (7 ranges: 0-5, 6-12, 13-17, 18-24, 25-40, 41-64, 65+)
  const ageGroupBreakdown: Record<AgeGroup, number> = {
    '0-5': 0,
    '6-12': 0,
    '13-17': 0,
    '18-24': 0,
    '25-40': 0,
    '41-64': 0,
    '65+': 0
  };
  uniqueBeneficiaries.forEach(b => {
    let grp = b.ageGroup;
    if (!grp || ageGroupBreakdown[grp] === undefined) {
      if (b.age !== undefined && !isNaN(b.age)) {
        grp = calculateAgeGroup(b.age);
      } else {
        grp = '25-40';
      }
    }
    if (ageGroupBreakdown[grp] !== undefined) {
      ageGroupBreakdown[grp]++;
    } else {
      ageGroupBreakdown['25-40']++;
    }
  });

  // Disability Breakdown & Barriers & Difficulty Levels
  let disabilityCount = 0;
  let nonDisabilityCount = 0;
  const barriers: Record<string, number> = {};
  const difficultyLevels: Record<string, number> = {};

  uniqueBeneficiaries.forEach(b => {
    if (b.hasDisability) {
      disabilityCount++;
      const barrierKey = b.disabilityType || 'Lainnya / Tidak Disebutkan';
      barriers[barrierKey] = (barriers[barrierKey] || 0) + 1;
      
      const diffKey = b.disabilityDifficultyLevel || '3. Fairly difficult';
      difficultyLevels[diffKey] = (difficultyLevels[diffKey] || 0) + 1;
    } else {
      nonDisabilityCount++;
    }
  });

  const percentDisability = totalUnique > 0 ? Number(((disabilityCount / totalUnique) * 100).toFixed(1)) : 0;

  // IPLC Breakdown
  let indigenousPeoples = 0;
  let localCommunities = 0;
  let nonIplc = 0;
  const communityMap: Record<string, number> = {};

  uniqueBeneficiaries.forEach(b => {
    if (b.iplcStatus === 'Masyarakat Adat (Indigenous Peoples)') {
      indigenousPeoples++;
      if (b.customIplcCommunityName) {
        communityMap[b.customIplcCommunityName] = (communityMap[b.customIplcCommunityName] || 0) + 1;
      }
    } else if (b.iplcStatus === 'Komunitas Lokal (Local Communities)') {
      localCommunities++;
      if (b.customIplcCommunityName) {
        communityMap[b.customIplcCommunityName] = (communityMap[b.customIplcCommunityName] || 0) + 1;
      }
    } else {
      nonIplc++;
    }
  });

  const percentIplcTotal = totalUnique > 0 ? Number((((indigenousPeoples + localCommunities) / totalUnique) * 100).toFixed(1)) : 0;

  const topCommunities = Object.entries(communityMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Target Group Breakdown
  let tgPopulation = 0;
  let tgAdministrations = 0;
  let tgIntermediaries = 0;
  let tgOther = 0;

  // Beneficiary Level Breakdown
  let lvlDesa = 0;
  let lvlKecamatan = 0;
  let lvlKabupaten = 0;
  let lvlProvinsi = 0;
  let lvlNasional = 0;

  const levelMap = new Map<string, {
    level: string;
    levelName: string;
    count: number;
    institutions: Set<string>;
  }>();

  uniqueBeneficiaries.forEach(b => {
    // Target Group counting
    const tg = b.targetGroup || 'Population of the project communities';
    if (tg === 'Actors in the municipal, district and provincial administrations') {
      tgAdministrations++;
    } else if (tg === 'Intermediaries: NGOs / CSOs') {
      tgIntermediaries++;
    } else if (tg === 'Other') {
      tgOther++;
    } else {
      tgPopulation++;
    }

    // Level counting
    const lvl = b.beneficiaryLevel || 'Desa';
    if (lvl === 'Nasional') lvlNasional++;
    else if (lvl === 'Provinsi') lvlProvinsi++;
    else if (lvl === 'Kabupaten') lvlKabupaten++;
    else if (lvl === 'Kecamatan') lvlKecamatan++;
    else lvlDesa++;

    // Level entity group
    const lvlName = b.levelName || b.village || 'Wilayah Dampingan';
    const key = `${lvl}:${lvlName}`;
    if (!levelMap.has(key)) {
      levelMap.set(key, {
        level: lvl,
        levelName: lvlName,
        count: 0,
        institutions: new Set<string>()
      });
    }
    const item = levelMap.get(key)!;
    item.count++;
    if (b.institutionOrAgency) {
      item.institutions.add(b.institutionOrAgency);
    }
  });

  const percentPopulation = totalUnique > 0 ? Number(((tgPopulation / totalUnique) * 100).toFixed(1)) : 0;
  const percentAdministrations = totalUnique > 0 ? Number(((tgAdministrations / totalUnique) * 100).toFixed(1)) : 0;
  const percentIntermediaries = totalUnique > 0 ? Number(((tgIntermediaries / totalUnique) * 100).toFixed(1)) : 0;
  const percentOther = totalUnique > 0 ? Number(((tgOther / totalUnique) * 100).toFixed(1)) : 0;

  const levelItems = Array.from(levelMap.values())
    .map(entry => ({
      level: entry.level,
      levelName: entry.levelName,
      count: entry.count,
      percentage: totalUnique > 0 ? Number(((entry.count / totalUnique) * 100).toFixed(1)) : 0,
      institutions: Array.from(entry.institutions)
    }))
    .sort((a, b) => b.count - a.count);

  // Location breakdown
  const byProvince: Record<string, number> = {};
  const byRegency: Record<string, number> = {};
  const villageMap = new Map<string, {
    village: string;
    totalUnique: number;
    lakiLaki: number;
    perempuan: number;
    disabilityCount: number;
    iplcCount: number;
  }>();

  uniqueBeneficiaries.forEach(b => {
    if (b.province) byProvince[b.province] = (byProvince[b.province] || 0) + 1;
    if (b.regency) byRegency[b.regency] = (byRegency[b.regency] || 0) + 1;

    const vName = b.village ? b.village.trim() : 'Desa Lainnya / Belum Terdata';
    if (!villageMap.has(vName)) {
      villageMap.set(vName, {
        village: vName,
        totalUnique: 0,
        lakiLaki: 0,
        perempuan: 0,
        disabilityCount: 0,
        iplcCount: 0
      });
    }

    const vStat = villageMap.get(vName)!;
    vStat.totalUnique++;
    if (b.gender === 'Laki-laki') vStat.lakiLaki++;
    if (b.gender === 'Perempuan') vStat.perempuan++;
    if (b.hasDisability) vStat.disabilityCount++;
    if (b.iplcStatus !== 'Bukan IPLC (Non-IPLC)') vStat.iplcCount++;
  });

  const villageBreakdown = Array.from(villageMap.values())
    .map(item => ({
      ...item,
      percentage: totalUnique > 0 ? Number(((item.totalUnique / totalUnique) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.totalUnique - a.totalUnique);

  return {
    totalGrossParticipation: grossParticipation,
    totalUniqueBeneficiaries: totalUnique,
    repeatedParticipantsCount: repeatedCount,
    genderBreakdown: {
      lakiLaki,
      perempuan,
      percentLakiLaki,
      percentPerempuan
    },
    ageGroupBreakdown,
    disabilityBreakdown: {
      disabilityCount,
      nonDisabilityCount,
      percentDisability,
      barriers,
      difficultyLevels
    },
    iplcBreakdown: {
      indigenousPeoples,
      localCommunities,
      nonIplc,
      percentIplcTotal,
      topCommunities
    },
    targetGroupBreakdown: {
      population: tgPopulation,
      administrations: tgAdministrations,
      intermediaries: tgIntermediaries,
      other: tgOther,
      percentPopulation,
      percentAdministrations,
      percentIntermediaries,
      percentOther
    },
    beneficiaryLevelBreakdown: {
      desa: lvlDesa,
      kecamatan: lvlKecamatan,
      kabupaten: lvlKabupaten,
      provinsi: lvlProvinsi,
      nasional: lvlNasional,
      items: levelItems
    },
    locationBreakdown: {
      byProvince,
      byRegency
    },
    villageBreakdown
  };
}

export function calculateLogframeProgress(project: Project) {
  let totalIndicators = 0;
  let sumPercentage = 0;
  let achievedCount = 0;
  let onTrackCount = 0;
  let delayedCount = 0;
  let notStartedCount = 0;

  // Helper to process indicator
  const processIndicator = (ind: { baseline: number; target: number; actual: number; status: string }) => {
    totalIndicators++;
    const range = ind.target - ind.baseline;
    let pct = 0;
    if (range > 0) {
      pct = Math.min(150, Math.max(0, ((ind.actual - ind.baseline) / range) * 100));
    } else if (ind.target > 0) {
      pct = Math.min(150, Math.max(0, (ind.actual / ind.target) * 100));
    } else {
      pct = ind.actual >= ind.target ? 100 : 0;
    }
    sumPercentage += pct;

    if (ind.status === 'Tercapai' || pct >= 100) achievedCount++;
    else if (ind.status === 'Sesuai Target (On-Track)' || pct >= 70) onTrackCount++;
    else if (ind.status === 'Perlu Perhatian (Delayed)' || (pct > 0 && pct < 70)) delayedCount++;
    else notStartedCount++;
  };

  // Goal indicators
  project.goalIndicators?.forEach(processIndicator);

  // Outcomes & Outputs & Activities
  project.outcomes.forEach(oc => {
    oc.indicators.forEach(processIndicator);
    oc.outputs.forEach(op => {
      op.indicators.forEach(processIndicator);
      op.activities.forEach(act => {
        act.indicators?.forEach(processIndicator);
      });
    });
  });

  const averageAchievement = totalIndicators > 0 ? Math.round(sumPercentage / totalIndicators) : 0;

  return {
    totalIndicators,
    averageAchievement,
    achievedCount,
    onTrackCount,
    delayedCount,
    notStartedCount
  };
}

export function getAllActivitiesFromProjects(projects: Project[]): { activity: Activity; projectName: string; outcomeCode: string; outputCode: string }[] {
  const list: { activity: Activity; projectName: string; outcomeCode: string; outputCode: string }[] = [];
  projects.forEach(p => {
    p.outcomes.forEach(oc => {
      oc.outputs.forEach(op => {
        op.activities.forEach(act => {
          list.push({
            activity: act,
            projectName: p.title,
            outcomeCode: oc.code,
            outputCode: op.code
          });
        });
      });
    });
  });
  return list;
}
