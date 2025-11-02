// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import FriendsLeaderboard from "./Grids/FriendsLeaderboardGrid";
import PintsPerLocationChart from "./Charts/PintsPerLocationChart";
import "../styles/index.css";

const BASE_API = "http://localhost:8000/stats";

export default function Dashboard() {
  const [locationInfo, setLocationData] = useState(null);
  const [friendsInfo, setFriendsData] = useState(null);

  useEffect(() => {
    async function load() {
      const locationData = await fetch(`${BASE_API}/location/`);
      const locationJson = await locationData.json();
      const friendsData = await fetch(`${BASE_API}/friends/`);
      const friendsJson = await friendsData.json();
      setLocationData(locationJson);
      setFriendsData(friendsJson);
    }
    load();
  }, []);

  if (!locationInfo && !friendsInfo) return <div style={{padding: 24}}>Loading... </div>;


  return (
    <div>
      {/* Section 1: Leaderboard */}
      <section>
        <FriendsLeaderboard friendsInfo={friendsInfo}/>
      </section>
      {/* Section 4: Pints per month */}
      <section>
        <PintsPerLocationChart locationInfo={locationInfo} />
      </section>
    </div>
  );
}
