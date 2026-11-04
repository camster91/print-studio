from pathlib import Path
from io import BytesIO
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("Studio", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Studio-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(OUT/'layerline-counter-card.pdf'),pagesize=(612,792))
c.setTitle('Layerline Studio - draft counter card')
url='https://layerline.ca/business/?utm_source=local&utm_medium=counter_card&utm_campaign=launch'
qr=qrcode.make(url);buf=BytesIO();qr.save(buf,format='PNG');buf.seek(0)
for y in [420,72]:
 x=54;w=504;h=300
 c.setStrokeColor(HexColor('#D9D5CE'));c.rect(x,y,w,h)
 c.setFillColor(HexColor('#F4F2EE'));c.rect(x+1,y+1,w-2,h-2,fill=1,stroke=0)
 c.setFillColor(HexColor('#FF5B1F'));c.rect(x+20,y+h-50,8,24,fill=1,stroke=0)
 c.setFillColor(HexColor('#141414'));c.setFont('Studio-Bold',20);c.drawString(x+40,y+h-43,'LAYERLINE STUDIO')
 c.setFont('Studio-Bold',24);c.drawString(x+24,y+205,'A small stand.');c.drawString(x+24,y+176,'A clear next step.')
 c.setFont('Studio',12)
 for i,line in enumerate(['Custom QR stands for reviews,','bookings and menus.','Made in Toronto. Proof before print.']):c.drawString(x+24,y+144-i*18,line)
 c.setFont('Studio-Bold',12);c.drawString(x+24,y+73,'From $25 CAD. Three from $60.')
 c.setFont('Studio',11);c.drawString(x+24,y+53,'NFC optional. Prices before applicable tax.')
 c.drawImage(ImageReader(buf),x+355,y+105,125,125)
 c.setFont('Studio-Bold',12);c.drawString(x+24,y+28,'layerline.ca/business')
 c.setFont('Studio',11);c.drawRightString(x+w-24,y+28,'hello@layerline.ca')
 c.setFont('Studio',8);c.drawString(x+24,y+10,'DRAFT - approve prices and samples before distribution')
c.setFillColor(HexColor('#555555'));c.setFont('Studio',9);c.drawString(54,36,'Print at 100% on letter paper. Cut on the grey lines. QR leads to our real business page.')
c.save()
print(OUT/'layerline-counter-card.pdf')
