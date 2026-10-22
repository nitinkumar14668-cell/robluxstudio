/**
 * Mobile Device Orientation & Fullscreen Engine for Roblox Studio Web
 */

export function isDeviceLandscape(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.includes('landscape');
  }
  return window.innerWidth >= window.innerHeight;
}

/**
 * Attempts to request landscape orientation and optional fullscreen
 */
export async function requestLandscapeMode(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Try Screen Orientation Lock API directly
  try {
    const orientation = window.screen?.orientation as {
      lock?: (type: string) => Promise<void>;
    };
    if (orientation?.lock) {
      await orientation.lock('landscape');
      return true;
    }
  } catch {
    // Screen orientation lock might require fullscreen first or be unsupported
  }

  // 2. Try entering Fullscreen mode first, then locking landscape
  try {
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
    }

    const orientation = window.screen?.orientation as {
      lock?: (type: string) => Promise<void>;
    };
    if (orientation?.lock) {
      await orientation.lock('landscape');
      return true;
    }
  } catch {
    // Browser may restrict orientation lock inside iframe
  }

  return false;
}

/**
 * Toggles Fullscreen display
 */
export async function toggleFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false;

  try {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
        return true;
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return false;
      }
    }
  } catch {
    // Handled
  }
  return false;
}

/**
 * Subscribes to orientation / viewport aspect changes
 */
export function subscribeOrientation(onChange: (isLandscape: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const check = () => {
    onChange(isDeviceLandscape());
  };

  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', check);

  if (window.screen?.orientation) {
    window.screen.orientation.addEventListener('change', check);
  }

  return () => {
    window.removeEventListener('resize', check);
    window.removeEventListener('orientationchange', check);
    if (window.screen?.orientation) {
      window.screen.orientation.removeEventListener('change', check);
    }
  };
}
