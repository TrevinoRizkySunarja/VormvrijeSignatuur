import"./modulepreload-polyfill-B5Qt9EMX.js";import{r as D,l as R}from"./auth-Co2TAfQH.js";D();document.getElementById("logoutBtn").addEventListener("click",R);const C="vs_results_v1",p=document.getElementById("resultForm"),c=document.getElementById("title"),A=document.getElementById("desc"),I=document.getElementById("result"),x=document.getElementById("learned"),b=document.getElementById("errTitle"),B=document.getElementById("errDesc"),S=document.getElementById("errResult"),k=document.getElementById("errLearned"),o=document.getElementById("successMsg");document.getElementById("clearBtn").addEventListener("click",()=>{a=null,u(),p.reset(),c.focus()});const g=document.getElementById("resultsList"),_=document.getElementById("emptyState"),L=document.getElementById("search");let a=null,r=M();p.addEventListener("submit",e=>{var y;e.preventDefault(),u();const t=c.value.trim(),n=A.value.trim(),s=I.value.trim(),l=x.value.trim();let d=!0;if(t||(b.textContent="Title is required.",d=!1),n||(B.textContent="Beschrijving is required.",d=!1),s||(S.textContent="Resultaat is required.",d=!1),l||(k.textContent="Wat heb je eruit gehaald? is required.",d=!1),!d)return;const f=new Date().toISOString(),v={id:a||T(),title:t,desc:n,result:s,learned:l,createdAt:a&&((y=r.find(i=>i.id===a))==null?void 0:y.createdAt)||f,updatedAt:f};if(a){const i=r.findIndex(w=>w.id===a);i!==-1&&(r[i]=v),a=null,o.textContent="Result updated."}else r.push(v),o.textContent="Result saved.";h(r),p.reset(),c.focus(),m()});g.addEventListener("click",e=>{const t=e.target.closest("button[data-action]");if(!t)return;const n=t.dataset.action,s=t.dataset.id;if(n==="delete"){r=r.filter(l=>l.id!==s),h(r),a=null,u(),o.textContent="Result deleted.",m();return}if(n==="edit"){const l=r.find(d=>d.id===s);if(!l)return;a=s,c.value=l.title,A.value=l.desc,I.value=l.result,x.value=l.learned,u(),o.textContent="Editing mode: pas aan en klik Save result.",c.focus()}});L.addEventListener("input",m);m();function u(){b.textContent="",B.textContent="",S.textContent="",k.textContent="",o.textContent=""}function M(){const e=localStorage.getItem(C);if(!e)return[];try{const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function h(e){localStorage.setItem(C,JSON.stringify(e))}function T(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}function O(e){try{return new Date(e).toLocaleString()}catch{return e}}function U(){const e=(L.value||"").trim().toLowerCase();return r.filter(t=>e?(t.title||"").toLowerCase().includes(e)||(t.desc||"").toLowerCase().includes(e)||(t.result||"").toLowerCase().includes(e)||(t.learned||"").toLowerCase().includes(e):!0).sort((t,n)=>(n.updatedAt||n.createdAt).localeCompare(t.updatedAt||t.createdAt))}function m(){const e=U();if(g.innerHTML="",!e.length){_.style.display="block";return}_.style.display="none";for(const t of e){const n=document.createElement("article");n.className="card",n.innerHTML=`
      <div class="card__top">
        <p class="card__title"></p>
        <div class="card__date">${q(O(t.updatedAt||t.createdAt))}</div>
      </div>

      <div class="card__block">
        <div class="card__label">Beschrijving</div>
        <p class="card__text"></p>
      </div>

      <div class="card__block">
        <div class="card__label">Resultaat</div>
        <p class="card__text" data-k="result"></p>
      </div>

      <div class="card__block">
        <div class="card__label">Wat heb ik eruit gehaald?</div>
        <p class="card__text" data-k="learned"></p>
      </div>

      <div class="card__actions">
        <button class="smallbtn" data-action="edit" data-id="${E(t.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${E(t.id)}" type="button">Delete</button>
      </div>
    `,n.querySelector(".card__title").textContent=t.title,n.querySelectorAll(".card__text")[0].textContent=t.desc,n.querySelector('[data-k="result"]').textContent=t.result,n.querySelector('[data-k="learned"]').textContent=t.learned,g.appendChild(n)}}function q(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function E(e){return q(e).replaceAll("`","&#096;")}
