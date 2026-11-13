using System;
using System.Runtime.InteropServices;
using UnityEngine;
namespace Titan {
    public static class AccessibilityBridge {
        [Serializable] class Labels {public string[] labels;public string description;}
        #if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")] static extern void TitanLabels(string json);
        [DllImport("__Internal")] static extern void TitanPreferences();
        #endif
        public static void Publish(string[] labels,string description){
            #if UNITY_WEBGL && !UNITY_EDITOR
            TitanLabels(JsonUtility.ToJson(new Labels{labels=labels,description=description}));
            #endif
        }
        public static void Initialize(){
            #if UNITY_WEBGL && !UNITY_EDITOR
            TitanPreferences();
            #endif
        }
    }
}
