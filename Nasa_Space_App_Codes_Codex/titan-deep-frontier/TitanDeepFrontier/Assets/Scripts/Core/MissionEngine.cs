using System;
using System.Collections.Generic;
using System.Linq;

namespace Titan {
    [Serializable] public class Design {
        public string rocket="atlas", power="rtg", radio="antenna";
        public List<string> science=new List<string>{"spectrometer","atmosphere","camera"};
        public Design Copy() => new Design{rocket=rocket,power=power,radio=radio,science=new List<string>(science)};
    }
    [Serializable] public class Mission {
        public int version=1, difficulty, rings, score;
        public string id=Guid.NewGuid().ToString("N"), destination="titan";
        public bool advanced, chute, retro, landed, transmitted, failed;
        public Stage stage=Stage.Build;
        public Design design=new Design();
        public List<int> found=new List<int>();
        public float battery, fuel=95, integrity=100, temperature=280, hours, data, sent, sciencePoints, altitude=180000, speed=3600, heat;
        public float x,z, course=1;
        public string feedback="";
    }
    public struct Resources { public float mass,cost,budget,capacity,generation,battery,baseline,demand,rate; }
    public static class MissionEngine {
        public static float Clamp(float n,float lo,float hi) => Math.Max(lo,Math.Min(hi,n));
        public static Resources Resources(Mission m,Catalog c) {
            // Bundled navigation, insulation, fuel and destination landing gear replace removed tabs.
            var r=new Resources{mass=m.destination=="titan"?820:760,cost=23000,baseline=40,budget=c.difficulties[m.difficulty].budget};
            var rocket=c.Get(m.design.rocket); r.capacity=rocket?.capacity??0; r.cost+=rocket?.cost??0;
            foreach(var id in new[]{m.design.power,m.design.radio}.Concat(m.design.science)) {
                var p=c.Get(id);if(p==null)continue;r.mass+=p.mass;r.cost+=p.cost;r.demand+=p.draw;
                if(p.category==Category.Radio){r.baseline+=p.draw;r.rate=p.rate;}
            }
            var power=c.Get(m.design.power);r.generation=power?.generation??0;r.battery=power?.battery??0;r.demand+=40;
            if(m.design.power=="solar")r.generation*=c.World(m.destination).solarMultiplier;
            if(m.design.radio=="laser"&&m.destination=="titan")r.rate*=.2f;
            return r;
        }
        public static bool Select(Mission m,Catalog c,string id) {
            var p=c.Get(id);if(p==null)return false;var before=m.design.Copy();
            switch(p.category){case Category.Rockets:m.design.rocket=id;break;case Category.Power:m.design.power=id;break;case Category.Radio:m.design.radio=id;break;case Category.Science:if(!m.design.science.Remove(id))m.design.science.Add(id);break;}
            if(Resources(m,c).cost>Resources(m,c).budget){m.design=before;m.feedback="That part exceeds the budget. Swap an expensive part first.";return false;}
            m.feedback="Part installed. Check your three resource meters.";return true;
        }
        public static List<string> Validate(Mission m,Catalog c) {
            var r=Resources(m,c);var errors=new List<string>();
            if(c.Get(m.design.rocket)?.category!=Category.Rockets)errors.Add("Choose a rocket.");
            if(c.Get(m.design.power)?.category!=Category.Power)errors.Add("Choose a power source.");
            if(c.Get(m.design.radio)?.category!=Category.Radio)errors.Add("Choose a radio.");
            if(m.design.science.Count==0)errors.Add("Bring at least one science instrument.");
            if(r.mass>r.capacity)errors.Add("Too heavy for this rocket. Choose more lift or fewer instruments.");
            if(r.cost>r.budget)errors.Add("Over budget. Choose a cheaper part.");
            if(r.generation<r.baseline)errors.Add("Not enough continuous power for essential systems. On Titan, small solar wings struggle at 9.5 AU.");
            if(m.destination=="titan"&&!Floats(r.mass,4.2f,480))errors.Add("The bundled hull needs 12% flotation reserve. Reduce mass.");
            return errors;
        }
        public static float Energy(float energy,float supply,float draw,float hours,float capacity)=>Clamp(energy+(supply-draw)*hours,0,capacity);
        public static float Drag(float density,float velocity,float coefficient,float area)=>.5f*density*velocity*velocity*coefficient*area;
        public static float Heating(float density,float velocity)=>(float)(1.2e-4*Math.Sqrt(density/1.4)*Math.Pow(Math.Abs(velocity),3));
        public static bool Floats(float mass,float volume,float density)=>mass<=density*volume*.88f;
        public static float Buoyancy(float density,float gravity,float volume)=>density*gravity*volume;
        public static float Temperature(float initial,float ambient,float hours,float insulation,float heater) {
            var k=.8f*(1-insulation)+.04f;var equilibrium=ambient+heater/k;
            return (float)(equilibrium+(initial-equilibrium)*Math.Exp(-k*hours*3600/140000));
        }
        public static bool SpendTime(Mission m,Catalog c,float hours,float instrumentDraw=0) {
            var r=Resources(m,c);float draw=r.baseline+instrumentDraw;
            if(hours<0||float.IsNaN(hours)||float.IsInfinity(hours))return false;
            if(m.battery+(r.generation-draw)*hours<0){m.feedback="Not enough stored energy. Recharge or use a lower-power tool.";return false;}
            m.battery=Energy(m.battery,r.generation,draw,hours,r.battery);m.hours+=hours;
            m.temperature=Temperature(m.temperature,c.World(m.destination).temperature,hours,.94f,15);
            return true;
        }
        public static bool Discover(Mission m,Catalog c,int index) {
            if(m.stage!=Stage.Explore||index<0||index>=5||m.found.Contains(index))return false;
            // Physical proximity is validated by the controller before invoking this pure operation.
            var science=m.design.science.Select(c.Get).Where(p=>p!=null).ToArray();if(science.Length==0)return false;
            var tool=science[index%science.Length];if(m.advanced&&!SpendTime(m,c,.25f,tool.draw))return false;
            m.found.Add(index);m.data+=tool.data;m.sciencePoints+=tool.points;return true;
        }
        public static bool Transmit(Mission m,Catalog c) {
            if(m.stage!=Stage.Transmit||m.transmitted||m.found.Count!=5)return false;
            var r=Resources(m,c);if(r.rate<=0)return false;
            if(m.advanced&&!SpendTime(m,c,m.data/r.rate))return false;
            m.sent=m.data;m.transmitted=true;m.score=Score(m,c);m.stage=Stage.Results;return true;
        }
        public static int Score(Mission m,Catalog c){var r=Resources(m,c);return (int)Math.Round(Clamp(Clamp(m.sciencePoints/3,0,50)+(m.transmitted?25:0)+m.integrity*.15f+10*(1-r.cost/r.budget),0,100));}
        public static void EntryStep(Mission m,Destination d,float mass,float dt) {
            dt=Clamp(dt,0,.15f);float rho=d.density*(float)Math.Exp(-m.altitude/d.scaleHeight);
            float area=(m.chute?220:12)*Clamp(m.course,.5f,1), accel=d.gravity-Drag(rho,m.speed,1.5f,area)/Math.Max(100,mass);
            if(m.retro&&m.fuel>0){accel-=d.id=="mars"?14:8; m.fuel=Math.Max(0,m.fuel-dt*.9f);}
            m.speed=Math.Max(.5f,m.speed+accel*dt);m.altitude=Math.Max(0,m.altitude-m.speed*dt);m.heat+=Heating(rho,m.speed)*dt/Clamp(m.course,.5f,1);
            if(m.altitude==0){m.landed=m.speed<=4.5f;m.failed=!m.landed;m.integrity=m.landed?Math.Max(10,100-m.heat/2e7f):0;}
        }
        public static bool Deploy(Mission m,Destination d) {
            if(d.density==0){m.feedback="The Moon has no atmosphere. Use retro-rockets; parachutes cannot brake here.";return false;}
            float rho=d.density*(float)Math.Exp(-m.altitude/d.scaleHeight);
            if(.5f*rho*m.speed*m.speed>800){m.feedback="Dynamic pressure exceeds 800 Pa. Deploying here would tear the parachute. Slow down first.";return false;}
            m.chute=true;return true;
        }
    }
}
