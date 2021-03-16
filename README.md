# Corona Inzidenz & Impfquoten Widget für iOS (Scriptable)

Widget zeigt die Inzidenz, tägl. neue Fälle, den Verlauf für 21 Tage (Inzidenz / neue Fälle) sowie Infos zu den Impfungen.

```diff
+ SIEHE "FEATURES" und KONFIGURATIONS ABSCHNITT FÜR AKTUELLE FUNKTIONSWEISE-/UMFANG!
```

**Inzidenz**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot.jpg)
**Inzidenz + Impfquoten**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot_vaccine.jpg)

_Dank der positiven Resonanz, jetzt im Repo zur einfacheren Wartung/Erweiterung ( [Mein original GIST](https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5) ) Feedback, PRs, etc. sind Willkommen._

**☕️ Einen Kaffee ausgeben 🙃:** https://ko-fi.com/rapha

# ✨ Features

* **Live Inzidenz** + **Wochentrend!** für Stadt/Kreis, Bundesland, Bund
* **Neue tägl. Fälle** für Stadt/Kreis, Bundesland, Bund
* 21 Tage Diagram für **Inzidenz** oder **Neue tägl. Fälle** je Stadt/Kreis, Bundesland, Bund
* 7 Tage Schätzwert für **Reproduktionszahl (R)**
* tägl. **Impfquoten-/zahlen** _(Siehe Konfiguration!)_
* iCloud Sync (Optional)
* Automatischer Offlinemodus (📡 = Kein GPS ⚡️ = Kein Internet)
* Dark/Lighmode unterstützung (_Siehe Konfiguration_)
* Autoupdate (Siehe Installation/Update)
* Eine Art **"Themes"**: Farben/Hintergrundbild. (_Siehe Konfiguration_)
* ...

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/info.jpg)


# 📚 Quelle/Datenbasis

* Das Widget basiert auf der offziellen Api des RKI. https://npgeo-corona-npgeo-de.hub.arcgis.com/
* Die bereitgestellten Daten können in bestimmten Regionen auf Grund von Meldeverzögerungen durch Ämter an das RKI (Api) erst Verzögert (Stunden-Tage) im Widget angezeigt werden.
* Für die Historie werden ausschliesslich Daten aus der Api verwendet. Somit können sich auf Grund von Verzögerunen/Aktualisierungen Werte wie Inzidenzen, neuen Fälle, etc. immer ändern.
* "Live-Inzidenz" basiert immer auf den gemeldeten neuen Fälle aus der Api! Und _kann_ sich von dem statischen Wert aus der (RKI) Api unterscheiden. Siehe auch _Erweiterte Konfiguration: Optionen_.


# 📲 Installation/Update

**Manuell**
* Safari öffnen: https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js
* Skripttext kopieren
* Scriptable öffnen, kopierten Skripttext als neues Scriptablescript einfügen oder altes erstzen.

**Update**
* Wenn `CFG.scriptSelfUpdate: true ` aktualisiert sich das Skript im Intervall selbst (Kann via `CFG.scriptSelfUpdate: false` abgestellt werden)
* ...andere Option: https://scriptdu.de/


# ⚙️ Konfiguration

* Daten werden unter **Dateien (App)** > **iCloud** > **Scriptable** > **coronaWidgetNext** > *.json zwischengespeichert.
* Die allgemeine Konfiguration erfolgt mittels **WidgetParameter**:

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/widgetparameter.jpg)


## Statische Standort Koordinaten

Das Widget erkennt automatisch den Standort. Es ist jedoch möglich den Standort fest zu setzten. Die Koordinaten können z.B. über die Karten App ermittelt werden. Format: `{POSITION},{LAT},{LON};{POSITION},{LAT},{LON}`

* `{POSITION}` = Position im Widget. z.B: 0=ErsterStandrt, 1=ZweiterStandort (Zweispaltes MediumWidget)
* `{LAT}` = Breitengrad. z.B: 51.1234 _(NICHT 51,1234 - Kein Komma!)_
* `{LON}` = Längengrad. z.B: 11.1234 _(NICHT 11,1234 - Kein Komma!)_

**Beispiele**

* Erster Standort statisch (SmallWidget): `0,51.1244,6.7353`
* Zweiter Standort ist statisch (MediumWidget): `1,51.1244,6.7353`
* Beide Standorte sind statisch (MediumWidget): `0,51.1244,6.7353;1,51.1244,6.7353`
* Nur zweiter Standort ist statisch (MediumWidget): `1,51.1244,6.7353`
 

## Eigene Standortnamen

Standorte selbst bennenen. Format: `{POSITION},{LAT},{LON},{NAME};{POSITION},{LAT},{LON},{NAME}`

* `{NAME}` = Name der anstalle der offizielen Bezeichnung aus der API verwendet wird.

**Beispiele**

 * Eigener Name z.B "Home" für den ersten Standort: `0,51.1244,6.7353,Home`
 * Eigener Name z.B "Work" für den zweiten Standort: `1,51.1244,6.7353,Work`

## Erweiterte Konfiguration

Das Skript kann auch über bestimmte Optionen konfiguriert werden. (Änderungen direkt in der incidence.js werden bei `scriptSelfUpdate=true` überschrieben)

* Die dauerhafte Konfiguration wird in einer externen Datei gespeichert.
* Die Konfigurationsdatei muss selbst angelegt werden: `coronaWidgetNext/config.json`. Diese ist nicht in Scriptable sichtbar!
* Zum anlegen und bearbeiten kann z.B Kodex https://apps.apple.com/de/app/kodex/id1038574481 für iPhone/iPad verwendet werden.

**Optionen:**
* `theme: ''` Automatic Light/Darkmode switch = `''` OR  lightmode only = `light` OR darkmode only = `dark`
* `showVaccineInMedium: false` show vaccine status based on RKI reports. MEDIUMWIDGET IS REQUIRED!
* `openUrl: false` "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4", open RKI URL on tap, set false to disable
* `graphShowValues: 'i'` 'i' = incidence OR 'c' = cases
* `graphShowDays: 21` show days in graph
* `csvRvalueFields: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes']` try to find possible field (column) with rvalue, because rki is changing columnsnames and encoding randomly on each update
* `scriptRefreshInterval: 5400` refresh after 1,5 hours (in seconds)
* `scriptSelfUpdate: false` script updates itself,
* `disableLiveIncidence: false` show old, static incidance. update ONLY ONCE A DAY on intial RKI import
* `debugIncidenceCalc: false` show all calculated incidencevalues on console


**BEISPIELE** config.json =

**RKI Dashboard beim antippen öffnen**
```
{
    "openUrl": "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4",
}
```

**Dark-/Light anpassen. Nur Lightmode nutzen:**
```
{
    "theme": "light"
    ....
    "themes": {
        "light": {
            ...
        },
         "dark": {
            ...
        }
}
```

**Farben anpassen. --- Es müssen immer alle Werte eine Themes überschrieben werden ---**

Optional kann je Theme mit `mainBackgroundImageURL` eine URL zum Hintergrundbild gesetzt werden (Siehe Themewerte)

**Standard Light Farben:**

```
{
    "themes": {
        "light": {
            "mainBackgroundImageURL": "",
            "mainBackgroundColor": "#f0f0f0",
            "stackBackgroundColor": "#99999920",
            "stackBackgroundColorSmall": "#99999915",
            "stackBackgroundColorSmallTop": "#99999900",
            "areaIconBackgroundColor": "#99999930",
            "titleTextColor": "#222222",
            "titleRowTextColor": "#222222",
            "titleRowTextColor2": "#222222",
            "smallNameTextColor": "#777777",
            "dateTextColor": "#777777",
            "dateTextColor2": "#777777",
            "graphTextColor": "#888888",
            "incidenceColorsDarkdarkred": "#941100",
            "incidenceColorsDarkred": "#c01a00",
            "incidenceColorsRed": "#f92206",
            "incidenceColorsOrange": "#faa31b",
            "incidenceColorsYellow": "#ffff64",
            "incidenceColorsGreen": "#00cc00",
            "incidenceColorsGray": "#d0d0d0"
        }
    }
}
```
**Standard Dark Farben:**

```
{
    "themes": {
        "dark": {
            "mainBackgroundImageURL": "",
            "mainBackgroundColor": "#9999999",
            "stackBackgroundColor": "#99999920",
            "stackBackgroundColorSmall": "#99999915",
            "stackBackgroundColorSmallTop": "#99999900",
            "areaIconBackgroundColor": "#99999930",
            "titleTextColor": "#f0f0f0",
            "titleRowTextColor": "#f0f0f0",
            "titleRowTextColor2": "#f0f0f0",
            "smallNameTextColor": "#888888",
            "dateTextColor": "#777777",
            "dateTextColor2": "#777777",
            "graphTextColor": "#888888",
            "incidenceColorsDarkdarkred": "#941100",
            "incidenceColorsDarkred": "#c01a00",
            "incidenceColorsRed": "#f92206",
            "incidenceColorsOrange": "#faa31b",
            "incidenceColorsYellow": "#ffff64",
            "incidenceColorsGreen": "#00cc00",
            "incidenceColorsGray": "#d0d0d0"
        }
    }
}
```

**Nur Impfquoten anzeigen**
```
{
    "showVaccineInMedium": true
}
```

**... oder**
```
{
    "openUrl": "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4",
    "showVaccineInMedium": true
}
```
