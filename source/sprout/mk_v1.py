from stick_patch import apply
import lp_patch, focus_patch
s=open('sprout_v1_base.html').read()
open('sprout.html','w').write(focus_patch.apply(lp_patch.apply(apply(s,False),False)))
