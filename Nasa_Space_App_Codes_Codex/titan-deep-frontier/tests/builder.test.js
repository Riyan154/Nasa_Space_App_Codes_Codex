import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPONENTS, DEFAULT_LOADOUT, missionTotals, validLoadout } from '../src/builder-model.js';
import { freshAdventure, restoreAdventure } from '../src/adventure-model.js';

test('balanced build includes core and every installed component exactly once',()=>{
  const t=missionTotals(DEFAULT_LOADOUT);
  assert.equal(t.mass,162);assert.equal(t.cost,260);assert.equal(t.demand,35);assert.equal(t.margin,75);assert.equal(t.ready,true);assert.equal(t.hours,null);
});
test('power swapping changes mass and cost, rejects weak solar, and reports finite battery energy',()=>{
  const solar=missionTotals({...DEFAULT_LOADOUT,power:'solar'});
  assert.equal(solar.mass,145);assert.equal(solar.cost,195);assert.equal(solar.margin,-27);assert.equal(solar.ready,false);assert.match(solar.issues[0],/sunlight/);
  const battery=missionTotals({...DEFAULT_LOADOUT,power:'battery'});
  assert.equal(battery.cost,205);assert.equal(battery.mass,149);assert.equal(battery.ready,true);assert.equal(battery.hours,600/35);
});
test('heavy, expensive configuration fails both limits and lighter parts recover it',()=>{
  const t=missionTotals({body:'heavy',power:'rtg',science:'lab',radio:'array'});
  assert.equal(t.mass,264);assert.equal(t.cost,390);assert.equal(t.ready,false);assert.equal(t.issues.length,2);
  const recovered=missionTotals({body:'light',power:'battery',science:'lab',radio:'whip'});
  assert.equal(recovered.ready,true);assert.equal(recovered.cost,245);assert.equal(recovered.mass,177);
});
test('all 81 combinations produce finite, consistent checks',()=>{
  for(const body of COMPONENTS.body)for(const power of COMPONENTS.power)for(const science of COMPONENTS.science)for(const radio of COMPONENTS.radio){
    const design={body:body.id,power:power.id,science:science.id,radio:radio.id},t=missionTotals(design);
    assert.ok(validLoadout(design));assert.equal(t.ready,t.mass<=240&&t.cost<=300&&t.supply>=t.demand);
    assert.equal(t.demand,15+science.draw+radio.draw);assert.equal(t.mass,65+body.mass+power.mass+science.mass+radio.mass);
  }
});
test('custom parts survive every checkpoint, old saves migrate, and corrupt selections are rejected',()=>{
  const state=freshAdventure();state.loadout={body:'shield',power:'battery',science:'sampler',radio:'whip'};
  for(const stage of ['assemble','launch','cruise','landing','lake']){
    state.stage=stage;state.parts=['floats','power','radio'];assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);
  }
  const old={...state};delete old.loadout;assert.deepEqual(restoreAdventure(old).loadout,DEFAULT_LOADOUT);
  for(const loadout of [null,{},'solar',{...DEFAULT_LOADOUT,power:'unknown'}])assert.equal(restoreAdventure({...state,loadout}),null);
  const a=freshAdventure(),b=freshAdventure();a.loadout.power='solar';assert.equal(b.loadout.power,'rtg');
});
