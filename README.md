# Unofficial Marktguru library

A library to search for offers on [marktguru.de](https://marktguru.de).

## Project status

- The last functional code change in this repository was on **2022-02-03**.
- This package is currently **not actively maintained**.
- It can still work, but it depends on upstream `marktguru.de` HTML/API behavior, which can change at any time.

## Does it still work?

The quickest way to verify is to run:

```bash
npm install
npm run build
npm run test
```

Notes:

- Tests are integration tests and require live access to `marktguru.de`.
- In restricted/offline environments, tests can fail with network/DNS errors (for example `ENOTFOUND marktguru.de`) even if local code is unchanged.

## What this library actually does (and does not do)

### What it does

- Calls `https://marktguru.de` to extract temporary API keys from page config data.
- Uses those keys to call Marktguru's offer search endpoint.
- Returns raw offer objects (price, oldPrice, validityDates, advertisers, product, images, etc.).
- Supports basic filtering by search query, zip code, pagination, and allowed retailers.

### What it does not do

- It is **not** an official API client.
- It does **not** provide store-level stock/availability.
- It does **not** normalize products into a stable ERP product master.
- It does **not** handle authentication/session flows for protected endpoints.
- It does **not** guarantee long-term stability (keys, HTML structure, and API behavior can change upstream at any time).

### Is it useful for a kitchen ERP sourcing workflow?

Potentially, but mainly as a lightweight upstream signal for "current promotional offers" in Germany. It can be useful for:

- ingesting promotional prices into a comparison/enrichment pipeline
- triggering suggestion logic (e.g. "buy this item this week at retailer X")

You will likely still need your own ERP-side logic for:

- product matching/normalization (offer text -> internal SKU)
- data quality checks and deduplication
- caching/retries/rate limiting
- fallback sources when Marktguru changes or is unavailable

## Usage

```ts
import { search } from 'marktguru';

const doSearch = async () => {
    try {
        const query = 'Cola';
        const offers = await search(query, { limit: 10 });
    } catch (error) {
        // error is an axios error, see https://axios-http.com/docs/handling_errors for more infos
        console.error(error);
    }
}
```

### Get offer examples for one or multiple products

```ts
import { search } from 'marktguru';

const products = ['cola', 'butter', 'pasta']; // can also be just ['cola']
const zipCode = 10115;

type SearchResult = {
    query: string;
    offers: Awaited<ReturnType<typeof search>>;
};

const getOffersSequentially = async (): Promise<SearchResult[]> => {
    const allResults: SearchResult[] = [];

    for (const query of products) {
        try {
            const offers = await search(query, { zipCode, limit: 20 });
            allResults.push({ query, offers });
        } catch (error) {
            // continue with the next query if one request fails
            allResults.push({ query, offers: [] });
            console.error(`Search failed for "${query}"`, error);
        }
    }

    return allResults;
};
```

This gives you a simple sequential pipeline that you can persist into your own database.

### Should you use this library or scrape grocery shops directly?

Start with this library first if your goal is quick offer ingestion:

- one integration point instead of many separate retailer scrapers
- consistent search flow (query + ZIP + optional retailer filtering)
- faster to prototype and evaluate

Consider direct retailer scraping only as a later fallback/complement, because it usually means:

- maintaining many brittle parsers
- handling anti-bot/HTML changes per retailer
- higher ongoing maintenance cost

For an ERP workflow, a pragmatic path is often:

1. Use this library to ingest offer candidates.
2. Store and normalize into your own schema.
3. Add extra sources (including retailer-specific scraping or official feeds) only where coverage/reliability is missing.

### SearchOptions

| Key              | Description                                                                               | Default |
|------------------|-------------------------------------------------------------------------------------------|---------|
| limit            | Set the limit of offers to receive                                                        | 1000    |
| offset           | Skip as many offers as offset is set                                                      | 0       |
| allowedRetailers | An array of retailers. See [here](src/@types/marktguru.d.ts) on line 2 for some retailers | []      |
| zipCode          | The zip code of area/city where to search for offers                                      | 60487   |

### Offer

How an Offer object looks like, you can see [here](src/@types/marktguru.d.ts) on line 77

## Tests

```bash
$ npm run test
```
