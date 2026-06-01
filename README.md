# ig-unfollow

> Identify and mass-unfollow Instagram accounts that don't follow you back — directly from your browser console, no installation required.

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2022-f7df1e?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/dependencies-none-brightgreen" alt="No Dependencies">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/version-3.0-blueviolet" alt="Version">
  <img src="https://img.shields.io/badge/anti--ban-advanced-orange" alt="Anti-Ban">
  <img src="https://img.shields.io/badge/server-none_required-success" alt="No Server">
</p>

---

## What it does

**ig-unfollow** is a browser-based tool that runs directly on `instagram.com` using your existing session. It:

1. Fetches your full **following** and **followers** lists via Instagram's internal API
2. Identifies who **doesn't follow you back** (non-followers)
3. Detects **fans** — people who follow you but you don't follow back
4. Displays everything in a clean, searchable dark-themed interface
5. Lets you **select and unfollow** with multi-layer anti-ban protection

**No app, no server, no login credentials** — it uses your browser's active Instagram session only.

---

## ⚠️ Disclaimer

**This tool violates Instagram's Terms of Service.**

Possible consequences include temporary action blocks, shadowbanning, or account suspension. Use at your own risk. The author accepts no responsibility for any account penalties. Always test with small numbers first.

---

## ✨ Features (v3.0)

### Core Features
| Feature | Details |
|---|---|
| **Non-follower detection** | Full diff between following and followers lists |
| **Fans detection** | See who follows you but you don't follow back |
| **Whitelist** | Protect accounts from ever being unfollowed |
| **Search & filter** | Real-time search by username or display name |
| **Sort options** | Sort by name (A-Z / Z-A), verified, private/public |
| **Export** | Download as CSV, JSON, or TXT (usernames only) |
| **Virtual scroll** | Handles any list size without lag |

### Anti-Ban System
| Feature | Details |
|---|---|
| **Jittered delays** | 10–20s between unfollows with human-like randomness |
| **Fingerprint randomization** | Randomized request headers to avoid detection patterns |
| **Hourly limit** | Max 25 unfollows/hour (configurable) |
| **Daily limit** | Max 100 unfollows/day stored in `localStorage` |
| **Session limit** | Max 50 unfollows per script run |
| **Batch pauses** | 3–7 min pause every 7 actions |
| **Forced safety pauses** | Mandatory 5–10 min pause every 30 requests |
| **Exponential backoff** | 1.5–15 min on errors with multiplier |
| **Connection health monitor** | Auto-detects network issues, waits for reconnect |
| **Browsing simulation** | Random "browsing" delays to mimic human behavior |
| **Challenge detection** | Stops immediately on verification requests |

### Interface
| Feature | Details |
|---|---|
| **Dark theme UI** | Clean, modern overlay panel |
| **Verified badges** | ✓ indicator for verified accounts |
| **Private indicators** | 🔒 for private accounts |
| **ETA display** | Time estimate before starting unfollows |
| **Progress bar** | Real-time progress with rate indicator |
| **Pause / Resume / Stop** | Full control during unfollow process |
| **Activity log** | Persistent log with stats (total, today, this week) |
| **Settings panel** | Adjust all limits and timing in-app |
| **Keyboard shortcuts** | Esc, Ctrl+F, Ctrl+A, Space, 1-4 for tabs |
| **Rich console output** | Colored banner, tables, progress bars in DevTools |

### Technical
| Feature | Details |
|---|---|
| **No dependencies** | Pure vanilla JavaScript, zero external libraries |
| **No server** | Runs 100% in your browser |
| **v1 REST API** | Uses Instagram's modern, stable endpoints |
| **Session-safe** | Never reads or transmits your password |

---

## 🚀 Quick Start

### Method 1 — Browser Console (quickest)

1. Go to [instagram.com](https://www.instagram.com) and log in
2. Open DevTools:
   - **Windows / Linux:** `F12`
   - **Mac:** `Cmd + Option + I`
3. Click the **Console** tab
4. Copy the code from [`src/script-main.js`](src/script-main.js)
5. Paste it into the console and press **Enter**
6. Click **🔍 Scan** in the panel that appears

### Method 2 — Bookmarklet (reusable)

1. Open `bookmarklet.html` in your browser
2. Copy the code
3. Create a new bookmark → paste code as the **URL**
4. Navigate to `instagram.com` → click your bookmark
5. Click **🔍 Scan**

> See [`GETTING_STARTED.md`](GETTING_STARTED.md) for detailed step-by-step instructions with browser-specific guides.

---

## 📖 How to Use

### The Panel

Once loaded, a dark overlay panel appears:

```
┌─────────────────────────────────────────────────────┐
│  Instagram Unfollow  [v3.0]              [?]  [×]   │
│  ─────────────────────────────────────────────────  │
│  Following: 1,240 · Non-followers: 318 · Fans: 87  │
│  Protected: 12 · Today: 0/100 · Hour: 0/25         │
│  ─────────────────────────────────────────────────  │
│  ✓ 1,240 following · 318 don't follow back · 87 fans│
│  ─────────────────────────────────────────────────  │
│  [Search...                    ] [Sort: Default ▾]  │
│  ─────────────────────────────────────────────────  │
│  Non-Followers | Whitelist | Activity | Settings    │
│  ─────────────────────────────────────────────────  │
│  [🔍 Scan] [Select All] [Clear] [📥 Export] [👥 Fans]│
│  ┌─────────────────────────────────────────────────┐│
│  │ [pic] @user1 ✓      Full Name       🛡️  [☐]   ││
│  │ [pic] @user2 🔒     Full Name            [☐]   ││
│  │ [pic] @user3        Full Name            [☑]   ││
│  └─────────────────────────────────────────────────┘│
│  ⏱ Estimated time for 3 users: ~1min               │
│  ─────────────────────────────────────────────────  │
│  [ Unfollow (1) ]              [⏸ Pause] [■ Stop]  │
└─────────────────────────────────────────────────────┘
```

### Actions

| Action | How |
|---|---|
| **Scan** | Loads both lists and computes non-followers + fans |
| **Select users** | Click a row to check/uncheck |
| **Select All** | Selects all visible (respects search filter + whitelist) |
| **Whitelist** | Hover → click 🛡️ shield icon |
| **Export** | CSV, JSON, or TXT download of current list |
| **Toggle view** | Switch between Non-followers and Fans |
| **Sort** | Dropdown: alphabetical, verified first, private/public |
| **Unfollow** | Starts process with safety delays |
| **Pause / Resume** | Pauses queue at any time |
| **Stop** | Cancels the unfollow process entirely |
| **Settings** | Adjust limits, timing, manage data |

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Esc` | Close panel |
| `Ctrl+F` | Focus search |
| `Ctrl+A` | Select all |
| `Ctrl+D` | Deselect all |
| `Space` | Pause/Resume (during unfollow) |
| `1` `2` `3` `4` | Switch tabs |

### Tabs

- **Non-Followers** — main list of people who don't follow you back
- **Whitelist** — protected accounts (with clear all option)
- **Activity** — full log with stats: total, today, this week, errors
- **Settings** — adjust all safety parameters + data management

---

## 🛡️ Safety System

The v3.0 anti-ban system uses multiple layers of protection:

| Layer | Mechanism | Purpose |
|---|---|---|
| 1 | Jittered delays (10–20s) | Human-like timing with variance |
| 2 | 5% chance of very long pause (50–100s) | Extreme randomness |
| 3 | 10% chance of extended pause (25–50s) | Additional jitter |
| 4 | Browsing simulation (8% chance) | Random 3–8s "idle" pauses |
| 5 | Batch pause every 7 (3–7 min) | Prevent burst detection |
| 6 | Forced pause every 30 requests (5–10 min) | Mandatory cooldown |
| 7 | Hourly cap: 25 | Rate limit per hour |
| 8 | Daily cap: 100 | Rate limit per day |
| 9 | Session cap: 50 | Per script-run limit |
| 10 | Exponential backoff (1.5–15 min) | Auto-recover from errors |
| 11 | Connection health monitoring | Detect network issues |
| 12 | Challenge/feedback detection | Instant stop on flags |
| 13 | Fingerprint randomization | Vary request headers |

### Time Estimates

| Action | Approximate Time |
|---|---|
| Scanning 1,000 accounts | ~3–5 min |
| Unfollowing 20 accounts | ~8–12 min |
| Unfollowing 50 accounts | ~25–40 min |
| Unfollowing 100 accounts (daily max) | ~1–2 hours |

### Console Output

The tool provides rich feedback in the DevTools console:

```
╔══════════════════════════════════════╗
║   Instagram Unfollow Tool v3.0       ║
║   github.com/RanuK12/ig-unfollow     ║
╚══════════════════════════════════════╝
[IG-Unfollow] Initializing...
[IG-Unfollow] Checking connection...
[IG-Unfollow] Following: 500 loaded (page 5)
[IG-Unfollow] Scan complete!
┌──────────────────────────┬───────┐
│ Following                │ 1240  │
│ Followers                │ 922   │
│ Non-followers            │ 318   │
│ Fans (follow you only)   │ 87    │
└──────────────────────────┴───────┘
[IG-Unfollow] ✓ Unfollowed @user (1/50)
[IG-Unfollow] Batch pause: 4.2min (7/50)
```

---

## ⚙️ How It Works (Technical)

The script uses Instagram's internal REST API — the same endpoints the web app uses:

```
GET  /api/v1/friendships/{userId}/following/?count=100&max_id=...
GET  /api/v1/friendships/{userId}/followers/?count=100&max_id=...
POST /api/v1/friendships/destroy/{targetId}/
```

Authentication uses cookies already set in your browser:
- `ds_user_id` — your Instagram user ID
- `csrftoken` — CSRF protection token

**No password is ever read, transmitted, or stored.**

### Anti-Detection Techniques

1. **Header randomization** — Occasionally includes `X-IG-Connection-Speed` and `X-IG-Bandwidth-Speed-KBPS` with random values
2. **Timing jitter** — Non-uniform delay distribution mimics human behavior (not a fixed interval)
3. **Activity simulation** — 8% of requests include a "browsing" pause before execution
4. **Dynamic backoff** — Exponential with multiplier 2.5x on consecutive errors

---

## 🔒 Privacy & Security

- Runs **entirely in your browser** — no external servers
- Does **not** read, store, or transmit your password
- Uses **only your existing session** (cookies set by Instagram)
- All local data stored in `localStorage`:
  - Whitelist (`ig_unf_whitelist`)
  - Activity log (`ig_unf_log`)
  - Daily count (`ig_unf_daily`)
- Full source code: [`src/script-main.js`](src/script-main.js) — inspect every line

---

## 📁 Project Structure

```
ig-unfollow/
├── src/
│   └── script-main.js      # Full readable source (v3.0)
├── bookmarklet.html         # Setup guide + embedded code
├── COPY_CODE.html           # Minimal copy-paste interface
├── GETTING_STARTED.md       # Step-by-step usage guide
├── README.md                # English documentation
├── README.es.md             # Spanish documentation
└── LICENSE                  # MIT license
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| "Not logged in" / no CSRF token | Log into Instagram. Close duplicate tabs. Refresh. |
| Scan returns 0 users | Wait a few minutes (rate limit). Make sure you follow people. |
| Unfollows fail immediately | Temporary action block. Wait 24+ hours. |
| "Challenge required" | Complete Instagram's verification, then wait 24h+ |
| Bookmarklet doesn't work | Ensure URL starts with `javascript:`. Try console method. |
| "Connection lost" | Check internet. The tool will auto-retry for 2 minutes. |
| Settings not saving | Settings are per-session. Adjust after each load. |
| Script doesn't load | Make sure you're on `instagram.com` (not a subpage). Refresh and retry. |

---

## ⚡ Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Temporary unfollow block | Medium | Built-in limits + wait 24h |
| Shadowban | Low-Medium | Stop automation, post organically |
| Action block | Medium | Reduce activity immediately |
| Account suspension | Very Low | Appeal via Instagram support |

### Best Practices

- **Start small:** Test with 5–10 unfollows, wait 24 hours
- **Weekly max:** Never run more than once per week
- **Monitor:** Watch for unusual Instagram behavior after use
- **Stop immediately** if you receive any verification request
- **Lower limits** in Settings if unsure (20/day is very safe)
- **Don't combine** with other automation tools

---

## 🆚 Changelog

### v3.0 (Current)
- Advanced fingerprint randomization
- Connection health monitoring with auto-reconnect
- Hourly rate limit (25/hour)
- Forced safety pauses every 30 requests
- Fans detection (who follows you but you don't follow back)
- Sort options (alphabetical, verified, private/public)
- Verified ✓ and Private 🔒 badges
- ETA time estimates before unfollowing
- Full keyboard shortcuts
- Settings tab (adjust all parameters)
- Cancel button for stopping process
- TXT export (usernames only)
- Rich console output (colored logs, tables, progress)
- Activity stats (total, today, this week, errors)
- Improved error handling (NetworkError, feedback_required)
- Browsing simulation delays

### v2.0
- v1 REST API migration
- Dark theme UI with virtual scroll
- Whitelist system
- Export (CSV/JSON)
- Pause/Resume
- Activity log
- Daily/session limits
- Exponential backoff

### v1.0
- Basic GraphQL-based unfollow
- Simple console interface

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes to `src/script-main.js`
4. Test thoroughly on your own account
5. Submit a pull request

### Guidelines
- Keep it as a single-file script (no build tools or dependencies)
- Maintain or increase safety delays (never reduce default limits)
- Test with real accounts before submitting
- Update documentation for new features

---

## 📜 License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

This project is not affiliated with, endorsed by, or associated with Instagram or Meta Platforms, Inc.

---

<p align="center">
  <sub>Made with ❤️ for the Instagram community · v3.0 · May 2026</sub>
</p>


## Licencia

MIT — © 2026 Ranuk IT Solutions | [ranuk.dev](https://ranuk.dev)
