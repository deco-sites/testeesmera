import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const DIR = "frontend-option-matrix-fast-artifacts";
await mkdir(`${DIR}/screenshots`, { recursive: true });
const out = { categories: [], materials: [], availability: [], sorts: [], navigation: [], search: [], commerce: [], findings: [], errors: [] };
const snap = async (page, name) => { const file=`screenshots/${name}.png`; await page.screenshot({path:`${DIR}/${file}`,animations:"disabled"}); return file; };
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

async function ensureFilters(page) {
  const panel=page.locator('#esv-collection-filters');
  if (!(await panel.evaluate(el=>el.classList.contains('is-open')).catch(()=>false))) {
    await page.locator('.esv-collection-v2-filter-trigger').first().click();
    await sleep(80);
  }
}
async function optionsFor(page, name) {
  await page.getByRole('button',{name}).first().click(); await sleep(40);
  return (await page.getByRole('option').allTextContents()).map(x=>x.trim());
}
async function choose(page, name, index) {
  const trigger=page.getByRole('button',{name}).first();
  await trigger.click(); await sleep(30);
  const options=page.getByRole('option');
  const label=((await options.nth(index).textContent())||'').trim();
  await options.nth(index).click(); await sleep(90);
  const triggerText=((await trigger.textContent())||'').trim();
  return {label,triggerText,url:page.url()};
}

const browser=await chromium.launch({headless:true});
try {
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},locale:'pt-BR'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>out.errors.push({type:'pageerror',message:e.message,url:page.url()}));
  await page.goto(`${BASE_URL}/colecao`,{waitUntil:'domcontentloaded',timeout:45000}); await sleep(800);
  await ensureFilters(page);

  // Every category option: UI selection/state. Backend result is separately validated in the focused follow-up.
  const cats=await optionsFor(page,'Filtrar por categoria'); await page.keyboard.press('Escape');
  for(let i=0;i<cats.length;i++){
    await ensureFilters(page);
    const r=await choose(page,'Filtrar por categoria',i);
    const selected=r.triggerText.includes(r.label);
    out.categories.push({index:i,...r,selected});
    if(!selected) out.findings.push({severity:'high',title:'Categoria não mantém seleção no controle',index:i,...r});
  }
  await snap(page,'all-categories-visited');
  // Reset.
  await choose(page,'Filtrar por categoria',0);

  // Every material button.
  await ensureFilters(page);
  const root=page.locator('.esv-collection-v2-materials');
  const materialCount=await root.locator('button').count();
  for(let i=0;i<materialCount;i++){
    await ensureFilters(page);
    let btn=page.locator('.esv-collection-v2-materials button').nth(i);
    const label=((await btn.getAttribute('aria-label'))||(await btn.textContent())||'').trim();
    await btn.click(); await sleep(90);
    btn=page.locator('.esv-collection-v2-materials button').nth(i);
    const pressed=await btn.getAttribute('aria-pressed');
    out.materials.push({index:i,label,pressed,url:page.url()});
    if(pressed!=='true') out.findings.push({severity:'high',title:'Matéria não assume aria-pressed=true',index:i,label,pressed});
    await btn.click(); await sleep(60);
  }

  // Every availability option.
  const av=await optionsFor(page,'Filtrar por disponibilidade'); await page.keyboard.press('Escape');
  for(let i=0;i<av.length;i++){
    await ensureFilters(page);
    const r=await choose(page,'Filtrar por disponibilidade',i);
    out.availability.push({index:i,...r,selected:r.triggerText.includes(r.label)});
  }
  await choose(page,'Filtrar por disponibilidade',0);

  // Every sort option.
  const sorts=await optionsFor(page,'Ordenar coleção'); await page.keyboard.press('Escape');
  for(let i=0;i<sorts.length;i++){
    const r=await choose(page,'Ordenar coleção',i);
    out.sorts.push({index:i,...r,selected:r.triggerText.includes(r.label)});
  }
  await snap(page,'all-facets-and-sorts-visited');

  // Every header/mega destination discovered; status coverage is already provided by 109-route sitemap crawl.
  await page.goto(`${BASE_URL}/`,{waitUntil:'domcontentloaded',timeout:45000}); await sleep(700);
  const roots=page.locator('.esv-nav-v2-desktop > *');
  const seen=new Map();
  for(let i=0;i<await roots.count();i++){
    const item=roots.nth(i); if(!(await item.isVisible().catch(()=>false))) continue;
    const label=((await item.textContent())||(await item.getAttribute('aria-label'))||'').trim();
    const href=await item.getAttribute('href'); if(href) seen.set(href,{label,source:'root'});
    if((await item.evaluate(el=>el.tagName))==='BUTTON'){
      await item.hover(); await sleep(120);
      const links=page.locator('.esv-mega-v2 a[href]');
      for(let j=0;j<await links.count();j++){
        const l=links.nth(j), h=await l.getAttribute('href'); if(!h) continue;
        seen.set(h,{label:((await l.textContent())||'').trim(),source:label});
      }
    }
  }
  out.navigation=[...seen].map(([href,meta])=>({href,...meta}));
  await snap(page,'all-menu-destinations-discovered');

  // Search result → product.
  await page.getByRole('button',{name:/buscar objetos|buscar/i}).first().click();
  const input=page.locator('input[type="search"]').first(); await input.fill('mesa'); await sleep(750);
  const results=page.locator('.esv-search-results > button, .esv-search-results a');
  const count=await results.count(); let opened=false;
  if(count){ await results.first().click(); await sleep(180); opened=await page.locator('.esv-product-modal').isVisible().catch(()=>false); }
  out.search.push({query:'mesa',count,opened,screenshot:await snap(page,'search-result-to-product')});
  if(count&&!opened) out.findings.push({severity:'high',title:'Resultado de busca não abre produto'});
  await page.keyboard.press('Escape'); await sleep(120);

  // Real pointer wishlist: hover first, then click.
  await page.goto(`${BASE_URL}/colecao`,{waitUntil:'domcontentloaded',timeout:45000}); await sleep(800);
  const first=page.locator('.esv-product-card').first(); await first.hover(); await sleep(180);
  const wish=first.locator('.esv-card-wishlist').first(); const before=await wish.getAttribute('aria-pressed');
  let wishError=null; try{await wish.click({timeout:4000});}catch(e){wishError=String(e)} await sleep(140);
  const after=await wish.getAttribute('aria-pressed');
  out.commerce.push({action:'wishlist',before,after,error:wishError,screenshot:await snap(page,'wishlist-hover-click')});
  if(wishError||before===after) out.findings.push({severity:'high',title:'Favorito falha com ponteiro real após hover',before,after,error:wishError});

  // Buyable card CTA → cart → remove. Find an explicit Adquirir action instead of assuming first card is purchasable.
  const acquire=page.getByRole('button',{name:/^Adquirir /i}).first();
  let acquireError=null, openedCart=false, removed=false, addLabel=null;
  if(await acquire.count()){
    const card=acquire.locator('xpath=ancestor::article[1]'); await card.hover(); await sleep(160); addLabel=await acquire.getAttribute('aria-label');
    try{await acquire.click({timeout:4000});}catch(e){acquireError=String(e)} await sleep(220);
    const cart=page.getByRole('button',{name:/carrinho/i}).first(); if(await cart.count()){await cart.click(); await sleep(180); openedCart=await page.locator('.esv-enquiry-panel').isVisible().catch(()=>false); const rem=page.locator('.esv-cart-remove').first(); if(await rem.isVisible().catch(()=>false)){await rem.click(); await sleep(140); removed=true;}}
  } else acquireError='No Adquirir action found';
  out.commerce.push({action:'add-cart-remove',addLabel,acquireError,openedCart,removed,screenshot:await snap(page,'cart-flow')});
  if(acquireError||!openedCart||!removed) out.findings.push({severity:'high',title:'Fluxo Adquirir → Carrinho → Remover não completou',addLabel,acquireError,openedCart,removed});

  await ctx.close();
} finally { await browser.close(); }
out.summary={categories:out.categories.length,materials:out.materials.length,availability:out.availability.length,sorts:out.sorts.length,navigation:out.navigation.length,search:out.search.length,commerce:out.commerce.length,findings:out.findings.length,errors:out.errors.length};
await writeFile(`${DIR}/option-matrix-fast.json`,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.summary,null,2)); console.log(JSON.stringify(out.findings,null,2));