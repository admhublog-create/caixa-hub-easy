import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase=createClient(
  "https://c--09586474-253e-4035-b48c-481591adc286-prod.lovable.cloud",
  "sb_publishable_4zkSUbnHOH5kawdNM3d6lQ_xd5Do3bb"
);

if(location.pathname.toLowerCase()==='/admin'){
  let entradas=[];
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=d=>new Date(d).toLocaleString('pt-BR');

  async function carregar(){
    const {data,error}=await supabase.from('entradas_estoque').select('*').order('created_at',{ascending:false});
    if(error)return console.error(error);
    entradas=data||[];
    montarArea();
    aplicarEntradas();
  }

  function totais(){
    const t={PP:0,P:0,M:0};
    entradas.forEach(e=>{if(t[e.tipo_caixa]!==undefined)t[e.tipo_caixa]+=Number(e.total_caixas)||0});
    return t;
  }

  function aplicarEntradas(){
    const cards=document.querySelectorAll('#cards .metric');
    if(cards.length<4)return;
    const e=totais();
    const inic={PP:1575,P:5550,M:1200};
    ['PP','P','M'].forEach((k,i)=>{
      const card=cards[i];
      const small=card.querySelector('small');
      const strong=card.querySelector('strong');
      if(!small||!strong)return;
      const m=small.textContent.match(/•\s*(\d+)\s+utilizadas/);
      const usadas=m?Number(m[1]):0;
      strong.textContent=inic[k]+e[k]-usadas;
      small.textContent=`Inicial ${inic[k]} • +${e[k]} entradas • ${usadas} utilizadas`;
    });
    const totalEntradas=e.PP+e.P+e.M;
    const usadas=['PP','P','M'].reduce((s,k,i)=>{const sm=cards[i]?.querySelector('small')?.textContent||'';const m=sm.match(/•\s*(\d+)\s+utilizadas$/);return s+(m?Number(m[1]):0)},0);
    cards[3].querySelector('strong').textContent=8325+totalEntradas-usadas;
    cards[3].querySelector('small').textContent=`Inicial 8325 • +${totalEntradas} entradas • ${usadas} utilizadas`;
    const report=[...document.querySelectorAll('#reportCards .metric')].find(x=>x.querySelector('span')?.textContent==='ESTOQUE RESTANTE');
    if(report){report.querySelector('strong').textContent=8325+totalEntradas-usadas;report.querySelector('small').textContent=`Inicial 8325 + ${totalEntradas} entradas`;}
  }

  function montarArea(){
    const shell=document.querySelector('.admin-shell');
    if(!shell)return;
    let area=document.querySelector('#areaEntradas');
    if(!area){
      area=document.createElement('section');
      area.id='areaEntradas';
      area.className='section-card';
      area.style.marginTop='18px';
      shell.appendChild(area);
    }
    area.innerHTML=`<div class="section-title"><div><h2>Entrada de estoque / Nova compra</h2><p class="hint left">Registre novas caixas compradas. O saldo do estoque será atualizado automaticamente.</p></div></div><div class="filters" style="align-items:end"><div><label>Tipo de caixa</label><select id="entradaTipo"><option>PP</option><option>P</option><option>M</option></select></div><div><label>Quantidade de fardos</label><input type="number" id="entradaFardos" min="1" step="1" value="1"></div><div><label>Observação</label><input id="entradaObs" maxlength="150" placeholder="Ex.: Compra setembro"></div><button class="export-btn" id="registrarEntrada">Registrar entrada</button></div><p class="hint left" id="entradaPreview">1 fardo = 25 caixas</p><div class="table-scroll"><table class="table"><thead><tr><th>Data/Hora</th><th>Tipo</th><th>Fardos</th><th>Caixas</th><th>Observação</th><th>Ação</th></tr></thead><tbody>${entradas.length?entradas.map(e=>`<tr><td>${fmt(e.created_at)}</td><td><b>${esc(e.tipo_caixa)}</b></td><td>${e.fardos}</td><td><b>${e.total_caixas}</b></td><td>${esc(e.observacao||'—')}</td><td><button data-del-entrada="${esc(e.id)}" style="border:1px solid #fecaca;background:#fff;color:#b91c1c;border-radius:8px;padding:7px 11px;font-weight:700;cursor:pointer">Excluir</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhuma entrada registrada.</td></tr>'}</tbody></table></div>`;
    const f=document.querySelector('#entradaFardos');
    f.oninput=()=>{const n=Math.max(0,Number(f.value)||0);document.querySelector('#entradaPreview').textContent=`${n} fardo${n===1?'':'s'} = ${n*25} caixas`;};
    document.querySelector('#registrarEntrada').onclick=registrar;
    area.onclick=async ev=>{
      const b=ev.target.closest('[data-del-entrada]');if(!b)return;
      const ent=entradas.find(x=>String(x.id)===String(b.dataset.delEntrada));if(!ent)return;
      if(!confirm(`Excluir esta entrada de ${ent.total_caixas} caixas ${ent.tipo_caixa}? O saldo será reduzido.`))return;
      const {error}=await supabase.from('entradas_estoque').delete().eq('id',ent.id);
      if(error)return alert('Não foi possível excluir a entrada: '+error.message);
      entradas=entradas.filter(x=>String(x.id)!==String(ent.id));montarArea();aplicarEntradas();
    };
  }

  async function registrar(){
    const tipo=document.querySelector('#entradaTipo').value;
    const fardos=Math.floor(Number(document.querySelector('#entradaFardos').value));
    const observacao=document.querySelector('#entradaObs').value.trim();
    if(!fardos||fardos<1)return alert('Informe uma quantidade válida de fardos.');
    const caixas=fardos*25;
    if(!confirm(`Registrar entrada de ${fardos} fardo(s) da Caixa ${tipo}?\nTotal: ${caixas} caixas`))return;
    const btn=document.querySelector('#registrarEntrada');btn.disabled=true;btn.textContent='Registrando...';
    const {data,error}=await supabase.from('entradas_estoque').insert({tipo_caixa:tipo,fardos,total_caixas:caixas,observacao:observacao||null}).select().single();
    if(error){btn.disabled=false;btn.textContent='Registrar entrada';return alert('Não foi possível registrar: '+error.message);}
    entradas.unshift(data);montarArea();aplicarEntradas();alert('Entrada registrada. O estoque foi atualizado.');
  }

  const observer=new MutationObserver(()=>{if(document.querySelector('#cards .metric')){montarArea();aplicarEntradas();}});
  observer.observe(document.querySelector('#app'),{childList:true,subtree:true});
  carregar();
}
