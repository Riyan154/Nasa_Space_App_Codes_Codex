using System.Collections;
using UnityEngine;
namespace Titan {
    public class FlightController : MonoBehaviour {
        GameManager game;bool descending;
        public void Initialize(GameManager owner)=>game=owner;
        void Update(){if(game.Paused)return;var m=game.Mission;float dt=Mathf.Min(Time.deltaTime,.05f);
            if(game.Screen==Stage.Land){var steer=new Vector2(Input.GetAxisRaw("Horizontal"),Input.GetAxisRaw("Vertical"))+game.Touch;m.x=Mathf.Clamp(m.x+steer.x*dt*3,-6,6);m.z=Mathf.Clamp(m.z+steer.y*dt*3,-6,6);}
            if(game.Screen==Stage.Launch&&(game.Held||Input.GetKey(KeyCode.Space))){game.Progress=Mathf.Min(1,game.Progress+dt/6);m.feedback="Launch countdown: "+Mathf.CeilToInt((1-game.Progress)*6);if(game.Progress>=1){m.x=0;m.z=4;game.Go(Stage.Travel);}}
            if(game.Screen!=Stage.Travel)return;
            var input=new Vector2(Input.GetAxisRaw("Horizontal"),Input.GetAxisRaw("Vertical"))+game.Touch;
            m.x=Mathf.Clamp(m.x+input.x*dt*5,-9,9);m.z=Mathf.Clamp(m.z+input.y*dt*5,1,11);game.View.craft.position=new Vector3(m.x,m.z,0);
            if(!(game.Held||Input.GetKey(KeyCode.Space)))return;
            var ring=game.View.ring;if(!ring)return;ring.position-=Vector3.forward*dt*10;
            if(ring.position.z>0)return;
            if(Vector2.Distance(new Vector2(ring.position.x,ring.position.y),new Vector2(m.x,m.z))<2.8f){m.rings++;game.Audio.Beep(600+m.rings*120);game.View.Burst(game.View.craft.position);m.feedback=$"Ring {m.rings} of 3!";game.Persist();if(m.rings==3){FlightPhysics.BeginDescent(m);game.Go(Stage.Land);m.feedback=m.destination=="moon"?"Orbital insertion complete. Enable retro-rockets for descent.":"Upper-atmosphere transfer complete. Choose when to advance; decisions pause descent.";return;}}
            else {m.feedback="Nearly! Line up with the next ring; take your time.";m.course=Mathf.Max(.5f,m.course-.1f);}game.View.NextRing();
        }
        public void Descend(){if(descending||game.Screen!=Stage.Land)return;StartCoroutine(Advance());}
        IEnumerator Advance(){
            descending=true;var m=game.Mission;var d=game.Data.World(m.destination);float mass=MissionEngine.Resources(m,game.Data).mass;
            bool entry=m.altitude>20000;float target=entry?12000:m.altitude>120?100:0;
            // Descent is explicitly advanced by the player. A bundled autopilot throttles retro engines;
            // enabling them is a player decision, and propellant consumption remains simulated.
            if(!m.advanced){if(d.id!="titan")m.retro=true;}
            int iterations=0;
            while(m.altitude>target&&!m.failed&&iterations<150000){
                if(game.Screen!=Stage.Land)break;
                if(game.Paused){yield return null;continue;}
                for(int i=0;i<250&&m.altitude>target&&iterations<150000;i++,iterations++){
                    FlightPhysics.Step(m,d,mass,.1f,!m.advanced);
                }
                yield return null;
            }
            descending=false;
            if(game.Screen!=Stage.Land)yield break;
            if(m.altitude==0){bool missed=new Vector2(m.x,m.z).magnitude>3;if(missed&&m.advanced){m.failed=true;m.landed=false;m.integrity=0;}if(m.failed){m.feedback=missed?"You missed the landing zone. Steer Pip over the teal ring before advancing to touchdown.":d.id=="moon"?"No atmosphere means no aerodynamic braking. Enable retro-rockets before descent.":"Touchdown was too fast. Deploy your parachute after entry; Mars also needs retro-rockets.";m.score=MissionEngine.Score(m,game.Data);m.stage=Stage.Results;SaveSystem.Archive(game.Save);game.Go(Stage.Results);}else {m.x=m.z=0;game.Audio.Beep(260,.4f);game.Go(Stage.Explore);game.View.Burst(game.View.craft.position);}}
            else {m.feedback=entry?"Entry complete. Deploy a parachute now if pressure is safe; then advance again.":"Descent paused. Check your landing equipment, then advance to touchdown.";game.Persist();game.UI.Rebuild();}
        }
    }
}
