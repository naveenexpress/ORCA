import { z } from 'zod';

// Middleware for validation
export const validateResource = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(500).json({ error: 'Internal server error during validation' });
  }
};

export const authRegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  phone: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  baseLocationName: z.string().nullable().optional(),
  preferredLanguage: z.string().nullable().optional(),
}).passthrough();

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).passthrough();

export const userCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  avatar: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  assignedRegion: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  landingCentre: z.string().nullable().optional(),
  baseLocationName: z.string().nullable().optional(),
  preferredLanguage: z.string().nullable().optional(),
  isDemoAccount: z.boolean().nullable().optional(),
}).passthrough();

export const userUpdateSchema = userCreateSchema.partial();

export const agentCreateSchema = z.object({
  name: z.string(),
  badgeNumber: z.string(),
  avatar: z.string().nullable().optional(),
  phone: z.string(),
  email: z.string().email(),
  organization: z.string(),
  state: z.string(),
  district: z.string(),
  baseLocationName: z.string(),
  coordinates: z.any(),
  languages: z.any(),
  skills: z.any(),
  certifications: z.any(),
  experienceYears: z.number(),
  assignedZoneIds: z.any(),
  status: z.string(),
  currentWorkload: z.number(),
  maxWorkload: z.number(),
  performance: z.any(),
  gpsConsent: z.boolean(),
  lastActive: z.string(),
  deviceSyncStatus: z.string(),
}).passthrough();

export const agentUpdateSchema = agentCreateSchema.partial();

export const pfzCreateSchema = z.object({
  advisoryId: z.string(),
  name: z.string(),
  status: z.string(),
  source: z.string(),
  sourceUrlOrReference: z.string().nullable().optional(),
  publishedAt: z.string(),
  validFrom: z.string(),
  validUntil: z.string(),
  lastUpdatedAt: z.string(),
  region: z.string(),
  state: z.string(),
  district: z.string(),
  sector: z.string(),
  landingCentreId: z.string(),
  landingCentreName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  polygonCoordinates: z.any().optional(),
  depth: z.number(),
  depthFathoms: z.number().nullable().optional(),
  distanceFromLandingCentre: z.number(),
  distanceKm: z.number(),
  directionFromLandingCentre: z.string(),
  bearingDegrees: z.number(),
  seaSurfaceTemperature: z.number(),
  chlorophyll: z.number(),
  confidence: z.string(),
  description: z.string(),
  targetSpecies: z.any(),
  languageVariants: z.any().optional(),
  version: z.number(),
  createdBy: z.string(),
  approvedBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSimulated: z.boolean().optional(),
}).passthrough();

export const pfzUpdateSchema = pfzCreateSchema.partial();

export const caseCreateSchema = z.object({
  caseNumber: z.string(),
  requesterName: z.string(),
  requesterContact: z.string(),
  requesterRole: z.string(),
  requestType: z.string(),
  title: z.string(),
  description: z.string(),
  locationName: z.string(),
  coordinates: z.any(),
  region: z.string(),
  language: z.string(),
  priority: z.string(),
  status: z.string(),
  assignedAgentId: z.string().nullable().optional(),
  assignedAgentName: z.string().nullable().optional(),
  assignedSupervisorId: z.string().nullable().optional(),
  relatedPfzId: z.string().nullable().optional(),
  slaDueTime: z.string(),
  escalationLevel: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().nullable().optional(),
  closureReason: z.string().nullable().optional(),
  feedbackRating: z.number().nullable().optional(),
  feedbackNotes: z.string().nullable().optional(),
}).passthrough();

export const caseUpdateSchema = caseCreateSchema.partial();

export const sosCreateSchema = z.object({
  callerName: z.string(),
  callerPhone: z.string(),
  vesselRegNumber: z.string().nullable().optional(),
  emergencyType: z.string(),
  peopleAffectedCount: z.number(),
  severity: z.string(),
  status: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).passthrough(),
  locationDescription: z.string(),
  nearestLandingCentre: z.string().optional(),
  distanceFromShoreKm: z.number().optional(),
  assignedAgentIds: z.any(),
  assignedSupervisorId: z.string(),
  disasterAuthorityNotified: z.boolean().optional(),
  coastGuardCaseRef: z.string().nullable().optional(),
  timeline: z.any(),
  mediaAttachments: z.any().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  incidentCode: z.string().optional(),
}).passthrough();

export const notificationCreateSchema = z.object({
  type: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.string(),
  recipientRole: z.string().nullable().optional(),
  recipientId: z.string().nullable().optional(),
  relatedRecordType: z.string().nullable().optional(),
  relatedRecordId: z.string().nullable().optional(),
  isRead: z.boolean().optional(),
  createdAt: z.string(),
}).passthrough();

export const vesselCreateSchema = z.object({
  registrationNumber: z.string(),
  name: z.string(),
  ownerName: z.string(),
  contactPhone: z.string(),
  vesselType: z.string().nullable().optional(),
  homePort: z.string().nullable().optional(),
}).passthrough();
export const vesselUpdateSchema = vesselCreateSchema.partial();

export const voyageCreateSchema = z.object({
  vesselId: z.string(),
  status: z.string(),
  departureTime: z.string(),
  expectedReturnTime: z.string(),
  actualReturnTime: z.string().nullable().optional(),
  destinationArea: z.string().nullable().optional(),
  crewCount: z.number().optional(),
  lastLocationLat: z.number().nullable().optional(),
  lastLocationLng: z.number().nullable().optional(),
  lastLocationTime: z.string().nullable().optional(),
  lastCommunicationTime: z.string().nullable().optional(),
}).passthrough();
export const voyageUpdateSchema = voyageCreateSchema.partial();

export const checkinCreateSchema = z.object({
  voyageId: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.string(),
  notes: z.string().nullable().optional(),
}).passthrough();

export const communicationEventSchema = z.object({
  voyageId: z.string(),
  type: z.string(),
  status: z.string(),
  notes: z.string().nullable().optional(),
}).passthrough();

export const safetyAlertSchema = z.object({
  voyageId: z.string(),
  type: z.string(),
  severity: z.string(),
  message: z.string(),
  status: z.string(),
  resolvedAt: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
}).passthrough();
