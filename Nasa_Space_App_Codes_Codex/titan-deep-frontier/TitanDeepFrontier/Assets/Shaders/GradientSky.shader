Shader "Titan/GradientSky" {
 Properties {_Horizon("Horizon",Color)=(.65,.45,.25,1) _Zenith("Zenith",Color)=(.04,.07,.12,1)}
 SubShader {Tags {"Queue"="Background" "RenderType"="Background" "PreviewType"="Skybox"} Cull Off ZWrite Off
 Pass {HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 float4 _Horizon,_Zenith;
 struct A {float4 vertex:POSITION;};struct V {float4 position:SV_POSITION;float3 direction:TEXCOORD0;};
 V vert(A a){V v;v.position=TransformObjectToHClip(a.vertex.xyz);v.direction=a.vertex.xyz;return v;}
 half4 frag(V v):SV_Target{return lerp(_Horizon,_Zenith,saturate(normalize(v.direction).y*.9+.1));}
 ENDHLSL}
 }
}
