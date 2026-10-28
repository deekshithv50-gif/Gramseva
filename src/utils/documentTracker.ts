import { TrackedDocumentRecord, DocumentLikeEvent, DocumentUsageLog, UserSession, Complaint } from '../types';

const STORAGE_KEY = 'gp_tracked_documents_records';

// Initial seed records for realistic demonstration
const INITIAL_TRACKED_DOCUMENTS: TrackedDocumentRecord[] = [
  {
    documentId: 'doc-01',
    documentName: 'water_pipe_leak_photo.jpg',
    complaintId: 'GP-KA-2026-WTR-041',
    complaintTitle: 'Drinking water pipeline burst near Maramma Temple, dirty water mixing',
    category: 'water_requirements',
    fileSize: 245000,
    fileType: 'image/jpeg',
    uploadedAt: '2026-09-14 11:20 AM',
    likesCount: 5,
    likedBy: [
      {
        userId: 'citizen_nandi_01',
        userName: 'Citizen (Maramma Street)',
        userPhoneMasked: '98450***45',
        role: 'citizen',
        likedAt: '2026-09-14 11:45 AM',
      },
      {
        userId: 'citizen_sultanpet_99',
        userName: 'Citizen (Sultanpet)',
        userPhoneMasked: '98801***65',
        role: 'citizen',
        likedAt: '2026-09-14 01:10 PM',
      },
      {
        userId: 'pdo_nandi_officer',
        userName: 'PDO R. Manjunath',
        userPhoneMasked: '94481***50',
        role: 'official_pdo',
        likedAt: '2026-09-15 02:30 PM',
      },
      {
        userId: 'guest_ward1_elder',
        userName: 'Ward 1 Resident',
        role: 'public_visitor',
        likedAt: '2026-09-15 04:15 PM',
      },
      {
        userId: 'guest_kisan_rep',
        userName: 'Village Water Committee Member',
        role: 'public_visitor',
        likedAt: '2026-09-15 05:00 PM',
      },
    ],
    usageCount: 18,
    usageHistory: [
      {
        id: 'use-101',
        userId: 'pdo_nandi_officer',
        userName: 'PDO R. Manjunath',
        role: 'official_pdo',
        action: 'viewed',
        timestamp: '2026-09-15 02:28 PM',
      },
      {
        id: 'use-102',
        userId: 'water_board_lineman',
        userName: 'Lineman Ramesh (RWSS)',
        role: 'official_pdo',
        action: 'downloaded',
        timestamp: '2026-09-15 02:45 PM',
      },
      {
        id: 'use-103',
        userId: 'citizen_nandi_01',
        userName: 'Citizen Submitter',
        role: 'citizen',
        action: 'printed',
        timestamp: '2026-09-14 12:00 PM',
      },
      {
        id: 'use-104',
        userId: 'guest_visitor_42',
        userName: 'Public Citizen Visitor',
        role: 'public_visitor',
        action: 'viewed',
        timestamp: '2026-09-15 04:10 PM',
      },
    ],
  },
  {
    documentId: 'doc-02',
    documentName: 'street_light_sensor_survey.pdf',
    complaintId: 'GP-KA-2026-ELC-082',
    complaintTitle: 'Street lights not functioning on Sultanpet approach road for past 2 weeks',
    category: 'electricity_problems',
    fileSize: 512000,
    fileType: 'application/pdf',
    uploadedAt: '2026-09-13 04:10 PM',
    likesCount: 3,
    likedBy: [
      {
        userId: 'citizen_sultanpet_99',
        userName: 'Citizen (High School Road)',
        userPhoneMasked: '98801***65',
        role: 'citizen',
        likedAt: '2026-09-13 04:30 PM',
      },
      {
        userId: 'pdo_nandi_officer',
        userName: 'PDO R. Manjunath',
        userPhoneMasked: '94481***50',
        role: 'official_pdo',
        likedAt: '2026-09-14 10:15 AM',
      },
      {
        userId: 'bescom_engineer',
        userName: 'BESCOM Section Officer',
        role: 'official_pdo',
        likedAt: '2026-09-14 11:00 AM',
      },
    ],
    usageCount: 12,
    usageHistory: [
      {
        id: 'use-201',
        userId: 'bescom_engineer',
        userName: 'BESCOM Section Officer',
        role: 'official_pdo',
        action: 'downloaded',
        timestamp: '2026-09-14 11:05 AM',
      },
      {
        id: 'use-202',
        userId: 'pdo_nandi_officer',
        userName: 'PDO R. Manjunath',
        role: 'official_pdo',
        action: 'viewed',
        timestamp: '2026-09-14 10:12 AM',
      },
      {
        id: 'use-203',
        userId: 'citizen_sultanpet_99',
        userName: 'Citizen Submitter',
        role: 'citizen',
        action: 'viewed',
        timestamp: '2026-09-13 04:45 PM',
      },
    ],
  },
];

// In-memory cache synced with localStorage
let cachedRecords: TrackedDocumentRecord[] | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in document tracker listener', e);
    }
  });
}

export function getTrackedDocuments(): TrackedDocumentRecord[] {
  if (cachedRecords) return cachedRecords;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      cachedRecords = JSON.parse(saved);
      return cachedRecords || INITIAL_TRACKED_DOCUMENTS;
    }
  } catch (e) {
    console.error('Failed to load tracked documents', e);
  }
  cachedRecords = [...INITIAL_TRACKED_DOCUMENTS];
  saveTrackedDocuments(cachedRecords);
  return cachedRecords;
}

function saveTrackedDocuments(records: TrackedDocumentRecord[]) {
  cachedRecords = records;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save tracked documents', e);
  }
  notifyListeners();
}

export function subscribeToDocumentUpdates(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getEffectiveUserIdentifier(user: UserSession | null): {
  userId: string;
  userName: string;
  role: 'citizen' | 'official_pdo' | 'public_visitor';
  userPhoneMasked?: string;
} {
  if (user) {
    const maskedPhone = user.phoneNumber
      ? `${user.phoneNumber.slice(0, 5)}***${user.phoneNumber.slice(-2)}`
      : undefined;
    return {
      userId: user.userId || `user_${user.phoneNumber}`,
      userName: user.displayName || (user.role === 'official_pdo' ? 'PDO Officer' : `Citizen (${user.userId})`),
      role: user.role === 'official_pdo' ? 'official_pdo' : 'citizen',
      userPhoneMasked: maskedPhone,
    };
  }

  // Anonymous public visitor
  let guestId = localStorage.getItem('gp_guest_visitor_id');
  if (!guestId) {
    guestId = `visitor_${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('gp_guest_visitor_id', guestId);
  }
  return {
    userId: guestId,
    userName: `Public Citizen (${guestId})`,
    role: 'public_visitor',
  };
}

export function isDocumentLiked(docId: string, user: UserSession | null): boolean {
  const records = getTrackedDocuments();
  const record = records.find((r) => r.documentId === docId);
  if (!record) return false;
  const { userId } = getEffectiveUserIdentifier(user);
  return record.likedBy.some((u) => u.userId === userId);
}

export function toggleLikeDocument(
  docId: string,
  user: UserSession | null,
  fallbackMeta?: Partial<TrackedDocumentRecord>
): TrackedDocumentRecord {
  const records = [...getTrackedDocuments()];
  let index = records.findIndex((r) => r.documentId === docId);
  const userInfo = getEffectiveUserIdentifier(user);
  const now = new Date().toLocaleString();

  if (index === -1) {
    // Create new record for this document
    const newRecord: TrackedDocumentRecord = {
      documentId: docId,
      documentName: fallbackMeta?.documentName || 'attached_document.pdf',
      complaintId: fallbackMeta?.complaintId || 'GP-DOC-REF',
      complaintTitle: fallbackMeta?.complaintTitle || 'Gram Panchayat Official Record',
      category: fallbackMeta?.category || 'other_grievance',
      fileSize: fallbackMeta?.fileSize || 102400,
      fileType: fallbackMeta?.fileType || 'application/pdf',
      dataUrl: fallbackMeta?.dataUrl,
      uploadedAt: fallbackMeta?.uploadedAt || now,
      likesCount: 1,
      likedBy: [
        {
          userId: userInfo.userId,
          userName: userInfo.userName,
          userPhoneMasked: userInfo.userPhoneMasked,
          role: userInfo.role,
          likedAt: now,
        },
      ],
      usageCount: 1,
      usageHistory: [
        {
          id: `use-${Date.now()}`,
          userId: userInfo.userId,
          userName: userInfo.userName,
          role: userInfo.role,
          action: 'viewed',
          timestamp: now,
        },
      ],
    };
    records.push(newRecord);
    saveTrackedDocuments(records);
    return newRecord;
  }

  const existing = records[index];
  const hasLiked = existing.likedBy.some((u) => u.userId === userInfo.userId);

  let updatedLikedBy: DocumentLikeEvent[];
  let updatedLikesCount: number;

  if (hasLiked) {
    // Unlike
    updatedLikedBy = existing.likedBy.filter((u) => u.userId !== userInfo.userId);
    updatedLikesCount = Math.max(0, existing.likesCount - 1);
  } else {
    // Like
    updatedLikedBy = [
      {
        userId: userInfo.userId,
        userName: userInfo.userName,
        userPhoneMasked: userInfo.userPhoneMasked,
        role: userInfo.role,
        likedAt: now,
      },
      ...existing.likedBy,
    ];
    updatedLikesCount = existing.likesCount + 1;
  }

  const updatedRecord: TrackedDocumentRecord = {
    ...existing,
    likesCount: updatedLikesCount,
    likedBy: updatedLikedBy,
  };

  records[index] = updatedRecord;
  saveTrackedDocuments(records);
  return updatedRecord;
}

export function recordDocumentUsage(
  docId: string,
  action: 'viewed' | 'downloaded' | 'printed' | 'shared',
  user: UserSession | null,
  fallbackMeta?: Partial<TrackedDocumentRecord>
): TrackedDocumentRecord {
  const records = [...getTrackedDocuments()];
  let index = records.findIndex((r) => r.documentId === docId);
  const userInfo = getEffectiveUserIdentifier(user);
  const now = new Date().toLocaleString();

  const newLog: DocumentUsageLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: userInfo.userId,
    userName: userInfo.userName,
    role: userInfo.role,
    action,
    timestamp: now,
  };

  if (index === -1) {
    const newRecord: TrackedDocumentRecord = {
      documentId: docId,
      documentName: fallbackMeta?.documentName || 'official_document.pdf',
      complaintId: fallbackMeta?.complaintId || 'GP-DOC-REF',
      complaintTitle: fallbackMeta?.complaintTitle || 'Panchayat Grievance Document',
      category: fallbackMeta?.category || 'other_grievance',
      fileSize: fallbackMeta?.fileSize || 102400,
      fileType: fallbackMeta?.fileType || 'application/pdf',
      dataUrl: fallbackMeta?.dataUrl,
      uploadedAt: fallbackMeta?.uploadedAt || now,
      likesCount: 0,
      likedBy: [],
      usageCount: 1,
      usageHistory: [newLog],
    };
    records.push(newRecord);
    saveTrackedDocuments(records);
    return newRecord;
  }

  const existing = records[index];
  const updatedRecord: TrackedDocumentRecord = {
    ...existing,
    usageCount: (existing.usageCount || 0) + 1,
    usageHistory: [newLog, ...(existing.usageHistory || []).slice(0, 49)], // keep last 50
  };

  records[index] = updatedRecord;
  saveTrackedDocuments(records);
  return updatedRecord;
}

export function syncDocumentsWithComplaints(complaints: Complaint[]) {
  const records = [...getTrackedDocuments()];
  let changed = false;

  complaints.forEach((c) => {
    (c.documents || []).forEach((doc) => {
      const exists = records.some((r) => r.documentId === doc.id);
      if (!exists) {
        records.push({
          documentId: doc.id,
          documentName: doc.name,
          complaintId: c.id,
          complaintTitle: c.title,
          category: c.category,
          fileSize: doc.size,
          fileType: doc.type,
          dataUrl: doc.dataUrl,
          uploadedAt: doc.uploadedAt || c.submittedAt,
          likesCount: 0,
          likedBy: [],
          usageCount: 0,
          usageHistory: [],
        });
        changed = true;
      }
    });
  });

  if (changed) {
    saveTrackedDocuments(records);
  }
}
