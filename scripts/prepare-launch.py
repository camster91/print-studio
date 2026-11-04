"""Rebuild price checks, sample log and approved-channel draft copy from the catalogue."""
from pathlib import Path
import csv,json,itertools
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/launch';OUT.mkdir(exist_ok=True)
products=json.loads((ROOT/'src/data/products.json').read_text())['products']
by={p['slug']:p for p in products}
# This is a cost ceiling, not a claim about real margins. Include all fulfilment costs before approving.
with (OUT/'price-review.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['product','option','selling_price_CAD','max_all_in_cost_for_60pct_margin_CAD','max_cost_after_LAUNCH10_CAD','actual_filament_LED_packaging_fees_shipping_CAD','approved_by_Cameron'])
 for p in products:
  variants=[('Base',p['price'])]
  for v in p['options'].get('size',[]):variants.append(('Size: '+v['label'],v['price']))
  for c in p['options'].get('choices',[]):
   for v in c['values']:
    if isinstance(v,dict) and ('price' in v or 'add' in v):variants.append((c['name']+': '+v['label'],v.get('price',p['price'])+v.get('add',0)))
  for label,price in variants:w.writerow([p['name'],label,price,round(price*.4,2),round(price*.9*.4,2),'',''])
with (OUT/'sample-log.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['product','slug','size_brand_style','file_revision','material','slicer_hours','actual_hours','grams_plus_purge','AMS_swaps','failed_grams','parts_LED_cost_CAD','packaging_cost_CAD','fit_checked','approved_LED_model_and_mark','photo_path','production_approved'])
 for p in products:w.writerow([p['name'],p['slug'],'','',p['material'],'','','','','','','','','','',''])
# Drafts remain in GitHub, never posted automatically.
listings=[
 ('led-name-sign','Personalised LED Name Sign, Custom Desk or Studio Sign, Made in Toronto','Light up your studio or desk with lettering made for your space. Send your name or channel text and choose the size, font and colours. We send a proof before printing.','custom name sign,led desk sign,studio decor,gamer name sign,toronto made,canadian maker,personalised gift,streamer sign,office name sign,usb light sign,custom lettering,desk setup,adult room decor'),
 ('lithophane-photo-box','Custom Lithophane Photo Light Box, Personalised Photo Lamp, Toronto Made','Turn your own photos into panels that reveal their detail when lit. Choose an 80, 100 or 150 mm box, frame colour and light option. Bright, sharp photos work best.','lithophane lamp,photo light box,custom photo gift,memory lamp,photo keepsake,toronto made,canadian gift,personalised lamp,photo cube,custom night light,pet photo lamp,usb photo lamp,adult home decor'),
 ('pet-memorial-light','Pet Memorial Photo Light, Personalised Pet Keepsake, Made in Toronto','A quiet keepsake for a much-loved pet. Send a clear photo and the name you would like on the piece. We check the image and send a proof before making it.','pet memorial,pet photo light,dog keepsake,cat keepsake,pet remembrance,memorial lamp,photo keepsake,pet loss gift,toronto made,canadian maker,custom pet gift,personalised lamp,usb photo light'),
 ('qr-review-stand','Custom QR Counter Stand for Cafes and Salons, Business Logo Sign, Toronto Made','Give customers a clear way to find your review page, booking page or menu. Send your destination link and optional logo. Choose rectangle or arch and add NFC if needed. We check the link with you before printing.','qr code stand,review qr sign,cafe counter sign,salon counter sign,custom logo stand,business qr code,booking qr sign,menu qr stand,toronto business,nfc stand,review counter sign,shop counter decor,canadian made'),
 ('desk-nameplate','Personalised Desk Nameplate, Custom Name and Title Sign, Made in Toronto','A clean nameplate for a desk, reception area or shared workspace. Add a name, optional second line and your choice of style and colours. A proof lets you check spelling before we print.','desk nameplate,custom desk sign,office name plate,reception sign,personalised desk,name and title,toronto made,canadian maker,new office gift,custom nameplate,desk accessory,small business sign,adult office decor'),
 ('wall-name-sign','Personalised Wall Name Sign for Studios and Home Offices, Toronto Made','Custom raised lettering for an adult workspace or home wall. Choose a font and colour and send your text. We confirm dimensions and mounting details with your proof. Wall decor only.','wall name sign,studio wall decor,home office sign,custom lettering,personalised sign,adult room decor,toronto made,canadian maker,office name sign,custom wall sign,workshop sign,raised letters,creative space'),
 ('personalised-headphone-stand','Personalised Headphone Stand, Custom Desk Accessory with Name, Toronto Made','Give your headphones a home on your desk. Add a name and choose your preferred colours. We confirm the size and lettering in a digital proof before production.','headphone stand,custom desk stand,headset holder,personalised desk,gamer desk gift,desk accessory,studio desk decor,toronto made,canadian maker,name headphone stand,adult gamer gift,office accessory,desk organiser'),
 ('battery-mounts','Battery Wall Mounts, Fits Selected Tool Batteries, Toronto Made Garage Storage','Organise spare tool batteries on your wall. Choose your confirmed battery platform, pack size, colour and mounting style. Batteries and tools are not included. Fit is checked against the exact model before release.','battery wall mount,garage organiser,tool battery holder,workshop storage,wall battery rack,garage wall storage,tool storage,canadian made,toronto maker,battery mount pack,workshop organiser,garage accessory,tool wall mount')]
parts=['# Etsy listing drafts - approval required\n\nDo not post until original design/source ownership, real photos, sample fit, prices, LED approval and Canada-only delivery are confirmed. Battery mounts stay off Etsy until the design is demonstrably ours. Titles and 13 tags are ready; prices below are website drafts, before Etsy fees. Do not claim ready stock.\n\nEtsy orders and payments must remain on Etsy. These drafts do not direct Etsy buyers to pay elsewhere. Sources checked Nov 4: https://www.etsy.com/legal/creativity/ and https://www.etsy.com/ca/legal/sellers .\n']
for slug,title,description,tags in listings:
 p=by[slug];taglist=tags.split(',');assert len(title)<=140;assert len(taglist)==13;assert all(len(t)<=20 for t in taglist),(slug,taglist)
 fields=[]
 for c in p['options'].get('choices',[]):fields.append(c['name']+': '+', '.join(v if isinstance(v,str) else v['label'] for v in c['values']))
 if p['options'].get('size'):fields.append('Size: '+', '.join(v['label'] for v in p['options']['size']))
 if p['options'].get('colour'):fields.append('Colour: '+', '.join(p['options']['colour']))
 if p['options'].get('frameColour'):fields.append('Frame colour: '+', '.join(p['options']['frameColour']))
 parts.append(f"\n## {p['name']}\n\nTitle: {title}\n\nWebsite draft base: ${p['price']} CAD. Confirm marketplace margin before posting.\n\n{description}\n\nMaterial: {p['material']}. Fine layer lines are part of the print. Made to order in Toronto. Allow 5-7 business days after proof approval, plus shipping. Canada only. Personalised work is not returnable for change of mind after printing starts; faulty or incorrect items are handled by remake or refund. Adult use only.\n")
 if p.get('led'):parts.append('\nPublish only with confirmed cUL/CSA/cETL-approved USB module model and matching power supply; add those actual specifications to the listing.\n')
 if slug=='battery-mounts':parts.append('\nBrand names only describe fit. Not affiliated with or endorsed by Milwaukee Tool, DeWalt, Ryobi or other listed manufacturers. No logos. Do not release a brand until fit-tested.\n')
 parts.append('\nOptions:\n'+''.join('- '+f+'\n' for f in fields))
 parts.append('\nPersonalisation prompt: Send the requested name/text, size and spelling exactly as you want them. Send photos, destination link or permitted logo through Etsy Messages where relevant. We send one proof and include one revision. Reply with approval before we print.\n\nPhotos needed: actual finished hero, detail, scale, in-use and options; LED items also lit/unlit. No AI first photo.\n\nTags: '+', '.join(taglist)+'\n')
(OUT/'etsy-listings.md').write_text(''.join(parts))
