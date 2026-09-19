# Star Catcher: Database + Web Game Project

A Class 12 Computer Science project (Database chapter). Players log in, get a unique **GDBP_NUMBER**, play a game, and every login, match, score and play-time is stored in a SQL database.

**Stack:** HTML/CSS/JS (game) · Vercel serverless functions (API) · Supabase PostgreSQL (database) · GitHub (code)

## Folder structure

```
gdbp-game/
├── index.html      login page, GDBP pass screen, the game
├── schema.sql      database tables and view (run once in Supabase)
├── README.md       this file
└── api/
    ├── _lib.js     shared helper: database calls, login tokens
    ├── auth.js     register + login (creates GDBP_NUMBER, logs the login)
    ├── save.js     saves each finished match
    └── health.js   setup checker: open /api/health
```

The folder must be named exactly `api` and the files exactly as above.

## How it works

1. Player enters `USR_NAME` + `PASSWD` and taps Register. The server creates a row in `players`. The database gives it a unique `GDBP_NUMBER` (starting at 1001). The password is saved hashed, never as plain text.
2. Every successful login adds a row to `login_log` with a timestamp.
3. The player catches ⭐ (+10) and dodges 💣 (3 lives). When the match ends, the score and seconds played go into `matches`.
4. The `player_stats` view totals logins, matches, best score and minutes played, and the GDBP pass on screen shows them.

## Database design

```
players (1) ────< login_log (many)
players (1) ────< matches   (many)
```

| Table | Columns |
|---|---|
| players | **gdbp_number (PK)**, usr_name (UNIQUE), passwd, created_at |
| login_log | **log_id (PK)**, gdbp_number (FK), login_time |
| matches | **match_id (PK)**, gdbp_number (FK), score, duration_sec, played_at |

## Setup steps (all from your phone)

### Part 1: Supabase (database)
1. Open **supabase.com** > Start your project > sign up (GitHub or email).
2. **New project**: name `gdbp-game`, set a database password (save it somewhere), pick the nearest region, Free plan > Create. Wait about 2 minutes.
3. Left menu > **SQL Editor** > New query. Paste everything from `schema.sql` > **Run**. You should see "Success".
4. Left menu > **Table Editor**. You should see `players`, `login_log`, `matches`.
5. **Project Settings > API** (or "API Keys"). Copy two things:
   - **Project URL**, like `https://abcd1234.supabase.co`
   - The secret key: the **service_role** key (or the **secret** key if that is what your page shows). Do **not** use the anon or publishable key.

### Part 2: GitHub (code)
1. Open **github.com** in your phone browser (use "Desktop site" in the browser menu if buttons are missing).
2. **+ > New repository** > name `starcatcher` > Create.
3. **Add file > Upload files**: upload `index.html`, `schema.sql`, `README.md` > Commit.
4. **Add file > Create new file**. In the name box type `api/_lib.js` (typing the `/` creates the folder). Paste the code > Commit. Repeat for `api/auth.js`, `api/save.js`, `api/health.js`.

### Part 3: Vercel (hosting)
1. Open **vercel.com** > sign up with GitHub.
2. **Add New > Project** > import `starcatcher`.
3. Framework Preset: **Other**. Leave build settings empty.
4. Open **Environment Variables** and add these three (names exactly):
   - `SUPABASE_URL`: your Project URL
   - `SUPABASE_KEY`: your secret key
   - `TOKEN_SECRET`: any long random text (30+ characters)
5. **Deploy**. Open the link Vercel gives you.

> Changed a variable later? Go to Deployments > latest > Redeploy. Old deployments do not see new variables.

### Part 4: Test
1. Open `your-link.vercel.app/api/health`. It should show `"database":"OK"` and all three env values `true`.
2. Register, play a match, then check Supabase > Table Editor. You will see your rows in all three tables.

## Troubleshooting

| What you see | Fix |
|---|---|
| Red text "Server problem: Missing Vercel environment variable(s)..." | Add the variable in Vercel, then **Redeploy** |
| `database: "ERROR: ... relation ... does not exist"` | `schema.sql` did not run. Run it in Supabase SQL Editor |
| `ERROR: Invalid API key` | Wrong or incomplete key. Copy the secret key again, no spaces |
| `ERROR: permission denied` | Run the small grant block at the bottom of `schema.sql` (remove the `--`) |
| `ERROR: ... row-level security` | You used the anon/publishable key. Use the secret/service_role key |
| `/api/health` shows 404 | The `api` folder or file names are wrong on GitHub |
| Site worked, then stopped after some days | Supabase free projects pause after about 7 days idle. Open Supabase and click Restore |

Never put your secret key inside any file on GitHub. It belongs only in Vercel's Environment Variables.

## Queries to show in your viva (Supabase > SQL Editor)

```sql
SELECT * FROM players;
SELECT * FROM login_log ORDER BY login_time DESC;

-- JOIN
SELECT p.usr_name, m.score, m.played_at
FROM players p JOIN matches m ON p.gdbp_number = m.gdbp_number;

-- GROUP BY + aggregate functions
SELECT gdbp_number, COUNT(*) AS matches, AVG(score) AS avg_score, MAX(score) AS best
FROM matches GROUP BY gdbp_number;

-- Leaderboard
SELECT * FROM player_stats ORDER BY best_score DESC;
```

## Concepts this project shows

Primary key · Foreign key · UNIQUE constraint · One-to-many relationship · Normalisation (no repeated data across tables) · Aggregate functions · GROUP BY · JOIN · Views · Password hashing · Timestamps

## Ideas to extend

Daily leaderboard · Average score per player · Bombs hit per match · Difficulty levels · Player join date on the pass
