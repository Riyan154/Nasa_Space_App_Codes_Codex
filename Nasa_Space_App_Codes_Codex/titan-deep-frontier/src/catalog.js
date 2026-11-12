// All hardware specifications are fictional game-balancing values, not NASA designs.
export const DIFFICULTIES = {
  cadet: { name: 'Pathfinder', budget: 112000, wind: 0.07, description: 'Room to experiment. Your first expedition.' },
  explorer: { name: 'Explorer', budget: 100000, wind: 0.13, description: 'A tighter budget. Every choice counts.' },
  architect: { name: 'Architect', budget: 91000, wind: 0.20, description: 'Lean engineering. A demanding landing.' }
};
export const LAKES = {
  ligeia: { name: 'Ligeia Mare', density: 480, wind: 0.04, description: 'A northern sea. A gentle first splashdown.', color: '#6db7bb' },
  kraken: { name: 'Kraken Mare', density: 520, wind: 0.16, description: 'Titan’s largest sea. More challenging waves.', color: '#b1a1da' },
  punga: { name: 'Punga Mare', density: 450, wind: 0.10, description: 'A smaller sea. Your hull must float in lighter liquid.', color: '#ddb66c' }
};
export const CATEGORIES = [
  { id: 'rocket', name: 'Rocket', title: 'Your adventure needs a lift.', text: 'A bigger rocket carries more, but leaves less money for discoveries.' },
  { id: 'power', name: 'Power', title: 'Bring a little sunshine.', text: 'Titan is far from the Sun. Choose how to keep your explorer awake.' },
  { id: 'instruments', name: 'Science', title: 'What will you discover?', text: 'Pick your tools. Bring a chemistry instrument and an environment sensor.' },
  { id: 'comms', name: 'Radio', title: 'Send a hello back home.', text: 'A stronger radio sends your discoveries home faster. It also needs more power.' },
  { id: 'navigation', name: 'Guidance', title: 'Find your way through space.', text: 'Fuel and careful steering help you reach the right spot.' },
  { id: 'shield', name: 'Protection', title: 'Ready for a fiery arrival?', text: 'A heat shield protects you on arrival. Insulation keeps the cold out later.' },
  { id: 'hull', name: 'Landing', title: 'Make a spaceship that floats.', text: 'Slow down with a parachute, then float on a sea of liquid methane.' }
];
export const FRAME = { id: 'frame', name: 'Lander frame & flight computer', mass: 220, cost: 5000, draw: 18 };
export const CATALOG = {
  rocket: [
    { id: 'atlas', name: 'Atlas Explorer', tag: 'Small & mighty', capacity: 1500, cost: 20000, reliability: 0.96, description: 'A nimble launch for a carefully packed explorer.', icon: 'rocket' },
    { id: 'titan', name: 'Titan Heavy', tag: 'Room to grow', capacity: 2500, cost: 30000, reliability: 0.98, description: 'Extra carrying room for an ambitious science mission.', icon: 'rocket' },
    { id: 'deep', name: 'DeepSpace XL', tag: 'Big ambitions', capacity: 3500, cost: 42000, reliability: 0.985, description: 'Bring heavy instruments, if your budget allows.', icon: 'rocket' },
    { id: 'horizon', name: 'Horizon Ultra', tag: 'Maximum lift', capacity: 5000, cost: 55000, reliability: 0.99, description: 'An enormous lift. A serious bite out of your funds.', icon: 'rocket' }
  ],
  power: [
    { id: 'solar', name: 'Solar wings', tag: 'Sunlight dependent', mass: 160, cost: 7000, generation: 18, battery: 500, description: 'Affordable, but Titan’s faint sunlight cannot run essential systems.', icon: 'solar' },
    { id: 'advanced-solar', name: 'Giant solar wings', tag: 'Heavy & delicate', mass: 230, cost: 15000, generation: 72, battery: 700, description: 'Huge panels gather more light. Run science one tool at a time.', icon: 'solar' },
    { id: 'rtg', name: 'Radioisotope core', tag: 'Steady explorer', mass: 130, cost: 22000, generation: 110, battery: 550, description: 'Decay heat becomes electricity, even in the dark. Includes a separate battery.', icon: 'power' },
    { id: 'mmrtg', name: 'MMRTG core', tag: 'Long-haul power', mass: 190, cost: 28000, generation: 145, battery: 850, description: 'Continuous radioisotope power with a larger separate battery.', icon: 'power' },
    { id: 'hybrid', name: 'Hybrid power pack', tag: 'Energy to spare', mass: 280, cost: 34000, generation: 125, battery: 1800, description: 'An RTG with a big rechargeable battery for short bursts of science.', icon: 'power' }
  ],
  instruments: [
    { id: 'spectrometer', name: 'Methane detective', tag: 'Lake chemistry', mass: 55, cost: 7000, draw: 35, science: 25, data: 65, objective: 'chemistry', description: 'Look for the fingerprints of methane and ethane.', limitation: 'Needs a lake sample.', icon: 'sample' },
    { id: 'atmosphere', name: 'Atmosphere station', tag: 'Air & weather', mass: 30, cost: 4000, draw: 15, science: 18, data: 30, objective: 'environment', description: 'Measure pressure and the nitrogen-rich air.', limitation: 'Local conditions only.', icon: 'sensor' },
    { id: 'temperature', name: 'Temperature probe', tag: 'Cold explorer', mass: 12, cost: 1800, draw: 5, science: 10, data: 12, objective: 'environment', description: 'Discover just how cold the lake is.', limitation: 'One local temperature sample.', icon: 'sensor' },
    { id: 'pressure', name: 'Pressure sensor', tag: 'Under pressure', mass: 14, cost: 2000, draw: 6, science: 10, data: 14, objective: 'environment', description: 'Feel the weight of Titan’s thick atmosphere.', limitation: 'Surface pressure only.', icon: 'sensor' },
    { id: 'chemistry', name: 'Lake laboratory', tag: 'Deep investigation', mass: 180, cost: 13500, draw: 65, science: 40, data: 110, objective: 'chemistry', description: 'Study a richer set of organic compounds in the lake.', limitation: 'Large energy and data demand.', icon: 'sample' },
    { id: 'camera', name: 'Panorama camera', tag: 'A new perspective', mass: 70, cost: 6000, draw: 25, science: 20, data: 90, objective: 'imaging', description: 'Capture an illustrated panorama of your landing site.', limitation: 'Haze limits visibility; images here are game art.', icon: 'camera' },
    { id: 'radar', name: 'Radar mapper', tag: 'Beyond the haze', mass: 240, cost: 12000, draw: 85, science: 35, data: 140, objective: 'mapping', description: 'Probe the nearby lake and shoreline with radio waves.', limitation: 'High power; short local survey only.', icon: 'radar' },
    { id: 'seismic', name: 'Seismic sensor', tag: 'Needs solid ground', mass: 45, cost: 3000, draw: 8, science: 0, data: 0, objective: 'seismic', description: 'Great on solid ground. A floating boat cannot make useful ground measurements.', limitation: 'Not suitable for this lake mission.', icon: 'sensor' }
  ],
  comms: [
    { id: 'basic', name: 'Explorer antenna', tag: 'Patient messenger', mass: 45, cost: 6000, draw: 12, rate: 35, description: 'A small antenna. Each transmission takes more time.', icon: 'radio' },
    { id: 'gain', name: 'High-gain dish', tag: 'Home, loud & clear', mass: 90, cost: 9500, draw: 25, rate: 80, description: 'A focused beam sends discoveries home faster.', icon: 'radio' },
    { id: 'advanced', name: 'Deep-space link', tag: 'Data express', mass: 150, cost: 14000, draw: 40, rate: 150, description: 'Fast transmission with a hefty power demand.', icon: 'radio' }
  ],
  navigation: [
    { id: 'standard', name: 'Star tracker kit', tag: 'Careful steering', mass: 220, cost: 9000, draw: 8, fuel: 60, accuracy: 0.76, description: 'Includes propulsion, fuel, navigation sensors, guidance and attitude control.', icon: 'navigation' },
    { id: 'precision', name: 'Precision pilot', tag: 'Confident arrival', mass: 300, cost: 14000, draw: 10, fuel: 95, accuracy: 0.95, description: 'Better sensing and more fuel give you extra options in flight.', icon: 'navigation' }
  ],
  shield: [
    { id: 'light', name: 'Explorer shell', tag: 'Light protection', mass: 240, cost: 11000, draw: 20, heatLimit: 2.4e6, insulation: 0.7, description: 'Aeroshell, heat shield and insulation. Choose a gentle entry.', icon: 'shield' },
    { id: 'reinforced', name: 'Aurora shell', tag: 'Extra reassurance', mass: 390, cost: 17000, draw: 12, heatLimit: 4.5e6, insulation: 0.92, description: 'More heat protection and insulation, but more mass.', icon: 'shield' }
  ],
  hull: [
    { id: 'skiff', name: 'Lake skiff', tag: 'Travel light', mass: 210, cost: 12000, volume: 3.0, area: 100, stability: 0.18, description: 'A compact flotation hull, stabilizers and a 100 m² parachute.', icon: 'hull' },
    { id: 'catamaran', name: 'Twin-hull voyager', tag: 'Steady on the sea', mass: 340, cost: 18000, volume: 4.6, area: 150, stability: 0.37, description: 'Wide twin floats, active stability and a 150 m² parachute.', icon: 'hull' }
  ]
};
export function getPart(category, id) { return CATALOG[category]?.find(part => part.id === id); }
export function starterDesign() {
  return { rocket: 'atlas', power: 'rtg', instruments: ['spectrometer', 'temperature'], comms: 'basic', navigation: 'standard', shield: 'light', hull: 'skiff' };
}
