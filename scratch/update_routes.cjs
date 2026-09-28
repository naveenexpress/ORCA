const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Users', 'navee', 'Downloads', 'Archive', 'server', 'src', 'routes.ts');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { validateResource')) {
  code = code.replace(
    "import { AIService } from './services/aiService';",
    "import { AIService } from './services/aiService';\nimport {\n  validateResource,\n  authRegisterSchema,\n  authLoginSchema,\n  userCreateSchema,\n  userUpdateSchema,\n  agentCreateSchema,\n  agentUpdateSchema,\n  pfzCreateSchema,\n  pfzUpdateSchema,\n  caseCreateSchema,\n  caseUpdateSchema,\n  notificationCreateSchema,\n  sosCreateSchema,\n  vesselCreateSchema,\n  vesselUpdateSchema,\n  voyageCreateSchema,\n  voyageUpdateSchema,\n  checkinCreateSchema,\n  communicationEventSchema,\n  safetyAlertSchema\n} from './validation';"
  );
}

const replacements = [
  { match: "router.post('/auth/register', async (req, res) => {", replace: "router.post('/auth/register', validateResource(authRegisterSchema), async (req, res) => {" },
  { match: "router.post('/auth/login', async (req, res) => {", replace: "router.post('/auth/login', validateResource(authLoginSchema), async (req, res) => {" },
  { match: "router.post('/users', async (req, res) => {", replace: "router.post('/users', validateResource(userCreateSchema), async (req, res) => {" },
  { match: "router.put('/users/:id', async (req, res) => {", replace: "router.put('/users/:id', validateResource(userUpdateSchema), async (req, res) => {" },
  { match: "router.post('/agents', async (req, res) => {", replace: "router.post('/agents', validateResource(agentCreateSchema), async (req, res) => {" },
  { match: "router.put('/agents/:id', async (req, res) => {", replace: "router.put('/agents/:id', validateResource(agentUpdateSchema), async (req, res) => {" },
  { match: "router.post('/pfz', async (req, res) => {", replace: "router.post('/pfz', validateResource(pfzCreateSchema), async (req, res) => {" },
  { match: "router.put('/pfz/:id', async (req, res) => {", replace: "router.put('/pfz/:id', validateResource(pfzUpdateSchema), async (req, res) => {" },
  { match: "router.post('/cases', async (req, res) => {", replace: "router.post('/cases', validateResource(caseCreateSchema), async (req, res) => {" },
  { match: "router.put('/cases/:id', async (req, res) => {", replace: "router.put('/cases/:id', validateResource(caseUpdateSchema), async (req, res) => {" },
  { match: "router.post('/notifications', async (req, res) => {", replace: "router.post('/notifications', validateResource(notificationCreateSchema), async (req, res) => {" },
  { match: "router.post('/sos', async (req, res) => {", replace: "router.post('/sos', validateResource(sosCreateSchema), async (req, res) => {" },
  // Note: SOS update isn't explicitly requested to be validated in the list, but I will map it loosely if needed or ignore it.
  { match: "router.post('/vessels', async (req, res) => {", replace: "router.post('/vessels', validateResource(vesselCreateSchema), async (req, res) => {" },
  { match: "router.put('/vessels/:id', async (req, res) => {", replace: "router.put('/vessels/:id', validateResource(vesselUpdateSchema), async (req, res) => {" },
  { match: "router.post('/voyages', async (req, res) => {", replace: "router.post('/voyages', validateResource(voyageCreateSchema), async (req, res) => {" },
  { match: "router.put('/voyages/:id', async (req, res) => {", replace: "router.put('/voyages/:id', validateResource(voyageUpdateSchema), async (req, res) => {" },
  { match: "router.post('/voyages/:id/checkin', async (req, res) => {", replace: "router.post('/voyages/:id/checkin', validateResource(checkinCreateSchema), async (req, res) => {" },
  { match: "router.post('/voyages/:id/communication', async (req, res) => {", replace: "router.post('/voyages/:id/communication', validateResource(communicationEventSchema), async (req, res) => {" },
  { match: "router.post('/alerts', async (req, res) => {", replace: "router.post('/alerts', validateResource(safetyAlertSchema), async (req, res) => {" }
];

for (const r of replacements) {
  if (code.includes(r.match)) {
    code = code.replace(r.match, r.replace);
  } else {
    console.log('Could not find:', r.match);
  }
}

fs.writeFileSync(file, code);
console.log('Routes updated successfully.');
