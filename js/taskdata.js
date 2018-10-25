

// helper class
class XmlReader {
    constructor(xmlText) {
        this.xmlDoc = new DOMParser().parseFromString(xmlText,'text/xml');
        if (!this.xmlDoc.evaluate) {
            alert('XPATH not supported');
            return;
        }

        /*
        var parser = new DOMParser();
        [
            '<task xmlns="urn:proforma:v2.0" lang="en"/>',
            '<task xmlns="urn:proforma:task:v1.0.1" lang="en" uuid="e7a50a36-e0b7-486f-be80-0f217e7bcb80" xmlns:jartest="urn:proforma:tests:jartest:v1" xmlns:praktomat="urn:proforma:praktomat:v0.2" xmlns:unit="urn:proforma:tests:unittest:v1"/>',
            '<ns:root xmlns:ns="example.com/ns2"/>'
        ].forEach(function(item) {
            var doc = parser.parseFromString(item, "application/xml");
            alert('result of doc.lookupNamespaceURI(null): |' + doc.lookupNamespaceURI(null) + '|');
        });

*/
        this.defaultns = this.xmlDoc.lookupNamespaceURI(null);
        //alert('result of doc.lookupNamespaceURI(null): |' + doc.lookupNamespaceURI(null) + '|');

        this.rootNode = this.xmlDoc;

        const defaultns = this.defaultns;
        this.nsResolver = function (prefix) {
            switch (prefix) {
                case 'dns': return defaultns; // 'urn:proforma:task:v1.0.1';
                default:    return config.resolveNamespace(prefix);
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

    createOptionalTextElement(node, tag, value, ns = undefined, cdata = false) {
        if (value === '')
            return;
        return this.createTextElement(node, tag, value, ns, cdata);
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
        this.description = "";
        this.comment = "";
        this.filerefs = [];
    }
}


class TaskTest {
    constructor() {
        this.id = null;
        this.title = null;
        this.testtype = null;
        this.filerefs = [];
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
            setErrorMessage("Error while parsing the test configuration in xml file. ". err, err);
        }
    }

    readXmlVersion101(xmlfile) {

        function readFileRefs(xmlReader, element, thisNode) {
            let fileRefIterator = xmlReader.readNodes("dns:filerefs/dns:fileref", thisNode);
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

            this.title = xmlReader.readSingleText("dns:meta-data/dns:title");
            this.description = xmlReader.readSingleText("dns:description");
            this.proglang = xmlReader.readSingleText("dns:proglang");
            this.proglangVersion = xmlReader.readSingleText("dns:proglang/@version");
            this.uuid = xmlReader.readSingleText("@uuid");
            this.lang = xmlReader.readSingleText("@lang");
            this.sizeSubmission = xmlReader.readSingleText("dns:submission-restrictions/dns:regexp-restriction/@max-size");
            this.mimeTypeRegExpSubmission = xmlReader.readSingleText("dns:submission-restrictions/dns:regexp-restriction/@mime-type-regexp");

            // read files
            let iterator = xmlReader.readNodes("dns:files/dns:file");
            let thisNode = iterator.iterateNext();
            while (thisNode) {
                let taskfile = new TaskFile();
                taskfile.id = xmlReader.readSingleText("@id", thisNode);
                taskfile.fileclass = xmlReader.readSingleText("@class", thisNode);
                taskfile.comment = xmlReader.readSingleText("@comment", thisNode);
                taskfile.filetype = xmlReader.readSingleText("@type", thisNode);
                taskfile.filename = xmlReader.readSingleText("@filename", thisNode);
                taskfile.content = thisNode.textContent;
                this.files[taskfile.id] = taskfile;
                thisNode = iterator.iterateNext();
            }

            // read model solutions(s)
            iterator = xmlReader.readNodes("dns:model-solutions/dns:model-solution");
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
            iterator = xmlReader.readNodes("dns:tests/dns:test");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let test = new TaskTest();
                test.id = xmlReader.readSingleText("@id", thisNode);
                test.title = xmlReader.readSingleText("dns:title", thisNode);
                test.testtype = xmlReader.readSingleText("dns:test-type", thisNode);

                let configIterator = xmlReader.readNodes("dns:test-configuration", thisNode);
                let configNode = configIterator.iterateNext();
                readFileRefs(xmlReader, test, configNode);

                this.tests[test.id] = test;
                thisNode = iterator.iterateNext();
            }

        } catch (err){
            //alert (err);
            setErrorMessage("Error while parsing the xml file. The file has not been imported.". err, err);
        }
    }


    readXmlVersion2(xmlfile) {

        function readFileRefs(xmlReader, element, thisNode) {
            let fileRefIterator = xmlReader.readNodes("dns:filerefs/dns:fileref", thisNode);
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

            this.title = xmlReader.readSingleText("dns:meta-data/dns:title");
            this.description = xmlReader.readSingleText("dns:description");
            this.proglang = xmlReader.readSingleText("dns:proglang");
            this.proglangVersion = xmlReader.readSingleText("dns:proglang/@version");
            this.uuid = xmlReader.readSingleText("@uuid");
            this.lang = xmlReader.readSingleText("@lang");
            this.sizeSubmission = xmlReader.readSingleText("dns:submission-restrictions/dns:regexp-restriction/@max-size");
            this.mimeTypeRegExpSubmission = xmlReader.readSingleText("dns:submission-restrictions/dns:regexp-restriction/@mime-type-regexp");

            // read files
            let iterator = xmlReader.readNodes("dns:files/dns:file");
            let thisNode = iterator.iterateNext();
            while (thisNode) {
                let taskfile = new TaskFile();
                taskfile.id = xmlReader.readSingleText("@id", thisNode);
                taskfile.fileclass = xmlReader.readSingleText("@class", thisNode);

                // todo:
                taskfile.comment = xmlReader.readSingleText("dns:internal-description", thisNode);
                let content = xmlReader.readSingleNode('*', thisNode); // nodeValue
                if (content) {
                    switch (content.nodeName) {
                        case "embedded-txt-file":
                            taskfile.filetype = 'embedded';
                            taskfile.filename = xmlReader.readSingleText("@filename", content);
                            taskfile.content = content.textContent;
                            break;
                        case "attached-bin-file":
                            taskfile.filetype = 'file';
                            taskfile.filename = content.textContent;
                            break;
                        default:
                            setErrorMessage("Unknown file type for file #". taskfile.id);
                    }
                } else {
                    setErrorMessage("No file content for file #". taskfile.id);
                }

/*
                let embeddedTextFile = xmlReader.readSingleNode("embedded-txt-file");
                if (embeddedTextFile) {
                    taskfile.filetype = 'embedded';
                    taskfile.filename = xmlReader.readSingleText("@filename", embeddedTextFile);
                    taskfile.content = embeddedTextFile.textContent;
                } else {
                    let attachedBinFile = xmlReader.readSingleNode("attached-bin-file");
                    if (attachedBinFile) {
                        taskfile.filetype = 'file';
                        taskfile.filename = xmlReader.readSingleText("@filename", attachedBinFile);
                    } else {
                        setErrorMessage("Unknown file type for file #". taskfile.id);
                    }
                }
*/


                this.files[taskfile.id] = taskfile;
                thisNode = iterator.iterateNext();
            }

            // read model solutions(s)
            iterator = xmlReader.readNodes("dns:model-solutions/dns:model-solution");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let modelSolution = new TaskModelSolution();
                modelSolution.id = xmlReader.readSingleText("@id", thisNode);
                modelSolution.description = xmlReader.readSingleText("dns:description", thisNode);
                modelSolution.comment = xmlReader.readSingleText("dns:internal-description", thisNode);
                readFileRefs(xmlReader, modelSolution, thisNode);
                this.modelsolutions[modelSolution.id] = modelSolution;
                thisNode = iterator.iterateNext();
            }

            // read test(s)
            iterator = xmlReader.readNodes("dns:tests/dns:test");
            thisNode = iterator.iterateNext();
            while (thisNode) {
                let test = new TaskTest();
                test.id = xmlReader.readSingleText("@id", thisNode);
                test.title = xmlReader.readSingleText("dns:title", thisNode);
                test.testtype = xmlReader.readSingleText("dns:test-type", thisNode);

                let configIterator = xmlReader.readNodes("dns:test-configuration", thisNode);
                let configNode = configIterator.iterateNext();
                readFileRefs(xmlReader, test, configNode);

                this.tests[test.id] = test;
                thisNode = iterator.iterateNext();
            }

       } catch (err){
           //alert (err);
           setErrorMessage("Error while parsing the xml file. The file has not been imported.". err, err);
       }
    }

    readXml(xmlfile) {
        let xmlReader = new XmlReader(xmlfile);
        switch (xmlReader.defaultns) {
            case 'urn:proforma:task:v1.0.1': return this.readXmlVersion101(xmlfile);
            case 'urn:proforma:v2.0': return this.readXmlVersion2(xmlfile);
            default:
                setErrorMessage("Unsupported ProFormA version " + xmlReader.defaultns);
        }
    }


    writeXml() {
        let xmlDoc = null;
        let files = null;
        let modelsolutions = null;
        let tests = null;
        let xmlWriter = null;
        const xmlns = "urn:proforma:v2.0";

        /* Version 1.0.1
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
        */

        // version 2.0
        function writeFile(item, index) {
            let fileElem = xmlDoc.createElementNS(xmlns, "file");
            fileElem.setAttribute("id", item.id);
            fileElem.setAttribute("class", item.fileclass);
            // fileElem.setAttribute("comment", item.comment);
            files.appendChild(fileElem);
            if (item.filetype === 'embedded') {
                let fileContentElem = xmlDoc.createElementNS(xmlns, "embedded-txt-file");
                fileContentElem.setAttribute("filename", item.filename);
                fileContentElem.appendChild(xmlDoc.createCDATASection(item.content));
                fileElem.appendChild(fileContentElem);
            } else {
                xmlWriter.createTextElement(fileElem, 'attached-bin-file', item.filename);
            }
            xmlWriter.createTextElement(fileElem, 'internal-description', item.comment);

        }

        function writeModelSolution(item, index) {
            function writeFileref(file, index) {
                if (file.refid) {
                    let fileref = xmlDoc.createElementNS(xmlns, "fileref");
                    fileref.setAttribute("refid", file.refid);
                    filerefs.appendChild(fileref);
                }
            }
            let msElem = xmlDoc.createElementNS(xmlns, "model-solution");
            // msElem.setAttribute("description", item.comment); // alt
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
            xmlWriter.createOptionalTextElement(msElem, 'description', item.description);
            xmlWriter.createOptionalTextElement(msElem, 'internal-description', item.comment);
        }

        function writeTest(item, index) {
            function writeFileref(file, index) {
                if (file.refid) {
                    let fileref = xmlDoc.createElementNS(xmlns, "fileref");
                    fileref.setAttribute("refid", file.refid);
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
            xmlDoc = document.implementation.createDocument(xmlns, "task", null);
            let task = xmlDoc.documentElement;

            task.setAttribute("lang", this.lang);
            task.setAttribute("uuid", this.uuid);
            config.writeNamespaces(task);

            xmlWriter = new XmlWriter(xmlDoc, xmlns);

            xmlWriter.createTextElement(task, 'description', this.description, undefined, true);
            let proglang = xmlWriter.createTextElement(task, 'proglang', this.proglang);
            proglang.setAttribute("version", this.proglangVersion);

            let submission = xmlDoc.createElementNS(xmlns, "submission-restrictions");
            task.appendChild(submission);
            let regexp = xmlDoc.createElementNS(xmlns, "regexp-restriction");
            submission.appendChild(regexp);
            regexp.setAttribute("max-size", this.sizeSubmission);
            regexp.setAttribute("mime-type-regexp", this.mimeTypeRegExpSubmission);

            files = xmlDoc.createElementNS(xmlns, "files");
            task.appendChild(files);
            this.files.forEach(writeFile);

            modelsolutions = xmlDoc.createElementNS(xmlns, "model-solutions");
            task.appendChild(modelsolutions);
            this.modelsolutions.forEach(writeModelSolution);

            tests = xmlDoc.createElementNS(xmlns, "tests");
            task.appendChild(tests);
            this.tests.forEach(writeTest);

            // dummy
            let gradinghints = xmlDoc.createElementNS(xmlns, "grading-hints");
            task.appendChild(gradinghints);
            // new for 2.0
            gradinghints.appendChild(xmlDoc.createElementNS(xmlns, "root"));


            let metadata = xmlDoc.createElementNS(xmlns, "meta-data");
            task.appendChild(metadata);
            xmlWriter.createTextElement(metadata, 'title', this.title);
            config.writeXmlExtra(metadata, xmlDoc, xmlWriter);
            //xmlWriter.createTextElement(metadata, 'praktomat:allowed-upload-filename-mimetypes', '(text/.*)');

            let serializer = new XMLSerializer();
            let result = serializer.serializeToString (xmlDoc);

            if ((result.substring(0, 5) !== "<?xml")){
                result = '<?xml version="1.0"?>' + result;
                // result = "<?xml version='1.0' encoding='UTF-8'?>" + result;
            }

            // validate output
            config.xsds.forEach(function(xsd_file, index) {
                $.get(xsd_file, function(data, textStatus, jqXHR) {      // read XSD schema
                    const valid = xmllint.validateXML({xml: result /*xmlString*/, schema: jqXHR.responseText});
                    if (valid.errors !== null) {                                // does not conform to schema
                        setErrorMessage("Errors in XSD-Validation: ");
                        valid.errors.some(function(error, index) {
                            setErrorMessage(error);
                            return index > 15;
                        })

                    }
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    setErrorMessage("XSD-Schema " + xsd_file + " not found.", errorThrown);
                });
            });

            return result;
        } catch (err){
            setErrorMessage("Error while parsing the xml file. The file has not been imported.". err, err);
            return '';
        }
    }
}