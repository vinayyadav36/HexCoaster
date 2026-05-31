import { useEffect, useState } from 'react';

// Extend Event with prompt and userChoice
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-neutral-200 z-50 flex items-center space-x-4">
      <div>
        <h3 className="font-bold text-sm">Install HexCoaster</h3>
        <p className="text-xs text-neutral-500">Add to home screen for offline use.</p>
      </div>
      <button
        onClick={handleInstall}
        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
      >
        Install
      </button>
      <button
        onClick={() => setDeferredPrompt(null)}
        className="text-neutral-400 hover:text-neutral-600 px-2"
      >
        ×
      </button>
    </div>
  );
}
