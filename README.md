# Shot Okay Films — Website

Built with [Eleventy](https://www.11ty.dev/) (a static site generator) and
[Decap CMS](https://decapcms.org/) (a free, no-code content editor).

This README covers the one-time setup. Once it's done, day-to-day editing
happens entirely at `yoursite.com/admin` — no code required.

---

## What's editable through the CMS

- **Projects** — add/edit/delete portfolio entries (title, category, thumbnail,
  video link, description). New ones appear on the Portfolio page automatically,
  grouped by category. Mark one "Featured" to have it show on the Home page too.
- **Site Settings** — phone number, WhatsApp number, address, hours, directions
  link, Facebook/Instagram/LinkedIn URLs.
- **Services** — the six service cards (name, headline, description).
- **About Page** — founder bio text and the 4-step process list.

Anything not listed above (page layout, colors, animations) still requires a
code change — send those to Claude/a developer as before.

---

## One-time setup (do this once)

### 1. Push this project to GitHub

If you don't already have this in a GitHub repo:

```bash
cd shotokayfilms-website
git init
git add .
git commit -m "Initial site"
```

Then create a new empty repository on [github.com/new](https://github.com/new)
and follow the "push an existing repository" instructions it shows you.

### 2. Connect the repo to Vercel

- In Vercel: **Add New → Project → Import** your GitHub repo
- Vercel should auto-detect Eleventy. If asked:
  - **Build Command:** `npx @11ty/eleventy`
  - **Output Directory:** `_site`
- Deploy. Your site should come up exactly as it looks today.

### 3. Deploy the GitHub login bridge

Decap CMS needs a small helper so "Login with GitHub" works on Vercel
(Netlify has this built in for free; Vercel doesn't, so this fills that gap).

1. Go to **https://github.com/ublabs/netlify-cms-oauth**
2. Click the **"Deploy with Vercel"** button on that page
3. This creates a second, separate Vercel project — just for login. Give it
   any name, e.g. `shotokay-cms-auth`
4. Once deployed, copy its URL (e.g. `https://shotokay-cms-auth.vercel.app`)

### 4. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (direct link: https://github.com/settings/applications/new)
2. Fill in:
   - **Application name:** Shot Okay Films CMS
   - **Homepage URL:** your main site URL (e.g. `https://shotokayfilms.com`)
   - **Authorization callback URL:** `https://shotokay-cms-auth.vercel.app/callback`
     (use the URL from step 3, with `/callback` on the end)
3. Click **Register application**
4. Copy the **Client ID**, then click **Generate a new client secret** and copy that too

### 5. Add the OAuth credentials to the login-bridge project

Back in Vercel, open the `shotokay-cms-auth` project (from step 3) →
**Settings → Environment Variables**, and add:

| Name | Value |
|---|---|
| `OAUTH_GITHUB_CLIENT_ID` | (Client ID from step 4) |
| `OAUTH_GITHUB_CLIENT_SECRET` | (Client Secret from step 4) |

Redeploy that project after adding them (Vercel usually prompts you to).

### 6. Update `admin/config.yml` in this project

Open `admin/config.yml` and fill in the top two placeholders:

```yaml
backend:
  name: github
  repo: your-github-username/your-repo-name      # <- your actual repo path
  branch: main
  base_url: https://shotokay-cms-auth.vercel.app  # <- URL from step 3
```

Commit and push this change — your main site will redeploy automatically.

### 7. Log in

Visit `yoursite.com/admin`, click **Login with GitHub**, authorize it, and
you're in. From here on, adding a project or editing a page is just filling
out a form — every save commits straight to GitHub and the live site updates
automatically within a minute or two.

---

## Local preview (optional, for developers)

```bash
npm install
npm run serve
```

Opens the site at `http://localhost:8080` with live reload.
