// Original Layerline prototype. No LED holder until approved module is measured.
part="frame"; panel=100; wall=3; depth=35; clearance=.4;
if(part=="frame")difference(){cube([panel+2*wall,panel+2*wall,depth]);translate([wall,wall,2])cube([panel,panel,depth]);translate([wall+2,wall+2,-1])cube([panel-4,panel-4,4]);}
if(part=="back")cube([panel-clearance,panel-clearance,2]);
