const crypto = require('crypto');
const { SUPABASE_URL: URL_, SUPABASE_KEY: KEY, TOKEN_SECRET: SECRET } = process.env;

// Talk to the database through Supabase's REST API
async function db(path, method = 'GET', body) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body && JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || 'Database error');
  return d;
}

const mac = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('hex');

// Login token: gdbp.expiry.signature (valid 24 hours)
const sign = (id) => {
  const p = `${id}.${Date.now() + 864e5}`;
  return `${p}.${mac(p)}`;
};

function verify(t = '') {
  const [id, exp, sig] = String(t).split('.');
  return sig && mac(`${id}.${exp}`) === sig && Date.now() < +exp ? +id : null;
}

async function summary(id) {
  const [stats] = await db(`player_stats?gdbp_number=eq.${id}`);
  const top = await db('player_stats?order=best_score.desc&limit=5');
  return { stats, top };
}

module.exports = { db, sign, verify, summary };
