# Corona Incidence Widget for iOS (Scriptable)

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshot.png)

Dank der positiven Resonanz, jetzt im Repo zur einfacheren Wartung/Erweiterung ( [Mein original GIST](https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5) ) Feedback, PRs, etc. sind Willkommen.

**☕️ Einen Kaffee ausgeben 🙃:** https://ko-fi.com/rapha

# Features

* Inzidenz + Trend für Stadt/Kreis, Bundesland
* `Neue tägl. Fälle` für Stadt/Kreis, Bundesland, Bund
* Trend für `Neue tägl. Fälle` je Stadt/Kreis, Bundesland, Bund
* 14 Tage Diagram für `Neue tägl. Fälle` je Stadt/Kreis, Bundesland, Bund
* 7 Tage Schätzwert für Reproduktionszahl (R)
* iCLoud Sync
* Offlinemodes
* Dark/Lighmode unterstützung
* ...

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/info.png)

# Installation/Update

## Manual
* Open in Safari: https://raw.githubusercontent.com/rphl/corona-widget/master/incidence.js
* Copy Source
* Open Scriptable, Paste copied Scripttext as new or replace an old

## Automatic
* (SOON) Via new Scriptable WidgetGallery: https://github.com/rphl/corona-widget/issues/25
* Via Kurzbefehle (Shortcuts) App
* ...other Option: https://github.com/rphl/corona-widget/issues/24
* ...other Option: https://github.com/rphl/corona-widget/issues/6#issuecomment-721099314


# Configuration Incidence Widget

## Static Coordinates/MediumWidget

Set Widgetparameter for each column, seperated by ";" Format: `POSITION,LAT,LONG(,NAME);POSITION,LAT,LONG(,NAME)`
Second column is only visible if you set Widgetparameter for it. Check examples.


## Static Coordinates
* First column is static (No second column): `0,51.1244,6.7353`
* Second column is static (Second column is visble, MediumWidget): `1,51.1244,6.7353`
* Both columns are static (both are visble, MediumWidget): `0,51.1244,6.7353;1,51.1244,6.7353`
* Only second column is static (both are visble, MediumWidget): `1,51.1244,6.7353`
 
## Custom Names
 * Custom Name: `0,51.1244,6.7353,Home`
 * Custom Name Second column: `1,51.1244,6.7353,Work`

 ## Offlinemode

 * Set the 4th Widgetparameter to the CacheId 
 * Cache Id = Numeric JSON FileNumber. See coronaWidget CacheFolder

### Examples:
 * Filename = coronaWidget01511.json
 * Config set to: 1,51.1244,6.7353,Work,01511
