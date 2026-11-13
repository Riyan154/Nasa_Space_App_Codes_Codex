# TITAN: Deep Frontier — Unity rebuild

A procedural 3D mission game for Unity 2022.3 LTS and URP 14. This project sits alongside the original browser game; opening the old localhost website still runs that browser version.

**Status:** implemented source project, with an editor asset generator and a portable logic check. It has **not yet been imported, compiled, visually tested, or built in Unity**. Unity was unavailable on the development machine. See [VALIDATION.md](VALIDATION.md) for the precise verification boundary and the remaining acceptance checks.

> Fictional mission, real scientific inspiration. This game is not a NASA product.

## Open and play

1. Install Unity **2022.3 LTS** through Unity Hub, including **WebGL Build Support**. The project version is 2022.3.62f1. Add the desktop build modules you want to use.
2. In Hub, choose **Add project from disk** and select this `TitanDeepFrontier` folder, which contains `Assets`, `Packages`, and `ProjectSettings`.
3. Let Unity resolve its built-in packages and finish compiling. On the first import, `ProjectSetup` generates the catalogue assets, URP configuration, materials, model prefabs, and six scenes. If needed, select **TITAN → Generate project assets**.
4. Open `Assets/Scenes/MainMenu.unity`, then press **Play**.
5. Choose **Start your mission** for Little Explorer, or **Advanced spacecraft workshop** for engineering choices and three budget difficulties.

Generated `.meta`, `.asset`, `.mat`, `.prefab`, and `.unity` files should be committed after the first successful Unity import. The generator preserves existing assets so it will not overwrite hand-edited scenes or catalogue data. The source checkout defines these assets in code; it does not contain fabricated, editor-verified serialized assets.

## What is implemented

- The complete stage sequence: destination → four-category builder → validation → held launch → three flight rings → staged descent → five discoveries → transmission → results.
- Titan, Mars, and Moon environments, five unique discovery dioramas per destination, cited fact cards, a clickable surface map, and Pip movement.
- Exactly four rockets, four power sources, four instruments, and four radios. Instruments can be combined. Mass, budget, and power stay visible together while building.
- Procedural spacecraft, rockets, modular equipment, rotating previews, particles, clouds, stars, Saturn rings, eye/antenna movement, instrument animations, and parachute motion.
- Guided Little Explorer landings. Advanced mode requires appropriate parachute and retro-rocket decisions and staying over the landing zone. Choices advance the simulation explicitly; there is no wall-clock mission-resource drain.
- PlayerPrefs saves for mission/design/settings and the latest 20 reports. Autosaves occur at stage transitions and periodically while exploring.
- Procedural ambient audio and event tones; sound, reduced motion, high contrast, and color palette settings.
- NASA Image Library queries with actual thumbnails, source/credit labels, 8-second timeouts, 24-hour metadata caching, and stale fallback up to 7 days. PDS target-filtered queries require matching target IDs before displaying records.
- WebGL HTML controls that mirror Unity UI labels for browser accessibility. This is an accessibility aid, not a claim of full screen-reader conformance.

## Controls

| Action | Keyboard / mouse | Touch |
|---|---|---|
| Move / steer | WASD or arrow keys | Hold directional buttons |
| Launch / fly forward | Hold Space; release to stop | Hold launch / fly |
| Collect a nearby discovery | E or Collect | Collect |
| Choose destination / equipment | Tab, Return, click | Tap |
| Orbit builder | Drag empty scene area | Drag empty scene area |
| Pause and settings | Escape or Settings | Settings |
| Navigate a discovery | Click map or its named button | Tap map or named button |

In the WebGL accessible-controls panel, activating a hold control toggles it on/off. Canvas keyboard movement remains available. Native macOS/Windows screen-reader integration is **not implemented**; browser DOM labels are available only in the supplied WebGL template. System reduced-motion preference is read by that template; desktop players use the in-game toggle.

## Build

Use **TITAN → Build → WebGL / macOS / Windows**. The selected Unity platform module must be installed. Output goes to ignored `Builds/` folders. These menu entries call Unity's real build pipeline; no compiled player is included yet.

For a WebGL build, serve the output over HTTP, not `file://`:

```sh
python3 -m http.server 4174 --directory Builds/WebGL
```

Then visit `http://localhost:4174`. Compression is disabled initially to avoid server header misconfiguration. Enable production compression only after configuring the corresponding server headers. NASA services need network access and browser CORS permission; their failure does not prevent gameplay.

Batch commands, after installing/activating Unity (replace the editor path for your installation):

```sh
UNITY_EDITOR="/Applications/Unity/Hub/Editor/2022.3.62f1/Unity.app/Contents/MacOS/Unity"
"$UNITY_EDITOR" -batchmode -quit -projectPath "$PWD" -executeMethod Titan.Editor.ProjectSetup.Generate -logFile setup.log
"$UNITY_EDITOR" -batchmode -projectPath "$PWD" -runTests -testPlatform EditMode -testResults results.xml -logFile tests.log
"$UNITY_EDITOR" -batchmode -quit -projectPath "$PWD" -executeMethod Titan.Editor.ProjectSetup.BuildWebGL -logFile build.log
```

## Architecture and generated hierarchy

`Catalog` defines the initial data. Generated `EquipmentSet`, `DestinationSet`, and `DifficultySet` assets are referenced by the runtime catalogue and can be edited in the Inspector. `MissionEngine` and `FlightPhysics` contain the calculation/state rules, without MonoBehaviour dependencies. `GameManager` coordinates the UI, flight controller, exploration controller, world renderer, audio, NASA services, and persistence.

The runtime scene hierarchy is generated as follows:

```text
Mission entry (SceneEntry)
Titan Game (GameManager, controllers, services, view, UI)
Mission camera (Camera, AudioListener)
Sun (Directional Light)
Procedural world
  Surface / rock ridges / clouds / star field / sky planet
  Rocket or Pip
    Body, face, eyes, floats or wheels
    Selected power source, radio, science instruments
  Navigation ring OR landing target OR five science dioramas
Mission UI (Canvas, CanvasScaler, GraphicRaycaster)
  Screen
    Dashboard
    Instructions
    Mission controls (scrollable)
    Part cards (builder)
    Optional modal shield and scrollable dialog
UI navigation (EventSystem)
```

The six generated scenes are `MainMenu`, `Builder`, `Flight`, `Exploration_Titan`, `Exploration_Mars`, and `Exploration_Moon`. Only MainMenu is shipped by the build menu; the others are development entry points using the same controllers. Starting a development scene seeds a new mission in the same local save slot, so use MainMenu for normal play.

Models and UI are instantiated from code at runtime. Model prefabs are generated for inspection/reuse; the game does not require third-party art, purchased assets, downloaded music, an API key, accounts, or external C# packages.

## Simulation boundaries

All equipment performance, masses, credits, batteries, data units, mission durations, and difficulty budgets are **fictional game values**. Destination sunlight multipliers, exponential atmosphere profiles, bundled hull size, simplified landing engines, and optical-link penalties are balancing assumptions. NASA imagery and fact cards are separate from the stylized game artwork.

- Drag: `0.5 × density × speed² × coefficient × area`.
- Entry heating: `1.2e-4 × sqrt(density / 1.4) × |speed|³`.
- Titan flotation: displaced liquid mass must exceed vehicle mass with 12% reserve.
- Thermal model: lumped heat balance with 140,000 J/K thermal capacity.
- Battery: net watts × mission hours, clamped to capacity; overdraft decisions are rejected.
- Mars starts the playable descent after an abstracted upper-atmosphere transfer at 40 km / 550 m/s. Moon starts after abstracted orbital insertion at 1.2 km / 35 m/s. These are gameplay scenarios, not simulated interplanetary trajectories.
- A bundled autopilot throttles an armed retro engine near its stopping distance. Little Explorer also arms landing systems automatically. Advanced players must arm them explicitly.
- Score: instrument science points / 3 (up to 50), successful transmission (25), integrity × 0.15, and unspent-budget fraction × 10. Science is collected one instrument at a time, cycling through installed tools.

This is not a spacecraft design, orbital mechanics, radiation, climate, or flight-safety simulator. Terrain and celestial-body sizes are deliberately artistic. The fog is exponential raster fog, not volumetric scattering.

## Tests

In Unity, open **Window → General → Test Runner → EditMode → Run All**. Tests cover resource sums, selection rollback, validation, solar behavior by destination, energy/thermal/drag/heating/buoyancy calculations, guided landing and unsafe Moon descent, discovery uniqueness, transmission, scoring, save validation, bounded reports, and allowed NASA image URLs.

An optional dependency-free .NET 8 smoke runner is provided:

```sh
dotnet run --project Tools/CoreCheck/CoreCheck.csproj
```

It compiles the actual pure C# game logic and executes the test methods with small test-framework and Unity-data substitutes. It does **not** test Unity compilation, lifecycle, shaders, network requests, PlayerPrefs, or Unity JsonUtility serialization. It is additional evidence, not a replacement for the Unity test runner.

See [SOURCES.md](SOURCES.md) for scientific references and resource-access limitations.
