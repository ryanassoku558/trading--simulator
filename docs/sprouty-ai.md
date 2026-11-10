# Sprouty AI and web search

Set `OPENAI_API_KEY` in Vercel → Project Settings → Environment Variables (Production), then redeploy. Never use a NEXT_PUBLIC prefix or put the key in chat. Create a key in your OpenAI API account; API usage has separate costs. Optionally change `SPROUTY_MODEL` to a Responses API model supporting web_search_preview (default gpt-4.1-mini). Set provider spend limits before enabling.

Sprouty sends the question and last six chat messages to OpenAI, with relevant website help and the lesson directory. It does not send account details, balances or credentials. Responses use store:false. Current or outside information can use web search; source links appear below the answer. Sprouty cannot access or modify private account records or place trades.

Without a key, or when the provider fails, the existing help library answers remain available. The route limits input, output and time, checks browser origin, and permits 20 AI requests per minute per server instance. This is not a distributed abuse limit; before a high-traffic launch add a durable user/IP rate limiter and monitor usage. General help remains available to Starter. Pro practice review remains separate.
