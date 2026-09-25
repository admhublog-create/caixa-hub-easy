"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
import {Card,CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {KpiCard} from "@/components/ui/kpi-card";
import {CircleDot,History,PackageOpen} from "lucide-react";
import {TapeWithdrawal} from "./tape-withdrawal";
import {TapeInventory} from "./tape-inventory";
import {TapePurchases} from "./tape-purchases";
import {TapeHistory} from "./tape-history";
const BASE=143,PER_BOX=15;
type R={created_at:string;rolos:number;responsavel?:string};
type E={created_at:string;total_rolos:number;caixas?:number;rolos_avulsos?:number;kg?:number;valor?:number;fornecedor?:string;observacao?:string};
type P={id:string;competencia:string;kg?:number;caixas:number;rolos:number;valor?:number;fornecedor?:string};
type I={id?:string;data?:string;created_at:string;caixas?:number;rolos_avulsos?:number;total_rolos:number;saldo_sistema_antes?:number;diferenca?:number;observacao?:string};
export function TapePage(){
 const[rr,setR]=useState<R[]>([]),[ee,setE]=useState<E[]>([]),[inv,setInv]=useState<I|null>(null),[inventories,setInventories]=useState<I[]>([]),[purchases,setPurchases]=useState<P[]>([]);
 const[boxes,setBoxes]=useState("0"),[rolls,setRolls]=useState("0"),[kg,setKg]=useState(""),[value,setValue]=useState(""),[supplier,setSupplier]=useState(""),[note,setNote]=useState(""),[msg,setMsg]=useState(""),[loadError,setLoadError]=useState("");
 async function load(){if(!supabase){setLoadError("Conexão com o banco indisponível.");return}setLoadError("");const[r,e,i,ih,p]=await Promise.all([
  supabase.from("fita_retiradas").select("created_at,rolos,responsavel").order("created_at",{ascending:false}),
  supabase.from("fita_entradas").select("created_at,total_rolos,caixas,rolos_avulsos,kg,valor,fornecedor,observacao").order("created_at",{ascending:false}),
  supabase.from("fita_inventarios").select("created_at,total_rolos").order("data",{ascending:false}).order("created_at",{ascending:false}).limit(1),
  supabase.from("fita_inventarios").select("*").order("data",{ascending:false}).order("created_at",{ascending:false}),
  supabase.from("fita_compras_historicas").select("*").order("competencia",{ascending:false})
 ]);if(r.error||e.error||i.error||ih.error||p.error){setLoadError("Não foi possível carregar todos os dados da Fita Gomada. Os saldos não devem ser considerados até a atualização.");return}setR((r.data||[]) as R[]);setE((e.data||[]) as E[]);setInv((i.data?.[0]||null) as I|null);setInventories((ih.data||[]) as I[]);setPurchases((p.data||[]) as P[])}
 useEffect(()=>{load()},[]);
 const cut=inv?new Date(inv.created_at):null,base=inv?Number(inv.total_rolos):BASE,used=rr.filter(x=>!cut||new Date(x.created_at)>cut).reduce((s,x)=>s+Number(x.rolos||0),0),added=ee.filter(x=>!cut||new Date(x.created_at)>cut).reduce((s,x)=>s+Number(x.total_rolos||0),0),stock=base+added-used;
 async function add(){const cx=Math.max(0,Number(boxes)||0),av=Math.max(0,Number(rolls)||0),total=cx*PER_BOX+av;if(!supabase||!total){setMsg("Informe caixas ou rolos para registrar a entrada.");return}setMsg("");const{error}=await supabase.from("fita_entradas").insert({caixas:cx,rolos_avulsos:av,total_rolos:total,kg:Number(kg)||null,valor:Number(value)||null,fornecedor:supplier.trim()||null,observacao:note.trim()||null});if(error){setMsg("Não foi possível registrar a entrada.");return}setBoxes("0");setRolls("0");setKg("");setValue("");setSupplier("");setNote("");setMsg("Entrada registrada com sucesso.");await load()}
 return <>{loadError&&<div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{loadError}</div>}<div className="mb-7"><p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-[var(--primary)]">Controle operacional</p><h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Fita Gomada</h2><p className="mt-1 text-sm text-[var(--muted)]">Controle de estoque físico. 1 caixa = 15 rolos.</p></div>
 {!loadError&&<section className="grid gap-4 md:grid-cols-3"><KpiCard title="Estoque atual" value={stock} detail="rolos disponíveis" Icon={CircleDot}/><KpiCard title="Entradas" value={ee.length} detail="movimentações físicas" Icon={PackageOpen}/><KpiCard title="Retiradas" value={rr.length} detail="movimentações registradas" Icon={History}/></section>}
 {!loadError&&<div className="mt-6 grid gap-6"><TapeWithdrawal onSaved={load}/><Card><CardContent><h3 className="mb-1 font-bold">Nova entrada de fita gomada</h3><p className="mb-4 text-sm text-[var(--muted)]">Esta operação altera o estoque físico.</p>
 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Input type="number" min="0" value={boxes} onChange={e=>setBoxes(e.target.value)} placeholder="Caixas fechadas"/><Input type="number" min="0" value={rolls} onChange={e=>setRolls(e.target.value)} placeholder="Rolos avulsos"/><Input type="number" step="0.001" value={kg} onChange={e=>setKg(e.target.value)} placeholder="Peso (kg)"/><Input type="number" step="0.01" value={value} onChange={e=>setValue(e.target.value)} placeholder="Valor da compra"/><Input value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="Fornecedor"/><Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Observação"/><Button onClick={add}>Registrar entrada</Button></div>
 <p className="mt-3 text-sm font-medium">Total da entrada: {(Number(boxes)||0)*PER_BOX+(Number(rolls)||0)} rolos</p>{msg&&<p className="mt-2 text-sm font-medium">{msg}</p>}</CardContent></Card>
 <TapeInventory stock={stock} onSaved={load}/><TapePurchases onSaved={load}/><TapeHistory withdrawals={rr} entries={ee} purchases={purchases} inventories={inventories}/></div>}</>}
