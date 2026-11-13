# Science and NASA integration

## Visual workbench update · 13 November 2026

The little-explorer power cards distinguish solar electricity, electricity made from radioactive-decay heat, and stored battery energy. Sources: [NASA Onboard Systems](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-3/) and [NASA Radioisotope Power Systems overview](https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/overview/). NASA describes batteries as an option for short-lived probes, and radioisotope systems as useful where solar power is unsuitable. The pictured parts are original illustrations; their masses, wattages, stored energy, capacity limits and coin costs are fictional balancing values, explicitly labelled in the builder. The 600 Wh battery estimate uses energy divided by load in watts; the arcade adventure does not simulate depletion. These choices do not modify the separate advanced engineering simulation.

Verified on 11 November 2026. This is an educational strategy game. Resource production, costs, weather frequency, travel time, construction, population and mission progression are authored game rules, not NASA predictions. The rendered landscape and structures are procedural game art, not spacecraft imagery. NASA API content appears only in the science archive and does not silently alter a save.

## Titan reference values

- **Temperature approximately 94 K and gravity approximately 1.35 m/s²:** NASA's [Titan Thermal Environment presentation](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-15-Presentation.pdf) gives 94 K, 1.352 m/s² and surface pressure of about 146 kPa. The game's rounded values are reference context; thermal resource consumption is a game abstraction.
- **Nitrogen atmosphere, methane weather, hydrocarbon lakes, and organic dunes:** [NASA Titan Facts](https://science.nasa.gov/saturn/moons/titan/facts/). Titan's air is not breathable. Organic compounds are not evidence of life.
- **Surface temperature and pressure cross-check:** [ESA Facts about Titan](https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens/Facts_about_Titan/%28language%29/eng-GB).
- **Cassini observation and instrument context:** [PDS Cassini Titan Science](https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/Cassini/sci-titan.html). A scientific catalog product may be a context collection or document, not a ready-to-display photograph or terrain map.

## Implemented services

### NASA Image and Video Library

[Official API documentation](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf).

`GET https://images-api.nasa.gov/search?q=Titan%20Cassini&media_type=image&page_size=6`

Live verification: HTTP 200, JSON `collection.items`, and `Access-Control-Allow-Origin: *` for browser access. One returned item was `PIA08110`, “Titan Viewed by Cassini Radar,” with `secondary_creator` credit `NASA/JPL-Caltech/ASI`. The integration preserves returned title, description and credit and links each item to its NASA library record. The preview URL comes from the returned `links` array; it is never fabricated. Only HTTPS image assets on `images-assets.nasa.gov` are accepted. Some images may be processed radar products or illustrations; the returned title and description identify their context.

### NASA Planetary Data System Search v1

[Official endpoint and query documentation](https://nasa-pds.github.io/pds-api/guides/search/endpoints.html).

`GET https://pds.nasa.gov/api/search/1/products?limit=6&q=ref_lid_target%20eq%20%22urn%3Anasa%3Apds%3Acontext%3Atarget%3Asatellite.saturn.titan%22`

Live verification: HTTP 307 redirects to the same path at `pds.mcp.nasa.gov`; following the redirect returned HTTP 200 with `summary.hits = 181500` and `data` records. Counts and ordering can change. A verified record was `urn:nasa:pds:cassini-uvis_titan-library:context::1.0` with title “Cassini UVIS Titan Library Context collection file.” The parser requires a matching Titan target identifier, uses the returned ID/title/description and constructs the documented product-resolution link.

Two plausible query forms were tested and deliberately rejected: the documentation's `target_name` shorthand produced HTTP 400 on the live server; `keywords=titan` returned unrelated service records and appeared to be ignored. The implemented target LID query returned Titan records.

**Browser limitation and local discovery:** an HTTP request with `Origin: http://localhost:5173` did not receive an `Access-Control-Allow-Origin` header from the PDS service/redirect during verification. A direct browser request may therefore be blocked even though command-line HTTP succeeds. The local development server supplies a same-origin `/api/pds` route restricted to the fixed public Titan query. The local game can pass `endpoint: '/api/pds'` to discover real NASA records through that route, preserving the same response parsing and Titan-target checks. Static deployments use the official remote endpoint by default; if browser access is blocked, the client shows a clearly labeled curated archive link and never claims that link is a live search result. Network outages also receive this fallback. No relay or third-party proxy is required to play.

The verified curated fallback is the [Cassini RADAR Data Archive](https://pds.nasa.gov/ds-view/pds/viewBundle.jsp?identifier=urn%3Anasa%3Apds%3Acassini-coradar&version=1.0), identifier `urn:nasa:pds:cassini-coradar::1.0`. This is a fixed source reference, not a snapshot of the current search results.

## Reliability and attribution

Both implemented requests succeeded without API keys. No API keys or secrets are embedded, requested, or needed. Requests use an eight-second deadline and abort signal. Malformed JSON, missing fields, empty results, unsafe URLs, network errors and HTTP 429 receive explicit states. Successful raw responses are cached locally for 24 hours, with revalidation of their structure and URLs when read. Responses aged up to seven days can be shown only as dated stale data if a new request fails; older data is discarded. Unavailable or full browser storage does not break gameplay. Imagery has no fake fallback.

The module exports `loadImages(options)` and `loadDatasets(options)`, each resolving to `{ items, status, message }`. States are `live`, `cached`, `stale`, `curated` (datasets only), or `unavailable`. Optional injected `fetcher`, `storage`, and `timeoutMs` permit deterministic tests. `loadDatasets` also accepts `endpoint: '/api/pds'` for the fixed local relay; arbitrary alternative endpoints are rejected. Image items include `kind`: explicit artist-concept, radar/processed-visualization, or photograph wording in NASA metadata enables a qualified label. Ambiguous records use `NASA image (see source for type)`. These labels do not infer an image's origin from its appearance. Treat all returned text as plain text and render it using text nodes or HTML escaping.

Run `node --test tests/nasa.test.js` for mocked success, cache, outage, deadline, invalid JSON, empty results, rate-limit, target relevance, URL allowlist and storage-failure checks. Live HTTP verification is separate from these deterministic tests and does not guarantee future service availability or browser CORS access.

## Deliberately optional NASA services

[NASA Open APIs](https://api.nasa.gov/) documents APOD, NeoWs and DONKI. They are not integrated: astronomy-of-the-day, near-Earth asteroid data and near-Earth space weather are not live Titan surface measurements. The portal currently announces APOD migration to `https://science.nasa.gov/wp-json/wp/v2/apod-basic` and legacy API retirement on 1 December 2026. Adding these services would need a distinct, accurately labeled purpose and service-specific authentication/rate-limit handling. This game does not send requests to those services or expose a key field.
# Little explorer redesign — verified 2026-11-12

Five collectible cards use NASA's [Titan Facts](https://science.nasa.gov/saturn/moons/titan/facts/): liquid methane/ethane lakes; roughly −179°C surface temperature and rock-like water ice; methane clouds/rain/rivers; mostly nitrogen air with approximately 60% greater surface pressure than Earth; and Titan being Saturn's largest moon, larger than Mercury. The pressure card follows the 60% wording on this page (about 1.6×). The optional legacy lab's approximately 1.5× is a rounded educational value.

Amber haze, muted icy shores and dark lake colors are an artistic interpretation, not calibrated imagery. Saturn appears in the space-flight scene only. The landscape, Pip, markers, ring course and launch/landing motion are original fictional game art. Interactive samples unlock reference facts; they do not claim to be real sensor readings. Flight travel and signal time are compressed for play. The parachute's 18 km prompt is a forgiving game threshold, not operational guidance.

