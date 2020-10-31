# Corona Inzidenz Widget für iOS (Scriptable)

![IMG_5438](https://raw.githubusercontent.com/rphl/corona-widget/master/screenshot.png)


* Auf grund der positiven Resonanz jetzt im Repo zur einfacheren Wartung/Erweiterung
* Mein original GIST: https://gist.github.com/rphl/0491c5f9cb345bf831248732374c4ef5

---

_Einen Kaffee ausgeben? 🙃: https://ko-fi.com/rapha_

---

**Updates**

***31.10.2020***
* Support für Stadt und Landkreis mit den gleichen Namen (JSON werden jetzt unter eindeutiger ID gespeichert, nicht den Stadtnamen) Bereits vorhandene JSON werden migriert ( Evtl Sicherheitskopie vor Update erstellen) #7

***30.10.2020***
* Neues Layout
* Reproduktionszahl im Widget
* Trend Diagramm für Gesamt-Inzidenz

***27.10.2020***
* Trend-Diagramme der letzten (max.)7 Tage für:  Stadt / BL / Gesamt (Gespeicherte Werte werden wiederverwendet. Sonst am nächsten Tag 🙃)
* Unterstützung für eigene Namen (Siehe Kommentar oben im Skript)

***25.10.2020***
* Darstellung der aktuellen Fallzahlen je Bundesland (Erst am nächsten Tag verfügbar, da gechached werden muss)

***24.10.2020***
* Support mediumWidget (2Spaltig) Widgetparamer. Siehe Kommentar im Skript.
* Anzeige der aktuellen Fälle für den Landkreis incl. Trend. (Erst am nächsten Tag verfügbar, da gechached werden muss)
* Trend für Inzidenz wird jetzt Grün wenn er fällt bzw. Rot wenn steigt.

***23.10.2020***
* iCloud ist jetzt optional. Trend Daten werden jetzt auch lokal auf dem Gerät gespeichert.

***22.10.2020***
* Es werden jetzt Inzidenzdaten für die letzten 7 Tage auf der iCloud zwischengespeichert. Diese sind die Basis für den Trend. Siehe auch `covid19STADTNAME.json` im Scriptable iCloud ordner.
* Am ersten Tag nach dem Update wird kein Trend angezeigt (Da nur "heute" Verfügbar ist)

***21.10.2020***
* Trend (Land / Bund)
* Datum letztes update

***20.10.2020***
* Bundesland hinzugefügt

_Weitere Forks siehe:_ https://gist.github.com/kevinkub/46caebfebc7e26be63403a7f0587f664#gistcomment-3493076

# Installation

 * ...
 * ...


# Konfiguration Inzidenz Widget

## Static Coordinates/MediumWidget

 * Set Widgetparameter for each column, seperated by ";" Format: `POSITION,LAT,LONG(,NAME);POSITION,LAT,LONG(,NAME)`
 * Second column is only visible if you set Widgetparameter for it. Check examples.


### Examples
 * First column is static (No second column): `0,51.1244,6.7353`
 * Second column is static (Second column is visble, MediumWidget): `1,51.1244,6.7353`
 * Both columns are static (both are visble, MediumWidget): `0,51.1244,6.7353;1,51.1244,6.7353`
 * Only second column is static (both are visble, MediumWidget): `1,51.1244,6.7353`
 
## Custom Names
 * Custom Name: `0,51.1244,6.7353,Home`
 * Custom Name Second column: `1,51.1244,6.7353,Work`
