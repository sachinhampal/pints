// =======================
// Map + Heatmap Section
// =======================

const map = L.map('map').setView([51.455, -0.09], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const geoJsonFiles = [
  "camden", "city-of-london", "city-of-westminster", "greenwich", "hackney",
  "hammersmith-and-fulham", "islington", "kensington-and-chelsea", "lambeth",
  "lewisham", "southwark", "tower-hamlets", "wandsworth"
].map(name => `./data/geo-jsons/${name}.geo.json`);

const fetchTotalPubCount = async () => {
  const counts = await Promise.all(
    geoJsonFiles.map(async file => {
      const res = await fetch(file);
      const json = await res.json();
      return json.properties.pints_info.pub_count;
    })
  );
  return counts.reduce((sum, count) => sum + count, 0);
};

const getColor = (count, total) => {
  const percent = count ? (count / total) * 100 : 0;
  return percent > 20 ? '#7f0000' :
         percent > 17 ? '#b30000' :
         percent > 13 ? '#d7301f' :
         percent > 12 ? '#ef6548' :
         percent > 8  ? '#fc8d59' :
         percent > 5  ? '#fdbb84' :
         percent > 2  ? '#fdd49e' :
         percent > 1  ? '#fee8c8' : '#fff7ec';
};

const styleFeature = (feature, total) => ({
  fillColor: getColor(feature.properties.pints_info.pub_count, total),
  weight: 2,
  opacity: 1,
  color: 'white',
  dashArray: '3',
  fillOpacity: 0.9
});

const loadHeatMapLayers = async () => {
  const total = await fetchTotalPubCount();
  for (const file of geoJsonFiles) {
    const res = await fetch(file);
    const json = await res.json();
    L.geoJson(json, {
      style: () => styleFeature(json, total)
    }).addTo(map);
  }
};

loadHeatMapLayers();


// =======================
// Leaderboard Section
// =======================

const renderLeaderboard = leaderboard => {
  const container = document.getElementById('leaderboard');
  container.innerHTML = '';
  leaderboard.forEach(entry => container.appendChild(createLeaderboardItem(entry)));
};

const createLeaderboardItem = ({ icon, name, pint_count }) => {
  const div = document.createElement('div');
  div.className = 'leaderboard';

  const className = pint_count < 0 ? 'negative' : 'positive';
  const formatted = Math.abs(pint_count).toFixed(1);

  div.innerHTML = `
    <div class="transaction-info">
      <div class="icon">${icon}</div>
      <div class="text">${name}</div>
    </div>
    <div class="amount ${className}">${formatted}</div>
  `;

  return div;
};

const loadLeaderboard = async () => {
  try {
    const res = await fetch('./data/pints_info.json');
    const data = await res.json();
    renderLeaderboard(data.leaderboard);
    document.getElementById('balance').textContent = data.total_pint_count.toFixed(1);
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
};


// =======================
// Charts Section
// =======================

const loadCharts = async () => {
  try {
    const res = await fetch('./data/pints_info.json');
    const data = await res.json();

    // Split and sort separately
    const locationsVisited = data.location_info
      .slice() // make a copy
      .sort((a, b) => b.number_of_visits - a.number_of_visits);

    const locationsPints = data.location_info
      .slice()
      .sort((a, b) => b.number_of_pints - a.number_of_pints);

    // Visits chart data
    const visitLabels = locationsVisited.map(loc => loc.name);
    const visits = locationsVisited.map(loc => loc.number_of_visits);

    // Pints chart data
    const pintLabels = locationsPints.map(loc => loc.name);
    const pints = locationsPints.map(loc => loc.number_of_pints);

    // Chart base options
    const baseOptions = {
      chart: {
        type: 'bar',
        height: 600,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '90%',
          borderRadius: 6,
          endingShape: 'rounded'
        }
      },
      dataLabels: { enabled: false },
      grid: { borderColor: '#eee' },
      theme: { mode: 'light' },
      xaxis: {
        labels: {
          rotate: 0,
          style: { fontSize: '13px' },
          trim: true,
        },
        title: {
          text: 'Pub Names',
          style: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }
      },
      yaxis: {
        labels: {
          style: { fontSize: '13px' }
        },
        title: {
          text: 'Count',
          style: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }
      }
    };

    // Create and render Visits chart
    new ApexCharts(document.querySelector("#visitsChart"), {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        width: visitLabels.length * 215
      },
      xaxis: {
        ...baseOptions.xaxis,
        categories: visitLabels
      },
      series: [{ name: 'Visits', data: visits }]
    }).render();

    // Create and render Pints chart
    new ApexCharts(document.querySelector("#pintsChart"), {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        width: pintLabels.length * 215
      },
      xaxis: {
        ...baseOptions.xaxis,
        categories: pintLabels
      },
      series: [{ name: 'Pints', data: pints }],
      colors: ['#0084ff']
    }).render();

  } catch (err) {
    console.error('Failed to load charts:', err);
  }
};



// =======================
// DOM Start
// =======================

document.addEventListener('DOMContentLoaded', () => {
  loadLeaderboard();
  loadCharts();
});




//
// THE FOLLOWING WILL BE DEPRECATED
//
// const latitude = [
//     51.5460, 51.4650, 51.5135, 51.9920, 51.5074, 51.4650, 51.4630, 51.5175, 51.5230, 
//     51.5270, 51.4900, 51.5470, 51.5460, 51.4630, 51.4650, 51.4950, 51.5170, 51.4750, 
//     51.5310, 51.5310, 51.5460, 51.5460, 51.5020, 51.4900, 51.3810, 51.5130, 51.4450, 
//     51.5070, 51.5440, 51.5380, 51.4480, 51.5220, 51.5140, 53.4790, 53.4780, 53.4790
// ]

// const longitude = [
//     -0.0622, -0.1246, -0.1310, -0.1760, -0.1278, -0.1140, -0.1140, -0.0700, -0.1330, 
//     -0.0620, -0.2220, -0.1410, -0.0570, -0.1820, -0.1750, -0.1110, -0.0710, -0.0550, 
//     -0.0750, -0.0720, -0.0760, -0.0760, -0.0780, -0.1740, -2.3590, -0.1310, -0.1450, 
//     -0.0870, -0.0780, -0.1050, -0.0900, -0.0770, -0.0750, -2.2420, -2.2420, -2.2420
// ]

// const zip = (a, b) => a.map((k, i) => [k, b[i]]);

// function createCirlce(coordinate) {
//     return L.circle(coordinate, {
//         color: 'red',
//         fillColor: '#f03',
//         fillOpacity: 0.2,
//         radius: 50
//         }).addTo(map)
// }

// const coordinates = zip(latitude, longitude)

// coordinates.forEach(item => createCirlce(item))