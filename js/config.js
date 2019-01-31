/*
 * This proformaEditor was created by the eCULT-Team of Ostfalia University
 * http://ostfalia.de/cms/de/ecult/
 * The software is distributed under a CC BY-SA 3.0 Creative Commons license
 * https://creativecommons.org/licenses/by-sa/3.0/
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Author:
 * Karin Borm (Dr. Uta Priss)
 */


const configXsdSchemaFile = version101;   // choose version for output
/*
    version094:
        namespace = 'xmlns:'+pfix_unit+'="urn:proforma:unittest" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.1" ' +
            'xmlns="urn:proforma:task:v0.9.4" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
    version101:
        namespace = 'xmlns:'+pfix_unit+'="urn:proforma:tests:unittest:v1" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.2" '
            + 'xmlns="urn:proforma:task:v1.0.1" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
*/


const config = (function(testConfigNode) {
    const praktomatns     = "urn:proforma:praktomat:v0.2";
    const jartestns       = "urn:proforma:tests:jartest:v1";
    const unittestns_old  = "urn:proforma:tests:unittest:v1";
    const unittestns_new  = "urn:proforma:tests:unittest:v1.1";
    const checkstylens    = "urn:proforma:tests:java-checkstyle:v1.1";

    function writeNamespaces(task) {
        //task.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:jartest', jartestns);
        //task.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:praktomat', praktomatns);
/*
        task.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:unit", unittestns_new);
        task.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:cs", checkstylens);
*/
    }

    function resolveNamespace(prefix, defaultns) {
        switch (defaultns) {
            case 'urn:proforma:task:v1.0.1':
                switch (prefix) {
                    case 'unit':      return unittestns_old;
                    case 'jartest':   return jartestns;
                    case 'praktomat': return praktomatns;
                }
                return '';
            case 'urn:proforma:v2.0':
                switch (prefix) {
                    case 'unit':      return unittestns_new;
                    case 'cs':        return checkstylens;
                    case 'jartest':   return jartestns;
                }
                return '';
            default:
                return 'unsupported namespace'
        }
    }

    function writeXmlExtra(metaDataNode, xmlDoc, xmlWriter) {
        //xmlWriter.createTextElement(metaDataNode, 'praktomat:allowed-upload-filename-mimetypes', '(text/.*)', praktomatns);
    }
/*
    readXml(xmlfile) {
        let xmlReader = new XmlReader(xmlfile);
        switch (xmlReader.defaultns) {
            case 'urn:proforma:task:v1.0.1': return this.readXmlVersion101(xmlfile);
            case 'urn:proforma:v2.0': return this.readXmlVersion2(xmlfile);
            default:
                setErrorMessage("Unsupported ProFormA version " + xmlReader.defaultns);
        }
    }
*/
    // -------------------------
    // TESTS
    // -------------------------
    // HTML building blocks for the extra input fields in tests

    const htmlJavaJunit = // htmlPraktomat +
        "<p><label for='xml_ju_mainclass'>Entry Point<span class='red'>*</span>: </label>"+
        "<input class='mediuminput xml_ju_mainclass' " +
        "title='usually name of class containing main method, including full package path (e.g. de.ostfalia.zell.editor)'/>"+
        " <label for='xml_ju_framew'>Framework<span class='red'>*</span>: </label>"+
        "<select class='xml_ju_framew'><option selected='selected' value='JUnit'>JUnit</option></select>"+
        " <label for='xml_ju_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_ju_version'>" +
        "<option value='4.12'>4.12</option>" +
        "<option value='4.12-gruendel'>4.12-gruendel</option>" +
        "<option selected='selected' value='4.10'>4.10</option>"+
        "<option value='3'>3</option>" +
        "</select></p>";
//        "<p><label for='xml_pr_configDescription'>Test description: </label>"+
//        "<input class='largeinput xml_pr_configDescription'/></p>";

    const htmlSetlX =  //htmlPraktomat +
        "<p><label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
        " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

    const htmlCheckstyle = //htmlPraktomat +
        "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_pr_CS_version'>" +
        "<option value='5.4'>5.4</option>" +
        "<option selected='selected' value='6.2'>6.2</option>" +
        "<option value='7.6'>7.6</option>" +
        "</select>"+
        " <label for='xml_pr_CS_warnings'> Maximum warnings allowed<span class='red'>*</span>: </label>"+
        "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";

    const JUnit_Default_Title = "JUnit Test";

    // default grading weights
    const weightCompilation = 0;
    const weightStaticTest = 0.2;


    // Tests objects

    class CCompilerTest extends CustomTest {
        constructor() {
            super("C Compiler Test", "c-compilation", '' /*htmlCComp*/);
            //this.withFileRef = false;
            this.gradingWeight = weightCompilation;
        }
    }
    class JavaCompilerTest extends CustomTest {
        constructor() {
            super("Compiler Test", "java-compilation", '' /*htmlJavaComp*/);
            //this.withFileRef = false;
            this.gradingWeight = weightCompilation;
            this.manadatoryFile = false;
        }
    }

    class JUnitTest extends CustomTest  {
        constructor() {
            super(JUnit_Default_Title, "unittest", htmlJavaJunit);
            this.fileRefLabel = 'Junit and other File';
        }
        onReadXml(test, xmlReader, testConfigNode, testroot) {
            let unitNode = xmlReader.readSingleNode("unit:unittest", testConfigNode);

            switch (unitNode.namespaceURI) {
                case unittestns_old:
                    $(testroot).find(".xml_ju_mainclass").val(xmlReader.readSingleText("unit:main-class", unitNode));
                    break;
                case unittestns_new:
                    $(testroot).find(".xml_ju_mainclass").val(xmlReader.readSingleText("unit:entry-point", unitNode));
                    break;
                default:
                    throw new Error('unsupported namespace ' + xmlReader.defaultns + ' in JUnitTest');
            }

            $(testroot).find(".xml_ju_version").val(xmlReader.readSingleText("@version", unitNode));
            $(testroot).find(".xml_ju_framew").val(xmlReader.readSingleText("@framework", unitNode));
        }
        onWriteXml(test, uiElement, testConfigNode, xmlDoc, xmlWriter, task) {
            let root = uiElement.root;
            task.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:unit", unittestns_new);

            let unittestNode = xmlDoc.createElementNS(unittestns_new, "unit:unittest");
            testConfigNode.appendChild(unittestNode);

            xmlWriter.createTextElement(unittestNode, 'unit:entry-point', $(root).find(".xml_ju_mainclass").val(), unittestns_new);
            unittestNode.setAttribute("framework", $(root).find(".xml_ju_framew").val());
            unittestNode.setAttribute("version", $(root).find(".xml_ju_version").val());

//            let childs = testConfigNode.getElementsByTagName('test-meta-data');

            // remove description completely ???
//        xmlWriter.createTextElement(childs[0], 'praktomat:config-testDescription', $(root).find(".xml_pr_configDescription").val(), praktomatns);
//        xmlWriter.createTextElement(childs[0], 'praktomat:config-testDescription', '', praktomatns);
        }
    }
    class CheckstyleTest extends CustomTest {
        constructor() {
            super("CheckStyle Test", "java-checkstyle", htmlCheckstyle);
            this.gradingWeight = weightStaticTest;
            this.fileRefLabel = 'Configuration File';
        }

        onReadXml(test, xmlReader, testConfigNode, testroot) {
            let csNode = xmlReader.readSingleNode("cs:java-checkstyle", testConfigNode);
            if (!csNode) {
                // task version 1.0.1
                // todo: check version
                let praktomatNode = xmlReader.readSingleNode("dns:test-meta-data", testConfigNode);
                $(testroot).find(".xml_pr_CS_warnings").val(xmlReader.readSingleText("praktomat:max-checkstyle-warnings", praktomatNode));
                $(testroot).find(".xml_pr_CS_version").val(xmlReader.readSingleText("praktomat:version", testConfigNode));
            } else {
                switch (csNode.namespaceURI) {
                    case checkstylens:
                        $(testroot).find(".xml_pr_CS_version").val(xmlReader.readSingleText("@version", csNode));
                        $(testroot).find(".xml_pr_CS_warnings").val(xmlReader.readSingleText("cs:max-checkstyle-warnings", csNode));
                        break;
                    default:
                        throw new Error('unsupported namespace ' + xmlReader.defaultns + ' in JUnitTest');
                }
            }
        }

        onWriteXml(test, uiElement, testConfigNode, xmlDoc, xmlWriter, task) {
            let root = uiElement.root;
            task.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:cs", checkstylens);

            let csNode = xmlDoc.createElementNS(checkstylens, "cs:java-checkstyle");
            testConfigNode.appendChild(csNode);

            xmlWriter.createTextElement(csNode, 'cs:max-checkstyle-warnings', $(root).find(".xml_pr_CS_warnings").val(), checkstylens);
            csNode.setAttribute("version", $(root).find(".xml_pr_CS_version").val());

/*
            xmlWriter.createTextElement(testConfigNode, 'cs:version', $(root).find(".xml_pr_CS_version").val(), checkstylens);
            let childs = testConfigNode.getElementsByTagName('test-meta-data');
            xmlWriter.createTextElement(childs[0], "cs:max-checkstyle-warnings", $(root).find(".xml_pr_CS_warnings").val(), checkstylens);
*/
        }
    }
    class PythonTest extends CustomTest {
        constructor() {
            super("Python Test", "python", '' /*htmlPraktomat*/);
        }
    }
    class DgSetupTest extends CustomTest {
        constructor() {
            super("DejaGnu Setup", "dejagnu-setup", '' /*htmlPraktomat*/);
            this.gradingWeight = weightCompilation;
        }
    }
    class DgTesterTest extends CustomTest {
        constructor() {
            super("DejaGnu Tester", "dejagnu-tester", /*htmlPraktomat*/);
        }
    }
    class setlXTest extends CustomTest {
        constructor() {
            super("SetlX Test", "jartest", htmlSetlX);
        }
    }
    class setlXSyntaxTest extends CustomTest {
        constructor() {
            super("SetlX Syntax Test", "jartest", htmlSetlX);
            this.gradingWeight = weightCompilation;
        }
        onCreate(testId) {
            //this.initPraktomatTest(testId);
            // add file for the test
            const filename = 'setlxsyntaxtest.stlx';
            createFileWithContent(filename, 'print("");');
            // add file reference
            addFileReferenceToTest(testId, filename);
            // set test title
            getTestField(testId, ".xml_test_title").val("SetlX-Syntax-Test");
        }
    }


    const testCComp       = new CCompilerTest();
    const testJavaComp    = new JavaCompilerTest();
    const testJavaJUnit   = new JUnitTest();
    const testCheckStyle  = new CheckstyleTest();
    const testPython      = new PythonTest();
    const testDgSetup     = new DgSetupTest(DgSetupTest);
    const testDGTester    = new DgTesterTest(DgTesterTest);
    const testSetlX       = new setlXTest(setlXTest);
    const testSetlXSyntax = new setlXSyntaxTest();

    // -------------------------------
    // SUPPORTED PROGRAMMING LANGUAGES
    // -------------------------------
    const proglangInfos = [
        new ProglangInfo("java/1.6",   [testJavaComp, testJavaJUnit,   testCheckStyle]),
        new ProglangInfo("java/1.8",   [testJavaComp, testJavaJUnit,   testCheckStyle]),
        new ProglangInfo("python/2",   [testPython,   testCheckStyle ]),
        new ProglangInfo("setlX/2.40", [testSetlX,    testSetlXSyntax, testCheckStyle]),
        // TODO
        new ProglangInfo("c",          [testCComp, testDgSetup, testDGTester]),
    ];


    // -------------------------------
    // Test buttons
    // -------------------------------
    // Reihenfolge: in der Reihenfolge, in der die Test in testInfos angelegt werden, werden auch die Testbuttons erzeugt!
    // beachten, das bei gleichen XML-Testtypen derjenige zuerst eingetragen wird, der ein Einlesen einer Datei erzeugt werden soll.
    const testInfos = [
        testJavaComp, testJavaJUnit,
        testPython,
        testSetlX, testSetlXSyntax,
        testCComp,
        testCheckStyle,
        testDgSetup, testDGTester
    ];

    // list of XML schema files that shall be used for validation
    const xsds = [
        // "proforma-test.xsd",
//        "xsd/proforma-unittest.xsd",
//        "xsd/proforma-checkstyle.xsd"
    ];


    // -------------------------
    // overload functions for further activities
    // -------------------------
    function createFurtherUiElements() {
        // LON-Capa weill be no longer supported
        //insertLCformelements();
    }


    function getMimetype(mimetype, extension) {
        switch (extension) {
            case 'h':    return 'text/x-chdr';
            case 'c':    return 'text/x-csrc';
            case 'cpp':  return 'text/x-c++src';
            case 'java': return 'text/x-java';
            case 'py':   return 'text/x-python';
            case 'stlx': return 'text/x-setlx'; // no actual mode availble
            default: return mimetype;
        }
    }

    function isBinaryFile(file, mimetype) {
        if (mimetype && mimetype.match(/(text\/)/i))  // mimetype is 'text/...'
            return false;

        const extension = file.name.split('.').pop();
        switch (extension.toLowerCase()) {
            case 'c' :
            case 'h' :
            case 'cpp' :
            case 'java' :
            case 'log' :
            case 'txt' :
            case 'xml' :
            case 'csv' :
                return false;
            default: break;
        }
        return true;
    }

    function handleFilenameChangeInTest(newFilename, tempSelElem) {
        function setJavaClassname(newFilename) {
            // set classname if file belongs to JUNIT and if exactly one file is assigned
            let testBox = $(tempSelElem).closest(".xml_test");
            const ui_classname = $(testBox).find(".xml_ju_mainclass");
            if (ui_classname.length === 1) {
                $.each(ui_classname, function(index, element) {
                    let currentFilename = $(element).val();
                    if (!readXmlActive)
                        $(element).val(javaParser.getFullClassnameFromFilename(newFilename)).change();
                });
            }
        }

        function setJUnitDefaultTitle(newFilename) {
            // set decsription according to classname
            let testBox = $(tempSelElem).closest(".xml_test");
            const ui_title = $(testBox).find(".xml_test_title");
            if (ui_title.length === 1) {
                $.each(ui_title, function(index, element) {
                    let currentTitle = $(element).val();
                    if (!readXmlActive && currentTitle === JUnit_Default_Title)
                        $(element).val("Junit Test " + javaParser.getPureClassnameFromFilename(newFilename)).change();
                });
            }
        }

        setJavaClassname(newFilename);
        setJUnitDefaultTitle(newFilename);
    }

    // -------------------------
    // expose to public (interface)
    // -------------------------
    return {
        // methods
        createFurtherUiElements: createFurtherUiElements,
        getMimetype: getMimetype,
        isBinaryFile: isBinaryFile,
        handleFilenameChangeInTest: handleFilenameChangeInTest,
        writeXmlExtra: writeXmlExtra,
        writeNamespaces: writeNamespaces,
        resolveNamespace: resolveNamespace,
        // data
        proglangInfos: proglangInfos,
        testInfos: testInfos,
        xsds: xsds,
        // switches, constants...
        useCodemirror: true,         // setting this to false turns Codemirror off
        xsdSchemaFile: configXsdSchemaFile,
        maxSizeForEditor: 100000, // maximum file size to enable editing
    }
})();

