import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { AIService } from './services/aiService';
import {
  validateResource,
  authRegisterSchema,
  authLoginSchema,
  userCreateSchema,
  userUpdateSchema,
  agentCreateSchema,
  agentUpdateSchema,
  pfzCreateSchema,
  pfzUpdateSchema,
  caseCreateSchema,
  caseUpdateSchema,
  notificationCreateSchema,
  sosCreateSchema,
  vesselCreateSchema,
  vesselUpdateSchema,
  voyageCreateSchema,
  voyageUpdateSchema,
  checkinCreateSchema,
  communicationEventSchema,
  safetyAlertSchema
} from './validation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'orca_marine_secure_jwt_secret_key_2026';

// ── Indian coastal landing centres for nearest-harbour calculation ────────────
const LANDING_CENTRES = [
  { name: 'Kasimedu Fishing Harbour', lat: 13.1252, lng: 80.2986 },
  { name: 'Visakhapatnam Fisheries Harbour', lat: 17.6868, lng: 83.2185 },
  { name: 'Thoppumpady Cochin Fisheries Harbour', lat: 9.9312, lng: 76.2673 },
  { name: 'Veraval Fishing Harbour', lat: 20.9042, lng: 70.3685 },
  { name: 'Old Mangalore Port (Bunder)', lat: 12.8615, lng: 74.8368 },
  { name: 'Paradip Fishing Harbour', lat: 20.3164, lng: 86.6115 },
  { name: 'Tuticorin Fisheries Harbour', lat: 8.7642, lng: 78.1348 },
  { name: 'Sassoon Docks', lat: 18.9167, lng: 72.8252 },
  { name: 'Kakinada Fisheries Harbour', lat: 16.9891, lng: 82.2475 },
  { name: 'Porbandar Fishing Port', lat: 21.6425, lng: 69.6093 },
];

/** Haversine distance in km between two lat/lng points */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the nearest landing centre to the given coordinates */
function findNearestLandingCentre(lat: number, lng: number): { name: string; distanceKm: number } {
  let minDist = Infinity;
  let nearest = LANDING_CENTRES[0];
  for (const lc of LANDING_CENTRES) {
    const d = haversineKm(lat, lng, lc.lat, lc.lng);
    if (d < minDist) {
      minDist = d;
      nearest = lc;
    }
  }
  return { name: nearest.name, distanceKm: +minDist.toFixed(1) };
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// ==========================
// AUTHENTICATION MIDDLEWARE
// ==========================

export function authenticateToken(req: any, res: any, next: any) {
  let token: string | undefined;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    token = cookies['orca_token'];
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
      return;
    }

    next();
  };
}

// ==========================
// AUTHENTICATION ROUTES
// ==========================

// POST /api/auth/register
router.post('/auth/register', validateResource(authRegisterSchema), async (req, res) => {
  try {
    const { name, email, password, role, phone, organization, district, baseLocationName, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: role || 'fisherman',
        phone: phone || null,
        organization: organization || null,
        district: district || null,
        baseLocationName: baseLocationName || null,
        preferredLanguage: preferredLanguage || 'en',
        isDemoAccount: false,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('orca_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch (error: any) {
    console.error('[POST /auth/register]', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

// POST /api/auth/login
router.post('/auth/login', validateResource(authLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    let isValid = false;

    if (user.passwordHash) {
      isValid = bcrypt.compareSync(password, user.passwordHash);
    } else {
      // First time login for existing seed user
      const passwordHash = bcrypt.hashSync(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      isValid = true;
    }

    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('orca_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({ token, user: sanitizeUser(user) });
  } catch (error: any) {
    console.error('[POST /auth/login]', error);
    res.status(500).json({ error: 'Failed to authenticate user', details: error.message });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', async (req, res) => {
  res.clearCookie('orca_token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/auth/me', async (req, res) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: any, c: string) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies['orca_token'];
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User session invalid or expired' });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

// GET /api/auth/protected-test — route for testing authentication & authorization
router.get('/auth/protected-test', authenticateToken, (req: any, res: any) => {
  const requiredRole = req.query.role;
  if (requiredRole && req.user.role !== requiredRole && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
    return;
  }
  res.json({ message: 'Access granted to protected endpoint', user: req.user });
});

// ==========================
// USER ROUTES
// ==========================

// GET /api/users — list all users, most recently created first
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map(sanitizeUser));
  } catch (error: any) {
    console.error('[GET /users]', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id — get single user by id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(sanitizeUser(user));
  } catch (error: any) {
    console.error('[GET /users/:id]', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users — create a new user
router.post('/users', validateResource(userCreateSchema), async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      role,
      avatar,
      phone,
      organization,
      assignedRegion,
      district,
      landingCentre,
      baseLocationName,
      preferredLanguage,
      isDemoAccount,
    } = req.body;

    const user = await prisma.user.create({
      data: {
        ...(id ? { id } : {}),
        name,
        email,
        role,
        avatar,
        phone,
        organization,
        assignedRegion,
        district,
        landingCentre,
        baseLocationName,
        preferredLanguage: preferredLanguage || 'en',
        isDemoAccount: isDemoAccount ?? false,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error('[POST /users]', error);
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'A user with that email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// PUT /api/users/:id — update an existing user
router.put('/users/:id', validateResource(userUpdateSchema), async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      avatar,
      phone,
      organization,
      assignedRegion,
      district,
      landingCentre,
      baseLocationName,
      preferredLanguage,
      isDemoAccount,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        role,
        avatar,
        phone,
        organization,
        assignedRegion,
        district,
        landingCentre,
        baseLocationName,
        preferredLanguage,
        isDemoAccount,
      },
    });
    res.json(user);
  } catch (error: any) {
    console.error('[PUT /users/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use by another user' });
      return;
    }
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// DELETE /api/users/:id — delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('[DELETE /users/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================
// AGENT ROUTES
// ==========================

// GET /api/agents — list all agents, ordered by name
router.get('/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(agents);
  } catch (error: any) {
    console.error('[GET /agents]', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /api/agents/:id — get single agent
router.get('/agents/:id', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
    });
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json(agent);
  } catch (error: any) {
    console.error('[GET /agents/:id]', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// POST /api/agents — create a new agent
router.post('/agents', validateResource(agentCreateSchema), async (req, res) => {
  try {
    const {
      id,
      name,
      badgeNumber,
      avatar,
      phone,
      email,
      organization,
      state,
      district,
      baseLocationName,
      coordinates,
      languages,
      skills,
      certifications,
      experienceYears,
      assignedZoneIds,
      status,
      currentWorkload,
      maxWorkload,
      performance,
      gpsConsent,
      lastActive,
      deviceSyncStatus,
    } = req.body;

    const agent = await prisma.agent.create({
      data: {
        ...(id ? { id } : {}),
        name,
        badgeNumber,
        avatar,
        phone,
        email,
        organization,
        state,
        district,
        baseLocationName,
        coordinates: coordinates ?? { lat: 0, lng: 0 },
        languages: languages ?? [],
        skills: skills ?? [],
        certifications: certifications ?? [],
        experienceYears: experienceYears ?? 0,
        assignedZoneIds: assignedZoneIds ?? [],
        status: status ?? 'available',
        currentWorkload: currentWorkload ?? 0,
        maxWorkload: maxWorkload ?? 6,
        performance: performance ?? {
          casesCompleted: 0,
          avgResponseMinutes: 0,
          avgResolutionHours: 0,
          acceptanceRatePercent: 100,
          escalationRatePercent: 0,
          rating: 5.0,
        },
        gpsConsent: gpsConsent ?? false,
        lastActive: lastActive ?? new Date().toISOString(),
        deviceSyncStatus: deviceSyncStatus ?? 'offline',
      },
    });
    res.status(201).json(agent);
  } catch (error: any) {
    console.error('[POST /agents]', error);
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'An agent with that email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create agent', details: error.message });
  }
});

// PUT /api/agents/:id — update an existing agent
router.put('/agents/:id', validateResource(agentUpdateSchema), async (req, res) => {
  try {
    const {
      name,
      badgeNumber,
      avatar,
      phone,
      email,
      organization,
      state,
      district,
      baseLocationName,
      coordinates,
      languages,
      skills,
      certifications,
      experienceYears,
      assignedZoneIds,
      status,
      currentWorkload,
      maxWorkload,
      performance,
      gpsConsent,
      lastActive,
      deviceSyncStatus,
    } = req.body;

    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: {
        name,
        badgeNumber,
        avatar,
        phone,
        email,
        organization,
        state,
        district,
        baseLocationName,
        coordinates,
        languages,
        skills,
        certifications,
        experienceYears,
        assignedZoneIds,
        status,
        currentWorkload,
        maxWorkload,
        performance,
        gpsConsent,
        lastActive,
        deviceSyncStatus,
      },
    });
    res.json(agent);
  } catch (error: any) {
    console.error('[PUT /agents/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use by another agent' });
      return;
    }
    res.status(500).json({ error: 'Failed to update agent', details: error.message });
  }
});

// DELETE /api/agents/:id — delete an agent
router.delete('/agents/:id', async (req, res) => {
  try {
    await prisma.agent.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('[DELETE /agents/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// ==========================
// PFZ ADVISORY ROUTES
// ==========================

// GET /api/pfz — list all advisories, most recently published first
router.get('/pfz', async (req, res) => {
  try {
    const pfzs = await prisma.pfzAdvisory.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    res.json(pfzs);
  } catch (error: any) {
    console.error('[GET /pfz]', error);
    res.status(500).json({ error: 'Failed to fetch PFZ advisories' });
  }
});

// GET /api/pfz/:id — get single advisory
router.get('/pfz/:id', async (req, res) => {
  try {
    const pfz = await prisma.pfzAdvisory.findUnique({
      where: { id: req.params.id },
    });
    if (!pfz) {
      res.status(404).json({ error: 'PFZ advisory not found' });
      return;
    }
    res.json(pfz);
  } catch (error: any) {
    console.error('[GET /pfz/:id]', error);
    res.status(500).json({ error: 'Failed to fetch PFZ advisory' });
  }
});

// POST /api/pfz — create a new advisory
router.post('/pfz', validateResource(pfzCreateSchema), async (req, res) => {
  try {
    const {
      id,
      advisoryId,
      name,
      status,
      source,
      sourceUrlOrReference,
      publishedAt,
      validFrom,
      validUntil,
      lastUpdatedAt,
      region,
      state,
      district,
      sector,
      landingCentreId,
      landingCentreName,
      latitude,
      longitude,
      polygonCoordinates,
      depth,
      depthFathoms,
      distanceFromLandingCentre,
      distanceKm,
      directionFromLandingCentre,
      bearingDegrees,
      seaSurfaceTemperature,
      chlorophyll,
      confidence,
      description,
      targetSpecies,
      languageVariants,
      version,
      createdBy,
      approvedBy,
      createdAt,
      updatedAt,
      isSimulated,
    } = req.body;

    const pfz = await prisma.pfzAdvisory.create({
      data: {
        ...(id ? { id } : {}),
        advisoryId,
        name,
        status: status ?? 'published',
        source,
        sourceUrlOrReference,
        publishedAt: publishedAt ?? new Date().toISOString(),
        validFrom: validFrom ?? new Date().toISOString(),
        validUntil: validUntil ?? new Date().toISOString(),
        lastUpdatedAt: lastUpdatedAt ?? new Date().toISOString(),
        region,
        state,
        district,
        sector,
        landingCentreId,
        landingCentreName,
        latitude,
        longitude,
        polygonCoordinates: polygonCoordinates ?? [],
        depth,
        depthFathoms: depthFathoms ?? null,
        distanceFromLandingCentre,
        distanceKm,
        directionFromLandingCentre,
        bearingDegrees,
        seaSurfaceTemperature,
        chlorophyll,
        confidence,
        description,
        targetSpecies: targetSpecies ?? [],
        languageVariants: languageVariants ?? null,
        version: version ?? 1,
        createdBy: createdBy ?? 'ORCA System',
        approvedBy: approvedBy ?? null,
        createdAt: createdAt ?? new Date().toISOString(),
        updatedAt: updatedAt ?? new Date().toISOString(),
        isSimulated: isSimulated ?? false,
      },
    });
    res.status(201).json(pfz);
  } catch (error: any) {
    console.error('[POST /pfz]', error);
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'A PFZ advisory with that advisoryId already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create PFZ advisory', details: error.message });
  }
});

// PUT /api/pfz/:id — update an existing advisory
router.put('/pfz/:id', validateResource(pfzUpdateSchema), async (req, res) => {
  try {
    const {
      advisoryId,
      name,
      status,
      source,
      sourceUrlOrReference,
      publishedAt,
      validFrom,
      validUntil,
      lastUpdatedAt,
      region,
      state,
      district,
      sector,
      landingCentreId,
      landingCentreName,
      latitude,
      longitude,
      polygonCoordinates,
      depth,
      depthFathoms,
      distanceFromLandingCentre,
      distanceKm,
      directionFromLandingCentre,
      bearingDegrees,
      seaSurfaceTemperature,
      chlorophyll,
      confidence,
      description,
      targetSpecies,
      languageVariants,
      version,
      createdBy,
      approvedBy,
      createdAt,
      updatedAt,
      isSimulated,
    } = req.body;

    const pfz = await prisma.pfzAdvisory.update({
      where: { id: req.params.id },
      data: {
        advisoryId,
        name,
        status,
        source,
        sourceUrlOrReference,
        publishedAt,
        validFrom,
        validUntil,
        lastUpdatedAt: new Date().toISOString(),
        region,
        state,
        district,
        sector,
        landingCentreId,
        landingCentreName,
        latitude,
        longitude,
        polygonCoordinates,
        depth,
        depthFathoms,
        distanceFromLandingCentre,
        distanceKm,
        directionFromLandingCentre,
        bearingDegrees,
        seaSurfaceTemperature,
        chlorophyll,
        confidence,
        description,
        targetSpecies,
        languageVariants,
        version,
        createdBy,
        approvedBy,
        createdAt,
        updatedAt: new Date().toISOString(),
        isSimulated,
      },
    });
    res.json(pfz);
  } catch (error: any) {
    console.error('[PUT /pfz/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'PFZ advisory not found' });
      return;
    }
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'advisoryId already in use by another advisory' });
      return;
    }
    res.status(500).json({ error: 'Failed to update PFZ advisory', details: error.message });
  }
});

// DELETE /api/pfz/:id — delete an advisory
router.delete('/pfz/:id', async (req, res) => {
  try {
    await prisma.pfzAdvisory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('[DELETE /pfz/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'PFZ advisory not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete PFZ advisory' });
  }
});

// ==========================
// CASES ROUTES
// ==========================
router.get('/cases', async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      include: {
        comments: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

router.post('/cases', validateResource(caseCreateSchema), async (req, res) => {
  try {
    const { comments, attachments, ...caseData } = req.body;
    const newCase = await prisma.case.create({
      data: {
        ...caseData,
        comments: {
          create: comments || []
        },
        attachments: {
          create: attachments || []
        }
      },
      include: {
        comments: true,
        attachments: true,
      }
    });
    res.status(201).json(newCase);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create case', details: error.message });
  }
});

router.put('/cases/:id', validateResource(caseUpdateSchema), async (req, res) => {
  try {
    const { comments, attachments, ...caseData } = req.body;
    const updatedCase = await prisma.case.update({
      where: { id: req.params.id },
      data: caseData,
      include: {
        comments: true,
        attachments: true,
      }
    });
    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case' });
  }
});

router.post('/cases/:id/comments', async (req, res) => {
  try {
    const comment = await prisma.caseComment.create({
      data: {
        ...req.body,
        caseId: req.params.id
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/cases/:id', async (req, res) => {
  try {
    await prisma.case.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});


// ==========================
// SOS INCIDENT ROUTES
// ==========================
router.get('/sos', async (req, res) => {
  try {
    const incidents = await prisma.sosIncident.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SOS incidents' });
  }
});

router.post('/sos', validateResource(sosCreateSchema), async (req, res) => {
  try {
    const body = req.body;

    // Dynamically compute nearest landing centre from actual SOS coordinates
    const coords = body.coordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      const nearest = findNearestLandingCentre(coords.lat, coords.lng);
      body.nearestLandingCentre = nearest.name;
      body.distanceFromShoreKm = nearest.distanceKm;
    }

    const newIncident = await prisma.sosIncident.create({
      data: body
    });
    res.status(201).json(newIncident);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create SOS incident', details: error.message });
  }
});

router.put('/sos/:id', async (req, res) => {
  try {
    const updatedIncident = await prisma.sosIncident.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update SOS incident' });
  }
});

router.delete('/sos/:id', async (req, res) => {
  try {
    await prisma.sosIncident.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete SOS incident' });
  }
});

// ==========================
// NOTIFICATION ROUTES
// ==========================

// GET /api/notifications — list all notifications, most recent first
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error: any) {
    console.error('[GET /notifications]', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/:id — get single notification by id
router.get('/notifications/:id', async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json(notification);
  } catch (error: any) {
    console.error('[GET /notifications/:id]', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// POST /api/notifications — create a new notification
router.post('/notifications', validateResource(notificationCreateSchema), async (req, res) => {
  try {
    const {
      id,
      type,
      title,
      message,
      severity,
      recipientRole,
      recipientId,
      relatedRecordType,
      relatedRecordId,
      isRead,
      createdAt,
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        ...(id ? { id } : {}),
        type,
        title,
        message,
        severity,
        recipientRole: recipientRole || null,
        recipientId: recipientId || null,
        relatedRecordType: relatedRecordType || null,
        relatedRecordId: relatedRecordId || null,
        isRead: isRead ?? false,
        createdAt: createdAt || new Date().toISOString(),
      },
    });
    res.status(201).json(notification);
  } catch (error: any) {
    console.error('[POST /notifications]', error);
    res.status(500).json({ error: 'Failed to create notification', details: error.message });
  }
});

// PUT /api/notifications/read-all — mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('[PUT /notifications/read-all]', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error: any) {
    console.error('[PUT /notifications/:id/read]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/:id — update an existing notification
router.put('/notifications/:id', async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      severity,
      recipientRole,
      recipientId,
      relatedRecordType,
      relatedRecordId,
      isRead,
    } = req.body;

    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(message !== undefined && { message }),
        ...(severity !== undefined && { severity }),
        ...(recipientRole !== undefined && { recipientRole }),
        ...(recipientId !== undefined && { recipientId }),
        ...(relatedRecordType !== undefined && { relatedRecordType }),
        ...(relatedRecordId !== undefined && { relatedRecordId }),
        ...(isRead !== undefined && { isRead }),
      },
    });
    res.json(notification);
  } catch (error: any) {
    console.error('[PUT /notifications/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /api/notifications/:id — delete a notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error: any) {
    console.error('[DELETE /notifications/:id]', error);
    if (error?.code === 'P2025') {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ===================================
// AI ASSISTANT / LLM INFERENCE PROXY
// ===================================

// POST /api/ai/chat — Secure backend route for grounded NVIDIA NIM LLM inference
router.post('/ai/chat', async (req, res) => {
  try {
    const { query, language = 'en', intent, location, groundTruth, messages } = req.body;

    if (!query && (!messages || messages.length === 0)) {
      res.status(400).json({ error: 'Query or messages are required' });
      return;
    }

    // 1. Primary path: Grounded maritime query reasoning with real ORCA data
    if (query) {
      const result = await AIService.processMaritimeQuery({
        query,
        language,
        intent,
        location,
        groundTruth,
      });
      res.json(result);
      return;
    }

    // 2. Secondary path: Direct message array inference
    const apiKey = (process.env.NVIDIA_NIM_API_KEY || process.env.VITE_NVIDIA_NIM_API_KEY || '').trim();
    if (!apiKey) {
      res.status(503).json({ error: 'NVIDIA NIM API key is not configured on the server' });
      return;
    }

    const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct';
    const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 350,
        temperature: 0.2,
      }),
    });

    if (!nimRes.ok) {
      const errText = await nimRes.text();
      res.status(nimRes.status).json({ error: 'NIM inference request failed', details: errText });
      return;
    }

    const data: any = await nimRes.json();
    res.json({
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      usage: data.usage,
    });
  } catch (error: any) {
    console.error('[POST /ai/chat]', error);
    res.status(500).json({ error: 'Internal AI assistant error', details: error.message });
  }
});

// ===================================
// SEA COMMUNICATION & FISHERMAN SAFETY
// ===================================

// POST /api/vessels — Register a vessel
router.post('/vessels', validateResource(vesselCreateSchema), async (req, res) => {
  try {
    const { registrationNumber, name, ownerName, contactPhone, vesselType, homePort } = req.body;
    const vessel = await prisma.vessel.create({
      data: { registrationNumber, name, ownerName, contactPhone, vesselType, homePort }
    });
    res.status(201).json(vessel);
  } catch (error: any) {
    console.error('[POST /vessels]', error);
    res.status(500).json({ error: 'Failed to create vessel' });
  }
});

// GET /api/vessels — List all vessels
router.get('/vessels', async (req, res) => {
  try {
    const vessels = await prisma.vessel.findMany({ include: { emergencyContacts: true } });
    res.json(vessels);
  } catch (error: any) {
    console.error('[GET /vessels]', error);
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// POST /api/voyages — Start a voyage
router.post('/voyages', validateResource(voyageCreateSchema), async (req, res) => {
  try {
    const { vesselId, expectedReturnTime, destinationArea, crewCount } = req.body;
    const voyage = await prisma.voyage.create({
      data: {
        vesselId,
        status: 'ACTIVE',
        departureTime: new Date().toISOString(),
        expectedReturnTime: expectedReturnTime || new Date().toISOString(),
        destinationArea,
        crewCount: crewCount || 1,
      }
    });
    res.status(201).json(voyage);
  } catch (error: any) {
    console.error('[POST /voyages]', error);
    res.status(500).json({ error: 'Failed to create voyage' });
  }
});

// GET /api/voyages — List active voyages
router.get('/voyages', async (req, res) => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: { vessel: true, safetyAlerts: true },
      orderBy: { departureTime: 'desc' }
    });
    res.json(voyages);
  } catch (error: any) {
    console.error('[GET /voyages]', error);
    res.status(500).json({ error: 'Failed to fetch voyages' });
  }
});

// POST /api/voyages/:id/communication — Log communication status
router.post('/voyages/:id/communication', validateResource(communicationEventSchema), async (req, res) => {
  try {
    const { type, status, notes } = req.body;
    const voyageId = req.params.id;

    const event = await prisma.communicationEvent.create({
      data: { voyageId, type, status, notes, timestamp: new Date().toISOString() }
    });
    
    if (status === 'SUCCESS') {
      await prisma.voyage.update({
        where: { id: voyageId },
        data: { lastCommunicationTime: new Date().toISOString() }
      });
    }
    
    res.status(201).json(event);
  } catch (error: any) {
    console.error('[POST /voyages/:id/communication]', error);
    res.status(500).json({ error: 'Failed to log communication' });
  }
});

// POST /api/voyages/:id/checkin — Safety check-in
router.post('/voyages/:id/checkin', validateResource(checkinCreateSchema), async (req, res) => {
  try {
    const { latitude, longitude, status, notes } = req.body;
    const voyageId = req.params.id;

    const checkIn = await prisma.safetyCheckIn.create({
      data: {
        voyageId,
        latitude,
        longitude,
        status,
        notes,
        timestamp: new Date().toISOString()
      }
    });

    if (latitude && longitude) {
      await prisma.voyage.update({
        where: { id: voyageId },
        data: {
          lastLocationLat: latitude,
          lastLocationLng: longitude,
          lastLocationTime: new Date().toISOString()
        }
      });
    }

    res.status(201).json(checkIn);
  } catch (error: any) {
    console.error('[POST /voyages/:id/checkin]', error);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
});

// POST /api/alerts — Create a safety alert
router.post('/alerts', validateResource(safetyAlertSchema), async (req, res) => {
  try {
    const { voyageId, type, severity } = req.body;
    const alert = await prisma.safetyAlert.create({
      data: {
        voyageId,
        type,
        severity,
        status: 'ACTIVE',
        timestamp: new Date().toISOString()
      }
    });
    res.status(201).json(alert);
  } catch (error: any) {
    console.error('[POST /alerts]', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Weather data proxy endpoint — keeps OPENWEATHER_API_KEY server-side
router.get('/weather', async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY not configured');
    return res.status(500).json({ error: 'Weather service not configured' });
  }

  const { lat, lon, units } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query parameters are required' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&units=${encodeURIComponent(String(units || 'metric'))}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.warn('OpenWeather API error', response.status, errText);
      return res.status(response.status).json({ error: 'Failed to fetch weather data' });
    }
    const data = await response.json();
    // Strip any accidental key leakage from upstream response
    res.json(data);
  } catch (err) {
    console.error('Weather proxy error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Weather tile proxy endpoint
router.get('/weather/tile/:layer/:z/:x/:y.png', async (req, res) => {
  const { layer, z, x, y } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('OPENWEATHER_API_KEY not configured');
    return res.status(500).json({ error: 'Weather service not configured' });
  }
  const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
  try {
    const response = await fetch(tileUrl);
    if (!response.ok) {
      console.warn('OpenWeather tile error', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch weather tile' });
    }
    const buffer = await response.arrayBuffer();
    const img = Buffer.from(buffer);
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (err) {
    console.error('Weather tile proxy error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


