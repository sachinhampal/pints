
// ============================================================================
// Constants
// ============================================================================

const _year = "2025"
const _legendSelectedThreshold = 7
const _chartBaseOption = {
    tooltip: {
        trigger: 'item',
    },
    title: {
        top: 5,
        left: "left",
        textStyle: {
            fontSize: 30,
        },
        subtextStyle: {
            fontSize: 14,
        }
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
    textStyle: {fontFamily: "IBM Plex Mono"},
    legend: {
        type: 'scroll',
        orient: 'vertical',
        left: "left",
        top: 100,
    },
    series: [
        {
            type: 'pie',
            radius: '70%',
            center: ['60%', '55%'],
            label: {
                show: true,
                formatter: "{b} | {c}",
            },
            emphasis: {
                itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
}

const _agGridTheme = agGrid.themeQuartz
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
            fontSize: 16,
            foregroundColor: "#605E57",
            headerBackgroundColor: "#E4DAD1",
            headerFontSize: 16,
            headerFontWeight: 700,
            headerTextColor: "#3C3A35",
            rowVerticalPaddingScale: 1.2,
            spacing: 5,
            wrapperBorderRadius: 0
        });


// _chartsTheme = echarts.registerTheme("")


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
        ..._chartBaseOption,
        title: {
            ..._chartBaseOption.title,
            text: titleText,
        },
        legend: {
            ..._chartBaseOption.legend,
            data: legendValues,
            selected: _getSelectedThresholdValues(legendValues, selectedThreshold)
        },
        series: _chartBaseOption.series.map(x => ({...x, data: seriesData}))
    };
    chart.setOption(option)
}

function _getSelectedThresholdValues(values, threshold) {
    return values.reduce((prev, curr, idx) => {
                prev[curr] = idx < threshold
                return prev 
            }, {})
}

// ============================================================================
// Render pie charts
// ============================================================================

function renderVisitsPerLocationChart(locationInfo) {
    const seriesData = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_visits})).sort((a, b) => b.value - a.value);
    const locationNames = seriesData.map(loc => loc.name)
    _renderPieChart(
        "visitsPerLocationChart",
        "Number of times visited each pub:",
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
        "Number of pints at each pub:",
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
        "Number of pints per month:",
        monthNames,
        seriesData,
        12,
    )
}

function renderLocationsNestedPieChart(locationInfo) {
    const sortedNumberOfPintsPerLocation = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_pints})).sort((a, b) => b.value - a.value);
    const sortedNumberOfVisitsPerLocation = Object.entries(locationInfo).map(([k, v]) => ({name: k, value: v.number_of_visits})).sort((a, b) => b.value - a.value);
    const locationNames = sortedNumberOfPintsPerLocation.map(loc => loc.name)

    elementId = "locationInfoNestedPieChart"
    titleText = "Location Stats"
    subText = "Outer ring: Number of pints at each pub\nInner ring: Number of times visited each pub"
    element = document.getElementById(elementId)
    if (!element) {
        return
    }
    var chart = echarts.init(element);
    var option = {
        ..._chartBaseOption,
        title: {
            ..._chartBaseOption.title,
            text: titleText,
            subtext: subText,
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            left: "left",
            top: 100,
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
                top: 50,
                center: ['60%', '55%'],
                selectedMode: 'single',
                radius: [0, '40%'],
                label: {show: false},
                data: sortedNumberOfVisitsPerLocation
            },
            {
                name: 'Number of pints:',
                center: ['60%', '55%'],
                top: 50,
                type: 'pie',
                radius: ['55%', '70%'],
                label: {
                    show: true,
                    formatter: "{b} | {c}",
                },
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
        theme: _agGridTheme,
        autoSizeStrategy: {
            type: 'fitCellContents',
        },
    };
    agGrid.createGrid(gridElement, gridOptions);
}


function renderFriendsLeaderboardGrid(friendsInfo) {
    const gridElement = document.querySelector("#leaderboardGrid")
    if (!gridElement) {
        return
    }
    const leaderboardData = Object.entries(friendsInfo).map(([k, v]) => ({
        name: k,
        pintCount: v.pint_count,
        pintRank: v.pint_count_rank,
        favouritePub: Object.entries(v.pub_2_frequency).reduce((maxEntry, currentEntry) => currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry)[0],
    })).sort((a, b) => b.pintCount - a.pintCount);

    const columnDefs = [
        {field: "pintRank"},
        {field: "name"},
        {field: "pintCount"},
        {field: "favouritePub"},
    ];
    const gridOptions = {
        rowData: leaderboardData,
        columnDefs: columnDefs,
        theme: _agGridTheme,
        autoSizeStrategy: {
            type: 'fitGridWidth',
        },
    };
    agGrid.createGrid(gridElement, gridOptions)
}


// ============================================================================
// Render "time series" data
// ============================================================================

function renderPintsPerDayCalendar(pintsPerDayInfo) {
    var elementId = document.getElementById('pintsPerDayCalendar');

    if (!elementId) {
        return
    }

    var chart = echarts.init(elementId);
    const calendarData = []
    var maxNumber = 0;
    Object.entries(pintsPerDayInfo).forEach(([date, entry]) => {
        calendarData.push([date, entry.Number])
        if (entry.Number > maxNumber) {
            maxNumber = entry.Number
        }
    })

    var option = {
        ..._chartBaseOption,
        title: {
            ..._chartBaseOption.title,
            text: "Pints Calendar:",
        },
        tooltip: {
            position: 'top'
        },
        visualMap: {
            show: false,
            type: 'piecewise',
            splitNumber: 3, // Arbitrary number for now...
            min: 0,
            max: maxNumber,
            calculable: true,
            orient: 'horizontal',
            top: 'top',
            right: 'center',
        },
        calendar: [
            {
                range: _year,
                cellSize: ['auto', 20],
                orient: "horizontal",
                yearLabel: {show: false},
                monthLabel: {color: "black"},
                dayLabel: {color: "black"},
                top: "middle",
            },
        ],
        series: [
            {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                calendarIndex: 0,
                data: calendarData,
            },
        ]
    };
    chart.setOption(option)
}


function renderCumulativePintsLineChart(friendsInfo, pintsPerEntryInfo) {
    var elementId = document.getElementById('cumulativePintsLineChart');
    if (!elementId) {
        return
    }

    var chart = echarts.init(elementId);

    const friends = Object.keys(friendsInfo);
    const entries = [0].concat(Object.keys(pintsPerEntryInfo).map(x => Number(x) + 1));
    const name2entries = {}
    friends.forEach(friend => {name2entries[friend] = [0]});

    Object.entries(pintsPerEntryInfo).forEach(([k, v]) => {
        company2cumulativePints = v.company_2_cumulative_pints
        Object.entries(company2cumulativePints).forEach(([k, v]) => {
            name2entries[k].push(v)
        })
    })

    seriesData = Object.entries(name2entries).map(([k, v]) => ({
        name: k,
        data: v,
        type: "line",
        showSymbol: false,
        labelLayout: {
            moveOverlap: 'shiftY'
        },
        emphasis: {
            focus: 'series'
        },
        // symbol: "none"
    }))

    titleText = "Pints with friends over time:"
    var option = {
        ..._chartBaseOption,
        title: {
            ..._chartBaseOption.title,
            text: titleText,
        },
        legend: {
            ..._chartBaseOption.legend,
            data: friends,
            selected: _getSelectedThresholdValues(friends, _legendSelectedThreshold)
        },
        grid: {
            left: "10%",
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: entries
        },
        yAxis: {type: "value"},
        series: seriesData

    }

    chart.setOption(option)


    var option = {
        ..._chartBaseOption,

    }

}


// ============================================================================
// Entrypoint
// ============================================================================


async function main() {
    // Load data
    result = await fetch("./data/pints_info.json")
    data = await result.json()
    locationInfo = data.location_info
    monthInfo = data.date_info.pints_per_month_of_the_year
    friendsInfo = data.friends_info
    pintsPerDayInfo = data.date_info.time_series_date_info
    pintsPerEntry = data.date_info.time_series_entry_info

    // Charts
    renderPintsPerMonthChart(monthInfo)
    renderVisitsPerLocationChart(locationInfo)
    renderPintsPerLocationChart(locationInfo)
    renderLocationsNestedPieChart(locationInfo)

    // Grid
    renderLocationsGrid(locationInfo)
    renderFriendsLeaderboardGrid(friendsInfo)

    // Calendar
    renderPintsPerDayCalendar(pintsPerDayInfo)

    // Line charts
    renderCumulativePintsLineChart(friendsInfo, pintsPerEntry)
}

document.addEventListener('DOMContentLoaded', main)
// document.getElementById('showPie').addEventListener('click', function() {
//   document.getElementById('locationInfoNetedPieChart').style.display = 'block';
//   document.getElementById('locationInfoGrid').style.display = 'none';
// });

// document.getElementById('showGrid').addEventListener('click', function() {
//   document.getElementById('locationInfoNetedPieChart').style.display = 'none';
//   document.getElementById('locationInfoGrid').style.display = 'block';
// });
