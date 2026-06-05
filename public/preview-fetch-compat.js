(function normalizePreviewFetchDescriptor() {
  try {
    var currentFetch = window.fetch;
    if (typeof currentFetch !== 'function') {
      return;
    }

    var descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    var needsWritableDescriptor =
      !descriptor || descriptor.get || descriptor.set || descriptor.writable === false;

    if (needsWritableDescriptor) {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: currentFetch.bind(window),
      });
    }
  } catch (error) {
    console.warn('[Preview] Unable to normalize window.fetch descriptor:', error);
  }
})();
