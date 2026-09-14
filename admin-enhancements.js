import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient("https://c--09586474-253e-4035-b48c-481591adc286-prod.lovable.cloud","sb_publishable_4zkSUbnHOH5kawdNM3d6lQ_xd5Do3bb");

if(location.pathname.toLowerCase().startsWith('/admin')){
  const style=document.createElement('style');
  style.textContent=`
  .admin-head{position:relative;overflow:hidden;isolation:isolate;min-height:170px}
  .admin-head:before,.admin-head:after{content:'';position:absolute;border-radius:999px;filter:blur(2px);opacity:.45;z-index:-1;pointer-events:none}
  .admin-head:before{width:220px;height:220px;background:radial-gradient(circle,#fff7f2 0,#efd4cb 55%,transparent 70%);right:18%;top:-120px;animation:hubFloat 8s ease-in-out infinite}
  .admin-head:after{width:320px;height:110px;border:1px solid #d9afa3;right:4%;bottom:-45px;transform:rotate(-8deg);animation:hubWave 11s ease-in-out infinite}
  .hero-motion{position:absolute;right:30%;top:50%;transform:translateY(-50%);font-size:13px;font-weight:800;color:#a85f52;letter-spacing:.05em;white-space:nowrap;opacity:.9;animation:hubPulse 3.8s ease-in-out infinite}
  .hero-motion:before{content:'●';margin-right:9px;font-size:9px;vertical-align:2px;animation:hubBlink 1.4s ease-in-out infinite}
  .admin-head:hover:before{transform:translate(-18px,18px) scale(1.08)}
  .admin-head:hover:after{transform:rotate(-3deg) translateY(-8px)}
  .admin-head:before,.admin-head:after{transition:transform .8s ease}
  @keyframes hubFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(20px) scale(1.05)}}
  @keyframes hubWave{0%,100%{transform:rotate(-8deg) translateX(0)}50%{transform:rotate(-4deg) translateX(-28px)}}
  @keyframes hubPulse{0%,100%{opacity:.55;transform:translateY(-50%) scale(1)}50%{opacity:1;transform:translateY(-50%) scale(1.035)}}
  @keyframes hubBlink{0%,100%{opacity:.25}50%{opacity:1}}
  .unit-entry-card{background:linear-gradient(135deg,#fff 0,#fffaf8 100%);border-color:#ead7d0!important}
  .unit-entry-card h2{font-size:20px!important;margin-bottom:5px!important}
  .unit-entry-sub{margin:0 0 18px;color:#8a716c;font-size:13px}
  .unit-entry-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:end}
  .unit-entry-grid label{display:block;font-size:10px;color:#8e7671;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
  .unit-entry-wide{grid-column:span 2}
  .unit-entry-note{margin-top:12px;padding:12px 14px;border-radius:12px;background:#fbf3f0;border:1px solid #ecd8d1;color:#7b5e57;font-size:12px}
  .unit-entry-btn{height:50px;border:0;border-radius:12px;background:#a85f52;color:#fff;font-weight:900;cursor:pointer;box-shadow:0 8px 18px #a85f5222;transition:.2s}
  .unit-entry-btn:hover{transform:translateY(-2px);box-shadow:0 12px 24px #a85f5230}
  [data-pane="entradas"] .table th:nth-child(3),[data-pane="entradas"] .table td:nth-child(3){display:none}
  @media(max-width:950px){.hero-motion{display:none}.unit-entry-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:650px){.unit-entry-grid{grid-template-columns:1fr}.unit-entry-wide{grid-column:auto}}
  @media(prefers-reduced-motion:reduce){.admin-head:before,.admin-head:after,.hero-motion,.hero-motion:before{animation:none!important}}
  `;
  document.head.appendChild(style);

  const enhance=()=>{
    const head=document.querySelector('.admin-head');
    if(head && !head.dataset.motionReady){
      head.dataset.motionReady='1';
      const h1=head.querySelector('h1');
      if(h1) h1.textContent='Olá, Larissa! 👋';
      const p=head.querySelector('p');
      if(p) p.textContent='Acompanhe estoque, retiradas, inventários, consumo e compras em tempo real.';
      const moving=document.createElement('div');
      moving.className='hero-motion';
      moving.textContent='Estoque em movimento • controle em tempo real';
      head.appendChild(moving);
    }

    const pane=document.querySelector('[data-pane="entradas"]');
    if(!pane) return;
    const card=pane.querySelector('.section-card');
    if(card && !card.dataset.unitReady){
      card.dataset.unitReady='1';
      card.classList.add('unit-entry-card');
      card.innerHTML=`
        <h2>Nova compra / Entrada de estoque</h2>
        <p class="unit-entry-sub">Registre a quantidade comprada diretamente em unidades. Não usamos mais fardos nesta entrada.</p>
        <div class="unit-entry-grid">
          <div><label>Tipo de caixa</label><select id="eTipo"><option>PP</option><option>P</option><option>M</option></select></div>
          <div><label>Quantidade comprada</label><input id="eUnidades" type="number" min="1" step="1" value="1" placeholder="Ex.: 500"></div>
          <div><label>Unidade de compra</label><select id="eUnidade"><option value="unidade">Unidade</option></select></div>
          <div class="unit-entry-wide"><label>Observação</label><input id="eObs" placeholder="Ex.: fornecedor, NF ou informação da compra"></div>
          <button class="unit-entry-btn" id="salvarEntradaUnidade">REGISTRAR ENTRADA</button>
        </div>
        <div class="unit-entry-note"><b>Como funciona:</b> cada unidade registrada corresponde a 1 caixa adicionada ao estoque.</div>`;
      const btn=card.querySelector('#salvarEntradaUnidade');
      btn.onclick=async()=>{
        const tipo=card.querySelector('#eTipo').value;
        const qtd=Number(card.querySelector('#eUnidades').value);
        const obs=card.querySelector('#eObs').value.trim();
        if(!Number.isInteger(qtd)||qtd<1) return alert('Informe uma quantidade válida de unidades.');
        if(!confirm(`Adicionar ${qtd} unidade(s) da Caixa ${tipo} ao estoque?`)) return;
        btn.disabled=true;btn.textContent='REGISTRANDO...';
        const textoObs=[obs,'Unidade de compra: unidade'].filter(Boolean).join(' • ');
        const {error}=await supabase.from('entradas_estoque').insert({tipo_caixa:tipo,fardos:1,total_caixas:qtd,observacao:textoObs||null});
        if(error){btn.disabled=false;btn.textContent='REGISTRAR ENTRADA';return alert('Não foi possível registrar: '+error.message)}
        alert('Entrada registrada e estoque atualizado por unidade.');
        location.reload();
      };
    }

    const table=pane.querySelector('.table');
    if(table){
      const heads=table.querySelectorAll('th');
      if(heads[3] && heads[3].textContent!=='Unidades') heads[3].textContent='Unidades';
    }
  };

  const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
  observer.observe(document.body,{subtree:true,childList:true});
  addEventListener('DOMContentLoaded',enhance);
  setTimeout(enhance,100);
  setTimeout(enhance,600);
}
