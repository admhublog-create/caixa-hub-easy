if(location.pathname.toLowerCase()==='/admin'){
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('[data-tab="fita"]');
    if(!btn)return;
    await new Promise(r=>setTimeout(r,0));
    if(document.querySelector('[data-pane="fita"]'))return;
    btn.remove();
    await import('/fita.js?adminfix=2');
    let tries=0;
    const t=setInterval(()=>{
      tries++;
      const fresh=document.querySelector('[data-tab="fita"]');
      if(fresh){clearInterval(t);fresh.click()}
      if(tries>20)clearInterval(t);
    },100);
  },true);
}