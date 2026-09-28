# ORCA — Ocean Reasoning with Collaborative Agents

> **A zero-cost, mission-critical prototype for Marine Intelligence, Potential Fishing Zone (PFZ) Advisories, Multilingual AI Assistance, Autonomous Agent Allocation, and Maritime SOS Emergency Coordination.**

---

## 🌊 Overview

**ORCA (Ocean Reasoning with Collaborative Agents)** is an agentic AI-powered marine intelligence platform designed for fishermen, boat owners, coastal extension agents, operations supervisors, disaster management authorities, marine scientists, and platform administrators.

It integrates satellite-derived oceanographic telemetry (Sea Surface Temperature thermal gradients and Chlorophyll-a fronts) inspired by the **Indian National Centre for Ocean Information Services (INCOIS)** with an explainable multi-agent allocation engine, multi-role dashboards, offline-first field synchronization, and an agentic Search and Rescue (SAR) emergency coordination framework.

---

## ✨ Key Capabilities

1. 🎣 **Dedicated Fisherman Operations Center**:
   - Simplified high-contrast navigation HUD with compass bearings (°), nautical distances (NM & km), operational depth (m & fathoms), and target pelagic species (Yellowfin Tuna, Mackerel, Seer fish, Squid).
   - Real-time significant wave height and surface wind safety bulletins.
   - Simulated voice audio advisory broadcast in English and regional Indian languages.
   - Immediate 1-Click Emergency SOS trigger with safeguard confirmations.

2. 🚨 **Disaster Authority & SAR Incident Command**:
   - Real-time maritime SOS distress beacon triage queue.
   - Direct integration link with **Indian Coast Guard MRCC (Hotline 1554)** and State Disaster Management Authorities (SDMA).
   - Incident command state machine (`received` &rarr; `assigned` &rarr; `responding` &rarr; `escalated` &rarr; `resolved` &rarr; `closed`).
   - Regional emergency weather and gale warning broadcast tool.

3. 🔬 **Marine Research & Intelligence Workbench**:
   - High-resolution Recharts visualizations for Sea Surface Temperature (SST) diurnal curves vs Chlorophyll-a bio-optic gradients.
   - Bathymetric catch abundance distributions by depth isobaths (10m to 120m).
   - Ground-truth catch validation accuracy tracking across Indian coastal sectors.
   - 1-Click export of oceanographic datasets in **CSV** and **GeoJSON** spatial formats.

4. 📱 **Offline-Capable Field Extension Agent Deck**:
   - Disconnected task management queue with IndexedDB local caching.
   - GPS check-in/tracking toggle with explicit consent governance.
   - Field activity logs, photo/document note attachments, and rapid advisory briefings.

5. 👔 **Supervisor Workload & AI Allocation Cockpit**:
   - Autonomous multi-criteria matching engine balancing distance (Haversine), language match, workload capacity, and certified skills.
   - Natural language explainability rationale (*"Assigned to Agent Kavita because: fluent in Tamil, 6.2 km away, capacity 2/6"*).
   - Manual supervisor override workflow with mandatory audit trail justification.

6. 🗺️ **Interactive Marine GIS Map (Leaflet)**:
   - Configurable tile providers (CartoDB Dark Matter, OpenStreetMap Standard, Esri Ocean Satellite) with full compliant attribution.
   - Overlays: PFZ polygons (color-coded by confidence), Landing Centres / Harbours, Live Agent positions, Operational Zones, Pulsing SOS beacons, and Bathymetry ruler tool.

7. 💬 **Multilingual AI Assistant (ORCA Assistant)**:
   - Natural language reasoning with intent recognition for fishing advisories, navigation compass bearings, wave forecasts, and emergency triage.
   - Verified INCOIS data source citations and interactive card previews.
   - Seamless human field agent handoff.

---

## 🛠️ Technology Stack

- **Frontend**: React 18+ (Vite, TypeScript, React Router DOM v7)
- **Styling**: Tailwind CSS (Bespoke high-contrast marine palette `#030712`, `#060d1f`, `#0b152d`, `#0284c7`, `#00f0ff`, `#ef4444`)
- **State Management**: Zustand (Auth, PFZ, Agents, Cases, SOS, Notifications, Offline Queue, Map)
- **GIS & Mapping**: Leaflet, React Leaflet (Configurable OpenStreetMap compliant tile layers)
- **Data Visualizations**: Recharts (Oceanographic SST curves, bathymetric catch distributions)
- **Icons & UI**: Lucide React, Framer Motion
- **Internationalization**: i18next & react-i18next supporting 6 Indian languages:
  - English (`en`)
  - Hindi (`hi` — हिंदी)
  - Tamil (`ta` — தமிழ்)
  - Telugu (`te` — తెలుగు)
  - Malayalam (`ml` — മലയാളം)
  - Bengali (`bn` — বাংলা)
- **Testing**: Vitest & React Testing Library

---

## 👥 Demo User Accounts (Instant Role Switching)

The application includes 7 pre-configured demo user accounts accessible via the top-bar role selector:

| Role | Demo Account Name | Email | Focus Area |
| :--- | :--- | :--- | :--- |
| **Fisherman / Public** | Murugan Selvam | `fisherman@orca.marine` | Kasimedu Fishing Harbour (Tamil Nadu) |
| **Disaster Authority** | Cmdr. Rajesh Nambiar (Retd.) | `authority@orca.marine` | SDMA Maritime Cell / Coast Guard SAR |
| **Marine Researcher** | Dr. Ananya Ray | `researcher@orca.marine` | NIOT / INCOIS Satellite Oceanography |
| **Field Agent** | Kavita Sundaram | `agent@orca.marine` | Kasimedu Coastal Extension Bureau |
| **Supervisor** | Suresh Varma | `supervisor@orca.marine` | Operations Command (Coromandel Corridor) |
| **Administrator** | Antony David | `admin@orca.marine` | Central Systems Directorate & RBAC |
| **Analyst** | Priyanka Sen | `analyst@orca.marine` | Marine Spatial Analytics Lab |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🗺️ Application Routes

- `/` &mdash; Public Landing Portal & Quick Role Explorer
- `/dashboard` &mdash; Role-Aware Operations Dashboard (Fisherman, Authority, Research, Agent, Supervisor, Admin, Analyst)
- `/map` &mdash; Fullscreen Interactive Marine GIS Operations Map
- `/pfz` &mdash; PFZ Advisory Explorer & Multi-Factor Filter
- `/pfz/:id` &mdash; PFZ Advisory Detail Sheet & Bathymetric Profile
- `/allocation` &mdash; Autonomous Multi-Agent Allocation Matrix
- `/agents` &mdash; Field Extension Agent Directory
- `/agents/:id` &mdash; Field Officer Profile & Competency Brevets
- `/tasks` &mdash; Field Tasks Management Queue
- `/tasks/:id` &mdash; Task Execution & Activity Logging
- `/cases` &mdash; Service Requests & Inquiries Workspace
- `/cases/:id` &mdash; Case Detail, Activity Stream & SLA Tracking
- `/sos` &mdash; Maritime Emergency SOS Incident Command
- `/sos/:id` &mdash; SOS Incident Telemetry & SAR Timeline
- `/chat` &mdash; Multilingual ORCA AI Maritime Assistant
- `/notifications` &mdash; Real-Time Broadcast & Alert Center
- `/reports` &mdash; Intelligence Reports & CSV Data Export
- `/users` &mdash; RBAC Governance & User Management
- `/zones` &mdash; Operational Service Zones & Capacity Management
- `/data-sources` &mdash; Remote Sensing & INCOIS Ingestion Feeds
- `/audit-logs` &mdash; Tamper-Proof Operations Audit Trail
- `/settings` &mdash; System Preferences, Units & Offline Simulation
- `/help` &mdash; User Guide & Statutory Documentation
- `/login`, `/register`, `/forgot-password` &mdash; Authentication Flows

---

## 🏛️ Regulatory & Statutory Disclaimers

> **Advisory Notice:** Potential Fishing Zone (PFZ) information provided in this application is an *oceanographic advisory* derived from satellite measurements of Sea Surface Temperature and Chlorophyll-a. It is **not a guarantee** of fish catch, nor a replacement for official marine weather warnings, navigation charts, or Indian Coast Guard directives.
>
> **Emergency Helpline:** For immediate life-safety emergencies at sea, contact the **Indian Coast Guard Maritime Rescue Toll-Free Hotline: 1554** or VHF Marine Emergency Channel 16 (156.800 MHz).
