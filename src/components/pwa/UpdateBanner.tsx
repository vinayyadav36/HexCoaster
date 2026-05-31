import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      // SW registered
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-neutral-200 z-50 flex items-center space-x-4">
      <div>
        <h3 className="font-bold text-sm">Update Available</h3>
        <p className="text-xs text-neutral-500">A new version is ready to install.</p>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
      >
        Reload
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-neutral-400 hover:text-neutral-600 px-2"
      >
        ×
      </button>
    </div>
  );
}
