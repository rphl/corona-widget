# Corona Inzidenz Widget für iOS (Scriptable)

Widget zeigt die Inzidenz, tägl. neue Fälle, sowie den Verlauf für 14 Tage an.

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot.png)

_Dank der positiven Resonanz, jetzt im Repo zur einfacheren Wartung/Erweiterung ( [Mein original GIST](https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5) ) Feedback, PRs, etc. sind Willkommen._

**☕️ Einen Kaffee ausgeben 🙃:** https://ko-fi.com/rapha

# Features

* _Inzidenz_ + Trend für Stadt/Kreis, Bundesland
* _Neue tägl. Fälle_ für Stadt/Kreis, Bundesland, Bund
* Trend für _Neue tägl. Fälle_ je Stadt/Kreis, Bundesland, Bund
* 14 Tage Diagram für _Neue tägl. Fälle_ je Stadt/Kreis, Bundesland, Bund
* 7 Tage Schätzwert für _Reproduktionszahl (R)_
* iCloud Sync
* Offlinemodes
* Dark/Lighmode unterstützung
* ...

**Hinweis**: Tägl. neue Fälle für Stadt/Bundesland + Trend sind erst nach 1-2 Tagen verfügbar (Caching nötig)

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/info.png)

# Installation/Update

**Manuell**
* Safari öffnen: https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js
* Skripttext kopieren
* Scriptable öffnen, kopierten Skripttext als neues Scriptablescript einfügen oder altes erstzen.

**Automatisch**
* Via Kurzbefehle (Shortcuts) App
* ...andere Option: https://github.com/rphl/corona-widget/issues/24

[![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de/?name=Corona-Widget&source=https%3A%2F%2Fraw.githubusercontent.com%2Frphl%2Fcorona-widget%2Fmaster%2Fincidence.js&docs=https%3A%2F%2Fgithub.com%2Frphl%2Fcorona-widget%2F)


# Konfiguration

* Daten werden unter **Dateien (App)** > **iCloud** > **Scriptable** > **coronaWidget** > *.json zwischengespeichert.
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


## Offlinemodus

Falls mal keine Daten abgerufen werden können, kann der Offlinemodus eingerichtet werden. Dafür muss die CacheID gesetzt werden: Format: `{POSITION},{LAT},{LON},{NAME},{CACHEID};{POSITION},{LAT},{LON},{NAME},{CACHEID}` 

Die `{CACHEID}` ist der numerische Teil der JSON Dateien die im Cacheordner zu finden sind: **Dateien (App)** > **iCloud** > **Scriptable** > **coronaWidget** > *.json

**Beispiel**: 

 * Dateiname = `coronaWidget01511.json `CacheID = `01511`
 * Cache für Düsselforf setzen: `0,51.1244,6.7353,Work,01511`
