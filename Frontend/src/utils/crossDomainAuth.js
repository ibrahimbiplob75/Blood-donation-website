/**
 * Cross-Domain Authentication Utility
 * Handles logout across multiple tabs and domains
 */

// List all domains where the app is accessible
const APP_DOMAINS = [
  'https://rmcrotaract.org',
  'https://blood-management-rmc.web.app',
  'https://blood-management-rmc.firebaseapp.com'
];

/**
 * Clear authentication data from localStorage and cookies
 */
export const clearLocalAuthData = () => {
  const keysToRemove = [
    'adminToken',
    'userToken',
    'userData',
    'AccessToken',
    'token',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    sessionStorage.removeItem(key);
  });
};

/**
 * Broadcast logout message to other tabs/windows
 */
export const broadcastLogout = () => {
  // Use BroadcastChannel API if available
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('auth_channel');
      channel.postMessage({ type: 'LOGOUT', timestamp: Date.now() });
      channel.close();
    } catch (error) {
      console.error('BroadcastChannel error:', error);
    }
  }

  // Also use localStorage event as fallback
  localStorage.setItem('logout_event', Date.now().toString());
  localStorage.removeItem('logout_event');
};

/**
 * Listen for logout events from other tabs/windows
 */
export const setupLogoutListener = (onLogout) => {
  // BroadcastChannel listener
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('auth_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        onLogout();
      }
    };
  }

  // localStorage event listener (for cross-tab communication)
  const handleStorageChange = (e) => {
    if (e.key === 'logout_event') {
      onLogout();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Trigger logout on other domains using iframe approach
 */
export const triggerCrossDomainLogout = () => {
  return new Promise((resolve) => {
    const currentDomain = window.location.origin;
    const otherDomains = APP_DOMAINS.filter(domain => domain !== currentDomain);

    if (otherDomains.length === 0) {
      resolve();
      return;
    }

    let completedCount = 0;
    const iframes = [];

    const cleanup = () => {
      iframes.forEach(iframe => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      });
    };

    const checkComplete = () => {
      completedCount++;
      if (completedCount >= otherDomains.length) {
        cleanup();
        resolve();
      }
    };

    otherDomains.forEach(domain => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${domain}/logout-silent.html?t=${Date.now()}`;

      const timeout = setTimeout(() => {
        checkComplete();
      }, 3000);

      iframe.onload = () => {
        clearTimeout(timeout);
        setTimeout(() => {
          checkComplete();
        }, 500);
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        checkComplete();
      };

      iframes.push(iframe);
      document.body.appendChild(iframe);
    });

    // Fallback: resolve after 5 seconds regardless
    setTimeout(() => {
      cleanup();
      resolve();
    }, 5000);
  });
};

/**
 * Complete logout
 * This is the main function to call when logging out
 */
export const performLogout = async (backendLogoutFn = null) => {
  try {
    // 1. Broadcast logout to other tabs/windows on same domain
    broadcastLogout();

    // 2. Call backend logout API if provided
    if (backendLogoutFn) {
      try {
        await backendLogoutFn();
      } catch (error) {
        console.error('Backend logout error:', error);
      }
    }

    // 3. Clear local storage and cookies
    clearLocalAuthData();

    // 4. Trigger logout on other domains
    await triggerCrossDomainLogout();

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);

    // Force clear local data even on error
    clearLocalAuthData();

    return { success: false, error };
  }
};

/**
 * Initialize auth listeners on app load
 */
export const initializeAuthListeners = (onLogout) => {
  return setupLogoutListener(onLogout);
};

export default {
  clearLocalAuthData,
  broadcastLogout,
  setupLogoutListener,
  triggerCrossDomainLogout,
  performLogout,
  initializeAuthListeners,
  APP_DOMAINS,
};
