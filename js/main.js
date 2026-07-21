// scrolled header
const hdr = document.getElementById("hdr");
if (hdr) {
  window.addEventListener("scroll",()=>{
    hdr.classList.toggle("scrolled", window.scrollY>40);
  });
}

// mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector("nav.links");
if (navToggle && navLinks) {
  const closeNav = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "☰";
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.textContent = open ? "✕" : "☰";
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));
  window.addEventListener("resize", () => { if (window.innerWidth > 900) closeNav(); });
}

// reveal
const io = new IntersectionObserver((es)=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

// waitlist -> Supabase
const SB_URL = "https://gvbcfjgxrgnvjfuedtfs.supabase.co";
const SB_KEY = "sb_publishable_nlIjs0RX1dwID0inQIlpFg_ve25Sknd";
const wlBtn = document.getElementById("wlBtn");
const wlInput = document.getElementById("wlEmail");

async function submitWaitlist(){
  const cur = window.orderocaI18n ? window.orderocaI18n.getLang() : "ca";
  const I = window.orderocaI18n ? window.orderocaI18n.I : {};
  const v = wlInput.value.trim();
  const msg = document.getElementById("wlMsg");
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if(!ok){ msg.style.color="var(--stone)"; msg.textContent = I[cur].wlErr; return; }
  wlBtn.disabled = true;
  const original = wlBtn.textContent;
  wlBtn.textContent = "···";
  msg.textContent = "";
  try{
    const r = await fetch(SB_URL + "/rest/v1/waitlist_orderoca", {
      method:"POST",
      headers:{
        "apikey":SB_KEY,
        "Authorization":"Bearer "+SB_KEY,
        "Content-Type":"application/json",
        "Prefer":"return=minimal"
      },
      body: JSON.stringify({ email:v, lang:cur, source:"web", user_agent:navigator.userAgent })
    });
    if(r.ok || r.status===409){        // 409 = correo ya registrado
      msg.style.color="var(--gold-soft)";
      msg.textContent = I[cur].wlOk;
      wlInput.value="";
    } else {
      throw new Error("status "+r.status);
    }
  }catch(e){
    msg.style.color="var(--stone)";
    msg.textContent = I[cur].wlNet;
  }finally{
    wlBtn.disabled = false;
    wlBtn.textContent = original;
  }
}
if (wlBtn) {
  wlBtn.addEventListener("click", submitWaitlist);
  wlInput.addEventListener("keydown",e=>{ if(e.key==="Enter") submitWaitlist(); });
}
