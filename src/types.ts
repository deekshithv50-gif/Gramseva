export type ComplaintCategory =
  | 'water_requirements'
  | 'garbage_waste_management'
  | 'road_development'
  | 'electricity_problems'
  | 'social_problems'
  | 'farmers_loan_delay'
  | 'property_family_dispute'
  | 'unemployment_mgnrega'
  | 'scholarship_handicapped'
  | 'womens_welfare'
  | 'single_parent_support'
  | 'other_grievance';

export interface CategoryMeta {
  id: ComplaintCategory;
  nameEn: string;
  nameKn: string;
  icon: string;
  description: string;
  department: string;
  slaDays: number;
}

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'site_inspection'
  | 'action_initiated'
  | 'resolved'
  | 'rejected';

export interface AttachedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
  likesCount?: number;
  usageCount?: number;
}

export interface DocumentLikeEvent {
  userId: string;
  userName: string;
  userPhoneMasked?: string;
  role: 'citizen' | 'official_pdo' | 'public_visitor';
  likedAt: string;
}

export interface DocumentUsageLog {
  id: string;
  userId: string;
  userName: string;
  role: 'citizen' | 'official_pdo' | 'public_visitor';
  action: 'viewed' | 'downloaded' | 'printed' | 'shared';
  timestamp: string;
  ipMasked?: string;
}

export interface TrackedDocumentRecord {
  documentId: string;
  documentName: string;
  complaintId: string;
  complaintTitle: string;
  category: ComplaintCategory;
  fileSize: number;
  fileType: string;
  dataUrl?: string;
  uploadedAt: string;
  likesCount: number;
  likedBy: DocumentLikeEvent[];
  usageCount: number;
  usageHistory: DocumentUsageLog[];
}

export interface Complaint {
  id: string; // e.g. "GP-KA-2026-WTR-108"
  category: ComplaintCategory;
  title: string;
  description: string; // up to 1000 characters
  village: string;
  specificLocality: string;
  wardNumber?: string;
  
  // Privacy & Anonymity attributes
  // The submitter identity is strictly masked for GP members
  citizenMaskedId: string; // e.g., "CIT-KA-***-8491"
  hasAcceptedSubmitNote: boolean;
  
  // Submitter private data (only accessible to citizen themselves via their login)
  privateCitizenPhone: string;
  privateCitizenUserId: string;

  // Location data
  location: {
    district: string;
    taluk: string;
    gramPanchayat: string;
    village: string;
    latitude?: number;
    longitude?: number;
    geoPermitted: boolean;
  };

  documents: AttachedDocument[];
  status: ComplaintStatus;
  statusNotes?: string;
  actionTakenBy?: string;
  actionTakenAt?: string;
  resolutionRemarks?: string;
  submittedAt: string;
  updatedAt: string;
  priority: 'normal' | 'high' | 'urgent';
}

export interface Village {
  id: string;
  nameEn: string;
  nameKn: string;
  population: number;
  wardsCount: number;
}

export interface GramPanchayatInfo {
  id: string;
  nameEn: string;
  nameKn: string;
  districtEn: string;
  districtKn: string;
  talukEn: string;
  talukKn: string;
  helplineNumber: string; // "0000111101"
  pdoName: string;
  pdoPhone: string;
  villages: Village[]; // less than 10 constituent villages
  currentTerm: string; // e.g., "2021-2026"
  nextElectionYear: number; // 2026
}

export type CouncilRole = 'pdo' | 'president' | 'vice_president' | 'ward_member';

export interface CouncilMember {
  id: string;
  name: string;
  nameKn: string;
  role: CouncilRole;
  roleTitleEn: string;
  roleTitleKn: string;
  villageRepresented: string;
  wardNumber: string;
  phone: string;
  termStartYear: number;
  termEndYear: number;
  status: 'active' | 'term_completed' | 'pending_approval';
  photoUrl?: string;
  partyAffiliation?: string;
}

export interface UserSession {
  phoneNumber: string;
  userId: string;
  isLoggedIn: boolean;
  role: 'citizen' | 'official_pdo' | 'official_president' | 'official_member';
  displayName?: string;
  verifiedAt?: string;
}

export interface OfficeStatusResult {
  isOpen: boolean;
  isLunchTime: boolean;
  isSaturdayHalfDay: boolean;
  isSundayHoliday: boolean;
  statusText: string;
  statusTextKn: string;
  scheduleSummary: string;
  currentTimeString: string;
  currentDayName: string;
  hoursDetail: string;
}
