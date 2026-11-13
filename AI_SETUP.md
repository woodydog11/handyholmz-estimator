# AI chat setup

This branch implements an OpenAI Responses API integration using a Netlify Function at `/api/chat`.

## Netlify environment variables

Set both with **Functions** scope:

- `OPENAI_API_KEY`: OpenAI Platform project API key. Never expose in client code.
- `HANDYHOLMZ_ACCESS_CODE`: strong operator-only shared access code, required to call the AI endpoint.
- `OPENAI_MODEL` (optional): defaults to `gpt-4.1-mini`; choose another Responses-compatible model only after verifying access and supported structured output.

Redeploy the **feature/conversational-estimator-v1** branch after setting the variables. If your Netlify site tracks `main`, enable a branch deploy for this feature branch or merge the pull request after review.

## Verification

1. Open the branch preview and describe a job, such as `Install two ceiling fans`.
2. Enter the operator access code when prompted.
3. Confirm the AI asks a relevant question and two ceiling fans appear in the estimate.
4. Say `Change ceiling fan installation to $225` and verify the price changes.
5. Switch a task to hourly and confirm the total updates.
6. Test a wrong access code; requests should return HTTP 401.
7. Verify API keys never appear in the browser's source, network responses, or Git history.

## Limitations and production requirements

- This is an **AI-enabled beta**, not a production multiuser service. The access code is a temporary shared secret; replace with authenticated sessions, server-side rate limiting, abuse monitoring and a per-operator authorization check.
- The chat currently uses the last ten messages and the client-supplied draft estimate; there is no database or durable chat history.
- AI action proposals are validated by a small browser-side dispatcher; production should validate actions against a typed schema server-side and require operator confirmation for consequential changes.
- Market pricing is not yet live or verified; no market-search tools are connected.
- Do not enter real customer personal data until authentication, retention, and privacy controls are in place.
- Netlify deploys, model access, environment variables and real end-to-end behavior must be checked in the deployed environment.
