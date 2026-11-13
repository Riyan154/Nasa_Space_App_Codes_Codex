// Portable smoke check only. UnityEngine persistence and NUnit are substituted below.
// This compiles the actual pure game logic; it cannot validate Unity API, rendering, or JsonUtility behavior.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
namespace UnityEngine {
    public class Object {public static void DestroyImmediate(Object o){}public static implicit operator bool(Object value)=>value!=null;}
    public class ScriptableObject:Object {public static T CreateInstance<T>() where T:new()=>new T();}
    public static class JsonUtility {static readonly JsonSerializerOptions Options=new JsonSerializerOptions{IncludeFields=true};public static string ToJson(object data)=>JsonSerializer.Serialize(data,data.GetType(),Options);public static T FromJson<T>(string json)=>JsonSerializer.Deserialize<T>(json,Options);}
    public static class PlayerPrefs {static readonly Dictionary<string,string> Data=new Dictionary<string,string>();public static string GetString(string key,string fallback)=>Data.TryGetValue(key,out var value)?value:fallback;public static void SetString(string key,string value)=>Data[key]=value;public static void Save(){}}
}
namespace NUnit.Framework {
    [AttributeUsage(AttributeTargets.Method)] public class SetUpAttribute:Attribute {}
    [AttributeUsage(AttributeTargets.Method)] public class TearDownAttribute:Attribute {}
    [AttributeUsage(AttributeTargets.Method)] public class TestAttribute:Attribute {}
    [AttributeUsage(AttributeTargets.Method,AllowMultiple=true)] public class TestCaseAttribute:Attribute {public object[] Values;public TestCaseAttribute(params object[] values)=>Values=values;}
    public static class Assert {
        static void Check(bool pass,string message){if(!pass)throw new Exception(message);}
        public static void AreEqual(object expected,object actual){bool numeric=expected is IConvertible&&actual is IConvertible&&expected is not string&&expected is not bool&&actual is not Enum;Check(numeric?Convert.ToDouble(expected)==Convert.ToDouble(actual):Equals(expected,actual),$"Expected {expected}, got {actual}");}
        public static void AreEqual(double expected,double actual,double tolerance)=>Check(Math.Abs(expected-actual)<=tolerance,$"Expected {expected} +/- {tolerance}, got {actual}");
        public static void IsTrue(bool value)=>Check(value,"Expected true");public static void IsFalse(bool value)=>Check(!value,"Expected false");public static void IsNull(object value)=>Check(value==null,"Expected null");
        public static void IsEmpty(IEnumerable values)=>Check(!values.Cast<object>().Any(),"Expected empty");public static void IsNotEmpty(IEnumerable values)=>Check(values.Cast<object>().Any(),"Expected not empty");
        public static void Less(double a,double b)=>Check(a<b,$"Expected {a} < {b}");public static void Greater(double a,double b)=>Check(a>b,$"Expected {a} > {b}");
        public static void Contains(object value,IEnumerable values)=>Check(values.Cast<object>().Contains(value),"Missing expected item");
    }
}
class Program {
    static int Main(){int passed=0,failed=0;foreach(var type in Assembly.GetExecutingAssembly().GetTypes().Where(t=>t.Namespace=="Titan.Tests"))foreach(var method in type.GetMethods()){
        var cases=method.GetCustomAttributes<NUnit.Framework.TestCaseAttribute>().ToArray();if(cases.Length==0&&method.GetCustomAttribute<NUnit.Framework.TestAttribute>()==null)continue;
        foreach(var args in cases.Length==0?new[]{Array.Empty<object>()}:cases.Select(c=>c.Values)){
            var fixture=Activator.CreateInstance(type);try{foreach(var setup in type.GetMethods().Where(m=>m.GetCustomAttribute<NUnit.Framework.SetUpAttribute>()!=null))setup.Invoke(fixture,null);var parameters=method.GetParameters();var converted=args.Select((v,i)=>Convert.ChangeType(v,parameters[i].ParameterType)).ToArray();method.Invoke(fixture,converted);passed++;}
            catch(Exception error){failed++;Console.WriteLine("FAIL "+type.Name+"."+method.Name+": "+(error.InnerException??error).Message);}
            finally {foreach(var teardown in type.GetMethods().Where(m=>m.GetCustomAttribute<NUnit.Framework.TearDownAttribute>()!=null))teardown.Invoke(fixture,null);}
        }
    }Console.WriteLine($"Portable C# logic checks: {passed} passed, {failed} failed. Unity runtime and Unity serialization NOT tested.");return failed==0?0:1;}
}
