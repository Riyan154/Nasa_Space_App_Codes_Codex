using UnityEngine;
using UnityEngine.UI;
namespace Titan {
    public class ResourceHUD:MonoBehaviour {
        readonly Image[] fill=new Image[3];readonly Text[] labels=new Text[3];GameManager game;
        public void Initialize(GameManager owner,Font font){game=owner;var row=gameObject.AddComponent<HorizontalLayoutGroup>();row.spacing=18;gameObject.AddComponent<LayoutElement>().preferredHeight=42;
            for(int i=0;i<3;i++){var cell=new GameObject("Resource meter",typeof(RectTransform),typeof(Image));cell.transform.SetParent(transform,false);cell.GetComponent<Image>().color=new Color(.12f,.18f,.22f);var bar=new GameObject("Fill",typeof(RectTransform),typeof(Image));bar.transform.SetParent(cell.transform,false);fill[i]=bar.GetComponent<Image>();var r=bar.GetComponent<RectTransform>();r.anchorMin=Vector2.zero;r.anchorMax=Vector2.one;r.offsetMin=r.offsetMax=Vector2.zero;var text=new GameObject("Value",typeof(RectTransform),typeof(Text));text.transform.SetParent(cell.transform,false);labels[i]=text.GetComponent<Text>();labels[i].font=font;labels[i].fontSize=17;labels[i].alignment=TextAnchor.MiddleCenter;labels[i].color=Color.white;var tr=text.GetComponent<RectTransform>();tr.anchorMin=Vector2.zero;tr.anchorMax=Vector2.one;tr.offsetMin=tr.offsetMax=Vector2.zero;}
        }
        void Update(){if(!game)return;var r=MissionEngine.Resources(game.Mission,game.Data);float[] ratio={r.mass/Mathf.Max(1,r.capacity),r.cost/r.budget,r.demand/Mathf.Max(1,r.generation)};string[] values={$"MASS {r.mass:0} / {r.capacity:0} kg",$"BUDGET {r.cost:0} / {r.budget:0} MC",$"POWER {r.generation:0} W in / {r.demand:0} W demand"};for(int i=0;i<3;i++){fill[i].rectTransform.anchorMax=new Vector2(Mathf.Clamp01(ratio[i]),1);bool warn=ratio[i]>1;fill[i].color=warn?new Color(.6f,.26f,.12f):game.Save.preferences.colorBlind?new Color(.2f,.36f,.65f):new Color(.12f,.38f,.35f);labels[i].text=(warn?"! ":"✓ ")+values[i];}}
    }
}
