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

// one product, three sizes; the chosen size follows the visitor across pages
const FORMATS = {
  "30g":        { label: "30 g", price: "29 €", img: "assets/product-30g.jpg", desc: "p1desc", alt: "p1alt" },
  "50g":        { label: "50 g", price: "49 €", img: "assets/product-50g.jpg", desc: "p2desc", alt: "p2alt" },
  "50g-ritual": { label: '50 g <span data-i="optRitual"></span>', price: "59 €", img: "assets/product-ritual.jpg", desc: "p3desc", alt: "p3alt" }
};
const i18n = window.orderocaI18n;
let pickedFormat = (() => { try { return localStorage.getItem("arakul_format"); } catch (e) { return null; } })();
if (!FORMATS[pickedFormat]) pickedFormat = "30g";

document.body.insertAdjacentHTML("beforeend",
  '<div class="buybar"><div class="wrap"><div class="bb-info">' +
  '<span class="bb-name">Arakul · <span data-fmt="label"></span></span><span class="bb-price" data-fmt="price"></span>' +
  '</div><a href="#llista" class="btn btn-gold" data-i="buyBtn"></a></div></div>');
const wlFormEl = document.querySelector(".wl-form");
if (wlFormEl) wlFormEl.insertAdjacentHTML("beforebegin",
  '<p class="wl-pick"><span data-i="wlPick"></span> <strong>Arakul · <span data-fmt="label"></span> · <span data-fmt="price"></span></strong></p>');
document.querySelectorAll("[data-price-of]").forEach(el => { el.textContent = FORMATS[el.dataset.priceOf].price; });

const buyImg = document.getElementById("buyImg");
const thumbs = document.querySelectorAll(".thumb");
let imgToken = 0;
function showImage(thumb){
  thumbs.forEach(t => t.classList.toggle("active", t === thumb));
  buyImg.setAttribute("data-alt-i", thumb.dataset.alt);
  buyImg.alt = i18n.I[i18n.getLang()][thumb.dataset.alt];
  const src = thumb.dataset.src;
  if (buyImg.getAttribute("src") === src) return;
  const token = ++imgToken, pre = new Image();
  buyImg.classList.add("swap");
  pre.onload = pre.onerror = () => { if (token !== imgToken) return; buyImg.src = src; buyImg.classList.remove("swap"); };
  pre.src = src;
}
function applyFormat(v){
  pickedFormat = v;
  const f = FORMATS[v];
  try { localStorage.setItem("arakul_format", v); } catch (e) {}
  document.querySelectorAll('[data-fmt="label"]').forEach(el => { el.innerHTML = f.label; });
  document.querySelectorAll('[data-fmt="price"]').forEach(el => { el.textContent = f.price; });
  document.querySelectorAll(".opt").forEach(o => {
    const on = o.dataset.v === v;
    o.classList.toggle("active", on);
    o.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const desc = document.getElementById("buyDesc");
  if (desc) desc.setAttribute("data-i", f.desc);
  if (buyImg) {
    const first = thumbs[0];
    first.dataset.src = f.img;
    first.dataset.alt = f.alt;
    const ti = first.querySelector("img");
    ti.src = f.img.replace("assets/", "assets/thumb-");
    ti.setAttribute("data-alt-i", f.alt);
    showImage(first);
  }
  i18n.setLang(i18n.getLang());
}
document.querySelectorAll(".opt").forEach(o => o.addEventListener("click", () => applyFormat(o.dataset.v)));
thumbs.forEach(t => t.addEventListener("click", () => showImage(t)));
applyFormat(pickedFormat);

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
  const cur = i18n.getLang();
  const I = i18n.I;
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
      body: JSON.stringify({ email:v, lang:cur, source: "web-"+pickedFormat, user_agent:navigator.userAgent })
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
