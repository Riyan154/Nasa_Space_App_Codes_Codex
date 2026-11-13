# Verification record

Verified on 11 November 2026 using Node 24 and the Codex browser.

## Automated checks

`npm test` runs 30 tests using the Node standard library. All passed. Covered:

- Mass, budget, baseline/active power, all catalog selection paths and budget rejection.
- Missing required parts, overweight craft, unsuitable science payload and power shortage.
- Watt-hours, charging, discharge, storage caps and zero-energy behavior.
- SI drag scaling, thermal response, Archimedean buoyancy, reserve and wind stability.
- Safe touchdown, higher-speed heating, shield upgrade, torn and late parachutes.
- Full success, partial science, duplicate observation prevention, battery depletion and landing failure.
- Surface time, transmit/recharge limits and a viable Architect solar strategy.
- NASA success/cached/stale/error/timeout/429/invalid/empty results, explicit image type labels, hostile URL rejection, correct Titan target filtering and same-origin relay parsing.
- Manual NASA refresh bypasses a fresh cache, while the cached response remains available if that live refresh fails.
- Save/resume, unsupported/corrupt saves, archive deduplication and unavailable local storage.

`node --check` passed for the application, simulation and server. `npm run build` creates a complete static output with no dependencies.

## Browser checks completed

- Main menu, briefing, workshop cards, live resource changes and category navigation.
- Over-budget Horizon purchase rejected with a visible explanation and unchanged resources.
- Selected low-output solar, reached validation, and confirmed launch was unavailable with the exact 40 W essential-power shortage explained.
- Replaced it with RTG, validated, launched and completed countdown.
- Reloaded mid-flight, used Continue, and resumed at the correct chapter.
- Corrected trajectory, recharged at Saturn, chose gentle entry and deployed parachute in the safe window.
- Descent displayed 1.9 m/s, the deployed parachute and the actual computed outcome.
- Stabilized, landed, collected chemistry and temperature, transmitted 77 data units, and completed the mission with 75/100.
- Mission archive displayed the completed mission once; refine action returned to the workshop with the design retained.
- Resource triangle and engineering details displayed correct values.
- Settings dialog and reduced-motion toggle worked.
- NASA gallery displayed six real images and source links. The original direct PDS browser request showed the truthful curated fallback; the completed local `/api/pds` relay displayed six live Titan records.
- Desktop 1440×1000 and phone 390×844 layouts inspected. Home and workshop had no horizontal page overflow at 390 px. A redundant destination overlay was removed on narrow phones after inspection.
- Browser error log was empty during the tested mission flow. NASA CORS failures are caught and displayed as data-source status rather than game failures.

## Debug pass · 12 November 2026

- Re-ran the complete automated suite and production build.
- Replayed an alternate solar-powered mission through launch and a deliberate high-heating failure; integrity dropped to 15% and the mission ended safely.
- Fixed the final failure report so it names the actual cause and remedy for heat-shield, parachute, high-speed, stability, integrity and battery failures.
- Fixed **Refresh NASA sources** so it performs a new request instead of immediately reusing the 24-hour cache. The refreshed view returned six live Image Library records and six live PDS records.
- Rechecked browser console output; no warnings or errors were recorded.

## Reproduce a normal mission

Start `npm start`, open http://127.0.0.1:4173 and use the default Pathfinder/Ligeia mission. Keep the starter parts. Click through the workshop and validate. Launch. Choose Correct course → Rest and recharge → Gentle approach → Safe window → Activate stabilizers. Collect Methane detective and Temperature probe. Send discoveries home, then finish. Expect successful mission and a non-perfect score; add optional scientific capability to improve it.

## Reproduce failures and edge cases

- Remove the flotation hull or heat shield: validation must block launch.
- Choose small solar wings: validation must explain the power deficit.
- Choose high-speed entry with the Explorer shell: heating exceeds protection; the landing cannot count as successful.
- Deploy parachute at 170 km: it tears under dynamic pressure. Deploy at 2 m: it lacks inflation time.
- Explorer/Kraken with a narrow skiff and Trust hull: instability causes failure. Stabilizers make the safe alternative possible.
- Collect a sample twice: the second attempt cannot add points.
- Finish before transmitting the two required objectives: the game offers further exploration or partial success.
- Disconnect the network: gameplay continues and Science Lab reports unavailable sources or a labeled cache.
- Check sound on/off, keyboard Tab/Enter, dialog Escape and operating-system reduced-motion behavior manually for your browser/device.

## Verification boundaries

The mathematics is tested as an educational model, not validated against a flight trajectory. No claim of testing every browser, assistive technology or all combinatorial hardware configurations. NASA response mocks cover outage behavior without depending on live requests. Sound generation is implemented with Web Audio but audible output was not instrumentally measured. Static PDS fallback is intentional because the remote endpoint lacks browser CORS; the local relay is the live-discovery path.
# Little explorer redesign verification — 2026-11-12

- `npm test`: 34 passing tests, including four new adventure tests covering save validation, normalized/bounded movement, marker proximity, duplicate discovery prevention, all five discoveries and one-time transmission.
- `npm run build`: successful; the static output includes the new canvas artwork, adventure controller/model and stylesheet.
- Browser play verified assembly, held-button launch, three navigation rings with directional steering, parachute deployment, safe landing, guided lake sailing, sampling animations and illustrated discoveries. The completed saved expedition displayed all five discoveries and the three-badge reward screen.
- Phone layout checked at 390 × 844. Discovery dialogs, touch controls, lake map and sampling were usable. The temporary phone viewport was reset after testing.
- Reloaded mid-expedition: two discoveries and lake progress survived. Reloaded the completed expedition: its reward and five-card journal survived.
- Keyboard movement verified by the live map position changing from 93.7413% to 88.6435% while holding Left. The journal opened from the action button. No browser warnings or errors were recorded in the final check.
- Fixed assembly guidance when parts are selected out of order; added a green parachute readiness state; fixed closing the final reward so it returns to free sailing; prevented completed explorers being prompted to transmit again.
- Artwork is original Canvas 2D illustration. The simplified adventure's flight and observation mechanics are intentionally fictional; factual discovery cards link to NASA references.

