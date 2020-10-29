// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
// BASE VERSION FORKED FROM AUTHOR: kevinkub https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664
// UPDATED VERSION BY AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5

const outputFields = 'GEN,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL';
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
const outputFieldsStates = 'Fallzahl,LAN_ew_GEN,cases7_bl_per_100k';
const apiUrlStates = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%E4lle_in_den_Bundesl%E4ndern/FeatureServer/0/query?where=1%3D1&outFields=${outputFieldsStates}&returnGeometry=false&outSR=4326&f=json`
const apiUrlNewCases = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true'

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
const LIMIT_DARKRED_COLOR = new Color('9e000a') // DARKRED: 
const LIMIT_RED_COLOR = new Color('f6000f')
const LIMIT_ORANGE_COLOR = new Color('#ff7927')
const LIMIT_YELLOW_COLOR = new Color('F5D800')
const LIMIT_GREEN_COLOR = new Color('1CC747')

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
let fixedCoordinates = []
if (args.widgetParameter) {
    fixedCoordinates = parseInput(args.widgetParameter)
    if (typeof fixedCoordinates[1] !== 'undefined' && Object.keys(fixedCoordinates[1]).length >= 3) {
        MEDIUMWIDGET = true
    }
} else { // DEBUG MEDIUM WIDGET
    // fixedCoordinates[0] = { index: 0, latitude: 51.23377, longitude: 6.7731, name: false }
    // fixedCoordinates[1] = { index: 1, latitude: 48.24670, longitude: 12.52155, name: 'Work' }
    // fixedCoordinates[0] = { index: 0, latitude: 48.13743, longitude: 11.57549, name: false }
    // fixedCoordinates[1] = { index: 1, latitude: 53.551086, longitude: 9.993682, name: 'Home' }
    // MEDIUMWIDGET = true
}

let data = {}
let weekData = {}
const widget = await createWidget()
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
    const _data = await getData(0)
    let areaName;
    if (_data && typeof _data.areaName !== 'undefined') {
        areaName = _data.areaName;
        data[areaName] = _data
    }
    const list = new ListWidget()
    const headerLabel = list.addStack()
    headerLabel.useDefaultPadding()
    headerLabel.centerAlignContent()
    if (MEDIUMWIDGET) {
        headerLabel.layoutHorizontally()
    } else {
        list.setPadding(10,15,10,10)
        headerLabel.layoutVertically()
    }

    const header = headerLabel.addText("🦠 Inzidenz".toUpperCase())
    header.font = Font.mediumSystemFont(13)

    if (data && typeof data[areaName] !== 'undefined') {
        weekData[areaName] = saveLoadData(data[areaName], areaName)
        if (!data[areaName].shouldCache) {
            list.addSpacer(6)
            const loadingIndicator = list.addText("Ort wird ermittelt...".toUpperCase())
            loadingIndicator.font = Font.mediumSystemFont(13)
            loadingIndicator.textOpacity = 0.5
        }
        if (MEDIUMWIDGET && typeof data[areaName] !== 'undefined') {
            headerLabel.addSpacer()
            createGerTopDailyCasesLabel(headerLabel, data[areaName], weekData[areaName])
        }
        list.addSpacer(16)
        
        // INCIDENCE
        const incidenceLabel = list.addStack()
        if (MEDIUMWIDGET) {
            incidenceLabel.size = new Size(300, 90)
        }
        incidenceLabel.layoutHorizontally()
        incidenceLabel.useDefaultPadding()
        incidenceLabel.topAlignContent()
        createIncidenceLabelBlock(incidenceLabel, data[areaName], weekData[areaName], 0)

        const _dataF = await getData(1)
        let areaNameF
        if (_dataF && typeof _dataF.areaName !== 'undefined') {
            areaNameF = _dataF.areaName;
            data[areaNameF] = _dataF
        }
        if (MEDIUMWIDGET  && typeof data[areaNameF] !== 'undefined') { 
            weekData[areaNameF] = saveLoadData(data[areaNameF], areaNameF)
            incidenceLabel.addSpacer(10)
            createIncidenceLabelBlock(incidenceLabel, data[areaNameF], weekData[areaNameF], 1)
        }
        
        if (data[areaName].shouldCache) {
            list.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000)
        }
    } else {
        list.addSpacer()
        const errorLabel = list.addText("Daten nicht verfügbar. \nWidget öffnen für reload...")
        errorLabel.font = Font.mediumSystemFont(12)
        errorLabel.textColor = Color.gray()
    }

    return list
}

async function getData(useFixedCoordsIndex = false) {
    try {
        let dataCases = await new Request(apiUrlNewCases).loadJSON()
        const cases = dataCases.features[0].attributes.value

        let dataStates = await new Request(apiUrlStates).loadJSON()
        const incidencePerState = dataStates.features.map((f) => { return { 
            BL: BUNDESLAENDER_SHORT[f.attributes.LAN_ew_GEN], 
            incidence: f.attributes.cases7_bl_per_100k,
            cases: f.attributes.Fallzahl // ???
        }})

        const averageIncidence = incidencePerState.reduce((a, b) => a + b.incidence, 0) / incidencePerState.length
        const location = await getLocation(useFixedCoordsIndex)
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
            cases: cases
        }
        return res
    } catch (e) {
        return null
    }
}

function parseInput (input) {
    const _coords = []
    const _fixedCoordinates = input.split(";").map(coords => {
        return coords.split(',')
    })

    _fixedCoordinates.forEach(coords => {
        _coords[parseInt(coords[0])] = {
            index: parseInt(coords[0]),
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[2]),
            name: (typeof coords[3] !== 'undefined') ? coords[3] : false
        }
    })

    return _coords
  }

async function getLocation(fixedCoordinateIndex = false) {
    try {
        if (fixedCoordinates && typeof fixedCoordinates[fixedCoordinateIndex] !== 'undefined' && Object.keys(fixedCoordinates[fixedCoordinateIndex]).length >= 3) {
            return fixedCoordinates[fixedCoordinateIndex]
        } else {
            Location.setAccuracyToThreeKilometers()
            return await Location.current()
        }
    } catch (e) {
        return null;
    }
}

function createGerTopDailyCasesLabel(label, data, weekData) {
    let casesStack = label.addStack()
    casesStack.layoutHorizontally()
    casesStack.centerAlignContent()
    casesStack.setPadding(4,4,4,4)
    casesStack.cornerRadius = 6

    let formatedCases = formatCases(data.cases)
    const prevData = getDataForDate(weekData);
    if (prevData) {
        formatedCases += getTrendArrow(prevData.cases, data.cases)
    }

    createUpdatedLabel(casesStack, data)

    let labelCases = casesStack.addText(`(+${formatedCases})`)
    labelCases.rightAlignText()
    labelCases.font = Font.systemFont(10)
}

function createGerDailyCasesLabel(label, data, weekData) {
    let bgColor = new Color('f0f0f0')
    let textColor = new Color('444444')
    if(Device.isUsingDarkAppearance()) {
        bgColor = new Color('202020')
        textColor = new Color('f0f0f0')
    }

    let fontsize = MEDIUMWIDGET ? 10 : 9
    let formatedCasesArea = ''
    let formatedCasesBL = ''
    let formatedCases = formatCases(data.cases)

    const prevData = getDataForDate(weekData);
    if (prevData) {
        formatedCases += getTrendArrow(prevData.cases, data.cases)
        formatedCasesArea = getNewAreaCasesAndTrend(data, weekData)
        formatedCasesBL = getNewBLCasesAndTrend(data, weekData)
    }

    let casesStack = label.addStack()
    casesStack.layoutHorizontally()
    casesStack.centerAlignContent()
    casesStack.setPadding(4,3,4,3)
    casesStack.cornerRadius = 6
    casesStack.backgroundColor = bgColor

    casesStack.size = (MEDIUMWIDGET) ? new Size(140, 15) : new Size(132, 15)

    let labelCases = casesStack.addText(`${formatedCasesArea}`)
    labelCases.font = Font.systemFont(fontsize)
    labelCases.textColor = textColor


    casesStack.addSpacer()
    let labelCases2 = casesStack.addText(`${formatedCasesBL}`)
    labelCases2.centerAlignText()
    labelCases2.font = Font.systemFont(fontsize)
    labelCases2.textColor = textColor

    // GER CASES
    if (!MEDIUMWIDGET) {
        casesStack.addSpacer()
        let labelCases3 = casesStack.addText(`+${formatedCases}`)
        labelCases3.rightAlignText()
        labelCases3.font = Font.systemFont(fontsize)
        labelCases3.textColor = textColor
    }
}

function formatCases(cases) {
    return formatedCases = new Number(cases).toLocaleString('de-DE')
}

function getTrendArrow (preValue, currentValue) {
    return (currentValue <= preValue) ? '↓' : '↑'
}

function createUpdatedLabel(label, data, align = 1) {
    const areaCasesLabel = label.addText(`${data.updated.substr(0, 10)} `)
    areaCasesLabel.font = Font.systemFont(10)
    if (align === -1) { areaCasesLabel.rightAlignText() } else { areaCasesLabel.leftAlignText() }
}

function createIncidenceLabelBlock(labelBlock, data, weekData, fixedCoordinateIndex = 0) {
    const stack = labelBlock.addStack()
    stack.layoutVertically()
    stack.useDefaultPadding()
    stack.topAlignContent()

    // DATE
    if (!MEDIUMWIDGET) {
        createUpdatedLabel(stack, data)
    }

    // MAIN ROW WITH INCIDENCE
    const stackMainRow = stack.addStack()
    stackMainRow.useDefaultPadding()
    stackMainRow.centerAlignContent()
    stackMainRow.size = (MEDIUMWIDGET) ? new Size(145, 30) : new Size(135, 30)

    // MAIN INCIDENCE
    let incidence = data.incidence >= 100 ? Math.floor(data.incidence) : data.incidence;
    const incidenceLabel = stackMainRow.addText('' + incidence)
    incidenceLabel.font = Font.boldSystemFont(27)
    incidenceLabel.leftAlignText();
    incidenceLabel.textColor = getIncidenceColor(data.incidence)

    const incidenceTrend = getIncidenceTrend(data, weekData)
    const incidenceLabelTrend = stackMainRow.addText(incidenceTrend)
    incidenceLabelTrend.font = Font.boldSystemFont(27)
    incidenceLabelTrend.leftAlignText();
    incidenceLabelTrend.textColor = (incidenceTrend === '↑') ? LIMIT_RED_COLOR : (incidenceTrend === '↓') ? LIMIT_GREEN_COLOR : new Color('999999')

    stackMainRow.addSpacer(5)

    // BL INCIDENCE
    const incidenceBLStack = stackMainRow.addStack();
    incidenceBLStack.backgroundColor = new Color('f0f0f0')
    incidenceBLStack.cornerRadius = 4
    incidenceBLStack.setPadding(2,3,2,3)

    const incidenceBL = (data.incidenceBL >= 100) ? Math.floor(data.incidenceBL) : data.incidenceBL
    const incidenceBLLabel = incidenceBLStack.addText(incidenceBL + getIncidenceBLTrend(data, weekData) + '\n' + data.nameBL)
    incidenceBLLabel.font = Font.mediumSystemFont(9)
    incidenceBLLabel.textColor = new Color('444444')

    stackMainRow.addSpacer()

    let areaName = data.areaName
    if (typeof fixedCoordinates[fixedCoordinateIndex] !== 'undefined' && fixedCoordinates[fixedCoordinateIndex].name !== false) {
        areaName = fixedCoordinates[fixedCoordinateIndex].name
    }
    const areanameLabel = stack.addText(areaName.toUpperCase())
    areanameLabel.font = Font.mediumSystemFont(14)
    areanameLabel.lineLimit = 2

    stack.addSpacer()
    createGraph(stack, weekData)
    stack.addSpacer(4)

    createGerDailyCasesLabel(stack, data, weekData)
}

function createGraph(row, weekData) {
    let graphRow = row.addStack()
    graphRow.centerAlignContent()
    graphRow.useDefaultPadding()
    graphRow.size = (MEDIUMWIDGET) ? new Size(145, 10) : new Size(135, 10)    

    let incidenceColumnData = []
    let incidenceColumnBLData = []
    let incidenceColumnGerData = []

    Object.keys(weekData).forEach(key => {
        incidenceColumnData.push(weekData[key].incidence)
        incidenceColumnBLData.push(weekData[key].incidenceBL)
        if (!MEDIUMWIDGET) {
            incidenceColumnGerData.push(weekData[key].averageIncidence)
        }
    })
    incidenceColumnData.push(0)
    incidenceColumnData = incidenceColumnData.concat(incidenceColumnBLData)
    if (!MEDIUMWIDGET) {
        incidenceColumnData.push(0)
        incidenceColumnData = incidenceColumnData.concat(incidenceColumnGerData)    
    }

    let w = (MEDIUMWIDGET) ? 135 : 125
    let image = columnGraph(incidenceColumnData, w, 15).getImage()
    let img = graphRow.addImage(image)
    img.resizable = false;
    img.centerAlignImage();
}

function columnGraph(data, width, height) {
    let context = new DrawContext()
    context.size = new Size(width, height)
    context.opaque = false
    let max = Math.max(...data)
    data.forEach((value, index) => {
        context.setFillColor(getIncidenceColor(value))
        let w = (width / data.length) - 2
        let h = value / max * height
        let x = (w + 2) * index
        let y = height - h
        let rect = new Rect(x, y, w, h)
        context.fillRect(rect)
    })
    return context
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
    }
    return color
}

function getIncidenceTrend(data, weekData) {
    let incidenceTrend = ' ';
    if (typeof weekData !== 'undefined' && Object.keys(weekData).length > 0) {
        const prevData = getDataForDate(weekData);
        if (prevData) {
            incidenceTrend = (data.incidence < prevData.incidence) ? '↓' : (data.incidence > prevData.incidence) ? '↑' : '→'
        }
    }
    return incidenceTrend
}

function getNewAreaCasesAndTrend(data, weekData) {
    let newAreaCases = '';
    if (typeof weekData !== 'undefined' && Object.keys(weekData).length > 0) {
        const prev1DayData = getDataForDate(weekData);
        if (prev1DayData && typeof prev1DayData.areaCases !== 'undefined') {
            newAreaCases += (data.areaCases < prev1DayData.areaCases) ?'-' : '+'
            newAreaCases += formatCases(Math.abs(getDiff(data, prev1DayData, 'areaCases')))

            const prev2DaysData = getDataForDate(weekData, 2);
            if (prev2DaysData && typeof prev2DaysData.areaCases !== 'undefined') {
                const diffPrev1Day = getDiff(data, prev1DayData, 'areaCases')
                const diffPrev2Days = getDiff(prev1DayData, prev2DaysData, 'areaCases')
                if (diffPrev1Day || diffPrev2Days) {
                    newAreaCases += (diffPrev1Day > diffPrev2Days) ?'↑' : '↓'
                } else {
                    newAreaCases += '→'
                }
            }
        }
    }
    return newAreaCases
}

function getDiff(data, data2, field) {
    if (typeof data[field] !== 'undefined' && typeof data2[field] !== 'undefined') {
        return data[field] - data2[field]
    }
    return 0
}

function getNewBLCasesAndTrend(data, weekData) {
    let newBLCases = ''
    let d = data.incidencePerState.filter((item) => {
        return item.BL === data.nameBL
    })
    let currentBLData = (typeof d[0] !== 'undefined') ? d[0] : null
    const prev1DayData = getDataForDate(weekData);
    let dp = prev1DayData.incidencePerState.filter((item) => {
        return item.BL === data.nameBL
    })
    let prev1DayBLData = (typeof dp[0] !== 'undefined') ? dp[0] : null
    if(currentBLData && prev1DayBLData) {
        newBLCases += (currentBLData.cases < prev1DayBLData.cases) ?'-' : '+'
        newBLCases += formatCases(Math.abs(currentBLData.cases - prev1DayBLData.cases))

        const prev2DaysData = getDataForDate(weekData, 2);
        if (prev2DaysData) {
            let dp = prev2DaysData.incidencePerState.filter((item) => {
                return item.BL === data.nameBL
            })
            let prev2DaysBLData = (typeof dp[0] !== 'undefined') ? dp[0] : null
            if (prev2DaysBLData) {
                const diffPrev1Day = getDiff(currentBLData, prev1DayBLData, 'cases')
                const diffPrev2Days = getDiff(prev1DayBLData, prev2DaysBLData, 'cases')
                if (diffPrev1Day || diffPrev2Days) {
                    newBLCases += (diffPrev1Day > diffPrev2Days) ?'↑' : '↓'
                } else {
                    newBLCases += '→'
                }
            }
        }
    }
    return newBLCases
}

function getIncidenceBLTrend(data, weekData) {
    let incidenceBLTrend = '';    
    if (typeof weekData !== 'undefined' && Object.keys(weekData).length > 0) {
        const prevData = getDataForDate(weekData);
        if (prevData) {
            incidenceBLTrend = (data.incidenceBL < prevData.incidenceBL) ? '↓' : (data.incidenceBL > prevData.incidenceBL) ? '↑' : '→'
        }
    }
    return incidenceBLTrend
}

function getDataForDate(weekData, dayOffset = 1) {
    let dateKey;
    const today = new Date();
    const todayDateKey = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
    if (typeof weekData[todayDateKey] === 'undefined') {
        dayOffset = dayOffset + 1
    }

    today.setDate(today.getDate() - dayOffset);
    dateKey = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`

    if (typeof weekData[dateKey] !== 'undefined') {
        return weekData[dateKey]
    }
    return false
}

// LIMIT TO 7 DAYS
function saveLoadData (newData, suffix = '') {
    const updated = newData.updated.substr(0, 10);
    const loadedData = loadData(suffix)
    if (loadedData) {
        loadedData[updated] = newData

        const loadedDataKeys = Object.keys(loadedData);
        const lastDaysKeys = loadedDataKeys.slice(Math.max(Object.keys(loadedData).length - 7, 0))

        let loadedDataLimited = {}
        lastDaysKeys.forEach(key => {
            loadedDataLimited[key] = loadedData[key]
        })

        try {
            let fm = FileManager.iCloud()
            let path = fm.joinPath(fm.documentsDirectory(), 'covid19' + suffix + '.json')
            fm.writeString(path, JSON.stringify(loadedDataLimited))
        } catch (e) {
            let fm = FileManager.local()
            let path = fm.joinPath(fm.documentsDirectory(), 'covid19' + suffix + '.json')
            fm.writeString(path, JSON.stringify(loadedDataLimited))
        }

        return loadedData
    }
    return {}
}

function loadData(suffix) {
    try {
        let fm = FileManager.iCloud()
        let path = fm.joinPath(fm.documentsDirectory(), 'covid19' + suffix + '.json')
        if (fm.fileExists(path)) {
            let data = fm.readString(path)
            return JSON.parse(data)
        }
    } catch (e) {
        let fm = FileManager.local()
        let path = fm.joinPath(fm.documentsDirectory(), 'covid19' + suffix + '.json')
        if (fm.fileExists(path)) {
            let data = fm.readString(path)
            return JSON.parse(data)
        }
    }
    return {};
}