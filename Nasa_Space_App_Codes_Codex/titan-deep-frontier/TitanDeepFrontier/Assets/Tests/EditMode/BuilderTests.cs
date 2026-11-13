using System;
using System.Linq;
using NUnit.Framework;
namespace Titan.Tests {
    public class BuilderTests {
        Catalog c;Mission m;
        [SetUp] public void Setup(){c=Catalog.Create();m=new Mission();}
        [TearDown] public void Cleanup()=>UnityEngine.Object.DestroyImmediate(c);
        [Test] public void ExactCatalogueShape(){Assert.AreEqual(16,c.parts.Length);foreach(Category category in Enum.GetValues(typeof(Category)))Assert.AreEqual(4,c.parts.Count(p=>p.category==category));Assert.AreEqual(3,c.destinations.Length);Assert.IsTrue(c.destinations.All(d=>d.facts.Length==5));Assert.AreEqual(16,c.parts.Select(p=>p.id).Distinct().Count());}
        [Test] public void BudgetRejectionRestoresEntireDesign(){string before=UnityEngine.JsonUtility.ToJson(m.design);Assert.IsFalse(MissionEngine.Select(m,c,"horizon"));Assert.AreEqual(before,UnityEngine.JsonUtility.ToJson(m.design));}
        [Test] public void ScienceCanBeToggledIndependently(){Assert.IsTrue(MissionEngine.Select(m,c,"radar"));Assert.AreEqual(4,m.design.science.Count);Assert.IsTrue(MissionEngine.Select(m,c,"camera"));Assert.IsTrue(m.design.science.Contains("radar"));Assert.IsFalse(m.design.science.Contains("camera"));}
        [Test] public void ValidationCatchesMissingPowerAndScience(){m.design.power="missing";m.design.science.Clear();var errors=MissionEngine.Validate(m,c);Assert.IsTrue(errors.Any(e=>e.Contains("power source")));Assert.IsTrue(errors.Any(e=>e.Contains("science instrument")));}
        [Test] public void OverweightDesignRejected(){m.design.power="reactor";m.design.radio="array";m.design.science.Add("radar");c.Get("atlas").capacity=1200;Assert.IsTrue(MissionEngine.Validate(m,c).Any(e=>e.Contains("Too heavy")));}
        [Test] public void TitanSolarFailsButMarsSolarWorks(){m.design.power="solar";Assert.IsNotEmpty(MissionEngine.Validate(m,c));m.destination="mars";Assert.IsEmpty(MissionEngine.Validate(m,c));}
        [Test] public void TitanHazeReducesOpticalRate(){m.design.radio="laser";Assert.AreEqual(50,MissionEngine.Resources(m,c).rate);m.destination="moon";Assert.AreEqual(250,MissionEngine.Resources(m,c).rate);}
    }
}
