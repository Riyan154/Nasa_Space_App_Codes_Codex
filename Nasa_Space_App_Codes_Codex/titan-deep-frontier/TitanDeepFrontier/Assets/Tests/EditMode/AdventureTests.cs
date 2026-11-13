using NUnit.Framework;
namespace Titan.Tests {
    public class AdventureTests {
        Catalog c;Mission m;
        [SetUp] public void Setup(){c=Catalog.Create();m=new Mission{stage=Stage.Explore,battery=550};}
        [TearDown] public void Cleanup()=>UnityEngine.Object.DestroyImmediate(c);
        [Test] public void CollectOnceAndOnlyDuringExploration(){Assert.IsTrue(MissionEngine.Discover(m,c,0));float data=m.data;Assert.IsFalse(MissionEngine.Discover(m,c,0));Assert.AreEqual(data,m.data);m.stage=Stage.Build;Assert.IsFalse(MissionEngine.Discover(m,c,1));}
        [Test] public void TransmissionRequiresFiveDiscoveries(){m.stage=Stage.Transmit;Assert.IsFalse(MissionEngine.Transmit(m,c));Assert.IsFalse(m.transmitted);}
        [TestCase("titan")] [TestCase("mars")] [TestCase("moon")]
        public void BothModesFinishWithFiveDiscoveries(string world){foreach(bool advanced in new[]{false,true}){m=new Mission{destination=world,advanced=advanced,stage=Stage.Explore,battery=550};for(int i=0;i<5;i++)Assert.IsTrue(MissionEngine.Discover(m,c,i));m.stage=Stage.Transmit;Assert.IsTrue(MissionEngine.Transmit(m,c));Assert.AreEqual(Stage.Results,m.stage);Assert.AreEqual(m.data,m.sent);Assert.IsFalse(MissionEngine.Transmit(m,c));}}
    }
}
