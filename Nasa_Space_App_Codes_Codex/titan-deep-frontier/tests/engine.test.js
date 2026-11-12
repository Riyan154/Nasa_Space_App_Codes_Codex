import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, FRAME, getPart } from '../src/catalog.js';
import { newMission, resources, choosePart, validate, buoyancy, energyAfter, dragForce, temperatureAfter, simulateEntry, beginFlight, advanceFlight, collectScience, transmit, recharge, finishMission } from '../src/engine.js';
function land(m = newMission(), choices = ['correct','sleep','gentle','safe','stabilize']) {
  assert.equal(beginFlight(m),true); m.stage='flight';
  choices.forEach(c=>advanceFlight(m,c)); return m;
}
test('mass, cost and power account for all components, including the frame and launch cost',()=>{
  const m=newMission(), r=resources(m);
  assert.equal(r.mass,1132); assert.equal(r.cost,93800); assert.equal(r.baseline,58); assert.equal(r.demand,98); assert.equal(r.margin,12); assert.equal(r.battery,550);
  assert.equal(validate(m).ok,true);
  assert.equal(FRAME.mass,220);
});
test('every hardware selection updates resources, preserves budget and can be removed',()=>{
  for(const [category,parts] of Object.entries(CATALOG)) for(const part of parts){
    const m=newMission(); const before=resources(m);
    const result=choosePart(m,category,part.id);
    assert.ok(Number.isFinite(resources(m).mass));
    if(result.ok) assert.ok(resources(m).cost<=resources(m).budget);
    else assert.deepEqual(resources(m),before);
  }
});
test('purchase that exceeds the budget does not mutate spacecraft',()=>{
  const m=newMission();const design=structuredClone(m.design);
  assert.equal(choosePart(m,'rocket','horizon').ok,false);assert.deepEqual(m.design,design);
});
test('missing essential systems, excessive mass and deficient power prevent launch',()=>{
  for(const category of ['rocket','power','comms','navigation','shield','hull']){
    const m=newMission();m.design[category]=null;assert.equal(validate(m).ok,false);assert.equal(beginFlight(m),false);
  }
  const m=newMission();m.design.power='solar';assert.equal(validate(m).ok,false);
  m.design.power='hybrid';m.design.shield='reinforced';m.design.hull='catamaran';m.design.instruments=CATALOG.instruments.map(x=>x.id);
  assert.ok(resources(m).mass>resources(m).capacity);assert.equal(validate(m).ok,false);
});
test('science goals require suitable chemistry and environmental tools',()=>{
  const m=newMission();m.design.instruments=['camera'];assert.equal(validate(m).ok,false);
  m.design.instruments=['spectrometer','pressure'];assert.equal(validate(m).ok,true);
  m.design.instruments=['chemistry','atmosphere'];assert.equal(validate(m).ok,false); // hull reserve prevents this heavy starter configuration
});
test('power uses Wh, charges and discharges with time and respects capacity',()=>{
  assert.equal(energyAfter(200,100,140,2,500),120);
  assert.equal(energyAfter(450,100,20,2,500),500);
  assert.equal(energyAfter(50,0,100,2,500),0);
});
test('drag follows square velocity and uses consistent SI units',()=>{
  assert.equal(dragForce(2,10,1.5,4),600);
  assert.equal(dragForce(2,20,1.5,4),2400);
});
test('flotation includes displaced liquid, gravity, reserve and stability',()=>{
  const b=buoyancy(1000,3,480,.3,.1);assert.equal(b.force,1944.0000000000002);assert.equal(b.stable,true);
  assert.equal(buoyancy(1600,3).floats,false);assert.equal(buoyancy(1400,3).stable,false);
  assert.equal(buoyancy(1000,3,480,.1,.3).stable,false);
});
test('thermal model responds to cold, insulation and heater power',()=>{
  const bare=temperatureAfter(273,94,12,.1,0),insulated=temperatureAfter(273,94,12,.9,0);
  assert.ok(bare<insulated);assert.ok(bare>94);assert.ok(temperatureAfter(273,94,12,.9,20)>insulated);
});
test('safe entry decelerates and reaches ground, heating changes with approach',()=>{
  const m=newMission(),gentle=simulateEntry(m),steep=simulateEntry(m,{profile:'steep'});
  assert.equal(gentle.safe,true);assert.equal(gentle.samples.at(-1).altitude,0);assert.ok(gentle.velocity<4.5);
  assert.ok(steep.heat>gentle.heat);assert.equal(steep.safe,false);
  m.design.shield='reinforced';assert.equal(simulateEntry(m,{profile:'steep'}).safe,true);
});
test('early chute tears; late deployment lacks inflation time; missing heat shield fails',()=>{
  const m=newMission();assert.equal(simulateEntry(m,{deployAltitude:170000}).torn,true);
  assert.equal(simulateEntry(m,{deployAltitude:2}).safe,false);
  m.design.shield=null;assert.equal(simulateEntry(m).safe,false);
});
test('complete successful mission is earned through observations and transmission',()=>{
  const m=land();assert.equal(m.stage,'explore');assert.ok(m.flight.energy>0);assert.equal(m.flight.fuel,20);
  assert.equal(collectScience(m,'spectrometer').ok,true);assert.equal(collectScience(m,'temperature').ok,true);
  assert.equal(transmit(m).ok,true);assert.equal(m.flight.transmitted,77);
  const result=finishMission(m);assert.equal(result.success,true);assert.ok(result.score>60&&result.score<=100);assert.equal(m.stage,'results');
});
test('landing alone is partial success and repeat observations cannot farm points',()=>{
  const m=land();assert.equal(collectScience(m,'spectrometer').ok,true);assert.equal(collectScience(m,'spectrometer').ok,false);
  assert.equal(collectScience(m,'radar').ok,false);assert.equal(finishMission(m).success,false);
});
test('poor entry and battery depletion yield explained failure',()=>{
  const failed=land(newMission(),['correct','sleep','steep','safe','stabilize']);assert.equal(failed.stage,'results');assert.equal(failed.result.success,false);assert.match(failed.result.reason,/heating.*heat shield/i);
  const m=newMission();beginFlight(m);m.stage='flight';advanceFlight(m,'correct');m.flight.energy=100;advanceFlight(m,'survey');assert.equal(m.stage,'results');assert.match(m.result.reason,/battery/);
});
test('high wind punishes drifting in a narrow hull, but stabilizers save it',()=>{
  const m=newMission('explorer','kraken');const failed=land(m,['correct','sleep','gentle','safe','drift']);assert.equal(failed.result.success,false);assert.match(failed.result.reason,/stable.*waves|wider hull/i);
  const safe=land(newMission('explorer','kraken'));assert.equal(safe.stage,'explore');
});
test('surface time, transmission and recharging have meaningful limits',()=>{
  const m=land();assert.equal(transmit(m).ok,false);m.flight.energy=1;assert.equal(collectScience(m,'spectrometer').ok,false);
  assert.equal(recharge(m).ok,true);assert.ok(m.flight.energy>1);m.flight.surfaceHours=23;assert.equal(recharge(m).ok,false);assert.equal(collectScience(m,'spectrometer').ok,false);
});
test('advanced solar supports a viable low-cost architect strategy',()=>{
  const m=newMission('architect');m.design.power='advanced-solar';
  assert.equal(validate(m).ok,true);
  land(m);assert.equal(m.stage,'explore');
  collectScience(m,'spectrometer');collectScience(m,'temperature');transmit(m);
  assert.equal(finishMission(m).success,true);
});
