// ---------- Sprout category icons: original line glyphs on soft gradient tiles ----------
const CICO={
 groc:['#74d497','#2f9e58','M4 9.5h16l-1.7 8.7a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L4 9.5zM8.5 9.5 12 4l3.5 5.5M9.5 13.5v2.5M14.5 13.5v2.5'],
 dine:['#7fd6c2','#2a9a84','M5 9.5h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5zM16 10.5h1.4a2.4 2.4 0 0 1 0 4.8H16M8.5 3.5c-.8 1 .8 1.8 0 3M12 3.5c-.8 1 .8 1.8 0 3'],
 gas:['#86c9de','#3a8cab','M5 17v-4.5L7 7.5h10l2 5V17M4.5 17h15M7 17v2M17 17v2M7.5 13.5h.01M16.5 13.5h.01M6.2 11h11.6'],
 shop:['#bde089','#68a63c','M6 8.5h12l-1 11.5H7L6 8.5zM9.2 8.5V7a2.8 2.8 0 0 1 5.6 0v1.5'],
 subs:['#63c493','#1f7a4d','M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15M4.5 19.5V15H9M10.7 9.8v4.4l3.6-2.2z'],
 health:['#f6ab97','#d9685a','M20 9a4.3 4.3 0 0 0-8-2.3A4.3 4.3 0 0 0 4 9c0 4.8 8 10 8 10s8-5.2 8-10zM7.5 12h2.2l1.3-2.2 2 4.4 1.3-2.2h2.2'],
 fun:['#f8d77f','#dd9f2b','M4.5 8a2 2 0 0 0 2-2h11a2 2 0 0 0 2 2v2.2a1.8 1.8 0 0 0 0 3.6V16a2 2 0 0 0-2 2h-11a2 2 0 0 0-2-2v-2.2a1.8 1.8 0 0 0 0-3.6zM10 7v1.5M10 11v2M10 15.5V17'],
 bill:['#a8c0e6','#5779b4','M6.5 3.5h11v17l-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4-2.2-1.4zM9.5 8h5M9.5 11.5h5M9.5 15h3'],
 bas:['#a3e3b8','#45b06f','M5.5 18.5c0-7.5 5-12.5 13-13.5 0 8.5-5 13.5-13 13.5zM5.5 18.5l6.5-6.5'],
 oth:['#f7c3a8','#e08a62','M12 4l2 4.8 5.2.5-3.9 3.5 1.1 5.1L12 15.3l-4.4 2.6 1.1-5.1-3.9-3.5 5.2-.5z'],
 misc:['#bfd6c8','#7c9e8a','M5 5h5.5v5.5H5zM13.5 5H19v5.5h-5.5zM5 13.5h5.5V19H5zM13.5 13.5H19V19h-5.5z']};
const CICOALIAS={din:'dine',all:'misc',everything:'misc'};
function catIcon(k,cls){const key=CICO[k]?k:(CICOALIAS[k]||(k==='oth'?'oth':'misc')),c=CICO[key]||CICO.misc;
  return '<span class="cico'+(cls?' '+cls:'')+'" style="--ca:'+c[0]+';--cb:'+c[1]+'" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="'+c[2]+'"/></svg></span>'}
// small glyphs for quick-action menus (replacing text symbols)
const SYMI={'★':CICO.fun[2],'●':CICO.bas[2],'↻':'M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15M4.5 19.5V15H9','✎':'M5 19l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L9 18l-4 1zM14 7l3 3','✕':'M6 6l12 12M18 6L6 18','+':'M12 5v14M5 12h14'};
const symIcon=s=>SYMI[s]?'<svg viewBox="0 0 24 24" class="symi"><path d="'+SYMI[s]+'"/></svg>':s;
