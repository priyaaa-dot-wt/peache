(function(){var d=document,q=new URLSearchParams(location.search),c=q.get('c')||'all',s=(q.get('s')||'').toLowerCase(),page=d.body.dataset.page;
function $(x){return d.querySelector(x)}
d.querySelectorAll('#site-nav a').forEach(function(a){if(page==='shop'&&!s&&a.dataset.key===c){a.classList.remove('border-transparent','text-[#73564F]');a.classList.add('border-[#D98F78]','text-[#9B6254]')}});
$('#site-search-btn').onclick=function(){$('#site-search').classList.toggle('hidden');$('#site-search-input').focus()};
$('#site-menu-btn').onclick=function(){var m=$('#mobile-nav');m.classList.toggle('hidden');m.classList.toggle('flex')};
$('#site-search-input').onkeydown=function(e){if(e.key==='Enter')location.href='shop.html?s='+encodeURIComponent(this.value)};
var bag=$('#cart-drawer-trigger');
if(typeof openCartDrawer==='function'){bag.onclick=function(e){e.preventDefault();openCartDrawer()};if(location.hash==='#bag')openCartDrawer()}
if(page==='shop'){var cards=[].slice.call(d.querySelectorAll('article')),keys={pearl:'pearl edit',crystal:'crystal edit',wedding:'wedding favour'},n=0,cnt={all:cards.length,pearl:0,crystal:0,wedding:0};
cards.forEach(function(a){var t=a.textContent.toLowerCase();for(var k in keys)if(t.indexOf(keys[k])>-1)cnt[k]++;
var ok=(c==='all'||t.indexOf(keys[c])>-1)&&(!s||t.indexOf(s)>-1);a.style.display=ok?'':'none';if(ok)n++});
var h=$('h1');h.textContent=s?'Results for "'+q.get('s')+'"':({pearl:'The Pearl Edit',crystal:'The Crystal Edit',wedding:'The Wedding Favour Edit'}[c]||'All Bags');
d.querySelectorAll('p').forEach(function(p){if(/^\s*Showing/.test(p.textContent))p.innerHTML='Showing <b>'+n+'</b> of <b>'+cnt.all+'</b> bags'});
var pills=[].slice.call(d.querySelectorAll('section button')).filter(function(b){return /All Pieces|Pearl Edit|Crystal Edit|Wedding Favour Edit/.test(b.textContent)&&b.querySelector('span:last-child')});
var on=pills[0]&&pills[0].className,off=pills[1]&&pills[1].className,ks=['all','pearl','crystal','wedding'];
pills.forEach(function(b,i){b.className=(ks[i]===c&&!s)?on:off;b.querySelector('span:last-child').textContent='('+cnt[ks[i]]+')';b.onclick=function(){location.href=i?'shop.html?c='+ks[i]:'shop.html'}});
if(!n){var g=cards[0]&&cards[0].parentNode;if(g)g.insertAdjacentHTML('beforebegin','<p class="mb-6">No bags found. Try another word.</p>')}}
})();