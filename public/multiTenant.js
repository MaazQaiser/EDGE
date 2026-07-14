(function () {
  const confgis = {
    'filter-go.com': {
      brand: 'Filter-go',
      brandText:
        'Filter-go (Formerly Filter-go 88) provides a full suite of world-class security services for residential, commercial, retail & institutional customers.',
    },
    'teamsignal.com': {
      brand: 'Signal',
      brandText:
        'Signal (Formerly Signal 88) provides a full suite of world-class security services for residential, commercial, retail & institutional customers.',
    },
  };

  function getMainDomain() {
    const hostname = window.location.hostname;

    if (window.__NODE_ENV__ === 'localhost') {
      return window.__TENANT__;
    }
    const parts = hostname.split('.');
    return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  }

  // Expose to window
  window.getTenantConfig = function () {
    const domain = getMainDomain();
    return confgis[domain] || { brand: 'Signal' };
  };
})();
