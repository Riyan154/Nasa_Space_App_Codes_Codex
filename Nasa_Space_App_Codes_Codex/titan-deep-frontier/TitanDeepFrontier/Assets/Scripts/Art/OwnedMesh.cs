using UnityEngine;
namespace Titan {
    public class OwnedMesh:MonoBehaviour {
        public Mesh mesh;
        void OnDestroy(){if(Application.isPlaying&&mesh)Destroy(mesh);}
    }
}
