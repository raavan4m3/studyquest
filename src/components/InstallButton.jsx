import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (installed) return null;

  const showBanner = deferredPrompt && !dismissed;

  return (
    <>
      {showBanner && (
        <div className="install-banner">
          <div className="install-banner-content">
            <span className="install-banner-icon">📲</span>
            <div className="install-banner-text">
              <strong>Install StudyQuest</strong>
              <span>Add to home screen for the best experience</span>
            </div>
          </div>
          <div className="install-banner-actions">
            <button className="install-banner-btn" onClick={handleInstall}>Install</button>
            <button className="install-banner-close" onClick={() => setDismissed(true)}>✕</button>
          </div>
        </div>
      )}
      <button className="install-btn" onClick={handleInstall} title="Install App" style={!deferredPrompt ? { opacity: 0.3, cursor: 'default' } : {}}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </>
  );
}
