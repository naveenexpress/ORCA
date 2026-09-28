export type UserRole = 
  | 'fisherman' 
  | 'disaster_authority' 
  | 'researcher' 
  | 'agent' 
  | 'supervisor' 
  | 'admin' 
  | 'analyst';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn' | 'bn';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  organization?: string;
  assignedRegion?: string;
  district?: string;
  landingCentre?: string;
  baseLocationName?: string;
  preferredLanguage: LanguageCode;
  isDemoAccount?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PfzStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'published' 
  | 'expired' 
  | 'withdrawn' 
  | 'archived';

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LandingCentre {
  id: string;
  name: string;
  state: string;
  district: string;
  coordinates: Coordinates;
  majorSpecies: string[];
  activeBoatsCount: number;
  harbourType: 'Major Port' | 'Minor Fishing Harbour' | 'Traditional Fish Landing Centre';
}

export interface PfzAdvisory {
  id: string;
  advisoryId: string;
  name: string;
  status: PfzStatus;
  source: string;
  sourceUrlOrReference: string;
  publishedAt: string;
  validFrom: string;
  validUntil: string;
  lastUpdatedAt: string;
  region: string;
  state: string;
  district: string;
  sector: string;
  landingCentreId: string;
  landingCentreName: string;
  latitude: number;
  longitude: number;
  polygonCoordinates?: [number, number][];
  depth: number; // in meters
  depthFathoms?: number;
  distanceFromLandingCentre: number; // in Nautical Miles & km
  distanceKm: number;
  directionFromLandingCentre: string; // e.g., SSW, ENE, SE
  bearingDegrees: number; // 0 - 360
  seaSurfaceTemperature: number; // in Celsius e.g. 28.4
  chlorophyll: number; // in mg/m3 e.g. 0.85
  confidence: ConfidenceLevel;
  description: string;
  targetSpecies: string[];
  languageVariants?: Record<string, { name: string; description: string; direction: string }>;
  version: number;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  isSimulated: boolean;
}

export type AgentStatus = 'available' | 'busy' | 'offline' | 'on_leave' | 'suspended' | 'inactive';

export interface AgentSkill {
  id: string;
  name: string;
  category: 'Marine Safety' | 'Multilingual Support' | 'First Aid' | 'Gear Inspection' | 'Community Outreach' | 'GIS Navigation';
}

export interface Agent {
  id: string;
  name: string;
  badgeNumber: string;
  avatar?: string;
  phone: string;
  email: string;
  organization: string;
  state: string;
  district: string;
  baseLocationName: string;
  coordinates: Coordinates;
  languages: LanguageCode[];
  skills: string[];
  certifications: string[];
  experienceYears: number;
  assignedZoneIds: string[];
  status: AgentStatus;
  currentWorkload: number;
  maxWorkload: number;
  performance: {
    casesCompleted: number;
    avgResponseMinutes: number;
    avgResolutionHours: number;
    acceptanceRatePercent: number;
    escalationRatePercent: number;
    rating: number; // 1-5
  };
  gpsConsent: boolean;
  lastActive: string;
  deviceSyncStatus: 'online' | 'synced' | 'pending_sync' | 'offline';
}

export type ZonePriority = 'Critical' | 'High' | 'Normal' | 'Low';

export interface OperationalZone {
  id: string;
  name: string;
  code: string;
  zoneType: 'Coastal Patrol' | 'Harbour Service' | 'Offshore Marine Buffer' | 'High Risk Advisory Zone';
  description: string;
  polygon: [number, number][];
  priority: ZonePriority;
  capacity: number;
  status: 'active' | 'understaffed' | 'congested' | 'inactive';
  primaryAgentId: string;
  backupAgentId?: string;
  escalationAgentId?: string;
  assignedAgentIds: string[];
  supportedLanguages: LanguageCode[];
  state: string;
  district: string;
  currentActiveCases: number;
  version: number;
  updatedAt: string;
}

export type CasePriority = 'CRITICAL_SOS' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseStatus = 
  | 'new' 
  | 'unassigned' 
  | 'assigned' 
  | 'accepted' 
  | 'in_progress' 
  | 'waiting_info' 
  | 'escalated' 
  | 'resolved' 
  | 'closed' 
  | 'cancelled';

export interface CaseAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'audio' | 'location';
  url: string;
  uploadedAt: string;
}

export interface CaseComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  requesterName: string;
  requesterContact: string;
  requesterRole: 'fisherman' | 'boat_owner' | 'public' | 'agent';
  requestType: 'PFZ Advisory Clarification' | 'Engine Breakdown Support' | 'Harbour Clearance' | 'Weather Hazard Report' | 'Gear Loss Claim' | 'SOS Emergency';
  title: string;
  description: string;
  locationName: string;
  coordinates: Coordinates;
  region: string;
  language: LanguageCode;
  priority: CasePriority;
  status: CaseStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedSupervisorId?: string;
  relatedPfzId?: string;
  slaDueTime: string;
  escalationLevel: number;
  attachments: CaseAttachment[];
  comments: CaseComment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closureReason?: string;
  feedbackRating?: number;
  feedbackNotes?: string;
}

export type TaskStatus = 'pending' | 'accepted' | 'in_progress' | 'paused' | 'escalated' | 'completed' | 'rejected';

export interface FieldTask {
  id: string;
  taskId: string;
  caseId: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  priority: CasePriority;
  status: TaskStatus;
  locationName: string;
  coordinates: Coordinates;
  dueTime: string;
  rejectionReason?: string;
  notes: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export type SosEmergencyType = 
  | 'Medical Emergency at Sea' 
  | 'Vessel Engine Breakdown / Drifting' 
  | 'Missing Fishermen / Capsize' 
  | 'Extreme Weather / Cyclone Trap' 
  | 'Vessel Collision' 
  | 'Stranded on Reef / Shoal' 
  | 'Other Maritime Threat';

export type SosStatus = 
  | 'created' 
  | 'location_pending' 
  | 'received' 
  | 'assigned' 
  | 'acknowledged' 
  | 'responding' 
  | 'escalated' 
  | 'resolved' 
  | 'closed' 
  | 'cancelled';

export interface SosIncident {
  id: string;
  incidentCode: string;
  callerName: string;
  callerPhone: string;
  vesselRegNumber?: string;
  emergencyType: SosEmergencyType;
  peopleAffectedCount: number;
  severity: 'CRITICAL_LIFE_THREAT' | 'SEVERE' | 'MODERATE';
  status: SosStatus;
  coordinates: Coordinates;
  locationDescription: string;
  nearestLandingCentre: string;
  distanceFromShoreKm: number;
  assignedAgentIds: string[];
  assignedSupervisorId: string;
  disasterAuthorityNotified: boolean;
  coastGuardCaseRef?: string;
  timeline: {
    time: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
  mediaAttachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 
    | 'new_pfz' 
    | 'pfz_update' 
    | 'pfz_expiry' 
    | 'case_assigned' 
    | 'case_escalated' 
    | 'sos_alert' 
    | 'sos_status_change' 
    | 'system_alert';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  recipientRole?: UserRole | 'all';
  recipientId?: string;
  relatedRecordType?: 'pfz' | 'case' | 'sos' | 'agent';
  relatedRecordId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'agent' | 'system';
  senderName?: string;
  text: string;
  timestamp: string;
  language: LanguageCode;
  confidenceScore?: number;
  isVerifiedData?: boolean;
  sourceCitation?: string;
  quickActions?: { label: string; action: string; payload?: any }[];
  cardPreview?: {
    type: 'pfz' | 'case' | 'sos' | 'agent' | 'weather';
    data: any;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'PFZ' | 'AGENT' | 'ZONE' | 'CASE' | 'SOS' | 'AUTH' | 'SYSTEM';
  resourceId: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'SECURITY' | 'CRITICAL';
}

export interface AllocationExplanation {
  agentId: string;
  agentName: string;
  score: number;
  distanceKm: number;
  distanceScore: number;
  workloadScore: number;
  languageMatchScore: number;
  skillMatchScore: number;
  ratingScore: number;
  reasonText: string;
  matchedLanguages: string[];
  matchedSkills: string[];
}
