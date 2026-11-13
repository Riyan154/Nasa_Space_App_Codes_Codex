using System.Linq;
using UnityEngine;
namespace Titan {
    public class GameManager : MonoBehaviour {
        public Catalog Data; public SaveData Save; public Mission Mission {get;private set;}
        public Stage Screen {get;private set;} public Category Category=Category.Rockets;
        public WorldView View; public ScreenManager UI; public MissionAudio Audio; public NASAService Nasa;
        public FlightController Flight; public ExplorerController Explorer;
        public bool Paused,Held; public Vector2 Touch; public float Progress;
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot(){if(!FindObjectOfType<GameManager>())new GameObject("Titan Game").AddComponent<GameManager>();}
        void Awake(){
            if(FindObjectsOfType<GameManager>().Length>1){Destroy(gameObject);return;}
            gameObject.name="Titan Game";Data=UnityEngine.Resources.Load<Catalog>("Catalog");if(!Data)Data=Catalog.Create();Data.ResolveAssets();
            Save=SaveSystem.Load(Data);Mission=Save.mission??new Mission();Screen=Stage.Title;
            Audio=gameObject.AddComponent<MissionAudio>();Audio.Initialize(this);
            Nasa=gameObject.AddComponent<NASAService>();View=gameObject.AddComponent<WorldView>();View.Initialize(this);
            Flight=gameObject.AddComponent<FlightController>();Flight.Initialize(this);
            Explorer=gameObject.AddComponent<ExplorerController>();Explorer.Initialize(this);
            UI=gameObject.AddComponent<ScreenManager>();UI.Initialize(this);View.Rebuild();UI.Rebuild();AccessibilityBridge.Initialize();
        }
        public void New(bool advanced){Mission=new Mission{advanced=advanced,stage=Stage.Destination};Save.mission=Mission;Progress=0;Category=Category.Rockets;Go(Stage.Destination);}
        public void Continue(){if(Save.mission==null)return;Mission=Save.mission;Progress=0;Go(Mission.stage);}
        public void Go(Stage next){
            if(next==Stage.Transmit&&Mission.found.Count!=5)return;
            Held=false;Touch=Vector2.zero;Paused=false;Explorer.ClearTarget();Screen=next;
            if(next!=Stage.Title){Mission.stage=next;Save.mission=Mission;Persist();}
            Mission.feedback=next==Stage.Build?"Pick a rocket, then give Pip power, tools and a radio.":next==Stage.Travel?"Hold Space to fly. Steer into a glowing ring.":next==Stage.Explore?"Move to a gold marker. Press E to discover.":next==Stage.Launch?"Hold Space to launch. Release whenever you want to pause.":Mission.feedback;
            View.Rebuild();UI.Rebuild();
        }
        public void ChangeCategory(int offset){Category=(Category)(((int)Category+offset+4)%4);View.Rebuild();UI.Rebuild();}
        public void Select(string id){if(MissionEngine.Select(Mission,Data,id)){Audio.Beep(660);View.Rebuild();View.Burst(View.craft.position);Persist();}UI.Rebuild();}
        public void BeginLaunch(){if(MissionEngine.Validate(Mission,Data).Count!=0)return;Mission.battery=MissionEngine.Resources(Mission,Data).battery;Mission.fuel=95;Progress=0;Go(Stage.Launch);Audio.Beep(100,1);}
        public void CorrectCourse(){if(Mission.fuel<5){Mission.feedback="Save at least 5 kg of fuel for a correction.";return;}Mission.fuel-=5;Mission.course=1;Mission.feedback="Course stabilized. Five kilograms of propellant used.";Persist();}
        public void Recharge(){var r=MissionEngine.Resources(Mission,Data);float net=r.generation-r.baseline;if(net<=0){Mission.feedback="This power system cannot recharge while essential systems run. Refine the design.";return;}float hours=(r.battery-Mission.battery)/net;MissionEngine.SpendTime(Mission,Data,hours);Mission.feedback=hours>.01f?$"Coasted {hours:F1} mission hours. Battery full.":"Battery already full. Ready to explore.";Persist();}
        public void Descend()=>Flight.Descend();
        public void Collect()=>Explorer.Collect();
        public void GuideTo(int index)=>Explorer.GuideTo(index);
        public void Transmit(){if(!MissionEngine.Transmit(Mission,Data))return;Audio.Beep(880,.6f);Save.mission=Mission;SaveSystem.Archive(Save);Go(Stage.Results);}
        public void Refine(){var design=Mission.design.Copy();var old=Mission;Mission=new Mission{design=design,advanced=old.advanced,difficulty=old.difficulty,destination=old.destination};Save.mission=Mission;Go(Stage.Build);}
        public void Persist(){if(!SaveSystem.Save(Save))Mission.feedback="Storage is unavailable. This mission will last for this session only.";}
        public void AccessibleActivate(string index){if(int.TryParse(index,out int i))UI.Activate(i);}
        public void SystemReducedMotion(string value){if(value!="true")return;Save.preferences.reducedMotion=true;View.Rebuild();Persist();}
        void Update(){if(Paused)return;if(Input.GetKeyDown(KeyCode.Escape)){Held=false;Touch=Vector2.zero;UI.PauseMenu();}if(Input.GetKeyDown(KeyCode.E)&&Screen==Stage.Explore)Collect();}
        void LateUpdate(){Time.timeScale=Paused?0:1;}
        void OnApplicationPause(bool pause){if(pause){Held=false;Touch=Vector2.zero;Persist();}}
        void OnApplicationFocus(bool focus){if(!focus){Held=false;Touch=Vector2.zero;Persist();}}
        void OnApplicationQuit()=>Persist();
    }
}
