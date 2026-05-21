// Hook minimal de géocodage adresse → lat/lng via Nominatim (OSM).
// Gratuit, attribution requise (mention « © OpenStreetMap contributors »).
// Limite : 1 requête/seconde. On débraye via debounce dans l'appelant.
//
// Doc : https://operations.osmfoundation.org/policies/nominatim/

export interface ResultatGeocodage {
  latitude: number;
  longitude: number;
  ville: string | null;
  adresse_complete: string;
}

const cache = new Map<string, ResultatGeocodage | null>();

export async function geocoderAdresse(
  adresse: string,
): Promise<ResultatGeocodage | null> {
  const cle = adresse.trim().toLowerCase();
  if (!cle) return null;
  if (cache.has(cle)) return cache.get(cle) ?? null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', adresse);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');

  try {
    const reponse = await fetch(url.toString(), {
      headers: {
        // Header User-Agent ignoré par le navigateur, mais Referer suffit
        // pour identifier l'application chez Nominatim.
        Accept: 'application/json',
      },
    });
    if (!reponse.ok) {
      cache.set(cle, null);
      return null;
    }
    const data = (await reponse.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
      };
    }>;
    if (data.length === 0) {
      cache.set(cle, null);
      return null;
    }
    const r = data[0];
    const ville =
      r.address?.city ??
      r.address?.town ??
      r.address?.village ??
      r.address?.municipality ??
      null;
    const resultat: ResultatGeocodage = {
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      ville,
      adresse_complete: r.display_name,
    };
    cache.set(cle, resultat);
    return resultat;
  } catch {
    cache.set(cle, null);
    return null;
  }
}
