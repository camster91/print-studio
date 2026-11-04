// Original Layerline lettering trial; NOT a finished electrical product.
name="LAYERLINE"; width=190; height=55;
union(){cube([width,height,3]);translate([width/2,height/2,3])linear_extrude(1)resize([width-16,0],auto=true)text(name,size=20,halign="center",valign="center",font="Liberation Sans:style=Bold");}
