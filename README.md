## CCMC Notes – Course Notes Library

**CCMC Notes** is a small course-notes library built with **Next.js (App Router)**.  
It lets students:

- **Browse notes** grouped by **level**, **semester**, and **course**
- **Search** by title, description, or lecturer name
- **See recently updated courses** at a glance
- **Preview PDFs inline** (desktop) or open them in a dedicated preview page (mobile)

Notes metadata is stored in a single JSON file (`public/notes.json`) and rendered on the main page (`app/page.tsx`).

---

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: Tailwind CSS + small custom UI components (`button`, `input`, `select`)
- **PDF Rendering**: `react-pdf` / `pdfjs` for inline PDF viewing
- **Data Source**: Static JSON (`public/notes.json`)

Key components:

- `app/page.tsx` – main notes library UI (filters, search, recent courses, list + viewer layout)
- `app/components/NoteItem.tsx` – renders a single note item in the list
- `app/components/PdfViewer.tsx` – inline PDF viewer with pagination, zoom, and “open in new tab”
- `app/preview/page.tsx` – (if present) dedicated preview page for mobile navigation

---

## Getting Started (Local Development)

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Project Structure (High Level)

- `app/`
  - `layout.tsx` – root layout, fonts, global styles
  - `page.tsx` – main course notes library page
  - `preview/page.tsx` – PDF preview page used on mobile (navigated via query params)
- `app/components/`
  - `NoteItem.tsx` – card UI for a single note
  - `PdfViewer.tsx` – inline PDF viewer
- `components/ui/`
  - `button.tsx`, `input.tsx`, `select.tsx` – shared UI primitives
- `public/`
  - `notes.json` – data source describing all notes (levels, semesters, courses, and notes)

---

## Notes Data Format (`public/notes.json`)

The app expects `notes.json` to be an **array of course groups**, each with a list of notes:

```json
[
  {
    "level": "100",
    "semester": "1",
    "course": "Math 101",
    "notes": [
      {
        "title": "Lecture 1 – Introduction to Algebra",
        "description": "Overview of algebraic foundations and basic notation.",
        "lecturer_name": "Dr. John Doe",
        "added_date": "2025-09-15",
        "file_url": "https://example.com/some-pdf"
      }
    ]
  }
]
```

- **`level`**: e.g. `"100"`, `"200"`, etc.
- **`semester`**: e.g. `"1"`, `"2"`
- **`course`**: human-readable course code/title (e.g. `"CS 201"`)
- **`notes`**: array of individual notes for that course
  - **`title`**: short title for the note
  - **`description`**: brief description displayed in the list
  - **`lecturer_name`**: name shown as note author
  - **`added_date`**: ISO-like date string (used for sorting and display)
  - **`file_url`**: direct link to the PDF (e.g. Mega, Google Drive, etc.)

> **Important**: For inline viewing to work, `file_url` must point to a PDF that is accessible from the browser and not fully blocked by CORS. If inline loading fails, the user can still click **“Open in new tab”** in the viewer.

---

## Usage

- **Filter by Level / Semester / Course** using the dropdowns at the top.
- **Search** notes using the search input (matches on title, description, and lecturer name).
- **See recently added courses** in the “Recently added courses” section.
- **Open a note**:
  - On **desktop**: clicking **Open** shows the PDF inline in the right-hand `PdfViewer`.
  - On **mobile**: clicking **Open** navigates to the `/preview` page for a focused PDF view.

---

## Contribution Guide

Contributions are welcome! This section explains how to add notes, tweak the UI, or improve functionality.

### 1. Prerequisites

- Node.js and npm installed
- Basic familiarity with React / Next.js and TypeScript

### 2. Setting Up a Dev Environment

1. **Fork** this repository (if contributing externally).
2. **Clone** your fork:

   ```bash
   git clone <your-fork-url>
   cd ccmc_notes
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Run the dev server**:

   ```bash
   npm run dev
   ```

5. Make sure the app runs at `http://localhost:3000` without TypeScript or runtime errors.

### 3. Adding or Updating Notes

1. Open `public/notes.json`.
2. Follow the existing structure:
   - To **add a new course**, add a new object to the top-level array.
   - To **add a new note** to an existing course, append a new object to its `notes` array.
3. Ensure:
   - `added_date` is a valid date string (e.g. `"2025-09-18"`).
   - `file_url` is a valid PDF link that can be opened in the browser.
4. Save the file and verify in the browser that:
   - The course appears with the correct level/semester.
   - The new note shows up and opens correctly in the viewer.

### 4. Coding Guidelines

- Use **TypeScript** types consistently (see `app/page.tsx`, `NoteItem.tsx`, `PdfViewer.tsx` for examples).
- Keep components **small and focused**.
- Prefer existing UI primitives in `components/ui` for buttons, inputs, and selects.
- Follow the existing **Tailwind CSS** style patterns and spacing.

### 5. Making Changes

- For **UI changes**, update:
  - `app/page.tsx` for layout/filters/search behavior
  - `NoteItem.tsx` for note cards
  - `PdfViewer.tsx` for viewer behavior
- For **behavioral changes** (filter logic, search, recent courses), see:
  - `useMemo` hooks and helper logic in `app/page.tsx`

When you’re done:

1. Run the dev server and test your changes manually.
2. Ensure there are no obvious console errors.

### 6. Submitting a PR

1. Create a feature branch:

   ```bash
   git checkout -b feature/short-description
   ```

2. Commit your changes with a clear message:

   ```bash
   git commit -m "Add notes for CS 201 and improve PDF viewer error message"
   ```

3. Push and open a Pull Request:
   - Describe **what** you changed.
   - Mention **how to test** it.
   - Include screenshots or GIFs for UI changes if helpful.

---

## License

If you plan to open source this, you can add a license file (for example, MIT) and mention it here. Otherwise, treat this project as private/academic unless stated otherwise.

