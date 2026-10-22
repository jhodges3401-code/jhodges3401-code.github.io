/* Orvian Market consent banner + Google Consent Mode v2. GA4 loads only after Accept. */
(function(){
var ID='G-F3QH6E9QR7',KEY='om_consent_v1',w=window,d=document;
w.dataLayer=w.dataLayer||[];
function get(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function set(v){try{localStorage.setItem(KEY,v);}catch(e){}}
var loaded=false;
function loadGA(){
  if(loaded)return;loaded=true;w.__omConsent=true;
  w.gtag('consent','update',{analytics_storage:'granted'});
  var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;d.head.appendChild(s);
}
function clearGA(){
  var host=location.hostname,parts=host.split('.'),doms=['',host,'.'+host];
  if(parts.length>1)doms.push('.'+parts.slice(-2).join('.'));
  d.cookie.split(';').forEach(function(c){var n=c.split('=')[0].trim();if(/^_ga/.test(n)||n==='_gid'||n==='_gat'){doms.forEach(function(dm){d.cookie=n+'=; Max-Age=0; path=/'+(dm?'; domain='+dm:'');});}});
}
var css='#om-cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;background:#0b1220;color:#f1f5f9;border-radius:14px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:15px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}'+
'#om-cb p{margin:0 0 12px;color:#f1f5f9}#om-cb a{color:#5eead4}#om-cb .om-b{display:flex;gap:10px;flex-wrap:wrap}'+
'#om-cb button{flex:1 1 120px;min-height:44px;border-radius:10px;font:600 15px/1 inherit;font-family:inherit;cursor:pointer;border:2px solid #f1f5f9}'+
'#om-cb .om-a{background:#f1f5f9;color:#0b1220}#om-cb .om-r{background:transparent;color:#f1f5f9}'+
'#om-cb button:focus-visible{outline:3px solid #5eead4;outline-offset:2px}'+
'.om-cs{background:none;border:0;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}';
function banner(){
  if(d.getElementById('om-cb'))return;
  if(!d.getElementById('om-cs-css')){var st=d.createElement('style');st.id='om-cs-css';st.textContent=css;d.head.appendChild(st);}
  var b=d.createElement('div');b.id='om-cb';b.setAttribute('role','dialog');b.setAttribute('aria-modal','false');b.setAttribute('aria-labelledby','om-cb-t');
  b.innerHTML='<p id="om-cb-t">We\u2019d like to use Google Analytics cookies to count visits and see which products people click. Nothing loads unless you accept. <a href="/privacy.html">Privacy note</a></p><div class="om-b"><button type="button" class="om-r">Reject</button><button type="button" class="om-a">Accept</button></div>';
  d.body.appendChild(b);
  b.querySelector('.om-a').onclick=function(){set('granted');b.remove();loadGA();};
  b.querySelector('.om-r').onclick=function(){var was=get()==='granted';set('denied');b.remove();clearGA();if(was||loaded)location.reload();};
  b.addEventListener('keydown',function(e){if(e.key==='Escape'){b.querySelector('.om-r').click();}});
  b.querySelector('.om-r').focus({preventScroll:true});
}
w.omConsentSettings=function(){banner();};
function footerLink(){
  var f=d.querySelector('footer');if(!f||d.getElementById('om-cs-link'))return;
  if(!d.getElementById('om-cs-css')){var st=d.createElement('style');st.id='om-cs-css';st.textContent=css;d.head.appendChild(st);}
  var p=d.createElement('p');p.style.margin='8px 0 0';
  var btn=d.createElement('button');btn.type='button';btn.id='om-cs-link';btn.className='om-cs';btn.textContent='Cookie settings';btn.onclick=banner;
  p.appendChild(btn);f.appendChild(p);
}
function init(){footerLink();var c=get();if(c==='granted')loadGA();else if(c!=='denied')banner();}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})();
