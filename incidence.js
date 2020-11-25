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
 * (Old Version see: https://github.com/rphl/corona-widget/blob/master/incidence_icloud_old.js)
 */

const CFG = {
    openUrl: false, //"https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4", // open RKI dashboard on tap, set false to disable
    graphShowDays: 21, // show days in graph
    csvRvalueFields: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes'], // try to find possible field (column) with rvalue, because rki is changing columnsnames and encoding randomly on each update
    scriptRefreshInterval: 5400, // refresh after 1,5 hours (in seconds)
    scriptSelfUpdate: false // script updates itself
}

// ============= ============= ============= ============= =================
// HALT, STOP !!!
// NACHFOLGENDE ZEILEN NUR AUF EIGENE GEFAHR ÄNDERN !!!
// ============= ============= ============= ============= =================
// ZUR KONFIGURATION SIEHE README: 
// https://github.com/rphl/corona-widget/blob/master/README.md
// ============= ============= ============= ============= =================

const ENV = {
    incidenceColors: {
        darkdarkred: { limit: 250, color: new Color('#941100') },
        darkred: { limit: 100, color: new Color('#c01a00') },
        red: { limit: 50, color: new Color('#f92206') },
        orange: { limit: 35, color: new Color('#faa31b') },
        yellow: { limit: 25, color: new Color('#f7dd31') },
        green: { limit: 1, color: new Color('#00cc00') },
        gray: { limit: 0, color: new Color('#d0d0d0') }
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
    areaIBZ: {
        '40': 'KS',// Kreisfreie Stadt
        '41': 'SK', // Stadtkreis
        '42': 'K', // Kreis
        '46': 'K', // Sonderverband offiziel Kreis
        '43': 'LK', // Landkreis
        '45': 'LK', // Sonderverband offiziel Landkreis
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
        ok: 200
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

class IncidenceWidget {
    constructor(coordinates = []) {
        if (args.widgetParameter) ENV.staticCoordinates = Parse.input(args.widgetParameter)
        ENV.staticCoordinates = [...ENV.staticCoordinates, ...coordinates]
        if (typeof ENV.staticCoordinates[1] !== 'undefined' && Object.keys(ENV.staticCoordinates[1]).length >= 3) ENV.isMediumWidget = true
        this.selfUpdate()
    }
    async init() {
        this.widget = await this.createWidget()
        this.widget.setPadding(0, 0, 0, 0)
        if (!config.runsInWidget) {
            (ENV.isMediumWidget) ? await this.widget.presentMedium() : await this.widget.presentSmall()
        }
        Script.setWidget(this.widget)
        Script.complete()
    }
    async createWidget() {
        const list = new ListWidget()
        const statusPos0 = await Data.load(0)
        const statusPos1 = (ENV.isMediumWidget) ? await Data.load(1) : false

        // UI ===============
        let topBar = new UI(list).stack('h', [4, 8, 4, 4])
        topBar.text("🦠", Font.mediumSystemFont(22))
        topBar.space(3)

        if (statusPos0 === ENV.status.error || statusPos1 === ENV.status.error) {
            topBar.space()
            list.addSpacer()
            let statusError = new UI(list).stack('v', [4, 6, 4, 6])
            statusError.text('⚡️', ENV.fonts.medium)
            statusError.text('Standortdaten konnten nicht geladen werden. \nKein Cache verfügbar. \n\nBitte später nochmal versuchen.', ENV.fonts.small, '#999')
            list.addSpacer(4)
            list.refreshAfterDate = new Date(Date.now() + ((CFG.scriptRefreshInterval / 2) * 1000))
            return list
        }

        Helper.calcIncidence(0)
        Helper.calcIncidence(ENV.cache[0].meta.BL_ID)
        Helper.calcIncidence('d')

        ENV.isSameState = false;
        if (statusPos0 === statusPos1) {
            ENV.isSameState = (ENV.cache[0].meta.BL_ID === ENV.cache[1].meta.BL_ID)
        }

        if (statusPos1) Helper.calcIncidence(1)
        if (statusPos1 && !ENV.isSameState) Helper.calcIncidence(ENV.cache[1].meta.BL_ID)

        let topRStack = new UI(topBar).stack('v')
        Helper.log(ENV.cache.d.meta.r)
        topRStack.text(Format.number(ENV.cache.d.meta.r, 2, 'n/v') + 'ᴿ', ENV.fonts.medium)
        topRStack.text(Format.dateStr(ENV.cache.d.getDay().date), ENV.fonts.xsmall, '#777')

        topBar.space()
        UIComp.statusBlock(topBar, statusPos0)
        topBar.space(4)

        if (ENV.isMediumWidget && !ENV.isSameState) {
            topBar.space()
            UIComp.smallIncidenceRow(topBar, null, { borderWidth: 0 })
        }

        UIComp.incidenceRows(list)
        list.addSpacer(3)

        let stateBar = new UI(list).stack('h', [0, 0, 0, 0])
        stateBar.space(6)
        let leftCacheID = ENV.cache[0].meta.BL_ID
        if (ENV.isMediumWidget) { UIComp.smallIncidenceRow(stateBar, leftCacheID) } else { UIComp.smallIncidenceBlock(stateBar, leftCacheID) }
        stateBar.space(4)

        // DEFAULT IS GER... else STATE
        let rightCacheID = (ENV.isMediumWidget && !ENV.isSameState) ? ENV.cache[1].meta.BL_ID : 'd'
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
}

class UIComp {
    static incidenceRows(view) {
        let b = new UI(view).stack('v', [4, 6, 4, 6])
        let bb = new UI(b).stack('v', false, '#99999920', 10)
        let padding = [4, 6, 4, 4]
        if (ENV.isMediumWidget) {
            padding = [2, 8, 2, 8]
        }
        let bb2 = new UI(bb).stack('h', padding, '#99999920', 10)
        UIComp.incidenceRow(bb2, 0)

        let bb3 = new UI(bb).stack('h', padding)
        if (ENV.isMediumWidget) {
            UIComp.incidenceRow(bb3, 1)
        } else {
            bb3.space()
            UIComp.areaIcon(bb3, 40)
            bb3.space(3)
            bb3.text(ENV.cache[0].meta.GEN.toUpperCase(), ENV.fonts.medium, false, 1, 0.9)
            bb3.space(8) // center title if small widget
            bb3.space()
        }
    }
    static incidenceRow(view, cacheID) {
        let b = new UI(view).stack()
        let incidence = ENV.cache[cacheID].getDay().incidence
        b.text(Format.number(incidence, 1, 'n/v', 100), ENV.fonts.xlarge, ENV.incidenceColors.darkred.color, 1, 0.9)
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getDay().incidence, ENV.cache[cacheID].getDay(1).incidence)
        let trendColor = (trendArrow === '↑') ? ENV.incidenceColors.red.color : (trendArrow === '↓') ? ENV.incidenceColors.green.color : ENV.incidenceColors.gray.color
        b.text(trendArrow, Font.boldSystemFont(26), trendColor, 1, 0.9)

        if (ENV.isMediumWidget) {
            b.space(5)
            UIComp.areaIcon(b, ENV.cache[cacheID].meta.IBZ)
            b.space(3)
            let areaName = ENV.cache[cacheID].meta.GEN
            if (typeof ENV.staticCoordinates[cacheID] !== 'undefined' && ENV.staticCoordinates[cacheID].name !== false) {
                areaName = ENV.staticCoordinates[cacheID].name
            }
            b.text(areaName.toUpperCase(), ENV.fonts.medium, false, 1, 1)
        }

        let b2 = new UI(b).stack('v', [2, 0, 0, 0])
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        let bb1 = new UI(b2).stack('h', [0, 0, 0, 0])
        if (incidence >= 100) bb1.space()

        let graphImg = UI.generateGraph(ENV.cache[cacheID].data, 58, 16, false).getImage()
        bb1.image(graphImg)
        bb1.space(0)

        let bb2 = new UI(b2).stack('h')
        bb2.space()
        bb2.text('+' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, '#888', 1, 1)
        bb2.space(0)

        b.space(0)
    }
    static smallIncidenceBlock(view, cacheID, options = {}) {
        let b = new UI(view).stack('v', false, '#99999915', 12)
        let b2 = new UI(b).stack('h', [4, 0, 0, 5])
        b2.space()
        b2.text(Format.number(ENV.cache[cacheID].getDay().incidence, 1, 'n/v', 100), ENV.fonts.small2, ENV.incidenceColors.darkred.color, 1, 1)
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getDay().incidence, ENV.cache[cacheID].getDay(1).incidence)
        let trendColor = (trendArrow === '↑') ? ENV.incidenceColors.red.color : (trendArrow === '↓') ? ENV.incidenceColors.green.color : ENV.incidenceColors.gray.color
        b2.text(trendArrow, ENV.fonts.small2, trendColor, 1, 1)
        let name = (typeof ENV.cache[cacheID].meta.BL_ID !== 'undefined') ? ENV.statesAbbr[ENV.cache[cacheID].meta.BL_ID] : cacheID
        b2.text(name.toUpperCase(), ENV.fonts.small2, '#777', 1, 1)

        let b3 = new UI(b).stack('h', [0, 0, 0, 5])
        b3.space()
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        let graphImg = UI.generateGraph(ENV.cache[cacheID].data, 58, 8, false).getImage()
        b3.image(graphImg, 0.9)

        let b4 = new UI(b).stack('h', [0, 0, 1, 5])
        b4.space()
        b4.text('+' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, '#777', 1, 0.9)
        // b4.text('↗', ENV.fonts.xsmall, '#777', 1, 0.9)
        b.space(2)
    }
    static smallIncidenceRow(view, cacheID, options = {}) {
        let borderWidth = (typeof options.borderWidth !== 'undefined') ? options.borderWidth : 1
        let r = new UI(view).stack('h', false, '#99999910', 12, borderWidth)
        let b = new UI(r).stack('v')

        let b2 = new UI(b).stack('h', [2, 0, 0, 6])
        b2.space()
        b2.text(Format.number(ENV.cache[cacheID].getDay().incidence, 1, 'n/v', 100), ENV.fonts.normal, ENV.incidenceColors.darkred.color)
        let trendArrow = UI.getTrendArrow(ENV.cache[cacheID].getDay().incidence, ENV.cache[cacheID].getDay(1).incidence)
        let trendColor = (trendArrow === '↑') ? ENV.incidenceColors.red.color : (trendArrow === '↓') ? ENV.incidenceColors.green.color : ENV.incidenceColors.gray.color
        b2.text(trendArrow, ENV.fonts.normal, trendColor)
        b2.space(2)
        let name = (typeof ENV.cache[cacheID].meta.BL_ID !== 'undefined') ? ENV.statesAbbr[ENV.cache[cacheID].meta.BL_ID] : cacheID
        b2.text(name.toUpperCase(), ENV.fonts.normal, false)

        let b3 = new UI(b).stack('h', [0, 0, 2, 6])
        b3.space()
        b3.text('+' + Format.number(ENV.cache[cacheID].getDay().cases), ENV.fonts.xsmall, '#999', 1, 0.9)
        //b3.text('↗', ENV.fonts.xsmall, '#999', 1, 0.9)

        let b4 = new UI(r).stack('h', [0, 0, 0, 6])
        b4.space(2)
        //let chartdata = [{ incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 20, value: 25 }, { incidence: 10, value: 20 }, { incidence: 30, value: 30 }, { incidence: 0, value: 0 }, { incidence: 10, value: 10 }, { incidence: 20, value: 20 }, { incidence: 30, value: 30 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 39, value: 39 }, { incidence: 40, value: 40 }, { incidence: 50, value: 50 }, { incidence: 70, value: 70 }, { incidence: 100, value: 100 }, { incidence: 60, value: 60 }, { incidence: 70, value: 70 }, { incidence: 40, value: 40 }]
        let graphImg = UI.generateGraph(ENV.cache[cacheID].data, 56, 10, false).getImage()
        b4.image(graphImg, 0.9)

        r.space(4)
    }
    static areaIcon(view, ibzID) {
        let b = new UI(view).stack('h', [1, 3, 1, 3], '#99999930', 2, 2)
        b.text(ENV.areaIBZ[ibzID], ENV.fonts.xsmall)
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
                icon = '🌍'
                iconText = 'Kein GPS'
                break;
        }
        if (icon && iconText) {
            let topStatusStack = new UI(view).stack('v')
            topStatusStack.text(icon, ENV.fonts.small)
            topStatusStack.text(iconText, ENV.fonts.xsmall, '#999999')
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
        let graphData = data.slice(Math.max(data.length - CFG.graphShowDays, 1));
        let context = new DrawContext()
        context.size = new Size(width, height)
        context.opaque = false
        let max = Math.max.apply(Math, graphData.map(function (o) { return o.cases; }))
        max = (max <= 0) ? 10 : max;
        let w = Math.max(2, Math.round((width - (graphData.length * 2)) / graphData.length))
        let xOffset = (!alignLeft) ? (width - (graphData.length * (w + 1))) : 0
        for(let i = 0; i < CFG.graphShowDays; i++) {
            let item = graphData[i]
            let value = parseFloat(item.cases)
            if (value === -1 && i == 0) value = 10;
            let h = Math.max(2, Math.round((Math.abs(value) / max) * height))
            let x = xOffset + (w + 1) * i
            let rect = new Rect(x, height - h, w, h)
            context.setFillColor(UI.getIncidenceColor((item.cases >= 1) ? item.incidence : 0))
            context.fillRect(rect)
        }
        return context
    }
    stack(type = 'h', padding = false, borderBgColor = false, radius = false, borderWidth = false) {
        this.elem = this.view.addStack()
        if (radius) this.elem.cornerRadius = radius
        if (borderWidth !== false) {
            this.elem.borderWidth = borderWidth
            this.elem.borderColor = new Color(borderBgColor)
        } else if (borderBgColor) {
            this.elem.backgroundColor = new Color(borderBgColor)
        }
        if (padding) this.elem.setPadding(...padding)
        if (type === 'h') { this.elem.layoutHorizontally() } else { this.elem.layoutVertically() }
        this.elem.centerAlignContent()
        return this
    }
    text(text, font = false, color = false, maxLines = 0, minScale = 0.75) {
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
    static getIncidenceColor(incidence) {
        let color = ENV.incidenceColors.green.color
        if (incidence > ENV.incidenceColors.darkdarkred.limit) {
            color = ENV.incidenceColors.darkdarkred.color
        } else if (incidence >= ENV.incidenceColors.darkred.limit) {
            color = ENV.incidenceColors.darkred.color
        } else if (incidence >= ENV.incidenceColors.red.limit) {
            color = ENV.incidenceColors.red.color
        } else if (incidence >= ENV.incidenceColors.orange.limit) {
            color = ENV.incidenceColors.orange.color
        } else if (incidence >= ENV.incidenceColors.yellow.limit) {
            color = ENV.incidenceColors.yellow.color
        } else if (incidence === 0) {
            color = ENV.incidenceColors.gray.color
        }
        return color
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
    getDay(dayOffset = 0) {
        return (typeof this.data[this.data.length - 1 - dayOffset] !== 'undefined') ? this.data[this.data.length - 1 - dayOffset] : false;
    }
    static async tryLoadFromCache(cacheID, useStaticCoordsIndex) {
        const dataResponse = await cfm.read(cfm.configDirectory + '/coronaWidget_config.json')
        if (dataResponse.status !== ENV.status.ok) return ENV.status.error
        const cacheIDs = JSON.parse(dataResponse.data)
        if (typeof cacheIDs[cacheID] === 'undefined') return ENV.status.error
        const dataIds = cacheIDs[cacheID]
        if (typeof dataIds['dataIndex' + useStaticCoordsIndex] !== 'undefined') {
            const areaData = await cfm.read('coronaWidget_' + dataIds['dataIndex' + useStaticCoordsIndex])
            const area = new Data(dataIds['dataIndex' + useStaticCoordsIndex], areaData.data.data, areaData.data.meta)
            ENV.cache[useStaticCoordsIndex] = area

            const stateData = await cfm.read('coronaWidget_' + areaData.data.meta.BL_ID)
            const state = new Data(areaData.data.meta.BL_ID, stateData.data.data, stateData.data.meta)
            ENV.cache[areaData.data.meta.BL_ID] = state

            const dData =  await cfm.read('coronaWidget_d')
            const d = new Data(areaData.data.meta.BL_ID, dData.data.data, dData.data.meta)
            ENV.cache.d = d

            return ENV.status.ok
        }
        return ENV.status.error
    }
    static async load(useStaticCoordsIndex = false) {
        if (typeof ENV.cache[useStaticCoordsIndex] !== 'undefined') return true

        let configId = btoa('cID' + JSON.stringify(ENV.staticCoordinates).replace(/[^a-zA-Z ]/g, ""))
        const location = await Helper.getLocation(useStaticCoordsIndex)
        if (!location) {
            return (await Data.tryLoadFromCache(configId, useStaticCoordsIndex) === ENV.status.ok) ? ENV.status.nogps : ENV.status.error
        }
        const locationData = await rkiRequest.locationData(location)
        if (!locationData) {
            return (await Data.tryLoadFromCache(configId, useStaticCoordsIndex) === ENV.status.ok) ? ENV.status.fromcache : ENV.status.error
        }

        let areaCases = await rkiRequest.areaCases(locationData.RS)
        await Data.geoCache(configId, useStaticCoordsIndex, locationData.RS)

        let areaData = new Data(locationData.RS)
        areaData.data = areaCases
        areaData.meta = locationData
        await cfm.save(areaData)
        ENV.cache[useStaticCoordsIndex] = areaData

        // STATE DATA
        if (typeof ENV.cache[locationData.BL_ID] === 'undefined') {
            let stateCases = await rkiRequest.stateCases(locationData.BL_ID)
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
            let dData = new Data('d')
            dData.data = dCases
            dData.meta = {
                r: await rkiRequest.rvalue(),
                EWZ: 83.02 * 1000000 // @TODO real number?
            }
            await cfm.save(dData)
            ENV.cache.d = dData
        }

        if (typeof ENV.cache[useStaticCoordsIndex] !== 'undefined' && typeof ENV.cache[locationData.BL_ID] !== 'undefined' && typeof ENV.cache.d !== 'undefined') {
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
    static dateStr(timestamp) {
        let date = new Date(timestamp)
        return `${('' + date.getDate()).padStart(2, '0')}.${('' + (date.getMonth() + 1)).padStart(2, '0')}.${date.getFullYear()}`
    }
    static number(number, fractionDigits = 0, placeholder = null, limit = false) {
        if (!!placeholder && number === 0) return placeholder
        if (limit !== false && number >= limit) fractionDigits = 0
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
                if (item[firstDatefield].includes('.') && typeof item[availeRvalueField] !== 'undefined' && parseFloat(item[availeRvalueField].replace(',', '.')) > 0) {
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
        const newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdLandkreis=${areaID}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdLandkreis=${areaID}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async stateCases(blID) {
        const apiStartDate = Helper.getDateBefore(CFG.graphShowDays + 7)
        const newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)+AND+IdBundesland=${blID}&objectIds=&time=&resultType=standard&outFields=&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&having=&resultOffset=&resultRecordCount=&sqlFormat=none&token=`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+IdBundesland=${blID}+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async dCases() {
        const apiStartDate = Helper.getDateBefore(CFG.graphShowDays + 7)
        let newCasesTodayUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&geometry=42.000%2C12.000&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D&resultType=standard&cacheHint=true`
        newCasesTodayUrl += `&groupByFieldsForStatistics=MeldeDatum`
        const newCasesHistoryUrl = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall+IN%281%2C0%29+AND+MeldeDatum+%3E%3D+TIMESTAMP+%27${apiStartDate}%27&objectIds=&time=&resultType=standard&outFields=AnzahlFall%2CMeldeDatum&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=MeldeDatum&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22cases%22%7D%5D%0D%0A&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`

        return await this.getCases(newCasesTodayUrl, newCasesHistoryUrl)
    }
    async rvalue() {
        const url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`
        const response = await this.exec(url, false)
        return (response.status === ENV.status.ok) ? Format.rValue(response.data) : false
    }
    async getCases(urlToday, urlHistory) {
        const responseToday = await this.exec(urlToday)
        const responseHistory = await this.exec(urlHistory)
        if (responseToday.status === ENV.status.ok && responseHistory.status === ENV.status.ok) {
            let data = responseHistory.data.features.map(day => { return { cases: day.attributes.cases, date: day.attributes.MeldeDatum } })
            let todayCases = responseToday.data.features.reduce((a, b) => a + b.attributes.cases, 0)
            let lastDate = Math.max(...responseHistory.data.features.map(a => a.attributes.MeldeDatum))
            let lastDateToday = Math.max(...responseToday.data.features.map(a => a.attributes.MeldeDatum))

            if (new Date(lastDateToday).setHours(0, 0, 0, 0) <= new Date(lastDate).setHours(0, 0, 0, 0)) {
                let lastReportDate = new Date(lastDate)
                lastDate = lastReportDate.setDate(lastReportDate.getDate() + 1);
            }
            data.push({ cases: todayCases, date: lastDate })
            return data;
        }
        return false;
    }
    async exec(url, isJson = true) {
        try {
            const resData = new Request(url)
            resData.timeoutInterval = 20
            let data = {}
            let status = ENV.status.ok
            if (isJson) {
                data = await resData.loadJSON()
                status = (typeof data.features !== 'undefined') ? ENV.status.ok : ENV.status.notfound
            } else {
                data = await resData.loadString()
                status = (typeof data.length !== '') ? ENV.status.ok : ENV.status.notfound
            }
            return new DataResponse(data, status)
        } catch (e) {
            console.warn(e)
            return new DataResponse({}, ENV.status.notfound)
        }
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
        let headers = lines.splice(0, 1)[0].split(";");
        let elements = []
        for (let i = 0; i < lines.length; i++) {
            let element = {};
            let j = 0;
            let values = lines[i].split(';')
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
    static calcIncidence(cacheID) {
        const reversedData = [...ENV.cache[cacheID].data].reverse()
        for(let i = 0; i < CFG.graphShowDays; i++) {
            let theDays = reversedData.slice(i + 1, i + 1 + 7) // without today
            let sumCasesLast7Days = theDays.reduce((a, b) => a + b.cases, 0)
            reversedData[i].incidence = (sumCasesLast7Days) / (ENV.cache[cacheID].meta.EWZ / 100000)
        }
        ENV.cache[cacheID].data = reversedData.reverse()
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
}

const cfm = new CustomFilemanager()
const rkiRequest = new RkiRequest()
await new IncidenceWidget().init()