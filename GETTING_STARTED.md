# Getting Started Guide

Choose your preferred method below. All three do the same thing — the only difference is how you load the code into your browser.

---

## 🎯 Method 1: Browser Console (Recommended)

**No files needed. Takes 1 minute. Works in all browsers.**

### Step 1: Open Instagram
- Go to [instagram.com](https://www.instagram.com)
- Make sure you're **logged in**
- You should see your feed or profile

### Step 2: Open DevTools Console
| Browser | Windows / Linux | Mac |
|---|---|---|
| Chrome | `F12` or `Ctrl+Shift+J` | `Cmd+Option+J` |
| Firefox | `F12` or `Ctrl+Shift+K` | `Cmd+Option+K` |
| Edge | `F12` or `Ctrl+Shift+J` | `Cmd+Option+J` |
| Safari | — | `Cmd+Option+C` (enable in Preferences → Advanced) |
| Brave | `F12` or `Ctrl+Shift+J` | `Cmd+Option+J` |

Click the **Console** tab if it's not already selected.

### Step 3: Allow pasting (Chrome/Edge)
Some browsers show a warning like:
> "Don't paste code you don't understand"

Type `allow pasting` and press Enter to unlock the console.

### Step 4: Paste and run
1. Copy the full code from [`src/script-main.js`](src/script-main.js)
2. Paste it into the console
3. Press **Enter**
4. The dark panel appears → click **🔍 Scan**

### That's it! 🎉

---

## 📌 Method 2: Bookmarklet (Reusable)

**Save once, use anytime with a single click. Takes 3 minutes.**

### Step 1: Get the code
- Open `bookmarklet.html` from this repository in your browser
- Click **Copy Code**

### Step 2: Create a bookmark

#### Chrome / Edge / Brave
1. Right-click your bookmarks bar → **Add page** (or **Add bookmark**)
2. **Name:** `IG Unfollow`
3. **URL:** Paste the copied code (it starts with `javascript:`)
4. Save

#### Firefox
1. Press `Ctrl+D` (or `Cmd+D` on Mac) to open bookmark dialog
2. Click **"More"** to expand options
3. Change **Location** to the copied code
4. **Name:** `IG Unfollow`
5. Save

#### Safari
1. Bookmark any page first (`Cmd+D`)
2. Open Bookmarks (`Cmd+Shift+B`)
3. Find the bookmark → Right-click → **Edit Address**
4. Replace the URL with the copied code
5. Rename to `IG Unfollow`

### Step 3: Use it
1. Navigate to [instagram.com](https://www.instagram.com) (must be logged in)
2. Click your **IG Unfollow** bookmark
3. The panel appears → click **🔍 Scan**

> **Note:** If nothing happens, make sure the bookmark URL starts with `javascript:` — some browsers strip it when pasting.

---

## 📂 Method 3: Copy Code Page (Visual)

**A nice page with copy button. Takes 2 minutes.**

1. Open `COPY_CODE.html` from this repository in your browser
2. Click the **Copy Code** button
3. Open [instagram.com](https://www.instagram.com) in another tab
4. Open DevTools (`F12`) → **Console** tab
5. Paste and press **Enter**
6. Click **🔍 Scan**

---

## 📖 Using the Tool

### After Scanning

Once the scan completes, you'll see:

1. **Stats bar** — Following count, non-followers, fans, daily/hourly limits
2. **User list** — All accounts that don't follow you back
3. **Tabs** — Non-Followers, Whitelist, Activity, Settings

### Selecting Users

- **Click a row** to select/deselect
- **Select All** button selects all visible users
- **Clear** deselects everyone
- Whitelisted users (🛡️) cannot be selected

### Protecting Users (Whitelist)

Don't want to unfollow someone? Protect them:
- Hover over a row → click the **🛡️ shield** icon
- They'll show as "Protected" and won't be unfollowed
- Manage protected users in the **Whitelist** tab

### Viewing Fans

Click the **👥 Fans** button to switch views:
- See people who follow YOU but you don't follow back
- Click any fan to open their profile
- Switch back with the **🚫 Non-followers** button

### Sorting

Use the dropdown next to the search box:
- **Default** — Instagram's order
- **A → Z** / **Z → A** — Alphabetical
- **Verified first** — Verified accounts on top
- **Private first** / **Public first** — By account type

### Exporting

Click **📥 Export** to download:
- **CSV** — Spreadsheet format with all info
- **JSON** — Developer-friendly format
- **TXT** — Just usernames (one per line)

### Unfollowing

1. Select users (or Select All)
2. Check the **⏱ ETA** at the bottom
3. Click **Unfollow (N)**
4. Confirm the dialog
5. Wait — the tool handles everything with safety delays

During unfollow:
- **⏸ Pause** — temporarily stop
- **▶ Resume** — continue
- **■ Stop** — cancel entirely

### Settings

Open the **Settings** tab to adjust:
- Daily limit (default: 100)
- Session limit (default: 50)
- Hourly limit (default: 25)
- Batch size (default: 7)
- Delay ranges
- Batch pause ranges
- Reset daily count
- Clear all data

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Esc` | Close the panel |
| `Ctrl+F` | Focus the search box |
| `Ctrl+A` | Select all visible users |
| `Ctrl+D` | Deselect all |
| `Space` | Pause/Resume (during unfollow) |
| `1` | Non-Followers tab |
| `2` | Whitelist tab |
| `3` | Activity tab |
| `4` | Settings tab |
| `?` | Show shortcuts help |

---

## ⚡ Tips for Safe Usage

### Before First Use
- [ ] Make sure you're logged into Instagram
- [ ] Close other Instagram tabs (prevents session conflicts)
- [ ] Check how many accounts you follow (know what you're dealing with)

### First Run
- [ ] Start with just **5–10 unfollows**
- [ ] Wait **24 hours** before using again
- [ ] Check your account for any warnings from Instagram

### Ongoing Use
- [ ] Never use more than **once per week**
- [ ] Keep daily limit at **50 or below** for maximum safety
- [ ] **Stop immediately** if you see any challenge/verification
- [ ] Don't combine with other automation tools
- [ ] Check the **Activity** tab for error patterns

### If Something Goes Wrong
- [ ] Close the tool immediately (`Esc`)
- [ ] Don't use ANY automation for at least 48 hours
- [ ] Use Instagram normally (post, like, comment) for a few days
- [ ] If action blocked: wait 24–72 hours, it usually clears

---

## 🔧 Troubleshooting

### "Not logged in" error
**Cause:** Instagram session cookies not found.
**Fix:**
1. Go to instagram.com
2. Log in manually
3. Make sure the page fully loads (you see your feed)
4. Try again

### Console says "allow pasting"
**Cause:** Chrome's security feature for new users.
**Fix:** Type `allow pasting` in the console and press Enter.

### Nothing happens when I click the bookmark
**Cause:** The bookmark URL doesn't start with `javascript:`
**Fix:** Edit the bookmark and make sure the URL starts with `javascript:(async...`

### Scan shows 0 non-followers
**Possible causes:**
- You might actually follow everyone back! (check Fans view)
- Instagram is rate-limiting the scan
- **Fix:** Wait 5–10 minutes and try again

### "Rate limited (429)"
**Cause:** Too many requests too fast.
**Fix:** Wait 10–15 minutes before trying again. The tool will automatically retry with backoff.

### "Challenge required"
**Cause:** Instagram detected unusual activity and wants verification.
**Fix:**
1. Close the tool
2. Open Instagram normally
3. Complete whatever verification it asks
4. Wait at least 24 hours before using the tool again

### Panel UI looks broken
**Cause:** Instagram page CSS conflicting.
**Fix:** Refresh the page, or try on a different Instagram page (profile, explore).

### Export doesn't download
**Cause:** Browser blocking popups/downloads.
**Fix:** Allow downloads from instagram.com in your browser settings.

---

## 📖 Full Documentation

- **English:** [`README.md`](README.md) — Complete documentation
- **Español:** [`README.es.md`](README.es.md) — Documentación en español

---

## 🆘 Need Help?

1. Check the **Troubleshooting** section above
2. Look at the browser console for error messages
3. Check the **Activity** tab in the tool for error logs
4. Open an issue on GitHub if the problem persists

---

Ready? Pick a method above and get started! 🚀
