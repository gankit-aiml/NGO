"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', utilized: 0 },
  { name: 'Feb', utilized: 20000 },
  { name: 'Mar', utilized: 50000 },
  { name: 'Apr', utilized: 80000 },
  { name: 'May', utilized: 120000 },
  { name: 'Jun', utilized: 150000 },
];

export default function GraphComponent() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUtilized" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
        <Tooltip formatter={(value) => `₹${value}`} />
        <Area type="monotone" dataKey="utilized" stroke="#059669" fillOpacity={1} fill="url(#colorUtilized)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
