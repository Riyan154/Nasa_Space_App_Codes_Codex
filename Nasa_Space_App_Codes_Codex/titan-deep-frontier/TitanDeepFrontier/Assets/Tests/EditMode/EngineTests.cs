using System.Linq;
using NUnit.Framework;
using UnityEngine;
namespace Titan.Tests {
    public class EngineTests {
        Catalog c;Mission m;
        [SetUp] public void Setup(){c=Catalog.Create();m=new Mission();m.battery=550;}
        [TearDown] public void Cleanup()=>Object.DestroyImmediate(c);
        [Test] public void DefaultResourceSums(){var r=MissionEngine.Resources(m,c);Assert.AreEqual(1150,r.mass);Assert.AreEqual(88000,r.cost);Assert.AreEqual(110,r.generation);Assert.AreEqual(127,r.demand);Assert.AreEqual(52,r.baseline);Assert.AreEqual(1500,r.capacity);Assert.IsEmpty(MissionEngine.Validate(m,c));}
        [TestCase(100,50,100,2,500,0)] [TestCase(100,150,50,2,250,250)]
        public void EnergyClamps(float stored,float gen,float draw,float hours,float capacity,float expected)=>Assert.AreEqual(expected,MissionEngine.Energy(stored,gen,draw,hours,capacity));
        [Test] public void DragUsesSIUnits(){Assert.AreEqual(120,MissionEngine.Drag(1.2f,10,1,2),.001f);Assert.AreEqual(0,MissionEngine.Drag(0,3600,1,12));}
        [Test] public void HeatingGrowsCubically()=>Assert.AreEqual(8,MissionEngine.Heating(1,200)/MissionEngine.Heating(1,100),.001f);
        [Test] public void FloatReserveIsTwelvePercent(){Assert.IsTrue(MissionEngine.Floats(422.4f,1,480));Assert.IsFalse(MissionEngine.Floats(423,1,480));Assert.AreEqual(648,MissionEngine.Buoyancy(480,1.35f,1),.01f);}
        [Test] public void ThermalModelPreservesZeroTimeAndCoolsWithoutHeater(){Assert.AreEqual(280,MissionEngine.Temperature(280,94,0,.94f,0),.001f);Assert.Less(MissionEngine.Temperature(280,94,1,.94f,0),280);}
        [Test] public void RejectsEnergyOverdraftWithoutMutation(){m.design.power="solar";m.battery=0;Assert.IsFalse(MissionEngine.SpendTime(m,c,1,50));Assert.AreEqual(0,m.hours);Assert.AreEqual(0,m.battery);}
        [Test] public void ScoreHasExplicitComponents(){m.found=Enumerable.Range(0,5).ToList();m.sciencePoints=150;m.transmitted=true;Assert.AreEqual(92,MissionEngine.Score(m,c));}
        [TestCase("titan")] [TestCase("mars")] [TestCase("moon")]
        public void AssistedLandingReachesSafeTouchdown(string destination){m.destination=destination;FlightPhysics.BeginDescent(m);for(int i=0;i<160000&&m.altitude>0;i++)FlightPhysics.Step(m,c.World(destination),MissionEngine.Resources(m,c).mass,.1f,true);Assert.AreEqual(0,m.altitude);Assert.IsTrue(m.landed);Assert.IsFalse(m.failed);Assert.Greater(m.fuel,0);}
        [Test] public void MoonWithoutRetroCrashes(){m.destination="moon";FlightPhysics.BeginDescent(m);for(int i=0;i<3000&&m.altitude>0;i++)FlightPhysics.Step(m,c.World("moon"),1090,.1f,false);Assert.IsTrue(m.failed);Assert.IsFalse(m.landed);}
        [Test] public void MoonRejectsParachute(){Assert.IsFalse(MissionEngine.Deploy(m,c.World("moon")));Assert.IsFalse(m.chute);}
        [Test] public void HighPressureRejectsParachute(){m.altitude=1000;m.speed=1000;Assert.IsFalse(MissionEngine.Deploy(m,c.World("titan")));Assert.IsFalse(m.chute);}
        [Test] public void UnstableAttitudeIncreasesHeating(){var stable=new Mission{altitude=30000,speed=1000,course=1};var unstable=new Mission{altitude=30000,speed=1000,course=.5f};MissionEngine.EntryStep(stable,c.World("titan"),1150,.1f);MissionEngine.EntryStep(unstable,c.World("titan"),1150,.1f);Assert.Greater(unstable.heat,stable.heat);}
        [TestCase("titan")] [TestCase("mars")] [TestCase("moon")]
        public void AdvancedLandingWorksWithPlayerChoices(string destination){m.destination=destination;m.advanced=true;FlightPhysics.BeginDescent(m);var d=c.World(destination);float mass=MissionEngine.Resources(m,c).mass;if(destination!="moon"){for(int i=0;i<50000&&m.altitude>12000;i++)FlightPhysics.Step(m,d,mass,.1f,false);Assert.IsTrue(MissionEngine.Deploy(m,d));}if(destination!="titan")m.retro=true;for(int i=0;i<160000&&m.altitude>0;i++)FlightPhysics.Step(m,d,mass,.1f,false);Assert.IsTrue(m.landed);Assert.IsFalse(m.failed);}
    }
}
