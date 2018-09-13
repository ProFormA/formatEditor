

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

    readSingleText(xpath, node) {
        const nodes = this.xmlDoc.evaluate(xpath, node?node:this.xmlDoc, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (nodes.singleNodeValue)
            return nodes.singleNodeValue.textContent;
        else
            return null;
    }



    readNodes(xpath) {
        return this.xmlDoc.evaluate(xpath, this.xmlDoc, this.nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

/*        var thisNode = iterator.iterateNext();
        while (thisNode) {
            alert( thisNode.textContent );
            thisNode = iterator.iterateNext();
        }
*/
    }

}

class TaskFile {
    constructor() {
        this.filename = '';
        this.fileclass = '';
        this.id = null;
        this.filetype = null;
        this.comment = null;
        this.content = null;
    }

}

class TaskClass {

    constructor() {
        this.title = '';
        this.description = '';
        this.proglang = '';
        this.proglangVersion = '';
        this.parentuuid = null;
        this.uuid = null;
        this.lang = 'de';
        this.sizeSubmission = 0;
        this.mimeTypeRegExpSubmission = '';

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
            this.sizeSubmission = xmlReader.readSingleText("/dns:task/dns:submission-restrictions/dns:regexp-restriction/@max-size");
            this.mimeTypeRegExpSubmission = xmlReader.readSingleText("/dns:task/dns:submission-restrictions/dns:regexp-restriction/@mime-type-regexp");
/*
            alert(this.title);
            alert(this.description);
            alert(this.proglang + '/' + this.proglangVersion);
            alert(this.uuid);
            alert(this.lang);
            alert(this.sizeSubmission);
            alert(this.mimeTypeRegExpSubmission);

*/
            // read files
            let iterator = xmlReader.readNodes("/dns:task/dns:files/dns:file");
            var thisNode = iterator.iterateNext();
            while (thisNode) {
                let taskfile = new TaskFile();
                taskfile.filename = xmlReader.readSingleText("@filename", thisNode);
                taskfile.fileclass = xmlReader.readSingleText("@class", thisNode);
                taskfile.id = xmlReader.readSingleText("@id", thisNode);
                taskfile.filetype = xmlReader.readSingleText("@type", thisNode);
                taskfile.comment = xmlReader.readSingleText("@comment", thisNode);
                taskfile.content = thisNode.textContent;
                this.files[taskfile.id] = taskfile;
                thisNode = iterator.iterateNext();
            }


       } catch (err){
           alert (err);
           setErrorMessage("Error while parsing the xml file. The file has not been imported.". err);
           return; // Stop. Do not make any further changes.
       }
    }
}