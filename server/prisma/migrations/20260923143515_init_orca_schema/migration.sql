-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "organization" TEXT,
    "assignedRegion" TEXT,
    "district" TEXT,
    "landingCentre" TEXT,
    "baseLocationName" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PfzAdvisory" (
    "id" TEXT NOT NULL,
    "advisoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrlOrReference" TEXT,
    "publishedAt" TEXT NOT NULL,
    "validFrom" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL,
    "lastUpdatedAt" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "landingCentreId" TEXT NOT NULL,
    "landingCentreName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "polygonCoordinates" JSONB,
    "depth" DOUBLE PRECISION NOT NULL,
    "depthFathoms" DOUBLE PRECISION,
    "distanceFromLandingCentre" DOUBLE PRECISION NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "directionFromLandingCentre" TEXT NOT NULL,
    "bearingDegrees" DOUBLE PRECISION NOT NULL,
    "seaSurfaceTemperature" DOUBLE PRECISION NOT NULL,
    "chlorophyll" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetSpecies" JSONB NOT NULL,
    "languageVariants" JSONB,
    "version" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PfzAdvisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badgeNumber" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "baseLocationName" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "certifications" JSONB NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "assignedZoneIds" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "currentWorkload" INTEGER NOT NULL,
    "maxWorkload" INTEGER NOT NULL,
    "performance" JSONB NOT NULL,
    "gpsConsent" BOOLEAN NOT NULL,
    "lastActive" TEXT NOT NULL,
    "deviceSyncStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zoneType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "polygon" JSONB NOT NULL,
    "priority" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "primaryAgentId" TEXT NOT NULL,
    "backupAgentId" TEXT,
    "escalationAgentId" TEXT,
    "assignedAgentIds" JSONB NOT NULL,
    "supportedLanguages" JSONB NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "currentActiveCases" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterContact" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "region" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "assignedAgentName" TEXT,
    "assignedSupervisorId" TEXT,
    "relatedPfzId" TEXT,
    "slaDueTime" TEXT NOT NULL,
    "escalationLevel" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "closedAt" TEXT,
    "closureReason" TEXT,
    "feedbackRating" INTEGER,
    "feedbackNotes" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseComment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAttachment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TEXT NOT NULL,

    CONSTRAINT "CaseAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "dueTime" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "notes" JSONB NOT NULL,
    "attachments" JSONB NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "FieldTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosIncident" (
    "id" TEXT NOT NULL,
    "incidentCode" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "vesselRegNumber" TEXT,
    "emergencyType" TEXT NOT NULL,
    "peopleAffectedCount" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "nearestLandingCentre" TEXT NOT NULL,
    "distanceFromShoreKm" DOUBLE PRECISION NOT NULL,
    "assignedAgentIds" JSONB NOT NULL,
    "assignedSupervisorId" TEXT NOT NULL,
    "disasterAuthorityNotified" BOOLEAN NOT NULL DEFAULT false,
    "coastGuardCaseRef" TEXT,
    "timeline" JSONB NOT NULL,
    "mediaAttachments" JSONB,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "SosIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "recipientRole" TEXT,
    "recipientId" TEXT,
    "relatedRecordType" TEXT,
    "relatedRecordId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PfzAdvisory_advisoryId_key" ON "PfzAdvisory"("advisoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalZone_code_key" ON "OperationalZone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FieldTask_taskId_key" ON "FieldTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "SosIncident_incidentCode_key" ON "SosIncident"("incidentCode");

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
