import { useEffect, useState } from 'react';

interface AdBlockerOptions {
  enableOverlay?: boolean;
  enableBlurTrap?: boolean;
  blockedDomains?: string[];
}

export const useAdBlocker = ({
  enableOverlay = true,
  enableBlurTrap = true,
  blockedDomains = ['popads', 'doubleclick', 'adservice']
}: AdBlockerOptions = {}) => {

  const [clickedOnce, setClickedOnce] = useState(false);

  useEffect(() => {
    // 🔴 Block window.open
    const originalOpen = window.open;
    window.open = function (url?: string | URL, ...args: any[]) {
      if (
        typeof url === 'string' &&
        blockedDomains.some(d => url.includes(d))
      ) {
        console.warn('Blocked popup:', url);
        return null;
      }
      // @ts-ignore
      return originalOpen.call(window, url, ...args);
    };

    // 🔴 Block target="_blank"
    const clickHandler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a');
      if (a && a.target === '_blank') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener('click', clickHandler, true);

    // 🔴 Block URL redirects
    let lastUrl = window.location.href;
    const interval = setInterval(() => {
      if (window.location.href !== lastUrl) {
        console.warn('Blocked redirect:', window.location.href);
        window.history.pushState(null, '', lastUrl);
      }
    }, 500);

    // 🔴 Blur trap
    const blurHandler = () => {
      if (!enableBlurTrap) return;
      setTimeout(() => {
        window.focus();
      }, 100);
    };
    window.addEventListener('blur', blurHandler);

    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', clickHandler, true);
      clearInterval(interval);
      window.removeEventListener('blur', blurHandler);
    };
  }, [blockedDomains, enableBlurTrap]);

  return {
    clickedOnce,
    setClickedOnce,
    overlayEnabled: enableOverlay
  };
};
