import sys
from PIL import Image
fan = Image.open(sys.argv[1]).convert('RGBA')          # 51 x 51 case-fan texture
big = fan.resize((fan.width * 3, fan.height * 3), Image.NEAREST)   # whole pixels only
o = (big.width - 144) // 2
big.crop((o, o, o + 144, o + 144)).save(sys.argv[2]); print('icon 144x144 from', fan.size)
