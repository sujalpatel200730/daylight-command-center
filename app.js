(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const KEY = "daylight-command-center-v1";
  const defaultData = {tasks:[],events:[],notes:[],study:{subject:"",minutes:25,goal:""},settings:{study:true,news:true,tools:true,dark:false},checklist:[]};
  let data = load();
  let filter = "all", newsCategory = "tech", activeNoteId = null;
  let timerInterval = null, timerRemaining = Number(data.study.minutes || 25) * 60, timerTotal = timerRemaining, timerRunning = false;

  function load(){try{return {...structuredClone(defaultData),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaultData)}}
  function save(){localStorage.setItem(KEY,JSON.stringify(data)); updateStats()}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
  function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function fmtDate(d,opts={month:"short",day:"numeric"}){return new Date(d+"T12:00:00").toLocaleDateString(undefined,opts)}
  function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
  function updateClock(){
    const now=new Date(),h=now.getHours();
    $("#clock").textContent=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    $("#clock-date").textContent=now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
    $("#today-label").textContent=now.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
    $("#greeting").textContent=(h<12?"Good morning.":h<17?"Good afternoon.":"Good evening.");
  }
  function updateStats(){
    $("#task-count").textContent=data.tasks.filter(t=>!t.done).length;
    $("#event-count").textContent=data.events.filter(e=>e.date>=todayISO()).length;
    $("#note-count").textContent=data.notes.length;
  }
  function renderTasks(){
    const list=$("#task-list");list.innerHTML="";
    const visible=data.tasks.filter(t=>filter==="all"||(filter==="open"&&!t.done)||(filter==="done"&&t.done));
    $("#task-empty").hidden=visible.length>0;
    visible.forEach(t=>{
      const li=document.createElement("li");li.className="task-item";
      li.innerHTML=`<input class="task-check" type="checkbox" ${t.done?"checked":""} aria-label="Complete task"><span class="task-text ${t.done?"done":""}">${escapeHTML(t.text)}</span>${t.priority==="High"?'<span class="priority">HIGH</span>':""}<button class="delete-btn" aria-label="Delete task">×</button>`;
      li.querySelector("input").addEventListener("change",()=>{t.done=!t.done;save();renderTasks()});
      li.querySelector(".delete-btn").addEventListener("click",()=>{data.tasks=data.tasks.filter(x=>x.id!==t.id);save();renderTasks()});
      list.append(li);
    });
    updateStats();
  }
  $("#task-form").addEventListener("submit",e=>{e.preventDefault();const text=$("#task-input").value.trim();if(!text)return;data.tasks.unshift({id:uid(),text,priority:$("#task-priority").value,done:false,created:Date.now()});$("#task-input").value="";save();renderTasks()});
  $$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.toggle("active",x===b));filter=b.dataset.filter;renderTasks()}));
  $("#clear-done").addEventListener("click",()=>{data.tasks=data.tasks.filter(t=>!t.done);save();renderTasks()});

  function renderEvents(){
    const list=$("#event-list");list.innerHTML="";
    const events=data.events.filter(e=>e.date>=todayISO()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    $("#event-empty").hidden=events.length>0;
    events.slice(0,8).forEach(ev=>{
      const d=new Date(ev.date+"T12:00:00"),li=document.createElement("div");li.className="event-item";
      li.innerHTML=`<div class="date-chip"><b>${d.getDate()}</b><small>${d.toLocaleDateString(undefined,{month:"short"})}</small></div><div class="event-copy"><b>${escapeHTML(ev.title)}</b><small>${fmtDate(ev.date,{weekday:"short",month:"short",day:"numeric",year:"numeric"})}${ev.time?" · "+escapeHTML(ev.time):""}</small></div><button class="delete-btn" aria-label="Delete event">×</button>`;
      li.querySelector("button").addEventListener("click",()=>{data.events=data.events.filter(x=>x.id!==ev.id);save();renderEvents()});list.append(li);
    });updateStats();
  }
  $("#event-date").value=todayISO();
  $("#event-form").addEventListener("submit",e=>{e.preventDefault();data.events.push({id:uid(),title:$("#event-title").value.trim(),date:$("#event-date").value,time:$("#event-time").value});$("#event-title").value="";$("#event-time").value="";save();renderEvents()});

  function updateTimerUI(){
    const m=Math.floor(timerRemaining/60),s=timerRemaining%60;$("#timer-display").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    $("#study-progress").style.width=`${timerTotal?100*(timerTotal-timerRemaining)/timerTotal:0}%`;
    $("#timer-start").textContent=timerRunning?"Pause focus":"Start focus";
    $("#timer-status").textContent=timerRunning?"Focus session in progress":timerRemaining===0?"Session complete — take a short break":"Ready when you are";
  }
  function stopTimer(){clearInterval(timerInterval);timerInterval=null;timerRunning=false}
  $("#study-subject").value=data.study.subject||"";$("#study-minutes").value=data.study.minutes||25;$("#study-goal").value=data.study.goal||"";
  function saveStudy(){data.study.subject=$("#study-subject").value;data.study.minutes=Math.min(180,Math.max(5,Number($("#study-minutes").value)||25));data.study.goal=$("#study-goal").value;save()}
  ["study-subject","study-minutes","study-goal"].forEach(id=>$("#"+id).addEventListener("change",saveStudy));
  $("#study-minutes").addEventListener("change",()=>{stopTimer();timerRemaining=Number($("#study-minutes").value||25)*60;timerTotal=timerRemaining;updateTimerUI()});
  $("#timer-start").addEventListener("click",()=>{
    if(timerRunning){stopTimer();updateTimerUI();return}
    if(timerRemaining<=0){timerRemaining=Number($("#study-minutes").value||25)*60;timerTotal=timerRemaining}
    timerRunning=true;updateTimerUI();
    timerInterval=setInterval(()=>{timerRemaining--;if(timerRemaining<=0){timerRemaining=0;stopTimer();updateTimerUI();if("Notification"in window&&Notification.permission==="granted")new Notification("Focus session complete",{body:"Nice work. Take a short break."});else alert("Focus session complete. Take a short break.");return}updateTimerUI()},1000);
  });
  $("#timer-reset").addEventListener("click",()=>{stopTimer();timerRemaining=Number($("#study-minutes").value||25)*60;timerTotal=timerRemaining;updateTimerUI()});
  $("#study-saved").textContent=data.study.subject?`Current focus: ${data.study.subject}${data.study.goal?" · Goal: "+data.study.goal:""}`:"Your study setup is saved on this device.";

  function renderNotes(){
    $("#saved-notes").innerHTML="";
    data.notes.slice().reverse().slice(0,5).forEach(n=>{
      const b=document.createElement("button");b.className="saved-note";b.textContent=n.title||n.body.slice(0,28)||"Untitled note";b.title="Open note";
      b.addEventListener("click",()=>{activeNoteId=n.id;$("#note-title").value=n.title;$("#note-body").value=n.body;$("#note-status").textContent="Editing saved note"});
      $("#saved-notes").append(b);
    });updateStats();
  }
  function saveNote(){
    const title=$("#note-title").value.trim(),body=$("#note-body").value.trim();if(!title&&!body){$("#note-status").textContent="Write something first";return}
    const existing=data.notes.find(n=>n.id===activeNoteId);
    if(existing){existing.title=title;existing.body=body;existing.updated=Date.now()}else{const n={id:uid(),title,body,updated:Date.now()};data.notes.push(n);activeNoteId=n.id}
    save();renderNotes();$("#note-status").textContent="Saved on this device";
  }
  $("#save-note").addEventListener("click",saveNote);
  $("#new-note").addEventListener("click",()=>{activeNoteId=null;$("#note-title").value="";$("#note-body").value="";$("#note-status").textContent="New note"});
  let noteSaveTimeout;["note-title","note-body"].forEach(id=>$("#"+id).addEventListener("input",()=>{clearTimeout(noteSaveTimeout);$("#note-status").textContent="Unsaved changes";noteSaveTimeout=setTimeout(()=>{if($("#note-title").value.trim()||$("#note-body").value.trim())saveNote()},800)}));

  const sources={
    tech:[["The Verge","Consumer technology and digital culture","https://www.theverge.com/","V"],["Ars Technica","Technology, science and policy","https://arstechnica.com/","A"],["TechCrunch","Startups and technology business","https://techcrunch.com/","T"],["Hacker News","Community discussion on technology","https://news.ycombinator.com/","Y"],["GitHub Blog","Developer tools and open source","https://github.blog/","G"],["Google AI Blog","AI research and product updates","https://blog.google/technology/ai/","AI"]],
    world:[["Reuters World","International reporting","https://www.reuters.com/world/","R"],["BBC News","World headlines and analysis","https://www.bbc.com/news","B"],["Associated Press","Independent global news","https://apnews.com/","AP"],["The Hindu","India and international news","https://www.thehindu.com/","H"],["UN News","Global affairs and humanitarian updates","https://news.un.org/","UN"]],
    science:[["NASA News","Space and science missions","https://www.nasa.gov/news/","N"],["Nature News","Research and scientific discoveries","https://www.nature.com/news","N"],["ScienceDaily","Research news across disciplines","https://www.sciencedaily.com/","S"],["ISRO","Indian space research updates","https://www.isro.gov.in/","I"],["MIT News","Engineering and research","https://news.mit.edu/","M"]]
  };
  function renderNews(){const list=$("#news-list");list.innerHTML="";sources[newsCategory].forEach(([name,desc,url,letter])=>{const a=document.createElement("a");a.className="news-source";a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.innerHTML=`<span class="source-icon">${escapeHTML(letter)}</span><span class="source-copy"><b>${escapeHTML(name)}</b><small>${escapeHTML(desc)}</small></span><span class="source-arrow">↗</span>`;list.append(a)})}
  $$(".news-tab").forEach(b=>b.addEventListener("click",()=>{$$(".news-tab").forEach(x=>x.classList.toggle("active",x===b));newsCategory=b.dataset.news;renderNews()}));
  $("#news-refresh").addEventListener("click",()=>{renderNews();$("#news-refresh").textContent="Links refreshed ✓";setTimeout(()=>$("#news-refresh").textContent="Refresh links ↗",1500)});

  const modal=$("#modal");
  function openModal(title,html){$("#modal-title").textContent=title;$("#modal-content").innerHTML=html;modal.showModal()}
  $("#modal-close").addEventListener("click",()=>modal.close());
  $$(".tool-tile").forEach(b=>b.addEventListener("click",()=>{
    const t=b.dataset.tool;
    if(t==="calculator"){
      openModal("Quick calculator",`<input id="calc-display" class="calc-display" value="" placeholder="0" inputmode="decimal" aria-label="Calculator display" readonly><div class="calc-grid">${["7","8","9","÷","4","5","6","×","1","2","3","−","C","0",".","+","(",")","⌫","="].map(k=>`<button class="${k==="="?"equals":""}" data-calc="${k}">${k}</button>`).join("")}</div>`);
      const disp=$("#calc-display");let expr="";
      $$(".calc-grid button").forEach(btn=>btn.addEventListener("click",()=>{const k=btn.dataset.calc;if(k==="C")expr="";else if(k==="⌫")expr=expr.slice(0,-1);else if(k==="="){try{if(!/^[0-9+\-*/().\s]+$/.test(expr))throw Error();const result=Function('"use strict";return ('+expr+')')();expr=Number.isFinite(result)?String(result):"Error"}catch{expr="Error"}}else expr+=({"÷":"/","×":"*","−":"-"}[k]||k);disp.value=expr}));
    }else if(t==="checklist"){
      openModal("Mini checklist",`<form id="check-form" class="inline-form"><input id="check-input" placeholder="Add a small task" required><button class="primary-btn">Add</button></form><div id="check-list"></div>`);
      const render=()=>{$("#check-list").innerHTML="";data.checklist.forEach((item,i)=>{const row=document.createElement("label");row.className="checkline";row.innerHTML=`<input type="checkbox" ${item.done?"checked":""}><span style="${item.done?"text-decoration:line-through;color:var(--muted)":""}">${escapeHTML(item.text)}</span><button type="button" class="delete-btn">×</button>`;row.querySelector("input").addEventListener("change",e=>{item.done=e.target.checked;save();render()});row.querySelector("button").addEventListener("click",()=>{data.checklist.splice(i,1);save();render()});$("#check-list").append(row)})};
      $("#check-form").addEventListener("submit",e=>{e.preventDefault();data.checklist.push({text:$("#check-input").value.trim(),done:false});save();render();$("#check-input").value=""});render();
    }else if(t==="links"){
      openModal("Useful links",`<div class="news-list">${[["RGPV","University portal","https://www.rgpv.ac.in/"],["MDN Web Docs","Web development reference","https://developer.mozilla.org/"],["C++ Reference","C++ language reference","https://en.cppreference.com/"],["GitHub","Code hosting and projects","https://github.com/"],["Khan Academy","Learn maths and science","https://www.khanacademy.org/"]].map(([n,d,u])=>`<a class="news-source" href="${u}" target="_blank" rel="noopener noreferrer"><span class="source-copy"><b>${n}</b><small>${d}</small></span><span class="source-arrow">↗</span></a>`).join("")}</div>`);
    }else if(t==="export"){
      const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="daylight-backup.json";a.click();URL.revokeObjectURL(url);openModal("Backup downloaded",`<p>Your dashboard data backup was generated. Keep the JSON file somewhere safe. This backup includes tasks, dates, notes, study settings and mini-checklist items.</p><button class="primary-btn" id="backup-again">Download again</button>`);$("#backup-again").addEventListener("click",()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=u;link.download="daylight-backup.json";link.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
    }
  }));

  function applySettings(){
    document.body.classList.toggle("dark-mode",!!data.settings.dark);$("#theme-btn").textContent=data.settings.dark?"☼":"◐";
    [["study","show-study"],["news","show-news"],["tools","show-tools"]].forEach(([key,id])=>{const checked=data.settings[key]!==false;$("#"+id).checked=checked;const widget={"study":".study-widget","news":".news-widget","tools":".tools-widget"}[key];$(widget).hidden=!checked});
  }
  $("#theme-btn").addEventListener("click",()=>{data.settings.dark=!data.settings.dark;save();applySettings()});
  [["study","show-study"],["news","show-news"],["tools","show-tools"]].forEach(([key,id])=>$("#"+id).addEventListener("change",e=>{data.settings[key]=e.target.checked;save();applySettings()}));

  // Allow the browser to offer local notifications after the user explicitly opts in.
  $("#event-list").addEventListener("click",()=>{});
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
  updateClock();setInterval(updateClock,15000);
  renderTasks();renderEvents();renderNotes();renderNews();updateTimerUI();applySettings();save();
})();