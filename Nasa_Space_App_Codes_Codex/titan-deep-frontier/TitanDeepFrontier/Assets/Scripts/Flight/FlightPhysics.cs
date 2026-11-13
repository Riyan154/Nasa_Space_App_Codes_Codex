namespace Titan {
    public static class FlightPhysics {
        public static void BeginDescent(Mission m){m.x=m.z=0;m.altitude=m.destination=="moon"?1200:m.destination=="mars"?40000:180000;m.speed=m.destination=="moon"?35:m.destination=="mars"?550:3600;}
        public static void Step(Mission m,Destination d,float mass,float dt,bool assist){
            if(assist&&d.id!="titan")m.retro=true;
            if(assist&&!m.chute&&d.id!="moon"&&m.altitude<15000)MissionEngine.Deploy(m,d);
            bool armed=m.retro;float thrust=d.id=="mars"?14:8;
            float stopping=m.speed*m.speed/(2*(thrust-d.gravity))+30;
            m.retro=armed&&m.altitude<=stopping&&m.speed>2.5f;
            MissionEngine.EntryStep(m,d,mass,dt);m.retro=armed;
        }
    }
}
