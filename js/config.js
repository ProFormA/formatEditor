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


var config = (function(testConfigNode) {
    const praktomatns = "urn:proforma:praktomat:v0.2";
    const jartestns   = "urn:proforma:tests:jartest:v1";
    const unittestns  = "urn:proforma:tests:unittest:v1";

    function writeNamespaces(task) {
        task.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:jartest', jartestns);
        task.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:praktomat', praktomatns);
        task.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:unit", unittestns);
    }

    function resolveNamespace(prefix) {
        switch (prefix) {
            case 'unit':      return unittestns;
            case 'jartest':   return jartestns;
            case 'praktomat': return praktomatns;
            default: return '';
        }
    }

    // xml test writer
    function writePraktomat(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {
        let root = uiElement.root;

        let metaData = xmlDoc.createElementNS(xmlWriter.ns, "test-meta-data");
        testConfigNode.appendChild(metaData);

        xmlWriter.createTextElement(metaData, 'praktomat:public', $(root).find(".xml_pr_public")[0].checked?'True':'False', praktomatns);
        xmlWriter.createTextElement(metaData, 'praktomat:required', $(root).find(".xml_pr_required")[0].checked?'True':'False', praktomatns);
        xmlWriter.createTextElement(metaData, 'praktomat:always', $(root).find(".xml_pr_always").val(), praktomatns);
    }

    function writeUnitTest(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {
        let root = uiElement.root;

        let unittestNode = xmlDoc.createElementNS(unittestns, "unit:unittest");
        testConfigNode.appendChild(unittestNode);

        xmlWriter.createTextElement(unittestNode, 'unit:main-class', $(root).find(".xml_ju_mainclass").val(), unittestns);
        unittestNode.setAttribute("framework", $(root).find(".xml_ju_framew").val());
        unittestNode.setAttribute("version", $(root).find(".xml_ju_version").val());

        writePraktomat(test, uiElement, testConfigNode, xmlDoc, xmlWriter);
        let childs = testConfigNode.getElementsByTagName('test-meta-data');

        // remove description completely ???
//        xmlWriter.createTextElement(childs[0], 'praktomat:config-testDescription', $(root).find(".xml_pr_configDescription").val(), praktomatns);
//        xmlWriter.createTextElement(childs[0], 'praktomat:config-testDescription', '', praktomatns);
    }
    function writePraktomatCheckStyle(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {
        let root = uiElement.root;

        xmlWriter.createTextElement(testConfigNode, 'praktomat:version', $(root).find(".xml_pr_CS_version").val(), praktomatns);

        writePraktomat(test, uiElement, testConfigNode, xmlDoc, xmlWriter);
        let childs = testConfigNode.getElementsByTagName('test-meta-data');
        xmlWriter.createTextElement(childs[0], "praktomat:max-checkstyle-warnings", $(root).find(".xml_pr_CS_warnings").val(), praktomatns);
    }
    function writePraktomatCompiler(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {
        let root = uiElement.root;

        writePraktomat(test, uiElement, testConfigNode, xmlDoc, xmlWriter);
        let childs = testConfigNode.getElementsByTagName('test-meta-data');
        xmlWriter.createTextElement(childs[0], "praktomat:config-CompilerFlags", $(root).find(".xml_pr_CompilerFlags").val(), praktomatns);
        xmlWriter.createTextElement(childs[0], "praktomat:config-CompilerOutputFlags", $(root).find(".xml_pr_CompilerOutputFlags").val(), praktomatns);
        xmlWriter.createTextElement(childs[0], "praktomat:config-CompilerLibs", $(root).find(".xml_pr_CompilerLibs").val(), praktomatns);
        xmlWriter.createCDataElement(childs[0], "praktomat:config-CompilerFilePattern", $(root).find(".xml_pr_CompilerFPatt").val(), praktomatns);
    }

    function writePraktomatJar(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {
        let root = uiElement.root;
        let jartest = xmlDoc.createElementNS(jartestns, "jartest:jartest");
        testConfigNode.appendChild(jartest);
        jartest.setAttribute("framework", $(root).find(".xml_jt_framew").val());
        jartest.setAttribute("version", $(root).find(".xml_jt_version").val());

        writePraktomat(test, uiElement, testConfigNode, xmlDoc, xmlWriter);
    }

    function writeXmlExtra(metaDataNode, xmlDoc, xmlWriter) {
        xmlWriter.createTextElement(metaDataNode, 'praktomat:allowed-upload-filename-mimetypes', '(text/.*)', praktomatns);
    }

    // xml test reader
    function readPraktomat(test, xmlReader, testConfigNode, testroot) {
        initPraktomatTest(test.id)
        let praktomatNode = xmlReader.readSingleNode("dns:test-meta-data", testConfigNode);

        $(testroot).find(".xml_pr_always").val(xmlReader.readSingleText("praktomat:always", praktomatNode));
        $(testroot).find(".xml_pr_public")[0].checked = (xmlReader.readSingleText("praktomat:public", praktomatNode)==='True');
        $(testroot).find(".xml_pr_required")[0].checked = (xmlReader.readSingleText("praktomat:required", praktomatNode)==='True');
        // version 1.0.1: read description from praktomat and copy to test description
        let description = xmlReader.readSingleText("praktomat:config-testDescription", praktomatNode);
        if (description && !test.description)
            test.description = description;
//        $(testroot).find(".xml_pr_configDescription").val(xmlReader.readSingleText("praktomat:config-testDescription", praktomatNode));
    }

    function readUnitTest(test, xmlReader, testConfigNode, testroot) {
        let unitNode = xmlReader.readSingleNode("unit:unittest", testConfigNode);

        $(testroot).find(".xml_ju_mainclass").val(xmlReader.readSingleText("unit:main-class", unitNode));
        $(testroot).find(".xml_ju_version").val(xmlReader.readSingleText("@version", unitNode));
        $(testroot).find(".xml_ju_framew").val(xmlReader.readSingleText("@framework", unitNode));

        readPraktomat(test, xmlReader, testConfigNode, testroot);
    }

    function readPraktomatCheckStyle(test, xmlReader, testConfigNode, testroot) {
        readPraktomat(test, xmlReader, testConfigNode, testroot);

        let praktomatNode = xmlReader.readSingleNode("dns:test-meta-data", testConfigNode);
        $(testroot).find(".xml_pr_CS_warnings").val(xmlReader.readSingleText("praktomat:max-checkstyle-warnings", praktomatNode));
        $(testroot).find(".xml_pr_CS_version").val(xmlReader.readSingleText("praktomat:version", testConfigNode));
    }

    function readPraktomatCompiler(test, xmlReader, testConfigNode, testroot) {
        readPraktomat(test, xmlReader, testConfigNode, testroot);

        let praktomatNode = xmlReader.readSingleNode("dns:test-meta-data", testConfigNode);

        $(testroot).find(".xml_pr_CompilerFlags").val(xmlReader.readSingleText("praktomat:config-CompilerFlags", praktomatNode));
        $(testroot).find(".xml_pr_CompilerOutputFlags").val(xmlReader.readSingleText("praktomat:config-CompilerOutputFlags", praktomatNode));
        $(testroot).find(".xml_pr_CompilerLibs").val(xmlReader.readSingleText("praktomat:config-CompilerLibs", praktomatNode));
        $(testroot).find(".xml_pr_CompilerFPatt").val(xmlReader.readSingleText("praktomat:config-CompilerFilePattern", praktomatNode));
    }

    // -------------------------
    // TESTS
    // -------------------------
    const htmlPraktomat =
        "<p>" +
        " Public:<input type='checkbox' class='xml_pr_public' checked title='results are shown to the students'>" +
        " Required:<input type='checkbox' class='xml_pr_required' checked title='test must be passed in order to pass the task'>" +

        " <label for='xml_pr_always'>Always: </label>"+
        "<select class='xml_pr_always'>"+
        "<option selected='selected'>True</option><option>False</option></select>" +

        "</p>";


    // HTML building blocks for the extra input fields in tests
    const htmlJavaComp = htmlPraktomat +
        "<p><label for='xml_pr_CompilerFlags'>Compiler flags: </label>"+
        "<input class='shortinput xml_pr_CompilerFlags'/>"+
        " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
        "<input class='shortinput xml_pr_CompilerOutputFlags' title='-o %s (%s will be replaced by program name)'/></p>"+
        " <p><label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
        "<input class='shortinput xml_pr_CompilerLibs' value='JAVA_LIBS'/>"+
        " <label for='xml_pr_CompilerFPatt'>Compiler file pattern: </label>"+
        "<input class='mediuminput xml_pr_CompilerFPatt' value='^.*\\.[jJ][aA][vV][aA]$' " +
        "title='Regular expression describing all source files to be passed to the compiler'/></p>";

    const htmlCComp = htmlPraktomat +
        "<p><label for='xml_pr_CompilerFlags'>Compiler flags: </label>"+
        "<input class='shortinput xml_pr_CompilerFlags' value='-Wall'/>"+
        " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
        "<input class='shortinput xml_pr_CompilerOutputFlags' value='-o %s' " +
        "title='-o %s (%s will be replaced by program name)'/></p>"+
        " <p><label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
        "<input class='shortinput xml_pr_CompilerLibs' value=''/>"+
        " <label for='xml_pr_CompilerFPatt'>Compiler file pattern: </label>"+
        "<input class='mediuminput xml_pr_CompilerFPatt' value='^[a-zA-Z0-9_]*\\.[cC]$' " +
        "title='Regular expression describing all source files to be passed to the compiler'/></p>";


    const htmlJavaJunit = htmlPraktomat +
        "<p><label for='xml_ju_mainclass'>Test class<span class='red'>*</span>: </label>"+
        "<input class='mediuminput xml_ju_mainclass' title='normally filename without extension'/>"+
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

    const htmlSetlX =  htmlPraktomat +
        "<p><label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
        " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

    const htmlCheckstyle = htmlPraktomat +
        "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_pr_CS_version'>" +
        "<option value='5.4'>5.4</option>" +
        "<option selected='selected' value='6.2'>6.2</option>" +
        "<option value='7.6'>7.6</option>" +
        "</select>"+
        " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
        "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";

    const JUnit_Default_Title = "Java JUnit Test";

    function initPraktomatTest(testId) {
        let test = TestWrapper.constructFromId(testId);
        test.root.find(".xml_pr_always").hide();
        test.root.find("label[for='xml_pr_always']").hide();
    }

    // Tests objects
    class PraktomatTest extends CustomTest {
        constructor(title, testType, extraFields) {
            super(title, testType, extraFields);
        }
        onCreate(testId) {initPraktomatTest(testId);}
        onReadXml(test, xmlReader, testConfigNode, testroot) {
            readPraktomatCompiler(test, xmlReader, testConfigNode, testroot); }
        onWriteXml() {
            writePraktomatCompiler(test, uiElement, testConfigNode, xmlDoc, xmlWriter); }
    }


    class CCompilerTest extends PraktomatTest {
        constructor() {
            super("C Compiler Test", "c-compilation", htmlCComp);
            this.withFileRef = false;
        }
    }
    class JavaCompilerTest extends PraktomatTest {
        constructor() {
            super("Java Compiler Test", "java-compilation", htmlJavaComp);
            this.withFileRef = false;
        }
    }
    class JUnitTest extends PraktomatTest {
        constructor() {
            super(JUnit_Default_Title, "unittest", htmlJavaJunit);
        }
        onReadXml(test, xmlReader, testConfigNode, testroot) {
            readUnitTest(test, xmlReader, testConfigNode, testroot); }
        onWriteXml() {
            writeUnitTest(test, uiElement, testConfigNode, xmlDoc, xmlWriter); }
    }
    class CheckstyleTest extends PraktomatTest {
        constructor() {
            super("CheckStyle Test", "java-checkstyle", htmlCheckstyle);
        }
        onReadXml(test, xmlReader, testConfigNode, testroot) {
            readPraktomatCheckStyle(test, xmlReader, testConfigNode, testroot); }
        onWriteXml() {
            writePraktomatCheckStyle(test, uiElement, testConfigNode, xmlDoc, xmlWriter); }
    }
    class PythonTest extends PraktomatTest {
        constructor() {
            super("Python Test", "python", htmlPraktomat);
        }
    }
    class DgSetupTest extends PraktomatTest {
        constructor() {
            super("DejaGnu Setup", "dejagnu-setup", htmlPraktomat);
        }
    }
    class DgTesterTest extends PraktomatTest {
        constructor() {
            super("DejaGnu Tester", "dejagnu-setup", htmlPraktomat);
        }
    }
    class setlXTest extends PraktomatTest {
        constructor() {
            super("SetlX Test", "jartest", htmlSetlX);
        }
        onWriteXml() {
            writePraktomatJar(test, uiElement, testConfigNode, xmlDoc, xmlWriter); }
    }
    class setlXSyntaxTest extends PraktomatTest {
        constructor() {
            super("SetlX Syntax Test", "jartest", htmlSetlX);
            this.onButtonClicked = function(testId) {
                initPraktomatTest(testId);
                // add file for the test
                const filename = 'setlxsyntaxtest.stlx';
                createFileWithContent(filename, 'print("");');
                // add file reference
                addFileReferenceToTest(testId, filename);
                // set test title
                getTestField(testId, ".xml_test_title").val("SetlX-Syntax-Test");
            }
        }
        onWriteXml() {
            writePraktomatJar(test, uiElement, testConfigNode, xmlDoc, xmlWriter); }
    }


    const testCComp       = new TestInfo("C Compiler Test", htmlCComp,
        "c-compilation", false, readPraktomatCompiler, writePraktomatCompiler, initPraktomatTest);
    const testJavaComp    = new TestInfo("Java Compiler Test", htmlJavaComp,
        "java-compilation", false, readPraktomatCompiler, writePraktomatCompiler, initPraktomatTest);
    const testJavaJUnit   = new TestInfo(JUnit_Default_Title, htmlJavaJunit,
        "unittest", true, readUnitTest, writeUnitTest, initPraktomatTest);
    const testCheckStyle  = new TestInfo("CheckStyle Test", htmlCheckstyle,
        "java-checkstyle", true, readPraktomatCheckStyle,
        writePraktomatCheckStyle, initPraktomatTest);
    const testPython      = new TestInfo("Python Test", htmlPraktomat,
        "python", true, readPraktomat, writePraktomat, initPraktomatTest);
    const testDgSetup     = new TestInfo("DejaGnu Setup", htmlPraktomat,
        "dejagnu-setup", true, readPraktomat, writePraktomat, initPraktomatTest);
    const testDGTester    = new TestInfo("DejaGnu Tester", htmlPraktomat,
        "dejagnu-tester", true, readPraktomat, writePraktomat, initPraktomatTest);
    const testSetlX       = new TestInfo("SetlX Test", htmlSetlX,
        "jartest", true, readPraktomat, writePraktomatJar, initPraktomatTest);

    const testSetlXSyntax = new TestInfo("SetlX Syntax Test", htmlSetlX,
        "jartest" , true, readPraktomat, writePraktomatJar,
        function(testId) {
            initPraktomatTest(testId);
            // add file for the test
            const filename = 'setlxsyntaxtest.stlx';
            createFileWithContent(filename, 'print("");');
            // add file reference
            addFileReferenceToTest(testId, filename);
            // set test title
            getTestField(testId, ".xml_test_title").val("SetlX-Syntax-Test");
        }
    );




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
        // configXsdSchemaFile,
        //"praktomat.xsd"
        // .... TODO
    ];


    // -------------------------
    // overload functions for further activities
    // -------------------------
    function createFurtherUiElements() {
        insertLCformelements();
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
            var testBox = $(tempSelElem).closest(".xml_test");
            var ui_classname = $(testBox).find(".xml_ju_mainclass");
            if (ui_classname.length === 1) {
                $.each(ui_classname, function(index, element) {
                    var currentFilename = $(element).val();
                    if (!readXmlActive)
                        $(element).val(javaParser.getFullClassnameFromFilename(newFilename)).change();
                });
            }
        }

        function setJUnitDefaultTitle(newFilename) {
            // set decsription according to classname
            var testBox = $(tempSelElem).closest(".xml_test");
            var ui_title = $(testBox).find(".xml_test_title");
            if (ui_title.length === 1) {
                $.each(ui_title, function(index, element) {
                    var currentTitle = $(element).val();
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

