include <qr-matrix.scad>
// Original Layerline prototype; millimetres. No third-party geometry.
part="base"; qr=true; shape="rectangle"; width=90; height=110; thickness=3; clearance=.3;
$fn=48;
module outline(){if(shape=="arch")union(){square([width,height-width/2]);translate([width/2,height-width/2])circle(d=width);}else square([width,height]);}
if(part=="base")difference(){cube([110,50,12]);translate([10-clearance/2,25-thickness/2-clearance/2,5])cube([width+clearance,thickness+clearance,8]);}
if(part=="insert")union(){linear_extrude(thickness)outline();if(qr)translate([15,35,thickness])qr_matrix();translate([width/2,15,thickness])linear_extrude(.6)text("SCAN HERE",size=7,halign="center",font="Liberation Sans:style=Bold");}
