import type { GroupQuestionStats } from "@/types/questionType";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";



interface Props {
  data: GroupQuestionStats[];
}

export default function StatsBarChart({ data }: Props) {

  const { t } = useTranslation();

  const mapped = data.map((item, index) => ({
    ...item,
    label: `${t("dashboard.statsChart.questionLabel", "Pregunta")} ${index + 1}`,
  }));
  return (
    <div className="w-full h-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mapped} layout="vertical">
          <YAxis dataKey="label" type="category" width={120} tick={<CustomYAxisTick />} />
          <XAxis type="number" allowDecimals={false} />
          <Tooltip />
          <Legend />

          <Bar dataKey="correct_answers" fill="#74d4ff" name={t("dashboard.statsChart.correctLabel", "Correctas")} />
          <Bar dataKey="incorrect_answers" fill="#f87171" name={t("dashboard.statsChart.incorrectLabel", "Incorrectas")} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const CustomYAxisTick = ({ x = 0, y = 0, payload }: CustomTickProps) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#666"
        style={{ cursor: "pointer" }}
      >
        <title>
          {`Información de ${payload?.value}`}
        </title>
        {payload?.value}
      </text>
    </g>
  );
};

