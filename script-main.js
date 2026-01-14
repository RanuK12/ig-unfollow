// Instagram Unfollow Tool
// Scan followed accounts and unfollow non-followers
// Run from browser console while logged into Instagram

(async () => {
  // Safety delays to avoid rate limiting and detection
  const delays = {
    unfollow: [4000, 6000],   // 4-6 sec between unfollows
    pause: 30000,              // 30 sec pause after every 5
    batch: 300,                // Between API calls
  };

  const Utils = {
    getCookie: (name) => {
      const cookies = '; ' + document.cookie;
      const parts = cookies.split('; ' + name + '=');
      return parts.length === 2 ? parts.pop().split(';').shift() : null;
    },

    getUserID: () => Utils.getCookie('ds_user_id'),
    getCSRFToken: () => Utils.getCookie('csrftoken'),
    
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    randomDelay: (min, max) => Math.floor(Math.random() * (max - min) + min),
  };

  const API = {
    async fetchFollowing(cursor = null) {
      const userID = Utils.getUserID();
      if (!userID) throw new Error('Not authenticated');

      const variables = {
        id: userID,
        include_reel: true,
        fetch_mutual: false,
        first: 50,
      };

      if (cursor) variables.after = cursor;

      const url = 'https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables=' 
        + JSON.stringify(variables);

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0]?.message || 'API error');

      return data.data.user.edge_follow;
    },

    async unfollow(userID) {
      const csrf = Utils.getCSRFToken();
      if (!csrf) throw new Error('No CSRF token');

      const response = await fetch(
        'https://www.instagram.com/web/friendships/' + userID + '/unfollow/',
        {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrf,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    },
  };

  let allUsers = [];
  let selectedUsers = new Set();
  let scrollTimeout = null;
  let cachedNonFollowers = [];

  // Create UI container
  const root = document.createElement('div');
  root.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:system-ui,sans-serif;';
  document.body.appendChild(root);

  const box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:12px;width:90%;max-width:700px;max-height:85vh;display:flex;flex-direction:column;';
  root.appendChild(box);

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'padding:20px;border-bottom:1px solid #e0e0e0;';

  const title = document.createElement('h2');
  title.textContent = '📱 Instagram Unfollow';
  title.style.cssText = 'margin:0 0 10px;color:#333;';
  header.appendChild(title);

  const statusDiv = document.createElement('div');
  statusDiv.textContent = 'Ready to scan';
  statusDiv.style.cssText = 'text-align:center;padding:8px;background:#f0f0f0;border-radius:8px;color:#666;font-size:12px;margin-bottom:10px;';
  header.appendChild(statusDiv);

  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'width:100%;height:6px;background:#e0e0e0;border-radius:3px;margin-bottom:10px;overflow:hidden;display:none;';
  const progressFill = document.createElement('div');
  progressFill.style.cssText = 'height:100%;background:#667eea;width:0%;';
  progressBar.appendChild(progressFill);
  header.appendChild(progressBar);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';

  const scanBtn = document.createElement('button');
  scanBtn.textContent = '🔍 Scan';
  scanBtn.style.cssText = 'flex:1;min-width:100px;padding:10px;background:#667eea;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer;';

  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = '✓ All';
  selectAllBtn.style.cssText = 'flex:1;min-width:80px;padding:10px;background:#667eea;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer;display:none;';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '✕ Clear';
  clearBtn.style.cssText = 'flex:1;min-width:80px;padding:10px;background:#e0e0e0;color:#333;border:0;border-radius:8px;font-weight:bold;cursor:pointer;display:none;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'flex:1;min-width:80px;padding:10px;background:#e0e0e0;color:#333;border:0;border-radius:8px;font-weight:bold;cursor:pointer;';
  closeBtn.onclick = () => root.remove();

  buttonContainer.appendChild(scanBtn);
  buttonContainer.appendChild(selectAllBtn);
  buttonContainer.appendChild(clearBtn);
  buttonContainer.appendChild(closeBtn);
  header.appendChild(buttonContainer);
  box.appendChild(header);

  // User list container with virtual scrolling
  const userList = document.createElement('div');
  userList.style.cssText = 'flex:1;overflow-y:auto;padding:0;position:relative;';
  box.appendChild(userList);

  // Virtual scrolling container
  const virtualContainer = document.createElement('div');
  virtualContainer.style.cssText = 'position:relative;';
  userList.appendChild(virtualContainer);

  // Footer with unfollow button
  const footer = document.createElement('div');
  footer.style.cssText = 'padding:15px;border-top:1px solid #e0e0e0;background:#f9f9f9;flex-shrink:0;';

  const unfollowBtn = document.createElement('button');
  unfollowBtn.style.cssText = 'width:100%;padding:12px;background:#dc3545;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer;display:none;';
  unfollowBtn.textContent = '🚀 Unfollow (0)';
  footer.appendChild(unfollowBtn);
  box.appendChild(footer);

  // Virtual scrolling parameters
  const ITEM_HEIGHT = 76;
  const VISIBLE_ITEMS = 8;
  let visibleStart = 0;
  let visibleEnd = VISIBLE_ITEMS;

  function updateVirtualScroll() {
    const scrollTop = userList.scrollTop;
    visibleStart = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 2);
    visibleEnd = Math.min(cachedNonFollowers.length, visibleStart + VISIBLE_ITEMS + 4);
    renderVirtual();
  }

  function renderVirtual() {
    virtualContainer.innerHTML = '';
    virtualContainer.style.height = cachedNonFollowers.length * ITEM_HEIGHT + 'px';

    const visibleItems = cachedNonFollowers.slice(visibleStart, visibleEnd);
    const offsetY = visibleStart * ITEM_HEIGHT;

    visibleItems.forEach((user, idx) => {
      const item = document.createElement('div');
      const isSelected = selectedUsers.has(user.id);

      item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #e0e0e0;cursor:pointer;background:' + (isSelected ? '#f0f7ff' : 'white') + ';border-left:4px solid ' + (isSelected ? '#667eea' : 'transparent') + ';transition:all 0.2s;position:absolute;top:' + ((visibleStart + idx) * ITEM_HEIGHT) + 'px;width:100%;box-sizing:border-box;';

      item.onmouseover = () => item.style.background = isSelected ? '#f0f7ff' : '#f9f9f9';
      item.onmouseout = () => item.style.background = isSelected ? '#f0f7ff' : 'white';

      // Lazy load image
      const img = document.createElement('img');
      img.style.cssText = 'width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#e0e0e0;';
      img.onload = () => img.style.background = 'none';
      img.src = user.profile_pic_url;

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;';

      const username = document.createElement('div');
      username.textContent = '@' + user.username;
      username.style.cssText = 'font-weight:600;color:#333;font-size:13px;word-break:break-word;';

      const status = document.createElement('div');
      status.textContent = '🔴 Not following back';
      status.style.cssText = 'color:#dc3545;font-size:11px;margin-top:2px;';

      info.appendChild(username);
      info.appendChild(status);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isSelected;
      checkbox.style.cssText = 'width:18px;height:18px;flex-shrink:0;cursor:pointer;';

      item.onclick = (e) => {
        e.stopPropagation();
        if (selectedUsers.has(user.id)) {
          selectedUsers.delete(user.id);
        } else {
          selectedUsers.add(user.id);
        }
        unfollowBtn.textContent = '🚀 Unfollow (' + selectedUsers.size + ')';
        item.style.background = selectedUsers.has(user.id) ? '#f0f7ff' : 'white';
        item.style.borderLeft = selectedUsers.has(user.id) ? '4px solid #667eea' : '4px solid transparent';
      };

      item.appendChild(img);
      item.appendChild(info);
      item.appendChild(checkbox);
      virtualContainer.appendChild(item);
    });

    if (cachedNonFollowers.length === 0 && allUsers.length > 0) {
      const msg = document.createElement('div');
      msg.textContent = '✅ Everyone follows you!';
      msg.style.cssText = 'text-align:center;padding:20px;color:#666;';
      virtualContainer.appendChild(msg);
    }
  }

  // Debounced scroll handler
  userList.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateVirtualScroll, 50);
  });

  function render() {
    cachedNonFollowers = allUsers.filter(u => !u.follows_viewer);
    visibleEnd = Math.min(cachedNonFollowers.length, VISIBLE_ITEMS + 4);
    renderVirtual();
  }

  scanBtn.onclick = async () => {
    scanBtn.disabled = true;
    let cursor = null;

    try {
      progressBar.style.display = 'block';
      const tempUsers = [];

      for (;;) {
        const response = await API.fetchFollowing(cursor);
        const newUsers = response.edges.map(e => e.node);
        tempUsers.push(...newUsers);

        // Update every 50 users to avoid hanging
        if (tempUsers.length % 50 === 0 || !response.page_info?.has_next_page) {
          allUsers = tempUsers.slice();
          const percent = Math.round(allUsers.length / 1650 * 100);
          progressFill.style.width = percent + '%';
          statusDiv.textContent = 'Scanned: ' + allUsers.length;
          render();
          
          // Allow browser to breathe
          await Utils.sleep(10);
        }

        if (!response.page_info?.has_next_page) break;

        cursor = response.page_info.end_cursor;
        await Utils.sleep(300);
      }

      progressBar.style.display = 'none';
      const nonFollowerCount = allUsers.filter(u => !u.follows_viewer).length;
      statusDiv.textContent = '✅ ' + allUsers.length + ' total (' + nonFollowerCount + ' not following back)';

      scanBtn.style.display = 'none';
      selectAllBtn.style.display = 'inline-block';
      clearBtn.style.display = 'inline-block';
      unfollowBtn.style.display = 'block';
    } catch (error) {
      statusDiv.textContent = '❌ ' + error.message;
      scanBtn.disabled = false;
    }
  };

  selectAllBtn.onclick = () => {
    allUsers.filter(u => !u.follows_viewer).forEach(u => selectedUsers.add(u.id));
    render();
    unfollowBtn.textContent = '🚀 Unfollow (' + selectedUsers.size + ')';
  };

  clearBtn.onclick = () => {
    selectedUsers.clear();
    render();
    unfollowBtn.textContent = '🚀 Unfollow (0)';
  };

  unfollowBtn.onclick = async () => {
    if (selectedUsers.size === 0) {
      alert('Select at least one user');
      return;
    }

    if (!confirm('Unfollow ' + selectedUsers.size + ' users? This may take several minutes.')) {
      return;
    }

    unfollowBtn.disabled = true;
    progressBar.style.display = 'block';

    let completed = 0;
    const total = selectedUsers.size;
    const userIDArray = Array.from(selectedUsers);

    for (let i = 0; i < userIDArray.length; i++) {
      const userID = userIDArray[i];
      try {
        await API.unfollow(userID);
        completed++;
      } catch (error) {
        console.log('Error unfollowing:', error);
      }

      statusDiv.textContent = 'Unfollowing... ' + completed + '/' + total;

      // 30 sec pause after every 5 unfollows
      if ((completed + 1) % 5 === 0) {
        statusDiv.textContent = 'Unfollowing... ' + completed + '/' + total + ' (30s pause)';
        await Utils.sleep(delays.pause);
      } else {
        await Utils.sleep(Utils.randomDelay(delays.unfollow[0], delays.unfollow[1]));
      }

      // Clear memory references periodically
      if (completed % 50 === 0) {
        allUsers = allUsers.filter(u => !selectedUsers.has(u.id));
        cachedNonFollowers = cachedNonFollowers.filter(u => !selectedUsers.has(u.id));
      }
    }

    progressBar.style.display = 'none';
    statusDiv.textContent = '✅ ' + completed + ' unfollowed';
    unfollowBtn.disabled = false;
    selectedUsers.clear();
    allUsers = [];
    cachedNonFollowers = [];
    virtualContainer.innerHTML = '';

    scanBtn.style.display = 'inline-block';
    selectAllBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    unfollowBtn.style.display = 'none';
  };
})();
