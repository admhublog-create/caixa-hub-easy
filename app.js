import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase=createClient(
  "https://c--09586474-253e-4035-b48c-481591adc286-prod.lovable.cloud",
  "sb_publishable_4zkSUbnHOH5kawdNM3d6lQ_xd5Do3bb"
);

const ESTOQUE_INICIAL={PP:1575,P:5550,M:1200};
const A=document.querySelector('#app');
const path=location.pathname.toLowerCase();
const theme=t=>t==='PP'?'pp':t==='P'?'p':'m';
const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
const fmt=d=>new Date(d).toLocaleString('pt-BR');

function home(){
  A.innerHTML=`<main class="wrap"><div class="home"><div class="brand">HUB</div><h1>RETIRADA DE CAIXAS</h1><p class="hint">Selecione o tipo de caixa para registrar a retirada. Cada fardo contém 25 caixas.</p><div class="types"><a class="type pp" href="/retirada/pp"><span>📦</span><b>Caixa PP</b><small>25 caixas por fardo</small></a><a class="type p" href="/retirada/p"><span>📦</span><b>Caixa P</b><small>25 caixas por fardo</small></a><a class="type m" href="/retirada/m"><span>📦</span><b>Caixa M</b><small>25 caixas por fardo</small></a></div><div class="home-links"><a href="/admin">Painel administrativo</a><a href="/qrcodes">QR Codes para impressão</a></div></div></main>`;
}

function retirada(tipo){
  let f=1;
  const c=theme(tipo);
  A.innerHTML=`<main class="wrap"><section class="panel"><header class="head ${c}"><div class="icon">📦</div><div class="eyebrow">RETIRADA DE CAIXAS</div><div class="title">CAIXA ${tipo}</div></header><div class="body"><p class="hint">Preencha os dados abaixo para registrar a retirada.</p><label class="label">RESPONSÁVEL</label><input id="nome" placeholder="Digite seu nome" maxlength="120"><label class="label">QUANTIDADE DE FARDOS</label><div class="step"><button id="menos">−</button><div class="count" id="f">1</div><button id="mais">+</button></div><p class="center" id="txt">Você está retirando: 1 fardo</p><p class="center">Total: <span class="total ${c}" id="tot">25</span> caixas</p><div class="info"><b>1 FARDO = 25 CAIXAS</b><div class="hint left">Todas as caixas (PP, P e M) têm 25 caixas por fardo.</div></div><button class="primary ${c}" id="salvar">REGISTRAR RETIRADA</button><div class="foot">🔒 Dados registrados com segurança</div></div></section></main>`;

  const upd=()=>{
    f=Math.max(1,Math.min(4,f));
    document.querySelector('#f').textContent=f;
    document.querySelector('#tot').textContent=f*25;
    document.querySelector('#txt').textContent=`Você está retirando: ${f} fardo${f>1?'s':''}`;
  };

  document.querySelector('#menos').onclick=()=>{f--;upd()};
  document.querySelector('#mais').onclick=()=>{f++;upd()};
  document.querySelector('#salvar').onclick=async()=>{
    const nome=document.querySelector('#nome').value.trim();
    if(!nome)return alert('Digite o nome do responsável.');
    if(!confirm(`Confirmar retirada de ${f} fardo(s) da Caixa ${tipo}?`))return;
    const btn=document.querySelector('#salvar');
    btn.disabled=true;
    btn.textContent='REGISTRANDO...';
    const {error}=await supabase.from('retiradas').insert({tipo_caixa:tipo,fardos:f,total_caixas:f*25,responsavel:nome});
    if(error){
      btn.disabled=false;
      btn.textContent='REGISTRAR RETIRADA';
      return alert('Não foi possível registrar: '+error.message);
    }
    const agora=new Date().toLocaleString('pt-BR');
    A.querySelector('.body').innerHTML=`<div class="success"><div class="success-icon">✓</div><h2>RETIRADA REGISTRADA<br>COM SUCESSO!</h2><div class="success-card"><p><b>Caixa:</b> ${tipo}</p><p><b>Fardos:</b> ${f}</p><p><b>Total:</b> ${f*25} caixas</p><p><b>Responsável:</b> ${esc(nome)}</p><p><b>Data/Hora:</b> ${agora}</p></div><button class="primary ${c}" onclick="location.href='/retirada/${tipo.toLowerCase()}'">NOVA RETIRADA</button><a class="backlink" href="/">Voltar ao início</a></div>`;
  };
}

async function admin(){
  A.innerHTML=`<main class="admin-wrap"><section class="admin-shell"><header class="admin-head"><div><div class="admin-kicker">HUB • CONTROLE OPERACIONAL</div><h1>Painel Administrativo</h1><p>Acompanhe o estoque e as retiradas de caixas em tempo real.</p></div><div class="admin-actions"><a class="ghost-btn" href="/">+ Nova retirada</a><a class="ghost-btn" href="/qrcodes">QR Codes</a><button class="ghost-btn" id="limparTestes" style="border-color:#dc2626;color:#b91c1c;cursor:pointer">Limpar registros de teste</button></div></header><nav class="tabs"><button class="tab active" data-tab="resumo">Resumo</button><button class="tab" data-tab="retiradas">Retiradas</button><button class="tab" data-tab="relatorios">Relatórios</button></nav><div id="loading" class="loading">Carregando dados...</div><div id="adminContent" hidden><section class="tabpane" data-pane="resumo"><div class="cards" id="cards"></div><div class="summary-grid"><div class="section-card"><div class="section-title"><h2>Últimas retiradas</h2><button class="text-btn" data-go="retiradas">Ver todas</button></div><div class="table-scroll"><table class="table"><thead><tr><th>Data/Hora</th><th>Responsável</th><th>Tipo</th><th>Fardos</th><th>Caixas</th></tr></thead><tbody id="recentRows"></tbody></table></div></div><div class="section-card"><h2>Distribuição do consumo por tipo</h2><div id="distribution"></div></div></div></section><section class="tabpane" data-pane="retiradas" hidden><div class="section-card"><div class="filters"><div><label>Data inicial</label><input type="date" id="dataIni"></div><div><label>Data final</label><input type="date" id="dataFim"></div><div><label>Tipo</label><select id="tipoFiltro"><option value="">Todos</option><option>PP</option><option>P</option><option>M</option></select></div><div><label>Responsável</label><input id="respFiltro" placeholder="Buscar nome"></div><button class="filter-btn" id="limpar">Limpar filtros</button></div><div class="table-meta"><span id="resultCount"></span><button class="export-btn" id="exportCsv">Exportar CSV</button></div><div class="table-scroll"><table class="table"><thead><tr><th>Data/Hora</th><th>Responsável</th><th>Tipo</th><th>Fardos</th><th>Caixas</th></tr></thead><tbody id="allRows"></tbody></table></div></div></section><section class="tabpane" data-pane="relatorios" hidden><div class="cards report-cards" id="reportCards"></div><div class="section-card"><h2>Resumo por tipo de caixa</h2><div class="table-scroll"><table class="table"><thead><tr><th>Tipo</th><th>Retiradas</th><th>Fardos</th><th>Caixas utilizadas</th><th>% do consumo</th></tr></thead><tbody id="reportRows"></tbody></table></div></div></section></div></section></main>`;

  document.querySelector('#limparTestes').onclick=async()=>{
    if(!confirm('ATENÇÃO: isso apagará TODOS os registros de retirada existentes. Deseja continuar?'))return;
    const palavra=prompt('Para confirmar, digite LIMPAR:');
    if(palavra!=='LIMPAR')return alert('Operação cancelada. Nenhum registro foi apagado.');
    const btn=document.querySelector('#limparTestes');
    btn.disabled=true;
    btn.textContent='Limpando...';
    const {error}=await supabase.from('retiradas').delete().not('created_at','is',null);
    if(error){
      btn.disabled=false;
      btn.textContent='Limpar registros de teste';
      return alert('Não foi possível limpar os registros: '+error.message);
    }
    const {data:restantes,error:checkError}=await supabase.from('retiradas').select('*').limit(1);
    if(checkError){
      btn.disabled=false;
      btn.textContent='Limpar registros de teste';
      return alert('A limpeza foi solicitada, mas não foi possível conferir o resultado: '+checkError.message);
    }
    if(restantes?.length){
      btn.disabled=false;
      btn.textContent='Limpar registros de teste';
      return alert('Os registros não foram apagados. O banco está bloqueando exclusões pelo painel.');
    }
    alert('Registros de teste apagados com sucesso. O estoque foi zerado para o ponto inicial oficial.');
    location.reload();
  };

  const {data,error}=await supabase.from('retiradas').select('*').order('created_at',{ascending:false});
  document.querySelector('#loading').remove();
  const content=document.querySelector('#adminContent');
  content.hidden=false;
  if(error){
    content.innerHTML=`<div class="errorbox">Não foi possível carregar os dados: ${esc(error.message)}</div>`;
    return;
  }

  const rows=data||[];
  const totals=calc(rows);
  renderCards(totals);
  renderRecent(rows);
  renderDistribution(totals);
  renderReports(rows,totals);

  let filtered=[...rows];
  const renderFiltered=()=>{
    const ini=document.querySelector('#dataIni').value;
    const fim=document.querySelector('#dataFim').value;
    const tipo=document.querySelector('#tipoFiltro').value;
    const resp=document.querySelector('#respFiltro').value.trim().toLowerCase();
    filtered=rows.filter(r=>{
      const d=new Date(r.created_at);
      const localDate=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return(!ini||localDate>=ini)&&(!fim||localDate<=fim)&&(!tipo||r.tipo_caixa===tipo)&&(!resp||String(r.responsavel).toLowerCase().includes(resp));
    });
    document.querySelector('#resultCount').textContent=`${filtered.length} retirada${filtered.length===1?'':'s'} • ${filtered.reduce((s,r)=>s+(Number(r.total_caixas)||0),0)} caixas`;
    document.querySelector('#allRows').innerHTML=tableRows(filtered);
  };

  ['dataIni','dataFim','tipoFiltro','respFiltro'].forEach(id=>document.querySelector('#'+id).addEventListener('input',renderFiltered));
  document.querySelector('#limpar').onclick=()=>{
    ['dataIni','dataFim','tipoFiltro','respFiltro'].forEach(id=>document.querySelector('#'+id).value='');
    renderFiltered();
  };
  document.querySelector('#exportCsv').onclick=()=>exportCSV(filtered);
  renderFiltered();

  const activate=name=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    document.querySelectorAll('.tabpane').forEach(p=>p.hidden=p.dataset.pane!==name);
  };
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>activate(b.dataset.tab));
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>activate(b.dataset.go));
}

function calc(rows){
  const out={PP:{caixas:0,fardos:0,n:0},P:{caixas:0,fardos:0,n:0},M:{caixas:0,fardos:0,n:0}};
  rows.forEach(r=>{
    const x=out[r.tipo_caixa];
    if(x){
      x.caixas+=Number(r.total_caixas)||0;
      x.fardos+=Number(r.fardos)||0;
      x.n++;
    }
  });
  ['PP','P','M'].forEach(k=>{
    out[k].inicial=ESTOQUE_INICIAL[k];
    out[k].saldo=Math.max(0,ESTOQUE_INICIAL[k]-out[k].caixas);
    out[k].saldoFardos=out[k].saldo/25;
  });
  out.total=out.PP.caixas+out.P.caixas+out.M.caixas;
  out.fardos=out.PP.fardos+out.P.fardos+out.M.fardos;
  out.n=rows.length;
  out.inicial=ESTOQUE_INICIAL.PP+ESTOQUE_INICIAL.P+ESTOQUE_INICIAL.M;
  out.saldo=out.PP.saldo+out.P.saldo+out.M.saldo;
  return out;
}

function renderCards(t){
  document.querySelector('#cards').innerHTML=`<div class="metric pp"><span>ESTOQUE ATUAL PP</span><strong>${t.PP.saldo}</strong><small>Inicial ${t.PP.inicial} • ${t.PP.caixas} utilizadas</small></div><div class="metric p"><span>ESTOQUE ATUAL P</span><strong>${t.P.saldo}</strong><small>Inicial ${t.P.inicial} • ${t.P.caixas} utilizadas</small></div><div class="metric m"><span>ESTOQUE ATUAL M</span><strong>${t.M.saldo}</strong><small>Inicial ${t.M.inicial} • ${t.M.caixas} utilizadas</small></div><div class="metric totalmetric"><span>ESTOQUE TOTAL ATUAL</span><strong>${t.saldo}</strong><small>Inicial ${t.inicial} • ${t.total} utilizadas</small></div>`;
}

function badge(t){return `<span class="badge ${theme(t)}">${t}</span>`}
function tableRows(rows){return rows.length?rows.map(r=>`<tr><td>${fmt(r.created_at)}</td><td><b>${esc(r.responsavel)}</b></td><td>${badge(r.tipo_caixa)}</td><td>${r.fardos}</td><td><b>${r.total_caixas}</b></td></tr>`).join(''):`<tr><td colspan="5" class="empty">Nenhuma retirada encontrada.</td></tr>`}
function renderRecent(rows){document.querySelector('#recentRows').innerHTML=tableRows(rows.slice(0,8))}

function renderDistribution(t){
  const total=t.total||1;
  document.querySelector('#distribution').innerHTML=['PP','P','M'].map(k=>{
    const pct=Math.round(t[k].caixas/total*100);
    return `<div class="dist"><div><span>${badge(k)}</span><b>${t[k].caixas} caixas utilizadas</b></div><div class="bar"><i class="${theme(k)}" style="width:${pct}%"></i></div><small>${t.total?pct:0}% do consumo total</small></div>`;
  }).join('');
}

function renderReports(rows,t){
  const hoje=new Date();
  const today=rows.filter(r=>new Date(r.created_at).toDateString()===hoje.toDateString());
  const mes=rows.filter(r=>{
    const d=new Date(r.created_at);
    return d.getMonth()===hoje.getMonth()&&d.getFullYear()===hoje.getFullYear();
  });
  document.querySelector('#reportCards').innerHTML=`<div class="metric neutral"><span>RETIRADAS HOJE</span><strong>${today.length}</strong><small>${today.reduce((s,r)=>s+(Number(r.total_caixas)||0),0)} caixas</small></div><div class="metric neutral"><span>RETIRADAS NO MÊS</span><strong>${mes.length}</strong><small>${mes.reduce((s,r)=>s+(Number(r.total_caixas)||0),0)} caixas</small></div><div class="metric neutral"><span>CAIXAS UTILIZADAS</span><strong>${t.total}</strong><small>${t.fardos} fardos</small></div><div class="metric neutral"><span>ESTOQUE RESTANTE</span><strong>${t.saldo}</strong><small>de ${t.inicial} caixas iniciais</small></div>`;
  document.querySelector('#reportRows').innerHTML=['PP','P','M'].map(k=>`<tr><td>${badge(k)}</td><td>${t[k].n}</td><td>${t[k].fardos}</td><td><b>${t[k].caixas}</b></td><td>${t.total?Math.round(t[k].caixas/t.total*100):0}%</td></tr>`).join('');
}

function exportCSV(rows){
  const q=v=>'\"'+String(v??'').replaceAll('\"','\"\"')+'\"';
  const csv=['Data/Hora,Responsável,Tipo,Fardos,Caixas',...rows.map(r=>[fmt(r.created_at),r.responsavel,r.tipo_caixa,r.fardos,r.total_caixas].map(q).join(','))].join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`retiradas-caixas-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function qrs(){
  const base=location.origin;
  A.innerHTML=`<main class="qr-page"><section class="qr-shell"><header class="qr-head"><div class="qr-icon">▣</div><div><h1>ESCANEIE O QR CODE DA CAIXA QUE VAI RETIRAR</h1><p>O QR Code abre diretamente a tela de retirada do tamanho escolhido.</p></div></header><div class="qrgrid">${['PP','P','M'].map(t=>{const u=base+'/retirada/'+t.toLowerCase();return `<article class="qrcard ${theme(t)}"><div class="qr-label">CAIXA ${t}</div><img src="https://quickchart.io/qr?size=300&margin=2&text=${encodeURIComponent(u)}" alt="QR ${t}"><strong>25 CAIXAS POR FARDO</strong><small>Aponte a câmera do celular</small></article>`}).join('')}</div><div class="qr-note"><b>1 FARDO = 25 CAIXAS</b><span>Todas as caixas (PP, P e M) têm 25 caixas por fardo.</span></div><div class="qr-actions"><button onclick="window.print()">IMPRIMIR QR CODES</button><a href="/">VOLTAR AO SISTEMA</a></div></section></main>`;
}

if(path==='/admin')admin();
else if(path==='/qrcodes')qrs();
else if(path.startsWith('/retirada/')){
  const t=path.split('/').pop().toUpperCase();
  if(['PP','P','M'].includes(t))retirada(t);
  else home();
}else home();