import sys
from PIL import Image
# usage: sheet.py out.png img1 img2 ... (side by side, top aligned)
out=sys.argv[1];ims=[Image.open(p).convert('RGB') for p in sys.argv[2:]]
W=sum(i.width for i in ims)+12*(len(ims)-1);H=max(i.height for i in ims)
s=Image.new('RGB',(W,H),(60,60,60));x=0
for i in ims:s.paste(i,(x,0));x+=i.width+12
s.save(out);print(s.size)
