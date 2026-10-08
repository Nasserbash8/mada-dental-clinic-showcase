# Mada Dental Clinic — Clinic Website, Patient Portal & Doctor Dashboard

A full-stack platform for a real dental clinic: a public website, a read-only **patient portal** that patients open with a short access code, and a **doctor dashboard** to manage patient files, treatments, teeth, payments, photos and appointments.

> **Showcase repository.** The code here is abridged on purpose: the data layer (models, database connection, secrets) is redacted and several modules are shortened, so the repository shows the *structure, design and API patterns* without any real data, keys or schema. All screenshots use demo data.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js (App Router, server components, API routes) |
| Language | TypeScript |
| Styling | Tailwind CSS, CSS variables for light/dark themes |
| UI | MUI (tabs), Lucide icons, FullCalendar, lightbox gallery |
| Auth | Doctor: signed session in an HttpOnly cookie · Patient: NextAuth with an access code |
| Data | Document database behind a thin data layer (redacted here) |
| Media | External image hosting for X-rays and clinical photos |
| i18n | Arabic (RTL) interface, Intl-based number/date formatting |

---

## Features

### 1. Public website
- Hero section with a call to action (WhatsApp booking) and the clinic address and phone numbers.
- **Services** with real photos, **Why choose us**, **Doctors**, About and Contact pages.
- Light theme by default, with a **dark theme** toggle; fully **responsive** (320 px phones up to large desktops) with a full-screen mobile menu.

| Home | Services |
| --- | --- |
| ![Home](./public/screenshots/site-home.png) | ![Services](./public/screenshots/site-services.png) |

| Why choose us | Doctors |
| --- | --- |
| ![Why choose us](./public/screenshots/site-why.png) | ![Doctors](./public/screenshots/site-doctors.png) |

| About | Contact |
| --- | --- |
| ![About](./public/screenshots/site-about.png) | ![Contact](./public/screenshots/site-contact.png) |

**Dark theme and mobile**

<p>
<img src="./public/screenshots/site-home-dark.png" width="520" alt="Home - dark">
<img src="./public/screenshots/site-doctors-dark.png" width="520" alt="Doctors - dark">
</p>
<p>
<img src="./public/screenshots/site-home-mobile.png" width="240" alt="Home - mobile">
<img src="./public/screenshots/site-services-mobile.png" width="240" alt="Services - mobile">
</p>

---

### 2. Patient portal (access with a code)
- When the doctor creates a patient file, the system generates a **unique code** (two letters + four digits, e.g. `AB-1234`). There are **no passwords**: the code is the key.
- The doctor writes the code on the clinic's **card**; the card also carries a **QR code** that opens the login page, so the patient only types the code. The login form forgives typing differences (case, spaces, Arabic digits).
- Once signed in, the patient sees a **read-only** account:
  - treatments and the treated teeth on a **dental map** (custom per-tooth treatments are marked),
  - session history with dates and notes,
  - **payments, remaining balance per currency** and the currency of every payment,
  - medicines, illnesses and the doctor's notes,
  - X-rays and photos in a lightbox gallery,
  - the **next appointment**.
- Server-side guard: a patient can only open **their own** file.

| Login with the card code (mobile) | Account (mobile) | Account, dark (mobile) |
| --- | --- | --- |
| <img src="./public/screenshots/patient-login-mobile.png" width="220"> | <img src="./public/screenshots/patient-profile-1-mobile.png" width="220"> | <img src="./public/screenshots/patient-profile-2-mobile-dark.png" width="220"> |

![Patient account](./public/screenshots/patient-profile-1.png)
![Treatments, teeth and balance](./public/screenshots/patient-profile-2.png)

<p>
<img src="./public/screenshots/patient-profile-1-dark.png" width="520" alt="Patient account - dark">
<img src="./public/screenshots/patient-profile-2-dark.png" width="520" alt="Balance - dark">
</p>

---

### 3. Doctor dashboard
- **Secure sign-in** and a route guard (plus a maintenance switch that sends the whole dashboard to a maintenance page).
- **Home** with clinic statistics and recent patients.
- **Smart search** over the patient list by name or code, with pagination.
- **Add patient** in one form: personal data, illnesses (multi-select), medicines, photos, first treatment with its cost and currency, treated teeth and the first payment.
- **Full control** of every file: edit personal data, add/edit/delete treatments and sessions, manage the photo gallery, set the next appointment, delete a file.

| Sign in | Home |
| --- | --- |
| ![Dashboard sign in](./public/screenshots/dashboard-login.png) | ![Dashboard home](./public/screenshots/dashboard-home.png) |

![Add patient](./public/screenshots/add-patient.png)

---

### 4. Anatomical dental map
- The mouth is divided into **four quadrants of eight teeth**.
- Select a whole quadrant or a "smile" group (front 6 / 8 / 10 teeth) for treatments such as whitening, then add a **custom treatment for a single tooth** (for example a required shade). Teeth with a custom treatment get a red marker.
- Group ids are expanded to single teeth in one place (`src/utils/toothGroups.ts`) and shown as short labels (`src/utils/summarizeTeeth.ts`).

![Patient profile and dental map](./public/screenshots/dashboard-patient-profile.png)
![Treatments and sessions](./public/screenshots/dashboard-patient-profile-2.png)

---

### 5. Treatments, sessions and multi-currency payments
- A treatment has a cost and a currency; every **session payment keeps its own currency** (SYP, USD or EUR).
- **Remaining balance** = treatment cost − payments in the *same* currency, never below zero, summed per currency. Payments in another currency are listed separately and are never converted.
- Input is validated against an allow-list on the server (no silent currency defaults).

---

### 6. Appointments calendar
- One day view that merges **appointment requests** and the **next-session dates** of patients; clicking a patient opens their file.
- Add an appointment (name, phone, date, time, notes) from a modal; new requests start as "pending".

---

### 7. Dark mode and mobile (dashboard)

<p>
<img src="./public/screenshots/dashboard-home-dark.png" width="520" alt="Dashboard home - dark">
<img src="./public/screenshots/dashboard-patient-profile-dark.png" width="520" alt="Patient profile - dark">
</p>
<p>
<img src="./public/screenshots/dashboard-home-mobile.png" width="240" alt="Dashboard home - mobile">
<img src="./public/screenshots/dashboard-patient-profile-mobile.png" width="240" alt="Patient profile - mobile">
<img src="./public/screenshots/dashboard-patient-profile-mobile-dark.png" width="240" alt="Patient profile - mobile dark">
<img src="./public/screenshots/add-patient-mobile.png" width="240" alt="Add patient - mobile">
</p>

---

## Architecture

```
src/
├─ app/
│  ├─ (views)/            public site + patient portal (login, profile)
│  ├─ (admin1)/dashboard/ doctor dashboard (home, patients, add patient, profile, calendar)
│  └─ api/                REST-style routes: patients, appointments, admin auth
├─ components/            UI building blocks (modals, tables, calendar, dental map, forms)
├─ hooks/                 usePatientPatch (shared save flow), useTeethLogic (selector state)
├─ utils/                 toothGroups, summarizeTeeth, patientCode, normalizeDigits, data-layer contracts
└─ middleware.ts          route guard + maintenance switch
```

### API design in short
- Every route starts with an **auth guard**, then validates input, then performs the action and revalidates cached pages.
- `PATCH /api/patients/[patientId]` is **sparse**: the body says what to change (personal fields, a new treatment, a new/updated session, deletions by id, image upload/removal), so one endpoint serves every edit form.
- Errors are translated in one place into safe HTTP responses (no internal messages leaked).
- Storage, token signing, cookies and image hosting sit behind small interfaces (`src/app/api/_sample-ports.ts`), which is what keeps this repository free of secrets.

---

## About this repository

- The data layer is intentionally redacted, so the project does not run as-is; it is published to show structure, UI and API patterns.
- No keys, connection strings or database schema are included, and the screenshots contain demo data only.
- Based on the open-source TailAdmin Next.js template (MIT) for the dashboard shell — see [LICENSE](./LICENSE).
