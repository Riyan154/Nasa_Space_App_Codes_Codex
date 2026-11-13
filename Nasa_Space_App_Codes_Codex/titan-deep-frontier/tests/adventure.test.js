import test from 'node:test';
import assert from 'node:assert/strict';
import { DISCOVERIES, freshAdventure, restoreAdventure, moveExplorer, nearbyDiscovery, collectDiscovery, finishAdventure } from '../src/adventure-model.js';

function lakeState(){return {...freshAdventure(),stage:'lake',parts:['floats','power','radio']};}
test('adventure save round-trips every checkpoint and ignores corrupt or impossible progress',()=>{
  const state=lakeState();state.found=['lake'];state.x=520;
  assert.deepEqual(restoreAdventure(JSON.parse(JSON.stringify(state))),state);
  for(const bad of [null,{}, {...state,parts:[]},{...state,found:['fake']},{...state,found:['lake','lake']},{...state,rings:-1},{...state,x:NaN},{...state,stage:'done'}]) assert.equal(restoreAdventure(bad),null);
  assert.equal(restoreAdventure({...state,x:10000}).x,2700);
});
test('movement is bounded, diagonal speed is normalized, and a stalled frame cannot teleport',()=>{
  const straight=lakeState(),diagonal=lakeState();moveExplorer(straight,1,0,.05);moveExplorer(diagonal,1,1,.05);
  assert.ok(diagonal.x<straight.x);
  const paused=lakeState();moveExplorer(paused,1,0,30);assert.equal(paused.x,straight.x);
  for(let i=0;i<1000;i++)moveExplorer(paused,1,1,.05);
  assert.equal(paused.x,2700);assert.equal(paused.y,.9);
  for(let i=0;i<1000;i++)moveExplorer(paused,-1,-1,.05);
  assert.equal(paused.x,80);assert.equal(paused.y,.6);
});
test('discoveries require reaching the correct marker and cannot be collected twice',()=>{
  const state=lakeState();assert.equal(nearbyDiscovery(state),null);assert.equal(collectDiscovery(state,'lake'),false);
  state.x=520;state.y=.73;assert.equal(nearbyDiscovery(state).id,'lake');assert.equal(collectDiscovery(state,'cold'),false);
  assert.equal(collectDiscovery(state,'lake'),true);assert.equal(collectDiscovery(state,'lake'),false);assert.deepEqual(state.found,['lake']);
});
test('the full lake journey earns all five facts before a successful transmission',()=>{
  const state=lakeState();assert.equal(finishAdventure(state),false);
  for(const d of DISCOVERIES){state.x=d.x;state.y=d.y;assert.equal(collectDiscovery(state,d.id),true);}
  assert.equal(state.sent,false);assert.equal(finishAdventure(state),true);assert.equal(state.stage,'done');assert.equal(state.sent,true);
  assert.ok(restoreAdventure(state));assert.equal(finishAdventure(state),false);
  state.stage='lake';assert.equal(finishAdventure(state),false,'free sailing does not repeat transmission');
});
