import test from 'node:test';
import assert from 'node:assert/strict';
import { newMission,beginFlight,advanceFlight,collectScience,transmit,finishMission } from '../src/engine.js';
import { loadMission,saveMission,read,archiveMission } from '../src/storage.js';
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
test('build and in-flight saves survive round-trip and archive deduplicates',()=>{
  values.clear();const m=newMission();assert.equal(saveMission(m),true);assert.deepEqual(loadMission(),m);
  beginFlight(m);m.stage='flight';advanceFlight(m,'correct');saveMission(m);assert.deepEqual(loadMission(),m);
  for(const choice of ['sleep','gentle','safe','stabilize'])advanceFlight(m,choice);
  collectScience(m,'spectrometer');collectScience(m,'temperature');transmit(m);finishMission(m);saveMission(m);
  assert.deepEqual(loadMission(),m);archiveMission(m);archiveMission(m);assert.equal(read('titan.archive.v1',[]).length,1);
});
test('invalid JSON, unsupported version and invalid hardware are ignored safely',()=>{
  for(const value of ['{oops',JSON.stringify({version:99}),JSON.stringify({...newMission(),design:{rocket:'missing'}})]){
    values.set('titan.mission.v1',value);assert.equal(loadMission(),null);
  }
});
test('unavailable browser storage never throws',()=>{
  const old=globalThis.localStorage;globalThis.localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.equal(saveMission(newMission()),false);assert.equal(loadMission(),null);assert.deepEqual(read('anything',[]),[]);globalThis.localStorage=old;
});
