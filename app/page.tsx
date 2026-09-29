"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";

const BASE={PP:1575,P:5550,M:1200}; type Kind=keyof typeof BASE;
type W={tipo_caixa:Kind;total_caixas:number;created_at:string}; type I={data_inventario:string;created_at:string;pp_contado:number;p_contado:number;m_contado:number};

export default function Page(){
 const[stock,setStock]=useState<Record<Kind,number>|null>(null),[tape,setTape]=useState<number|null>(null);
 useEffect(()=>{if(!supabase)return;Promise.all([
  supabase.from("retiradas").select("tipo_caixa,total_caixas,created_at"),
  supabase.from("entradas_estoque").select("tipo_caixa,total_caixas,created_at"),
  supabase.from("inventarios").select("data_inventario,created_at,pp_contado,p_contado,m_contado").order("data_inventario",{ascending:false}).order("created_at",{ascending:false}).limit(1),
  supabase.from("fita_retiradas").select("rolos,created_at"),
  supabase.from("fita_entradas").select("total_rolos,created_at"),
  supabase.from("fita_inventarios").select("total_rolos,created_at").order("data",{ascending:false}).order("created_at",{ascending:false}).limit(1)
 ]).then(([wr,en,iv,tr,te,ti])=>{
  const rows=(wr.data||[]) as W[],entries=(en.data||[]) as W[],inv=(iv.data?.[0]||null) as I|null;
  const calc=(k:Kind)=>{let v=BASE[k]+entries.filter(x=>x.tipo_caixa===k).reduce((s,x)=>s+Number(x.total_caixas||0),0)-rows.filter(x=>x.tipo_caixa===k).reduce((s,x)=>s+Number(x.total_caixas||0),0);if(inv){const d=new Date(inv.data_inventario+"T23:59:59");const key={PP:"pp_contado",P:"p_contado",M:"m_contado"}[k] as "pp_contado"|"p_contado"|"m_contado";v=Number(inv[key])+entries.filter(x=>x.tipo_caixa===k&&new Date(x.created_at)>d).reduce((s,x)=>s+Number(x.total_caixas||0),0)-rows.filter(x=>x.tipo_caixa===k&&new Date(x.created_at)>d).reduce((s,x)=>s+Number(x.total_caixas||0),0)}return v};setStock({PP:calc("PP"),P:calc("P"),M:calc("M")});
  const last=ti.data?.[0] as {total_rolos:number;created_at:string}|undefined,cut=last?new Date(last.created_at):null,used=(tr.data||[]).filter((x:any)=>!cut||new Date(x.created_at)>cut).reduce((s:number,x:any)=>s+Number(x.rolos||0),0),added=(te.data||[]).filter((x:any)=>!cut||new Date(x.created_at)>cut).reduce((s:number,x:any)=>s+Number(x.total_rolos||0),0);setTape((last?Number(last.total_rolos):0)+added-used);
 }).catch(()=>{})},[]);
 const qty=(k:Kind)=>stock?stock[k].toLocaleString("pt-BR"):"…";
 return <main className="min-h-screen bg-[#f5f7fb] px-4 py-10 sm:py-14"><section className="mx-auto max-w-4xl text-center"><div className="mx-auto mb-4 inline-block rounded-xl bg-[#17365d] px-4 py-2 font-black tracking-[.12em] text-white">HUB</div><h1 className="text-3xl font-black text-[#17365d] sm:text-4xl">RETIRADA DE MATERIAIS</h1><p className="mt-2 text-sm text-gray-500">Selecione o material para registrar a retirada.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <Link href="/qr/pp" className="rounded-2xl bg-[#7b4acb] p-7 text-white shadow-sm"><span className="block text-3xl">📦</span><b className="mt-2 block text-2xl">Caixa PP</b><small>25 caixas por fardo</small><strong className="mt-4 block border-t border-white/30 pt-3 text-base">Disponível: {qty("PP")} caixas</strong></Link>
 <Link href="/qr/p" className="rounded-2xl bg-[#2f9b62] p-7 text-white shadow-sm"><span className="block text-3xl">📦</span><b className="mt-2 block text-2xl">Caixa P</b><small>25 caixas por fardo</small><strong className="mt-4 block border-t border-white/30 pt-3 text-base">Disponível: {qty("P")} caixas</strong></Link>
 <Link href="/qr/m" className="rounded-2xl bg-[#2f7dd1] p-7 text-white shadow-sm"><span className="block text-3xl">📦</span><b className="mt-2 block text-2xl">Caixa M</b><small>25 caixas por fardo</small><strong className="mt-4 block border-t border-white/30 pt-3 text-base">Disponível: {qty("M")} caixas</strong></Link>
 <Link href="/retirada/fita-gomada" className="rounded-2xl bg-[#c77732] p-7 text-white shadow-sm"><span className="block text-3xl">📦</span><b className="mt-2 block text-2xl">Fita Gomada</b><small>Registrar retirada</small><strong className="mt-4 block border-t border-white/30 pt-3 text-base">Disponível: {tape===null?"…":tape.toLocaleString("pt-BR")} rolos</strong></Link>
 </div></section></main>}
