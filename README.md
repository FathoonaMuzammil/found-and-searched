# Campus Finds

Here's the exact prompt — copy and paste this straight into Lovable's chat box:

---

Build a web application called "Campus Lost & Found" — a simple, clean app that helps students report and find lost items on campus.

**Core features:**

1. **Home page** showing a grid of item cards. Each card displays: photo (or placeholder icon if none), item title, short description, location found/lost, status badge (Lost / Found / Claimed), and date posted.

2. **"Report an Item" button/form** that lets users submit a new item with fields: title, description, category (dropdown: Electronics, Clothing, Documents, Accessories, Other), location, status (Lost or Found), optional photo upload, and contact info (email or phone).

3. **Search and filter bar** on the home page to search by keyword and filter by category and status.

4. **Mark as Claimed** button on each item card that updates its status to "Claimed" and visually greys it out or moves it to a "Resolved" section.

5. **No login/authentication required** — keep it fully open so anyone can post or claim items.

**Design:**

- Clean, modern, minimal UI using a card-grid layout

- Use a calming color palette (blues/greens) suitable for a university tool

- Fully responsive (mobile and desktop)

- Empty state message when no items match a search/filter

**Data:**

- Use local/in-memory storage or a simple database — items should persist during the session

- Seed the app with 4–5 sample items so it looks populated on first load

Keep the scope minimal — no user accounts, no admin dashboard, no messaging system. Focus on making the one journey (report → browse/search → claim) work smoothly and look polished.

---

Paste it, send it, and let it build. Tell me what the first result looks like once it loads.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bring-it-back-campus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/579c07fb-a682-4e75-9767-181908d1c110).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
