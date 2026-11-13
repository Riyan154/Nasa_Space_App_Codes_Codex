# Science and design sources

Reviewed during implementation on 2026-11-14. Scientific content informs the educational explanations; equipment values follow the requested fictional catalogue.

## Official challenge resources

The [2026 Space Mission Design Game resource page](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources) initially failed through the browser retrieval service. Direct HTTP retrieval subsequently succeeded and exposed the curated resource list. The following is the actual list found there, including access gaps; it is not a claim that every linked resource was fully studied.

| Curated resource | Review and use |
|---|---|
| [NASA mission design webinar slides](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf?emrc=a454cf) | Read. Science goals, mission architecture, and systems engineering informed the builder → validate → execute → review structure. |
| [Webinar video](https://www.youtube.com/embed/_hl-36j6C54?feature=oembed) | Retrieval failed; video was not reviewed. The accessible slides supplied the mission-design reference. |
| [GMAT R2025a](https://software.nasa.gov/software/GSC-19468-1) | Overview read. Identified the scope of real trajectory analysis; GMAT is not integrated, and the flight sequence is explicitly simplified. |
| [JPL dataset / reference](https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299) | Retrieval failed; no data from this item was incorporated. |
| [NASA Mission Design Lab](https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/) | Overview read. Informed the presentation of linked mass, power, and budget trade-offs. |
| [NASA mission visualization examples](https://nasa.github.io/mission-viz/) | Overview read. Reference for communicating missions spatially; no code or art copied. |
| [Webb Build It Yourself](https://science.nasa.gov/mission/webb/game-build-it-yourself/) | Read. Reference for approachable mission-building choices; no assets copied. |
| [CubeSat 101](https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf) | Retrieval failed; not used as a source of hardware specifications. |
| [2023 VR mission visualization challenge](https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/) | Retrieval returned 502; not reviewed. |
| [Canadian Space Agency digital activities](https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp) | Read. Educational game examples informed brief instructions and exploration rewards. |

## Facts and hardware concepts

- [NASA Titan facts](https://science.nasa.gov/saturn/moons/titan/facts/): surface hydrocarbons, methane weather, cold surface, nitrogen atmosphere, size. Five Titan discovery cards link here.
- [NASA Mars facts](https://science.nasa.gov/mars/facts/): oxidized iron, Olympus Mons, Valles Marineris, ancient water, thin atmosphere. Five Mars cards link here. The volcano card avoids a single height figure because height depends on reference datum.
- [NASA Moon facts](https://science.nasa.gov/moon/facts/): surface conditions, polar ice, seismic activity, synchronous rotation. The footprint card qualifies persistence rather than claiming tracks last forever.
- [NASA lunar regolith explanation for students](https://www.nasa.gov/learning-resources/for-kids-and-students/nasa-knows-what-is-lunar-regolith-grades-5-8/): sharp, clingy dust. Used for the lunar dust discovery.
- [Dragonfly](https://science.nasa.gov/mission/dragonfly/) and [Cassini–Huygens](https://science.nasa.gov/mission/cassini/): real Titan exploration context. Pip is fictional and is not either mission's vehicle.
- [NASA radioisotope power systems](https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/): decay-heat electricity concept. RTG and MMRTG card values are game values, not specifications of flight hardware.
- [NASA Eyes](https://eyes.nasa.gov/): real mission visualization reference; not embedded or used as a physics engine.

## Live services

- [NASA Image and Video Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf): public image searches at `images-api.nasa.gov`; previews accepted only from HTTPS `images-assets.nasa.gov`. The game displays the returned source credits and distinguishes NASA imagery from game art. An image can be processed or an artist concept; its source metadata remains authoritative.
- [NASA Planetary Data System search API](https://pds.nasa.gov/api/search/1/): target-filtered requests using PDS target identifiers for Titan, Mars, and Moon. Results are displayed only when their target identifiers match the chosen destination. Empty, malformed, blocked, or unrelated responses produce an explicit fallback, not invented records.
- [PDS catalogue](https://pds.nasa.gov/datasearch/data-search/): fallback for manual browsing.

API data does not modify equipment performance, mission outcomes, or scientific measurements. Metadata cache status is shown, and the mission remains playable when services are unavailable.

## Unity implementation references

- [URP 14 pipeline asset API](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@14.0/api/UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset.html): generated URP asset and renderer.
- [Unity 2022.3 render pipeline entry point](https://docs.unity.cn/2022.3/Documentation/ScriptReference/Rendering.RenderPipeline.Render.html): camera rendering behavior.

No NASA logo, endorsement, paid asset, external model, or external soundtrack is included. All in-game geometry and sounds are authored procedurally. The gallery fetches NASA material at runtime with its own source labels.
