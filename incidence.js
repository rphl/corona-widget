// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;

/**
 * Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * AUTHOR: https://github.com/rphl - https://github.com/rphl/corona-widget/
 * ISSUES: https://github.com/rphl/corona-widget/issues
 * 
 */

// ============= ============= ============= ============= =================
// ÄNDERUNGEN HIER, WERDEN BEI AKTIVEN AUTOUPDATE ÜBERSCHRIEBEN
// ZUR KONFIGURATION SIEHE README!
// https://github.com/rphl/corona-widget#erweiterte-konfiguration
//
// ============= ============= ============= ============= =================

let CFG = {
    theme: '', // '' = Automatic Ligh/Darkmode based on iOS. light = only lightmode is used, dark = only darkmode is used
    showDataInRow: false, // show "vaccine", "hospitalization", or false  (statictics) values based on RKI reports. MEDIUMWIDGET IS REQUIRED!
    showDataInBlocks: 'hospitalization', // show "vaccine", "hospitalization", or false disabled based on RKI reports (State/Country). Vaccine only in MEDIUMWIDGET. Hospitalization only in SMALLWIDGET.
    openUrl: false, //"https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4", // open RKI dashboard on tap, set false to disable
    graphShowValues: 'i', // 'i' = incidence OR 'c' = cases
    graphShowDays: 21, // show days in graph
    csvRvalueFields: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes', 'Schไtzer_7_Tage_R_Wert', 'Punktschไtzer des 7-Tage-R Wertes', 'PS_7_Tage_R_Wert'], // try to find possible field (column) with rvalue, because rki is changing columnsnames and encoding randomly on each update
    scriptRefreshInterval: 5400, // refresh after 1,5 hours (in seconds)
    scriptSelfUpdate: false, // script updates itself,
    disableLiveIncidence: false, // show old, static incidance. update ONLY ONCE A DAY on intial RKI import
    debugIncidenceCalc: false // show all calculated incidencevalues on console
}

// ============= ============= ============= ============= =================
// HALT, STOP !!!
// NACHFOLGENDE ZEILEN NUR AUF EIGENE GEFAHR ÄNDERN !!!
// ============= ============= ============= ============= =================

const ENV = {
    themes: {
        light: {
            mainBackgroundImageURL: '',
            mainBackgroundColor: '#f2f2f7',
            stackBackgroundColor: '#8e8e9320',
            stackBackgroundColorSmall: '#8e8e9315',
            stackBackgroundColorSmallTop: '#8e8e9300',
            areaIconBackgroundColor: '#8e8e9330',
            titleTextColor: '#1c1c1e',
            titleRowTextColor: '#1c1c1e',
            titleRowTextColor2: '#1c1c1e',
            smallNameTextColor: '#636366',
            dateTextColor: '#8e8e93',
            dateTextColor2: '#8e8e93',
            graphTextColor: '#636366',
            incidenceColorsPurple: '#af52de',
            incidenceColorsPink: '#ff2d55',
            incidenceColorsDarkdarkred: '#6b0600',
            incidenceColorsDarkred: '#cd0b00',
            incidenceColorsRed: '#ff3b30',
            incidenceColorsOrange: '#ff9500',
            incidenceColorsYellow: '#ffcc00',
            incidenceColorsGreen: '#34c759',
            incidenceColorsGray: '#d0d0d0'
        },
        dark: {
            mainBackgroundImageURL: '',
            mainBackgroundColor: '#1c1c1e',
            stackBackgroundColor: '#8e8e9320',
            stackBackgroundColorSmall: '#8e8e9310',
            stackBackgroundColorSmallTop: '#8e8e9300',
            areaIconBackgroundColor: '#8e8e9330',
            titleTextColor: '#f2f2f7',
            titleRowTextColor: '#f2f2f7',
            titleRowTextColor2: '#f2f2f7',
            smallNameTextColor: '#aeaeb2',
            dateTextColor: '#8e8e93',
            dateTextColor2: '#8e8e93',
            graphTextColor: '#aeaeb2',
            incidenceColorsPurple: '#bf5af2',
            incidenceColorsPink: '#b00a00',
            incidenceColorsDarkdarkred: '#941100',
            incidenceColorsDarkred: '#d70c00',
            incidenceColorsRed: '#ff453a',
            incidenceColorsOrange: '#ff9f0a',
            incidenceColorsYellow: '#ffd60a',
            incidenceColorsGreen: '#30d158',
            incidenceColorsGray: '#d0d0d0'
        }
    },
    incidenceColors: {
        lila: { limit: 1000, color: 'incidenceColorsPurple' },
        pink: { limit: 500, color: 'incidenceColorsPink' },
        darkdarkred: { limit: 250, color: 'incidenceColorsDarkdarkred' },
        darkred: { limit: 100, color: 'incidenceColorsDarkred' },
        red: { limit: 50, color: 'incidenceColorsRed' },
        orange: { limit: 35, color: 'incidenceColorsOrange' },
        yellow: { limit: 25, color: 'incidenceColorsYellow' },
        green: { limit: 1, color: 'incidenceColorsGreen' },
        gray: { limit: 0, color: 'incidenceColorsGray' }
    },
    hospitalizedIncidenceLimits: {
        green: { limit: 0, color: 'incidenceColorsGreen' },
        yellow: { limit: 3, color: 'incidenceColorsYellow' },
        orange: { limit: 6, color: 'incidenceColorsOrange' },
        red: { limit: 9, color: 'incidenceColorsDarkdarkred' },
    },
    statesAbbr: {
        '8': 'BW',
        '9': 'BY',
        '11': 'BE',
        '12': 'BB',
        '4': 'HB',
        '2': 'HH',
        '6': 'HE',
        '13': 'MV',
        '3': 'NI',
        '5': 'NRW',
        '7': 'RP',
        '10': 'SL',
        '14': 'SN',
        '15': 'ST',
        '1': 'SH',
        '16': 'TH'
    },
    vaccineSatesAbbr: {
        '8' : 'Baden-Württemberg',
        '9' : 'Bayern',
        '11' : 'Berlin',
        '12' : 'Brandenburg',
        '4' : 'Bremen',
        '2' : 'Hamburg',
        '6' : 'Hessen',
        '13' : 'Mecklenburg-Vorpommern',
        '3' : 'Niedersachsen',
        '5' : 'Nordrhein-Westfalen',
        '7' : 'Rheinland-Pfalz',
        '10' : 'Saarland',
        '14' : 'Sachsen',
        '15' : 'Sachsen-Anhalt',
        '1' : 'Schleswig-Holstein',
        '16' : 'Thüringen'
    },
    areaIBZ: {
        '40': 'KS',// Kreisfreie Stadt
        '41': 'SK', // Stadtkreis
        '42': 'K', // Kreis
        '46': 'K', // Sonderverband offiziel Kreis
        '43': 'LK', // Landkreis
        '45': 'LK', // Sonderverband offiziel Landkreis
        null: 'BZ',
        '': 'BZ'
    },
    fonts: {
        xlarge: Font.boldSystemFont(26),
        large: Font.mediumSystemFont(20),
        medium: Font.mediumSystemFont(14),
        normal: Font.mediumSystemFont(12),
        small: Font.boldSystemFont(11),
        small2: Font.boldSystemFont(10),
        xsmall: Font.boldSystemFont(9)
    },
    status: {
        nogps: 555,
        offline: 418,
        notfound: 404,
        error: 500,
        ok: 200,
        fromcache: 418
    },
    isMediumWidget: config.widgetFamily === 'medium',
    isSameState: false,
    cache: {},
    staticCoordinates: [],
    script: {
        selfUpdate: CFG.scriptSelfUpdate,
        filename: this.module.filename.replace(/^.*[\\\/]/, ''),
        updateStatus: ''
    }
}

class Theme {
    static getCurrentTheme () {
        let theme = 'auto';
        if (CFG.theme === 'light' || CFG.theme === 'dark') {
            theme = CFG.theme
        }
        return theme
    }
    static getColor(colorName, useDefault = false) {
        let theme = Theme.getCurrentTheme();
        if (theme === 'auto' && useDefault) {
            theme = 'light';
        }
        if (theme === 'light' || theme === 'dark') {
            return new Color(ENV.themes[theme][colorName])
        }
        return false // no color preferred
    }
    static setColor(object, propertyName, colorName, useDefault = false) {
        if (CFG.theme === 'light' || CFG.theme === 'dark' || useDefault) {
            let theme = Theme.getCurrentTheme();
            object[propertyName] = new Color(ENV.themes[theme][colorName])
        }
    }
}

class IncidenceWidget {
    constructor(coordinates = []) {
        this.loadConfig();
        if (args.widgetParameter) ENV.staticCoordinates = Parse.input(args.widgetParameter)
        ENV.staticCoordinates = [...ENV.staticCoordinates, ...coordinates]
        if (typeof ENV.staticCoordinates[1] !== 'undefined' && Object.keys(ENV.staticCoordinates[1]).length >= 3) ENV.isMediumWidget = true
        Helper.log("Current Theme:", Theme.getCurrentTheme())
        this.selfUpdate()
    }
    async init() {
        this.widget = await this.createWidget()
        this.widget.setPadding(0, 0, 0, 0)

        if (Theme.getCurrentTheme() === 'light' || Theme.getCurrentTheme() === 'dark') {
            const backgroundImageUrl = ENV.themes[Theme.getCurrentTheme()]['mainBackgroundImageURL']
            if (backgroundImageUrl !== '') {
                const i = await new Request(backgroundImageUrl);
                const img = await i.loadImage();
                this.widget.backgroundImage = img
            }
        }

        Theme.setColor(this.widget, 'backgroundColor', 'mainBackgroundColor')

        if (!config.runsInWidget) {
            (ENV.isMediumWidget) ? await this.widget.presentMedium() : await this.widget.presentSmall()
        }
        Script.setWidget(this.widget)
        Script.complete()
    }
    async createWidget() {
        const list = new ListWidget()
        const statusPos0 = await Data.load(0)
        const statusPos1 = (ENV.isMediumWidget && typeof ENV.staticCoordinates[1] !== 'undefined') ? await Data.load(1) : false

        // UI ===============
        let topBar = new UI(list).stack('h', [4, 8, 4, 4])
        topBar.text("🦠", Font.mediumSystemFont(22))
        topBar.space(3)

        if (statusPos0 === ENV.status.error || statusPos1 === ENV.status.error) {
            topBar.space()
            list.addSpacer()
            let statusError = new UI(list).stack('v', [4, 6, 4, 6])
            statusError.text('⚡️', ENV.fonts.medium)
            statusError.text('Standortdaten konnten nicht geladen werden. \nKein Cache verfügbar. \n\nBitte später nochmal versuchen.', ENV.fonts.small, Theme.getColor('titleTextColor'))
            list.addSpacer(4)
            list.refreshAfterDate = new Date(Date.now() + ((CFG.scriptRefreshInterval / 2) * 1000))
            return list
        }

        Helper.calcIncidence('s0')
        Helper.calcIncidence(ENV.cache['s0'].meta.BL_ID)
        Helper.calcIncidence('d')

        ENV.isSameState = false;
        if (statusPos0 === statusPos1) {
            ENV.isSameState = (ENV.cache['s0'].meta.BL_ID === ENV.cache['s1'].meta.BL_ID)
        }

        if (statusPos1) Helper.calcIncidence('s1')
        if (statusPos1 && !ENV.isSameState) Helper.calcIncidence(ENV.cache['s1'].meta.BL_ID)

        let topRStack = new UI(topBar).stack('v', [0,0,0,0])
        topRStack.text(Format.number(ENV.cache.d.meta.r, 2, 'n/v') + 'ᴿ', ENV.fonts.medium, Theme.getColor('titleTextColor'))
        let updatedDate = Format.dateStr(ENV.cache.d.getDay().date);
        let updatedTime = ('' + new Date().getHours()).padStart(2, '0') + ':' + ('' + new Date().getMinutes()).padStart(2, '0')
        topRStack.text(updatedDate + ' ' +updatedTime, ENV.fonts.xsmall, Theme.getColor('dateTextColor', true))
        

        topBar.space()
        UIComp.statusBlock(topBar, statusPos0)
        topBar.space(4)

        if (ENV.isMediumWidget && !ENV.isSameState && statusPos1) {
            topBar.space()
            UIComp.smallIncidenceRow(topBar, 'd', 'stackBackgroundColorSmallTop')
        }

        UIComp.incidenceVaccineRows(list)
        list.addSpacer(3)

        let stateBar = new UI(list).stack('h', [0, 0, 0, 0])
        stateBar.space(6)
        let leftCacheID = ENV.cache['s0'].meta.BL_ID
        if (ENV.isMediumWidget) { UIComp.smallIncidenceRow(stateBar, leftCacheID) } else { UIComp.smallIncidenceBlock(stateBar, leftCacheID) }
        stateBar.space(4)

        // DEFAULT IS GER... else STATE
        let rightCacheID = (ENV.isMediumWidget && !ENV.isSameState && statusPos1) ? ENV.cache['s1'].meta.BL_ID : 'd'
        if (ENV.isMediumWidget) { UIComp.smallIncidenceRow(stateBar, rightCacheID) } else { UIComp.smallIncidenceBlock(stateBar, rightCacheID) }
        stateBar.space(6)
        list.addSpacer(5)

        // UI ===============
        if (CFG.openUrl) list.url = CFG.openUrl
        list.refreshAfterDate = new Date(Date.now() + (CFG.scriptRefreshInterval * 1000))
        return list
    }
    async selfUpdate() {
        if (!ENV.script.selfUpdate) return
        Helper.log('script selfUpdate', 'running')
        let url = 'https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js';
        let request = new Request(url)
        let filenameBak = ENV.script.filename.replace('.js', '.bak.js')
        try {
            let script = await request.loadString()
            if (script !== '') {
                if (cfm.fm.fileExists(filenameBak)) await cfm.fm.remove(filenameBak)
                cfm.copy(ENV.script.filename, filenameBak)
                script = script.replace("scriptSelfUpdate: false", "scriptSelfUpdate: true")
                cfm.save(script, ENV.script.filename)
                ENV.script.updateStatus = 'updated'
                Helper.log('script selfUpdate', ENV.script.updateStatus);
            }
        } catch (e) {
            console.warn(e)
            if (cfm.fm.fileExists(filenameBak)) {
                // await cfm.fm.copy(filenameBak, ENV.script.filename)
                // await cfm.fm.remove(filenameBak)
                ENV.script.updateStatus = 'loading failed, rollback?'
                Helper.log('script selfUpdate', ENV.script.updateStatus);
            }
        }
    }
    async loadConfig () {
        let path = cfm.fm.joinPath(cfm.configPath, 'config.json');
        if (cfm.fm.fileExists(path)) {
            Helper.log('Loading config.json (defaults will be overwritten)')
            const cfg = await cfm.read('config')
            if (typeof cfg.data.themes !== 'undefined' && typeof cfg.data.themes.dark !== 'undefined') {
                ENV.themes.dark = Object.assign(ENV.themes.dark, cfg.data.themes.dark)   
            }
            Object.keys(ENV.themes).forEach(theme => {
                if (typeof cfg.data.themes !== 'undefined' && typeof cfg.data.themes[theme] !== 'undefined') {
                    Helper.log('Loading custom theme from config.json: ' + theme)
                    ENV.themes[theme] = Object.assign(ENV.themes[theme], cfg.data.themes[theme])   
                }
            })
            if (cfg.status === ENV.status.ok) CFG = Object.assign(CFG, cfg.data)
        }
    }
}

class UIComp {
    static incidenceVaccineRows(view) {
        let b = new UI(view).stack('v', [4, 6, 4, 6])
        let bb = new UI(b).stack('v', false, Theme.getColor('stackBackgroundColor', true), 10)
        let padding = [4, 6, 4, 4]
        if (ENV.isMediumWidget) {
            padding = [2, 8, 2, 8]
        }
        let bb2 = new UI(bb).stack('h', padding, Theme.getColor('stackBackgroundColor', true), 10)
        UIComp.incidenceRow(bb2, 's0')

        let bb3 = new UI(bb).stack('h', padding)
        if (ENV.isMediumWidget && CFG.showDataInRow === false && typeof ENV.cache.s1 === 'undefined' && typeof ENV.cache.vaccine !== 'undefined') {
            UIComp.statisticsRow(bb3, 's0')
        } else if (ENV.isMediumWidget && CFG.showDataInRow === 'vaccine' && typeof ENV.cache.s1 === 'undefined' && typeof ENV.cache.vaccine !== 'undefined') {
            UIComp.vaccineRow(bb3, 's0')
        } else if (ENV.isMediumWidget && CFG.showDataInRow === 'hospitalization' && typeof ENV.cache.s1 === 'undefined' && typeof ENV.cache.hospitalization !== 'undefined') {
            UIComp.hospitalizationRow(bb3, 's0')
        } else if (ENV.isMediumWidget && typeof ENV.cache.s1 !== 'undefined') {
            UIComp.incidenceRow(bb3, 's1')
        } else if (!ENV.isMediumWidget) {
            bb3.space()
            UIComp.areaIcon(bb3, ENV.cache['s0'].meta.IBZ)
            bb3.space(3)
            let areaName = ENV.cache['s0'].meta.GEN
            if (typeof ENV.staticCoordinates[0] !== 'undefined' && ENV.staticCoordinates[0].name !== false) {
                areaName = ENV.staticCoordinates[0].name
            }
            bb3.text(areaName.toUpperCase(), ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
            bb3.space(8) // center title if small widget
            bb3.space()
        }
    }
    static incidenceRow(view, cacheID) {
        let b = new UI(view).stack('h', [2,0,0,0])
        let ib = new UI(b).stack('h', [0,0,0,0], false, false, false, [72, 26])
        ib.elem.centerAlignContent()

        let incidence = ENV.cache[cacheID].getDay().incidence
        let incidenceFormatted = Format.number(incidence, 1, 'n/v', 100)
        let incidenceParts = incidenceFormatted.split(",")
        let incidenceFontsize = (incidence >= 1000) ? 19 : 26;
        ib.text(incidenceParts[0], Font.boldMonospacedSystemFont(incidenceFontsize), UI.getIncidenceColor(incidence), 1, 1)
        if (typeof incidenceParts[1] !== "undefined") {
            ib.text(',' + incidenceParts[1], Font.boldMonospacedSystemFont(18), UI.getIncidenceColor(incidence), 1, 1)
        }
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getAvg(0), ENV.cache[cacheID].getAvg(1))
        let trendColor = (trendArrow === '↑') ? Theme.getColor(ENV.incidenceColors.red.color, true) : (trendArrow === '↓') ? Theme.getColor(ENV.incidenceColors.green.color, true) : Theme.getColor(ENV.incidenceColors.gray.color, true)
        ib.text(trendArrow, Font.boldRoundedSystemFont(18), trendColor, 1, 0.9)

        if (ENV.isMediumWidget) {
            b.space(5)
            UIComp.areaIcon(b, ENV.cache[cacheID].meta.IBZ)
            b.space(3)
            let areaName = ENV.cache[cacheID].meta.GEN
            let cacheIndex = parseInt(cacheID.replace('s', ''))
            if (typeof ENV.staticCoordinates[cacheIndex] !== 'undefined' && ENV.staticCoordinates[cacheIndex].name !== false) {
                areaName = ENV.staticCoordinates[cacheIndex].name
            }
            b.text(areaName.toUpperCase(), ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 1)
        }
        b.space()

        let b2 = new UI(b).stack('v', [2, 0, 0, 0], false, false, false, [58, 30])
        let graphImg
        if (CFG.graphShowValues === 'i') {
           graphImg = UI.generateIcidenceGraph(ENV.cache[cacheID], 58, 16, false).getImage()
        } else {
           graphImg = UI.generateGraph(ENV.cache[cacheID], 58, 16, false).getImage()
        }
        b2.image(graphImg)

        let bb2 = new UI(b2).stack('h')
        bb2.space()
        bb2.text('+' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, Theme.getColor('graphTextColor', true), 1, 1)
        bb2.space(0)
    }
    static statisticsRow(view, cacheID) {
        const data = ENV.cache[cacheID];

        let b = new UI(view).stack('h', [4,0,4,0])
        b.elem.centerAlignContent()
        b.space()
        b.text("Diff. ", ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        const dayLastWeek = Format.dateStr(data.getDay(7).date, false);
        b.text(` ${dayLastWeek} `, ENV.fonts.xsmall, Theme.getColor('dateTextColor2', true), 1, 0.9)

        let diffDay = 0
        if (data.getDay(0).cases > 0) {
            diffDay = (data.getDay(0).incidence / data.getDay(7).incidence * 100) - 100;
            if (diffDay > 0) {
                b.text("+", ENV.fonts.medium, Theme.getColor(ENV.incidenceColors.red.color, true), 1, 0.9)
            } else if (diffDay < 0) {
                b.text("-", ENV.fonts.medium, Theme.getColor(ENV.incidenceColors.green.color, true), 1, 0.9)
            }
        }

        b.text( Format.number(Math.abs(diffDay), 2), ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.text( '% ', ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)

        b.text(` WOCHE Ø `, ENV.fonts.xsmall, Theme.getColor('dateTextColor2', true), 1, 0.9)
        const diffWeek = (data.getAvg(0) / data.getAvg(1) * 100) - 100;
        if (diffWeek > 0) {
            b.text("+", ENV.fonts.medium, Theme.getColor(ENV.incidenceColors.red.color, true), 1, 0.9)
        } else if (diffWeek < 0) {
            b.text("-", ENV.fonts.medium, Theme.getColor(ENV.incidenceColors.green.color, true), 1, 0.9)
        }

        b.text( Format.number(Math.abs(diffWeek), 2) + '%', ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.space()
        view.space()
    }
    static vaccineRow (view, cacheID) {

        let b = new UI(view).stack('h', [4,0,4,0])
        b.elem.centerAlignContent()
        b.space()
        b.text("💉", ENV.fonts.normal, false, 1, 0.9)

        if (ENV.cache.vaccine.meta.status !== ENV.status.error) {
            // state data
            const blId = ENV.cache[cacheID].meta.BL_ID.toString().padStart(2, '0');
            let stateData = ENV.cache.vaccine.data.data.filter(state => {
                return state.rs === blId
            });
            stateData = stateData.pop();

            // let name = (typeof ENV.cache[cacheID].meta.BL_ID !== 'undefined') ? ENV.statesAbbr[ENV.cache[cacheID].meta.BL_ID] : cacheID
            // b.text(name + "", ENV.fonts.medium, Theme.getColor('titleRowTextColor2'), 1, 0.9)
            b.text(" ② ", ENV.fonts.normal, Theme.getColor('dateTextColor2', true), 1, 0.9)
            b.text(Format.number(stateData.fullyVaccinated.quote, 1) + '%', ENV.fonts.normal, Theme.getColor('titleRowTextColor2'), 1, 1)
            b.text(' ③ ', ENV.fonts.normal, Theme.getColor('dateTextColor2', true), 1, 0.9)
            b.text(Format.number(stateData.boosterVaccinated.quote, 1) + '%', ENV.fonts.normal, Theme.getColor('titleRowTextColor2'), 1, 1)   
            b.space(4)
            
            // country data
            let countryData = ENV.cache.vaccine.data.data.filter(state => {
                return state.name === "Deutschland"
            });
            countryData = countryData.pop();

            b.text("[ D:", ENV.fonts.normal, Theme.getColor('dateTextColor2'), 1, 0.9)
            b.text(" ② ", ENV.fonts.normal, Theme.getColor('dateTextColor2', true), 1, 0.9)
            b.text(Format.number(countryData.fullyVaccinated.quote, 1) + '%', ENV.fonts.normal, Theme.getColor('dateTextColor2'), 1, 0.9)
            b.text(" ]", ENV.fonts.normal, Theme.getColor('dateTextColor2'), 1, 0.9)
            b.space(4)
            let dateTS = new Date(ENV.cache.vaccine.data.lastUpdate).getTime()
            let date = Format.dateStr(dateTS)
            date = date.replace('.2021', '');
            b.text('('+ date +')', ENV.fonts.xsmall, Theme.getColor('dateTextColor2', true), 1, 1)
        } else {
            b.text('Impfquoten aktuell nicht verfügbar.', ENV.fonts.normal, Theme.getColor('titleRowTextColor2'), 1, 1);
        }
        b.space()
        view.space()
    }
    static hospitalizationRow (view, cacheID) {
        const stateId = ENV.cache[cacheID].meta.BL_ID;
        const stateName = ENV.statesAbbr[stateId]
        
        let b = new UI(view).stack('h', [4,0,4,0])
        b.elem.centerAlignContent()
        b.space()
        
        const stateHospitalizationData = ENV.cache.hospitalization.data[parseInt(stateId)];
        const stateHospitalizedIncidence = stateHospitalizationData.hospitalization['7daysIncidence'];
        const stateHospitalized = Format.number(stateHospitalizationData.hospitalization['7daysCases'], 0);
        const stateHospitalizedStatus = UI.getHospitalizationStatus(stateHospitalizedIncidence);
        b.text('🏥 ', ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.image(stateHospitalizedStatus, 0.9)
        b.text(' '+Format.number(stateHospitalizedIncidence, 2), ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.text(' (' + stateHospitalized + ')', ENV.fonts.small, Theme.getColor('dateTextColor2', true), 1, 0.9)
        b.space(4)

        const hospitalizationData = ENV.cache.hospitalization.data[0];
        const hospitalizedIncidence = hospitalizationData.hospitalization['7daysIncidence'];
        const hospitalized = Format.number(hospitalizationData.hospitalization['7daysCases'], 0);
        const hospitalizedStatus = UI.getHospitalizationStatus(hospitalizedIncidence);
        b.text("[ D: ", ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.image(hospitalizedStatus, 0.9)
        b.text(' '+Format.number(hospitalizedIncidence, 2), ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.text(' (' + hospitalized + ')', ENV.fonts.small, Theme.getColor('dateTextColor2', true), 1, 0.9)
        b.text(" ] ", ENV.fonts.medium, Theme.getColor('titleRowTextColor'), 1, 0.9)
        b.space()
        view.space()
    }
    static smallIncidenceBlock(view, cacheID, options = {}) {
        let b = new UI(view).stack('v', false, Theme.getColor('stackBackgroundColorSmall', true), 12)
        let b2 = new UI(b).stack('h', [4, 0, 0, 5])
        b2.space()
        let incidence = ENV.cache[cacheID].getDay().incidence
        b2.text(Format.number(incidence, 1, 'n/v', 100), ENV.fonts.small2, UI.getIncidenceColor(incidence), 1, 1)
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getAvg(0), ENV.cache[cacheID].getAvg(1))
        let trendColor = (trendArrow === '↑') ? Theme.getColor(ENV.incidenceColors.red.color, true) : (trendArrow === '↓') ? Theme.getColor(ENV.incidenceColors.green.color, true) : Theme.getColor(ENV.incidenceColors.gray.color, true)
        b2.text(trendArrow, ENV.fonts.small2, trendColor, 1, 1)
        let name = (typeof ENV.cache[cacheID].meta.BL_ID !== 'undefined') ? ENV.statesAbbr[ENV.cache[cacheID].meta.BL_ID] : cacheID
        b2.text(name.toUpperCase(), ENV.fonts.small2, Theme.getColor('smallNameTextColor', true), 1, 1)

        let b3 = new UI(b).stack('h', [0, 0, 0, 5])
        b3.space()
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        let graphImg
        if (CFG.graphShowValues === 'i') {
           graphImg = UI.generateIcidenceGraph(ENV.cache[cacheID], 58, 8, false).getImage()
        } else {
           graphImg = UI.generateGraph(ENV.cache[cacheID], 58, 8, false).getImage()
        }
        b3.image(graphImg, 0.9)

        let b4 = new UI(b).stack('h', [0, 0, 1, 5])
        b4.space()
        if (CFG.showDataInBlocks === 'hospitalization' && ENV.cache.hospitalization) {
            UIComp.hospitalizationIcon(b4, cacheID, 8, 8);
        }
        b4.text(' +' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, Theme.getColor('graphTextColor', true), 1, 0.9)
        b.space(2)
    }

    static smallIncidenceRow(view, cacheID, bgColor = 'stackBackgroundColorSmall') {
        let r = new UI(view).stack('h', false, Theme.getColor(bgColor, true), 12)
        let b = new UI(r).stack('v')

        let bb2 = new UI(b).stack('h', [2, 0, 0, 6])
        bb2.space()
        let incidence = ENV.cache[cacheID].getDay().incidence
        bb2.text(Format.number(incidence, 1, 'n/v', 100), ENV.fonts.normal, UI.getIncidenceColor(incidence), 1 ,1)
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getAvg(0), ENV.cache[cacheID].getAvg(1))
        let trendColor = (trendArrow === '↑') ? Theme.getColor(ENV.incidenceColors.red.color, true) : (trendArrow === '↓') ? Theme.getColor(ENV.incidenceColors.green.color, true) : Theme.getColor(ENV.incidenceColors.gray.color, true)
        bb2.text(trendArrow, ENV.fonts.normal, trendColor)
        bb2.space(2)
        let name = (typeof ENV.cache[cacheID].meta.BL_ID !== 'undefined') ? ENV.statesAbbr[ENV.cache[cacheID].meta.BL_ID] : cacheID
        bb2.text(name.toUpperCase(), ENV.fonts.normal, Theme.getColor('smallNameTextColor', true))

        let b3 = new UI(b).stack('h', [0, 0, 2, 6])
        b3.space()
        if (CFG.showDataInBlocks === 'vaccine' && ENV.cache.vaccine) {
            UIComp.vaccineInfo(b3, cacheID);
        } else if (CFG.showDataInBlocks === 'hospitalization' && ENV.cache.hospitalization) {
            UIComp.hospitalizationInfo(b3, cacheID);
        }
        

        let b2 = new UI(r).stack('v', false, false, false, false, [60, 30])
        let b2b2 = new UI(b2).stack('h', [0, 0, 0, 6])
        b2b2.space()
        let graphImg
        if (CFG.graphShowValues == 'i') {   
          graphImg = UI.generateIcidenceGraph(ENV.cache[cacheID], 58, 10, false).getImage()
        } else {
          graphImg = UI.generateGraph(ENV.cache[cacheID], 58, 10, false).getImage()
        }
        b2b2.image(graphImg, 0.9)

        let b2b3 = new UI(b2).stack('h', [0, 0, 0, 0])
        b2b3.space()
        b2b3.text('+' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, Theme.getColor('graphTextColor', true), 1, 0.9)

        r.space(6)
    }
    static vaccineInfo(view, cacheID) {
        // state data
        let b3Text = ' ';
        let quote = 'n/v'
        if (ENV.cache.vaccine.meta.status !== ENV.status.error) {
            let vaccineData = ENV.cache.vaccine.data.data.filter(state => {
                if (cacheID !== 'd') {
                    const blId = ENV.cache[cacheID].meta.BL_ID.toString().padStart(2, '0');
                    return state.rs === blId
                } else {
                    return state.name === "Deutschland"
                }
            });
            vaccineData = vaccineData.pop();
            quote = vaccineData.fullyVaccinated.quote;
        }
        b3Text = '💉² ' + Format.number(quote, 1, 'n/v ')
        view.text(b3Text, ENV.fonts.xsmall, Theme.getColor('graphTextColor', true), 1, 0.9)
    }
    static hospitalizationInfo(view, cacheID) {
        let b3Text = ' ';
        let stateId = 0;
        if (cacheID !== 'd') {
            stateId = ENV.cache[cacheID].meta.BL_ID;
        }
        const stateHospitalizationData = ENV.cache.hospitalization.data[parseInt(stateId)];
        const stateHospitalizedIncidence = stateHospitalizationData.hospitalization['7daysIncidence'];
        const stateHospitalizedStatus = UI.getHospitalizationStatus(stateHospitalizedIncidence);

        b3Text += Format.number(stateHospitalizedIncidence, 2) + ' ';
        view.text(b3Text, ENV.fonts.xsmall, Theme.getColor('graphTextColor', true), 1, 0.9)
        view.image(stateHospitalizedStatus, 0.9)
    }
    static hospitalizationIcon(view, cacheID, width, height) {
        let stateId = 0;
        if (cacheID !== 'd') {
            stateId = ENV.cache[cacheID].meta.BL_ID;
        }

        const stateHospitalizationData = ENV.cache.hospitalization.data[parseInt(stateId)];
        const stateHospitalizedIncidence = stateHospitalizationData.hospitalization['7daysIncidence'];
        const stateHospitalizedStatus = UI.getHospitalizationStatus(stateHospitalizedIncidence, width, height);
        view.image(stateHospitalizedStatus, 0.9)
    }
    static areaIcon(view, ibzID) {
        let b = new UI(view).stack('h', [1, 3, 1, 3], Theme.getColor('areaIconBackgroundColor', true), 2, 2)
        b.text(ENV.areaIBZ[ibzID], ENV.fonts.xsmall, Theme.getColor('titleRowTextColor'), 1, 1)
    }
    static statusBlock(view, status) {
        let icon
        let iconText
        switch (status) {
            case ENV.status.offline:
                icon = '⚡️'
                iconText = 'Offline'
                break;
            case ENV.status.nogps:
                icon = '📡'
                iconText = 'GPS?'
                break;
        }
        if (icon && iconText) {
            let topStatusStack = new UI(view).stack('v')
            topStatusStack.text(icon, ENV.fonts.small)
        }
    }
}
class UI {
    constructor(view) {
        if (view instanceof UI) {
            this.view = this.elem = view.elem
        } else {
            this.view = this.elem = view
        }
    }
    static generateGraph(data, width, height, alignLeft = true) {
        let graphData = data.data.slice(Math.max(data.data.length - CFG.graphShowDays, 1));
        let context = new DrawContext()
        context.size = new Size(width, height)
        context.opaque = false
        context.respectScreenScale = true
        let max = Math.max.apply(Math, graphData.map(function (o) { return o.cases; }))
        max = (max <= 0) ? 10 : max;
        let w = Math.max(2, Math.round((width - (graphData.length * 2)) / graphData.length))
        let xOffset = (!alignLeft) ? (width - (graphData.length * (w + 1))) : 0
        for (let i = 0; i < CFG.graphShowDays; i++) {
            let item = graphData[i]
            let value = parseFloat(item.cases)
            if (value === -1 && i == 0) value = 10;
            let h = Math.max(2, (Math.abs(value) / max) * height)
            let x = xOffset + (w + 1) * i
            let rect = new Rect(x, height - h, w, h)
            context.setFillColor(UI.getIncidenceColor((item.cases >= 1) ? item.incidence : 0))
            context.fillRect(rect)
        }
        return context
    }
    static generateIcidenceGraph(data, width, height, alignLeft = true) {
        let graphData = data.data.slice(Math.max(data.data.length - CFG.graphShowDays, 1));
        let context = new DrawContext()
        context.size = new Size(width, height)
        context.opaque = false
        context.respectScreenScale = true
        let max = Math.max.apply(Math, graphData.map(function (o) { return o.incidence; }))
        let min = Math.min.apply(Math, graphData.map(function (o) { return o.incidence; })) / 1.2
        max = (max <= 0) ? 10 : max - min;
        let w = Math.max(2, Math.round((width - (graphData.length * 2)) / graphData.length))
        let xOffset = (!alignLeft) ? (width - (graphData.length * (w + 1))) : 0
        for (let i = 0; i < CFG.graphShowDays; i++) {
            let item = graphData[i]
            let value = parseFloat(item.incidence) - min
            if (value === -1 && i == 0) value = 10;
            let h = Math.max(2,(Math.abs(value) / max) * (height - 1))
            let x = xOffset + (w + 1) * i
            let rect = new Rect(x, height - h - 1, w, h)
            context.setFillColor(UI.getIncidenceColor((item.cases >= 0) ? item.incidence : 0))
            context.fillRect(rect)
        }
        return context
    }
    stack(type = 'h', padding = false, borderBgColor = false, radius = false, borderWidth = false, size = false) {
        this.elem = this.view.addStack()
        if (radius) this.elem.cornerRadius = radius
        if (borderWidth !== false) {
            this.elem.borderWidth = borderWidth
            this.elem.borderColor = borderBgColor
        } else if (borderBgColor) {
            this.elem.backgroundColor = borderBgColor
        }
        if (padding) this.elem.setPadding(...padding)
        if (size) this.elem.size = new Size(size[0], size[1])
        if (type === 'h') { this.elem.layoutHorizontally() } else { this.elem.layoutVertically() }
        this.elem.centerAlignContent()
        return this
    }
    text(text, font = false, color = false, maxLines = 0, minScale = 0.9) {
        let t = this.elem.addText(text)
        if (color) t.textColor = (typeof color === 'string') ? new Color(color) : color
        t.font = (font) ? font : ENV.fonts.normal
        t.lineLimit = (maxLines > 0 && minScale < 1) ? maxLines + 1 : maxLines
        t.minimumScaleFactor = minScale
        return this
    }
    image(image, imageOpacity = 1.0) {
        let i = this.elem.addImage(image)
        i.resizable = false
        i.imageOpacity = imageOpacity
    }
    space(size) {
        this.elem.addSpacer(size)
        return this
    }
    static getTrendUpArrow(now, prev) {
        if (now < 0 && prev < 0) {
            now = Math.abs(now)
            prev = Math.abs(prev)
        }
        return (now < prev) ? '↗' : (now > prev) ? '↑' : '→'
    }
    static getTrendArrow(value1, value2) {
        return (value1 < value2) ? '↓' : (value1 > value2) ? '↑' : '→'
    }
    static getTrendColor(value1, value2, altColorUp = null, altColorDown = null) {
        let colorUp = (altColorUp) ? new Color(altColorUp) : Theme.getColor(ENV.incidenceColors.red.color, true)
        let colorDown = (altColorDown) ? new Color(altColorDown) : Theme.getColor(ENV.incidenceColors.green.color, true)
        return (value1 < value2) ? colorDown : (value1 > value2) ? colorUp : Theme.getColor(ENV.incidenceColors.gray.color, true)
    }
    static getIncidenceColor(incidence) {
        let color = Theme.getColor(ENV.incidenceColors.green.color, true)
        if (incidence >= ENV.incidenceColors.lila.limit) {
            color = Theme.getColor(ENV.incidenceColors.lila.color, true)
        } else if (incidence >= ENV.incidenceColors.pink.limit) {
            color = Theme.getColor(ENV.incidenceColors.pink.color, true)
        } else if (incidence >= ENV.incidenceColors.darkdarkred.limit) {
            color = Theme.getColor(ENV.incidenceColors.darkdarkred.color, true)
        } else if (incidence >= ENV.incidenceColors.darkred.limit) {
            color = Theme.getColor(ENV.incidenceColors.darkred.color, true)
        } else if (incidence >= ENV.incidenceColors.red.limit) {
            color = Theme.getColor(ENV.incidenceColors.red.color, true)
        } else if (incidence >= ENV.incidenceColors.orange.limit) {
            color = Theme.getColor(ENV.incidenceColors.orange.color, true)
        } else if (incidence >= ENV.incidenceColors.yellow.limit) {
            color = Theme.getColor(ENV.incidenceColors.yellow.color, true)
        }
        return color
    }
    static getHospitalizationStatus(hospitalizedIncidence, width = 10, height = 10) {
        let context = new DrawContext()
        context.size = new Size(width, height)
        context.opaque = false
        context.respectScreenScale = true
 
        if (hospitalizedIncidence >= ENV.hospitalizedIncidenceLimits.red.limit) {
            context.setFillColor(Theme.getColor(ENV.hospitalizedIncidenceLimits.red.color, true))
        } else if (hospitalizedIncidence >= ENV.hospitalizedIncidenceLimits.orange.limit) {
            context.setFillColor(Theme.getColor(ENV.hospitalizedIncidenceLimits.orange.color, true))
        } else if (hospitalizedIncidence >= ENV.hospitalizedIncidenceLimits.yellow.limit) {
            context.setFillColor(Theme.getColor(ENV.hospitalizedIncidenceLimits.yellow.color, true))
        } else {
            context.setFillColor(Theme.getColor(ENV.hospitalizedIncidenceLimits.green.color, true))
        }
        let rect = new Rect(0, 0, width, height)
        context.fillEllipse(rect)

        return context.getImage()
    }
}

class DataResponse {
    constructor(data, status = ENV.status.ok) {
        this.data = data
        this.status = status
    }
}

class CustomFilemanager {
    constructor() {
        try {
            this.fm = FileManager.iCloud()
            this.fm.documentsDirectory()
        } catch (e) {
            this.fm = FileManager.local()
        }
        this.configDirectory = 'coronaWidgetNext'
        this.configPath = this.fm.joinPath(this.fm.documentsDirectory(), '/' + this.configDirectory)
        if (!this.fm.isDirectory(this.configPath)) this.fm.createDirectory(this.configPath)
    }
    async copy(oldFilename, newFilename) {
        let oldPath = this.fm.joinPath(this.configPath, oldFilename);
        let newPath = this.fm.joinPath(this.configPath, newFilename);
        this.fm.copy(oldPath, newPath)
    }
    async save(data, filename = '') {
        let path
        let dataStr
        if (filename === '') {
            path = this.fm.joinPath(this.configPath, 'coronaWidget_' + data.dataId + '.json');
            dataStr = JSON.stringify(data);
        } else {
            path = this.fm.joinPath(this.fm.documentsDirectory(), filename);
            dataStr = data;
        }
        this.fm.writeString(path, dataStr);
    }
    async read(filename) {
        let path = this.fm.joinPath(this.configPath, filename + '.json');
        let type = 'json'
        if (filename.includes('.')) {
            path = this.fm.joinPath(this.fm.documentsDirectory(), filename);
            type = 'string'
        }
        if (this.fm.isFileStoredIniCloud(path) && !this.fm.isFileDownloaded(path)) await this.fm.downloadFileFromiCloud(path);
        if (this.fm.fileExists(path)) {
            try {
                let resStr = await this.fm.readString(path)
                let res = (type === 'json') ? JSON.parse(resStr) : resStr
                return new DataResponse(res);
            } catch (e) {
                console.error(e)
                return new DataResponse('', ENV.status.error);
            }
        }
        return new DataResponse('', ENV.status.notfound);
    }
}

class Data {
    constructor(dataId, data = {}, meta = {}) {
        this.dataId = dataId
        this.data = data
        this.meta = meta
    }
    getDay (dayOffset = 0) {
        return (typeof this.data[this.data.length - 1 - dayOffset] !== 'undefined') ? this.data[this.data.length - 1 - dayOffset] : false;
    }
    getAvg (weekOffset = 0, ignoreToday = false) {
        let casesData = [...this.data].reverse()
        let skipToday = (ignoreToday) ? 1 : 0;
        const offsetDays = 7
        const weekData = casesData.slice((offsetDays * weekOffset) + skipToday, (offsetDays * weekOffset) + 7 + skipToday)
        const avg = weekData.reduce((a, b) => a + b.incidence, 0) / offsetDays
        return avg
    }
    static completeHistory (data) {
        const completeDataObj = {}
        for(let i = 0; i <= CFG.graphShowDays + 8; i++) {
            let lastDate = new Date()
            let prevDate = lastDate.setDate(lastDate.getDate() - i);
            completeDataObj[Format.dateStr(prevDate)] = { cases: 0, date: prevDate }
        }
        data.map((value) => {
            let curDate = Format.dateStr(value.date)
            completeDataObj[curDate].cases = value.cases
        })
        let completeData = Object.values(completeDataObj)
        completeData.sort((a, b) => { return a.date - b.date; })
        return completeData.reverse();
    }
    static async tryLoadFromCache(cacheID, useStaticCoordsIndex) {
        const dataResponse = await cfm.read(cfm.configDirectory + '/coronaWidget_config.json')
        if (dataResponse.status !== ENV.status.ok) return ENV.status.error
        const cacheIDs = JSON.parse(dataResponse.data)
        if (typeof cacheIDs[cacheID] === 'undefined') return ENV.status.error
        const dataIds = cacheIDs[cacheID]
        if (typeof dataIds['dataIndex' + useStaticCoordsIndex] !== 'undefined') {
            const areaData = await cfm.read('coronaWidget_' + dataIds['dataIndex' + useStaticCoordsIndex])
            if (!areaData.data.data) return ENV.status.error
            const area = new Data(dataIds['dataIndex' + useStaticCoordsIndex], areaData.data.data, areaData.data.meta)
            ENV.cache['s' + useStaticCoordsIndex] = area

            const stateData = await cfm.read('coronaWidget_' + areaData.data.meta.BL_ID)
            if (!stateData.data.data) return ENV.status.error
            const state = new Data(areaData.data.meta.BL_ID, stateData.data.data, stateData.data.meta)
            ENV.cache[areaData.data.meta.BL_ID] = state

            const dData = await cfm.read('coronaWidget_d')
            if (!dData.data.data) return ENV.status.error
            const d = new Data('d', dData.data.data, dData.data.meta)
            ENV.cache.d = d

            const vaccineData = await cfm.read('coronaWidget_vaccine')
            if (!vaccineData.data.data) return ENV.status.error
            const vaccine = new Data('vaccine', vaccineData.data.data, vaccineData.data.meta)
            ENV.cache.vaccine = vaccine

            const hospitalizationData = await cfm.read('coronaWidget_hospitalization')
            if (!hospitalizationData.data.data) return ENV.status.error
            const hospitalization = new Data('hospitalization', hospitalizationData.data.data, hospitalizationData.data.meta)
            ENV.cache.hospitalization = hospitalization

            return ENV.status.ok
        }
        return ENV.status.error
    }
    static async load(useStaticCoordsIndex = false) {
        if (typeof ENV.cache['s' + useStaticCoordsIndex] !== 'undefined') return true

        let configId = btoa('cID' + JSON.stringify(ENV.staticCoordinates).replace(/[^a-zA-Z ]/g, ""))
        const location = await Helper.getLocation(useStaticCoordsIndex)
        if (!location) {
            const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
            return (status === ENV.status.ok) ? ENV.status.nogps : ENV.status.error
        }
        const locationData = await rkiRequest.locationData(location)
        if (!locationData) {
            const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
            return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
        }

        let areaCases = await rkiRequest.areaCases(locationData.RS)
        if (!areaCases) {
            const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
            return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
        }
        await Data.geoCache(configId, useStaticCoordsIndex, locationData.RS)

        let areaData = new Data(locationData.RS)
        areaData.data = areaCases
        areaData.meta = locationData
        await cfm.save(areaData)
        ENV.cache['s' + useStaticCoordsIndex] = areaData

        // STATE DATA
        if (typeof ENV.cache[locationData.BL_ID] === 'undefined') {
            let stateCases = await rkiRequest.stateCases(locationData.BL_ID)
            if (!stateCases) {
                const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
                return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
            }
            let stateData = new Data(locationData.BL_ID)
            stateData.data = stateCases
            stateData.meta = {
                BL_ID: locationData.BL_ID,
                BL: locationData.BL,
                EWZ: locationData.EWZ_BL
            }
            await cfm.save(stateData)
            ENV.cache[locationData.BL_ID] = stateData
        }

        // GER DATA
        if (typeof ENV.cache.d === 'undefined') {
            let dCases = await rkiRequest.dCases()
            if (!dCases) {
                const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
                return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
            }
            let dData = new Data('d')
            dData.data = dCases
            dData.meta = {
                r: await rkiRequest.rvalue(),
                EWZ: 83.02 * 1000000 // @TODO real number?
            }
            await cfm.save(dData)
            ENV.cache.d = dData
        }

        // VACCINE DATA
        if (typeof ENV.cache.vaccine === 'undefined') {
            let vaccineValues = await rkiRequest.vaccinevalues()
            if (!vaccineValues) {
                const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
                return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
            }
            let vaccineData = new Data('vaccine')
            if (typeof vaccineValues.lastUpdate === 'undefined') {
                vaccineData.meta.status = ENV.status.error;
            }
            vaccineData.data = vaccineValues
            vaccineData.meta.lastUpdate = vaccineValues.lastUpdate
            await cfm.save(vaccineData)
            ENV.cache.vaccine = vaccineData
        }

        // HOSPITALIZATION DATA
        if (typeof ENV.cache.hospitalization === 'undefined') {
            let hospitalizationValues = await rkiRequest.hospitalizationvalues()
            if (!hospitalizationValues) {
                const status = await Data.tryLoadFromCache(configId, useStaticCoordsIndex)
                return (status === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
            }
            let hospitalizationData = new Data('hospitalization')
            hospitalizationData.data = hospitalizationValues
            hospitalizationData.meta.lastUpdate = hospitalizationValues.lastUpdate
            await cfm.save(hospitalizationData)
            ENV.cache.hospitalization = hospitalizationData
        }

        if (typeof ENV.cache['s' + useStaticCoordsIndex] !== 'undefined' && typeof ENV.cache[locationData.BL_ID] !== 'undefined' && typeof ENV.cache.d !== 'undefined') {
            return ENV.status.ok
        }
        return ENV.status.error
    }
    static async geoCache(configId, dataIndex, rsid) {
        let data = {}
        let dataResponse = await cfm.read(cfm.configDirectory + '/coronaWidget_config.json')
        if (dataResponse.status === ENV.status.ok) data = JSON.parse(dataResponse.data)
        if (typeof data[configId] === 'undefined') data[configId] = {}
        data[configId]['dataIndex' + dataIndex] = rsid
        await cfm.save(JSON.stringify(data), cfm.configDirectory + '/coronaWidget_config.json')
    }
}

class Format {
    static dateStr(timestamp, showYear = true) {
        let date = new Date(timestamp)
        let dateStr = `${('' + date.getDate()).padStart(2, '0')}.${('' + (date.getMonth() + 1)).padStart(2, '0')}`
        if (showYear) dateStr += `.${date.getFullYear()}`
        return dateStr
    }
    static number(number, fractionDigits = 0, placeholder = null, limit = false) {
        number = Number(number)
        if (!!placeholder && isNaN(number)) return placeholder
        if (limit !== false && Math.round(number) >= limit) fractionDigits = 0
        return Number(number).toLocaleString('de-DE', { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits })
    }
    static timestamp(dateStr) {
        const regex = /([\d]+)\.([\d]+)\.([\d]+),\ ([0-2]?[0-9]):([0-5][0-9])/g;
        let m = regex.exec(dateStr)
        return new Date(m[3], m[2] - 1, m[1], m[4], m[5]).getTime()
    }
    static rValue(data) {
        const parsedData = Parse.rCSV(data)
        let r = 0
        if (parsedData.length === 0) return r
        let availeRvalueField
        Object.keys(parsedData[0]).forEach(key => {
            CFG.csvRvalueFields.forEach(possibleRKey => {
                if (key === possibleRKey) availeRvalueField = possibleRKey;
            })
        });
        let firstDatefield = Object.keys(parsedData[0])[0];
        if (availeRvalueField) {
            parsedData.forEach(item => {
                if (item[firstDatefield].includes('-') && typeof item[availeRvalueField] !== 'undefined' && parseFloat(item[availeRvalueField].replace(',', '.')) > 0) {
                    r = item;
                }
            })
        }
        return (r) ? parseFloat(r[availeRvalueField].replace(',', '.')) : r
    }
}

class RkiRequest {
    async locationData(location) {
        const outputFields = 'GEN,RS,EWZ,EWZ_BL,BL_ID,cases,cases_per_100k,cases7_per_100k,cases7_bl_per_100k,last_update,BL,IBZ';
        const url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=${outputFields}&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`
        const response = await this.exec(url)
        return (response.status === ENV.status.ok) ? response.data.features[0].attributes : false
    }
    async areaCases(areaID) {
        const apiStartDate = Helper.getDateBefore(CFG.graphShowDays + 7)
        const newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1,-1)%20AND%20IdLandkreis%3D${areaID}&objectIds&time&resultType=standard&outFields&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields&groupByFieldsForStatistics&outStatistics=%5B%7B%22statisticType%22:%22sum%22,%22onStatisticField%22:%22AnzahlFall%22,%22outStatisticFieldName%22:%22cases%22%7D,%20%7B%22statisticType%22:%22max%22,%22onStatisticField%22:%22MeldeDatum%22,%22outStatisticFieldName%22:%22date%22%7D%5D&having&resultOffset&resultRecordCount&sqlFormat=none&token`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${areaID}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=MeldeDatum&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async stateCases(blID) {
        const apiStartDate = Helper.getDateBefore(CFG.graphShowDays + 7)
        const newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1,%20-1)%20AND%20IdBundesland%3D${blID}&objectIds&time&resultType=standard&outFields&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields&groupByFieldsForStatistics&outStatistics=%5B%7B%22statisticType%22:%22sum%22,%22onStatisticField%22:%22AnzahlFall%22,%22outStatisticFieldName%22:%22cases%22%7D,%20%7B%22statisticType%22:%22max%22,%22onStatisticField%22:%22MeldeDatum%22,%22outStatisticFieldName%22:%22date%22%7D%5D&having&resultOffset&resultRecordCount&sqlFormat=none&token`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdBundesland=${blID}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=MeldeDatum&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async dCases() {
        const apiStartDate = Helper.getDateBefore(CFG.graphShowDays + 7)
        const newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1,%20-1)&returnGeometry=false&geometry=42.000,12.000&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&outStatistics=%5B%7B%22statisticType%22:%22sum%22,%22onStatisticField%22:%22AnzahlFall%22,%22outStatisticFieldName%22:%22cases%22%7D,%20%7B%22statisticType%22:%22max%22,%22onStatisticField%22:%22MeldeDatum%22,%22outStatisticFieldName%22:%22date%22%7D%5D&resultType=standard&cacheHint=true`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=MeldeDatum&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async rvalue() {
        const url = `https://raw.githubusercontent.com/robert-koch-institut/SARS-CoV-2-Nowcasting_und_-R-Schaetzung/main/Nowcast_R_aktuell.csv`
        const response = await this.exec(url, false)
        return (response.status === ENV.status.ok) ? Format.rValue(response.data) : false
    }
    async vaccinevalues () {
        const url = `https://rki-vaccination-data.vercel.app/api/v2`
        const response = await this.exec(url)
        return (response.status === ENV.status.ok) ? response.data : false
    }
    async hospitalizationvalues () {
        const url = `https://corona-widget-api.vercel.app/api/hospitalization`
        const response = await this.exec(url)
        return (response.status === ENV.status.ok) ? response.data : false
    }
    async getCases(urlToday, urlHistory) {
        const responseToday = await this.exec(urlToday)
        const responseHistory = await this.exec(urlHistory)
        if (responseToday.status === ENV.status.ok && responseHistory.status === ENV.status.ok) {
            let data = responseHistory.data.features.map(day => { return { cases: day.attributes.cases, date: day.attributes.MeldeDatum } })
            if (data.length === 0) return false;
            let todayCases = responseToday.data.features.reduce((a, b) => a + b.attributes.cases, 0)
            let lastDateHistory = Math.max(...responseHistory.data.features.map(a => a.attributes.MeldeDatum))
            let lastDateToday = Math.max(...responseToday.data.features.map(a => a.attributes.date))
            let lastDate = lastDateHistory;
            if (!!lastDateToday || new Date(lastDateToday).setHours(0, 0, 0, 0) <= new Date(lastDateHistory).setHours(0, 0, 0, 0)) {
                let lastReportDate = new Date(lastDateHistory)
                lastDate = lastReportDate.setDate(lastReportDate.getDate() + 1);
            }
            data.push({ cases: todayCases, date: lastDate })
            data = Data.completeHistory(data)
            return data;
        }
        return false;
    }
    async exec(url, isJson = true) {
        try {
            const resData = new Request(url)
            resData.timeoutInterval = 60
            let data = {}
            let status = ENV.status.ok
            if (isJson) {
                data = await resData.loadJSON()
            } else {
                data = await resData.loadString()
            }
            status = this.checkStatus(data, isJson)
            return new DataResponse(data, status)
        } catch (e) {
            console.warn(e)
            return new DataResponse({}, ENV.status.notfound)
        }
    }
    checkStatus (data, isJson) {
        if (typeof data.length === '') return ENV.status.notfound
        if (isJson && typeof data.error !== 'undefined') return ENV.status.notfound
        return ENV.status.ok
    }
}

class Parse {
    static input(input) {
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
    static rCSV(rDataStr) {
        let lines = rDataStr.split(/(?:\r\n|\n)+/).filter(function (el) { return el.length != 0 })
        let headers = lines[0].split(",");
        let elements = []
        for (let i = 1; i < lines.length; i++) {
            let element = {};
            let values = lines[i].split(',')
            element = values.reduce(function (result, field, index) {
                result[headers[index]] = field;
                return result;
            }, {})
            elements.push(element)
        }
        return elements
    }
}

class Helper {
    static getIncidenceLimits(incidence) {
        if (incidence >= ENV.incidenceColors.green.limit && incidence < ENV.incidenceColors.yellow.limit) {
            return { min: ENV.incidenceColors.green.limit, max: ENV.incidenceColors.yellow.limit }
        } else if (incidence >= ENV.incidenceColors.yellow.limit && incidence < ENV.incidenceColors.orange.limit) {
            return { min: ENV.incidenceColors.red.limit, max: ENV.incidenceColors.darkred.limit }
        } else if (incidence >= ENV.incidenceColors.orange.limit && incidence < ENV.incidenceColors.red.limit) {
            return { min: ENV.incidenceColors.red.limit, max: ENV.incidenceColors.darkred.limit }
        } else if (incidence >= ENV.incidenceColors.red.limit && incidence < ENV.incidenceColors.darkred.limit) {
            return { min: ENV.incidenceColors.red.limit, max: ENV.incidenceColors.darkred.limit }
        } else if (incidence >= ENV.incidenceColors.darkred.limit && incidence < ENV.incidenceColors.darkdarkred.limit) {
            return { min: ENV.incidenceColors.darkred.limit, max: ENV.incidenceColors.darkdarkred.limit }
        } else if (incidence > ENV.incidenceColors.darkdarkred.limit) {
            return { min: ENV.incidenceColors.darkdarkred.limit, max: 500 }
        }
        return { min: 0, max: 0 }
    }
    static calcIncidence(cacheID) {
        const casesData = [...ENV.cache[cacheID].data]
        if (CFG.debugIncidenceCalc) Helper.log('calcIncidence', cacheID)
        for(let i = 0; i < CFG.graphShowDays; i++) {
            let theDays = casesData.slice(i + 1, i + 1 + 7) // without today
            let sumCasesLast7Days = theDays.reduce((a, b) => a + b.cases, 0)
            casesData[i].incidence = (sumCasesLast7Days / ENV.cache[cacheID].meta.EWZ) * 100000
            if (CFG.debugIncidenceCalc) Helper.log(Format.dateStr(casesData[i].date), casesData[i].cases, casesData[i].incidence)
        }
        // @TODO Workaround use incidence from api
        if (CFG.disableLiveIncidence && typeof ENV.cache[cacheID].meta.cases7_per_100k !== 'undefined') {
            casesData[0].incidence = ENV.cache[cacheID].meta.cases7_per_100k
        }
        ENV.cache[cacheID].data = casesData.reverse()
    }
    static getDateBefore(days) {
        let offsetDate = new Date()
        offsetDate.setDate(new Date().getDate() - days)
        return offsetDate.toISOString().split('T').shift()
    }
    static async getLocation(staticCoordinateIndex = false) {
        if (typeof ENV.staticCoordinates[staticCoordinateIndex] !== 'undefined' && Object.keys(ENV.staticCoordinates[staticCoordinateIndex]).length >= 3) {
            return ENV.staticCoordinates[staticCoordinateIndex]
        }
        try {
            Location.setAccuracyToThreeKilometers()
            return await Location.current()
        } catch (e) {
            console.warn(e)
        }
        return null;
    }
    static log(...data) {
        console.log(data.map(JSON.stringify).join(' | '))
    }
    static getWeek(timestamp) {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        var week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      }
}

const cfm = new CustomFilemanager()
const rkiRequest = new RkiRequest()
await new IncidenceWidget().init()
