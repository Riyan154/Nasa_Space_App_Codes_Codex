using System.Collections.Generic;
using UnityEngine;
namespace Titan {
    // All geometry is authored procedurally; no external models or textures.
    public static class SpacecraftAssembly {
        static readonly Dictionary<string,Material> Materials=new Dictionary<string,Material>();
        public static Material Mat(string hex) {
            if(Materials.TryGetValue(hex,out var m)&&m)return m;
            ColorUtility.TryParseHtmlString(hex,out var color);
            m=new Material(Shader.Find("Titan/Toon"));m.color=color;Materials[hex]=m;return m;
        }
        public static Transform Shape(Transform parent,string name,PrimitiveType type,Vector3 p,Vector3 scale,string color) {
            var go=GameObject.CreatePrimitive(type);go.name=name;go.transform.SetParent(parent,false);go.transform.localPosition=p;go.transform.localScale=scale;go.GetComponent<Renderer>().sharedMaterial=Mat(color);
            var collider=go.GetComponent<Collider>();if(Application.isPlaying)Object.Destroy(collider);else Object.DestroyImmediate(collider);return go.transform;
        }
        static Transform Group(Transform parent,string name){var g=new GameObject(name).transform;g.SetParent(parent,false);return g;}
        public static Transform Cone(Transform parent,string name,Vector3 pos,float radius,float height,string color) {
            var tr=Group(parent,name);tr.localPosition=pos;var mesh=new Mesh();var vertices=new List<Vector3>();var tris=new List<int>();
            for(int i=0;i<12;i++){float a=i*Mathf.PI/6,b=(i+1)*Mathf.PI/6;int n=vertices.Count;vertices.Add(new Vector3(Mathf.Cos(a)*radius,0,Mathf.Sin(a)*radius));vertices.Add(Vector3.up*height);vertices.Add(new Vector3(Mathf.Cos(b)*radius,0,Mathf.Sin(b)*radius));tris.AddRange(new[]{n,n+1,n+2});n=vertices.Count;vertices.Add(Vector3.zero);vertices.Add(new Vector3(Mathf.Cos(a)*radius,0,Mathf.Sin(a)*radius));vertices.Add(new Vector3(Mathf.Cos(b)*radius,0,Mathf.Sin(b)*radius));tris.AddRange(new[]{n,n+1,n+2});}
            mesh.SetVertices(vertices);mesh.SetTriangles(tris,0);mesh.RecalculateNormals();tr.gameObject.AddComponent<MeshFilter>().sharedMesh=mesh;tr.gameObject.AddComponent<MeshRenderer>().sharedMaterial=Mat(color);if(Application.isPlaying)tr.gameObject.AddComponent<OwnedMesh>().mesh=mesh;return tr;
        }
        public static Transform Ring(Transform parent,string name,Vector3 pos,float radius,string color) {
            var ring=Group(parent,name);ring.localPosition=pos;
            for(int i=0;i<40;i++){float a=i*Mathf.PI/20;var p=Shape(ring,"Ring segment",PrimitiveType.Cube,new Vector3(Mathf.Cos(a)*radius,Mathf.Sin(a)*radius,0),new Vector3(.16f,radius*.165f,.16f),color);p.localRotation=Quaternion.Euler(0,0,a*Mathf.Rad2Deg);}
            return ring;
        }
        public static Transform PartModel(Transform parent,string id) {
            var g=Group(parent,id);
            switch(id){
                case "solar":
                    for(int side=-1;side<=1;side+=2){var wing=Group(g,"SolarWing");wing.localPosition=new Vector3(side*.55f,0,0);
                        Shape(wing,"Gold frame",PrimitiveType.Cube,new Vector3(side*.9f,0,0),new Vector3(1.8f,.1f,1.3f),"#ddb66c");
                        for(int x=0;x<6;x++)for(int z=0;z<4;z++)Shape(wing,"Solar cell",PrimitiveType.Cube,new Vector3(side*(.16f+x*.29f),.07f,-.46f+z*.3f),new Vector3(.25f,.025f,.25f),"#305e87");}
                    break;
                case "rtg":case "mmrtg":case "reactor":
                    Shape(g,"Thermal core",PrimitiveType.Cylinder,Vector3.zero,new Vector3(.55f,.6f,.55f),"#d6a26b");
                    int fins=id=="reactor"?12:8;for(int i=0;i<fins;i++){float a=i*Mathf.PI*2/fins;var f=Shape(g,"Cooling vane",PrimitiveType.Cube,new Vector3(Mathf.Cos(a)*.42f,0,Mathf.Sin(a)*.42f),new Vector3(.38f,1.05f,.05f),id=="reactor"?"#6db7bb":"#a6b7ad");f.localRotation=Quaternion.Euler(0,-a*Mathf.Rad2Deg,0);}
                    Shape(g,"Status light",PrimitiveType.Sphere,new Vector3(0,.63f,0),Vector3.one*.17f,"#ddb66c");if(id=="mmrtg")g.localScale=Vector3.one*1.2f;break;
                case "camera":Shape(g,"Camera housing",PrimitiveType.Cube,Vector3.zero,new Vector3(.7f,.5f,.4f),"#ddb66c");var lens=Shape(g,"Lens",PrimitiveType.Cylinder,new Vector3(0,0,.27f),new Vector3(.32f,.15f,.32f),"#6db7bb");lens.localRotation=Quaternion.Euler(90,0,0);break;
                case "spectrometer":Shape(g,"Sample arm",PrimitiveType.Cube,new Vector3(0,.25f,0),new Vector3(.13f,1,.13f),"#d6a26b").localRotation=Quaternion.Euler(0,0,-35);Shape(g,"Sample cup",PrimitiveType.Cylinder,new Vector3(.3f,-.1f,0),new Vector3(.5f,.2f,.5f),"#ddb66c");break;
                case "atmosphere":Shape(g,"Weather mast",PrimitiveType.Cylinder,Vector3.up*.4f,new Vector3(.08f,.7f,.08f),"#a6b7ad");for(int i=0;i<4;i++)Shape(g,"Sensor louvre",PrimitiveType.Cylinder,new Vector3(0,.9f+i*.1f,0),new Vector3(.5f,.02f,.5f),"#f6e8bd");break;
                case "radar":Ring(g,"Radar coil",Vector3.zero,.6f,"#6db7bb").localRotation=Quaternion.Euler(90,0,0);Shape(g,"Radar electronics",PrimitiveType.Cube,Vector3.up*.12f,new Vector3(.7f,.22f,.5f),"#d6a26b");break;
                case "antenna":Shape(g,"Whip",PrimitiveType.Cylinder,Vector3.up*.7f,new Vector3(.05f,.7f,.05f),"#ddb66c");Shape(g,"Tip",PrimitiveType.Sphere,Vector3.up*1.4f,Vector3.one*.12f,"#6db7bb");break;
                case "dish":case "array":
                    Shape(g,"Dish mast",PrimitiveType.Cylinder,Vector3.up*.4f,new Vector3(.1f,.4f,.1f),"#a6b7ad");Cone(g,"Parabolic dish stylization",Vector3.up*.9f,.65f,.3f,"#ddb66c").localRotation=Quaternion.Euler(120,0,0);Shape(g,"Feed",PrimitiveType.Sphere,new Vector3(0,1,.45f),Vector3.one*.12f,"#6db7bb");
                    if(id=="array")for(int s=-1;s<=1;s+=2)Shape(g,"Array",PrimitiveType.Cube,new Vector3(s*.7f,.6f,0),new Vector3(.5f,.7f,.08f),"#6db7bb");break;
                case "laser":Shape(g,"Gimbal",PrimitiveType.Sphere,Vector3.up*.3f,Vector3.one*.6f,"#a6b7ad");Shape(g,"Optical terminal",PrimitiveType.Cube,new Vector3(0,.6f,.15f),new Vector3(.6f,.5f,.8f),"#b1a1da");Shape(g,"Optic",PrimitiveType.Sphere,new Vector3(0,.6f,.57f),new Vector3(.3f,.3f,.05f),"#6db7bb");break;
                default: Rocket(g,id);break;
            }return g;
        }
        static void Rocket(Transform g,string id) {
            int variant=id=="atlas"?0:id=="titan"?1:id=="deep"?2:3;float height=3+variant*.7f;
            Shape(g,"Fuselage",PrimitiveType.Cylinder,Vector3.up*(height*.5f),new Vector3(.9f,height*.5f,.9f),"#f6e8bd");Cone(g,"Nose",Vector3.up*height,.45f,.9f,"#d6a26b");
            for(int i=0;i<3;i++)Shape(g,"Stage band",PrimitiveType.Cylinder,Vector3.up*(.4f+i*height/3),new Vector3(.94f,.09f,.94f),"#6db7bb");
            int boosters=2+variant;for(int i=0;i<boosters;i++){float a=i*Mathf.PI*2/boosters;var b=Group(g,"Booster");b.localPosition=new Vector3(Mathf.Cos(a)*.75f,.15f,Mathf.Sin(a)*.75f);Shape(b,"Booster tank",PrimitiveType.Cylinder,Vector3.up*.9f,new Vector3(.45f,.9f,.45f),"#a6b7ad");Cone(b,"Booster nose",Vector3.up*1.8f,.225f,.5f,"#d6a26b");Cone(b,"Engine",Vector3.zero,.25f,.3f,"#263c43");}
            Cone(g,"Exhaust",Vector3.down*.1f,.4f,2,"#ddb66c").localRotation=Quaternion.Euler(180,0,0);
        }
        public static Transform Pip(Transform parent,Design d,string destination) {
            var g=Group(parent,"Pip");Shape(g,"Body",PrimitiveType.Cube,Vector3.up,new Vector3(1.5f,1.1f,1.1f),"#f6e8bd");Shape(g,"Face",PrimitiveType.Cube,new Vector3(0,1.15f,.57f),new Vector3(1.15f,.5f,.08f),"#173844");
            for(int side=-1;side<=1;side+=2){Shape(g,"Eye",PrimitiveType.Sphere,new Vector3(side*.28f,1.17f,.64f),new Vector3(.18f,.22f,.08f),"#6db7bb");
                if(destination=="titan")Shape(g,"Float",PrimitiveType.Capsule,new Vector3(side*.8f,.25f,0),new Vector3(.45f,1.1f,.45f),"#ddb66c").localRotation=Quaternion.Euler(90,0,0);
                else for(int end=-1;end<=1;end+=2)Shape(g,"Wheel",PrimitiveType.Cylinder,new Vector3(side*.8f,.25f,end*.45f),new Vector3(.48f,.12f,.48f),"#263c43").localRotation=Quaternion.Euler(0,0,90);
            }
            var power=PartModel(g,d.power);power.localPosition=new Vector3(-1.2f,1,0);if(d.power=="solar"){power.localPosition=Vector3.up*.75f;power.SetAsFirstSibling();}
            var radio=PartModel(g,d.radio);radio.localPosition=new Vector3(.4f,1.6f,-.2f);radio.localScale=Vector3.one*.65f;
            for(int i=0;i<d.science.Count;i++){var tool=PartModel(g,d.science[i]);tool.localPosition=new Vector3(i%2==0?-1:1,1.1f,i<2?.7f:-.7f);tool.localScale=Vector3.one*.55f;}
            return g;
        }
    }
}
