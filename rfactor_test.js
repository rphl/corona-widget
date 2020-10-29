// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: briefcase-medical;
// LICENCE: Robert Koch-Institut (RKI), dl-de/by-2-0
// AUTHOR: rphl https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5

// TEST PROTOTYPE FOR R-VALUE !!!
// TEST PROTOTYPE FOR R-VALUE !!!
// TEST PROTOTYPE FOR R-VALUE !!!
const apiRUrl = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Projekte_RKI/Nowcasting_Zahlen_csv.csv?__blob=publicationFile`

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

const widget = await createWidget()
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()


async function createWidget() {
    const list = new ListWidget()

    const rDataStr = await new Request(apiRUrl).loadString()
    const rData = parseRCSV(rDataStr)
    let lastR = {}
    rData.forEach(item => {
        if (parseFloat(item['Schätzer_7_Tage_R_Wert']) > 0) {
            lastR = item;
        }
    })
    const d = list.addText('Date: ' + lastR['Datum'])
    d.font = Font.mediumSystemFont(13)
    const r = list.addText('R: ' + lastR['Schätzer_7_Tage_R_Wert'])
    r.font = Font.mediumSystemFont(20)

    return list
}