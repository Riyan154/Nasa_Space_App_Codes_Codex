using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Titan.Editor {
    [InitializeOnLoad] public static class ProjectSetup {
        static readonly string[] Scenes={"MainMenu","Builder","Flight","Exploration_Titan","Exploration_Mars","Exploration_Moon"};
        static ProjectSetup(){EditorApplication.delayCall+=()=>{if(!Application.isBatchMode&&!EditorApplication.isPlayingOrWillChangePlaymode&&!File.Exists("Assets/Scenes/MainMenu.unity"))Generate();};}
        [MenuItem("TITAN/Generate project assets")]
        public static void Generate(){
            if(!Application.isBatchMode&&!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())return;
            foreach(var dir in new[]{"Assets/Resources","Assets/ScriptableObjects","Assets/Materials/LowPoly","Assets/Scenes","Assets/Prefabs/Spacecraft","Assets/Prefabs/Rockets","Assets/GeneratedMeshes"})Directory.CreateDirectory(dir);
            AssetDatabase.Refresh();
            var catalog=AssetDatabase.LoadAssetAtPath<Catalog>("Assets/Resources/Catalog.asset");if(!catalog){catalog=Catalog.Create();AssetDatabase.CreateAsset(catalog,"Assets/Resources/Catalog.asset");}
            foreach(Category category in Enum.GetValues(typeof(Category))){string path="Assets/ScriptableObjects/"+(category==Category.Rockets?"Rocket":category.ToString())+"Data.asset";if(!File.Exists(path)){var set=ScriptableObject.CreateInstance<EquipmentSet>();set.category=category;set.parts=catalog.parts.Where(p=>p.category==category).ToArray();AssetDatabase.CreateAsset(set,path);}}
            if(!File.Exists("Assets/ScriptableObjects/DestinationData.asset")){var set=ScriptableObject.CreateInstance<DestinationSet>();set.destinations=catalog.destinations;AssetDatabase.CreateAsset(set,"Assets/ScriptableObjects/DestinationData.asset");}
            if(!File.Exists("Assets/ScriptableObjects/DifficultyData.asset")){var set=ScriptableObject.CreateInstance<DifficultySet>();set.difficulties=catalog.difficulties;AssetDatabase.CreateAsset(set,"Assets/ScriptableObjects/DifficultyData.asset");}
            catalog.equipmentAssets=Enum.GetValues(typeof(Category)).Cast<Category>().Select(category=>AssetDatabase.LoadAssetAtPath<EquipmentSet>("Assets/ScriptableObjects/"+(category==Category.Rockets?"Rocket":category.ToString())+"Data.asset")).ToArray();catalog.destinationAsset=AssetDatabase.LoadAssetAtPath<DestinationSet>("Assets/ScriptableObjects/DestinationData.asset");catalog.difficultyAsset=AssetDatabase.LoadAssetAtPath<DifficultySet>("Assets/ScriptableObjects/DifficultyData.asset");EditorUtility.SetDirty(catalog);
            var pipeline=AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>("Assets/Resources/TitanURP.asset");
            if(!pipeline){var renderer=ScriptableObject.CreateInstance<UniversalRendererData>();AssetDatabase.CreateAsset(renderer,"Assets/Resources/TitanRenderer.asset");pipeline=UniversalRenderPipelineAsset.Create(renderer);pipeline.renderScale=1;pipeline.msaaSampleCount=2;pipeline.supportsHDR=false;pipeline.shadowDistance=70;AssetDatabase.CreateAsset(pipeline,"Assets/Resources/TitanURP.asset");}
            GraphicsSettings.defaultRenderPipeline=pipeline;QualitySettings.renderPipeline=pipeline;QualitySettings.vSyncCount=1;
            if(!File.Exists("Assets/Resources/TitanSky.mat"))AssetDatabase.CreateAsset(new Material(Shader.Find("Titan/GradientSky")),"Assets/Resources/TitanSky.mat");
            // A referenced material keeps the runtime shader from being stripped in player builds.
            if(!File.Exists("Assets/Resources/TitanToon.mat"))AssetDatabase.CreateAsset(new Material(Shader.Find("Titan/Toon")),"Assets/Resources/TitanToon.mat");
            foreach(var part in catalog.parts){string path="Assets/Prefabs/"+(part.category==Category.Rockets?"Rockets/":"Spacecraft/")+part.id+".prefab";if(File.Exists(path))continue;var model=SpacecraftAssembly.PartModel(null,part.id);int meshId=0;
                foreach(var filter in model.GetComponentsInChildren<MeshFilter>()){var mesh=filter.sharedMesh;if(mesh&&!AssetDatabase.Contains(mesh)&&!mesh.name.StartsWith("Cube")&&!mesh.name.StartsWith("Sphere")&&!mesh.name.StartsWith("Cylinder")&&!mesh.name.StartsWith("Capsule")){AssetDatabase.CreateAsset(mesh,"Assets/GeneratedMeshes/"+part.id+"_"+(meshId++)+".asset");}}
                foreach(var renderer in model.GetComponentsInChildren<Renderer>()){var material=renderer.sharedMaterial;if(!AssetDatabase.Contains(material)){string hex=ColorUtility.ToHtmlStringRGB(material.color);string materialPath="Assets/Materials/LowPoly/"+hex+".mat";var existing=AssetDatabase.LoadAssetAtPath<Material>(materialPath);if(existing)renderer.sharedMaterial=existing;else AssetDatabase.CreateAsset(material,materialPath);}}
                PrefabUtility.SaveAsPrefabAsset(model.gameObject,path);UnityEngine.Object.DestroyImmediate(model.gameObject);
            }
            for(int i=0;i<Scenes.Length;i++){string path="Assets/Scenes/"+Scenes[i]+".unity";if(File.Exists(path))continue;var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);var entry=new GameObject("Mission entry").AddComponent<SceneEntry>();entry.initialStage=i==0?Stage.Title:i==1?Stage.Build:i==2?Stage.Launch:Stage.Explore;entry.destination=i==4?"mars":i==5?"moon":"titan";EditorSceneManager.SaveScene(scene,path);}
            EditorBuildSettings.scenes=Scenes.Select(s=>new EditorBuildSettingsScene("Assets/Scenes/"+s+".unity",true)).ToArray();
            PlayerSettings.companyName="Riyan";PlayerSettings.productName="TITAN Deep Frontier";PlayerSettings.bundleVersion="1.0.0";PlayerSettings.colorSpace=ColorSpace.Linear;PlayerSettings.defaultScreenWidth=1440;PlayerSettings.defaultScreenHeight=900;PlayerSettings.runInBackground=false;
            PlayerSettings.WebGL.template="PROJECT:Titan";PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Disabled;PlayerSettings.WebGL.memorySize=256;
            AssetDatabase.SaveAssets();EditorSceneManager.OpenScene("Assets/Scenes/MainMenu.unity");Debug.Log("TITAN assets generated. Open MainMenu and press Play. Runtime geometry and UI are generated from the catalogue.");
        }
        [MenuItem("TITAN/Build/WebGL")]
        public static void BuildWebGL()=>Build(BuildTarget.WebGL,"Builds/WebGL");
        [MenuItem("TITAN/Build/macOS")]
        public static void BuildMac()=>Build(BuildTarget.StandaloneOSX,"Builds/macOS/Titan.app");
        [MenuItem("TITAN/Build/Windows")]
        public static void BuildWindows()=>Build(BuildTarget.StandaloneWindows64,"Builds/Windows/Titan.exe");
        static void Build(BuildTarget target,string path){Generate();Directory.CreateDirectory(Path.GetDirectoryName(path));var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{"Assets/Scenes/MainMenu.unity"},locationPathName=path,target=target,options=BuildOptions.None});if(report.summary.result!=BuildResult.Succeeded)throw new Exception("TITAN build failed: "+report.summary.result);}
    }
}
