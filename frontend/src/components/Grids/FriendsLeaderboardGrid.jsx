// src/components/FriendsLeaderboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { motion } from "framer-motion";


export default function FriendsLeaderboard({ friendsInfo }) {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef();

  useEffect(() => {
    if (!friendsInfo) return;
    const leaderboardData = Object.entries(friendsInfo.friends_info)
      .map(([name, info]) => {
        const favoritePub = Object.entries(info.pub_2_frequency || {}).reduce(
          (max, cur) => (cur[1] > max[1] ? cur : max),
          ["", 0]
        )[0];

        return {
          pintRank: info.pint_count_rank,
          name,
          pintCount: info.pint_count,
          favoritePub,
          icon: info.icon || "🍺",
        };
      })
      .sort((a, b) => a.pintRank - b.pintRank);

    setRowData(leaderboardData);
  }, [friendsInfo]);

  const columnDefs = [
    {
      field: "pintRank",
      headerName: "Rank",
      width: 80,
      cellRenderer: (params) => {
        const v = params.value;
        if (v === 1) return "🥇";
        if (v === 2) return "🥈";
        if (v === 3) return "🥉";
        return v;
      },
      sortable: true,
    },
    { field: "name", headerName: "Friend", flex: 1 },
    { field: "pintCount", headerName: "Pints", width: 120, sortable: true },
    { field: "favoritePub", headerName: "Favourite Pub", flex: 1.8 },
  ];

  return (
    <motion.div 
      className="container"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1 className="hero-title">
        Friends Leaderboard
      </h1>
      <br />
      <br />
      <div
        className="ag-theme-pubtracker"
        style={{ width: "80%", height: "70vh" }}
      >        
      {/* AG Grid expects the container to size the viewport; domLayout normal works well inside an overflowed wrapper */}
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          domLayout="normal"
          animateRows={true}
          headerHeight={50}
          rowHeight={50}
          suppressPaginationPanel={true}
          // keep the grid from expanding beyond wrapper
          suppressScrollOnNewData={true}
        />
      </div>
    </motion.div>
  );
}
