import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

app.get("/teams/:leagueId/:year", async (req, res) => {
  const { leagueId, year } = req.params;
  try {
    const r = await fetch(`${BASE}/${year}/segments/0/leagues/${leagueId}?view=mTeam`);
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
      `${BASE}/${year}/segments/0/leagues/${leagueId}?view=mMatchupScore&view=mBoxscore&scoringPeriodId=${week}`
    );
    if (!r.ok) return res.status(r.status).json({ error: `ESPN returned ${r.status}` });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.send("ESPN proxy is running"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
