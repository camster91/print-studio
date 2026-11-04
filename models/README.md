# Original Layerline prototype sources

These are new parametric OpenSCAD prototypes written for Layerline, with no borrowed model geometry. They are **not production-approved**. Rendered STL files are for fit/slicer trials. Physical clearance, stability, QR scan, typography and LED module fit still need Cameron's checks. Do not sell electrical assemblies or tool mounts based on an untested render.

- `qr-stand.scad`: replaceable rectangular or arch insert plus slotted base. 0.3 mm trial clearance. Print base flat; insert face-up, change colour at the raised text/QR layer. Emboss a real QR only after testing the destination; source demo is a website CTA, not a review code.
- `nameplate.scad`: desk base plus raised adult office lettering. Print flat, colour change at 8 mm; use commercial-use font and inspect all islands in slicer.
- `lithophane-frame.scad`: open back frame + removable back, 80/100/150 mm nominal panel choices. Trial tolerances; the panel is separate, generated from an owned/consented image. LED holder is intentionally omitted until the exact approved USB module is measured. Test empty frame first.
- `name-sign.scad`: solid raised lettering prototype, not yet a complete LED product. Exact module, diffuser, thermal clearance and cable strain relief must be designed after parts are known. Default width under 200 mm; larger 450 mm option needs an engineered split joint.
- Battery/tool interfaces are blocked on exact model measurements, real fit coupons, tested fasteners and mounting substrate. No guessed battery latch geometry is supplied.

Units mm. Start with 0.4 mm nozzle, 0.2 mm layer, 3 perimeters and 20% infill as **trial settings**, not validated production profiles. Lithophane panel 0.12 mm/100% infill needs a separate test. PETG for garage work; PLA for indoor decor. Record actual hours, grams plus purge and failures in docs/launch/sample-log.csv. Source and output filenames include `prototype` until approved. No CC-BY parts were used in these prototype sources. Verify any font/image rights separately.

Render: `openscad -o models/prototypes/qr-stand-base.stl -D 'part="base"' models/qr-stand.scad` (repeat for insert, nameplate and frame). Rendered geometry does not prove printability or product safety.
