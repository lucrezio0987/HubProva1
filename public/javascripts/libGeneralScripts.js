const types_1 = ['Line', 'Area', 'Scatter', 'Spline'];
const types_2 = ['Pie', 'Polar', 'Bar', 'Heatmap'];
const types_3 = ['Bar', 'Pie', 'Heatmap', 'Map'];
const types_4 = ['Data'];
const types_5 = ['Pie'];
const types_player_game = ['Total', 'Cards', 'Score', 'Minute'];
const europeanCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
/**
 * Build the chart block with navigation pills for different chart types.
 * @param {string} id - The element ID where the chart will be rendered.
 * @param {string} title - The title of the chart.
 * @param {Array} data - The data to be used in the chart.
 * @param {Array} types - The types of charts to render.
 * @param {string} def - The default chart type to render.
 */
function buildChartBlock(id, title, data, types, def = types[0]) {
    let navPills = '';
    let tabContent = '';

    types.forEach(type => {
        navPills += `<button class="nav-link ${type === def ? 'active' : ''}" id="v-pills-${id}-hc-${type}-tab" data-bs-toggle="pill" data-bs-target="#v-pills-${id}-hc-${type}" type="button" role="tab" aria-controls="v-pills-${id}-hc-${type}" aria-selected="false" title="${type} Chart"><i class="fas fa-${chartIconType(type)}"></i></button>`;
        tabContent += `
            <div class="tab-pane fade ${type === def ? 'show active' : ''}" id="v-pills-${id}-hc-${type}" role="tabpanel" aria-labelledby="v-pills-${id}-hc-${type}-tab">
                <div id="${id}-hc-${type}" class="chart"></div>
            </div>`;
    });

    document.getElementById(id).innerHTML = `
        <div class="row">
            <div class="col-1 alt-buttons">
                <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                    ${navPills}
                </div>
            </div>
            <div class="col-11">
                <div class="tab-content" id="v-pills-tabContent">
                    ${tabContent}
                </div>
            </div>
        </div>`;

    types.forEach(type => {
        try {
            switch (type) {
                case 'Map':
                    Highcharts.mapChart(`${id}-hc-${type}`, getChartOptions(title, type, data));
                    break;
                case 'Data':
                    Highcharts.chart(`${id}-hc-${type}`, getChartOptions(title, type, data, 'date', 'market value in Eur (€)'));
                    break;
                default:
                    Highcharts.chart(`${id}-hc-${type}`, getChartOptions(title, type, data));
            }
        } catch (error) {
            console.error(`Error generating chart ${type}: `, error);
            document.getElementById(`${id}-hc-${type}`).innerHTML = `<div class="alert alert-danger" role="alert">Error loading chart: ${error.message}</div>`;
        }
    });
}

/**
 * Loads the market valuation chart for the player.
 * @param {string} id - The ID of the player.
 * @returns {Promise} - A promise that resolves when the chart data is loaded.
 */
function loadChartValuation(id) {
    return axios.get(`/player/chart/valuation/${id}`)
        .then(response => {
            buildChartBlock('chart_Market_Value', 'Valutazione', response.data, types_4);
        });
}

/**
 * Get the appropriate icon for a given chart type.
 * @param {string} chartType - The type of the chart.
 * @returns {string} - The corresponding icon name.
 */
function chartIconType(chartType) {
    switch (chartType) {
        case 'Bar': return 'chart-bar';
        case 'Line': return 'chart-line';
        case 'Pie': return 'chart-pie';
        case 'Area': return 'fill-drip';
        case 'Scatter': return 'braille';
        case 'Heatmap': return 'th-large';
        case 'Radar': return 'broadcast-tower';
        case 'Spline': return 'wave-square';
        case 'Polar': return 'compass';
        case 'Map': return 'globe';
        case 'Data': return 'money-bill-trend-up';
        case 'Total': return 'chart-column';
        case 'Cards': return 'diamond';
        case 'Score': return 'futbol';
        case 'Minute': return 'clock';
        default: return 'chart-line';
    }
}

/**
 * Process the data based on the type.
 * @param {Array} data - The data to process.
 * @param {string} type - The type of data processing to apply.
 * @returns {Array} - The processed data.
 */
function processData(data, type = null) {
    switch (type) {
        case 'Total':
        case 'Cards':
        case 'Score':
        case 'Minute':
            return data.map(item => ({
                date: `${new Date(item.date).getFullYear()}-${new Date(item.date).getMonth()}-${new Date(item.date).getDate()}`,
                yellowCards: item.yellowCards,
                redCards: item.redCards,
                goals: item.goals,
                assists: item.assists,
                minutesPlayed: item.minutesPlayed
            }));
        default:
            if (Array.isArray(data) && data.every(item => typeof item === 'object' && 'date' in item && 'value' in item))
                return data.map(item => ({
                    key: `${new Date(item.date).getFullYear()}-${new Date(item.date).getMonth()}-${new Date(item.date).getDate()}`,
                    value: item.value
                }));
            else if (Array.isArray(data))
                return data.map((value, index) => ({ key: index, value }));

            else if (typeof data === 'object')
                return Object.entries(data).map(([key, value]) => ({ key, value }));
            else
                return [];
    }
}

/**
 * Get the chart options based on the type of chart.
 * @param {string} title - The title of the chart.
 * @param {string} type - The type of chart.
 * @param {Array} data - The data to be used in the chart.
 * @param {string} yTitle - The title for the Y axis.
 * @param {string} xTitle - The title for the X axis.
 * @returns {Object} - The chart options.
 */
function getChartOptions(title, type, data, yTitle = `Y for ${title}`, xTitle = `X for ${title}`) {
    let processedData = processData(data, type);
    console.log(processedData);
    let option = { title: { text: title } };

    switch (type) {
        case 'Line':
        case 'Area':
        case 'Scatter':
        case 'Polar':
        case 'Spline':
        case 'Pie':
        case 'Data':
            option = {
                ...option,
                colors: ['#000F18', '#AAD0FD', '#A9C1C8', '#D5E7FF', '#F2F2F2'],
            };
            break;
        case 'Bar':
        case 'Map':
        case 'Heatmap':
            option = {
                ...option,
                colorAxis: {
                    min: 0,
                    minColor: '#AAD0FD',
                    maxColor: '#000F18'
                },
                colors: ['#000F18'],
            };
            break;
        case 'Total':
        case 'Cards':
        case 'Score':
        case 'Minute':
            option = {
                ...option,
                colorAxis: {
                    min: 0,
                    minColor: '#AAD0FD',
                    maxColor: '#000F18'
                },
                colors: ['#000F18'],
            };
            break;
    }

    switch (type) {
        case 'Bar':
        case 'Line':
        case 'Area':
        case 'Scatter':
        case 'Spline':
            return {
                ...option,
                chart: { type: type.toLowerCase() },
                xAxis: { title: { text: yTitle }, categories: processedData.map(item => item.key) },
                yAxis: { title: { text: xTitle } },
                series: [{ name: `Data of: ${xTitle}`, data: processedData.map(item => item.value) }]
            };
        case 'Data':
            return {
                ...option,
                chart: { type: 'line' },
                xAxis: { title: { text: yTitle }, type: 'datetime', categories: processedData.map(item => item.key) },
                yAxis: { title: { text: xTitle } },
                series: [{ name: `${title}`, data: processedData.map(item => item.value) }]
            };
        case 'Pie':
            return {
                ...option,
                chart: { type: 'pie' },
                series: [{ name: `Data of: ${xTitle}`, data: processedData.map(item => ({ name: item.key, y: item.value })) }]
            };
        case 'Heatmap':
            return {
                ...option,
                chart: { type: 'heatmap' },
                xAxis: { title: { text: yTitle }, categories: processedData.map(item => item.key) },
                yAxis: { title: { text: xTitle } },
                series: [{ name: `Data of: ${xTitle}`, data: processedData.map((item, index) => [index, 0, item.value]), borderWidth: 1 }]
            };
        case 'Polar':
            return {
                ...option,
                chart: { polar: true, type: 'line' },
                pane: { startAngle: 0, endAngle: 360 },
                xAxis: { categories: processedData.map(item => item.key), tickmarkPlacement: 'on', lineWidth: 0 },
                yAxis: { gridLineInterpolation: 'polygon', lineWidth: 0, min: 0 },
                tooltip: { shared: true, pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>' },
                series: [{ type: 'area', name: `Data of: ${xTitle}`, data: processedData.map(item => item.value), pointPlacement: 'on' }],
            };
        case 'Map':
            return {
                ...option,
                chart: { map: processedData.every(item => europeanCountries.includes(item.key)) ? 'custom/europe' : 'custom/world' },
                mapNavigation: {
                    enabled: true,
                    buttonOptions: { verticalAlign: 'bottom' }
                },
                series: [{
                    data: processedData,
                    joinBy: ['iso-a2', 'key'],
                    name: `Data of: ${xTitle}`,
                    states: { hover: { color: '#BADA55' } },
                    dataLabels: { enabled: true, format: '{point.value:.0f}' }
                }]
            };
        case 'Total':
            return {
                chart: { type: 'column', scrollablePlotArea: { minWidth: 3000, scrollPositionX: 0 } },
                title: { text: `${title}` },
                xAxis: { categories: processedData.map(item => item.date), crosshair: { color: '#AAD0FD' } },
                yAxis: {
                    title: { text: null },
                    labels: { enabled: false }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: { enabled: true },
                        events: { legendItemClick: function () { return false; } },
                    }
                },
                series: [
                    { name: 'Yellow Cards', data: processedData.map(item => item.yellowCards), stack: 'cards', color: '#F6CA38' },
                    { name: 'Red Cards', data: processedData.map(item => item.redCards), stack: 'cards', color: '#D72828' },
                    { name: 'Goals', data: processedData.map(item => item.goals), stack: 'performance', color: '#32CD32' },
                    { name: 'Assists', data: processedData.map(item => item.assists), stack: 'performance', color: '#83D483' },
                    { type: 'spline', name: 'Minutes Played', data: processedData.map(item => item.minutesPlayed / 20), color: '#000F18' }
                ],
                tooltip: {
                    shared: true,
                    formatter: function () {
                        return this.points.reduce((s, point) => {
                            const value = point.series.name === 'Minutes Played' ? point.y * 20 : point.y;
                            return s + '<br/>' + point.series.name + ': ' + value;
                        }, '<b>Date: ' + this.x + '</b>');
                    }
                }
            };
        case 'Cards':
            return {
                chart: { type: 'column', scrollablePlotArea: { minWidth: 1000, scrollPositionX: 0 } },
                title: { text: 'Card Summary' },
                xAxis: { categories: processedData.map(item => item.date), crosshair: { color: '#AAD0FD' } },
                yAxis: { title: { text: 'Number of Cards' } },
                plotOptions: { column: { stacking: 'normal' } },
                series: [
                    { name: 'Yellow Cards', data: processedData.map(item => item.yellowCards), stack: 'cards', color: '#F6CA38' },
                    { name: 'Red Cards', data: processedData.map(item => item.redCards), stack: 'cards', color: '#D72828' }
                ],
                tooltip: {
                    shared: true,
                    formatter: function () { return this.points.reduce((s, point) => { return s + '<br/>' + point.series.name + ': ' + point.y; }, '<b>Date: ' + this.x + '</b>'); }
                }
            };
        case 'Score':
            return {
                chart: { type: 'column', scrollablePlotArea: { minWidth: 1000, scrollPositionX: 0 } },
                title: { text: 'Performance Summary' },
                xAxis: { categories: processedData.map(item => item.date), crosshair: { color: '#AAD0FD' } },
                yAxis: { title: { text: 'Performance Metrics' } },
                plotOptions: { column: { stacking: 'normal' } },
                series: [
                    { name: 'Goals', data: processedData.map(item => item.goals), stack: 'performance', color: '#32CD32' },
                    { name: 'Assists', data: processedData.map(item => item.assists), stack: 'performance', color: '#83D483' }
                ],
                tooltip: {
                    shared: true,
                    formatter: function () { return this.points.reduce((s, point) => { return s + '<br/>' + point.series.name + ': ' + point.y; }, '<b>Date: ' + this.x + '</b>'); }
                }
            };
        case 'Minute':
            return {
                chart: { type: 'spline', scrollablePlotArea: { minWidth: 1000, scrollPositionX: 0 } },
                title: { text: 'Minutes Played' },
                xAxis: { categories: processedData.map(item => item.date), crosshair: { color: '#AAD0FD' } },
                yAxis: { title: { text: 'Minutes Played' } },
                series: [{ name: 'Minutes Played', data: processedData.map(item => item.minutesPlayed), color: '#000F18' }]
            };

        default:
            return option;
    }
}

/**
 * Show a spinner while a promise is being executed.
 * @param {string} elementId - The ID of the element where the spinner will be shown.
 * @param {Function} promise - The function that returns a promise.
 */
function conSpinner(elementId, promise) {
    let element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found.`);
        return;
    }

    if (window.getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }

    let overlay = document.createElement('div');
    overlay.classList.add('overlay-spinner');

    let spinner = document.createElement('div');
    spinner.classList.add('spinner-border', 'text-primary');
    spinner.style.width = '4rem';
    spinner.style.height = '4rem';
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';

    overlay.appendChild(spinner);
    element.appendChild(overlay);
    let oldMinHeight = element.style.minHeight;
    element.style.minHeight = '6rem';

    const executePromise = () => {
        promise()
            .then(() => {
                element.style.minHeight = oldMinHeight;
                if (element.contains(overlay))
                    element.removeChild(overlay);
                console.log(`Completed conSpinner on: ${elementId}`);
            })
            .catch(error => {
                let errorMessage;

                if (error.response)
                    errorMessage = `Failed conSpinner on ${elementId}: Error ${error.response.status}: ${error.response.statusText}`;
                else if (error.request)
                    errorMessage = `Failed conSpinner on ${elementId}: No response received from the server.`;
                else
                    errorMessage = `Failed conSpinner on ${elementId}: ${error}`;

                console.error(errorMessage);

                let iconError = document.createElement('i');
                iconError.classList.add('bi', 'bi-exclamation-triangle-fill', 'text-danger');
                iconError.style.fontSize = '1.5rem';
                iconError.style.marginRight = '5px';

                let textError = document.createElement('span');
                textError.classList.add('text-danger');
                textError.textContent = errorMessage;

                let retryButton = document.createElement('button');
                retryButton.classList.add('btn', 'btn-primary');
                retryButton.textContent = 'Retry';
                retryButton.style.marginLeft = '10px';
                retryButton.onclick = () => {
                    console.log(`Retrying on ${elementId}...`);
                    executePromise();
                };

                overlay.innerHTML = '';
                overlay.appendChild(iconError);
                overlay.appendChild(textError);
                overlay.appendChild(retryButton);
            });
    };

    executePromise();
}

/**
 * Initializes the available seasons for a competition.
 * @param {string} id - The competition ID.
 * @param {string} page - The page to navigate to.
 * @returns {Promise} - A promise that resolves when the seasons are initialized.
 */
function initSeasons(id, page) {
    return axios.get(`/competition/seasons/${id}`)
        .then(response => {
            let block = "";
            if (response.data && response.data.length > 0)
                response.data.forEach(season => {
                    block += `<li><a class="dropdown-item" href="/${page}/${id}/${season}">${String(season)}/${(parseInt(String(season).substring(2, 4)) + 1).toString()}</a></li>`;
                });
            else
                block = "<li>No seasons available</li>";

            document.querySelectorAll(".drop-season").forEach(dropdown => dropdown.innerHTML = block);
        })
        .catch(error => {
            console.error("Error fetching seasons:", error);
            document.querySelectorAll(".drop-season").forEach(dropdown => dropdown.innerHTML = "<li>Error loading seasons</li>");
        });
}

/**
 * Initializes the list of competitions.
 * @param {string} page - The page to navigate to.
 * @returns {Promise} - A promise that resolves when the competitions list is initialized.
 */
function initCompetitionsList(page) {
    return axios.get(`/competition/list`)
        .then(response => {
            let competitions = response.data;
            let domesticLeague = "";
            let internationalLeague = "";
            let other = "";
            let countDl = 0;
            let countEu = 0;

            competitions.forEach(competition => {
                let comp = "";
                let country = competition.countryName;
                if (country === "-") country = "EUR";
                let abbreviations = country.substring(0, 3).toUpperCase();
                comp += `<a href="/${page}/${competition.competition_id}" data-bs-toggle="tooltip" title="${competition.name}" >
                                <div class="row">
                                    <div class="col-2">
                                        <img src="${competition.imgUrl}" alt="${competition.imgUrl}">
                                    </div>
                                    <div class="col-7">${competition.name}</div>
                                    <div class="col-2">
                                        <img src="${competition.flagUrl}" alt="${abbreviations}">
                                    </div>
                                </div>
                            </a>`;

                switch (competition.type) {
                    case 'domestic_league':
                        if (countDl++ === 4) comp = `<hr>` + comp;
                        domesticLeague += comp;
                        break;
                    case 'international_cup':
                        if (countEu++ === 2) comp = `<hr>` + comp;
                        internationalLeague += comp;
                        break;
                    default:
                        if (country === "EUR") {
                            if (countEu++ === 2) comp = `<hr>` + comp;
                            internationalLeague += comp;
                        } else
                            other += comp;
                }
            });

            document.getElementById("domestic_league").innerHTML = domesticLeague;
            document.getElementById("international_league").innerHTML = internationalLeague;
            document.getElementById("other").innerHTML = other;
        });
}

/**
 * Initializes competition data.
 * @param {string} id - The competition ID.
 * @returns {Promise} - A promise that resolves when the competition data is initialized.
 */
function initCompetitionData(id) {
    return axios.get(`/competition/info/${id}`)
        .then(response => {
            let competition = response.data;
            competition_type = competition.type;
            document.getElementById("name_league").innerHTML = competition.name;
            document.querySelectorAll(".img-comp").forEach(el => el.innerHTML += `<img src="${competition.imgUrl}" alt="${competition.name}" data-bs-toggle="tooltip" title="${competition.name}" onClick="event.stopPropagation(); window.location='/statistics/${id}'">`);
            document.querySelectorAll(".img-flag").forEach(el => el.innerHTML += `<img src="${competition.flagUrl}">`);
        });
}

/**
 * Toggles the visibility of the collapse row associated with a specific match and updates the icon accordingly.
 * This function is designed to show or hide additional match details and adjust the UI to reflect the current state.
 * @param {number} n - The sequential number of the item in the list.
 * @param {string} tableId - The ID of the table, used to identify specific elements.
 */
function toggleRow(n, tableId) {
    let currentRow = document.getElementById(`row-${tableId}-${n}`);
    let icon = document.getElementById(`icon-${tableId}-${n}`);
    let collapseElement = document.getElementById(`collapse-${tableId}-${n}`);
    let isSelected = currentRow.classList.contains('selected');
    let allRows = document.querySelectorAll(`#${tableId} .table-row`);

    allRows.forEach(row => {
        let otherCollapseElement = document.getElementById(row.dataset.bsTarget.substring(1));
        if (row !== currentRow) {
            row.classList.remove('selected');
            otherCollapseElement.classList.remove('show');
            row.querySelector('i').classList.add("fa-caret-right");
            row.querySelector('i').classList.remove("fa-caret-down");
        }
    });

    if (!isSelected) {
        currentRow.classList.add('selected');
        icon.classList.remove("fa-caret-right");
        icon.classList.add("fa-caret-down");
        collapseElement.classList.add("show");
    } else {
        currentRow.classList.remove('selected');
        icon.classList.add("fa-caret-right");
        icon.classList.remove("fa-caret-down");
        collapseElement.classList.remove("show");
    }
}
