
// ============================================================================
// Constants
// ============================================================================

const _legendSelectedThreshold = 7
const _barChartBaseOption =  {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
      },
      xAxis: [
        {
            type: 'category',
            axisTick: {
                alignWithLabel: true,
            }
        },
      ],
      yAxis: [{type: 'value'}],
      series: [
        {
            type: 'bar',
            barWidth: '80%',
        }
      ]
}
const _pieChartBaseOption = {
    tooltip: {
        trigger: 'item',
    },
    legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 100,
        top: 100,
        bottom: 2,
    },
    series: [
        {
            type: 'pie',
            radius: '70%',
            center: ['35%', '55%'],
            label: {show: false},
            emphasis: {
                itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
}

// ============================================================================
// Helpers
// ============================================================================

function _renderPieChart(elementId, titleText, legendValues, seriesData, selectedThreshold) {
    element = document.getElementById(elementId) 
    if (!element) {
        return
    }
    var chart = echarts.init(element);
    var option = {
        ..._pieChartBaseOption,
        title: {
            text: titleText,
        },
        legend: {
            ..._pieChartBaseOption.legend,
            data: legendValues,
            selected: legendValues.reduce((prev, curr, idx) => {
                prev[curr] = idx < selectedThreshold
                return prev 
            }, {})
        },
        series: _pieChartBaseOption.series.map(x => ({...x, data: seriesData}))
    };
    chart.setOption(option)
}


// ============================================================================
// Render pie charts
// ============================================================================

function renderVisitsPerLocationChart(locationInfo) {
    const seriesData = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_visits})).sort((a, b) => b.value - a.value);
    const locationNames = seriesData.map(loc => loc.name)
    _renderPieChart(
        "visitsPerLocationChart",
        "Number of visits per pub...",
        locationNames,
        seriesData,
        _legendSelectedThreshold,
    )
}

function renderPintsPerLocationChart(locationInfo) {
    const seriesData = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_pints})).sort((a, b) => b.value - a.value);
    const locationNames = seriesData.map(loc => loc.name)
    _renderPieChart(
        "pintsPerLocationChart",
        "Number of pints per pub...",
        locationNames,
        seriesData,
        _legendSelectedThreshold,
    )
}

function renderPintsPerMonthChart(monthsInfo) {
    const seriesData = monthsInfo.map(o => ({name: o.month, value: o.number_of_pints}))
    const monthNames = seriesData.map(o => o.name)
    _renderPieChart(
        "pintsPerMonthChart",
        "Number of pints per month...",
        monthNames,
        seriesData,
        12,
    )
}

function renderLocationsPieChart(locationInfo) {
    const sortedNumberOfPintsPerLocation = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_pints})).sort((a, b) => b.value - a.value);
    const sortedNumberOfVisitsPerLocation = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_visits})).sort((a, b) => b.value - a.value);
    const locationNames = sortedNumberOfPintsPerLocation.map(loc => loc.name)

    elementId = "locationInfoNetedPieChart"
    titleText = "Location Stats"
    subText = "Outer ring: Number of pints\nInner ring: Number of times visited"
    element = document.getElementById(elementId)
    if (!element) {
        return
    }

    var chart = echarts.init(element);
    var option = {
        ..._pieChartBaseOption,
        title: {
            text: titleText,
            subtext: subText,
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 1,
            top: 50,
            data: locationNames,
            selected: locationNames.reduce((prev, curr, idx) => {
                prev[curr] = idx < _legendSelectedThreshold
                return prev 
            }, {})
        },
        series: [
            {
                name: 'Number of times visited:',
                type: 'pie',
                selectedMode: 'single',
                radius: [0, '30%'],
                right: 200,
                label: {show: false},
                data: sortedNumberOfVisitsPerLocation
            },
            {
                name: 'Number of pints:',
                type: 'pie',
                right: 200,
                radius: ['45%', '60%'],
                label: {show: false},
                data: sortedNumberOfPintsPerLocation
            }
        ]
    };
    chart.setOption(option)
}

// ============================================================================
// Render tables
// ============================================================================

function renderLocationsGrid(locationInfo) {
    const gridElement = document.querySelector("#locationInfoGrid")
    if (!gridElement) {
        return
    }
    const rowData = Object.entries(locationInfo).map(([k, v]) => ({
        name: k, 
        pintCount: v.number_of_pints,
        visitCount: v.number_of_visits,
        pintRank: v.number_of_pints_rank
    })).sort((a, b) => b.numberOfPints - a.numberOfPints);
    const columnDefs = [
        {field: "pintRank"},
        {field: "name"},
        {field: "pintCount"},
        {field: "visitCount"},
    ];
    const gridOptions = {
        rowData: rowData,
        columnDefs: columnDefs,
    };
    agGrid.createGrid(gridElement, gridOptions);
}


function renderFriendsLeaderboardGrid(friendsInfo) {
    const myTheme = agGrid.themeQuartz
        .withPart(agGrid.iconSetAlpine)
        .withParams({
            accentColor: "#0086F4",
            backgroundColor: "#F1EDE1",
            borderColor: "#98968F",
            borderRadius: 0,
            browserColorScheme: "light",
            chromeBackgroundColor: {
                ref: "backgroundColor"
            },
            fontFamily: {
                googleFont: "IBM Plex Mono"
            },
            fontSize: 20,
            foregroundColor: "#605E57",
            headerBackgroundColor: "#E4DAD1",
            headerFontSize: 15,
            headerFontWeight: 700,
            headerTextColor: "#3C3A35",
            rowVerticalPaddingScale: 1.2,
            spacing: 5,
            wrapperBorderRadius: 0
        });

    const gridElement = document.querySelector("#leaderboardGrid")
    if (!gridElement) {
        return
    }
    const leaderboardData = Object.entries(friendsInfo).map(([k, v]) => ({
        name: k,
        pintCount: v.pint_count,
        pintRank: v.pint_count_rank,
    })).sort((a, b) => b.pintCount - a.pintCount);
    console.log(leaderboardData)
    const columnDefs = [
        {field: "pintRank"},
        {field: "name"},
        {field: "pintCount"},
    ];
    const gridOptions = {
        rowData: leaderboardData,
        columnDefs: columnDefs,
        theme: myTheme,
        autoSizeStrategy: {
            type: 'fitGridWidth',
            defaultMinWidth: 100,
        }
    };
    agGrid.createGrid(gridElement, gridOptions)
}


// ============================================================================
// Entrypoint
// ============================================================================


async function main() {
    result = await fetch("./data/pints_info.json")
    data = await result.json()
    locationInfo = data.location_info
    monthInfo = data.date_info.pints_per_month_of_the_year
    friendsInfo = data.friends_info

    // Charts
    renderPintsPerMonthChart(monthInfo)
    renderVisitsPerLocationChart(locationInfo)
    renderPintsPerLocationChart(locationInfo)
    renderLocationsPieChart(locationInfo)

    // Grid
    renderLocationsGrid(locationInfo)
    renderFriendsLeaderboardGrid(friendsInfo)

}

document.addEventListener('DOMContentLoaded', main)
document.getElementById('showPie').addEventListener('click', function() {
  document.getElementById('locationInfoNetedPieChart').style.display = 'block';
  document.getElementById('locationInfoGrid').style.display = 'none';
});

document.getElementById('showGrid').addEventListener('click', function() {
  document.getElementById('locationInfoNetedPieChart').style.display = 'none';
  document.getElementById('locationInfoGrid').style.display = 'block';
});