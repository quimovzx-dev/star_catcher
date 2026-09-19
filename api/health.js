// Open  /api/health  in the browser to check your setup
const { db } = require('./_lib');

module.exports = async (req, res) => {
  const env = Object.fromEntries(
    ['SUPABASE_URL', 'SUPABASE_KEY', 'TOKEN_SECRET'].map((k) => [k, !!(process.env[k] || '').trim()])
  );
  try {
    await db('players?select=gdbp_number&limit=1');
    await db('player_stats?select=gdbp_number&limit=1');
    res.json({ env, database: 'OK' });
  } catch (e) {
    res.json({ env, database: 'ERROR: ' + e.message });
  }
};
