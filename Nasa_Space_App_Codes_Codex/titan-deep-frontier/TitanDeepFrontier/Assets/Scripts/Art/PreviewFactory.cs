using System.Collections.Generic;
using UnityEngine;
namespace Titan {
    public class PreviewFactory:MonoBehaviour {
        readonly Dictionary<string,Texture2D> cache=new Dictionary<string,Texture2D>();
        public Texture2D Get(string id,bool destination=false){string key=id+destination;if(cache.TryGetValue(key,out var texture))return texture;
            var root=new GameObject("Card diorama").transform;root.position=new Vector3(1000,1000,1000);
            if(destination){SpacecraftAssembly.Shape(root,"Planet",PrimitiveType.Sphere,Vector3.zero,Vector3.one*3,id=="titan"?"#d6a26b":id=="mars"?"#9a684e":"#a6b7ad");if(id=="titan")SpacecraftAssembly.Ring(root,"Saturn motif",Vector3.zero,2.3f,"#ddb66c").rotation=Quaternion.Euler(60,0,15);else for(int i=0;i<7;i++)SpacecraftAssembly.Cone(root,"Surface",new Vector3(Mathf.Sin(i)*1.3f,.5f,Mathf.Cos(i)*1.3f),.4f,.5f,id=="mars"?"#d6a26b":"#777b73");}
            else SpacecraftAssembly.PartModel(root,id);
            foreach(var tr in root.GetComponentsInChildren<Transform>())tr.gameObject.layer=30;
            var go=new GameObject("Card camera");var camera=go.AddComponent<Camera>();camera.cullingMask=1<<30;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.06f,.12f,.17f);camera.orthographic=true;bool rocket=id=="atlas"||id=="titan"||id=="deep"||id=="horizon";camera.orthographicSize=rocket?3.5f:2.3f;var aim=root.position+Vector3.up*(rocket?2.4f:0);camera.transform.position=aim+new Vector3(6,3,-9);camera.transform.LookAt(aim);
            var rt=RenderTexture.GetTemporary(320,180,24);camera.targetTexture=rt;camera.Render();var previous=RenderTexture.active;RenderTexture.active=rt;texture=new Texture2D(320,180,TextureFormat.RGB24,false);texture.ReadPixels(new Rect(0,0,320,180),0,0);texture.Apply();RenderTexture.active=previous;camera.targetTexture=null;RenderTexture.ReleaseTemporary(rt);root.gameObject.SetActive(false);Destroy(root.gameObject);Destroy(go);cache[key]=texture;return texture;
        }
        void OnDestroy(){foreach(var value in cache.Values)if(value)Destroy(value);}
    }
}
