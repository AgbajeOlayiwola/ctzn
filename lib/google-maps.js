export function googleLocationLinks(pin) {
  if (!pin || !Number.isFinite(pin.lat) || !Number.isFinite(pin.lng) || Math.abs(pin.lat) > 90 || Math.abs(pin.lng) > 180) return null;
  const point = `${pin.lat},${pin.lng}`;
  return {
    map: `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: point })}`,
    streetView: `https://www.google.com/maps/@?${new URLSearchParams({ api: '1', map_action: 'pano', viewpoint: point })}`,
  };
}

let loading;
export function loadGoogleMaps(key) {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => fail(), 15000);
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('Google Maps could not load.'));
    }
    window.ctznGoogleMapsReady = () => {
      window.clearTimeout(timer);
      resolve(window.google.maps);
    };
    window.gm_authFailure = () => {
      window.dispatchEvent(new Event('ctzn-google-maps-auth-failure'));
      fail();
    };
    script.async = true;
    script.onerror = fail;
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: 'quarterly', loading: 'async', callback: 'ctznGoogleMapsReady' })}`;
    document.head.appendChild(script);
  }).catch((error) => { loading = null; throw error; });
  return loading;
}
