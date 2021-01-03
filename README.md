# Corona Inzidenz & Impfquoten Widget für iOS (Scriptable)

Widget zeigt die Inzidenz, tägl. neue Fälle, den Verlauf für 21 Tage (Inzidenz / neue Fälle) sowie Infos zu den Impfungen.

```diff
+ SIEHE "FEATURES" und KONFIGURATIONS ABSCHNITT FÜR AKTUELLE FUNKTIONSWEISE-/UMFANG!
```

**Inzidenz**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot.jpg)
**Inzidenz + Impquoten**
![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshots/screenshot_vaccine.jpg)

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

Das Skript kann auch über bestimmte Optionen konfiguriert werden. (Änderungen direkt in der incidence.js werden bei `scriptSelfUpdate=true` überschrieben)

* Die dauerhafte Konfiguration wird in einer externen Datei gespeichert.
* Die Konfigurationsdatei muss selbst angelegt werden: `coronaWidgetNext/config.json`. Diese ist nicht in Scriptable sichtbar!
* Zum anlegen und bearbeiten kann z.B Kodex https://apps.apple.com/de/app/kodex/id1038574481 für iPhone/iPad verwendet werden.

**Optionen:**

* `showVaccineInMedium: false` show vaccine status based on RKI reports. MEDIUMWIDGET IS REQUIRED!
* `openUrl: false` "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4", open RKI URL on tap, set false to disable
* `graphShowValues: 'i'` 'i' = incidence OR 'c' = cases
* `graphShowDays: 21` show days in graph
* `csvRvalueFields: ['Schätzer_7_Tage_R_Wert', 'Punktschätzer des 7-Tage-R Wertes']` try to find possible field (column) with rvalue, because rki is changing columnsnames and encoding randomly on each update
* `scriptRefreshInterval: 5400` refresh after 1,5 hours (in seconds)
* `scriptSelfUpdate: false` script updates itself,
* `disableLiveIncidence: false` show old, static incidance. update ONLY ONCE A DAY on intial RKI import
* `debugIncidenceCalc: false` show all calculated incidencevalues on console


**Beispiel** config.json =

RKI Dashboard öffnen
```
{
    "openUrl": "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4",
}
```

Nur Impquoten anzeigen
```
{
    "showVaccineInMedium": true
}
```

... oder
```
{
    "openUrl": "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4",
    "showVaccineInMedium": true
}
```