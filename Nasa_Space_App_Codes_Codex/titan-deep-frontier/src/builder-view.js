import { COMPONENTS, BUILDER_LIMITS, missionTotals } from './builder-model.js';
import { componentArt } from './adventure-art.js';

export const BUILD_TABS = [['body','Mass','Body & floats'],['power','Power','Energy source'],['science','Science','Discovery tools'],['radio','Radio','Send signals'],['budget','Budget','Mission coins']];
export function builderMarkup(){
  return `<section id="mission-builder" class="mission-builder" aria-label="Spacecraft builder" hidden>
    <section class="builder-parts"><div class="builder-eyebrow">MAKE PIP YOURS</div><div class="builder-tabs" role="group" aria-label="Spacecraft sections">${BUILD_TABS.map(([id,label])=>`<button data-game="build-tab" data-tab="${id}" aria-pressed="${id==='power'}">${label}</button>`).join('')}</div><div id="builder-options"></div></section>
    <div class="builder-preview"><span class="preview-label"><i></i> LIVE SPACECRAFT</span><div class="preview-callouts" id="preview-callouts"></div><div class="preview-caption"><b id="preview-part-name"></b><span>Tap a part card. Watch Pip change.</span></div><div class="builder-launch"><button class="play-button" data-game="build-ready">Ready for launch <span>↑</span></button><button class="builder-reset" data-game="build-reset">Use a balanced build ↺</button></div></div>
    <aside class="builder-summary" aria-label="Mission resources"><div class="builder-eyebrow">MISSION CHECK</div><div id="builder-meters" aria-live="polite"></div><p class="builder-verdict" id="builder-verdict" role="status"></p><p class="builder-facts">Real technologies. Pretend mission.<br>Mass, watts & coins are game values.</p><button class="builder-source" data-game="power-facts">How does space power work? ↗</button></aside>
  </section>`;
}
export function renderBuilder(root,loadout,tab){
  const totals=missionTotals(loadout), section=BUILD_TABS.find(([id])=>id===tab), panel=root.querySelector('#builder-options');
  root.querySelectorAll('[data-game="build-tab"]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.tab===tab)));
  if(tab==='budget'){
    panel.innerHTML=`<h2>Your mission wallet</h2><p class="builder-intro">Every part uses coins. Can you stay under ${BUILDER_LIMITS.budget}?</p><div class="budget-ledger"><div><span>Core, computer & landing gear</span><b>50 ◈</b></div>${totals.items.map(item=>`<button data-game="build-tab" data-tab="${item.group}"><canvas width="112" height="90" data-component="${item.id}" aria-hidden="true"></canvas><span>${item.name}<small>Change part →</small></span><b>${item.cost} ◈</b></button>`).join('')}<div class="budget-total"><span>${totals.cost>300?'Over budget':'Coins left'}</span><b>${Math.abs(300-totals.cost)} ◈</b></div></div>`;
  }else{
    panel.innerHTML=`<h2>${section[2]}</h2><p class="builder-intro">${tab==='body'?'Lighter parts leave room for more science.':tab==='power'?'Choose what keeps your explorer awake.':tab==='science'?'Pick a tool to give Pip a new look.': 'Choose how Pip talks to home.'}</p><div class="builder-choices">${COMPONENTS[tab].map(item=>`<button class="component-card" data-game="build-part" data-group="${tab}" data-component-id="${item.id}" aria-pressed="${loadout[tab]===item.id}"><canvas width="156" height="116" data-component="${item.id}" aria-hidden="true"></canvas><span class="component-copy"><small>${item.tag}</small><b>${item.name}</b><span>${item.mass} kg <i>·</i> ${item.cost} ◈ <i>·</i> ${tab==='power'?`${item.supply} W out`:`${item.draw} W used`}</span></span><span class="component-check">${loadout[tab]===item.id?'✓':'+'}</span></button>`).join('')}</div><p class="component-explanation">${COMPONENTS[tab].find(item=>item.id===loadout[tab]).detail}</p>`;
  }
  const meter=(label,value,caption,ratio,bad,symbol)=>`<section class="builder-meter ${bad?'over':''}"><span class="meter-icon">${symbol}</span><div><h3>${label}</h3><strong>${value}</strong><div class="build-meter-track"><i style="width:${Math.min(100,ratio*100)}%"></i></div><small>${caption}</small></div></section>`;
  root.querySelector('#builder-meters').innerHTML=
    meter('Mass',`${totals.mass} <small>/ ${BUILDER_LIMITS.mass} kg</small>`,`${Math.abs(BUILDER_LIMITS.mass-totals.mass)} kg ${totals.mass>BUILDER_LIMITS.mass?'too heavy':'room left'}`,totals.mass/BUILDER_LIMITS.mass,totals.mass>BUILDER_LIMITS.mass,'⚖')+
    meter('Power',`${totals.supply} <small>W available</small>`,`${totals.demand} W used · ${totals.margin>=0?'+':''}${totals.margin} W spare`,totals.demand/totals.supply,totals.margin<0,'ϟ')+
    meter('Budget',`${totals.cost} <small>/ ${BUILDER_LIMITS.budget} ◈</small>`,`${Math.abs(BUILDER_LIMITS.budget-totals.cost)} coins ${totals.cost>BUILDER_LIMITS.budget?'over':'left'}`,totals.cost/BUILDER_LIMITS.budget,totals.cost>BUILDER_LIMITS.budget,'◈');
  const verdict=root.querySelector('#builder-verdict');verdict.classList.toggle('needs-fix',!totals.ready);
  verdict.textContent=totals.issues[0]||(totals.hours?`✓ Short trip ready! About ${totals.hours.toFixed(1)} pretend hours of battery energy. Energy use is not timed in this adventure.`:'✓ All systems go! Your little explorer is ready for Titan.');
  root.querySelector('[data-game="build-ready"]').disabled=!totals.ready;
  root.querySelector('#preview-part-name').textContent=tab==='budget'?'A little explorer. A clever budget.':COMPONENTS[tab].find(item=>item.id===loadout[tab]).name;
  root.querySelector('#preview-callouts').innerHTML=totals.items.map(item=>`<button class="craft-label label-${item.group} ${tab===item.group?'selected':''}" data-game="build-tab" data-tab="${item.group}"><small>${item.group==='body'?'BODY & FLOATS':item.group.toUpperCase()}</small>${item.name}</button>`).join('');
  root.querySelectorAll('[data-component]').forEach(el=>componentArt(el.getContext('2d'),el.dataset.component,el.width/2,el.height/2,.82));
}
