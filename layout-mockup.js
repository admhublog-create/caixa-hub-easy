// Replica a composição visual do mockup aprovado no painel administrativo.
if(location.pathname.toLowerCase().startsWith('/admin')){
const st=document.createElement('style');st.textContent=`
:root{--dash:#006777;--dash2:#004f5d;--ink:#112a4b}
body{background:#f4f7f8!important;color:var(--ink)}
.admin-wrap{padding:0 16px 35px 244px!important;background:#f4f7f8!important}.admin-shell{max-width:none!important;width:100%!important}
.tabs{width:218px!important;background:linear-gradient(180deg,#006777,#004d5a)!important;border:0!important;box-shadow:none!important}
.tabs:before{content:'▱  Caixas e Fita\A Gomada HUB'!important;white-space:pre!important;color:#fff!important;line-height:1.05!important}
.tabs:after{content:'Controle de Estoque Inteligente'!important;color:#c5e8eb!important;margin-top:30px!important;border-color:#177482!important}
.tab{color:#f2fbfc!important}.tab:hover,.tab.active{background:#0b7482!important;color:#fff!important}
.admin-head{min-height:auto!important;margin:0 -16px 14px!important;padding:15px 20px!important;background:linear-gradient(90deg,#087482,#00616f)!important;border-radius:0!important;color:#fff!important}
.admin-head .admin-kicker{display:none!important}.admin-head h1{color:#fff!important;font-size:22px!important;margin:0 0 3px!important}.admin-head p{color:#d8eff1!important;font-size:12px!important}.ghost-btn{background:#fff!important;border:0!important;color:#075c69!important;padding:9px 12px!important}
.cards{grid-template-columns:repeat(4,1fr)!important;gap:10px!important;margin-bottom:12px}.metric{border-radius:10px!important;padding:14px 15px!important;border:1px solid #dce7e9!important;box-shadow:none!important}.metric:before{display:none!important}.metric span{font-size:9px!important}.metric strong{font-size:25px!important;color:#10294a!important}.metric small{font-size:10px!important}
.section-card{border-radius:10px!important;border-color:#dce7e9!important;box-shadow:none!important}
.forecast-wrap{margin-top:0!important}.forecast-head{background:#fff;border:1px solid #dce7e9;border-radius:10px 10px 0 0;padding:14px 16px;margin:0!important}.forecast-head h2{font-size:18px!important;color:#10294a!important}.forecast-head p{font-size:11px!important}
.forecast-summary{margin:10px 0!important;grid-template-columns:repeat(4,1fr)!important}.forecast-summary>div{border-radius:10px!important;padding:13px 14px!important;position:relative}.forecast-summary>div:before{font-size:21px;float:left;margin-right:10px;color:#087785}.forecast-summary>div:nth-child(1):before{content:'▣'}.forecast-summary>div:nth-child(2):before{content:'⚠'}.forecast-summary>div:nth-child(3):before{content:'▰'}.forecast-summary>div:nth-child(4):before{content:'▥'}
.forecast-grid{grid-template-columns:repeat(3,1fr)!important;gap:10px!important}.forecast-card{border-radius:10px!important;box-shadow:none!important;border-color:#dce7e9!important}.forecast-card h3{color:#10294a!important}.forecast-kpi{background:#f4fafb!important;border:1px solid #e0edef!important}.forecast-kpi b{color:#10294a!important}
.charts{grid-template-columns:repeat(3,1fr)!important}.chart-card,.plan-card{border-radius:10px!important;box-shadow:none!important;border-color:#dce7e9!important}.chart-card h3,.plan-card h3{color:#10294a!important}.b1{background:#078393!important}.b2{background:#cbdadd!important}.dot{background:#078393!important}.minimum{border-color:#e15f59!important}
.plan-table th{background:#eef4f5!important;color:#35545b!important}.plan-table td{color:#17343d}.tip-card{background:#edf8f9!important;border-color:#d3e9eb!important}
@media(max-width:1100px){.forecast-grid,.charts{grid-template-columns:1fr!important}.forecast-summary{grid-template-columns:1fr 1fr!important}}
`;document.head.appendChild(st);
function decorate(){const pane=document.querySelector('[data-pane="resumo"]');if(!pane)return;
 const head=document.querySelector('.admin-head');if(head&&!head.dataset.mockup){head.dataset.mockup='1';const h=head.querySelector('h1');if(h)h.textContent='Resumo Geral';const p=head.querySelector('p');if(p)p.textContent='Visão completa do seu estoque e das próximas ações'}
 const tabs=document.querySelector('.tabs');if(tabs&&!tabs.dataset.labels){tabs.dataset.labels='1';const names={resumo:'Resumo',entradas:'Entradas',retiradas:'Retiradas',inventario:'Inventário',consumo:'Previsão e Planejamento',relatorios:'Relatórios'};tabs.querySelectorAll('.tab').forEach(b=>{if(names[b.dataset.tab])b.textContent=names[b.dataset.tab]})}
 const old=pane.querySelector('.cards');const forecast=pane.querySelector('.forecast-wrap');if(old&&forecast&&!old.dataset.mockup){old.dataset.mockup='1';old.style.display='none'}
}
new MutationObserver(decorate).observe(document.getElementById('app'),{subtree:true,childList:true});[0,250,700,1500].forEach(x=>setTimeout(decorate,x));
}