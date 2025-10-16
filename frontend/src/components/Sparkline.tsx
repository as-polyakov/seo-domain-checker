import { LineChart, Line, ResponsiveContainer } from "recharts";

export const Sparkline = ({ data }: any) => (
  <div className="h-8 w-28">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v: number, i: number) => ({ i, v }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="v" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

