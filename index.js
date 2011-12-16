/**
Piibel.NET client functions.
**/
function $__(e){if(typeof e=='string'){e=(document.layers&&document.layers[e])?document.layers[e]:((document.getElementById)?document.getElementById(e):null);}return e;}

// ajax
if(!window.ajax){ window.ajax={}; }
ajax={
  x: function(){try{return new ActiveXObject('Msxml2.XMLHTTP');}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP');}catch(f){return new XMLHttpRequest();}}},
  send: function(u,f,m,v,t,c){ var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4){f(x['response'+(t||Text)],c);}};x.send(v);},
  load: function(u,j,t,c){var f=function(){ajax.send(u,j,'GET',null,t,c);};return setTimeout(f,0);}
};

var load = (function() {
 var oo=function(e){
  var obj=null,type=typeof(e);
  if(type==='object'){ obj=e; }
  else if(type==='string') { obj=eval("("+e+")"); }
  //else if(type==='string') { obj=JSON.parse(e); }
  return obj;
 };
 var n=function(o){
  var s=o['url'],p=o['result'];
  var type=typeof(s);
  if(s&&type==='string'){
 var t=s.split(/\./);
 if(t[2]&&window[t[0]][t[1]]){return (window[t[0]][t[1]][t[2]]=p[t[2]]);}
 else if(t[1]&&window[t[0]]){return (window[t[0]][t[1]]=p[t[1]]);}
    return (window[s]=p[s]?p[s]:o);
  }
  if(type==='object'){return (s=p);}
  if(type==='function'){return s(p);}
  return true;
 };
 return function(e,b){
  var obj=oo(e);
  log(" loading:e:("+e+"),b:("+b+")");
  if(b instanceof Array){ for(var i=0,l=b.length;i<l;i++){ n({'url': b[i],'result': obj}); } }
  else { n({'url': b,'result': obj}); }
  return true;
 };
})();

/*
ajax.load('/b2/?t=json&q=Jh+1,1;',load,'Text',function(o){return null;});
ajax.send('/b2/?q=Jh+1,1',load,'GET',null,'XML');
ajax.send('/b2/?bbs=1&t=json',load,'GET',null,'Text');
ajax.send('/b2/?bbs=1&t=xml',load,'GET',null,'XML');
*/

if(!net) { var net={}; }
if(!net.piibel) {net.piibel={};}
net.piibel={
  history:[],
  context: {
    page_loaded: 0,
    bibles_loaded: 0,
    books_loaded: 0,
    pollid: 0,
    unpoll: 0,
    locked: 0,
    active_uri: '',
    back_lock: 0,
    active_div: "",
    next_div: "",
    hist_len:0,
    hist_pos:0,
    slide_dir: "pop" //0-right_to_left,1-left_to_right
  },
  state: {
    goy: null,
    book: 0,
    bookn: '', //name
    bookt: '', //title
    booki: 1,  //id
    chapt: 0,
    mode:'ptk',
    page: null,
    pages: null,
    show_pages: 10,
    q:'',
    find: '',
    found: '',
    count: 0,
    sens:0,
    rows:0,
    bv: [],
    default_bv: 'EST_97',
    page_slide_time: 500,
    page_slide_len: 700,
    page_slide_enabled:1
  },
  preload: function(){
    var t=(this.context)?this:window.net.piibel;
    t.context.active_uri='';
    t.loadb();
    log(new Date().getTime()+" preload done");
  },
  loadb: function(b){
    var t=(this.context)?this:window.net.piibel;
    var loaded=function(){
        if(t.books[66].abbr===''){ t.books.splice(66,1); }
        t.books.splice(66,0,{'id':680,'name':'------- Apokriivad ---','abbr':'apk'});
        t.context.books_loaded=1;
        //controls.navmenu.bookflow(1);
        //controls.navmenu.pageflow(1);
        //controls.bookform.bookselect("listen");
        controls.mainform.biblescontrol("show");
        t.context.bibles_loaded=1;
    };
    ajax.load('/b2/?xbb=1&lang=et&t=json',window.load,'Text',["net.piibel.books","net.piibel.bibles"]);
    //ajax.load('/b2/?t=json',window.load,'Text',"net.piibel.result");
    window.c_('net.piibel.bibles',function(){loaded();});
  },
  benchmark: function(callback, times) {
    var start = Date.now();
    for (i=0; i < (times || 1000); i++) {
      callback();
    }
    var end = Date.now();
    return end - start;
  },
  load: function(u){
    var uri='',url='';
    var t=(this.context)?this:window.net.piibel;
    var s=t.state;
    var c=t.context;
    var h='',i='',p=c.hist_pos;
    var time=new Date().getTime();
    var str='';
    //console.log("browser:"+browser('name')+" "+browser("ver"));
    //if(!context.books_loaded) { while(contect.books_loaded==0){setTimeout(function(){console.log("books still empty...");},1000);};}
    if(!c.bibles_loaded) { log(time+"bibles still empty..."); }
    if(t.lock()===false) { return false; }
    if(c.back_lock==1&&s.bv.length===0){ s.bv.push(s.default_bv); }
    controls.mainform.biblescontrol("update");
    url=t.update_querystr(u);
    uri=(url)?decodeURI(url):'';
    c.slide_dir="pop";
    for(var item=0,l=t.history.length-1;l>=item;l--){
      i=t.history[l];
      if(!h&&i&&i.uri==uri&&i.cur&&$__(i.cur)){ h=i.cur;c.hist_pos=l;break; }
      //if(i&&i.cur==c.active_div) {p={pg:i.page,pgs:i.pages};}
    }
    //console.log("load:"+i+" "+t.context.active_uri);
    if(url) { url= '?'+encodeURI(url); }
    url='/b2/'+url;
    //alert(url+" "+uri);
    if(uri!=c.active_uri||(s.q&&s.q.match(/random/gi))||(!uri&&!c.active_uri)){
      if($__('footer').style.visibility!='hidden'){$__('waiting').style.display="";}
      c.active_uri=uri;
      c.page_loaded=0;
      if(!h){
        c.next_div=''+time;
        c.hist_pos=c.hist_len=t.history.length;
        t.history.push({"prev":c.active_div,"cur":c.next_div,"pos":c.hist_len,"uri":uri,"btitle":'',"bname":'',"bid":'',"pages":'',"page":'',"count":'',"mode":'',"find":'',"q":''});
        //$__('bibles').innerHTML='<div id="waiting" style="height:50px;text-align:center;"><img height="50" alt="waiting" src="/img/waiting1.gif" /></div>';
        ajax.load(url,t.loadXML,'XML');
      } else {
        c.slide_dir=net.piibel.slidesel(c.hist_pos,p);
        s.bookt=i.btitle;
        s.bookn=i.bname;
        s.booki=i.bid;
        s.pages=i.pages;
        s.page=i.page;
        s.count=i.count;
        s.mode=i.mode;
        s.find=i.find;
        s.q=i.q;
        t.rebuild($__(h));
      }
    }
    if(t.rows) { setSelect("rows",t.rows);if((h=$__('ridasid'))){h.value=t.rows;} }
    //while(bbsel.update_bv()==true){ setTimeout(bbsel.update_bv,500); }
    if(!c.page_loaded){
      c_('net.piibel.context.page_loaded',function(){
          var q=$__('q');
          if(q.value!=s.q){q.value=s.q;}t.unlock();
        }
      );
    }
    else if(c.page_loaded) { t.unlock(); }
    return false;
  },
  lock: function(){
    var t=(this.context)?this:window.net.piibel;
    var c=t.context;
    if(c.locked==1) { return false; }
    else { c.locked=1; }
    t.hashstr.unpoll();
    return true;
  },
  unlock: function(){
    var t=(this.context)?this:window.net.piibel;
    t.context.locked=0;
    t.hashstr.poll();
    return true;
  },
  update_querystr: function(str){
    var url='',bv='',i=0;
    var t=(this.state)?this.state:window.net.piibel.state;
    if(!str || str==='#') { str=''; }
    log("update_querystr:"+str);
    if(t.bv.length) { bv=t.bv.join('&bv='); }
    if(str){ url=str; }
    else{
      if(t.q) { url+=((url)?'&':'')+'q='+t.q; }
      if(t.sens&&$__('q').value) { url +=((url)?'&':'')+'sens='+t.sens; }
      if(bv) {
        i=indexOf(t.bv,t.default_bv);
        if(t.bv.length==1&&i>=0){}
        else {
          url+=((url)?'&':'')+'bv='+bv;
        }
      }
      if(t.page>1) { url+=((url)?'&':'')+'lk='+t.page; }
      if(t.book) { url+=((url)?'&':'')+'book='+t.book; }
      if(t.chapt) { url+=((url)?'&':'')+'chapter='+t.chapt; }
      if(t.rows &&t.rows>0&&t.rows!=20) { url+=((url)?'&':'')+'r='+t.rows; }
    }
    if(url=='#') { url=''; }
    return url;
  },
  update_request: function(str){
    var p=(str&&str!=='#')?str:(window.location.hash)?window.location.hash:window.location.search;
    var t=(this.context)?this:window.net.piibel;
    var b=t.bibles||null;
    var s=t.state;
    var c=t.context;
    var assign=function(a,v,c,d){
      var i=0,j=0,m;
      if(v==='q') { $__('q').value=s.q=decodeURI(d);return !0; }
      if(v==='sens') { 
        s[v]=d;
        if((m=$__(v))){m.checked=(s[v]>0)?true:false;}
        if((m=$__(v+'_'+d))){m.className='bvbut bvbut2';}
        return !0;
      }
      if(v==='bv'){
        for(i=0,j=b.length;i<j;i++){
         if(b[i].id.match(''+d+'')){ m=b[i].id;break; }
        }
        if(m && indexOf(s.bv,m)==-1){
          s.bv[s.bv.length]=m;
        }
        return !0;
      }
      if((v==='lk'||v==='page')&&d>1){ s.page=d;return !0; }
      if(v==='book'){ s.book=d; return !0;}
      if(v==='chapter'){ s.chapter=d;return !0; }
      if((v==='r'||v==='rows')&&d>0){
        var ref=null;
        d=parseInt(d,10);
        if(!isInt(d)){return !0;}
        if((ref=$__('ridasid'))){
          ref.value=d;
        }
        if((ref=$__('rows'))){
          if(ref.selectedIndex!=d){
            for(i=0,j=ref.options.length;i<j;i++){
              if(!ref.options[i]){continue;}
              if(ref.options[i].value==d){ ref.selectedIndex=i; break; }
            }
          }
        }
        s.rows=d;
        return !0;
      }
      return !0;
    };
    var uri_split = function(uri){
      var re=new RegExp("([^?#=&|]+)(=([^&|]*))?","g");
      uri.replace(re,assign);
      return true;
    };
    if(c.back_lock==1){s.q=$__('q').value='';}
    s.bv=[];
    log("update_request:"+str+" "+p+" "+b);
    /*real work here*/
    if(p) { uri_split(p); }
    else {
      //piibel.q=$__('q').value;
      //piibel.sens=($__('sens').checked==true)?(piibel.sens)?piibel.sens:1:0;
    }
    //window.location.hash='';
    //console.log(window.location.host+window.location.pathname+window.location.hash);
    //window.location.replace=window.location.host+window.location.pathname+window.location.hash;
    return false;
  },
  slidesel: function(cur,prev){
    var d="",t=net.piibel.history,c=net.piibel.context;
    var i=t[cur];
    var p=t[prev];
    if(net.piibel.state.page_slide_enabled===0){ d="pop";}
    else if(!p||p.bid==i.bid||!p.bid||!i.bid) {
      if(!p||(p.bid&&!i.bid)||(!p.bid&&i.bid)||p.page==i.page||(!p.bid&&!i.bid&&p.q!=i.q)) { d="pop";}
      else if(p.page<i.page) {d="rl"; }
      else if(p.page>i.page) {d="lr"; }
    }
    else if(p.bid<i.bid) {d="rl"; }
    else if(p.bid>i.bid) {d="lr"; }
    return d;
  },
  rebuild: function(n){
    var t=(this.state)?this:window.net.piibel;
    var s=t.state;
    var c=t.context;
    var sw=null,sw2='';
    var slide_r_to_l=function(next){ var l=s.page_slide_len;return slide_em(c.active_div,next,'left:-'+l+'px;','left:'+l+'px;','left:0px;');};
    var slide_l_to_r=function(next){ var l=s.page_slide_len;return slide_em(c.active_div,next,'left:'+l+'px;','left:-'+l+'px;','left:0px;');};
    var slide_em=function(curr,next,curr_stop_pos,next_start_pos,next_stop_pos){ 
      var c=$__(curr),n=$__(next);
      emile(next,next_start_pos+((next.style.visibility=='hidden')?'opacity:1;':''),{setstyle:1});
      if(!$__(next.id)) { $__('scrolldiv').appendChild(next); }
      emile(curr,curr_stop_pos,{duration:s.page_slide_time});
      emile(next,next_stop_pos,{duration:s.page_slide_time});
      return true;
    };
    var change_no_slide=function(curr,next){
      next.style.visibility='hidden';
      emile(next,'left:0px;opacity:0;',{setstyle:1});
      if(!c.active_div||c.active_div=='bibles') { $__('scrolldiv').replaceChild(next,$__('bibles')); }
      else if(!$__(next.id)) { $__('scrolldiv').appendChild(next); }
      if($__(curr)) {
        emile(curr,'opacity:0;',{duration:s.page_slide_time});
        emile(curr,'left:-'+s.page_slide_len+'px;',{setstyle:1});
      }
      emile(next,'opacity:1;',{duration:s.page_slide_time});
      return true;
    };
    if(c.active_div!=n.id){
    //if($__('hh1_sub').style.visibility!='hidden') { emile('hh1_sub','opacity:0;',{duration:1500}); }
    controls.navmenu.bookflow(1);
    controls.navmenu.pageflow(1);
    controls.navmenu.pageflow(2);
    //show_navig();
    if(s.mode==='ptk'&&!s.rows){ s.page=0; }
    //fade('booktitle','out');
    sw=$__('booktitle');
    sw2=(s.mode==='ptk')?s.bookt:'Otsingu "'+s.q+'" tulemus';
    if(sw.innerHTML!=sw2){ sw.innerHTML=sw2; }
    $__('numflowend').innerHTML=((s.mode==='ptk')?'peat&uuml;kk':'leitud '+s.count+' vastet');
    if($__('hh1_sub').style.visibility=='hidden') { emile('hh1_sub','opacity:1;'); }
    sw=$__('scrolldiv');
    if(c.slide_dir=="rl"){ slide_r_to_l(n); }
    else if(c.slide_dir=="lr"){ slide_l_to_r(n); }
    else { change_no_slide(c.active_div||'bibles',n); }
    c.active_div=n.id;
    }
    sw=$__(c.active_div);
    var sh=sw.offsetHeight;
    for(var k=null,i=0,j=t.bibles.length;i<j;i++){
      if(!t.bibles[i]){continue;}
      sw2=t.bibles[i].id;
      k=$__(sw2+'-'+c.active_div);
      if(sw2 && k!==null){
        sh=(k.offsetHeight>sh)?k.offsetHeight:sh;
        log("test:"+sw2+" "+k+" "+sh);
      }
    }
    emile('scrolldiv','height:'+sh+'px;',{setstyle:1});

    $__('foot_toolbar').style.visibility='';
    $__('footer').style.visibility='';
    //curheight=null;
    if(s.goy!==null){ scroll("y",s.goy,1); s.goy=null;}
    var lh=window.location.hash;
    if(lh){lh=decodeURI(lh);lh=lh.replace(/^#/,'');}
    if(!c.back_lock&&(c.active_uri||(!t.history[c.hist_pos].uri&&!c.active_uri))){
      log("change location hash to:"+c.active_uri+" from:"+lh);
      if((c.active_uri||lh)&&lh!=c.active_uri){
        window.location.hash=(c.active_uri)?encodeURI(c.active_uri):'';
      }
    }
    c.page_loaded=1;
    /*
    var ff=function(){fade.fIn('bibles',0);};
    var fg=function(){fade2('bibles','fIn',0);};
    var fa=piibel.benchmark(ff,500);
    console.log("testime fade kiirust, 500 tehingu jaoks kulub:"+(fa/100)+"sek.");
    var fb=piibel.benchmark(fg,500);
    console.log("testime fade2 kiirust, 500 tehingu jaoks kulub:"+(fb/100)+"sek.");
    */
    $__('waiting').style.display="none";
    if(s.locked){ t.unlock(); }
    return 1;
  },

  addStyle: function(el,str){
      var cssString = str;
      if( typeof(el.style.cssText) == 'string' ) {
        cssString+=el.style.cssText;
        el.style.cssText=cssString;
        return false;
      }
      cssString+=el.getAttribute('style');
      el.setAttribute('style',cssString);
      return false;
  },

  loadXML: (function(){
    var t=(this.state)?this:window.net.piibel;
    var s=t.state;
    var c=t.context;
    var cn=null,cols=null,col=null;
    var curbible=null,curchapter=null,curverse=null,curbook=null,curheading=null;
    var newnode=null;
    var xmlload = function(xml){
      var i=0,j=0,k=null,sw2='';
      var sw=null,a=null,f=null,attr=[];
      var bname=null;
      var n=xml.nodeName;
      var typ=xml.nodeType;
      var v=xml.nodeValue;
      var p=xml.parentNode;
      if(p!==undefined && p!==null){
        if(typ==1){
          if(n=='result'){
            //reset values:
            cn=null;
            col=0;
            s.bookt='';s.bookn='';s.count=0;s.pages=0;s.page=0;
            cols=curbible=curchapter=curverse=curbook=curheading=null;
            t.history[c.hist_pos].mode=s.mode=xml.getAttribute('list_mode');
            newnode=document.createElement("div");
            newnode.setAttribute('id',c.next_div);
            t.addStyle(newnode,'position:absolute;width:100%;');
            sw2=xml.getAttribute('find');
            t.history[c.hist_pos].find=s.find=(sw2)?sw2:'';
            sw2=xml.getAttribute('q');
            t.history[c.hist_pos].q=s.q=(sw2)?sw2:'';
            for(i=0,j=xml.childNodes.length;i<j;i++) { 
              if(xml.childNodes[i].nodeName=='bible') {
                cols++;
              }
            }
          }
          if(n=='bible'){
            col++;
            bname=xml.getAttribute('name');
            var cr=parseInt(xml.getAttribute('count_result'),10);
            curbible=bname;
            if(cr && cr>s.count){ t.history[c.hist_pos].count=s.count=cr; }
            var pg=parseInt(xml.getAttribute('page'),10);
            t.history[c.hist_pos].page=s.page=(pg>0)?pg:0;
            t.history[c.hist_pos].pages=s.pages=parseInt(xml.getAttribute('pages'),10);
            cn=document.createElement('div');
            cn.setAttribute('id',bname+'-'+c.next_div);
            newnode.appendChild(cn);
            if(cols>1){
            sw=document.createElement('div');
            sw2='padding: 0px;font: 6pt Verdana,sans-serif;';
            t.addStyle(sw,sw2);
            sw.innerHTML=xml.getAttribute('title');
            cn.appendChild(sw);
            }
            //cn=$__(bname);
            sw2=((cols>1)?((col>1)?'padding-left: 40%;':'')+'width: 37%;':'width: 77%;')+'margin-left:23%;position:absolute;';
            t.addStyle(cn,sw2);
            //cn.style.cssText=sw2;
          }
          if(n=='book'){
            bname=xml.getAttribute('id');
            curbook=xml.getAttribute('abbrev');
            t.history[c.hist_pos].btitle=s.bookt=(s.find)?'':xml.getAttribute('title');
            t.history[c.hist_pos].bname=s.bookn=(s.find)?'':curbook;
            t.history[c.hist_pos].bid=s.booki=(s.find)?'':parseInt(bname,10);
          }
          if(n=='chapter'){
            bname=xml.getAttribute('id');
            curchapter=bname;
            if((s.mode==='ptk'||s.mode==='loik')){
              var rn=document.createElement('span');
              rn.setAttribute('id',curbible+'-'+curbook+'-'+curchapter+'-'+c.next_div);
              if(s.mode==='loik'){
                rn.className='ptk2';
                rn.innerHTML='<a href="#" onclick="$__(\'q\').value=net.piibel.state.q=\''+curbook+'+'+curchapter+'\';return net.piibel.load();">'+curbook+' '+curchapter+"</a>\n";
              } else if(col<2) {
                rn.className='ptk';
                t.addStyle(rn,'margin-left:-'+((cols>1)?'37.5':'17')+'%;');
                rn.innerHTML=bname;
              }
              cn.appendChild(rn);
            }
          }
        }
        else if(typ==3&&v&&v!='\n'){
          a=p.nodeName;
          sw2=v;
          if(a=='row'){
            curverse=p.getAttribute('verse');
            var heading=p.getAttribute('heading');
            if(heading && s.mode==='ptk') {
              rn=document.createElement('div');
              rn.className='b';
              rn.innerHTML=heading;
              heading='<div class="heading">'+heading+"</div>\n";
              cn.appendChild(rn);
            }
            rn=document.createElement('div');
            rn.setAttribute('id',curbible+'-'+curbook+'-'+curchapter+'-'+curverse+'-'+c.next_div);
            rn.className=a;
            if(s.mode==='ptk' || s.mode==='loik'){
              rn.innerHTML='<span class="v'+((s.goy&&s.goy.match(new RegExp('('+curbook+'-'+curchapter+'-'+curverse+')')))?' active':'')+'">'+curverse+'&nbsp;'+sw2+"</span>\n";
            } else {
              if(s.find){ sw2=sw2.replace(new RegExp('('+s.find.replace(/[\+\-\*\%]/g,"")+')','gi'),'<span class="found">$1</span>'); }
               rn.innerHTML='<a class="s10" style="text-decoration:none;color:#333333;" href="?q='+curbook+'+'+curchapter+'&verse='+curverse+'" onclick="net.piibel.state.found=\''+s.find+'\';$__(\'q\').value=net.piibel.state.q=\''+curbook+'+'+curchapter+'\';net.piibel.state.goy=this.parentNode.id;return net.piibel.load();"><span style="color: #01436F; font-weight: bold">'+curbook+' '+curchapter+':'+curverse+'</span>&nbsp;'+sw2+"</a>\n";
            }
            cn.appendChild(rn);
          }
        //for(i in attr){if(a==attr[i]){a=p.parentNode.nodeName+'_'+a;break;}}
        }
      }
      if(xml.hasChildNodes){
        for(i=0,j=xml.childNodes.length;i<j;i++){ xmlload(xml.childNodes[i]); }
        if(n=='result'){ 
          c.slide_dir=net.piibel.slidesel(c.hist_pos,c.hist_pos-1);
          return t.rebuild(newnode);
        }
      }
      return 0;
    };
    return function(x){
     log("loading xml");
     t=(this.context)?this:window.net.piibel;
     s=t.state;
     c=t.context;
     return xmlload(x);
    };
  })(),
  hashstr: {
    poll: function(){
      var t=(this.context)?this:window.net.piibel;
      var bc=t.context;
      log("start polling");
      bc.unpoll=0;
      bc.back_lock=0;
      var interval=500;
      if(!bc.pollid) { bc.pollid=setInterval(t.hashstr.poll_hash,interval); }
      return bc.pollid;
    },
    unpoll: function(){
      var t=(this.context)?this:window.net.piibel;
      var bc=t.context;
      log("stop polling");
      bc.unpoll=1;
      if(bc.pollid) { clearInterval(bc.pollid); bc.pollid=0; }
      return bc.pollid;
    },
    poll_hash: function(num,force){
      var t=(this.context)?this:window.net.piibel;
      var bc=t.context;
      if(bc.upoll>0 || bc.locked>0) { return false; }
      var str='';
      var sw2=window.location.hash;
      if(sw2) { sw2=decodeURI(sw2);str=sw2.replace(/^#/,''); }
      //else if(window.location.search) str=window.location.search.replace(/^\?/,'');
      if(force||((bc.active_uri||str)&&bc.active_uri!=str)) {
        if(!force&&bc.active_uri=='#'&&str==='') { return true; }
        //console.log("poll:("+sw2+")("+bc.active_uri+")")
        if(!force) {bc.back_lock=1;}
        //$__('err').innerHTML+="loaded bq("+piibel.q+") lq("+str+")u("+piibel.active_uri+") h("+location.hash+")<br>\n";
        if(!str) { 
          str='#'; if(bc.active_uri&&bc.active_uri!=str) { $__('q').value='';  }
        }
        var l=function(){
          t.update_request(str);
          t.load(str);
        };
        if(!t.bibles){c_('net.piibel.bibles',l);}
        else{l();}
      }
      return true;
    }
  }
};

function setSelect(a,t){
 var i=0;
 var e=$__(a);
 if(e===null) { return false; }
 var l=e.length;
 for(;i<l;i++){
  if(t==e.options[i].value){
   e.options[i].selected = true;return true;
  }
 }
 return false;
}



var controls = {
  getlistener: function(l){ return (l.addEventListener)?l.addEventListener:(l.attachEvent)?(l.attachEvent):null; },
  bookform: {
    rowscontrol: (function(){
      var n="rows";
      var ref=null;
      var t=null;
      var init=function(){if(!ref){ ref=$__(n); }t = net.piibel.state;};
      var onkeypress=function(e){var ev=(!e)?window.event:e;return __onenter(ev);};
      var onchange=function(){t[n]=ref.options[ref.selectedIndex].value;net.piibel.load();};
      var listeners=function(){
        if(!ref){ init(); }
        //var r=getlistener(ref);
        //if(r){ r('onkeypress', onkeypress, false); r('onchange', onchange, false); }
        ref.onkeypress=function(e){return onkeypress(e);};
        ref.onchange=function(){return onchange();};
      };
      listeners();
      return function(todo){
        init();
        log("controls.bookform.rowcontrol.todo:"+todo+' '+t[n]);
        if(todo=='onkeypress'){ return onkeypress(); }
        if(todo=='onchange'){ return onchange(); }
        return t;
      };
    })(),
    rowsinput: (function(){
      var n="ridasid";
      var ref=null;
      var t=null;
      var init=function(){if(!ref){ref=$__(n);}t=net.piibel.state;};
      var onkeyup=function(e){
        var ev=(!e)?window.event:e,
          a=(ev.currentTarget)?ev.currentTarget:(ev.srcElement)?ev.srcElement:null,
          t=net.piibel.state,
          b=(!a.value)?0:parseInt(a.value,10);
        if(!isInt(b)||b>1000){ a.value=b=20;}
        else if(b&&b!=a.value){a.value=b;}
        if(b<1000&&(b!=t.rows&&b!=a.getAttribute('placeholder'))){t.rows=b;}
        return !0;
      };
      var listeners=function(){
        if(!ref){ init(); }
        ref.onkeyup=onkeyup;
      };
      listeners();
      return function(todo){
        init();
        log("controls.rowsinput.todo:"+todo+' '+ref.id);
        if(todo=='onkeyup'){ return onkeyup(); }
        return t;
      };
    })(),
    bookselect: (function(){
      var n="bookselect";
      var ref=null;
      var t=null;
      var saved_len=0;
      var init=function(){if(!ref){ ref=$__(n); }t = net.piibel.books;};
      var ao=function (vo){
        var abbr=vo.abbr;
        var e = document.createElement("option");
        e.setAttribute("value",abbr.toLowerCase());
        e.appendChild(document.createTextNode(vo.name+'('+abbr+')'));
        ref.appendChild(e);
      };
      var listener=function(o){
        if(!o){ o=t; }
        //if(ref.length==saved_len) { console.log("listener not need to change"+ref.length+" "+saved_len);return; }
        /*if(a[0].abbr!='vt'){
          a.splice(66,0,{'id':680,'name':'------- Apokriivad ---','abbr':'apk',});
          a.splice(39,0,{'id':400,'name':'------- Uus Testament ---','abbr':'ut',});
          a.splice( 0,0,{'id':100,'name':'------- Vana Testament ---','abbr':'vt',});
        }*/
        var findWord = $__('bookinput').value.toLowerCase();
        var wl = findWord.length;
        while (ref.firstChild!==null){ref.removeChild(ref.firstChild);}
        var i=0,j=0;
        while(o[i]!==undefined){
          if((o[i].abbr.toLowerCase().substring(0, wl)==findWord&&wl>0)||wl===0){ ao(o[i]);j++;}
          i++;
        }
        saved_len=j;
        log("booksel:"+o.length+" "+saved_len);
      };
      var onkeypress=function(e){ var ev=(!e)?window.event:e;return __onenter(ev); };
      var onchange=function(){$__('q').value=$__('bookinput').value=net.piibel.state.q=ref.options[ref.selectedIndex].value;net.piibel.load();};
      var listeners=function(){
        if(!ref){ init(); }
        ref.onkeypress=function(e){return onkeypress(e);};
        ref.onchange=function(){return onchange();};
      };
      listeners();

      return function(todo,o){
        init();
        if(todo=='listen'||todo=='listener'){ return listener(o); }
        return null;
      };
    })(),
    bookinput: (function(){
      var n="bookinput";
      var ref=null;
      var t=null;
      var init=function(){if(!ref){ ref=$__(n); }t = net.piibel.state;};
      var onkeypress=function(e){ var ev=(!e)?window.event:e;return __onenter(ev);};
      var onkeyup=function(e){var ev=(!e)?window.event:e;var n=(ev.target)?ev.target:(ev.srcElement)?ev.srcElement:null;net.piibel.state.q=n.value;controls.bookform.bookselect("listen");};
      var listeners=function(){
        if(!ref){ init(); }
        ref.onkeypress=function(e){return onkeypress(e);};
        ref.onkeyup=function(e){return onkeyup(e);};
      };
      listeners();
      return function(todo){
        init();
        if(todo=='onkeypress'){ return onkeypress(); }
        if(todo=='onkeyup'){ return onkeyup(); }
        if(todo=='obj'){ return ref; }
        if(todo=='n'){ return n; }
        return t.q;
      };
    })(),
    bookbutton: (function(){
      var n="bookbutton";
      var ref=null;
      var t=null;
      var onclick=function(){return net.piibel.load();};
      var init=function(){if(!ref){ ref=$__(n); }t=net.piibel.state;};
      var listeners=function(){
        if(!ref){ init(); }
        ref.onclick=onclick;
      };
      listeners();
      return function(todo){
        init();
        if(todo=='onclick'){ return onclick(); }
        return t.sens;
      };
    })(),
    bookdiv: (function(){
      var n="bookdiv";
      var ref=null;
      var t=null;
      var showas='25px';
      var o='0px';
      var init=function(){if(!ref){ ref=$__(n); }};
      var stat=function(){ return ref.parentNode.style.height; };
      var showhide=function(){
        o=(o==showas)?showas:"0px";
        if(o=='0px'){
          ref.style.opacity="0";
          ref.style.visibility="hidden";
          if(ref.style.display=='none') { ref.style.display=""; }
          console.log("bookdiv show requested "+o);
          emile(ref.parentNode,'height:25px',{after:function(){emile(ref,'opacity:1');}});
          //emile(ref,'opacity:1');
        }
        else { 
          console.log("bookdiv hide requested "+o);
          emile(ref,'opacity:0',{after:function(){emile(ref.parentNode,'height:0px');}});
          //emile(ref.parentNode,'height:0px');
        }
        return false;
      };
      return function(todo){
        init();
        o=stat();
        if(todo){
         if(todo=='show'){ o='0px'; }
         if(todo=='hide'){ o=showas; }
        }
        if(o!=showas){ controls.bookform.bookselect('listen'); }
        showhide();
        return false;
      };
    })()
  },
  mainform: {
    queryinput: (function(){
      var n="q";
      var ref=null;
      var t=null;
      var init=function(){if(!ref){ ref=$__(n); }t = net.piibel.state;};
      var onfocus=function(){ select(); };
      var onkeypress=function(e){ var ev=(!e)?window.event:e;t[n]=ref.value;return __onenter(ev);};
      var onkeyup=function(){t.q=ref.value;};
      var onclick=function(){
      	var q=this;
      	if(!q.value||q.value==q.getAttribute('placeholder')){
      	  q.focus();
      	  return false;
      	}
      };
      var listeners=function(){
        if(!ref){ init(); }
        ref.onkeypress=function(e){return onkeypress(e);};
        ref.onkeyup=function(){return onkeyup();};
        //var r=getlistener(ref);
        //if(r){ r('onkeypress', onkeypress, false); r('onkeyup', onkeyup, false); }
      };
      listeners();
      return function(todo){
        init();
        if(todo=='onkeypress'){ return onkeypress(); }
        if(todo=='onkeyup'){ return onkeyup(); }
        if(todo=='onfocus'){ return onfocus(); }
        return t.q;
      };

    })(),
    senscheck: (function(){
      var n="sens",
        ns="link_"+n+"_",
        sens=[0,1,2,3],
        ref=null,
        t=null;
      var init=function(){if(!ref){ ref=$__(n); }t=window.net.piibel.state;};
      var onclick_c=function(){var a=this,t=net.piibel.state;t[n]=(a.checked===true)?1:0;if(t.q){net.piibel.load();}};
      var onclick_l=function(e){
      	//var ev=(!e)?window.event:e;
        //var a=(ev.target)?ev.target:(ev.srcElement)?ev.srcElement:null;
        //if(!a) {return !0;}
        var ev=(!e)?window.event:e,
          a=(ev.currentTarget)?ev.currentTarget:(ev.srcElement)?ev.srcElement:null,
          b=parseInt(a.id.replace('link_'+n+'_',''),10),//klikitav var
          c=null,
          d=0,
          t=net.piibel.state;
        if(typeof(b)!=='number'){return !0;}
        if(t[n]==b&&b>0){
        	t[n]=0;
        	d=1;
        	if((c=$__(n+'_'+0))){c.className='bvbut bvbut2';}
          $__(n+'_'+b).className='bvbut bvbut1';
        }
        else{
          for(var i=0,l=sens.length;i<l;i++){
            if((c=$__(n+'_'+i))){
              if(i==b){c.className='bvbut bvbut2';if(t[n]!=i){t[n]=b;d=1;}}
              else{c.className='bvbut bvbut1';}
            }
          }
        }
        if(d==1&&t.q){return net.piibel.load();}
        return !0;
      };
      var listeners=function(){
        if(!ref){ init(); }
        if(ref){ref.onclick_c=function(){return onclick();};}
        for(var i=0,j=null,l=sens.length;i<l;i++){
          j=$__(ns+i);
          if(j){
          	j.onclick=onclick_l;
          	if(t[n]==i){ $__(n+'_'+i).className='bvbut bvbut2';}
          }
        }
        //var r=getlistener(ref);
        //if(r){ r('onclick', onclick, false); }
      };
      listeners();
      return function(todo){
        init();
        if(todo=='onclick'){ return onclick(); }
        return t.sens;
      };
    })(),
    biblescontrol: (function(){
      var n="bible_select";
      var ref=null;
      var t=null;
      var s=null;
      var b=null;
      var cur=-1;
      var bkeys=[];
      var init=function(){
        if(!ref){ ref=$__(n); }t=window.net.piibel;s=t.state;b=t.bibles;
        for(var x=null,i=0,l=b.length;i<l;i++){ if((x=b[i])){bkeys[i]=x.id;}}
      };
      var update_bv=function(){
        var l=b.length,
          len=s.bv.length,
          match='',x='',y=null,i=0,j=0;
        if(bkeys.length<1){ init(); }
        if(!len) { 
          cur++;
          if(cur==l){cur=0;}
          x=bkeys[cur];
          s.bv[len]=x;
          if((y=$__('input_'+x))){y.checked=true;}
          if((y=$__('nupp_'+x))){y.className='bvbut bvbut2';}
        }
        var str=s.bv.join(" ");
        for(match='',x='',i=0,j=bkeys.length;i<j;i++){
          if((x=bkeys[i])){
            match=str.match(''+x+'');
            //if(match&&len==1){ cur=i; }
            log("update_bv:"+x);
            if(match) { log("update_bv:"+x+" match"); }
            if((y=$__('input_'+x))){y.checked=(match)?true:false;}
            if(match&&(y=$__('nupp_'+x))){y.className='bvbut bvbut2';}
          }
        }
        return false;
      };
      var reg_bv=function(e) { 
        var ev=(!e)?window.event:e,
        n=(ev.currentTarget)?ev.currentTarget:(ev.srcElement)?ev.srcElement:null;
        if(!n) {return !0;}
        if(n.nodeType==3) {ne=ne.parentNode;}
        var a=n.id,b=net.piibel.bibles,c=net.piibel.state.bv,
          nn=n.name||n.id.replace(/(input|link)_/,''),
          i=indexOf(c,nn);
        if(i<0){c[c.length]=nn;}
        else{
          if(c.length==1){cur=indexOf(bkeys,c[0]);}
          c.splice(i,1);
          log("reg_bv uncheck:"+n.id+" "+c.length);
        }
        /*if((n=$__('input_'+nn))){
          if(n.checked===true && i<0) { s.bv[s.bv.length]=nn; }
          else if(n.checked===false && i>=0) { 
            if(s.bv.length==1) { cur=indexOf(bkeys,s.bv[0]); }
            s.bv.splice(i,1);
            log("reg_bv uncheck:"+n.id+" "+s.bv.length);
          }
        }*/
        if((n=$__('nupp_'+nn))){
          if(n.className.match(/bvbut2/)){n.className='bvbut bvbut1';}
          else{n.className='bvbut bvbut2';}
        }
        return !0;
      };
      var onclick=function(e){net.piibel.state.unpoll=1;reg_bv(e);net.piibel.load();$__('q').select();return !0;};
      var listeners=function(){
        if(!ref||!b){ init(); }
        for(var x='',i=0,l=bkeys.length;i<l;i++){
          if(!bkeys[i]){continue;}
          if((x=$__('input_'+bkeys[i]))){
            x.onclick=onclick;
          }
          if((x=$__('link_'+bkeys[i]))){
            x.onclick=onclick;
            if(s[n]==i){ $__('nupp_'+bkeys[i]).className='bvbut bvbut2';}
          }
        }
      };
      var show=function(){
        /*if(!ref) { return true; }
        ref.style.display='none';
        for(var x='',i=0,l=b.length;i<l;i++){
          if(b[i] && ref){
            x='input_'+b[i].id;
            var el=document.createElement('label');
            var sl=document.createElement('input');
            el.setAttribute('class','b');
            sl.setAttribute('id',x);
            sl.setAttribute('type','checkbox');
            sl.setAttribute('name',b[i].id);
            sl.setAttribute('value',0);
            sl.checked=false;
            sl.setAttribute('title',b[i].title);
            ref.appendChild(el);
            el.appendChild(sl);
            el.innerHTML+=b[i].id.replace(/.+_/,'');
            sl.onclick=function(){onclick(x);};;
          }
        }
        ref.removeAttribute("style");*/
        listeners();
        return false;
      };
      return function(todo,v){
        init();
        if(!b.length) {log("biblescontrol error:net.piibel.bibles empty...");return true;}
        if(todo=='show'){return show();}
        if(todo=='update'){return update_bv();}
        if(todo=='reg'){return reg_bv(v);}
        return !0;
      };
    })(),
    querybutton: (function(){
      var n="querybutton";
      var ref=null;
      var t=null;
      var onclick=function(){
        var q=$__('q'),r=net.piibel.state;
        if(q.value&&q.value!=q.getAttribute("placeholder")){
          r.q=q.value;
          r.page=0;
          return net.piibel.load();
        } else {
          q.focus();
          return !0;
        }
      };
      var init=function(){if(!ref){ ref=$__(n); }t=net.piibel.state;};
      var listeners=function(){
        if(!ref){ init(); }
        ref.onclick=onclick;
      };
      listeners();
      return function(todo){
        init();
        if(todo=='onclick'){ return onclick(); }
        return !0;
      };
    })()
  },
  navmenu: {
  page: 1,
  show_pages: 20,
  show_aver: 0,
  bookn:'',
  mkv:function(v,n,vr,vl) { vr=((!vr)?'net.piibel.state.q':vr);vl=((!vl)?'':vl);return vr+"='"+vl+v+"';"+((n)?"$__('q').value=\'\';":''); },
  apr:function(i,h,e,c,v) { return '<a '+((i)?' id="'+i+'"':'')+'href="'+h+'" onclick="net.piibel.context.unpoll=1;'+e+'return net.piibel.load();"'+((c)?' class="'+c+'"':'')+'>'+v+"</a>"; },
  chq:function() { var s=net.piibel.state;return ((s.mode==='ptk'&&(!s.rows||s.rows===0)) ? 1 : 0); },
  nav:function(e,c,d,f,g){
  	e.onclick=function(e){
  		log(c+"="+d);
  		net.piibel.context.unpoll=1;
  		net.piibel.state[c]=((f)?f:0)+d;
  		if(g){$__('q').value='';}
  		return net.piibel.load();
  	};
  },
  bookflow: function(l) {
    if(l===null){ l=1; }
    var el=$__('bookflow'+l);
    if(!el) {return !0;}
    var chq=this.chq();
    var st=net.piibel.state;
    var bks=net.piibel.books;
    if(chq==1){
      var prev=0,next=2,lastbk=76;
      var vr='net.piibel.state.q';
      if(bks[0]){
        lastbk=bks.length;
        if(!st.booki) {return null;}
        var curbk=parseInt(st.booki,10);
        if(curbk<2){ prev=bks[0].abbr; }
        else if(curbk==68){ prev=bks[curbk-3].abbr; }
        else { 
          log("bookflow test:"+curbk+" "+l+" ");
          prev=bks[curbk-2].abbr;
        }
        if(curbk>lastbk-1){ next=bks[lastbk-1].abbr; }
        else if(curbk==66){ next=bks[curbk+1].abbr; }
        else { next=bks[curbk].abbr; }
      } //alert(curbk+" "+lastbk+" "+chq+" "+piibel.mode+" "+piibel.rows);
      if(el!==null){
        el.innerHTML =(curbk>1)?this.apr('bookprev','#',this.mkv(prev,chq),'c10','eelmine'):'<span class="c10">eelmine</span>';
        el.innerHTML+=(curbk<lastbk)?this.apr('booknext','#',this.mkv(next,chq),'c10','j&auml;rgmine'):'<span class="c10">j&auml;rgmine</span>';
      }
    } else if(el!==null){
      el.innerHTML ='';
    }
    return !0;
  },
  pageflow: function(l) {
    if(l===null){ l=1; }
    var el=$__('numflow'+l);
    if(!el){return !0;}
    var st=net.piibel.state;
    var pages=parseInt(st.pages,10);
    var page=parseInt(st.page,10);
        log("pageflow page:"+page+" "+pages);
    var show_pages = (pages<st.show_pages)?pages:st.show_pages;
    var show_aver = parseInt((show_pages/2),10);
    var swap1= ( show_aver - 1 );
    var swap2= ( show_pages - 1 );
    var prev_pages = ( page > show_aver && pages >= show_pages ) ? ( ( page > (pages - show_aver ) ) ? (pages - swap2) : (page - show_aver) ) : 1 ;
    var next_pages = ( page <= (pages - show_aver) && pages >= show_pages ) ? ( ( page > show_aver ) ? (page + swap1) : show_pages )  : pages;
    var vr='net.piibel.state.page';
    var vl='';
    var str='';
    var chq=this.chq();
    var i=0;
    var sw=null;
    if(chq==1){
      vr='net.piibel.state.q';
      if(net.piibel.books[0]){ vl=st.bookn+' '; }
    }
    str=(page>1)?this.apr(null,'#',this.mkv(1,chq,vr,vl),'b s10','&laquo;'):'<span class="c10">&laquo</span>';
    if(page>1&&(sw=$__("left"))){
    	this.nav(sw,vr.replace(/net.piibel.state./,''),page-1,vl,chq);
    }
    str+=(page>1)?this.apr(null,'#',this.mkv(page-1,chq,vr,vl),'c10','eelmine'):'<span class="c10">eelmine</span>';
    for(i=prev_pages;i<=next_pages;i++){ var a=this.mkv(i,chq,vr,vl); str+=this.apr(null,a,a,((page==i||(page===0&&i==1))?'active b s10':''),(i<10)?'&nbsp;'+i:i)+((i<show_pages)?',':''); }
    str+=(page<pages&&pages>1)?this.apr(null,'#',this.mkv((page)?page+1:page+2,chq,vr,vl),'c10','j&auml;rgmine'):'<span class="c10">j&auml;rgmine</span>';
    if(page<pages&&pages>1&&(sw=$__("right"))){
      this.nav(sw,vr.replace(/net.piibel.state./,''),((page)?page+1:page+2),vl,chq);
    }
    str+=(page<pages&&pages>1)?this.apr(null,'#',this.mkv(pages,chq,vr,vl),'b s10','&raquo;'):'<span class="c10">&raquo;</span>';
    str='<span style="margin-right:10%;">'+str+'<span id="numflowend" class="c10" text-align:left;"></span></span>';
    el.innerHTML=str;
  },
  bookformlink: (function(){
   var n='bookformlink';
   var ref=null;
   var t=null;
   var reg=0;
   var onclick=function(){controls.bookform.bookdiv();return false;};
   var onmouseover=function(){controls.bookform.bookdiv('show');return false;};
   var onmouseout=function(){controls.bookform.bookdiv('hide');return false;};
   var init=function(){if(!ref){ ref=$__(n); }t = net.piibel.state;};
   var listeners=function(){
     if(reg) { return; }
     if(!ref){ init(); }
     ref.onclick=function(){ return onclick(); };
     //ref.onmouseover=function(){ return onmouseover(); }
     //ref.onmouseout=function(){ return onmouseout(); }
     reg=1;
   };
   listeners();
   return function(todo){
    init();
    if(todo=='onclick'){ return onclick(); }
    return t;
   };
  })()
  }
};

/*
*/
if(!window.indexOf){
window.indexOf = function(arr,searchElement /*, fromIndex */){
  if (arr === 0 || arr === null) { return -1; }
  var t = new Object(arr);
  var len = t.length >>> 0;
  if (len === 0){ return -1;}
  var n = 0;
  if (arguments.length > 1){
   n = Number(arguments[2]);
   if (n !== n) { // shortcut for verifying if it's NaN
    n = 0;
   }
   else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)){
    n = (n > 0 || -1) * Math.floor(Math.abs(n));
   }
  }
  if (n >= len) { return -1; }
  var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
  for (; k < len; k++){
   if (k in t && t[k] === searchElement) { return k; }
  }
  return -1;
};
}

var scroll=(function(){
 var cury= function(){
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) { return self.pageYOffset; }
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop) {
        return document.documentElement.scrollTop;
    }
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) { return document.body.scrollTop; }
    return 0;
 };
 var elmy= function(eID,h){
    var elm = $__(eID);
    if(h===null) { h=0; }
    else{ h=window.innerHeight/2; }
    if(elm===null) { return 0; }
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    }
    return (h===0)?y:(y>h)?y-h:0;
 };
 var goy=function(eID,h){
    var startY = cury();
    var stopY = elmy(eID,h);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) { speed = 20; }
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    var i=0;
    if (stopY > startY) {
        for ( i=startY; i<stopY; i+=step ) {
            setTimeout(function(x) { return function() { window.scrollTo(0,x);}; }(leapY), timer * speed);
            leapY += step; if (leapY > stopY) { leapY = stopY; } timer++;
        } return;
    }
    for ( i=startY; i>stopY; i-=step ) {
        setTimeout(function(x) { return function(){ window.scrollTo(0,leapY);}; }(leapY), timer * speed);
        leapY -= step; if (leapY < stopY) { leapY = stopY; } timer++;
    }
  };
  return function(xy,eID,h){
    goy(eID,h);
  };
})();

/**
Cookie management
by Matt Doyle
http://www.elated.com/articles/javascript-and-cookies/
*/

var cookie = {
  set: function( name, value, exp_y, exp_m, exp_d, path, domain, secure ){
    var cookie_string = name + "=" + escape ( value );
    if ( exp_y ) {
      var expires = new Date ( exp_y, exp_m, exp_d );
      cookie_string += "; expires=" + expires.toGMTString();
    }
    if ( path ) { cookie_string += "; path=" + escape ( path ); }
    if ( domain ) { cookie_string += "; domain=" + escape ( domain ); }
    if ( secure ) { cookie_string += "; secure"; }
    document.cookie = cookie_string;
  },
  clear: function( cookie_name ) {
    var cookie_date = new Date ( );  // current date & time
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
  },
  get: function( cookie_name ) {
    var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
    if ( results ) { return ( unescape ( results[2] ) ); }
    else { return null; }
  },
  refresh: function (name,value){
    var dt= new Date();
    var m= dt.getMonth();
    var d= dt.getDate();
    d=(d>28)?28:d;
    var y= dt.getFullYear();
    if(this.get(name)!==null){ this.clear(name); }
    this.set(name,value,y+1,m,d);
  }
};

function openNew(url){window.open(url);return false;}
function isInt(v){return (v===+v&&v===(v|0));}
