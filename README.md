# Chart Prepared

A group trip decision tool. One link, everyone answers once, three options, one locked decision.

Built for five friends who spent three months and 1,200 WhatsApp messages without deciding a trip. It fixes the two ways earlier attempts failed: incomplete answers (visible "3 of 5 answered" status and deadline) and decisions that don't stick (options are frozen once published, the organiser locks the result, and any unlock shows in a history everyone can see).

## How it works
1. The organiser creates a trip and shares one link on WhatsApp.
2. Each person picks their name and answers: home city, comfortable and maximum budget, free date windows, trip types, stay preference, hard no's and places they won't go.
3. When everyone has answered (or the organiser publishes early), the tool ranks every destination × date window × stay tier and shows the top 3.
4. Everyone sees a chart of where each person stands on each option (Great / OK / Stretch, with reasons), votes, and the organiser locks the decision.

## Scoring (lib/engine.js)
- Hard filters first: dates someone can't make, anyone's hard no, or anything over anyone's maximum budget rules an option out.
- Per-person fit (0–100): budget 40%, trip type 30%, stay tier 15%, travel time 15%. Weights are in `WEIGHTS`.
- Options are ranked by the lowest individual fit, then the group average, so no one gets steamrolled.
- Deterministic: the same answers always give the same result.

## Privacy
Raw budgets and hard no's never leave the server. The group sees fit labels and relative reasons only.

## Prices (lib/data.js)
Seeded averages, not live fares: round-trip fares from Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune and Kolkata to 12 destinations (weekday and weekend), four stay tiers for Goa, Jaipur, Udaipur, Manali and Rishikesh (weekday and weekend nights), mid-range estimates elsewhere, and daily spend. Edit the numbers freely.

## Stack
Static `index.html` + `fun.js` (van illustration, loader, confetti, nudges) + one Vercel serverless function (`api/trip.js`) + Upstash Redis via Vercel's storage integration. No dependencies, no build step.

## Deploy
1. Import this repo in Vercel (framework preset: Other). Deploy.
2. In the Vercel project, open Storage, create an Upstash for Redis database (free tier) and connect it to the project. Vercel adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables itself.
3. Redeploy. Without storage the app still runs but keeps data in memory only, and shows a warning.

`/?demo=1` shows the tool with five sample people.

## Tests
`npm test` (Node 18+). Covers determinism, date and hard-no filters, weekend pricing, tight budgets, the no-options message, and the privacy guarantee.
