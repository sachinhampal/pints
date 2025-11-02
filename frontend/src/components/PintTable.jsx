import React, { useState, useRef, useEffect } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import { motion } from "framer-motion";

const BASE_API = "http://localhost:8000/api/records/";

    
export default function PintTable() {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef();

  useEffect(() => {
    async function loadData() {
      const res = await fetch(BASE_API);
      const json = await res.json();
      setRowData(json);
    }
    loadData();
  }, []);

  const columnDefs = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "number", headerName: "No.", width: 90 },
    { field: "friend_names", headerName: "Friends", flex: 1, valueFormatter: (p) => p.value?.join(", ") },
    { field: "comment", headerName: "Comment", flex: 1 },
    { field: "pint_brand", headerName: "Brand", width: 140 },
    { field: "pint_cost", headerName: "Pint (£)", width: 100 },
    { field: "total_cost", headerName: "Total (£)", width: 100 },
  ];

  return (
    <motion.div 
      className="container"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1 className="hero-title">Pint History</h1>
      <div className="ag-theme-pubtracker" style={{ width: "95%", height: "70vh" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          domLayout="normal"
          animateRows={true}
          headerHeight={50}
          rowHeight={45}
        />
      </div>
    </motion.div>
  );
}
