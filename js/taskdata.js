

class XmlReader {
    constructor(xmlText) {
        this.xmlDoc = new DOMParser().parseFromString(xmlText,'text/xml');
        if (!this.xmlDoc.evaluate) {
            alert('XPATH not supported');
            return;
        }

        this.nsResolver = function (prefix) {
            switch (prefix) {
                case 'unit':
                    return 'urn:proforma:tests:unittest:v1';
                case 'dns':
                    return 'urn:proforma:task:v1.0.1';
                default:
                    return '';
            }
        };

        /*
                        var resolver = null;
                        var ns = (new window.DOMParser).parseFromString(xmlfile, "text/xml").children[0].getAttribute("xmlns");
                        if (ns) {
                            resolver = function() {
                                return ns;
                            }
                            xpath = "defaultNamespace:" + xpath;
                        }
        */
    }

    readSingleText(xpath) {
        const nodes = this.xmlDoc.evaluate(xpath, this.xmlDoc, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null); // FIRST_ORDERED_NODE_TYPE //ANY_TYPE
        if (nodes.singleNodeValue)
            return nodes.singleNodeValue.textContent;
        else
            return null;
    }
}

class TaskClass {

    constructor() {
        this.title = '';
        this.description = '';
        this.proglang = '';
        this.proglangVersion = '';
        this.uuid = null;
        this.lang = 'de';
        this.submissionrestrictions = null;
        this.parentuuid = null;

        this.files = [];
        // this.external-resources ;
        this.modelsolutions = [];
        this.tests = [];
        this.gradinghints = [];
    }



    readXml(xmlfile) {

       try {
           let xmlReader = new XmlReader(xmlfile);

           this.title = xmlReader.readSingleText("/dns:task/dns:meta-data/dns:title");
           this.description = xmlReader.readSingleText("/dns:task/dns:description");
           this.proglang = xmlReader.readSingleText("/dns:task/dns:proglang");
           this.proglangVersion = xmlReader.readSingleText("/dns:task/dns:proglang/@version");
           this.uuid = xmlReader.readSingleText("/dns:task/@uuid");
           this.lang = xmlReader.readSingleText("/dns:task/@lang");
/*
           alert(this.title);
           alert(this.description);
           alert(this.proglang + '/' + this.proglangVersion);
           alert(this.uuid);
           alert(this.lang);
*/
   /*
                var result = nodes.iterateNext();
                while (result) {
                    txt += result.childNodes[0].nodeValue + "<br>";
                    result = nodes.iterateNext();
                }*/


       } catch (err){
           alert (err);
           setErrorMessage("Error while parsing the xml file. The file has not been imported.". err);
           return; // Stop. Do not make any further changes.
       }

    }
}