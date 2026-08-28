import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

const espnCookie =
  process.env.ESPN_S2 && process.env.ESPN_SWID
    ? `espn_s2=${process.env.ESPN_S2}; SWID=${process.env.ESPN_SWID}`
    : "";

const ESPN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Accept: "application/json",
  Referer: "https://fantasy.espn.com/",
  ...(espnCookie ? { Cookie: espnCookie } : {}),
};

app.get("/debug", (req, res) => {
  res.json({
    hasEspnS2: !!process.env.ESPN_S2,
    hasEspnSwid: !!process.env.ESPN_SWID,
    espnS2Length: process.env.ESPN_S2 ? process.env.ESPN_S2.length : 0,
    swidPreview: process.env.ESPN_SWID ? process.env.ESPN_SWID.slice(0, 6) + "..." : null,
  });
});

app.get("/teams/:leagueId/:year", async (req, res) => {
  const { leagueId, year } = req.params;
  try {
    const r = await fetch(`${BASE}/${year}/segments/0/leagues/${leagueId}?view=mTeam`, { headers: ESPN_HEADERS });
    if (!r.ok) return res.status(r.status).json({ error: `ESPN returned ${r.status}` });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/week/:leagueId/:year/:week", async (req, res) => {
  const { leagueId, year, week } = req.params;
  try {
    const r = await fetch(
      `${BASE}/${year}/segments/0/leagues/${leagueId}?view=mMatchupScore&view=mBoxscore&scoringPeriodId=${week}`,
      { headers: ESPN_HEADERS }
    );
    if (!r.ok) return res.status(r.status).json({ error: `ESPN returned ${r.status}` });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
