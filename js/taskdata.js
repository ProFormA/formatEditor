

// helper class
class XmlReader {
    constructor(xmlText) {
        this.xmlDoc = new DOMParser().parseFromString(xmlText,'text/xml');
        if (!this.xmlDoc.evaluate) {
            alert('XPATH not supported');
            return;
        }

        this.rootNode = this.xmlDoc;

        this.nsResolver = function (prefix) {
            switch (prefix) {
                case 'unit':      return 'urn:proforma:tests:unittest:v1';
                case 'dns':       return 'urn:proforma:task:v1.0.1';
                case 'jartest':   return 'urn:proforma:tests:jartest:v1';
                case 'praktomat': return 'urn:proforma:praktomat:v0.2';
                default:
                    return '';
            }
        };
    }

    setRootNode(node) {
        this.rootNode = node;
    }

    readSingleNode(xpath, node) {
        const nodes = this.xmlDoc.evaluate(xpath, node?node:this.rootNode, this.nsResolver,
            XPathResult.UNORDERED_NODE_ITERATOR_TYPE /*FIRST_ORDERED_NODE_TYPE*/, null);
        return nodes.iterateNext(); // .singleNodeValue;
    }


    readSingleText(xpath, node) {
        const nodes = this.xmlDoc.evaluate(xpath, node?node:this.rootNode, this.nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (nodes.singleNodeValue)
            return nodes.singleNodeValue.textContent;
        else
            return null;
    }

    readNodes(xpath, node) {
        return this.xmlDoc.evaluate(xpath, node?node:this.rootNode, this.nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    }
}


class XmlWriter {
    constructor(xmlDoc, ns) {
        this.xmlDoc = xmlDoc;
        this.ns = ns;
    }

    createTextElement(node, tag, value, ns = undefined, cdata = false) {
        let newTag = this.xmlDoc.createElementNS(ns?ns:this.ns, tag);
        if (cdata)
            newTag.appendChild(this.xmlDoc.createCDATASection(value));
        else
            newTag.appendChild(this.xmlDoc.createTextNode(value));
        node.appendChild(newTag);
        return newTag;
    }
}

// task data structures
class TaskFileRef {
    constructor(id) {
        this.refid = id;
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

        this.praktomatTest = null;
        this.unitTest = null;

        this.writeCallback = null;
        this.uiElement = null;

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


    findFilenameForId(id) {
        let filename = undefined;
        this.files.forEach(function(item) {
            if (item.id === id) {
                filename = item.filename;
            }
        });
        return filename;
    }

    readTestConfig(xmlfile, testid, callback, testroot) {
        try {

            let xmlReader = new XmlReader(xmlfile);
            xmlReader.setRootNode(xmlReader.readSingleNode("/dns:task/dns:tests/dns:test[@id="+testid+"]"));
            let configNodeNode = xmlReader.readSingleNode("dns:test-configuration");
            callback(this.tests[testid], xmlReader, configNodeNode, testroot);
        } catch (err){
            alert (err);
            setErrorMessage("Error while parsing the test configuration in xml file. ". err);
        }
    }

    readXml(xmlfile) {

        function readFileRefs(xmlReader, element, thisNode) {
            let fileRefIterator = xmlReader.readNodes("./dns:filerefs/dns:fileref", thisNode);
            let fileRefNode = fileRefIterator.iterateNext();
            let counter = 0;
            while (fileRefNode) {
                let fileRef = new TaskFileRef();
                fileRef.refid = xmlReader.readSingleText("@refid", fileRefNode);
                element.filerefs[counter++] = fileRef;
                fileRefNode = fileRefIterator.iterateNext();
            }
        }

        try {

            let xmlReader = new XmlReader(xmlfile);
            xmlReader.setRootNode(xmlReader.readSingleNode("/dns:task")); // => shorter xpaths

            this.title = xmlReader.readSingleText("./dns:meta-data/dns:title");
            this.description = xmlReader.readSingleText("./dns:description");
            this.proglang = xmlReader.readSingleText("./dns:proglang");
            this.proglangVersion = xmlReader.readSingleText("./dns:proglang/@version");
            this.uuid = xmlReader.readSingleText("./@uuid");
            this.lang = xmlReader.readSingleText("./@lang");
            this.sizeSubmission = xmlReader.readSingleText("./dns:submission-restrictions/dns:regexp-restriction/@max-size");
            this.mimeTypeRegExpSubmission = xmlReader.readSingleText("./dns:submission-restrictions/dns:regexp-restriction/@mime-type-regexp");

            // read files
            let iterator = xmlReader.readNodes("./dns:files/dns:file");
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
            iterator = xmlReader.readNodes("./dns:model-solutions/dns:model-solution");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let modelSolution = new TaskModelSolution();
                modelSolution.id = xmlReader.readSingleText("@id", thisNode);
                modelSolution.comment = xmlReader.readSingleText("@comment", thisNode);
                readFileRefs(xmlReader, modelSolution, thisNode);
                this.modelsolutions[modelSolution.id] = modelSolution;
                thisNode = iterator.iterateNext();
            }

            // read test(s)
            iterator = xmlReader.readNodes("./dns:tests/dns:test");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let test = new TaskTest();
                test.id = xmlReader.readSingleText("@id", thisNode);
                test.title = xmlReader.readSingleText("dns:title", thisNode);
                test.testtype = xmlReader.readSingleText("dns:test-type", thisNode);

                let configIterator = xmlReader.readNodes("./dns:test-configuration", thisNode);
                let configNode = configIterator.iterateNext();
                readFileRefs(xmlReader, test, configNode);

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
        let xmlWriter = null;
        const xmlns = "urn:proforma:task:v1.0.1";
        //const praktomatns = "urn:proforma:praktomat:v0.2";

        function writeFile(item, index) {
            let fileElem = xmlDoc.createElementNS(xmlns, "file");
            fileElem.setAttribute("class", item.fileclass);
            fileElem.setAttribute("comment", item.comment);
            fileElem.setAttribute("filename", item.filename);
            fileElem.setAttribute("id", item.id);
            fileElem.setAttribute("type", item.filetype);
            files.appendChild(fileElem);
            if (item.filetype === 'embedded')
                fileElem.appendChild(xmlDoc.createCDATASection(item.content));
        }



        function writeModelSolution(item, index) {
            function writeFileref(item, index) {
                if (item.refid) {
                    let fileref = xmlDoc.createElementNS(xmlns, "fileref");
                    fileref.setAttribute("refid", item.refid);
                    filerefs.appendChild(fileref);
                }
            }
            let msElem = xmlDoc.createElementNS(xmlns, "model-solution");
            msElem.setAttribute("comment", item.comment);
            msElem.setAttribute("id", item.id);
            modelsolutions.appendChild(msElem);
            let filerefs = xmlDoc.createElementNS(xmlns, "filerefs");
            msElem.appendChild(filerefs);
            item.filerefs.forEach(writeFileref);
            // remove filerefs is no fileref available
            let childs = filerefs.getElementsByTagName('fileref');
            if (childs.length === 0) {
                msElem.removeChild(filerefs);
            }

        }

        function writeTest(item, index) {
            function writeFileref(item, index) {
                if (item.refid) {
                    let fileref = xmlDoc.createElementNS(xmlns, "fileref");
                    fileref.setAttribute("refid", item.refid);
                    filerefs.appendChild(fileref);
                }
            }
            let testElem = xmlDoc.createElementNS(xmlns, "test");
            testElem.setAttribute("id", item.id);
            xmlWriter.createTextElement(testElem, 'title', item.title);
            xmlWriter.createTextElement(testElem, 'test-type', item.testtype);
            let config = xmlDoc.createElementNS(xmlns, "test-configuration");
            testElem.appendChild(config);
            let filerefs = xmlDoc.createElementNS(xmlns, "filerefs");
            config.appendChild(filerefs);
            item.filerefs.forEach(writeFileref);
            // remove filerefs is no fileref available
            let childs = filerefs.getElementsByTagName('fileref');
            if (childs.length === 0) {
                config.removeChild(filerefs);
            }

            tests.appendChild(testElem);
            if (item.writeCallback) {
                item.writeCallback(item, item.uiElement, config, xmlDoc, xmlWriter);
            }
        }

        try {

            // let fruitDocType = document.implementation.createDocumentType ("fruit", "SYSTEM", "<!ENTITY tf 'tropical fruit'>");

            //xmlDoc = document.implementation.createDocument("", "", null);
            //let task = xmlDoc.createElement("task"); // documentElement;
            //xmlDoc.appendChild(task);


            //var xmlns = document.createElementNS("urn:proforma:task:v1.0.1", null);
            xmlDoc = document.implementation.createDocument(xmlns, "task", null);
            //xmlDoc = document.implementation.createDocument("urn:proforma:task:v1.0.1", "task", null);
            let task = xmlDoc.documentElement;

            task.setAttribute("lang", this.lang);
            task.setAttribute("uuid", this.uuid);
            config.writeNamespaces(task);


            //task.setAttribute("xmlns", "urn:proforma:task:v1.0.1");
            //task.setAttributeNS(config.praktomatns, 'xsi:schemaLocation', 'http://example.com/n1 schema.xsd');



            xmlWriter = new XmlWriter(xmlDoc, xmlns);
            //var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');

            xmlWriter.createTextElement(task, 'description', this.description, undefined, true);
            let proglang = xmlWriter.createTextElement(task, 'proglang', this.proglang);
            proglang.setAttribute("version", this.proglangVersion);

            let submission = xmlDoc.createElementNS(xmlns, "submission-restrictions");
            task.appendChild(submission);
            let regexp = xmlDoc.createElementNS(xmlns, "regexp-restriction");
            submission.appendChild(regexp);
            regexp.setAttribute("max-size", this.sizeSubmission);
            regexp.setAttribute("mime-type-regexp", this.mimeTypeRegExpSubmission);

/*
            this.title = xmlReader.readSingleText("./dns:meta-data/dns:title");
            this.description = xmlReader.readSingleText("./dns:description");
            this.proglang = xmlReader.readSingleText("./dns:proglang");
            this.proglangVersion = xmlReader.readSingleText("./dns:proglang/@version");
            this.uuid = xmlReader.readSingleText("./@uuid");
            this.lang = xmlReader.readSingleText("./@lang");
            this.sizeSubmission = xmlReader.readSingleText("./dns:submission-restrictions/dns:regexp-restriction/@max-size");
            this.mimeTypeRegExpSubmission = xmlReader.readSingleText("./dns:submission-restrictions/dns:regexp-restriction/@mime-type-regexp");
*/

            files = xmlDoc.createElementNS(xmlns, "files");
            task.appendChild(files);
            this.files.forEach(writeFile);

            modelsolutions = xmlDoc.createElementNS(xmlns, "model-solutions");
            task.appendChild(modelsolutions);
            this.modelsolutions.forEach(writeModelSolution);

            tests = xmlDoc.createElementNS(xmlns, "tests");
            task.appendChild(tests);
            this.tests.forEach(writeTest);

            task.appendChild(xmlDoc.createElementNS(xmlns, "grading-hints")); // dummy

            let metadata = xmlDoc.createElementNS(xmlns, "meta-data");
            task.appendChild(metadata);
            xmlWriter.createTextElement(metadata, 'title', this.title);
            config.writeXmlExtra(metadata, xmlDoc, xmlWriter);
            //xmlWriter.createTextElement(metadata, 'praktomat:allowed-upload-filename-mimetypes', '(text/.*)');

            let serializer = new XMLSerializer();
            let result = serializer.serializeToString (xmlDoc);

            if ((result.substring(0, 5) != "<?xml")){
                result = '<?xml version="1.0"?>' + result;
                // result = "<?xml version='1.0' encoding='UTF-8'?>" + result;
            }
            return result;
        } catch (err){
            alert (err);
            setErrorMessage("Error while parsing the xml file. The file has not been imported.". err, err);
            return '';
        }
    }
}