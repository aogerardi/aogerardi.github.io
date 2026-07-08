# Xtreme Epoxy — Google Sheet auto-fill setup

Goal: every quote/booking submitted on xtreme-epoxycoatings.com lands as a row in a Google Sheet, automatically. Formspree keeps emailing you exactly like it does now — the sheet fills in parallel.

**You do this once (~5–10 min), on the Google account that should own the sheet.** Then send me the web-app URL and I flip it on.

---

## Step 1 — Create the sheet
1. Go to [sheets.new](https://sheets.new) (or Google Drive → New → Google Sheet).
2. Name it something like **Xtreme Epoxy — Leads**.
3. Rename the tab at the bottom from "Sheet1" to **Leads** (double-click the tab). *(Optional — the script falls back to the first tab, but "Leads" is tidy.)*

You don't need to type the column headers — the script writes them on the first submission. (They are: Date, Type, Name, Phone, Email, Town, Service, Size, Condition, Finish, Est Low, Est High, Requested Day, Requested Time, Source, Status, Reserved, Notes.)

## Step 2 — Add the script
1. In the sheet: **Extensions → Apps Script**. A code editor opens in a new tab.
2. Delete the little bit of starter code that's there (`function myFunction() {}`).
3. Open **`leads-sheet.gs`** (in this folder), copy everything, and paste it in.
4. Click the **💾 Save** icon.

## Step 3 — Deploy it as a web app
1. Top right: **Deploy → New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** anything (e.g. "leads logger")
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**  ← important, so the website can post to it
4. Click **Deploy**.
5. It'll ask you to **authorize access** — click through, pick your Google account. You may see a "Google hasn't verified this app" screen: click **Advanced → Go to (project name) (unsafe)** → **Allow**. (This is normal for your own scripts — you're authorizing a script *you* own.)
6. Copy the **Web app URL** it gives you. It ends in **`/exec`**.

## Step 4 — Hand it off
- **Send me that `/exec` URL.** I paste it into the site, test it, and push live.
- To share with the client: **Share** button (top right of the sheet) → add their email → **Viewer** (or Commenter). They see every lead in real time; they can't edit the setup.

---

## Testing (after I wire in the URL)
I'll submit one test quote and one test booking from the live site and confirm both rows land in the sheet with the right columns, and that your Formspree email still arrives. You'll see the test rows show up — delete them after.

## Good to know
- **It's free, forever.** Apps Script + Sheets have no cost at this volume.
- **If the sheet ever breaks or fills up,** the website is unaffected — the form still works and Formspree still emails you. The sheet is a bonus log, not a dependency.
- **Quote vs booking rows:** a quote fills the Size/Condition/Finish/Est columns; a booking fills the Requested Day/Time columns. Both share Date/Name/Phone/Email/Town/Service. Empty cells in a row just mean "not applicable to that submission type."
- **To change the script later,** you must **Deploy → Manage deployments → edit (pencil) → New version** for changes to take effect. (Just saving isn't enough.) The `/exec` URL stays the same across versions.
