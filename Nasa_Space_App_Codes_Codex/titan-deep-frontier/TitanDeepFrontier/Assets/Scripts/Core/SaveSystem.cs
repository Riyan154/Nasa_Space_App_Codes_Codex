using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
namespace Titan {
    [Serializable] public class Preferences { public bool sound=true,reducedMotion,highContrast,colorBlind; }
    [Serializable] public class SaveData { public int version=1;public Mission mission;public Preferences preferences=new Preferences();public List<Mission> reports=new List<Mission>(); }
    public static class SaveSystem {
        const string Key="titan.unity.v1";
        public static string Encode(SaveData data)=>JsonUtility.ToJson(data);
        public static SaveData Decode(string json,Catalog c) {
            try {var s=JsonUtility.FromJson<SaveData>(json);if(s==null||s.version!=1||s.preferences==null||s.reports==null)return new SaveData();
                if(s.mission!=null&&!Valid(s.mission,c))s.mission=null;
                s.reports=s.reports.Where(m=>Valid(m,c)&&m.stage==Stage.Results).TakeLast(20).ToList();return s;
            } catch {return new SaveData();}
        }
        public static bool Valid(Mission m,Catalog c) => m!=null&&m.version==1&&!string.IsNullOrEmpty(m.id)&&Enum.IsDefined(typeof(Stage),m.stage)&&c.World(m.destination)!=null&&m.difficulty>=0&&m.difficulty<c.difficulties.Length&&m.design!=null&&m.design.science!=null&&m.found!=null&&m.found.Distinct().Count()==m.found.Count&&m.found.All(i=>i>=0&&i<5)&&m.design.science.Distinct().Count()==m.design.science.Count&&m.design.science.All(id=>c.Get(id)?.category==Category.Science)&&c.Get(m.design.rocket)?.category==Category.Rockets&&c.Get(m.design.power)?.category==Category.Power&&c.Get(m.design.radio)?.category==Category.Radio&&m.rings>=0&&m.rings<=3&&new[]{m.battery,m.fuel,m.integrity,m.hours,m.data,m.sent,m.altitude,m.speed,m.heat,m.temperature}.All(n=>!float.IsNaN(n)&&!float.IsInfinity(n)&&n>=0)&&new[]{m.x,m.z,m.course}.All(n=>!float.IsNaN(n)&&!float.IsInfinity(n))&&m.integrity<=100&&(!m.transmitted||m.found.Count==5);
        public static SaveData Load(Catalog c)=>Decode(PlayerPrefs.GetString(Key,"{}"),c);
        public static bool Save(SaveData s){try{PlayerPrefs.SetString(Key,Encode(s));PlayerPrefs.Save();return true;}catch{return false;}}
        public static void Archive(SaveData s){if(s.mission==null||s.mission.stage!=Stage.Results)return;s.reports.RemoveAll(m=>m.id==s.mission.id);s.reports.Add(JsonUtility.FromJson<Mission>(JsonUtility.ToJson(s.mission)));while(s.reports.Count>20)s.reports.RemoveAt(0);}
    }
}
