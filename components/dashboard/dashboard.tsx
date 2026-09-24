"use client";
import {Box,Boxes,PackageOpen,History} from "lucide-react";
import {KpiCard} from "@/components/ui/kpi-card";
export function Dashboard(){return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><KpiCard title="Estoque PP" value="—" detail="caixas disponíveis" Icon={PackageOpen}/><KpiCard title="Estoque P" value="—" detail="caixas disponíveis" Icon={Box}/><KpiCard title="Estoque M" value="—" detail="caixas disponíveis" Icon={Boxes}/><KpiCard title="Retiradas" value="—" detail="movimentações registradas" Icon={History}/></section>}