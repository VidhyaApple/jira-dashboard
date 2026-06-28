# JIRA Analytics Dashboard

A squad-level analytics dashboard for JIRA exports. Each squad is analysed separately using two regional data files — **CIEC** (Chennai) and **Team** (UK) — with charts for status, work type, story points, timelines, capacity, and issue hierarchy.

## Quick start

```bash
npm install
npm run dev
```

Open the local dev URL (usually `http://localhost:5173`). The dashboard loads the selected squad on startup.

```bash
npm run build    # production build
npm run preview  # preview production build
```

## Using the dashboard at squad level

The app is built around **one squad at a time**. Everything in the sidebar — data upload, filters, and capacity — applies to the currently selected squad.

### 1. Choose a squad

Use the **Squad** dropdown in the left sidebar. Available squads:

| Squad | Data folder |
|-------|-------------|
| SAM   | `public/sources/SAM/` |
| AWM   | `public/sources/AWM/` |
| MINT  | `public/sources/MINT/` |

When you switch squads:

- Charts and KPIs reload for that squad only
- Date and hierarchy filters reset
- Capacity settings are remembered per squad

Each squad’s ticket data is stored separately in the browser (`localStorage` key: `jiraTickets:<SQUAD>`).

### 2. Provide squad data

Each squad needs **two JIRA export files**:

| File | Region | Sidebar label |
|------|--------|-----------------|
| `ciec.csv` | Chennai (CIEC) | CIEC (ciec.csv) |
| `team.csv` | UK (Team) | Team (team.csv) |

**Option A — Bundled CSV files (recommended for first load)**

Place exports under:

```
public/sources/<SQUAD>/
  ciec.csv    # Chennai team export
  team.csv    # UK team export
```

Example for SAM:

```
public/sources/SAM/ciec.csv
public/sources/SAM/team.csv
```

On first visit (or after **Reset data**), the app fetches both files automatically.

**Option B — Upload in the sidebar**

1. Select the squad in the sidebar
2. Expand **Replace squad data — &lt;SQUAD&gt;**
3. Choose the region (CIEC or Team)
4. Upload a `.csv`, `.xlsx`, or `.xls` JIRA export

Uploading replaces only that region’s rows for the current squad; the other region’s data is kept.

**Option C — Reset to bundled files**

Click **Reset data** in the sidebar to clear cached squad data and reload from `public/sources/<SQUAD>/`.

### 3. Expected JIRA export columns

Exports should be standard JIRA CSV/Excel issue lists. The dashboard reads:

| Column | Used for |
|--------|----------|
| Issue key | Ticket identity, hierarchy links |
| Issue Type | Work type charts and tables |
| Summary | Hierarchy display |
| Status | Status breakdown charts |
| Custom field (Story Points) | All SP metrics |
| Status Category Changed | Timeline and date filters (preferred) |
| Updated | Timeline fallback if status date is missing |
| Parent / Parent key | Hierarchy tree |

Optional: Issue URL, URL, or Link for clickable ticket badges in tables.

### 4. Filter squad data

All filters apply to the **current squad** only.

| Filter | Location | Purpose |
|--------|----------|---------|
| Date range | Sidebar | All time, rolling windows (7 / 14 / 30 days), or calendar quarters (Q1–Q4) |
| Assume tickets without SP count as 1 SP | Sidebar checkbox | Treats missing story points as 1 SP across all charts and KPIs |
| Region (CIEC / Team / All) | Individual combined charts | Per-chart regional view on timeline, baseline, and capacity charts |
| Hierarchy region | Hierarchy section | Filter the issue tree by CIEC, Team, or both |

Use **Clear filters** to reset the date filter.

### 5. Set squad capacity

Expand **Team capacity — &lt;SQUAD&gt;** in the sidebar and enter developer counts for each region:

- **CIEC developers**
- **Team developers**

Capacity is calculated as:

```
developers × 1 SP/day × 20 working days/month
```

These values are saved per squad and drive the **Capacity** charts (monthly SP vs capacity and utilisation %).

### 6. Read the dashboard sections

After data is loaded, use the sidebar navigation to jump to each section:

| Section | What it shows |
|---------|----------------|
| **Dashboard (overview)** | KPI cards — total tickets, filtered count, story points, linked issues |
| **Status** | Ticket counts by status, split by CIEC and Team |
| **Work Type** | Issue type breakdown and a story-points-by-work-type table |
| **Story Points** | Total SP by region, including tickets without SP |
| **Timeline** | Quarterly and monthly SP/count trends, plus month-over-month SP performance |
| **Capacity** | Delivered SP vs planned capacity per month |
| **Hierarchy** | Parent/child issue tree and SP overlap analysis |

The page title reflects the active squad and date filter (e.g. **SAM · Q2**).

## Typical squad workflow

1. Export issues from JIRA for Chennai and UK teams (filter by squad/project as needed)
2. Save as `ciec.csv` and `team.csv` under `public/sources/<SQUAD>/`, or upload via the sidebar
3. Select the squad in the sidebar
4. Set developer counts for capacity planning
5. Apply date filters to focus on a sprint, quarter, or rolling window
6. Review status, work type, SP trends, and hierarchy for that squad

Repeat for each squad (SAM, AWM, MINT) by switching the squad dropdown — data and capacity settings are independent.

## Adding a new squad

1. Add the squad name to `SQUADS` in `src/config/squads.ts`
2. Create the data folder:

   ```
   public/sources/<NEW_SQUAD>/ciec.csv
   public/sources/<NEW_SQUAD>/team.csv
   ```

3. Restart the dev server if needed; the new squad appears in the sidebar dropdown

## Tech stack

- Vue 3 + TypeScript + Vite
- Pinia for state
- ECharts for visualisation
- Papa Parse / SheetJS for CSV and Excel import
- Tailwind CSS for layout and theming (light / dark mode)
