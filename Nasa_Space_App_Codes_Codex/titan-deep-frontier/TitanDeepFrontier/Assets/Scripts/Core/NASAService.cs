using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.Networking;
namespace Titan {
    [Serializable] public class NASAImage {public string title,credit,url,preview;[NonSerialized] public Texture2D texture;}
    public class NASAResult {public string status,message;public List<NASAImage> items=new List<NASAImage>();}
    public class NASAService:MonoBehaviour {
        [Serializable] class Payload {public Collection collection;}
        [Serializable] class Collection {public Item[] items;}
        [Serializable] class Item {public Metadata[] data;public Link[] links;}
        [Serializable] class Metadata {public string title,nasa_id,media_type,center,secondary_creator,photographer;}
        [Serializable] class Link {public string href,rel;}
        [Serializable] class Cache {public long at;public string payload;}
        [Serializable] class PdsPayload {public PdsItem[] data;}
        [Serializable] class PdsItem {public string id,title;public Target[] targets;}
        [Serializable] class Target {public string id;}
        readonly Dictionary<string,Texture2D> textures=new Dictionary<string,Texture2D>();
        public static bool SafePreview(string value)=>NASAUrl.SafePreview(value);
        public static string Plain(string value)=>Regex.Replace(value??"","<[^>]*>","").Trim();
        List<NASAImage> Parse(string json){var payload=JsonUtility.FromJson<Payload>(json);var result=new List<NASAImage>();if(payload?.collection?.items==null)return result;
            foreach(var item in payload.collection.items.Take(20)){var d=item.data?.FirstOrDefault();var preview=item.links?.FirstOrDefault(l=>l.rel=="preview"&&SafePreview(l.href));if(d==null||d.media_type!="image"||preview==null||string.IsNullOrEmpty(d.nasa_id))continue;
                result.Add(new NASAImage{title=Plain(d.title),credit=Plain(d.secondary_creator??d.photographer??d.center??"NASA library; credit not supplied"),url="https://images.nasa.gov/details/"+Uri.EscapeDataString(d.nasa_id),preview=preview.href});if(result.Count==3)break;}return result;
        }
        public IEnumerator Images(string destination,Action<NASAResult> done){
            string key="titan.nasa.images."+destination;Cache cache=null;try{cache=JsonUtility.FromJson<Cache>(PlayerPrefs.GetString(key,"{}"));}catch{}long now=DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var result=new NASAResult{status="Offline",message="NASA imagery could not be loaded. The game still works; use the NASA source links."};
            bool fresh=cache!=null&&cache.at<=now&&now-cache.at<86400;
            if(!fresh){string query=destination=="titan"?"Titan Cassini":destination=="mars"?"Mars surface rover":"Moon Apollo surface";
                using(var request=UnityWebRequest.Get("https://images-api.nasa.gov/search?media_type=image&page_size=6&q="+Uri.EscapeDataString(query))){request.timeout=8;yield return request.SendWebRequest();if(request.result==UnityWebRequest.Result.Success){try{var parsed=Parse(request.downloadHandler.text);if(parsed.Count>0){cache=new Cache{at=now,payload=request.downloadHandler.text};PlayerPrefs.SetString(key,JsonUtility.ToJson(cache));result.items=parsed;result.status="Live NASA library";}}catch{}}}
            }
            if(result.items.Count==0&&cache!=null&&cache.at<=now&&now-cache.at<604800){try{result.items=Parse(cache.payload);if(result.items.Count>0)result.status=fresh?"Cached within 24 hours":"Offline · cached images";}catch{}}
            if(result.items.Count>0)result.message="NASA imagery, separate from procedural game artwork. Sources may include processed images or artist concepts; check each source's metadata.";
            foreach(var item in result.items){if(textures.TryGetValue(item.preview,out var image)){item.texture=image;continue;}
                using(var request=UnityWebRequestTexture.GetTexture(item.preview)){request.timeout=8;yield return request.SendWebRequest();if(request.result==UnityWebRequest.Result.Success){item.texture=DownloadHandlerTexture.GetContent(request);textures[item.preview]=item.texture;}}}
            done(result);
        }
        public IEnumerator Datasets(string destination,Action<string> done){
            string target="urn:nasa:pds:context:target:"+(destination=="titan"?"satellite.saturn.titan":destination=="mars"?"planet.mars":"satellite.earth.moon");
            string url="https://pds.nasa.gov/api/search/1/products?limit=6&q="+Uri.EscapeDataString("ref_lid_target eq \""+target+"\"");
            string key="titan.nasa.pds."+destination;string json=null;bool live=false;
            using(var request=UnityWebRequest.Get(url)){request.timeout=8;yield return request.SendWebRequest();if(request.result==UnityWebRequest.Result.Success){json=request.downloadHandler.text;live=true;}}
            if(json==null){try{var cache=JsonUtility.FromJson<Cache>(PlayerPrefs.GetString(key,"{}"));long age=DateTimeOffset.UtcNow.ToUnixTimeSeconds()-cache.at;if(age>=0&&age<604800)json=cache.payload;}catch{}}
            string message="PDS unavailable or returned no verified matching records. The NASA PDS catalogue link remains available.";
            if(!string.IsNullOrEmpty(json)){try{var p=JsonUtility.FromJson<PdsPayload>(json);var records=p.data.Where(item=>item.id!=null&&item.id.StartsWith("urn:nasa:pds:")&&item.targets!=null&&item.targets.Any(t=>t.id==target)).Take(3).ToArray();if(records.Length>0){message=(live?"Live PDS records":"Cached PDS records")+"\n"+string.Join("\n",records.Select(i=>Plain(i.title)+" · "+i.id));if(live)PlayerPrefs.SetString(key,JsonUtility.ToJson(new Cache{at=DateTimeOffset.UtcNow.ToUnixTimeSeconds(),payload=json}));}}catch{}}
            done(message);
        }
        void OnDestroy(){foreach(var texture in textures.Values)if(texture)Destroy(texture);}
    }
}
