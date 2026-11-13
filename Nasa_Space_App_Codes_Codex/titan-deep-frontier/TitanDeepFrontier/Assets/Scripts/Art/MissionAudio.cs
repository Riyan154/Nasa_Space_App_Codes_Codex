using UnityEngine;
namespace Titan {
    public class MissionAudio:MonoBehaviour {
        GameManager game;AudioSource music,effects;AudioClip ambience;
        public void Initialize(GameManager owner){game=owner;music=gameObject.AddComponent<AudioSource>();effects=gameObject.AddComponent<AudioSource>();
            const int rate=22050,length=rate*8;var samples=new float[length];for(int i=0;i<length;i++){float t=i/(float)rate;float envelope=Mathf.Sin(Mathf.PI*i/length);samples[i]=envelope*.035f*(Mathf.Sin(2*Mathf.PI*110*t)+.5f*Mathf.Sin(2*Mathf.PI*165*t)+.3f*Mathf.Sin(2*Mathf.PI*220*t));}
            ambience=AudioClip.Create("Procedural space ambience",length,1,rate,false);ambience.SetData(samples,0);music.clip=ambience;music.loop=true;music.Play();}
        public void Beep(float frequency,float duration=.12f){if(!game.Save.preferences.sound)return;int count=Mathf.CeilToInt(22050*duration);var samples=new float[count];for(int i=0;i<count;i++)samples[i]=Mathf.Sin(i*frequency*Mathf.PI*2/22050)*.13f*Mathf.Sin(Mathf.PI*i/count);var clip=AudioClip.Create("Procedural mission sound",count,1,22050,false);clip.SetData(samples,0);effects.PlayOneShot(clip);Destroy(clip,duration+1);}
        void Update(){music.mute=effects.mute=!game.Save.preferences.sound;}
        void OnDestroy(){if(ambience)Destroy(ambience);}
    }
}
