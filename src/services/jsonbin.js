// Cloud persistence for journal entries, backed by a JSONBin.io bin.
//
// Credentials come from the environment rather than source so the bin can be
// rotated without a code change. Note that Vite inlines VITE_* values into the
// client bundle at build time: the master key is still reachable by anyone who
// loads the site. Keep this bin dedicated to the journal and treat its contents
// as public.
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Without credentials the app runs local-only: bundled entries plus
// localStorage. That keeps `npm run dev` working before a bin is configured.
export const isCloudConfigured = Boolean(BIN_ID && MASTER_KEY);

export async function fetchCloudEntries() {
  if (!isCloudConfigured) return null;
  try {
    const res = await fetch(`${API_URL}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': MASTER_KEY,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.record)) {
      return data.record;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch from JSONBin cloud database:', err);
    return null;
  }
}

export async function saveCloudEntries(entries) {
  if (!isCloudConfigured) {
    throw new Error(
      'JSONBin is not configured. Set VITE_JSONBIN_BIN_ID and VITE_JSONBIN_MASTER_KEY in .env'
    );
  }
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
      },
      body: JSON.stringify(entries),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data && data.record ? data.record : entries;
  } catch (err) {
    console.error('Failed to save to JSONBin cloud database:', err);
    throw err;
  }
}
