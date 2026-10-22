# Third pass: fixes found when verifying pass 2.
f='bonsai_site.html';s=open(f).read()
css='''
/* grid columns may shrink below their content on small phones (was 9px of sideways scroll at 360px) */
.askx .wrap{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
@media (max-width:860px){.askx .wrap{grid-template-columns:minmax(0,1fr)}}
.askx .wrap>*,.hero .wrap>*,.snap .wrap>*,.streak .wrap>*,.priv .wrap>*{min-width:0}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]
assert '—' not in s
open(f,'w').write(s);print('site fix 3 ok')
