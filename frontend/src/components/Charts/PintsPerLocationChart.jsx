// src/components/PintsPerLocationChart.jsx
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { chartBaseOption } from "../../utils/chartConfig";
import { motion } from "framer-motion";


export default function PintsPerLocationChart({ locationInfo = {} }) {
  const seriesData = useMemo(() => {
    return Object.entries(locationInfo.location_info)
      .map(([k, v]) => ({ name: k, value: v.number_of_pints }))
      .sort((a, b) => b.value - a.value);
  }, [locationInfo]);

  const locationNames = seriesData.map((s) => s.name);

  const option = {
    ...chartBaseOption,
    title: { ...chartBaseOption.title},
    legend: {
      ...chartBaseOption.legend,
      show: false,
      data: locationNames,
      selected: locationNames.reduce((acc, curr, idx) => {
        acc[curr] = idx < 7;
        return acc;
      }, {}),
    },
    series: [{ ...chartBaseOption.series[0], data: seriesData }],
  };

  return (
    <section className="chart-section">
      <motion.div
        className="hero-side"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="hero-title">Pints per Location</h2>
      </motion.div>

      <div className="chart-side">
        <ReactECharts
          option={option}
          className="echarts-pie"
        />
      </div>
    </section>
  );
}
