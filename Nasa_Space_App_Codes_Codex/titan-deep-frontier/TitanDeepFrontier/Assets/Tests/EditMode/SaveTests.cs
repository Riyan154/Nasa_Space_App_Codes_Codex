using NUnit.Framework;
namespace Titan.Tests {
    public class SaveTests {
        Catalog c;
        [SetUp] public void Setup()=>c=Catalog.Create();
        [TearDown] public void Cleanup()=>UnityEngine.Object.DestroyImmediate(c);
        [Test] public void RoundTripKeepsDesignSettingsAndProgress(){var state=new SaveData{mission=new Mission{stage=Stage.Explore,destination="mars",battery=123,x=7}};state.preferences.reducedMotion=true;state.mission.found.Add(1);var loaded=SaveSystem.Decode(SaveSystem.Encode(state),c);Assert.AreEqual(123,loaded.mission.battery);Assert.AreEqual("mars",loaded.mission.destination);Assert.AreEqual(7,loaded.mission.x);Assert.Contains(1,loaded.mission.found);Assert.IsTrue(loaded.preferences.reducedMotion);}
        [Test] public void CorruptOrFutureSavesFallBack(){Assert.IsNull(SaveSystem.Decode("broken",c).mission);Assert.IsNull(SaveSystem.Decode("{\"version\":42}",c).mission);}
        [Test] public void InvalidPartAndDuplicateDiscoveriesRejected(){var state=new SaveData{mission=new Mission()};state.mission.design.power="invalid";Assert.IsNull(SaveSystem.Decode(SaveSystem.Encode(state),c).mission);state.mission=new Mission();state.mission.found.Add(0);state.mission.found.Add(0);Assert.IsNull(SaveSystem.Decode(SaveSystem.Encode(state),c).mission);}
        [Test] public void ReportHistoryIsBoundedAndIdempotent(){var state=new SaveData();for(int i=0;i<25;i++){state.mission=new Mission{stage=Stage.Results};SaveSystem.Archive(state);}Assert.AreEqual(20,state.reports.Count);SaveSystem.Archive(state);Assert.AreEqual(20,state.reports.Count);}
        [Test] public void PreviewURLsAreRestricted(){Assert.IsTrue(NASAUrl.SafePreview("https://images-assets.nasa.gov/image/example.jpg"));Assert.IsFalse(NASAUrl.SafePreview("http://images-assets.nasa.gov/example"));Assert.IsFalse(NASAUrl.SafePreview("https://images-assets.nasa.gov.example.org/image"));Assert.IsFalse(NASAUrl.SafePreview("https://user@images-assets.nasa.gov/image"));}
    }
}
