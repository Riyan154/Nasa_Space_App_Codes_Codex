Shader "Titan/Toon" {
 Properties { [MainColor] _BaseColor("Colour",Color)=(0.84,0.65,0.4,1) }
 SubShader { Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }
  Pass { Tags { "LightMode"="UniversalForward" }
   HLSLPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma multi_compile_fog
   #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
   #pragma multi_compile_fragment _ _SHADOWS_SOFT
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
   #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
   struct Attributes {float4 positionOS:POSITION;float3 normalOS:NORMAL;};
   struct Varyings {float4 positionCS:SV_POSITION;float3 normalWS:TEXCOORD0;float3 positionWS:TEXCOORD1;float fog:TEXCOORD2;};
   CBUFFER_START(UnityPerMaterial)
   half4 _BaseColor;
   CBUFFER_END
   Varyings vert(Attributes input){Varyings output;output.positionCS=TransformObjectToHClip(input.positionOS.xyz);output.normalWS=TransformObjectToWorldNormal(input.normalOS);output.positionWS=TransformObjectToWorld(input.positionOS.xyz);output.fog=ComputeFogFactor(output.positionCS.z);return output;}
   half4 frag(Varyings input):SV_Target {Light sun=GetMainLight(TransformWorldToShadowCoord(input.positionWS));float3 normal=normalize(input.normalWS);float diffuse=dot(normal,sun.direction);float band=diffuse>.55?1:diffuse>0?.72:.4;float rim=pow(1-saturate(dot(normal,normalize(GetWorldSpaceViewDir(input.positionWS)))),3)*.14;half3 color=_BaseColor.rgb*(band*lerp(.5,1,sun.shadowAttenuation)*sun.color+half3(.1,.12,.16))+half3(.85,.65,.4)*rim;return half4(MixFog(color,input.fog),1);}
   ENDHLSL
  }
  UsePass "Universal Render Pipeline/Lit/ShadowCaster"
  UsePass "Universal Render Pipeline/Lit/DepthOnly"
 }
}
