const crypto = require('crypto');
const { db, sign, summary } = require('./_lib');

const hash = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');

module.exports = async (req, res) => {
  try {
    const { mode, usr_name: name, passwd } = req.body || {};
    if (!/^\w{3,20}$/.test(name || '') || (passwd || '').length < 4) {
      return res.status(400).json({ error: 'Name: 3-20 letters, digits or _. Password: 4+ characters.' });
    }

    let id;
    if (mode === 'register') {
      const salt = crypto.randomBytes(8).toString('hex');
      const [p] = await db('players', 'POST', { usr_name: name, passwd: `${salt}:${hash(passwd, salt)}` });
      id = p.gdbp_number; // the new GDBP_NUMBER
    } else {
      const [p] = await db(`players?usr_name=eq.${name}`);
      const [salt, h] = p ? p.passwd.split(':') : [];
      if (!p || hash(passwd, salt) !== h) return res.status(401).json({ error: 'Wrong name or password.' });
      id = p.gdbp_number;
    }

    await db('login_log', 'POST', { gdbp_number: id }); // record this login + timestamp
    res.json({ token: sign(id), ...(await summary(id)) });
  } catch (e) {
    res.status(400).json({ error: /duplicate/.test(e.message) ? 'That name is taken. Try another.' : 'Something went wrong. Try again.' });
  }
};
