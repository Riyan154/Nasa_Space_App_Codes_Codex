// Original vector artwork. This is game illustration, never NASA imagery.
const stars = Array.from({ length: 86 }, (_, i) => `<circle cx="${(i * 173 + 19) % 1440}" cy="${(i * 97 + 31) % 650}" r="${i % 8 === 0 ? 1.8 : 0.85}" fill="${i % 3 ? '#e7d9bd' : '#9acbd1'}" opacity="${0.25 + (i % 5) / 8}"/>`).join('');
export function icon(name, size = 24) {
  const paths = {
    rocket: '<path d="M9 16C6 10 11 3 17 2c2 6 0 13-6 16l-2-2Z"/><path d="m8 9-5 3 4 2m6 3 1 4 3-5M7 18l-3 3"/><circle cx="14" cy="8" r="2"/>',
    power: '<path d="m14 2-9 12h6l-1 8 9-12h-6l1-8Z"/>',
    solar: '<path d="M9 5H2v14h7zm13 0h-7v14h7zM5 5v14m13-14v14M2 12h7m6 0h7m-10-9v18m-3-9h6"/>',
    sample: '<path d="M8 2h8m-6 0v7L4 19q-1 3 3 3h10q4 0 3-3L14 9V2M7 16h10"/><circle cx="11" cy="13" r=".5"/>',
    sensor: '<path d="M10 14V5a2 2 0 0 1 4 0v9a5 5 0 1 1-4 0Zm2-6v9m6-12h3m-3 4h2"/>',
    camera: '<rect x="2" y="6" width="20" height="15" rx="3"/><circle cx="12" cy="13" r="4"/><path d="m7 6 2-4h6l2 4"/>',
    radio: '<path d="M4 4a14 14 0 0 0 16 16L4 4Zm8 8 7-7m-7 14-3 3m2-3 3 3M16 2a6 6 0 0 1 6 6"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5M12 2v3M2 12h3m7 7v3m7-10h3"/>',
    navigation: '<path d="m12 2 8 19-8-5-8 5 8-19Z"/><path d="M12 8v8"/>',
    shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 11 3 3 5-6"/>',
    hull: '<path d="M2 13h20l-4 7H6l-4-7Zm5 0V7h10v6M12 7V2M1 22q3-3 6 0 3-3 6 0 3-3 6 0"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    book: '<path d="M12 5Q7 1 2 4v16q5-3 10 0 5-3 10 0V4q-5-3-10 1v15"/>',
    settings: '<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
    archive: '<path d="M3 3h18v5H3zm2 5v13h14V8m-10 4h6"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    close: '<path d="m5 5 14 14M5 19 19 5"/>',
    mass: '<path d="M8 7a4 4 0 0 1 8 0M5 7h14l3 14H2L5 7Z"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>',
    home: '<path d="m2 10 10-8 10 8M5 8v13h14V8m-10 13v-8h6v8"/>',
    sound: '<path d="m3 9 5 0 5-5v16l-5-5H3V9Zm13-2q7 5 0 10m1-13q12 8 0 16"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    star: '<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1 3-7Z"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
}
export function lander(design = {}, id = 'lander') {
  const twin = design.hull === 'catamaran', solar = (design.power || '').includes('solar');
  return `<svg class="lander-art" viewBox="0 0 480 410" role="img" aria-label="Your illustrated Titan lake explorer">
  <defs><linearGradient id="${id}-body" x2=".7" y2="1"><stop stop-color="#f7ead0"/><stop offset=".52" stop-color="#d7c4a0"/><stop offset="1" stop-color="#867961"/></linearGradient><linearGradient id="${id}-gold" x2="0" y2="1"><stop stop-color="#ffd174"/><stop offset="1" stop-color="#a55626"/></linearGradient><linearGradient id="${id}-glass" x2="1" y2="1"><stop stop-color="#172d39"/><stop offset="1" stop-color="#71b8b5"/></linearGradient></defs>
  <ellipse cx="240" cy="350" rx="172" ry="22" fill="#000" opacity=".23"/>
  ${design.comms ? '<g transform="translate(266 104) rotate(-30)"><path d="M0 100V18" stroke="#aba898" stroke-width="8"/><path d="M-52 0Q0 83 52 0Z" fill="#cec7ad" stroke="#ebe5cc" stroke-width="3"/><path d="M0 31V-17" stroke="#e6d7b4" stroke-width="4"/><circle cy="-18" r="5" fill="#9edbd1"/></g>' : ''}
  ${solar ? '<g stroke="#b6bab1" stroke-width="4" fill="#233c55"><path d="m56 172 103 20-12 78-107-20zm270 21 103-21 14 78-105 20Z"/><path d="m91 180-12 77m45-70-12 77m249-77 12 76m21-83 12 76M47 211l105 22m180 0 102-22" stroke="#8fa8ab" stroke-width="2"/></g>' : '<g fill="#a98c5b" stroke="#685a42" stroke-width="3"><path d="m115 188 40-17v86l-40 16Z"/><path d="m122 190 27-12m-27 25 27-12m-27 25 27-12m-27 25 27-12m-27 25 27-12m-27 25 27-12"/></g>'}
  <path d="m152 177 90-37 92 37-12 110-80 40-80-40Z" fill="url(#${id}-body)" stroke="#3b3c35" stroke-width="4"/>
  <path d="m152 177 90 36 92-36-92-37Z" fill="#e5d6b5"/><path d="M242 213v114l80-40 12-110Z" fill="#8e8266" opacity=".55"/>
  <path d="m171 202 51 20v58l-51-22Z" fill="url(#${id}-glass)" stroke="#574f3e" stroke-width="5"/>
  <path d="m181 210 33 13v12l-33-13Z" fill="#b1e8da" opacity=".7"/>
  <path d="m267 225 36-15v36l-36 17Z" fill="#443f33"/>
  <path d="m271 231 28-12m-28 20 28-12m-28 20 28-12" stroke="#bda56c" stroke-width="3"/>
  ${design.shield ? '<path d="m160 268 82 35 80-35v20l-80 38-80-38Z" fill="#9f5b2c"/><path d="m166 276 70 31m12 0 68-31" stroke="#f5af58" stroke-width="3"/>' : ''}
  <path d="m171 281-28 45-36 3m207-48 28 45 36 3" fill="none" stroke="#b3b3a3" stroke-width="9"/>
  ${design.hull ? `<g fill="url(#${id}-gold)" stroke="#674b31" stroke-width="3"><path d="M63 320q-14 20 9 30l112 9q24-4 16-24l-20-16-95-9Z"/><path d="M281 337q-8 20 16 22l112-9q23-10 9-30l-22-10-95 9Z"/>${twin ? '<path d="m100 363 141 20 143-20-12-18-131 18-129-18Z"/>' : ''}</g>` : ''}
  ${(design.instruments || []).includes('camera') ? '<g><path d="M193 181v-30" stroke="#b4ad94" stroke-width="6"/><rect x="174" y="129" width="40" height="29" rx="7" fill="#b3ad91"/><circle cx="188" cy="143" r="10" fill="#203d47"/><circle cx="188" cy="143" r="4" fill="#7acbc8"/></g>' : ''}
  <circle cx="242" cy="167" r="7" fill="#a8d9be"/><path d="M242 155v-49" stroke="#a6ada3" stroke-width="3"/><circle cx="242" cy="103" r="4" fill="#f6c175"/>
  <text x="183" y="263" fill="#d6cfb7" font-family="monospace" font-size="10" transform="rotate(23 183 263)">TLE–01</text>
  </svg>`;
}
export function scene(mode = 'home') {
  const surface = ['home', 'explore', 'results', 'briefing'].includes(mode);
  return `<svg class="world-art world-${mode}" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0a121c"/><stop offset=".45" stop-color="#272b35"/><stop offset=".8" stop-color="#9a684e"/><stop offset="1" stop-color="#d6a26b"/></linearGradient>
    <radialGradient id="haze"><stop stop-color="#e6ad64" stop-opacity=".40"/><stop offset="1" stop-color="#b57038" stop-opacity="0"/></radialGradient>
    <linearGradient id="saturn" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e6cba0"/><stop offset=".4" stop-color="#c7a987"/><stop offset=".8" stop-color="#746656"/><stop offset="1" stop-color="#303944"/></linearGradient>
    <linearGradient id="water" x2="0" y2="1"><stop stop-color="#9da49a"/><stop offset=".3" stop-color="#596c6b"/><stop offset="1" stop-color="#1c3c43"/></linearGradient>
    <linearGradient id="mountain" x2="0" y2="1"><stop stop-color="#a47855"/><stop offset="1" stop-color="#3c3b36"/></linearGradient>
    <radialGradient id="titan"><stop stop-color="#e9be76"/><stop offset=".6" stop-color="#bd763c"/><stop offset="1" stop-color="#56372c"/></radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs><rect width="1440" height="900" fill="url(#sky)"/>${stars}
  <ellipse cx="1020" cy="440" rx="630" ry="500" fill="url(#haze)"/>
  <g class="saturn" transform="translate(1050 226) rotate(-23)">
    <ellipse rx="283" ry="71" fill="none" stroke="#c8bc9d" stroke-width="38" opacity=".38"/>
    <ellipse rx="285" ry="72" fill="none" stroke="#e4cfab" stroke-width="3" opacity=".45"/>
    <circle r="125" fill="url(#saturn)"/>
    <path d="M-120-35Q0-13 120-35M-124-10Q0 16 124-10M-121 32Q0 55 121 32M-111 58Q0 81 111 58" fill="none" stroke="#c4ad89" stroke-width="9" opacity=".36"/>
    <path d="M-281 0a281 72 0 0 0 562 0" fill="none" stroke="#d2bb96" stroke-width="29" opacity=".68"/>
    <path d="M-290 0a290 76 0 0 0 580 0" fill="none" stroke="#edcf9f" stroke-width="3" opacity=".75"/>
  </g>
  ${surface ? `<path d="m0 562 111-43 79 22 108-48 117 34 123-23 109 48 92-37 103 17 111-45 92 40 87-14 112 46 96-17V900H0Z" fill="#a28360" opacity=".5"/>
  <path d="m0 618 132-65 105 34 72-41 174 96 101-21 124 35 144-61 137 31 146-62 105 38v298H0Z" fill="url(#mountain)"/>
  <path d="M0 712q260-59 465-26 185-36 366-19 382-43 609 7v226H0Z" fill="url(#water)"/>
  <g fill="none" stroke="#c0bd9c" opacity=".22"><path d="M610 713h505m-582 17h389m120 15h323M444 764h685m-422 33h570M267 826h418m141 21h400"/><path d="m973 693 186-4m-356 70 227-4m-78 52 302-6" stroke-width="3"/></g>
  <path d="M0 640q119-8 232 73l167 27-46 58 191 56-8 46H0Z" fill="#373b36"/>
  <path d="m0 685 114-17 100 46-81 32 113 49-36 105H0Z" fill="#58523f"/>
  <path d="m0 761 95-21 118 66 58-10 74 47-27 57H0Z" fill="#252e2e"/>
  <path d="m1440 746-121 23-35 39-94 37-46 55h296Z" fill="#293938"/>
  <g fill="#77684b"><path d="m337 777 39-19 48 9 17 19-52 8Z"/><path d="m74 676 24-11 34 15-21 15Z"/><path d="m1251 853 36-23 29 11 13 21-44 9Z"/></g>` : `<circle cx="1080" cy="660" r="235" fill="url(#titan)"/><ellipse cx="1080" cy="658" rx="245" ry="243" fill="none" stroke="#efb15b" stroke-width="9" opacity=".14"/><path d="M100 720Q450 110 1100 610" stroke="#9accc8" stroke-width="2" stroke-dasharray="6 12" fill="none" opacity=".5"/>`}
  </svg>`;
}
export function rocketArt(fire = false) {
  return `<svg viewBox="0 0 250 550" class="rocket-art" role="img" aria-label="Illustrated launch rocket"><defs><linearGradient id="rocketBody"><stop stop-color="#868d89"/><stop offset=".4" stop-color="#f6f0dc"/><stop offset=".8" stop-color="#c1c4b5"/><stop offset="1" stop-color="#6c7d7b"/></linearGradient><linearGradient id="flame" x2="0" y2="1"><stop stop-color="#fff6cc"/><stop offset=".3" stop-color="#ffc66d"/><stop offset="1" stop-color="#e26e36" stop-opacity="0"/></linearGradient></defs>${fire ? '<path class="flame" d="M96 420Q80 460 125 550q48-100 29-130Z" fill="url(#flame)"/>' : ''}<path d="m93 370-34 48 3-103 31-46m64 101 34 48-3-103-31-46" fill="#b67439"/><path d="M90 385V139Q92 68 125 24q33 44 35 115v246Z" fill="url(#rocketBody)"/><path d="M91 139Q93 68 125 24q33 44 35 115Z" fill="#c8d1c4"/><path d="M90 145h70v26H90zm0 146h70v23H90Z" fill="#d88e45"/><path d="m90 385 9 40h52l9-40Z" fill="#4d5d5b"/><circle cx="125" cy="205" r="16" fill="#233f49" stroke="#a3b8ac" stroke-width="5"/><path d="M117 197h16v16h-16Z" fill="#88bcb0"/><text x="125" y="263" fill="#34474b" font-size="13" text-anchor="middle" font-family="monospace" transform="rotate(90 125 263)">T L E – 0 1</text><path d="M106 170v117" stroke="#fff" opacity=".4" stroke-width="3"/></svg>`;
}
