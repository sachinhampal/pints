// src/utils/chartConfig.js
export const legendSelectedThreshold = 7;

export const chartBaseOption = {
  tooltip: { trigger: "item" },
  title: {
    top: 5,
    left: "left",
    textStyle: { fontSize: 30 },
    subtextStyle: { fontSize: 14 },
  },
  color: [
    "#394a51",
    "#7fa99b",
    "#fbf2d5",
    "#fdc57b",
    "#b9965b",
    "#f9a828",
    "#07617d",
    "#2e383f",
  ],
  textStyle: { fontFamily: "IBM Plex Mono" },
  legend: {
    type: "scroll",
    orient: "vertical",
    left: "left",
    top: 100,
  },
  series: [
    {
      type: "pie",
      radius: "75%",
      center: ["50%", "40%"],
      label: {
        show: true, 
        formatter: "{b} | {c}",
        overflow: "break",
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
};