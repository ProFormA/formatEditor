# formatEditor

A Javascript editor for ProFormA programming tasks (exchange format for programming exercises, https://github.com/ProFormA/proformaxml).

Can be executed from this website: https://proforma.github.io/formatEditor/proformaEditor.html

Testsuite runs with Chrome 98.

TODO:
- update documentation
- support Dateien mit gleichem Namen in den Filerefs unterstützen
- Entfernen der Zwischenschichtklasse beim XML-Schreiben (ggf. auch Lesen)
- Validieren der erzeugten XML-Datei gegen die Test-XSDs
- Einklappen der Descriptions
- auch attached Dateien editieren, wenn die Dateiendung vermuten lässt, dass das geht (z.b. java)
- Code aufräumen
- Testumgebung aufräumen (insbesondere die Indizierung ist verwirrend, weil mal die internen Indizes mal die aus der Oberfläche verwendet werden)
- Treeview für Dateien
- Datei neu anlegen und editieren ermöglichen 

Folgende Änderungen kommunizieren:
- csv als Textdatei werten (anstelle von Binärdatei)
- Entscheidung, dass große Dateien automatisch als Binärdateien gewertet werden, rausnehmen
- codemirror=false setzen (ggf. auch andere Lösung)

More testcases:
- change grading hints
- Java-Klassen- und Package-Erkennung
