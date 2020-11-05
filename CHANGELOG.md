
***05.11.2020***
* Offlinefallback
* Diagramme zeigen jetzt `Neue tägl. Fälle" der letzten 14 Tage

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