using System.Collections;
using UnityEngine;
namespace Titan {
    public class ExplorerController:MonoBehaviour {
        GameManager game;Vector3? target;float saveTimer;public bool Collecting {get;private set;}
        public void Initialize(GameManager owner)=>game=owner;
        public void ClearTarget()=>target=null;
        public void GuideTo(int index){if(index<0||index>=5)return;if(game.Mission.found.Contains(index)){var fact=game.Data.World(game.Mission.destination).facts[index];game.UI.Dialog(fact.title,fact.text+"\n\nReal reference fact · Pip's collection is pretend play, not a measurement.",fact.source);return;}target=WorldView.Sites[index];game.Mission.feedback="Pip is following your map marker. Move manually to cancel.";}
        void Update(){if(game.Paused||Collecting||game.Screen!=Stage.Explore)return;var m=game.Mission;
            var input=new Vector3(Input.GetAxisRaw("Horizontal")+game.Touch.x,0,Input.GetAxisRaw("Vertical")+game.Touch.y);
            var pos=new Vector3(m.x,0,m.z);if(input.sqrMagnitude>.01f)target=null;
            if(target.HasValue){input=target.Value-pos;if(input.magnitude<.4f){target=null;input=Vector3.zero;}}
            input=Vector3.ClampMagnitude(input,1);pos+=input*Mathf.Min(Time.deltaTime,.05f)*8;m.x=Mathf.Clamp(pos.x,-35,35);m.z=Mathf.Clamp(pos.z,-5,80);
            if(input.sqrMagnitude>.01f)game.View.craft.rotation=Quaternion.Slerp(game.View.craft.rotation,Quaternion.LookRotation(input),Time.deltaTime*6);
            saveTimer+=Time.deltaTime;if(saveTimer>=5){saveTimer=0;game.Persist();}
        }
        public void Collect(){if(Collecting)return;var m=game.Mission;int index=-1;for(int i=0;i<5;i++)if(Vector3.Distance(new Vector3(m.x,0,m.z),WorldView.Sites[i])<=3&&!m.found.Contains(i)){index=i;break;}
            if(index<0){m.feedback="Get close to a gold ring first. Tap a location on the map to guide Pip there.";return;}
            if(!MissionEngine.Discover(m,game.Data,index))return;
            var fact=game.Data.World(m.destination).facts[index];game.Audio.Beep(1040,.4f);game.View.Rebuild();game.View.Burst(WorldView.Sites[index]);game.Persist();game.UI.Rebuild();StartCoroutine(Reveal(m,fact));
        }
        IEnumerator Reveal(Mission mission,Fact fact){Collecting=true;if(!game.Save.preferences.reducedMotion)yield return new WaitForSeconds(.8f);Collecting=false;if(game.Mission==mission&&game.Screen==Stage.Explore&&!game.Paused)game.UI.Dialog(fact.title,fact.text+"\n\nReal reference fact · Pip's collection is pretend play, not a measurement.",fact.source);}
    }
}
