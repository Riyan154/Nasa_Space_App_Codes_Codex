# Verification record

## Completed without Unity

- Portable .NET 8 compilation and execution of the actual catalogue, mission engine, flight physics, save-validation logic, and NASA URL rules: **36 test cases passed, 0 failed**.
- The test runner uses substitutes for ScriptableObject creation, NUnit assertions, PlayerPrefs, and JSON serialization. Save round-trips therefore verify the data model with System.Text.Json, **not Unity JsonUtility or real device storage**.
- Guided landings reached safe touchdown on Titan, Mars, and Moon. Advanced landings reached safe touchdown when parachute and retro choices were made at the specified checkpoints. Moon descent without retro braking failed as expected.
- A numerical check exposed an unlandable Mars arrival profile. Mars now begins the playable descent at 40 km / 550 m/s after an explicitly abstracted transfer; the corrected profile passes the C# checks.
- C# grammar parsing found no syntax errors across the Unity source files. Assembly definitions and the package manifest parse as valid JSON.
- A live public NASA PDS Titan query returned three records with the expected `id`, `title`, and matching `targets[].id` fields. This checks the response schema, not UnityWebRequest or WebGL CORS behavior.
- Work is isolated to the new Unity project on `riyans-branch`; the existing browser game's source was not modified.

## Not verified here

Unity and Unity Hub are not installed on this machine. There is no Unity editor compile result, Unity Test Runner result, shader compile result, generated-player build, performance measurement, screenshot, or completed interactive playtest for this rebuild. The project must not be represented as a production-ready or visually verified build based on the portable tests.

The editor generates the scenes, data assets, materials, and prefabs on first import. Their serialized output has not been reviewed in Unity yet. All Unity-specific API use, preview rendering, scene bootstrapping, audio, input, UI layout, and WebGL integration need editor/player verification.

## Acceptance checks after installing Unity

1. Import with Unity 2022.3 LTS. Resolve any editor/compiler/shader diagnostics before proceeding. Confirm generation produces the six scenes and the four equipment data assets, destination data, difficulty data, and URP resources.
2. Run all EditMode tests in the Unity Test Runner. In particular, verify JsonUtility and PlayerPrefs round-trips on the actual runtime.
3. Complete all six destination/mode combinations from MainMenu, including launch hold/release, ring steering, landing choices, five unique collections, transmission, reports, and refinement.
4. Check budget rollback, overweight configurations, Titan solar rejection, Mars/Moon solar choices, power-demand warnings, and every one of the 16 equipment previews.
5. Quit/reopen in Build, Travel, Land, and Explore. Confirm Continue restores the mission and preserves preferences. Verify the latest 20 reports remain bounded.
6. Test keyboard focus and scrolling, touch hold/release, landscape and portrait sizes, dialogs, NASA gallery layout, high contrast, reduced motion, and color palette options.
7. Test NASA gallery and PDS results with a working network, offline, a corrupt cache, and blocked CORS. Confirm failure leaves gameplay usable and that cached records are labeled.
8. Build WebGL and at least one desktop target. Run the built players, inspect console errors and memory/performance, and exercise the HTML accessibility controls with a real screen reader.

## Known scope limitations

- Native desktop screen-reader support is not implemented. WebGL supplies a DOM mirror of labels and actions; full accessibility conformance remains unverified.
- Exponential fog approximates atmospheric haze; there is no volumetric scattering implementation. Geometry, shadows, particles, typography, motion, and mobile performance need visual tuning in Unity.
- Science dioramas, planet sizes, clouds, lake highlights, and spacecraft geometry are stylized procedural artwork. The simulation is deliberately simplified and does not reproduce real trajectories or hardware performance.
- Some challenge resource links were inaccessible. `SOURCES.md` lists those individually rather than claiming all resources were reviewed.
- The old browser application does not automatically become the Unity game. A successful WebGL build must be served separately before the rebuilt game can be played in a browser.
