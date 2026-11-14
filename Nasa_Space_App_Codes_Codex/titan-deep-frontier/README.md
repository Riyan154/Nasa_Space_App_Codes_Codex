# TITAN: Deep Frontier

The default browser game is a procedural 3D expedition to Titan, Mars or the Moon. Assemble Pip’s spacecraft, steer through three rings, prepare the landing equipment and drive to five discoveries. Use Space to launch and fly, arrows or WASD to steer, and E to collect. Touch controls and beacon guidance are available. The game saves on this browser. The Classic 2D game and its NASA gallery are available from the title screen or at `/?classic`.

**Fictional mission, real scientific inspiration.** This game is not a NASA product and its buoyant lander is not NASA's Dragonfly rotorcraft. Original SVG scenery and spacecraft are game artwork. NASA imagery is labeled separately in the Science Lab.

## Quick start

Install Node.js 20 or newer from https://nodejs.org, then open a terminal in this folder:

```sh
npm start
```

Open **http://127.0.0.1:4173** in your browser. No `npm install` is needed: the project has no npm dependencies. Keep the terminal running; press Control+C to stop. Do not double-click `index.html`: browser ES modules require an HTTP server.

On this Mac, the full command is:

```sh
cd /Users/riyan/Desktop/Nasa_Space_App_Codes_Codex/titan-deep-frontier
npm start
```

## Play

The default **Little explorer mode** uses one short instruction at a time:

1. Customise Pip in the visual workbench. Choose a body under **Mass**, solar wings / a radioisotope generator / batteries under **Power**, and pictured **Science** and **Radio** equipment. **Budget** shows each part's coin cost. Keep all three mission checks green, then select **Ready for launch**. **Use a balanced build** restores a ready-to-fly design.
2. Hold the launch button or Space until the rocket lifts off.
3. Use arrows, WASD, touch arrows, or tap the scene to steer through three rings. Missed rings return; there are no lost lives.
4. Steer left/right toward the landing beam. Open the parachute when its button turns green. The game waits for you.
5. Sail to glowing science markers, then tap the big action button. Pip animates a sample scoop, thermometer, weather balloon or camera. Read or close the discovery card.
6. Find all five discoveries, then send them to Earth to earn three explorer badges. Keep sailing or start again.

The lake map offers optional guided sailing: tap a dot. The journal keeps your illustrated discoveries. Pause controls optional sound and gentle animation. Background tabs and open dialogs pause gameplay. Progress saves locally; reloading resumes at the current chapter, with discoveries and flight rings retained. The default game does not require any network requests. NASA gallery requests occur only when opened.

All sprites and scenery are original code-drawn Canvas 2D art: animated eyes and antenna, opening solar wings, visible batteries and generator cooling fins, layered clouds, lake ripples, boat wakes, methane rain, a detailed twin-booster rocket with animated exhaust, a moving parachute, transmission waves and discovery particles. Your chosen parts remain visible during landing and lake exploration. No generated raster assets or runtime game-engine dependencies are used. Physical movement, altitude, flight duration, navigation rings, marker positions and observations in Little explorer mode are fictional game mechanics, not a mission simulation. NASA reference facts are labeled and linked separately on each card.

The little-explorer workbench uses illustrative masses, watts and mission coins, not NASA hardware specifications or real prices. Mass is limited to 240 kg, the coin budget to 300, and supply must meet the selected equipment's power demand. Small solar panels intentionally cannot power this Titan mission. Battery duration is an educational energy/demand estimate; it is not a gameplay countdown. Every science kit can complete the adventure using shared pretend tools. Existing version-2 saves migrate to a default loadout automatically. Before liftoff, **Edit spacecraft** returns to the builder without losing your choices.

### Advanced workshop

Open **Advanced spacecraft workshop** on the title screen for the original engineering experience:

1. Choose **Start your mission**, a difficulty, and a lake.
2. Build through seven categories: rocket, power, science, radio, guidance, protection, landing. The starter spacecraft is a useful example, not a prescribed solution. Architect difficulty deliberately requires a cheaper redesign.
3. Click a card to select it; click a selected card to remove it. Multiple science instruments are allowed. Purchases exceeding your budget are rejected.
4. Keep the rocket under its mass capacity. Bring chemistry and environmental instruments. Essential systems must be continuously powered; temporary science deficits can use stored battery energy.
5. Check the spacecraft. Fix the specific issues, then begin the launch countdown.
6. During flight, choose between science opportunities and resource reserves, make course corrections, select entry speed, and choose parachute deployment timing.
7. Stabilize the hull if needed, collect observations, and transmit them before the 24-hour surface expedition ends. Recharging also consumes time.
8. Finish and review the score. Refine your design and try again. A landing alone earns partial success; full success requires both chemistry and environment data to be transmitted.

Every choice except the launch countdown is untimed. The countdown can be held. Tab, Enter and Space work for navigation. The Settings panel provides quiet button sounds and reduced motion; operating-system reduced-motion preferences are respected as well.

Progress, settings and up to 20 mission reports are stored in this browser's local storage. They are not synchronized between devices or between local and hosted origins. Clearing browser data removes them. A completed mission does not require an account. Private hosted access may require the owner's ChatGPT sign-in.

## Features

- Original vector Titan landscapes, Saturn, spacecraft, rocket, parachute and assembly changes.
- Three difficulties, three lake scenarios, four fictional rockets, five power options, eight science instruments, three radios and two options each for guidance, protection and landing.
- Complete build → validate → launch → travel → entry/descent → splashdown → science → results loop.
- Mass accounting, budget enforcement, idle and active power, separate Wh battery capacity, fuel consumption, temperature model, atmospheric drag and heating, and buoyancy/stability checks.
- Deterministic hazards with explained consequences. Fictional reliability ratings are shown but do not cause surprise dice-roll launch failures.
- Optional resource triangle, engineering report, simulated entry chart and categorized event log.
- NASA Image and Video Library gallery, real PDS dataset metadata where browser access permits, and honest cached/curated fallbacks.
- Mission archive, save/resume, accessible dialogs, responsive layouts and optional sound.

## How the Code Works

There is deliberately no React, bundler or state-management framework to learn.

| File | Responsibility |
| --- | --- |
| `index.html` | HTML page, app mount point and accessible dialog. |
| `style.css` | Layout, colors, responsive styles and motion. |
| `src/catalog.js` | All editable fictional equipment values, difficulties and lake scenarios. Start here to rebalance the game. |
| `src/engine.js` | Pure resource, validation, energy, entry, flotation, mission and scoring functions. No DOM code. |
| `src/app.js` | Screen rendering, button events, dialogs and NASA gallery. |
| `src/art.js` | Original SVG landscapes, spacecraft assembly and icons. |
| `src/nasa.js` | Public NASA HTTP calls, data validation, URL checks, timeouts, caching and fallbacks. |
| `src/storage.js` | Safe local save/resume and archives. |
| `server.js` | Local HTTP server and a fixed NASA PDS relay. |
| `build.js` | Copies the browser files into `dist/` for static hosting. |
| `tests/` | Node built-in tests; no testing dependencies. |
| `docs/SOURCES.md` | Verified NASA sources and integration details. |
| `docs/TESTING.md` | Automated and browser verification record. |

A card click reaches `handleClick()` in `app.js`. `choosePart()` in `engine.js` computes the candidate cost and updates the design only when affordable. The app saves and renders again, reading recalculated resources. Launch calls `validate()` and then `beginFlight()`. Flight choices call `advanceFlight()`, which applies resource consequences and uses the numerical entry calculation. Scientific actions add records; transmission marks those records as sent. The score only credits returned discoveries.

### Change a part or mission

Edit `src/catalog.js` to change equipment cost, mass, watts, battery capacity, parachute area, or hull volume. Values use kg, MC, W, Wh, m² and m³. Change the `FLIGHT` content in `src/app.js` for player-facing flight choices; update the matching decision in `advanceFlight()` if you alter its effect. Reload the browser after editing. Run the tests after changing rules.

## Scientific model and limits

The environment uses approximately 94 K, 1.35 m/s² gravity, nitrogen-rich air and hydrocarbon lakes, supported by NASA references. Surface pressure is educational context (about 1.5 Earth atmospheres), not a separate CFD boundary condition. NASA data are never treated as real-time Titan weather.

- **Mass:** sum of all selected components plus the fixed frame. Launch mass includes the fictional navigation kit's fuel. Entry and flotation use mass after propellant expenditure. We do not model aeroshell or parachute jettison, making buoyancy conservative.
- **Power:** battery energy changes by `(generation W - consumption W) × hours`, clamped between zero and capacity Wh. All-on demand includes every instrument. Surface observations run one tool at a time. Transmission adds an active radio load above its baseline draw. The mission won't launch if its essential load is unsustainable.
- **Solar:** fictional rated output already includes a strong distance/illumination penalty. It is a nominal game scenario, not measured Titan irradiance or an engineering claim that these arrays are practical flight hardware. Radioisotope outputs are also fictional, not copied from a real MMRTG mission. Each package includes a separate chemical battery.
- **Entry:** a one-dimensional vertical atmospheric column starts at 180 km with 3.6 or 5.2 km/s depending on maneuver choice. It integrates `Fdrag = 0.5 × rho × v² × Cd × area` with a 0.15 s step, constant 1.35 m/s² gravity, exponential density `5.3 exp(-altitude/20000)` kg/m³, Cd 1.5 and 12 m² body area. No orbital trajectory, entry angle, lift, curvature or ablation is modeled. The 15,000-second safety cap cannot count as a successful touchdown.
- **Heating:** an illustrative Sutton–Graves-like relation `1.2e-4 sqrt(rho/1.4) v³` gives incident W/m², integrated to J/m². Fictional shield heat budgets are 2.4 and 4.5 MJ/m². Peak surface temperature uses radiative equilibrium with emissivity 0.85. These constants are educational balancing assumptions, not validated Titan entry design data. Maneuvers reduce velocity; they do not directly cool the hull.
- **Parachute:** a fictional 800 Pa dynamic-pressure limit and three-second inflation interval determine whether it survives and has enough time to work. Normal deployment is at 18 km. High-speed deployment and last-second deployment can fail. Splashdown speed must be at most 4.5 m/s.
- **Flotation:** `Fbuoyant = liquid density × 1.35 × hull volume`. Launch validation reserves at least 12% displacement. Fictional liquid densities of 450–520 kg/m³ reflect a simplified hydrocarbon range, not measurements at the named lakes. The wind/stability scenario is explicitly invented.
- **Temperature:** a lumped thermal model uses insulation-dependent conductance and a fictional heat capacity; internal and shield surface temperature are different quantities. Shield insulation also changes continuous heater demand. It is not a complete thermal-control analysis.
- **Cruise:** distance, seven-year timing and equipment scenarios are compressed narrative assumptions. Fuel is deducted for actions; the game does not solve orbital transfers or the rocket equation.
- **Science:** observations, data units and science scores are fictional educational game records. They are not NASA measurements. A floating seismic sensor cannot make useful solid-ground measurements.
- **Communications:** fictional data units per simulated hour; interplanetary radio propagation delay is explained but compressed for play. No link-budget calculation.
- **Visuals:** Saturn, stars and haze are artistic scene composition, not a precisely reconstructed Titan sky. Generated SVG artwork is distinct from NASA photographs, processed images and artist concepts.

## NASA APIs and keys

The implemented Image Library and PDS public APIs require **no API key**. Do not paste a secret into frontend JavaScript. No `NASA_API_KEY` is needed, collected or transmitted by this game. A future key-protected backend must read `NASA_API_KEY` from server-side environment variables only; `.env` is ignored.

`src/nasa.js` documents the exact URLs. Requests have an 8-second deadline, response validation and URL restrictions, no unbounded retries, a 24-hour cache and an explicitly labeled stale fallback for up to seven days. A button lets you retry without reloading your game.

The Image Library supports browser CORS. PDS lacked CORS headers during verification. The **local Node server** offers `/api/pds`, a fixed, read-only request to the verified Titan catalog query; it cannot proxy arbitrary URLs. On **static hosting**, the game attempts the public endpoint and honestly falls back to a verified Cassini RADAR archive link if blocked. That link is not called a live search result. The game does not process raw PDS radar binaries.

APOD, NEO and DONKI are investigated and documented in `docs/SOURCES.md` but are **not integrated**: they are optional or unrelated to the core Titan game. No Earth asteroid or space-weather data are converted into Titan hazards.

## Test

```sh
npm test
```

Uses `node:test` and `node:assert`; network failures and NASA responses are mocked. Tests cover resource sums, part changes, budget rejection, missing systems, energy units, drag, thermal response, buoyancy, safe/unsafe entry, complete success, partial science, depleted battery, surface-time limits, difficulty strategy, storage, NASA caching, malformed data, unsafe URLs, rate limits and timeouts. No live NASA connection is needed for tests.

For manual testing, start the server and follow `docs/TESTING.md`.

## Build and deploy

```sh
npm run build
```

This produces a standalone static game in `dist/`. Do not put secrets in this directory.

- **GitHub Pages:** publish the **contents** of `dist/` to a Pages branch or use a Pages workflow that runs `npm run build` and uploads `dist`. All browser assets use relative paths, so repository subpaths work.
- **Vercel static:** import the project, select Other, set the build command to `npm run build` and output directory to `dist`. The local Node relay is not deployed by this static setup; PDS uses its labeled curated fallback if CORS blocks it.
- **Sites:** `.openai/hosting.json` records this project's private Site and static output directory. Sites publishing is handled by the connected Sites workflow. Keep the owner's private access unchanged.
- **Any static server:** serve `dist/`. A framework or Python backend is unnecessary. `requirements.txt` therefore contains no Python dependencies.

## Troubleshooting

- **Address already in use:** another server is on port 4173. Stop it, or run `PORT=4174 npm start` and visit that port.
- **Blank page from file://:** start the HTTP server and use its URL.
- **NASA images unavailable:** gameplay still works. Open Science Lab later and refresh. PDS static-browser restrictions are expected and labeled.
- **No save after reopening:** private browsing, storage restrictions or a different URL/port can create a different storage area. The app warns when saving fails.
- **Text font differs offline:** external Google Fonts are optional; local system sans-serif fallbacks keep the game playable. NASA gallery assets also need a connection.
- **Budget blocks an upgrade:** remove or downgrade another part first. Select a card again to remove it.
- **Float check fails despite being under rocket capacity:** rocket lift and liquid displacement are independent constraints. Fit a bigger hull or lighter payload.

## Known scope limits

No multiplayer, 3D renderer, full orbital-mechanics solver, live Titan weather, real mission control, raw PDS processing, APOD carousel, NEO panel or DONKI panel. There is no account system, cloud save, service worker or guaranteed offline installation. Environmental and flight models are simplified educational approximations. Every main-menu action and the complete mission loop are implemented.
