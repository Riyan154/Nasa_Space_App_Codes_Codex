using UnityEngine;
namespace Titan {
    // The menu uses the saved mission. Other generated scenes are isolated development entry points.
    public class SceneEntry:MonoBehaviour {
        public Stage initialStage=Stage.Title;public string destination="titan";
        void Start(){if(initialStage==Stage.Title)return;var game=FindObjectOfType<GameManager>();game.New(false);game.Mission.destination=destination;game.Mission.battery=MissionEngine.Resources(game.Mission,game.Data).battery;game.Go(initialStage);}
    }
}
