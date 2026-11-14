import test from 'node:test';
import assert from 'node:assert/strict';
import {mission,worlds,sites,totals,problem,landingReport,collect} from '../src/mission3d.js';

for(const world of Object.keys(worlds)){
  test(world+' supports a complete engineering expedition',()=>{
    const m={...mission(true),world};
    assert.equal(problem(m),'');
    assert.ok(landingReport(m,world!=='Moon',world!=='Titan').safe);
    m.stage='explore';
    m.energy=totals(m).capacity;
    assert.equal(collect(m,0),false);
    sites.forEach(([x,z],i)=>{
      Object.assign(m,{x,z});
      assert.ok(collect(m,i));
      assert.equal(collect(m,i),false);
    });
    assert.equal(m.data,450);
    assert.equal(m.hours,1.25);
  });
}
test('destination affects solar feasibility and available landing systems',()=>{
  const m=mission();
  m.design.Power='solar';
  assert.match(problem(m),/sunlight/);
  m.world='Moon';
  assert.equal(problem(m),'');
  assert.equal(landingReport(m,true,false).safe,false);
});
