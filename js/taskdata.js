

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
                case 'unit':
                    return 'urn:proforma:tests:unittest:v1';
                case 'dns':
                    return 'urn:proforma:task:v1.0.1';
                case 'unit':
                    return 'urn:proforma:tests:unittest:v1';
                case 'jartest':
                    return 'urn:proforma:tests:jartest:v1';
                case 'praktomat':
                    return 'urn:proforma:praktomat:v0.2';
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

// task data structures
class TaskFileRef {
    constructor() {
        this.refid = null;
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
            return; // Stop. Do not make any further changes.
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

/*                let unitNode = xmlReader.readSingleNode("unit:unittest", configNode);
                test.unitTest = new TaskUnitTest();
                test.unitTest.framework = xmlReader.readSingleText("@framework", unitNode);
                test.unitTest.version = xmlReader.readSingleText("@version", unitNode);
                test.unitTest.mainClass = xmlReader.readSingleText("unit:main-class", unitNode);
*/
/*
                let praktomatNode = xmlReader.readSingleNode("unit:unittest", configNode);
                test.praktomatTest = new TaskPraktomatTest();
                test.praktomatTest.public = xmlReader.readSingleText("praktomat:public", praktomatNode);
                test.praktomatTest.required = xmlReader.readSingleText("praktomat:required", praktomatNode);
                test.praktomatTest.always = xmlReader.readSingleText("praktomat:always", praktomatNode);
                test.praktomatTest.description = xmlReader.readSingleText("praktomat:config-testDescription", praktomatNode);
                test.praktomatTest.maxCheckstyleWarnings = xmlReader.readSingleText("max-checkstyle-warnings", praktomatNode);
*/
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