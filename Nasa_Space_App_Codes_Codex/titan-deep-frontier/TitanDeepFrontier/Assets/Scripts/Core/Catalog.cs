using System;
using System.Linq;
using UnityEngine;

namespace Titan {
    public enum Category { Rockets, Power, Science, Radio }
    public enum Stage { Title, Destination, Build, Validate, Launch, Travel, Land, Explore, Transmit, Results }
    [Serializable] public class Part {
        public string id, name, description;
        public Category category;
        public float mass, cost, generation, battery, draw, capacity, rate, points, data;
    }
    [Serializable] public class Fact { public string title, text, source; }
    [Serializable] public class Destination {
        public string id, name, description, source;
        public float gravity, temperature, density, scaleHeight, solarMultiplier;
        public Fact[] facts;
    }
    [Serializable] public class Difficulty { public string name; public float budget; }
    // Asset definitions are materialized by Editor/ProjectSetup, using this single data source.
    public class Catalog : ScriptableObject {
        public Part[] parts;
        public Destination[] destinations;
        public Difficulty[] difficulties;
        public EquipmentSet[] equipmentAssets;
        public DestinationSet destinationAsset;
        public DifficultySet difficultyAsset;
        public void ResolveAssets(){if(equipmentAssets!=null&&equipmentAssets.Length==4&&equipmentAssets.All(a=>a&&a.parts!=null))parts=equipmentAssets.SelectMany(a=>a.parts).ToArray();if(destinationAsset)destinations=destinationAsset.destinations;if(difficultyAsset)difficulties=difficultyAsset.difficulties;}
        public Part Get(string id) => parts.FirstOrDefault(p => p.id == id);
        public Destination World(string id) => destinations.FirstOrDefault(d => d.id == id);
        public static Catalog Create() {
            var c = CreateInstance<Catalog>();
            c.parts = new[] {
                P("atlas","Atlas Explorer",Category.Rockets,0,20000,"Small & mighty. Carefully pack your explorer.",capacity:1500),
                P("titan","Titan Heavy",Category.Rockets,0,30000,"More room for ambitious science.",capacity:2500),
                P("deep","DeepSpace XL",Category.Rockets,0,42000,"Heavy instruments, if your budget allows.",capacity:3500),
                P("horizon","Horizon Ultra",Category.Rockets,0,55000,"Maximum lift takes a serious bite out of your funds.",capacity:5000),
                P("solar","Solar Wings",Category.Power,160,7000,"Sunlight becomes electricity. Output depends on destination; very weak on Titan.",generation:18,battery:500),
                P("rtg","Radioisotope Core",Category.Power,130,22000,"Decay heat becomes electricity, even in darkness. Includes a battery.",generation:110,battery:550),
                P("mmrtg","MMRTG Core",Category.Power,190,28000,"Continuous radioisotope power and a larger battery.",generation:145,battery:850),
                P("reactor","Nuclear Micro-Reactor",Category.Power,250,38000,"Experimental fission concept with cooling vanes. Fictional performance.",generation:200,battery:1200),
                P("spectrometer","Methane Detective",Category.Science,55,7000,"Spectral fingerprints reveal chemistry. On Mars and the Moon, inspect minerals.",draw:35,points:25,data:65),
                P("atmosphere","Atmosphere Station",Category.Science,30,4000,"Measure the local environment. On the Moon, study the extremely tenuous exosphere.",draw:15,points:18,data:30),
                P("camera","Panorama Camera",Category.Science,70,6000,"Capture your landing site's panorama.",draw:25,points:20,data:90),
                P("radar","Ground-Penetrating Radar",Category.Science,120,11000,"Probe subsurface structure. Signals are not proof of hidden life or lakes.",draw:50,points:30,data:120),
                P("antenna","Explorer Antenna",Category.Radio,45,6000,"A small antenna. Transmitting takes longer.",draw:12,rate:35),
                P("dish","High-Gain Dish",Category.Radio,90,9500,"A focused beam sends discoveries home faster.",draw:25,rate:80),
                P("array","Deep-Space Link",Category.Radio,150,14000,"Fast transfer with a larger power demand.",draw:40,rate:150),
                P("laser","Laser Comm Terminal",Category.Radio,110,18000,"Experimental optical link. Clear line of sight is required; haze reduces usable rate.",draw:55,rate:250)
            };
            c.difficulties = new[] {new Difficulty{name="Pathfinder",budget=112000},new Difficulty{name="Explorer",budget=100000},new Difficulty{name="Architect",budget=91000}};
            const string t="https://science.nasa.gov/saturn/moons/titan/facts/", m="https://science.nasa.gov/mars/facts/", l="https://science.nasa.gov/moon/facts/";
            c.destinations = new[] {
                new Destination{id="titan",name="Titan",description="Orange haze · methane seas · keep warm and float",gravity=1.35f,temperature=94,density=5.3f,scaleHeight=20000,solarMultiplier=1,source=t,facts=new[]{
                    F("A lake without water!","Titan's surface lakes contain methane and ethane.",t),F("Brrr… a frozen world!","Titan's surface is about −179°C. Water ice behaves like rock.",t),F("Alien raindrops!","Methane cycles through clouds, rain, rivers and lakes.",t),F("A thick blanket of air!","Mostly nitrogen, with surface pressure about 1.6 times Earth's.",t),F("A moon full of surprises!","Saturn's largest moon is bigger than Mercury.",t)}},
                new Destination{id="mars",name="Mars",description="Rusty desert · thin air · parachute AND powered landing",gravity=3.71f,temperature=210,density=.02f,scaleHeight=11100,solarMultiplier=8,source=m,facts=new[]{
                    F("Rusty world!","Iron minerals oxidize and give Martian dust its reddish colour.",m),F("The tallest volcano!","Olympus Mons is the largest volcano in the solar system.",m),F("A grand canyon!","Valles Marineris extends more than 4,000 km.",m),F("Water once flowed here!","Valleys and lakebeds record an ancient wetter Mars.",m),F("Thin air!","The thin Martian atmosphere is mostly carbon dioxide, with pressure below 1% of Earth's.",m)}},
                new Destination{id="moon",name="Moon",description="Silent craters · no breathable air · powered descent only",gravity=1.62f,temperature=220,density=0,scaleHeight=1,solarMultiplier=20,source=l,facts=new[]{
                    F("Long-lasting footprints!","There is no weather to quickly erase tracks, though impacts and space weathering change the surface over time.",l),F("A dusty problem!","Lunar regolith contains sharp fragments and dust that clings to equipment.","https://www.nasa.gov/learning-resources/for-kids-and-students/nasa-knows-what-is-lunar-regolith-grades-5-8/"),F("Ice in the shadows!","Water ice occurs in permanently shadowed polar regions.",l),F("Moonquakes!","Apollo instruments detected seismic activity on the Moon.",l),F("A familiar face!","The Moon rotates once per orbit, keeping nearly the same face toward Earth.",l)}}
            }; return c;
        }
        static Fact F(string title,string text,string source) => new Fact{title=title,text=text,source=source};
        static Part P(string id,string name,Category category,float mass,float cost,string description,float capacity=0,float generation=0,float battery=0,float draw=0,float rate=0,float points=0,float data=0) => new Part{id=id,name=name,category=category,mass=mass,cost=cost,description=description,capacity=capacity,generation=generation,battery=battery,draw=draw,rate=rate,points=points,data=data};
    }
}
