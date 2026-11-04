// Original Layerline prototype; adult desk decor. Millimetres.
name="LAYERLINE"; width=160; depth=40; base=8;
union(){cube([width,depth,base]);translate([width/2,depth/2,base])linear_extrude(.8)resize([width-20,0],auto=true)text(name,size=15,halign="center",valign="center",font="Liberation Sans:style=Bold");}
