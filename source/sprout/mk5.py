from stick_patch import apply
import lp_patch, focus_patch
s=open('sprout_v2.html').read()
import tree_patch, tabs_patch
open("sprout_v2.html","w").write(tabs_patch.apply(tree_patch.apply(focus_patch.apply(lp_patch.apply(apply(s,True),True)))))
