const { db, verify, summary } = require('./_lib');

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const id = verify(body.token);
    if (!id) return res.status(401).json({ error: 'Session ended. Log in again.' });

    const score = Math.min(Math.max(+body.score | 0, 0), 100000);
    const duration = Math.min(Math.max(+body.duration | 0, 0), 3600);
    await db('matches', 'POST', { gdbp_number: id, score, duration_sec: duration });
    res.json(await summary(id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save: ' + e.message });
  }
};
