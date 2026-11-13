using UnityEngine;
using UnityEngine.UI;
namespace Titan {
    public class ExplorationMap:MonoBehaviour {
        GameManager game;RectTransform pip;readonly Image[] sites=new Image[5];
        public void Initialize(GameManager owner){game=owner;gameObject.AddComponent<LayoutElement>().preferredHeight=170;gameObject.AddComponent<Image>().color=new Color(.04f,.13f,.18f);for(int i=0;i<5;i++){int index=i;var marker=new GameObject("Map discovery "+(i+1),typeof(RectTransform),typeof(Image),typeof(Button));marker.transform.SetParent(transform,false);sites[i]=marker.GetComponent<Image>();var r=marker.GetComponent<RectTransform>();r.anchorMin=r.anchorMax=Point(WorldView.Sites[i].x,WorldView.Sites[i].z);r.sizeDelta=Vector2.one*28;r.anchoredPosition=Vector2.zero;marker.GetComponent<Button>().onClick.AddListener(()=>game.GuideTo(index));}var player=new GameObject("Pip map position",typeof(RectTransform),typeof(Image));player.transform.SetParent(transform,false);player.GetComponent<Image>().color=Color.white;player.GetComponent<Image>().raycastTarget=false;pip=player.GetComponent<RectTransform>();pip.sizeDelta=Vector2.one*12;}
        Vector2 Point(float x,float z)=>new Vector2(.1f+(x+35)/70*.8f,.1f+z/80*.8f);
        void Update(){pip.anchorMin=pip.anchorMax=Point(game.Mission.x,game.Mission.z);pip.anchoredPosition=Vector2.zero;for(int i=0;i<5;i++)sites[i].color=game.Mission.found.Contains(i)?new Color(.43f,.72f,.73f):new Color(.87f,.71f,.42f);}
    }
}
