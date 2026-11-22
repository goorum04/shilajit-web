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

// format selector: one product, price/photo/description follow the chosen size
const opts = document.querySelectorAll(".opt");
let pickedFormat = null;
function pickFormat(btn){
  opts.forEach(o => {
    const on = o === btn;
    o.classList.toggle("active", on);
    o.setAttribute("aria-pressed", on ? "true" : "false");
  });
  pickedFormat = btn.dataset.v;
  const d = window.orderocaI18n.I[window.orderocaI18n.getLang()];
  const img = document.getElementById("buyImg");
  img.src = btn.dataset.img;
  img.setAttribute("data-alt-i", btn.dataset.alt);
  img.alt = d[btn.dataset.alt];
  const desc = document.getElementById("buyDesc");
  desc.setAttribute("data-i", btn.dataset.desc);
  desc.textContent = d[btn.dataset.desc];
  document.getElementById("buyPrice").textContent = btn.dataset.price;
  document.getElementById("bbPrice").textContent = btn.dataset.price;
  document.getElementById("bbFmt").innerHTML = btn.innerHTML;
}
if (opts.length) {
  opts.forEach(o => o.addEventListener("click", () => pickFormat(o)));
  pickFormat(document.querySelector(".opt.active"));
  opts.forEach(o => { new Image().src = o.dataset.img; });
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
      body: JSON.stringify({ email:v, lang:cur, source: pickedFormat ? "web-"+pickedFormat : "web", user_agent:navigator.userAgent })
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
