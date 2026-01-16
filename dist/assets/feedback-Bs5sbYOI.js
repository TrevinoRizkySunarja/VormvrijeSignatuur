import"./modulepreload-polyfill-B5Qt9EMX.js";import{r as F,l as h}from"./auth-Co2TAfQH.js";F();document.getElementById("logoutBtn").addEventListener("click",h);const k="vs_feedback_v1",p=document.getElementById("fbForm"),o=document.getElementById("title"),A=document.getElementById("feedback"),x=document.getElementById("future"),I=document.getElementById("errTitle"),C=document.getElementById("errFeedback"),B=document.getElementById("errFuture"),c=document.getElementById("successMsg"),g=document.getElementById("itemsList"),v=document.getElementById("emptyState"),S=document.getElementById("search");document.getElementById("clearBtn").addEventListener("click",()=>{l=null,m(),p.reset(),o.focus()});function D(){const e=localStorage.getItem(k);if(!e)return[];try{const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{return[]}}function w(e){localStorage.setItem(k,JSON.stringify(e))}function T(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}function m(){I.textContent="",C.textContent="",B.textContent="",c.textContent=""}let r=D(),l=null;p.addEventListener("submit",e=>{var b;e.preventDefault(),m();const t=o.value.trim(),n=A.value.trim(),d=x.value.trim();let a=!0;if(t||(I.textContent="Title is required.",a=!1),n||(C.textContent="Feedback is required.",a=!1),d||(B.textContent="Toekomstige verbetering is required.",a=!1),!a)return;const i=new Date().toISOString(),y={id:l||T(),title:t,feedback:n,future:d,createdAt:l&&((b=r.find(s=>s.id===l))==null?void 0:b.createdAt)||i,updatedAt:i};if(l){const s=r.findIndex(L=>L.id===l);s!==-1&&(r[s]=y),l=null,c.textContent="Feedback updated."}else r.push(y),c.textContent="Feedback saved.";w(r),p.reset(),o.focus(),f()});function q(){const e=(S.value||"").trim().toLowerCase();return r.filter(t=>e?(t.title||"").toLowerCase().includes(e)||(t.feedback||"").toLowerCase().includes(e)||(t.future||"").toLowerCase().includes(e):!0).sort((t,n)=>(n.updatedAt||n.createdAt).localeCompare(t.updatedAt||t.createdAt))}function f(){const e=q();if(g.innerHTML="",e.length===0){v.style.display="block";return}v.style.display="none";for(const t of e){const n=document.createElement("article");n.className="item",n.innerHTML=`
      <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:flex-start;">
        <div>
          <p class="item__title"></p>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="badge">${u(_(t.updatedAt||t.createdAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Feedback</strong>
${u(t.feedback)}</div>
      <div class="meta"><strong>Actie / Toekomst</strong>
${u(t.future)}</div>

      <div class="actions2">
        <button class="smallbtn" data-action="edit" data-id="${E(t.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${E(t.id)}" type="button">Delete</button>
      </div>
    `,n.querySelector(".item__title").textContent=t.title,g.appendChild(n)}}g.addEventListener("click",e=>{const t=e.target.closest("button[data-action]");if(!t)return;const n=t.dataset.id,d=t.dataset.action;if(d==="delete"){r=r.filter(a=>a.id!==n),w(r),m(),c.textContent="Feedback deleted.",l=null,f();return}if(d==="edit"){const a=r.find(i=>i.id===n);if(!a)return;l=n,o.value=a.title,A.value=a.feedback,x.value=a.future,m(),c.textContent="Editing mode: pas aan en klik Save feedback.",o.focus()}});S.addEventListener("input",f);f();function _(e){try{return new Date(e).toLocaleString()}catch{return e}}function u(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function E(e){return u(e).replaceAll("`","&#096;")}
