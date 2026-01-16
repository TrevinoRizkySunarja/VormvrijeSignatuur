import"./modulepreload-polyfill-B5Qt9EMX.js";import{r as D,l as q}from"./auth-Co2TAfQH.js";D();document.getElementById("logoutBtn").addEventListener("click",q);const I="vs_research_v1",y=document.getElementById("researchForm"),C=document.getElementById("method"),d=document.getElementById("title"),x=document.getElementById("materials"),B=document.getElementById("notes"),b=document.getElementById("errTitle"),L=document.getElementById("errMaterials"),S=document.getElementById("errNotes"),c=document.getElementById("successMsg"),E=document.getElementById("itemsList"),g=document.getElementById("emptyState"),M=document.getElementById("search"),w=document.getElementById("filterMethod");document.getElementById("clearBtn").addEventListener("click",()=>{l=null,p(),y.reset(),d.focus()});function N(){const t=localStorage.getItem(I);if(!t)return[];try{const e=JSON.parse(t);return Array.isArray(e)?e:[]}catch{return[]}}function k(t){localStorage.setItem(I,JSON.stringify(t))}function T(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}function p(){b.textContent="",L.textContent="",S.textContent="",c.textContent=""}let a=N(),l=null;y.addEventListener("submit",t=>{var h;t.preventDefault(),p();const e=C.value,n=d.value.trim(),o=x.value.trim(),r=B.value.trim();let s=!0;if(n||(b.textContent="Title is required.",s=!1),o||(L.textContent="Materialen / opzet is required.",s=!1),r||(S.textContent="Notes is required.",s=!1),!s)return;const f=new Date().toISOString(),v={id:l||T(),method:e,title:n,materials:o,notes:r,createdAt:l&&((h=a.find(m=>m.id===l))==null?void 0:h.createdAt)||f,updatedAt:f};if(l){const m=a.findIndex(_=>_.id===l);m!==-1&&(a[m]=v),l=null,c.textContent="Research updated."}else a.push(v),c.textContent="Research saved.";k(a),y.reset(),d.focus(),u()});function $(t){return t==="crazy8s"?"Crazy 8s":t==="brainstorm"?"Brainstorm":t==="mindmap"?"Mindmap":"HMW"}function O(){const t=(M.value||"").trim().toLowerCase(),e=w.value;return a.filter(n=>e==="ALL"?!0:n.method===e).filter(n=>t?(n.title||"").toLowerCase().includes(t)||(n.notes||"").toLowerCase().includes(t)||(n.materials||"").toLowerCase().includes(t):!0).sort((n,o)=>(o.updatedAt||o.createdAt).localeCompare(n.updatedAt||n.createdAt))}function u(){const t=O();if(E.innerHTML="",t.length===0){g.style.display="block";return}g.style.display="block",g.style.display="none";for(const e of t){const n=document.createElement("article");n.className="item",n.innerHTML=`
      <div class="item__top">
        <div>
          <p class="item__title"></p>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="badge">${i($(e.method))}</span>
            <span class="badge">${i(z(e.updatedAt||e.createdAt))}</span>
          </div>
        </div>
      </div>

      <div class="meta"><strong>Materialen / Opzet</strong>
${i(e.materials)}</div>
      <div class="meta"><strong>Notes</strong>
${i(e.notes)}</div>

      <div class="actions2">
        <button class="smallbtn" data-action="edit" data-id="${A(e.id)}" type="button">Edit</button>
        <button class="smallbtn smallbtn--danger" data-action="delete" data-id="${A(e.id)}" type="button">Delete</button>
      </div>
    `,n.querySelector(".item__title").textContent=e.title,E.appendChild(n)}}E.addEventListener("click",t=>{const e=t.target.closest("button[data-action]");if(!e)return;const n=e.dataset.id,o=e.dataset.action;if(o==="delete"){a=a.filter(r=>r.id!==n),k(a),p(),c.textContent="Research deleted.",l=null,u();return}if(o==="edit"){const r=a.find(s=>s.id===n);if(!r)return;l=n,C.value=r.method,d.value=r.title,x.value=r.materials,B.value=r.notes,p(),c.textContent="Editing mode: pas aan en klik Save research.",d.focus()}});M.addEventListener("input",u);w.addEventListener("change",u);u();function z(t){try{return new Date(t).toLocaleString()}catch{return t}}function i(t){return String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function A(t){return i(t).replaceAll("`","&#096;")}
