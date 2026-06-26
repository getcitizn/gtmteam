# gtmteam

A small team of agents that find prospect conversations across the web,
decide which ones matter, draft on-brand replies, and hold them in an
approval queue for a human to post. Runs on a schedule via GitHub
Actions — no server to host.

## Agents

| Agent | Job |
|---|---|
| Radar | Searches Twitter/X and Reddit for ICP-matching conversations (LinkedIn is a documented stub — see `src/sources/linkedin.ts`) |
| Strategist | Scores leads against mission/ICP, marks `engage` or `skip` |
| Writer | Drafts a reply in the team's voice for `engage` leads |
| Designer | Flags drafts that would benefit from a visual and writes a spec/prompt (no image-gen API wired up yet) |
| Publisher | Renders **approved** drafts into `data/ready-to-post.md` — no auto-posting |
| Analyst | Ingests manually-recorded engagement numbers (`data/metrics-input.json`) into `data/metrics.json` |
| Coach | Compares decisions against metrics and appends learnings to `config/playbook.md`, which feeds back into Strategist/Writer prompts |

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `ANTHROPIC_API_KEY` (required), plus `TWITTER_BEARER_TOKEN` and `REDDIT_USER_AGENT` if you want those sources live.
3. Fill in `config/mission.md`, `config/voice.md`, and `config/icp.md` — these are placeholders the agents read on every run.
4. For the scheduled GitHub Actions workflows, add the same values as repo secrets (Settings → Secrets and variables → Actions).

## Running locally

```
npm run pipeline   # radar -> strategist -> writer -> designer -> publisher
npm run review     # list drafts pending review
npm run approve -- <draft-id>
npm run reject -- <draft-id>
npm run publish    # re-render data/ready-to-post.md from approved drafts
npm run analyze    # ingest data/metrics-input.json into data/metrics.json
npm run coach      # append learnings to config/playbook.md
```

## Scheduling

- `.github/workflows/gtm-pipeline.yml` runs Radar→Publisher hourly and commits updated `data/` files back to the repo.
- `.github/workflows/gtm-learn.yml` runs Analyst→Coach daily.

Both can also be triggered manually via `workflow_dispatch`.

## Known limitations

- **LinkedIn**: no usable public search/post API for prospecting without partner access; the adapter always returns no leads. Wire in a real source if/when you have access.
- **Designer**: produces a text spec/image prompt only — no image-generation API is called.
- **Analyst**: relies on you manually recording engagement numbers in `data/metrics-input.json` after posting, since Twitter/Reddit free tiers don't reliably expose performance for arbitrary replies.
- **Publisher**: never posts on your behalf — it only prepares `data/ready-to-post.md` for manual copy/paste.
