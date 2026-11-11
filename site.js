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
(function(){var C=window.PEACHE,d=document,$=function(x){return d.querySelector(x)},page=d.body.dataset.page,q=new URLSearchParams(location.search);
var money=function(n){return '₹'+Number(n).toLocaleString('en-IN')};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
d.querySelectorAll('a[href*="wa.me/91"]').forEach(function(a){a.href=a.href.replace(/wa\.me\/\d+/,'wa.me/'+C.wa)});
function rnd(){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='',r=crypto.getRandomValues(new Uint8Array(6));for(var i=0;i<6;i++)s+=a[r[i]%a.length];return 'PCH-'+s}
async function place(o){o.ref=rnd();var r=await fetch(C.url+'/rest/v1/orders',{method:'POST',headers:{apikey:C.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(o)});if(!r.ok)throw new Error(await r.text());return o.ref}
async function send(e,o){var b=e.target.querySelector('[type=submit]');if(b){b.disabled=true;b.style.opacity='.6'}
 try{var ref=await place(o);location.href='order-confirmation.html?ref='+ref+'&phone='+encodeURIComponent(o.phone)}
 catch(x){if(b){b.disabled=false;b.style.opacity=''}alert('Sorry, we could not save your order. Please message us on WhatsApp instead.');window.open('https://wa.me/'+C.wa+'?text='+encodeURIComponent('Hi PEACHE, I want to order: '+o.items.map(function(i){return i.name+(i.qty?' x'+i.qty:'')}).join(', ')+'. Name: '+o.name))}}
if(page==='index'){
 window.handleOrderSubmit=function(e){e.preventDefault();var i=e.target.querySelectorAll('input'),nm=$('#modal-product-name').textContent,items,total;
  if(/^Your Bag/.test(nm)){items=[].slice.call(d.querySelectorAll('#cart-items-container > div[id^=cart-item]')).map(function(r){var qe=r.querySelector('span[id^=qty-]');return{name:r.querySelector('h3').textContent.trim(),qty:qe?+qe.textContent:1}});total=typeof cartTotalAmount!=='undefined'?cartTotalAmount:0}
  else{items=[{name:nm,qty:1}];total=parseInt((($('#modal-product-price').textContent.match(/[\d,]+/)||['0'])[0]).replace(/,/g,''),10)}
  send(e,{name:i[0].value.trim(),phone:i[1].value.trim(),note:i[2].value.trim()||null,items:items,total:total||0})};
 window.handleFavourSubmit=function(e){e.preventDefault();var f=e.target,i=f.querySelectorAll('input');
  send(e,{name:i[0].value.trim(),phone:i[1].value.trim(),event_date:i[2].value||null,note:f.querySelector('textarea').value.trim()||null,items:[{name:'Wedding favours ('+f.querySelector('select').value+')',qty:null}],total:0})}}
if(page==='product'){
 window.handleOrderSubmit=function(e){e.preventDefault();var v=function(id){return ($('#'+id).value||'').trim()},op=[selectedLustre];if(hasMonogram)op.push('Initials: '+(monogramText||'-'));
  send(e,{name:v('client-name'),phone:v('client-phone'),email:v('client-email')||null,address:v('client-address'),event_date:$('#event-date').value||null,note:[$('#gifting-role').selectedOptions[0].text,v('gift-note')].filter(Boolean).join(' | ')||null,items:[{name:'The Aurelia Pearl Frame',qty:currentQty,options:op.join(', ')}],total:(basePrice+(hasMonogram?monogramPrice:0))*currentQty})}}
if(page==='tracking'||page==='order-confirmation'){
 var ST=['Order Submitted','Under Review','Confirmed','Payment Received','Ready to Dispatch','Dispatched','Delivered'],IDX={under_review:1,confirmed:2,paid:3,ready:4,dispatched:5,delivered:6};
 function draw(o){var i=IDX[o.status]||0,can=o.status==='cancelled';
  var steps=ST.map(function(s,k){var on=!can&&k<=i,cur=!can&&k===i;return '<div class="p-3 rounded-lg text-center '+(cur?'bg-[#D98F78] text-white':on?'bg-[#F8E5DC] text-[#9B6254]':'bg-white border border-[#EAD8D0] text-[#73564F] opacity-60')+'"><div class="text-[11px] uppercase tracking-wider font-medium">'+(k+1)+'. '+s+'</div></div>'}).join('');
  var items=(o.items||[]).map(function(x){return '<li class="py-2 border-b border-[#EAD8D0]">'+esc(x.name)+(x.qty?' × '+esc(x.qty):'')+(x.options?'<br><small>'+esc(x.options)+'</small>':'')+'</li>'}).join('');
  var msg='Hi PEACHE, my order number is '+o.ref;
  $('#t-result').innerHTML='<div class="bg-white border border-[#EAD8D0] rounded-xl p-6"><p class="text-[11px] uppercase tracking-[0.2em]">Order number</p><p class="text-3xl text-[#9B6254]" style="font-family:\'Playfair Display\',serif">'+esc(o.ref)+'</p>'
  +(can?'<p class="mt-3 font-medium text-[#9B6254]">This order was cancelled. Message us if you have questions.</p>':'')
  +'<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-5">'+steps+'</div>'
  +'<ul class="mt-5">'+items+'</ul>'+(o.total?'<p class="mt-3 text-right"><b>Total: '+money(o.total)+'</b></p>':'<p class="mt-3 text-sm">We will tell you the price on WhatsApp.</p>')
  +'<div class="mt-4 text-sm bg-[#F8E5DC] rounded-lg p-4">'+(o.delivery_date?'<p>Delivery date: <b>'+esc(o.delivery_date)+'</b></p>':'<p>We will confirm your delivery date on WhatsApp.</p>')+(o.courier?'<p>Courier: '+esc(o.courier)+(o.awb?' · Tracking number: <b>'+esc(o.awb)+'</b>':'')+'</p>':'')+'<p>Delivery: 5–15 days in India · 15–25 days worldwide.</p></div>'
  +'<a class="inline-block mt-5 bg-[#D98F78] hover:bg-[#9B6254] text-white px-6 py-3 rounded" href="https://wa.me/'+C.wa+'?text='+encodeURIComponent(msg)+'">Message us on WhatsApp</a></div>'}
 async function look(ref,phone){var r=$('#t-result');r.innerHTML='<p>Looking...</p>';
  try{var x=await fetch(C.url+'/rest/v1/rpc/track_order',{method:'POST',headers:{apikey:C.key,'Content-Type':'application/json'},body:JSON.stringify({p_ref:ref,p_phone:phone})}),j=await x.json();
   if(!x.ok)throw 0;if(!j.length){r.innerHTML='<p class="bg-[#F8E5DC] rounded-lg p-4">We could not find that order. Please check the order number and phone number.</p>';return}draw(j[0])}
  catch(e){r.innerHTML='<p class="bg-[#F8E5DC] rounded-lg p-4">Something went wrong. Please try again, or message us on WhatsApp.</p>'}}
 var ref=q.get('ref'),ph=q.get('phone');
 if(page==='order-confirmation'&&ref&&ph){$('#t-form').style.display='none';$('#t-title').textContent='We got your order request';$('#t-sub').innerHTML='Your order number is <b>'+esc(ref)+'</b>. Please keep it. We will message you on WhatsApp to confirm. You pay nothing until we confirm.'}
 $('#t-form').onsubmit=function(e){e.preventDefault();look($('#t-ref').value,$('#t-phone').value)};
 if(ref&&ph){$('#t-ref').value=ref;$('#t-phone').value=ph;look(ref,ph)}}
})();