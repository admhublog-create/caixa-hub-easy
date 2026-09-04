import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase=createClient("https://c--09586474-253e-4035-b48c-481591adc286-prod.lovable.cloud","sb_publishable_4zkSUbnHOH5kawdNM3d6lQ_xd5Do3bb");
const TYPES=['PP','P','M'];
const BASE={PP:1575,P:5550,M:1200};
const PREFIX='__CAIXA_CUSTO__';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const parseMoney=s=>Number(String(s||'').replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,''))||0;
const cap=s=>s?String(s).charAt(0).toUpperCase()+String(s).slice(1):s;
const monthLabel=k=>{const [y,m]=String(k||'').slice(0,7).split('-');if(!y||!m)return '—';return cap(new Date(+y,+m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));};
const fmt=d=>new Date(d).toLocaleString('pt-BR');
function meta(row){const o=String(row.observacao||'');if(!o.startsWith(PREFIX))return null;try{return JSON.parse(o.slice(PREFIX.length))}catch{return null}}
function note(row){const m=meta(row);return m?.nota||(!String(row.observacao||'').startsWith(PREFIX)?row.observacao:'')||'—'}
function encode({tipo,caixas,nota}){return PREFIX+JSON.stringify({tipo,caixas:Number(caixas)||0,nota:nota||''})}
function stock(rows,entries){const s={...BASE};entries.forEach(x=>{if(s[x.tipo_caixa]!=null)s[x.tipo_caixa]+=Number(x.total_caixas||0)});rows.forEach(x=>{if(s[x.tipo_caixa]!=null)s[x.tipo_caixa]-=Number(x.total_caixas||0)});return s}
function stats(compras){const usable=compras.map(c=>({c,m:meta(c)})).filter(x=>x.m&&TYPES.includes(x.m.tipo)&&Number(x.m.caixas)>0&&Number(x.c.valor)>0);const perType={};for(const t of TYPES){const a=usable.filter(x=>x.m.tipo===t);const value=a.reduce((s,x)=>s+Number(x.c.valor||0),0);const qty=a.reduce((s,x)=>s+Number(x.m.caixas||0),0);perType[t]={value,qty,avg:qty?value/qty:0};}return {usable,perType,total:usable.reduce((s,x)=>s+Number(x.c.valor||0),0)}}
async function load(){
  if(location.pathname.replace(/\/+$/,'')!=='/admin')return;
  const tabs=$('.tabs');
  if(!tabs){setTimeout(load,250);return}
  if($('#custosCaixasTab'))return;
  const tab=document.createElement('button');tab.className='tab';tab.id='custosCaixasTab';tab.dataset.tab='custos-caixas';tab.textContent='Custos das caixas';tabs.appendChild(tab);
  const content=$('#content');if(!content){setTimeout(load,200);return}
  const pane=document.createElement('section');pane.className='tabpane';pane.dataset.pane='custos-caixas';pane.hidden=true;content.appendChild(pane);
  tab.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tabpane').forEach(x=>x.hidden=true);tab.classList.add('active');pane.hidden=false;render(pane)};
  await render(pane);
}
async function render(pane){
  pane.innerHTML='<div class="section-card">Carregando custos...</div>';
  const [cr,rr,er]=await Promise.all([
    supabase.from('compras_controle').select('*').order('competencia',{ascending:false}).order('created_at',{ascending:false}),
    supabase.from('retiradas').select('tipo_caixa,total_caixas'),
    supabase.from('entradas_estoque').select('tipo_caixa,total_caixas')
  ]);
  if(cr.error||rr.error||er.error){pane.innerHTML='<div class="section-card">Não foi possível carregar os dados de custos.</div>';return}
  const compras=cr.data||[], s=stock(rr.data||[],er.data||[]), st=stats(compras);
  const totalSaldo=TYPES.reduce((a,t)=>a+Math.max(0,s[t]),0);
  const totalValor=TYPES.reduce((a,t)=>a+Math.max(0,s[t])*st.perType[t].avg,0);
  const byMonth={};compras.forEach(c=>{const k=String(c.competencia||'').slice(0,7);if(k)byMonth[k]=(byMonth[k]||0)+Number(c.valor||0)});
  pane.innerHTML=`
  <div class="section-card"><h2>Compras anteriores e custos</h2><p class="hint">Cadastre aqui as compras antigas. Elas entram nos cálculos financeiros, mas não alteram o estoque atual.</p>
    <div class="filters">
      <div><label>Mês da compra</label><input id="cxMes" type="month"></div>
      <div><label>Tipo de caixa</label><select id="cxTipo">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div><label>Unidade</label><select id="cxUnidade"><option value="fardos">Fardos</option><option value="caixas">Caixas</option></select></div>
      <div><label>Quantidade</label><input id="cxQtd" type="number" min="1" value="1"></div>
      <div><label>Valor total</label><input id="cxValor" inputmode="decimal" placeholder="Ex.: 1.250,00"></div>
      <div><label>Fornecedor</label><input id="cxFornecedor" placeholder="Opcional"></div>
      <div><label>NF</label><input id="cxNF" placeholder="Opcional"></div>
      <div><label>Observação</label><input id="cxObs" placeholder="Opcional"></div>
      <button class="export-btn" id="cxSalvar">REGISTRAR COMPRA</button>
    </div>
    <p class="hint" id="cxPreview">1 fardo = 25 caixas</p>
  </div>
  <div class="cards report-cards">
    <div class="metric neutral"><span>COMPRAS COM QUANTIDADE</span><strong>${brl(st.total)}</strong><small>Base para custo médio</small></div>
    <div class="metric neutral"><span>ESTOQUE ATUAL</span><strong>${totalSaldo}</strong><small>Caixas disponíveis</small></div>
    <div class="metric neutral"><span>VALOR ESTIMADO DO ESTOQUE</span><strong>${brl(totalValor)}</strong><small>Pelo custo médio por caixa</small></div>
  </div>
  <div class="section-card"><h2>Custo médio e valor do saldo</h2><div class="table-scroll"><table class="table"><thead><tr><th>Tipo</th><th>Caixas compradas</th><th>Valor informado</th><th>Custo médio/caixa</th><th>Saldo atual</th><th>Valor estimado saldo</th></tr></thead><tbody>${TYPES.map(t=>{const x=st.perType[t];return `<tr><td><b>${t}</b></td><td>${x.qty||'—'}</td><td>${x.value?brl(x.value):'—'}</td><td>${x.avg?`<b>${brl(x.avg)}</b>`:'—'}</td><td>${s[t]}</td><td>${x.avg?`<b>${brl(Math.max(0,s[t])*x.avg)}</b>`:'—'}</td></tr>`}).join('')}</tbody></table></div></div>
  <div class="section-card"><h2>Compras por mês</h2><div class="table-scroll"><table class="table"><thead><tr><th>Mês</th><th>Valor total</th></tr></thead><tbody>${Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).map(([m,v])=>`<tr><td><b>${monthLabel(m)}</b></td><td><b>${brl(v)}</b></td></tr>`).join('')||'<tr><td colspan="2" class="empty">Nenhuma compra cadastrada.</td></tr>'}</tbody></table></div></div>
  <div class="section-card"><h2>Histórico de compras</h2><div class="table-scroll"><table class="table"><thead><tr><th>Mês</th><th>Tipo</th><th>Quantidade</th><th>Valor</th><th>Custo/caixa</th><th>Fornecedor</th><th>NF</th><th>Observação</th><th>Ação</th></tr></thead><tbody>${compras.map(c=>{const m=meta(c),q=m?.caixas||0;return `<tr><td>${monthLabel(c.competencia)}</td><td>${m?.tipo||'—'}</td><td>${q||'—'}</td><td><b>${brl(c.valor)}</b></td><td>${q?brl(Number(c.valor||0)/q):'—'}</td><td>${esc(c.fornecedor||'—')}</td><td>${esc(c.nf||'—')}</td><td>${esc(note(c))}</td><td><button class="filter-btn cxDel" data-id="${c.id}">Excluir</button></td></tr>`}).join('')||'<tr><td colspan="9" class="empty">Nenhuma compra cadastrada.</td></tr>'}</tbody></table></div></div>`;
  const mes=$('#cxMes');if(mes)mes.value=new Date().toISOString().slice(0,7);
  const preview=()=>{const q=Math.max(1,Number($('#cxQtd')?.value||1)),u=$('#cxUnidade')?.value,caixas=u==='fardos'?q*25:q;$('#cxPreview').textContent=u==='fardos'?`${q} fardo${q>1?'s':''} = ${caixas} caixas`:`${caixas} caixa${caixas>1?'s':''}`};
  $('#cxQtd').oninput=preview;$('#cxUnidade').onchange=preview;preview();
  $('#cxSalvar').onclick=async()=>{const competencia=$('#cxMes').value;if(!competencia)return alert('Informe o mês da compra.');const tipo=$('#cxTipo').value,q=Math.max(1,Number($('#cxQtd').value||1)),caixas=$('#cxUnidade').value==='fardos'?q*25:q,valor=parseMoney($('#cxValor').value);if(!valor)return alert('Informe o valor total da compra.');const fornecedor=$('#cxFornecedor').value.trim(),nf=$('#cxNF').value.trim(),nota=$('#cxObs').value.trim();const {error}=await supabase.from('compras_controle').insert({competencia:competencia+'-01',valor,fornecedor:fornecedor||null,nf:nf||null,observacao:encode({tipo,caixas,nota})});if(error)return alert('Não foi possível salvar: '+error.message);alert('Compra registrada. O estoque não foi alterado.');render(pane)};
  pane.querySelectorAll('.cxDel').forEach(b=>b.onclick=async()=>{if(!confirm('Excluir esta compra? Isso não altera o estoque.'))return;const {error}=await supabase.from('compras_controle').delete().eq('id',b.dataset.id);if(error)return alert(error.message);render(pane)});
}
load();
