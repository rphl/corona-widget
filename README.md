# Corona Inzidenz & Impfquoten Widget für iOS (Scriptable)

Widget zeigt die Inzidenz, tägl. neue Fälle, den Verlauf für 21 Tage (Inzidenz / neue Fälle) sowie Infos zu den Impfungen.

```diff
+ SIEHE "FEATURES" und KONFIGURATIONS ABSCHNITT FÜR AKTUELLE FUNKTIONSWEISE-/UMFANG!
```

**Inzidenz**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot.jpg)
**Inzidenz + Impquoten**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/develop/screenshots/screenshot_vaccine.jpg)

_Dank der positiven Resonanz, jetzt im Repo zur einfacheren Wartung/Erweiterung ( [Mein original GIST](https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5) ) Feedback, PRs, etc. sind Willkommen._

**☕️ Einen Kaffee ausgeben 🙃:** https://ko-fi.com/rapha

# Features

* **Live Inzidenz** + **Wochentrend!** für Stadt/Kreis, Bundesland, Bund
* **Neue tägl. Fälle** für Stadt/Kreis, Bundesland, Bund
* 21 Tage Diagram für **Inzidenz** oder **Neue tägl. Fälle** je Stadt/Kreis, Bundesland, Bund
* 7 Tage Schätzwert für **Reproduktionszahl (R)**
* tägl. **Impfquoten-/zahlen** _(Siehe Konfiguration!)_
* iCloud Sync
* Automatischer Offlinemodus (📡 = Kein GPS ⚡️ = Kein Internet)
* Dark/Lighmode unterstützung
* Autoupdate (Siehe Installation/Update)
* ...

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/info.jpg)


# Quelle/Datenbasis

* Das Widget basiert auf der offziellen Api des RKI. https://npgeo-corona-npgeo-de.hub.arcgis.com/
* Die bereitgestellten Daten können in bestimmten Regionen auf Grund von Meldeverzögerungen durch Ämter an das RKI (Api) erst Verzögert (Stunden-Tage) im Widget angezeigt werden.
* Für die Historie werden ausschliesslich Daten aus der Api verwendet. Somit können sich auf Grund von Verzögerunen/Aktualisierungen Werte wie Inzidenzen, neuen Fälle, etc. immer ändern.


# Installation/Update

**Manuell**
* Safari öffnen: https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js
* Skripttext kopieren
* Scriptable öffnen, kopierten Skripttext als neues Scriptablescript einfügen oder altes erstzen.

**Update**
* Wenn `CFG.scriptSelfUpdate: true ` aktualisiert sich das Skript im Intervall selbst (Kann via `CFG.scriptSelfUpdate: false` abgestellt werden)
* ...andere Option: https://scriptdu.de/


# Konfiguration

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

Das Script kann auch direkt über bestimmte Optionen konfiguriert werden. Siehe dazu incidence.js

```
    // "show vaccine status based on RKI reports. MEDIUMWIDGET IS REQUIRED!
    showVaccineInMedium: false,
    // open RKI dashboard on tap, set false to disable
    openUrl: false, //"https://rki.de", 

    // Show 'i' = incidence OR 'c' = cases in the graph
    graphShowValues: 'i',
    
    // show days in graph
    graphShowDays: 21, 

    // try to find possible field (column) with rvalue, because rki is changing columnsnames and encoding randomly on each update
    csvRvalueFields: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes'], 
    
    // refresh after 1,5 hours (in seconds)
    scriptRefreshInterval: 5400, 
    
    // script updates itself,
    scriptSelfUpdate: false,
    
     // if you like you can show the old static incidence value. is only updated once a day on intial RKI import
    disableLiveIncidence: false,

     // DEBUG:show all calculated incidencevalues on console
    debugIncidenceCalc: false
```
