/**
 * Created by KarinBorm on 29.05.2017.
 */

// The values of these variables can be changed as needed.
const useCodemirror = true;         // setting this to false turns Codemirror off
const xsdSchemaFile = version101;   // choose version for output

// -------------------------
// NAMESPACE HANDLING
// -------------------------
var xsdNamespace = (function() {

    // XSD namespaces
    const pfix_unit = "unit";        // fixing namespace prefixes because of
    const pfix_jart = "jartest";     // browser compatibility and jquery limitations
    const pfix_prak = "praktomat";


    var ns_unit = "";
    var ns_praktomat = "";
// if (isFirefox) // this code must be include for newer version os Chrome!
    {
        ns_praktomat = pfix_prak + "\\:";
        ns_unit = pfix_unit + "\\:";
        var ns_jartest = pfix_jart + "\\:";
    }

    var namespace;

    function getNamespace() {
        if (namespace)
            return namespace;
        init();
        return namespace;
    }

    function init() {
        // not really configuration but ....
        if (xsdSchemaFile === version094) {
            namespace = 'xmlns:'+pfix_unit+'="urn:proforma:unittest" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.1" ' +
                'xmlns="urn:proforma:task:v0.9.4" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
        } else {
            namespace = 'xmlns:'+pfix_unit+'="urn:proforma:tests:unittest:v1" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.2" '
                + 'xmlns="urn:proforma:task:v1.0.1" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
        }
    }

    // nötig, um die Namespaces in den Griff zukriegen. Mehr weiß ich auch nicht...
    const tNsREUnittest  = 'urn:proforma:(tests:)?unittest';
    const tNsREJartest   = 'urn:proforma:tests:jartest';
    const tNsREPraktomat = 'urn:proforma:praktomat';

    namespaceRE = [
        [tNsREUnittest,  pfix_unit],
        [tNsREJartest,   pfix_jart],
        [tNsREPraktomat, pfix_prak],
    ];


    return {
        unit: ns_unit,
        praktomat: ns_praktomat,
        jartest: ns_jartest,
        namespaceRE: namespaceRE,
        namespace: getNamespace()
    }

})();








// testtypes used
const xmlTesttypeJavaComp = "java-compilation"; // do not change, is used in task.js (TODO)





var config = (function() {

    // XML templates for praktomat
    const xmlPrakVer      = '<praktomat:version/>';
    const xmlPubReqAlways = '<praktomat:public>True</praktomat:public>'+
        '<praktomat:required>True</praktomat:required>'+
        '<praktomat:always>True</praktomat:always>';
    const xmlCompFlags    = '<praktomat:config-CompilerFlags/><praktomat:config-CompilerOutputFlags/>' +
        '<praktomat:config-CompilerLibs/><praktomat:config-CompilerFilePattern/>';
    const xmlConfTestDesc = '<praktomat:config-testDescription/>';
    const xmlCSWarnings   = '<praktomat:max-checkstyle-warnings/>';
    // other XML templates
    const xmlJUnitVer = '<unit:unittest framework="junit" version="4.10"><unit:main-class></unit:main-class></unit:unittest>';
    const xmlSetLxVer = '<jartest:jartest framework="setlX" version ="2.40"></jartest:jartest>';
    // -------------------------
    // TESTS
    // -------------------------

// HTML building blocks for the extra input fields in tests
    const htmlJavaComp =
        "<p><label for='xml_pr_CompilerFlags'>Compiler Flags: </label>"+
        "<input class='shortinput xml_pr_CompilerFlags'/>"+
        " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
        "<input class='shortinput xml_pr_CompilerOutputFlags' title='-o %s (%s will be replaced by program name)'/></p>"+
        " <p><label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
        "<input class='shortinput xml_pr_CompilerLibs' value='JAVA_LIBS'/>"+
        " <label for='xml_pr_CompilerFPatt'>Compiler File Pattern: </label>"+
        "<input class='mediuminput xml_pr_CompilerFPatt' value='^.*\\.[jJ][aA][vV][aA]$' " +
        "title='Regular expression describing all source files to be passed to the compiler'/></p>";


    const htmlJavaJunit = "<p><label for='xml_ju_mainclass'>Test class (no extension)<span class='red'>*</span>: </label>"+
        "<input class='mediuminput xml_ju_mainclass'/>"+
        " <label for='xml_ju_framew'>Framework<span class='red'>*</span>: </label>"+
        "<select class='xml_ju_framew'><option selected='selected' value='JUnit'>JUnit</option></select>"+
        " <label for='xml_ju_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_ju_version'>" +
        "<option value='4.12'>4.12</option>" +
        "<option value='4.12-gruendel'>4.12-gruendel</option>" +
        "<option selected='selected' value='4.10'>4.10</option>"+
        "<option value='3'>3</option>" +
        "</select></p>"+
        "<p><label for='xml_pr_configDescription'>Test description: </label>"+
        "<input class='largeinput xml_pr_configDescription'/></p>";

    const htmlSetlX =  "<p><label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
        " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

    const htmlCheckstyle = "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
        "<select class='xml_pr_CS_version'>" +
        "<option value='5.4'>5.4</option>" +
        "<option selected='selected' value='6.2'>6.2</option>" +
        "<option value='7.6'>7.6</option>" +
        "</select>"+
        " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
        "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";

    const JUnit_Default_Title = "Java JUnit Test";

    // Tests objects
    const testJavaComp    = new TestInfo("Java Compiler Test", htmlJavaComp,
        xmlTesttypeJavaComp, xmlPubReqAlways + xmlCompFlags, "", false);
    const testJavaJUnit   = new TestInfo(JUnit_Default_Title, htmlJavaJunit,
        "unittest", xmlPubReqAlways + xmlConfTestDesc, xmlJUnitVer);
    const testCheckStyle  = new TestInfo("CheckStyle Test", htmlCheckstyle,
        "java-checkstyle", xmlPubReqAlways + xmlCSWarnings, xmlPrakVer);
    const testPython      = new TestInfo("Python Test", "",
        "python", xmlPubReqAlways, "");
    const testDgSetup     = new TestInfo("DejaGnu Setup", "",
        "dejagnu-setup", xmlPubReqAlways, "");
    const testDGTester    = new TestInfo("DejaGnu Tester", "",
        "dejagnu-tester", xmlPubReqAlways, "");
    const testSetlX       = new TestInfo("SetlX Test", htmlSetlX,
        "jartest", xmlPubReqAlways, xmlSetLxVer);
    const testSetlXSyntax = new TestInfo("SetlX Syntax Test", htmlSetlX,
        "jartest" , xmlPubReqAlways, xmlSetLxVer, true,
        function(testId) {
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
        new ProglangInfo("java/1.6",   [testJavaComp, testJavaJUnit,   testCheckStyle, testDgSetup, testDGTester]),
        new ProglangInfo("java/1.8",   [testJavaComp, testJavaJUnit,   testCheckStyle, testDgSetup, testDGTester]),
        new ProglangInfo("python/2",   [testPython,   testCheckStyle,  testDgSetup,    testDGTester]),
        new ProglangInfo("setlX/2.40", [testSetlX,    testSetlXSyntax, testCheckStyle, testDgSetup, testDGTester]),
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
        testCheckStyle,
        testDgSetup, testDGTester
    ];

    // list of XML schema files that shall be used for validation
    const xsds = [
        xsdSchemaFile, // XSD for task.xml (default)
        // "praktomat.xsd"
        // .... TODO
    ];


    // UI <-> XML mapping
    function createMappingList(xsdSchemaFile) {
        uiXmlMapList = [
            // JUnit test
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_ju_mainclass", xsdNamespace.unit + "main-class", "test-configuration", 0, ".xml_test")),
            new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_ju_framew", "framework", xsdNamespace.unit + "unittest", 0, ".xml_test", "test")),
            new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_ju_version", "version", xsdNamespace.unit + "unittest", 0, ".xml_test", "test")),
            // Jatest
            new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_jt_framew", "framework", xsdNamespace.jartest + "jartest", 0, ".xml_test", "test")),
            new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_jt_version", "version", xsdNamespace.jartest + "jartest", 0, ".xml_test", "test")),

            // Praktomat
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerFlags", xsdNamespace.praktomat + "config-CompilerFlags", "test test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerOutputFlags", xsdNamespace.praktomat + "config-CompilerOutputFlags", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerLibs", xsdNamespace.praktomat + "config-CompilerLibs", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerFPatt", xsdNamespace.praktomat + "config-CompilerFilePattern", "test-meta-data", 1, ".xml_test")), // use CDATA
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_configDescription", xsdNamespace.praktomat + "config-testDescription", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_public", xsdNamespace.praktomat + "public", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_required", xsdNamespace.praktomat + "required", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_always", xsdNamespace.praktomat + "always", "test-meta-data", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CS_version", xsdNamespace.praktomat + "version", "test-configuration", 0, ".xml_test")),
            new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CS_warnings", xsdNamespace.praktomat + "max-checkstyle-warnings", "test-configuration", 0, ".xml_test")),
        ];
        if (xsdSchemaFile === version094)
            uiXmlMapList.push(new UiXmlMap(MapType.SINGLE_ELEM, new ValMap("#xml_upload-mime-type",xsdNamespace.praktomat+"allowed-upload-filename-mimetypes","",0)));

        return uiXmlMapList;
    }


    // -------------------------
    // overload functions for further activities
    // -------------------------
    function createFurtherUiElements() {
        insertLCformelements();
    }

    function createFurtherOutput(tempvals) {
        if (xsdSchemaFile === version101) {
            createLONCAPAOutput(tempvals[0],codemirror,"101");
        } else {
            createLONCAPAOutput(tempvals[0],codemirror,"old");
        }
    }

    function getMimetype(mimetype, extension) {
        switch (extension) {
            case 'c':    return 'text/x-csrc';
            case 'java': return 'text/x-java';
            case 'py':   return 'text/x-python';
            case 'stlx':   return 'text/x-setlx'; // no actual mode availble
            default: return mimetype;
        }
    }

    function isBinaryFile(file, mimetype) {
        if (mimetype && mimetype.match(/(text\/)/i))  // mimetype is 'text/...'
            return false;

        const extension = file.name.split('.').pop();
        switch (extension.toLowerCase()) {
            case 'java' :
            case 'log' :
            case 'txt' :
            case 'xml' :
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
        createMappingList: createMappingList,
        createFurtherUiElements: createFurtherUiElements,
        createFurtherOutput: createFurtherOutput,
        getMimetype: getMimetype,
        isBinaryFile: isBinaryFile,
        handleFilenameChangeInTest: handleFilenameChangeInTest,
        // data
        proglangInfos: proglangInfos,
        testInfos: testInfos,
        xsds: xsds
    }
})();





// -------------------------
// XML
// -------------------------

// do not rename!
const tExtraTemplateTopLevel = '<praktomat:allowed-upload-filename-mimetypes>(text/.*)</praktomat:allowed-upload-filename-mimetypes>';


