# ig-unfollow

> Identify and mass-unfollow Instagram accounts that don't follow you back — directly from your browser, no installation required.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0-informational)

---

## What it does

**ig-unfollow** is a browser script that runs on `instagram.com` using your existing session. It:

1. Fetches your full **following** and **followers** lists via the Instagram API
2. Computes who **doesn't follow you back**
3. Shows them in a clean, searchable interface
4. Lets you **select and unfollow** them with built-in safety delays

No app, no server, no login — it uses your browser's active Instagram session.

---

## ⚠️ Disclaimer

**This tool violates Instagram's Terms of Service.**

Possible consequences include temporary action blocks, shadowbanning, or account suspension. Use at your own risk. The author accepts no responsibility for any account penalties.

---

## Features

| Feature | Details |
|---|---|
| **Non-follower detection** | Fetches full following + followers lists and diffs them |
| **Anti-ban delays** | 8–15s between unfollows, 2–5 min pause every 10 actions |
| **Daily limit** | Hard cap of 120 unfollows/day stored in `localStorage` |
| **Session limit** | Max 60 unfollows per script run |
| **Whitelist** | Protect specific accounts from ever being unfollowed |
| **Search & filter** | Filter list by username or display name |
| **Export** | Download non-followers as CSV or JSON |
| **Pause / Resume** | Full control during the unfollow process |
| **Activity log** | Persistent log of all actions across sessions |
| **Virtual scroll** | Handles accounts lists of any size without lag |
| **No dependencies** | Pure vanilla JavaScript, zero external libraries |
| **No server** | Runs 100% in your browser using your own session cookies |

---

## Usage

There are two ways to run the script. Both work the same — the only difference is how you load the code.

### Method 1 — Browser Console (quickest)

1. Go to [instagram.com](https://www.instagram.com) and make sure you're logged in
2. Open DevTools:
   - **Windows / Linux:** `F12`
   - **Mac:** `Cmd + Option + I`
3. Click the **Console** tab
4. Open `bookmarklet.html` from this repo in your browser, copy the code
5. Paste it into the console and press **Enter**
6. A dark panel will appear — click **Scan**

### Method 2 — Bookmarklet (reusable)

1. Open `bookmarklet.html` in your browser
2. Click **Copy Code**
3. Create a new bookmark in your browser:
   - Right-click your bookmarks bar → **Add bookmark / Add page**
   - Paste the code into the **URL field** (not the name)
   - Name it something like `IG Unfollow`
4. Navigate to `instagram.com`, click your bookmark
5. Click **Scan**

---

## How to use the panel

Once the script loads, a panel appears at the top of the page:

```
┌─────────────────────────────────────────────┐
│  Instagram Unfollow                     [×]  │
│  Following: 1,240  │  Non-followers: 318     │
│  ─────────────────────────────────────────  │
│  [ Scan ]  [ Select All ]  [ Export ]        │
│  Search by username or name...               │
│  ┌─────────────────────────────────────────┐ │
│  │ 🛡 @username        Full Name      [ ] │ │
│  │ 🛡 @username2       Full Name      [ ] │ │
│  └─────────────────────────────────────────┘ │
│  [ Unfollow (0) ]                   [Pause]  │
└─────────────────────────────────────────────┘
```

| Action | How |
|---|---|
| **Scan** | Loads both lists and finds non-followers |
| **Select users** | Click a row to check/uncheck |
| **Select All** | Selects all visible users (respects search filter) |
| **Whitelist a user** | Hover over a row → click the shield icon |
| **Export** | Downloads CSV or JSON of the current filtered list |
| **Unfollow** | Starts unfollowing selected users with safety delays |
| **Pause / Resume** | Pauses the unfollow queue at any time |
| **Escape** | Closes the panel (only when not unfollowing) |

**Tabs:**
- **Non-Followers** — the main list
- **Whitelist** — accounts you've protected
- **Activity** — log of all scans, unfollows, and errors

---

## Safety system

The script has a multi-layer anti-detection system built in:

| Mechanism | Value | Purpose |
|---|---|---|
| Delay between unfollows | 8–15s random | Mimic human behavior |
| Occasional long pause | 20–40s (10% chance) | Extra randomness |
| Batch pause every 10 | 2–5 min random | Prevent rate limiting |
| Daily cap | 120 unfollows | Stored in `localStorage` |
| Session cap | 60 unfollows | Per script run |
| Exponential backoff | 1–10 min on errors | Auto-recover from rate limits |
| Challenge detection | Stops immediately | Avoids account verification loops |

**Estimated time:**
- Scanning 1,000 accounts: ~2 min
- Unfollowing 50 accounts: ~10–15 min
- Unfollowing 120 accounts (daily max): ~30–45 min

---

## How it works (technical)

The script uses Instagram's internal REST API — the same endpoints the web app uses:

```
GET  /api/v1/friendships/{userId}/following/?count=100
GET  /api/v1/friendships/{userId}/followers/?count=100
POST /api/v1/friendships/destroy/{targetId}/
```

Authentication is handled automatically using cookies already set in your browser:
- `ds_user_id` — your Instagram user ID
- `csrftoken` — CSRF protection token

No password is ever read, transmitted, or stored. The script only communicates with `instagram.com`.

---

## Privacy & security

- Runs **entirely in your browser** — no external servers involved
- Does **not** read, store, or transmit your password or personal data
- Uses **only your existing Instagram session** (cookies set by Instagram itself)
- All data (whitelist, activity log, daily count) is stored in your browser's `localStorage`
- You can inspect the full source code in [`src/script-main.js`](src/script-main.js)

---

## Files

| File | Description |
|---|---|
| [`src/script-main.js`](src/script-main.js) | Full, readable source code |
| [`bookmarklet.html`](bookmarklet.html) | Setup guide + embedded minified code |
| [`COPY_CODE.html`](COPY_CODE.html) | Minimal copy-paste interface |
| [`README.md`](README.md) | English documentation |
| [`README.es.md`](README.es.md) | Spanish documentation |

---

## Troubleshooting

**"Not logged in" or no CSRF token**
→ Make sure you're logged into Instagram. Close any duplicate Instagram tabs, refresh, and try again.

**Scan gets stuck or returns 0 users**
→ Instagram may be rate-limiting the scan. Wait a few minutes and try again. Make sure you actually follow people.

**Unfollows fail immediately**
→ You may have hit a temporary action block. Wait 24 hours before retrying. Try unfollowing fewer users at a time.

**Challenge required — script stops**
→ Instagram is requesting verification. Open Instagram normally, complete any verification it asks for, then wait before using the script again.

**Bookmarklet doesn't run**
→ Confirm the saved URL starts with `javascript:`. Some browsers block bookmarklets — try the console method instead.

---

## Risks

| Risk | Likelihood | Action |
|---|---|---|
| Temporary unfollow block | High | Wait 24 hours |
| Shadowban | Medium | Stop automation, post organically |
| Action block | Medium | Reduce all account activity |
| Account suspension | Low | Appeal via Instagram support |

**Tips to reduce risk:**
- Test with 5–10 unfollows first and wait 24h
- Never run more than once per week
- Stop immediately if Instagram flags your account

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

This project is not affiliated with, endorsed by, or associated with Instagram or Meta Platforms, Inc.

---

*Last updated: February 2026 · v2.0*
