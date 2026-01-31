import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StatsItem {
  question_id: string;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy: number;
}

interface Props {
  data: StatsItem[];
}

export default function StatsBarChart({ data }: Props) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="question_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="accuracy" fill="#4f46e5" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
