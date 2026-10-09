# Image Generation Prompts — Reporting 4

> ## ✅ ALL THREE DIAGRAMS COMPLETE — nothing outstanding
>
> Diagram 9 was regenerated to correct the API figure to **35 API Methods in 9
> Groups** (verified: authAPI 11, recordsAPI 5, riskAPI 2, dailyTasksAPI 6,
> healthProfileAPI 3, dashboardAPI 1, reportsAPI 3, alertsAPI 2, exportAPI 2),
> and diagram 10 was regenerated to remove the text corruption in its first
> attempt. Both replacements are embedded in `Reporting 4.docx`.
>
> Files actually used by the document:
> - `R4 Diagram 9 - Final System Architecture V1.jpg`
> - `R4 Diagram 10 - Health Alert Screening Pipeline v2.jpg`
> - `R4 Diagram 11 - Automated Testing Architecture.jpg`
>
> The two superseded files are still in the Images folder but are not referenced.
> The prompts below are kept for reference only.

---

Three diagrams are needed for **Section 4 (c) Final / Updated Architecture**.

They continue the numbering used in Reporting 3, whose diagrams were:
- 6. Updated System Architecture (Full-Stack + ML) — navy header
- 7. Machine Learning Prediction Data Flow — dark maroon header
- 8. Database Schema — MongoDB Collections — teal header

So Reporting 4 uses **9, 10 and 11**.

**Generate each at 16:9 landscape, minimum 2752 x 1536 px**, then save with the exact
file names below into `Reporting/Images/`:

| # | Save as |
|---|---|
| 9 | `R4 Diagram 9 - Final System Architecture.png` |
| 10 | `R4 Diagram 10 - Health Alert Screening Pipeline.png` |
| 11 | `R4 Diagram 11 - Automated Testing Architecture.png` |

Send them back to me and I will place them in the document automatically.

---

## Shared style instruction (already included in each prompt)

Flat vector infographic, clean white background, 16:9. A full-width coloured
header bar across the top with the title in bold white uppercase sans-serif.
Rounded rectangles in soft pastel fills with a slightly darker matching border.
Each box has a small coloured pill label sitting on its top edge. Box headings in
bold black sans-serif, contents as short black bullet points. Thick black arrows
with small bold labels. No drop shadows, no gradients, no photographs, no
3D effects. All text must be spelled exactly as written and must be crisp and
fully legible.

---

## PROMPT 1 — Diagram 9

```
Create a flat vector infographic diagram, 16:9 landscape, clean white background.

TOP HEADER BAR: full width, dark navy (#12284C), title in bold white uppercase
sans-serif, left aligned with padding:
"9. FINAL SYSTEM ARCHITECTURE (REPORTING 4)"

Below the header place FOUR rounded rectangle boxes in one row, each with a small
coloured pill label on its top edge, bold black heading inside, and black bullet
points:

BOX 1 — pill label "PRESENTATION LAYER" (green pill), box fill light green:
Heading: "React.js Frontend (Port 3000)"
Bullets:
- 13 Dashboard Pages
- 35 API Methods in 9 Groups
- Health Alert Panel (NEW)
- Recharts with Clinical Bands (NEW)
- Auth Context + JWT Storage
- Tailwind CSS Responsive UI

BOX 2 — pill label "APPLICATION LAYER" (blue pill), box fill light blue:
Heading: "Node.js + Express Server (Port 5001)"
Bullets:
- 75 REST API Endpoints
- Health Alert Engine (NEW)
- Email Service - Nodemailer (NEW)
- Data Export CSV + JSON (NEW)
- JWT Auth + Admin Role Guard
- Rate Limiting + Input Validation

BOX 3 — pill label "DATA LAYER" (purple pill), box fill light purple:
Heading: "MongoDB Database"
Bullets:
- Users (with Preferences)
- Health Records
- Health Profiles
- Daily Tasks
- Prediction History
- 12 Collections / 10 Indexes

BOX 4 — pill label "MACHINE LEARNING LAYER" (orange pill), box fill light orange:
Heading: "Python FastAPI Service (Port 8000)"
Bullets:
- Random Forest Classifier
- Scikit-Learn Pipeline
- Accuracy 74.68% / ROC-AUC 81.52%
- diabetes_model.joblib
- 5 API Endpoints

ARROWS between the boxes, thick black with small bold labels:
- Double headed arrow between BOX 1 and BOX 2, labelled "REST API / JSON" above
  and "Vite Proxy" below.
- Double headed arrow between BOX 2 and BOX 3, labelled "Mongoose ODM".
- Arrow from BOX 2 down and across to BOX 4, labelled
  "HTTP POST /predict/diabetes (6s timeout)".

BOTTOM FULL-WIDTH BAND, rounded, light teal fill with a teal pill label on its
top edge reading "DOCUMENTATION & TESTING LAYER (NEW)". Inside, four items in a
single row, each with a small simple flat icon to its left:
- "Swagger UI at /api/docs" with "36 Operations / 27 Paths" underneath
- "OpenAPI 3.0 Document" with "1,054 Lines" underneath
- "Jest + Supertest" with "7 Suites / 149 Tests" underneath
- "Code Coverage" with "73.45% Overall / 88.47% Controllers" underneath

Style: flat vector, no gradients, no drop shadows, no 3D, no photographs.
All text crisp, fully legible and spelled exactly as given.
```

---

## PROMPT 2 — Diagram 10

```
Create a flat vector infographic flow diagram, 16:9 landscape, clean white background.

TOP HEADER BAR: full width, dark maroon (#5C1230), title in bold white uppercase
sans-serif, left aligned:
"10. HEALTH ALERT SCREENING PIPELINE"

Draw a left-to-right numbered flow using rounded rectangles in soft pastel fills,
connected by thick black arrows with bold black step numbers (1, 2, 3, 4, 5)
placed on the arrows.

STEP 1 — light green box:
"User Saves a Health Record"
small text: "Blood Pressure, Fasting Sugar, Heart Rate, SpO2, BMI"

STEP 2 — light blue box:
"GET /api/alerts"
small text: "Protected by JWT. Reads the newest record for that user only."

STEP 3 — light orange box:
"Alert Engine (245 Lines, No Dependencies)"
small text: "Pure module. Testable without a database or a server."

STEP 4 — light red box, drawn taller, titled:
"Screened Against Published Clinical Thresholds"
Inside show four small rows:
- "Blood Pressure - 2017 ACC/AHA:  Crisis 180/120  |  Stage 2 140/90  |  Stage 1 130/80"
- "Fasting Glucose - ADA:  Diabetic 126 mg/dL  |  Prediabetic 100 mg/dL  |  Low 70 mg/dL"
- "BMI - WHO:  Obese 30  |  Overweight 25  |  Underweight 18.5"
- "Heart Rate 60-100 bpm   |   SpO2 below 95%   |   ML High Risk Flag"

STEP 5 — light purple box:
"Sorted Alert List Returned"
small text: "Most severe first, with the reading, the reference limit and a medical disclaimer"

On the RIGHT SIDE place a separate small legend box titled "SEVERITY LEVELS" with
three coloured rows:
- Red row: "CRITICAL - Hypertensive crisis"
- Amber row: "WARNING - Diabetic range, obese BMI, low SpO2"
- Blue row: "NOTICE - Stage 1 BP, prediabetic, heart rate, stale records"

BOTTOM STRIP, light grey rounded band, single line of bold black text:
"Displayed on the Dashboard alert panel and in the Topbar notification menu  •  21 automated unit test cases cover these rules"

Style: flat vector, no gradients, no drop shadows, no 3D, no photographs.
All text crisp, fully legible and spelled exactly as given.
```

---

## PROMPT 3 — Diagram 11

```
Create a flat vector infographic diagram, 16:9 landscape, clean white background.

TOP HEADER BAR: full width, dark teal (#0E5C63), title in bold white uppercase
sans-serif, left aligned:
"11. AUTOMATED TESTING ARCHITECTURE"

LEFT SIDE, a vertical stack of three rounded boxes showing how the application is
split for testing, connected downward by thin black arrows:
- Light grey box: "server.js" / small text: "Entry point. Connects MongoDB, listens on port 5001."
- Light blue box: "app.js" / small text: "The Express application itself. No socket, no database connection."
- Light green box: "Supertest" / small text: "Drives app.js in memory. No network port is opened."
Add a bold black caption under this stack:
"The same application object serves real traffic and is driven by the tests"

CENTRE, a large rounded light yellow box with a yellow pill label on its top edge
reading "7 JEST TEST SUITES - 149 CASES". Inside, list seven rows, each with the
suite name in bold black on the left and its test count in a small dark circle on
the right:
- "auth.test.js" - 28
- "records.test.js" - 24
- "alerts.test.js" - 26
- "security.test.js" - 31
- "dailyTasks.test.js" - 20
- "reports.test.js" - 12
- "export.test.js" - 8

RIGHT SIDE, a vertical stack of three rounded boxes:
- Light purple box, heading "Real Dependencies":
  "MongoDB test database, created and dropped by the suite, named per worker"
- Light orange box, heading "Replaced by Test Doubles":
  "FastAPI ML service and the SMTP mail transport"
- Light red box, heading "Rate Limiters":
  "Bypassed under NODE_ENV=test, switched back on by the suite that tests them"

BOTTOM FULL-WIDTH BAND, rounded, light green fill, showing four results in one
row, each as a large bold black number with a small label underneath:
- "149 / 149" with "Tests Passed"
- "7 / 7" with "Suites Passed"
- "73.45%" with "Statement Coverage"
- "88.47%" with "Controller Coverage"

Style: flat vector, no gradients, no drop shadows, no 3D, no photographs.
All text crisp, fully legible and spelled exactly as given.
```

---

## Optional extra screenshots already captured

These are in `Reporting/Images/` and can be swapped in if you prefer them:

- `R4 Screenshot 4 - Swagger API Documentation.png`
- `R4 Screenshot 5 - Settings Data Controls.png`
- `R4 Screenshot 6 - Jest Coverage Report.png`

---

# ⚠️ REGENERATE DIAGRAM 10 ONLY

Diagrams **9 and 11 came out perfect** and are already placed in the document.

**Diagram 10 has text corruption** and cannot be used:
- The Alert Engine box was split into two halves and reads **"Alert Engine (Matin Gugrpotment)"** and **"Servenat. Testable range, and dat alent."** — both are gibberish.
- The BMI row repeats itself: **"Obese 30 | Overweight | Obese 30 | Overweight 25 | Underweight 18.5"**.

The cause is too much small text in one image. The prompt below carries roughly half
the words and puts the threshold figures in a separate clean table, which generates
far more reliably.

**Save the new image as:** `R4 Diagram 10 - Health Alert Screening Pipeline v2.jpg`

```
Create a flat vector infographic, 16:9 landscape, clean white background.
Use large, clearly legible text. Do not crowd the boxes.

TOP HEADER BAR: full width, dark maroon, bold white uppercase title, left aligned:
"10. HEALTH ALERT SCREENING PIPELINE"

MIDDLE: five rounded boxes in a single horizontal row, left to right, connected by
four thick black arrows. Put a bold black number on each arrow: 1, 2, 3, 4.
Each box has a bold black heading and ONE short line of smaller text underneath.

BOX 1, light green:
Heading "Health Record Saved"
Text "Blood pressure, sugar, heart rate, SpO2, BMI"

BOX 2, light blue:
Heading "GET /api/alerts"
Text "JWT protected. Newest record only."

BOX 3, light orange:
Heading "Alert Engine"
Text "245 lines. No database. No server."

BOX 4, light red:
Heading "Threshold Screening"
Text "Compared against published clinical ranges"

BOX 5, light purple:
Heading "Sorted Alert List"
Text "Most severe first, with a medical disclaimer"

BOTTOM LEFT: a clean table titled "CLINICAL THRESHOLDS" with two columns and four
rows. Left column bold, right column normal:
"Blood Pressure (ACC/AHA)" | "Crisis 180/120   Stage 2 140/90   Stage 1 130/80"
"Fasting Glucose (ADA)" | "Diabetic 126   Prediabetic 100   Low 70 mg/dL"
"BMI (WHO)" | "Obese 30   Overweight 25   Underweight 18.5"
"Other" | "Heart rate 60-100 bpm   SpO2 below 95%"

BOTTOM RIGHT: a small table titled "SEVERITY LEVELS" with three coloured rows:
Red row "CRITICAL", Amber row "WARNING", Blue row "NOTICE".

Flat vector only. No gradients, no shadows, no 3D, no photographs.
Every word must be spelled exactly as written above. Do not repeat any word.
```
