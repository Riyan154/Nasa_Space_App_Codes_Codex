using System;
namespace Titan {
    public static class NASAUrl {
        public static bool SafePreview(string value)=>Uri.TryCreate(value,UriKind.Absolute,out var uri)&&uri.Scheme=="https"&&uri.Host=="images-assets.nasa.gov"&&uri.IsDefaultPort&&uri.UserInfo=="";
    }
}
