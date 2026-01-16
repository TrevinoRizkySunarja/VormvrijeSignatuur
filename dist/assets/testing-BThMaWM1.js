import"./modulepreload-polyfill-B5Qt9EMX.js";import{r as $,l as R}from"./auth-Co2TAfQH.js";$();document.getElementById("logoutBtn").addEventListener("click",R);const C="vs_testing_v1",y=document.getElementById("testForm"),i=document.getElementById("prototype"),w=document.getElementById("testedAt"),B=document.getElementById("desc"),h=document.getElementById("what"),b=document.getElementById("result"),S=document.getElementById("errPrototype"),D=document.getElementById("errTestedAt"),L=document.getElementById("errDesc"),q=document.getElementById("errWhat"),T=document.getElementById("errResult"),c=document.getElementById("successMsg"),v=document.getElementById("itemsList"),A=document.getElementById("emptyState"),k=document.getElementById("search");document.getElementById("clearBtn").addEventListener("click",()=>{o=null,p(),y.reset(),i.focus()});function j(){const t=localStorage.getItem(C);if(!t)return[];try{const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function _(t){localStorage.setItem(C,JSON.stringify(t))}function O(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}function p(){S.textContent="",D.textContent="",L.textContent="",q.textContent="",T.textContent="",c.textContent=""}let r=j(),o=null;y.addEventListener("submit",t=>{var x;t.preventDefault(),p();const e=i.value.trim(),n=w.value,l=B.value.trim(),s=h.value.trim(),u=b.value.trim();let a=!0;if(e||(S.textContent="Product / Prototype is required.",a=!1),n||(D.textContent="Datum + tijd is required.",a=!1),l||(L.textContent="Description is required.",a=!1),s||(q.textContent="Wat ga je testen is required.",a=!1),u||(T.textContent="Resultaat is required.",a=!1),!a)return;const f=new Date().toISOString(),E={id:o||O(),prototype:e,testedAt:n,desc:l,what:s,result:u,createdAt:o&&((x=r.find(m=>m.id===o))==null?void 0:x.createdAt)||f,updatedAt:f};if(o){const m=r.findIndex(M=>M.id===o);m!==-1&&(r[m]=E),o=null,c.textContent="Test updated."}else r.push(E),c.textContent="Test saved.";_(r),y.reset(),i.focus(),g()});function P(){const t=(k.value||"").trim().toLowerCase();return r.filter(e=>t?(e.prototype||"").toLowerCase().includes(t)||(e.result||"").toLowerCase().includes(t)||(e.what||"").toLowerCase().includes(t):!0).sort((e,n)=>(n.testedAt||"").localeCompare(e.testedAt||""))}function g(){const t=P();if(v.innerHTML="",t.length===0){A.style.display="block";return}A.style.display="none";for(const e of t){const n=document.createElement("article");n.className="item",n.innerHTML=`
      <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-start;">
        <div>
          <p class="item__title"></p>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="badge">${d(U(e.testedAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Description</strong>
${d(e.desc)}</div>
      <div class="meta"><strong>Wat ga je testen?</strong>
${d(e.what)}</div>
      <div class="meta"><strong>Resultaat</strong>
${d(e.result)}</div>

      <div class="actions2">
        <button class="smallbtn" data-action="edit" data-id="${I(e.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${I(e.id)}" type="button">Delete</button>
      </div>
    `,n.querySelector(".item__title").textContent=e.prototype,v.appendChild(n)}}v.addEventListener("click",t=>{const e=t.target.closest("button[data-action]");if(!e)return;const n=e.dataset.id,l=e.dataset.action;if(l==="delete"){r=r.filter(s=>s.id!==n),_(r),p(),c.textContent="Test deleted.",o=null,g();return}if(l==="edit"){const s=r.find(u=>u.id===n);if(!s)return;o=n,i.value=s.prototype,w.value=s.testedAt,B.value=s.desc,h.value=s.what,b.value=s.result,p(),c.textContent="Editing mode: pas aan en klik Save test.",i.focus()}});k.addEventListener("input",g);g();function U(t){try{return new Date(t).toLocaleString()}catch{return t}}function d(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function I(t){return d(t).replaceAll("`","&#096;")}
