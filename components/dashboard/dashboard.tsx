"use client";
import {useEffect,useState} from "react";
import {Box,Boxes,PackageOpen,History} from "lucide-react";
import {KpiCard} from "@/components/ui/kpi-card";
import {supabase} from "@/lib/supabase";
const BASE={PP:1575,P:5550,M:1200};
type Kind=keyof typeof BASE;
type Withdrawal={tipo_caixa:Kind;total_caixas:number};
export function Dashboard(){const[rows,setRows]=useState<Withdrawal[]>([]);const[loading,setLoading]=useState(true);useEffect(()=>{if(!supabase){setLoading(false);return}supabase.from("retiradas").select("tipo_caixa,total_caixas").then(({data})=>{setRows((data||[]) as Withdrawal[]);setLoading(false)})},[]);const balance=(kind:Kind)=>BASE[kind]-rows.filter(r=>r.tipo_caixa===kind).reduce((sum,r)=>sum+Number(r.total_caixas||0),0);return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><KpiCard title="Estoque PP" value={loading?"…":balance("PP")} detail="saldo parcial" Icon={PackageOpen}/><KpiCard title="Estoque P" value={loading?"…":balance("P")} detail="saldo parcial" Icon={Box}/><KpiCard title="Estoque M" value={loading?"…":balance("M")} detail="saldo parcial" Icon={Boxes}/><KpiCard title="Retiradas" value={loading?"…":rows.length} detail="movimentações registradas" Icon={History}/></section>}