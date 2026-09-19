const crypto = require('crypto');

// Trim spaces/newlines that sneak in when pasting on a phone
const clean = (v) => (v || '').trim();
const KEY = clean(process.env.SUPABASE_KEY);
const SECRET = clean(process.env.TOKEN_SECRET);
let URL_ = clean(process.env.SUPABASE_URL).replace(/\/+$/, '');
if (URL_ && !URL_.startsWith('http')) URL_ = 'https://' + URL_;

function checkEnv() {
  const missing = ['SUPABASE_URL', 'SUPABASE_KEY', 'TOKEN_SECRET'].filter((k) => !clean(process.env[k]));
  if (missing.length) throw new Error('Missing Vercel environment variable(s): ' + missing.join(', '));
}

// Talk to the database through Supabase's REST API
async function db(path, method = 'GET', body) {
  checkEnv();
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      // legacy service_role keys are JWTs; new sb_secret_ keys go in apikey only
      ...(KEY.startsWith('sb_') ? {} : { Authorization: `Bearer ${KEY}` }),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body && JSON.stringify(body),
  });
  const text = await r.text();
  let d;
  try { d = JSON.parse(text); } catch { d = { message: text.slice(0, 200) }; }
  if (!r.ok) throw new Error(d.message || d.error || `Database error ${r.status}`);
  return d;
}

const mac = (s) => {
  checkEnv();
  return crypto.createHmac('sha256', SECRET).update(s).digest('hex');
};

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
