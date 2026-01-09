# Instagram Unfollow Tool

Identify and unfollow users who don't follow you back on Instagram. No installation, no external dependencies, runs entirely in your browser.

## ⚠️ Legal Disclaimer

**This tool violates Instagram's Terms of Service.** Use at your own risk.

Possible consequences:
- Temporary action blocks (hours to days)
- Permanent unfollowing restrictions
- Account shadowbanning
- Temporary or permanent account suspension

**The developer accepts no responsibility for account penalties or data loss.**

---

## ✨ Features

- **Real-time scanning** - Loads all followed accounts and detects non-followers
- **Smart filtering** - Only shows users who don't follow you back
- **Manual control** - Review and select before any action
- **Safety built-in** - Automatic delays (4-6s between unfollows, 30s pause every 5)
- **No dependencies** - Pure JavaScript, runs locally in your browser
- **Multiple methods** - Bookmarklet, console, or local copy-paste
- **Clean UI** - Beautiful interface with real-time status updates

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Bookmarklet (Easiest - Recommended)

1. Open `bookmarklet.html` in your browser
2. Copy the JavaScript code shown in the code block
3. Create a bookmark in your browser:
   - Right-click your bookmark bar
   - Click "Add bookmark" or "Add page"
   - Paste the code in the URL field (NOT the name field)
   - Name it "Instagram Unfollow"
   - Save
4. Use it:
   - Go to instagram.com and log in
   - Click your bookmark
   - Click "🔍 Scan" to load all followed users
   - Select users to unfollow by clicking them
   - Click "🚀 Unfollow" button at the bottom
   - Confirm when prompted
   - Wait while the tool unfollows users

### Method 2: Browser Console (No Setup)

1. Go to instagram.com and log in
2. Press `F12` (or `Cmd+Option+I` on Mac) to open DevTools
3. Click the "Console" tab
4. Copy the complete code from `script-main.js`
5. Paste it into the console and press Enter
6. The tool will start automatically

### Method 3: Local HTML File (No Hosting)

1. Download or clone this repository
2. Open `COPY_CODE.html` in your web browser
3. Follow the 4 steps shown on the page
4. Copy the code
5. Open instagram.com, press F12, go to Console
6. Paste the code and press Enter

---

## ⏱️ Safety Delays (Built-In)

The tool automatically includes delays to avoid Instagram detection:

| Action | Wait Time | Reason |
| --- | --- | --- |
| Between unfollows | 4-6 seconds (random) | Avoid rate limiting |
| Every 5 unfollows | 30 second pause | Prevent detection |
| Between API calls | 300ms | Maintain connection |

**Timing estimates:**
- Scanning 1650 users: 2-5 minutes
- Unfollowing 100 users: 8-12 minutes
- Unfollowing 500 users: 40-60 minutes

---

## 📁 Project Files

| File | Purpose |
| --- | --- |
| `bookmarklet.html` | Step-by-step setup guide with working code |
| `COPY_CODE.html` | Copy-paste interface for the code |
| `script-main.js` | Full source code (readable, commented) |
| `README.md` | English documentation |
| `README.es.md` | Spanish documentation |
| `LICENSE` | MIT License |

---

## 🔍 How It Works

The tool:
1. Authenticates using your existing Instagram session (no password needed)
2. Fetches all users you follow via Instagram's GraphQL API
3. Filters out users who don't follow you back
4. Shows them in a clean interface for manual review
5. Unfollows selected users with automatic safety delays
6. Provides real-time status updates

**Technical Details:**
- Query Hash: `3dec7e2c57367ef3da3d987d89f9dbc8`
- API Endpoint: `POST /web/friendships/{userID}/unfollow/`
- Authentication: Uses `ds_user_id` and `csrftoken` cookies from your session

---

## ⚠️ Important Safety Tips

1. **Test first** - Unfollow 1-2 users and wait 24 hours to see if Instagram reacts
2. **Don't overuse** - Use once per week maximum, not daily
3. **Monitor your account** - Watch for action blocks or shadowbanning
4. **Back up first** - Save your follow list externally before using
5. **Stop if blocked** - If Instagram blocks unfollowing, wait several days before trying again

---

## 🚨 Risks & What to Expect

| Issue | How Likely | What To Do |
| --- | --- | --- |
| Unfollow temporarily blocked | High | Wait 24 hours and try again |
| Shadowban (reduced visibility) | Medium | Stop using automation, post normally for weeks |
| Action block on account | Medium | Reduce all activity on the account |
| Account suspension | Low | Contact Instagram support to appeal |

---

## 🐛 Troubleshooting

**"Not authenticated" error**
- Make sure you're logged into Instagram
- Close any other Instagram tabs
- Clear your browser cookies
- Refresh and try again

**Bookmarklet code not working**
- Verify the code starts with `javascript:`
- Check the browser console (F12) for errors
- Try creating the bookmark again
- Make sure you pasted in the URL field, not the name field

**User list not showing up**
- Wait for the scan to complete (watch the progress bar)
- The scan may be slow due to Instagram's API rate limits
- You must have followed users for this to work

**Unfollows failing or not completing**
- Instagram may have temporarily blocked you
- Wait 24 hours before trying again
- Try unfollowing fewer users next time
- Make sure you're still logged into Instagram

---

## 🔐 Privacy & Security

- ✅ Runs entirely in your browser (no servers)
- ✅ No data is sent to external services (except Instagram)
- ✅ No login credentials are stored
- ✅ No password required
- ✅ Uses only your existing Instagram session

---

## 📝 How to Use Safely

1. Test with a small number of users first (5-10)
2. Wait 24 hours and check if your account is still working normally
3. If no issues, gradually increase the number
4. Never use more than once per week
5. Stop immediately if Instagram blocks your unfollows

---

## ⚖️ License & Disclaimer

This project is released under the MIT License. It is **NOT** affiliated with, endorsed by, or associated with Instagram or Meta Platforms.

**Using automation tools violates Instagram's Terms of Service.** You use this tool entirely at your own risk. The developer accepts no responsibility for:
- Account restrictions or suspensions
- Loss of followers or data
- Temporary or permanent account penalties
- Any other consequences of using this tool

Use responsibly and at your own risk.

---

## 💡 How It's Made

This tool is written in vanilla JavaScript (ES6+) with no external dependencies. The code is designed to be:
- **Simple** - Easy to understand and modify
- **Transparent** - See exactly what it does
- **Safe** - No hidden requests or data collection
- **Efficient** - Minimal API calls, respects rate limits

---

## 🤝 Contributing

Found a bug or have an improvement? Feel free to:
- Report issues
- Suggest features
- Submit code improvements

---

## 📞 Questions?

Check the troubleshooting section above. Most issues are related to:
- Not being logged into Instagram
- Instagram temporarily blocking unfollows
- Incorrect bookmark setup

---

**Last updated:** January 2026
