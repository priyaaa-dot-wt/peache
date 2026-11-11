(function(){var C=window.PEACHE,d=document,$=function(x){return d.querySelector(x)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})},money=function(n){return '₹'+Number(n).toLocaleString('en-IN')};
var LAB={under_review:'Under review',confirmed:'Confirmed – payment pending',paid:'Payment received',ready:'Ready to dispatch',dispatched:'Dispatched',delivered:'Delivered',cancelled:'Cancelled'};
var NEXT={under_review:['confirmed','Confirm order'],confirmed:['paid','Mark payment received'],paid:['ready','Mark ready to dispatch'],ready:['dispatched','Mark dispatched'],dispatched:['delivered','Mark delivered']};
var TABS=[['all','All'],['under_review','Under review'],['confirmed','Payment pending'],['paid','Paid'],['ready','Ready'],['dispatched','Dispatched'],['delivered','Delivered'],['cancelled','Cancelled']];
var S=JSON.parse(localStorage.getItem('peache-admin')||'null'),orders=[],sel=null,filter=new URLSearchParams(location.search).get('f')||'all',timer;
function keep(s){S=s;s?localStorage.setItem('peache-admin',JSON.stringify(s)):localStorage.removeItem('peache-admin')}
async function auth(body,type){var r=await fetch(C.url+'/auth/v1/token?grant_type='+type,{method:'POST',headers:{apikey:C.key,'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();if(!r.ok)throw new Error(j.error_description||j.msg||'Sign in failed');keep({access:j.access_token,refresh:j.refresh_token})}
async function api(path,method,body,again){var r=await fetch(C.url+path,{method:method||'GET',headers:{apikey:C.key,Authorization:'Bearer '+S.access,'Content-Type':'application/json',Prefer:'return=minimal'},body:body?JSON.stringify(body):undefined});
 if(r.status===401&&!again&&S.refresh){try{await auth({refresh_token:S.refresh},'refresh_token')}catch(e){keep(null);location.reload();return r}return api(path,method,body,true)}return r}
function view(v){['loading','login','app'].forEach(function(i){$('#'+i).classList.toggle('hidden',i!==v)});$('#signout').classList.toggle('hidden',v!=='app')}
async function start(){if(!S){view('login');return}
 var r=await api('/rest/v1/rpc/is_admin','POST',{});var ok=r.ok&&await r.json();
 if(!ok){keep(null);view('login');$('#err').textContent='This account is not an admin.';return}
 view('app');await load();clearInterval(timer);timer=setInterval(load,60000)}
async function load(){var r=await api('/rest/v1/orders?select=*&order=created_at.desc&limit=500');if(!r.ok)return;orders=await r.json();draw()}
function match(o){return filter==='all'||(filter==='active'?['confirmed','paid','ready','dispatched'].indexOf(o.status)>-1:o.status===filter)}
function ago(t){var m=Math.round((Date.now()-new Date(t))/60000);return m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'}
function names(o){return (o.items||[]).map(function(i){return i.name+(i.qty?' ×'+i.qty:'')}).join(', ')}
function draw(){var c={};orders.forEach(function(o){c[o.status]=(c[o.status]||0)+1});
 $('#nav-new')&&($('#nav-new').textContent=(c.under_review||0)+' New');
 $('#ttl').textContent=filter==='active'?'Confirmed orders':'Orders';
 $('#kpis').innerHTML=['under_review','confirmed','paid','ready','dispatched','delivered'].map(function(k){return '<div class="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm"><p class="font-label-caps text-label-caps text-secondary uppercase">'+LAB[k]+'</p><p class="font-headline-lg text-headline-lg text-primary">'+(c[k]||0)+'</p></div>'}).join('');
 $('#tabs').innerHTML=TABS.map(function(t){return '<button data-f="'+t[0]+'" class="px-3.5 py-1.5 rounded-lg font-label-md '+(filter===t[0]?'bg-primary text-on-primary':'bg-surface-container text-on-surface-variant')+'">'+t[1]+(t[0]==='all'?' ('+orders.length+')':' ('+(c[t[0]]||0)+')')+'</button>'}).join('');
 var l=orders.filter(match);if(!sel||!l.some(function(o){return o.id===sel}))sel=l[0]&&l[0].id;
 $('#list').innerHTML=l.length?l.map(function(o){return '<div data-id="'+esc(o.id)+'" class="p-space-sm rounded-xl bg-surface-container-lowest cursor-pointer '+(o.id===sel?'ring-2 ring-primary shadow-md':'shadow-sm')+'"><div class="flex justify-between gap-2"><div><p class="font-label-caps text-label-caps text-primary">'+esc(o.ref)+'</p><p class="font-headline-sm text-headline-sm text-primary">'+esc(o.name)+'</p><p class="text-body-sm text-on-surface-variant">'+esc(names(o))+'</p></div><div class="text-right shrink-0"><p class="font-headline-sm text-primary">'+(o.total?money(o.total):'Price to confirm')+'</p><p class="text-body-sm text-secondary">'+ago(o.created_at)+'</p></div></div><span class="inline-block mt-2 px-2 py-0.5 rounded bg-secondary-container text-primary font-label-caps text-label-caps">'+LAB[o.status]+'</span></div>'}).join(''):'<p class="p-6 text-on-surface-variant">No orders here yet.</p>';
 detail()}
function wa(o){var p=String(o.phone).replace(/\D/g,'');if(p.length===10)p='91'+p;var t='Hi '+o.name+', this is PEACHE about your order '+o.ref+'. ';
 if(o.status==='under_review'||o.status==='confirmed')t+='Your order is confirmed.'+(o.total?' Total: '+money(o.total)+'.':'')+(o.delivery_date?' Delivery date: '+o.delivery_date+'.':'')+(o.payment_link?' You can pay here: '+o.payment_link:'');
 else if(o.status==='paid')t+='We got your payment. Thank you! We are making your bag now.';else if(o.status==='ready')t+='Your bag is ready and will be sent soon.';
 else if(o.status==='dispatched')t+='Your bag has been sent.'+(o.courier?' Courier: '+o.courier+'.':'')+(o.awb?' Tracking number: '+o.awb+'.':'');else if(o.status==='delivered')t+='Your bag has been delivered. We hope you love it!';
 return 'https://wa.me/'+p+'?text='+encodeURIComponent(t)}
function detail(){var o=orders.filter(function(x){return x.id===sel})[0];if(!o){$('#detail').innerHTML='';return}
 var n=NEXT[o.status],f=function(k,l,t){return '<label class="block text-body-sm mt-3">'+l+'<input data-k="'+k+'" value="'+esc(o[k]||'')+'" '+(t||'')+' class="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container border border-outline-variant"></label>'};
 $('#detail').innerHTML='<div class="p-space-md rounded-xl bg-surface-container-lowest shadow-md"><p class="font-label-caps text-label-caps text-secondary uppercase">'+esc(o.ref)+' · '+LAB[o.status]+'</p><h2 class="font-headline-md text-headline-md text-primary">'+esc(o.name)+'</h2>'
 +'<p class="text-body-sm mt-1">Phone: <b>'+esc(o.phone)+'</b>'+(o.email?' · '+esc(o.email):'')+'</p>'+(o.address?'<p class="text-body-sm">Address: '+esc(o.address)+'</p>':'')+(o.event_date?'<p class="text-body-sm">Event date: '+esc(o.event_date)+'</p>':'')+(o.note?'<p class="text-body-sm mt-2 p-2 rounded bg-secondary-container/40">Note: '+esc(o.note)+'</p>':'')
 +'<ul class="mt-3">'+(o.items||[]).map(function(i){return '<li class="py-1.5 border-b border-outline-variant/50">'+esc(i.name)+(i.qty?' × '+esc(i.qty):'')+(i.options?'<br><small>'+esc(i.options)+'</small>':'')+'</li>'}).join('')+'</ul><p class="text-right mt-2"><b>'+(o.total?'Total: '+money(o.total):'Price not set')+'</b></p>'
 +f('delivery_date','Delivery date (shown to customer)')+f('payment_link','Razorpay payment link')+f('courier','Courier')+f('awb','Tracking number')
 +'<div class="flex flex-wrap gap-2 mt-4"><button id="save" class="px-4 py-2.5 rounded-lg bg-surface-container-high text-primary font-label-md">Save details</button>'+(n?'<button id="next" class="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md">'+n[1]+'</button>':'')+'<a target="_blank" rel="noopener" href="'+esc(wa(o))+'" class="px-4 py-2.5 rounded-lg bg-surface-container text-primary font-label-md">Message on WhatsApp</a>'+(o.status!=='cancelled'&&o.status!=='delivered'?'<button id="cancel" class="px-4 py-2.5 rounded-lg bg-error-container text-on-error-container font-label-md">Cancel order</button>':'')+'</div><p id="msg" class="text-body-sm mt-2"></p></div>'}
async function patch(o,b,m){var r=await api('/rest/v1/orders?id=eq.'+encodeURIComponent(o.id),'PATCH',Object.assign(b,{updated_at:new Date().toISOString()}));$('#msg')&&($('#msg').textContent=r.ok?(m||'Saved.'):'Could not save. Please try again.');if(r.ok){Object.assign(o,b);draw()}}
d.addEventListener('click',function(e){var t=e.target,x;
 if(x=t.closest('[data-f]')){filter=x.dataset.f;draw()}else if(x=t.closest('[data-id]')){sel=x.dataset.id;draw()}
 var o=orders.filter(function(z){return z.id===sel})[0];if(!o)return;
 if(t.id==='save'){var b={};d.querySelectorAll('#detail [data-k]').forEach(function(i){b[i.dataset.k]=i.value.trim()||null});patch(o,b)}
 if(t.id==='next'){var b={};d.querySelectorAll('#detail [data-k]').forEach(function(i){b[i.dataset.k]=i.value.trim()||null});b.status=NEXT[o.status][0];patch(o,b,'Status updated.')}
 if(t.id==='cancel'&&confirm('Cancel this order?'))patch(o,{status:'cancelled'},'Cancelled.')});
$('#lf').onsubmit=async function(e){e.preventDefault();$('#err').textContent='';try{await auth({email:$('#em').value,password:$('#pw').value},'password');start()}catch(x){$('#err').textContent=x.message}};
$('#refresh').onclick=load;$('#signout').onclick=function(){keep(null);location.reload()};start()})();