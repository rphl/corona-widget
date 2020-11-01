// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
// BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
// UPDATED VERSION BY AUTHOR: rphl https://github.com/rphl/corona-widget/

// ============= KONFIGURATION =============

const CONFIG_OPEN_URL = false

// ============= ============= =============

const outputFields = 'GEN,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,RS';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
const apiUrlNewCases = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true'
const apiRUrl = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`

/**
 * Fix Coordinates/MediumWidget
 * Set Widgetparameter for each column, seperated by ";" Format: POSITION,LAT,LONG(,NAME);POSITION,LAT,LONG(,NAME)
 *
 * Examples:
 *
 * First fix column (No second column): 0,51.1244,6.7353
 * Second fix column (Second column is visble, MediumWidget): 1,51.1244,6.7353
 * Both Fix columns (both are visble, MediumWidget): 0,51.1244,6.7353;1,51.1244,6.7353
 * Only Second Fix (both are visble, MediumWidget): 1,51.1244,6.7353
 * Custom Name: 0,51.1244,6.7353,Home
 * Custom Name Second column: 1,51.1244,6.7353,Work
 */

const LIMIT_DARKRED = 100
const LIMIT_RED = 50
const LIMIT_ORANGE = 35
const LIMIT_YELLOW = 25
const LIMIT_DARKRED_COLOR = new Color('a1232b')
const LIMIT_RED_COLOR = new Color('f6000f')
const LIMIT_ORANGE_COLOR = new Color('ff7927')
const LIMIT_YELLOW_COLOR = new Color('F5D800')
const LIMIT_GREEN_COLOR = new Color('1CC747')
const LIMIT_GRAY_COLOR = new Color('d0d0d0')
const BUNDESLAENDER_SHORT = {
    'Baden-Württemberg': 'BW',
    'Bayern': 'BY',
    'Berlin': 'BE',
    'Brandenburg': 'BB',
    'Bremen': 'HB',
    'Hamburg': 'HH',
    'Hessen': 'HE',
    'Mecklenburg-Vorpommern': 'MV',
    'Niedersachsen': 'NI',
    'Nordrhein-Westfalen': 'NRW',
    'Rheinland-Pfalz': 'RP',
    'Saarland': 'SL',
    'Sachsen': 'SN',
    'Sachsen-Anhalt': 'ST',
    'Schleswig-Holstein': 'SH',
    'Thüringen': 'TH'
};

let MEDIUMWIDGET = (config.widgetFamily === 'medium') ? true : false
let staticCoordinates = []
if (args.widgetParameter) {
    staticCoordinates = parseInput(args.widgetParameter)
    if (typeof staticCoordinates[1] !== 'undefined' && Object.keys(staticCoordinates[1]).length >= 3) {
        MEDIUMWIDGET = true
    }
}

let data = {}
let weekData = {}
const widget = await createWidget()
widget.setPadding(0,0,0,0)
if (!config.runsInWidget) {
    if (MEDIUMWIDGET) {
        await widget.presentMedium()
    } else {
        await widget.presentSmall()
    }
}
Script.setWidget(widget)
Script.complete()

async function createWidget() {
    const list = new ListWidget()
    const headerRow = addHeaderRowTo(list)
    const data = await getData(0)
    if (data) {
        headerRow.addSpacer(3)
        let todayData = getDataForDate(data)
        addLabelTo(headerRow, 'R ' + formatNumber(todayData.r), Font.mediumSystemFont(14))
        headerRow.addSpacer()
    
        let chartdata = getChartData(data, 'averageIncidence');
        // chartdata = [4,13,25,31,45,55,60] // DEMO!!!
        addChartBlockTo(headerRow, getGetLastCasesAndTrend(data, 'cases'), chartdata, false)
        
        list.addSpacer(3)

        const incidenceRow = list.addStack()
        incidenceRow.layoutHorizontally()
        incidenceRow.centerAlignContent()
    
        let padding = (MEDIUMWIDGET) ? 5 : 10
        addIncidenceBlockTo(incidenceRow, data, [2,10,10,padding], 0)
        if (MEDIUMWIDGET) {
            const data1 = await getData(1)
            addIncidenceBlockTo(incidenceRow, data1, [2,padding,10,10], 1)
        }
        if (CONFIG_OPEN_URL) list.url = "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4"
        list.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000)
    } else {
        headerRow.addSpacer()
        list.addSpacer()
        let errorBox = list.addStack()
        errorBox.setPadding(10, 10, 10, 10)
        addLabelTo(errorBox, "⚡️ Daten konnten nicht geladen werden. Widget öffnen für reload", Font.mediumSystemFont(10), Color.gray())
    }
    return list
}

function getGetLastCasesAndTrend(data, field, calcDiff = false, fromBL = false) {
    // TODAY
    let casesTrendStr = '';
    let todayData = getDataForDate(data)
    let todayCases = todayData[field];
    if (fromBL) todayCases = getBLCases(todayData.incidencePerState, todayData.nameBL)
    let yesterdayCases = false
    let beforeYesterdayCases = false

    // YESTERDAY
    let yesterdayData = getDataForDate(data, 1)
    if (yesterdayData) {
        yesterdayCases = yesterdayData[field];
        if (fromBL) yesterdayCases = getBLCases(yesterdayData.incidencePerState, yesterdayData.nameBL)
    }
    // BEFOREYESTERDAY
            
    let beforeYesterdayData = getDataForDate(data, 2)
    if (beforeYesterdayData) {
        beforeYesterdayCases = beforeYesterdayData[field];
        if (fromBL) beforeYesterdayCases = getBLCases(beforeYesterdayData.incidencePerState, beforeYesterdayData.nameBL)
    }

    if (calcDiff) {
        casesTrendStr = (yesterdayCases !== false) ? formatNumber(todayCases - yesterdayCases) : 'n/v'
    } else {
        casesTrendStr = formatNumber(todayCases);
    }
    
    if (todayCases && yesterdayCases !== false && beforeYesterdayCases !== false) {
        casesTrendStr += getTrendArrow(todayCases - yesterdayCases, yesterdayCases - beforeYesterdayCases)
    }
    return casesTrendStr
}

function getBLCases(states, BL) {
    if (typeof states !== 'undefined') {
        let state = states.filter(item => {
            return (item.BL === BL)
        }).pop()
        return state.cases    
    }
    return 0
}

function getChartData (data, field) {
    const chartdata = new Array(7).fill(0);
    const offset = 7 - Object.keys(data).length
    Object.keys(data).forEach((key, index) => {
        chartdata[offset + index] = data[key][field]
    })
    return chartdata
}

function addIncidenceBlockTo(view, data, padding, useStaticCoordsIndex) {
    const incidenceBlockBox = view.addStack()
    incidenceBlockBox.setPadding(padding[0], 0, padding[2], 0)
    incidenceBlockBox.layoutHorizontally()
    
    incidenceBlockBox.addSpacer(padding[1])
    
    const incidenceBlockRows = incidenceBlockBox.addStack()

    incidenceBlockRows.backgroundColor = new Color('cccccc', 0.1)
    incidenceBlockRows.setPadding(0,0,0,0)
    incidenceBlockRows.cornerRadius = 14
    incidenceBlockRows.layoutVertically()

    addIncidence(incidenceBlockRows, data, useStaticCoordsIndex)
    addTrendsBarToIncidenceBlock(incidenceBlockRows, data)
    incidenceBlockRows.addSpacer(2)

    incidenceBlockBox.addSpacer(padding[3])
    
    return incidenceBlockBox;
}

function addIncidence(view, data, useStaticCoordsIndex = false) {
    const todayData = getDataForDate(data)
    const yesterdayData = getDataForDate(data, 1)

    const incidenceBox = view.addStack()
    incidenceBox.setPadding(6,8,6,8)
    incidenceBox.cornerRadius = 12
    incidenceBox.backgroundColor = new Color('999999', 0.1)
    incidenceBox.layoutHorizontally()
    
    const stackMainRowBox = incidenceBox.addStack()
    stackMainRowBox.layoutVertically()
    stackMainRowBox.addSpacer(0)

    if (useStaticCoordsIndex === 0) {
        const dateStr = todayData.updated.substr(0, 10)
        addLabelTo(stackMainRowBox, dateStr, Font.mediumSystemFont(10), new Color('888888'))
        stackMainRowBox.addSpacer(0)
    } else {
        stackMainRowBox.addSpacer(10)
    }
    const stackMainRow = stackMainRowBox.addStack()
    stackMainRow.centerAlignContent()

    // === INCIDENCE
    const incidence = (todayData.incidence >= 100) ? Math.round(todayData.incidence) : todayData.incidence;
    addLabelTo(stackMainRow, formatNumber(incidence), Font.boldSystemFont(27), getIncidenceColor(incidence))
    
    if (yesterdayData) {
        const incidenceTrend = getTrendArrow(todayData.incidence, yesterdayData.incidence);
        const incidenceLabelColor = (incidenceTrend === '↑') ? LIMIT_RED_COLOR : (incidenceTrend === '↓') ? LIMIT_GREEN_COLOR : new Color('999999')
        addLabelTo(stackMainRow, incidenceTrend, Font.boldSystemFont(27), incidenceLabelColor)
    }
    stackMainRow.addSpacer(4)

    // === BL INCIDENCE
    const incidenceBLStack = stackMainRow.addStack();
    incidenceBLStack.layoutVertically()
    incidenceBLStack.backgroundColor = new Color('dfdfdf')
    incidenceBLStack.cornerRadius = 4
    incidenceBLStack.setPadding(2,3,2,3)

    let incidenceBL = (todayData.incidenceBL >= 100) ? Math.round(todayData.incidenceBL) : todayData.incidenceBL;
    incidenceBL = formatNumber(incidenceBL)
    if (yesterdayData) {
        incidenceBL += getTrendArrow(todayData.incidenceBL, yesterdayData.incidenceBL)
    }
    addLabelTo(incidenceBLStack, incidenceBL, Font.mediumSystemFont(9), '444444')
    addLabelTo(incidenceBLStack, todayData.nameBL, Font.mediumSystemFont(9), '444444')

    let areaName = todayData.areaName
    if (typeof staticCoordinates[useStaticCoordsIndex] !== 'undefined' && staticCoordinates[useStaticCoordsIndex].name !== false) {
        areaName = staticCoordinates[useStaticCoordsIndex].name
    }
    // @TODO WORKAROUND FÜR DIE STACKBREITE ENTFERNEN
    areaName = areaName.toUpperCase().padEnd(50, ' ')
    const areanameLabel = addLabelTo(stackMainRowBox, areaName, Font.mediumSystemFont(14))
    areanameLabel.lineLimit = 1
    stackMainRowBox.addSpacer(0)
}

function addLabelTo(view, text, font = false, textColor = false) {
    const label = view.addText('' + text)
    if (font) label.font = font
    if (textColor) label.textColor = (typeof textColor === 'string') ? new Color(textColor) : textColor;
    return label
}

function formatNumber(number) {
    return new Number(number).toLocaleString('de-DE')
}

function getTrendArrow(value1, value2) {
    return (value1 < value2) ? '↓' : (value1 > value2) ? '↑' : '→'
}

function addTrendsBarToIncidenceBlock(view, data) {
    const trendsBarBox = view.addStack()
    trendsBarBox.setPadding(3,8,3,8)
    trendsBarBox.layoutHorizontally()
    let chartdata = getChartData(data, 'incidence')
    // chartdata = [4,32,40,50,101,55,20] // DEMO!!!
    addChartBlockTo(trendsBarBox, getGetLastCasesAndTrend(data, 'areaCases', true), chartdata, true)
    trendsBarBox.addSpacer()    
    let chartdataBL = getChartData(data, 'incidenceBL')
    // chartdataBL = [4,28,35,51,75,105,60] // DEMO!!!
    addChartBlockTo(trendsBarBox, getGetLastCasesAndTrend(data, 'cases', true, true), chartdataBL, false)
}

function addHeaderRowTo(view) {
    const headerRow = view.addStack()
    headerRow.setPadding(8,8,4,8)
    headerRow.centerAlignContent()
    const headerIcon = headerRow.addText("🦠")
    headerIcon.font = Font.mediumSystemFont(16)
    return headerRow;
}

function addChartBlockTo(view, trendtitle, chartdata, alignLeft = true) {
    let block = view.addStack()
    block.layoutVertically()
    block.size = new Size(58, 24)

    let textRow = block.addStack()
    if (!alignLeft) textRow.addSpacer()
    let chartText = textRow.addText(trendtitle)
    if (alignLeft) textRow.addSpacer()
    chartText.font = Font.mediumSystemFont(10)

    let graphImg = generateGraph(chartdata, 58, 10, alignLeft).getImage()
    let chartImg = block.addImage(graphImg)
    chartImg.resizable = false
}

function generateGraph(data, width, height, alignLeft = true) {
    let context = new DrawContext()
    context.size = new Size(width, height)
    context.opaque = false
    let min = Math.min(...data)
    let max = Math.max(...data) - min
    let w = Math.round((width - (data.length * 2)) / data.length)
    let xOffset = (!alignLeft) ? (width - (data.length * (w + 1))) : 0
    data.forEach((value, index) => {
        let h = Math.max(2, Math.round((value - min) / max * height))
        let x = xOffset + (w + 1) * index
        let rect = new Rect(x, 0, w, h)
        context.setFillColor(getIncidenceColor(value))
        context.fillRect(rect)
    })
    return context
}

async function getLocation(staticCoordinateIndex = false) {
    try {
        if (staticCoordinates && typeof staticCoordinates[staticCoordinateIndex] !== 'undefined' && Object.keys(staticCoordinates[staticCoordinateIndex]).length >= 3) {
            return staticCoordinates[staticCoordinateIndex]
        } else {
            Location.setAccuracyToThreeKilometers()
            return await Location.current()
        }
    } catch (e) {
        return null;
    }
}

async function getData(useStaticCoordsIndex = false) {
    let rValue = 0
    try {
        rValue = await getRValue()
    } catch(e){}
  
    try {
        let dataCases = await new Request(apiUrlNewCases).loadJSON()
        const cases = dataCases.features[0].attributes.value

        let dataStates = await new Request(apiUrlStates).loadJSON()
        const incidencePerState = dataStates.features.map((f) => { return {
            BL: BUNDESLAENDER_SHORT[f.attributes.LAN_ew_GEN],
            incidence: f.attributes.cases7_bl_per_100k,
            cases: f.attributes.Fallzahl
        }})

        const averageIncidence = incidencePerState.reduce((a, b) => a + b.incidence, 0) / incidencePerState.length
        const location = await getLocation(useStaticCoordsIndex)
        let data = await new Request(apiUrl(location)).loadJSON()
        const attr = data.features[0].attributes
        const res = {
            incidence: parseFloat(attr.cases7_per_100k.toFixed(1)),
            incidenceBL: parseFloat(attr.cases7_bl_per_100k.toFixed(1)),
            areaName: attr.GEN,
            areaCases: parseFloat(attr.cases.toFixed(1)),
            nameBL: BUNDESLAENDER_SHORT[attr.BL],
            shouldCache: true,
            updated: attr.last_update,
            incidencePerState: incidencePerState,
            averageIncidence: parseFloat(averageIncidence.toFixed(1)),
            cases: cases,
            r: rValue
        }
        return await saveLoadData(attr.RS, res)
    } catch (e) {
        return null
    }
}

async function getRValue() {
    const rDataStr = await new Request(apiRUrl).loadString()
    const rData = parseRCSV(rDataStr)
    let lastR = 0
    rData.forEach(item => {
        if (typeof item['Schätzer_7_Tage_R_Wert'] !== 'undefined' && parseFloat(item['Schätzer_7_Tage_R_Wert']) > 0) {
            lastR = item;
        }
    })    
    return (lastR) ? parseFloat(lastR['Schätzer_7_Tage_R_Wert'].replace(',','.')) : lastR
}

function getIncidenceColor(incidence) {
    let color = LIMIT_GREEN_COLOR
    if (incidence >= LIMIT_DARKRED) {
        color = LIMIT_DARKRED_COLOR
    } else if (incidence >= LIMIT_RED) {
        color = LIMIT_RED_COLOR
    } else if (incidence >= LIMIT_ORANGE) {
        color = LIMIT_ORANGE_COLOR
    } else if (incidence >= LIMIT_YELLOW) {
        color = LIMIT_YELLOW_COLOR
    } else if (incidence === 0) {
        color = LIMIT_GRAY_COLOR
    }
    return color
}

function parseInput (input) {
    const _coords = []
    const _staticCoordinates = input.split(";").map(coords => {
        return coords.split(',')
    })
    _staticCoordinates.forEach(coords => {
        _coords[parseInt(coords[0])] = {
            index: parseInt(coords[0]),
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2]),
            name: (coords[3]) ? coords[3] : false
        }
    })
    return _coords
}

function getDataForDate(data, dayOffset = 0) {
    const today = new Date();
    let todayDay = ('' + today.getDate()).padStart(2, '0')
    let todayMonth = ('' + (today.getMonth() + 1)).padStart(2, '0')
    const todayDateKey = `${todayDay}.${todayMonth}.${today.getFullYear()}`
    dayOffset = (typeof data[todayDateKey] === 'undefined') ? dayOffset + 1 : dayOffset
    today.setDate(today.getDate() - dayOffset);
    todayDay = ('' + today.getDate()).padStart(2, '0')
    todayMonth = ('' + (today.getMonth() + 1)).padStart(2, '0')
    let dateKey = `${todayDay}.${todayMonth}.${today.getFullYear()}`

    return (data[dateKey]) ? data[dateKey] : false
}

async function saveLoadData (dataId, data) {
    const loadedData = await loadData(dataId, data.areaName)
    loadedData[data.updated.substr(0, 10)] = data
    const loadedDataKeys = Object.keys(loadedData);
    const lastDaysKeys = loadedDataKeys.slice(Math.max(Object.keys(loadedData).length - 7, 0))
    let loadedDataLimited = {}
    lastDaysKeys.forEach(key => {
        loadedDataLimited[key] = loadedData[key]
    })
    let fm = getFilemanager()
    let path = fm.joinPath(fm.documentsDirectory(), 'coronaWidget' + dataId + '.json')
    fm.writeString(path, JSON.stringify(loadedDataLimited))
    return loadedData
}

async function loadData(dataId, oldAreaName) {
    let fm = getFilemanager()
    
    let oldPath = fm.joinPath(fm.documentsDirectory(), 'covid19' + oldAreaName + '.json')
    let path = fm.joinPath(fm.documentsDirectory(), 'coronaWidget' + dataId + '.json')
    if (fm.isFileStoredIniCloud(oldPath) && !fm.isFileDownloaded(oldPath)) {
        await fm.downloadFileFromiCloud(oldPath)
    }
    // MOVE OLD FILE TO NEW ID NAME
    if (fm.fileExists(oldPath) && !fm.fileExists(path)) fm.move(oldPath, path)
    if (fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) {
        await fm.downloadFileFromiCloud(path)
    }
    return (fm.fileExists(path)) ? JSON.parse(fm.readString(path)) : {}
}

function getFilemanager() {
    let fm 
    try {
        fm = FileManager.iCloud()
    } catch (e) {
        fm = FileManager.local()
    }
    
    // check if user logged in iCloud
    try { 
        fm.documentsDirectory()
    } catch(e) {
        fm = FileManager.local()
    }
    return fm
}

function parseRCSV(rDataStr) {
    let lines = rDataStr.split(/(?:\r\n|\n)+/).filter(function(el) {return el.length != 0});
    let headers = lines.splice(0, 1)[0].split(";");
    let valuesRegExp = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\";]+)/g;
    let elements = [];
    for (let i = 0; i < lines.length; i++) {
        let element = {};
        let j = 0;
        while (matches = valuesRegExp.exec(lines[i])) {
            var value = matches[1] || matches[2];
            value = value.replace(/\"\"/g, "\"");
            element[headers[j]] = value;
            j++;
        }
        elements.push(element);
    }
    return elements
}

function LOG(...data) {
    console.log(data.map(JSON.stringify).join(' | '))
}
