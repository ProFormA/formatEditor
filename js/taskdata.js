

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

class TaskModelSolution {
    constructor() {
        this.id = null;
        this.comment = null;
        this.filerefs = [];
    }
}

class TaskTest {
    constructor() {
        this.id = null;
        this.title = null;
        this.testtype = null;
        this.filerefs = [];
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

            // read files
            let iterator = xmlReader.readNodes("/dns:task/dns:files/dns:file");
            let thisNode = iterator.iterateNext();
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

            // read model solutions(s)
            iterator = xmlReader.readNodes("/dns:task/dns:model-solutions/dns:model-solution");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let modelSolution = new TaskModelSolution();
                modelSolution.id = xmlReader.readSingleText("@id", thisNode);
                modelSolution.comment = xmlReader.readSingleText("@comment", thisNode);
                // TODO: read filerefs
                this.modelsolutions[modelSolution.id] = modelSolution;
                thisNode = iterator.iterateNext();
            }

            // read tests
            iterator = xmlReader.readNodes("/dns:task/dns:tests/dns:test");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let test = new TaskTest();
                test.id = xmlReader.readSingleText("@id", thisNode);
                test.title = xmlReader.readSingleText("dns:title", thisNode);
                test.testtype = xmlReader.readSingleText("dns:test-type", thisNode);
                // TODO: read filerefs
                this.tests[test.id] = test;
                thisNode = iterator.iterateNext();
            }
       } catch (err){
           alert (err);
           setErrorMessage("Error while parsing the xml file. The file has not been imported.". err);
           return; // Stop. Do not make any further changes.
       }
    }

    writeXml() {
        let xmlDoc = null;
        let files = null;
        let modelsolutions = null;
        let tests = null;

        function writeFile(item, index) {
            let fileElem = xmlDoc.createElement("file");
            fileElem.setAttribute("class", item.fileclass);
            fileElem.setAttribute("filename", item.filename);
            fileElem.setAttribute("id", item.id);
            fileElem.setAttribute("type", item.filetype);
            fileElem.setAttribute("comment", item.comment);
            files.appendChild(fileElem);
            fileElem.appendChild(xmlDoc.createCDATASection(item.content));
        }

        function writeModelSolution(item, index) {
            let msElem = xmlDoc.createElement("model-solution");
            msElem.setAttribute("id", item.id);
            msElem.setAttribute("comment", item.comment);
            modelsolutions.appendChild(msElem);
        }

        function writeTest(item, index) {
            let testElem = xmlDoc.createElement("test");
            testElem.setAttribute("id", item.id);
            testElem.appendChild(xmlDoc.createTextNode('title', item.title));
            testElem.appendChild(xmlDoc.createTextNode('test-type', item.testtype));

            tests.appendChild(testElem);
        }

        try {

            let fruitDocType = document.implementation.createDocumentType ("fruit", "SYSTEM", "<!ENTITY tf 'tropical fruit'>");

            xmlDoc = document.implementation.createDocument("", "task", null);
            //var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');

            tests = xmlDoc.createElement("tests");
            xmlDoc.documentElement.appendChild(tests);
            this.tests.forEach(writeTest);

            modelsolutions = xmlDoc.createElement("model-solutions");
            xmlDoc.documentElement.appendChild(modelsolutions);
            this.modelsolutions.forEach(writeModelSolution);

            files = xmlDoc.createElement("files");
            xmlDoc.documentElement.appendChild(files);
            this.files.forEach(writeFile);


            var serializer = new XMLSerializer();
            return serializer.serializeToString (xmlDoc);
        } catch (err){
            alert (err);
            setErrorMessage("Error while parsing the xml file. The file has not been imported.". err);
            return; // Stop. Do not make any further changes.
        }
    }
}