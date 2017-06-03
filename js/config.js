/**
 * Created by KarinBorm on 29.05.2017.
 */

const useCodemirror = true;  // setting this to false turns Codemirror off

// The values of these variables can be changed as needed.
const version094    = 'taskxml0.9.4.xsd';                // name of schema files
const version101    = 'taskxml1.0.1.xsd';
const xsdSchemaFile = version101;                        // choose version

// -------------------------
// NAMESPACE HANDLING
// -------------------------
const pfix_unit = "unit";        // fixing namespace prefixes because of
const pfix_jart = "jartest";     // browser compatibility and jquery limitations
const pfix_prak = "praktomat";

const isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
console.log("isFirefox value = " + isFirefox);

var ns_unit = "";
var ns_praktomat = "";
if (isFirefox) {
    ns_praktomat = pfix_prak + "\\:";
    ns_unit = pfix_unit + "\\:";
    var ns_jartest = pfix_jart + "\\:";
}

// not really configuration but ....
if (xsdSchemaFile == version094) {
    var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:unittest" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.1" ' +
        'xmlns="urn:proforma:task:v0.9.4" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
} else {
    var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:tests:unittest:v1" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.2" '
        + 'xmlns="urn:proforma:task:v1.0.1" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
}


const tNsREUnittest = 'urn:proforma:(tests:)?unittest';
const tNsREJartest  = 'urn:proforma:tests:jartest';
const tNsREPraktomat = 'urn:proforma:praktomat';
// nötig, um die Namespaces in den Griff zukriegen. Mehr weiß ich auch nicht...
namespaceRE = [
    [tNsREUnittest,  pfix_unit],
    [tNsREJartest, pfix_jart],
    [tNsREPraktomat, pfix_prak],
];



// -------------------------
// TESTS
// -------------------------

// HTML building blocks for the extra fields in tests
const uiTextJavaComp = "<p><label for='xml_pr_CompilerFlags'>Compiler Flags: </label>"+
        "<input class='tinyinput xml_pr_CompilerFlags'/>"+
        " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
        "<input class='tinyinput xml_pr_CompilerOutputFlags'/>"+
        " <label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
        "<input class='shortinput xml_pr_CompilerLibs' value='JAVA_LIBS'/>"+
        " <label for='xml_pr_CompilerFPatt'>Compiler File Pattern: </label>"+
        "<input class='shortinput xml_pr_CompilerFPatt' value='^.*\\.[jJ][aA][vV][aA]$'/></p>";


const uiTextJavaJunit = "<p><label for='xml_ju_mainclass'>Test class (no extension)<span class='red'>*</span>: </label>"+
    "<input class='mediuminput xml_ju_mainclass'/>"+
    " <label for='xml_ju_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_framew'><option selected='selected' value='JUnit'>JUnit</option></select>"+
    " <label for='xml_ju_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_version'><option value='4.12'>4.12</option><option selected='selected' value='4.10'>4.10</option>"+
    "<option value='3'>3</option></select></p>"+
    "<p><label for='xml_pr_configDescription'>Test description: </label>"+
    "<input class='largeinput xml_pr_configDescription'/></p>";

const uiTextSetlX =  "<p><label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
    " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

const uiTextJavaCheckst = "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_CS_version'><option selected='selected' value='6.2'>6.2</option></select>"+
    " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";



const java_JUnit_Default_Title = "Java JUnit Test";


// XML templates for praktomat
const tPrakVer      = '<praktomat:version/>';
const tPubReqAlways = '<praktomat:public>True</praktomat:public>'+
    '<praktomat:required>True</praktomat:required>'+
    '<praktomat:always>True</praktomat:always>';
const tCompFlags    = '<praktomat:config-CompilerFlags/><praktomat:config-CompilerOutputFlags/>' +
    '<praktomat:config-CompilerLibs/><praktomat:config-CompilerFilePattern/>';
const tConfTestDesc = '<praktomat:config-testDescription/>';
const tCSWarnings   = '<praktomat:max-checkstyle-warnings/>';

// other XML templates
const tJUnitVer = '<unit:unittest framework="junit" version="4.10"><unit:main-class></unit:main-class></unit:unittest>';
const tSetLxVer = '<jartest:jartest framework="setlX" version ="2.40"></jartest:jartest>';


// testtypes used
const TT_JAVA_COMP      = "java-compilation";
const TT_JUNIT          = "unittest";
const TT_JARTEST        = "jartest";
const TT_CHECKSTYLE     = "java-checkstyle";
const TT_DEJAGNU_SETUP  = "dejagnu-setup";
const TT_DEJAGNU_TESTER = "dejagnu-tester";
const TT_PYTHON         = "python";
//    "dejagnu" ??

// template names for XML
const T_JAVA_COMP   = "JavaCompile";
const T_JUNIT       = "JavaJunit";
const T_SETLX       = "SetlX";
const T_CHECKSTYLE  = "CheckStyle";
const T_DG_SETUP    = "DGSetup";
const T_DG_TESTER   = "DGTester";
const T_PYTHON      = "Python";

testInfos = [
    new TestInfo("addJavaComp","Java Compiler Test", uiTextJavaComp, TT_JAVA_COMP, T_JAVA_COMP, tPubReqAlways +tCompFlags, "", false),
    new TestInfo("addJavaJunit",java_JUnit_Default_Title, uiTextJavaJunit, TT_JUNIT, T_JUNIT, tPubReqAlways + tConfTestDesc, tJUnitVer),
    new TestInfo("addPythonTest","Python Test", "", TT_PYTHON, T_PYTHON, tPubReqAlways, ""),
    new TestInfo("addSetlX","SetlX Test", uiTextSetlX, TT_JARTEST, T_SETLX, tPubReqAlways, tSetLxVer), // zunächst den jartest, der auch beim Einlesen erzeugt werden soll
    new TestInfo("addSetlXSynt","SetlX Syntax Test", uiTextSetlX, TT_JARTEST , T_SETLX, tPubReqAlways, tSetLxVer, true,
        function(testId) {
            // add file for the test
            const filename = 'setlxsyntaxtest.stlx';
            createFileWithContent(filename, 'print("");');
            // add file reference
            addFileReferenceToTest(testId, filename);
            // set test title
            getTestField(testId, ".xml_test_title").val("SetlX-Syntax-Test");
        }
    ),
    new TestInfo("addCheckStyle","CheckStyle Test", uiTextJavaCheckst, TT_CHECKSTYLE, T_CHECKSTYLE, tPubReqAlways + tCSWarnings, tPrakVer),
    new TestInfo("addDGSetup","DejaGnu Setup", "", TT_DEJAGNU_SETUP, T_DG_SETUP, tPubReqAlways, ""),
    new TestInfo("addDGTester","DejaGnu Tester", "", TT_DEJAGNU_TESTER, T_DG_TESTER, tPubReqAlways, ""),
];

// -------------------------
// MAPPING UI ELEMENT <-> XML
// -------------------------

// UI <-> XML mapping
uiXmlMapList = [
    // JUnit test
    new UiXmlMap(MapType.CHILD_ELEM,  new ValMap(".xml_ju_mainclass",ns_unit+"main-class","test-configuration",0,".xml_test")),
    new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_ju_framew","framework",ns_unit+"unittest",0,".xml_test","test")),
    new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_ju_version","version",ns_unit+"unittest",0,".xml_test","test")),
    // Jatest
    new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_jt_framew","framework",ns_jartest+"jartest",0,".xml_test","test")),
    new UiXmlMap(MapType.ATTR_TEST_ELEMS, new ValMap(".xml_jt_version","version",ns_jartest+"jartest",0,".xml_test","test")),

    // Praktomat
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerFlags",ns_praktomat+"config-CompilerFlags","test test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerOutputFlags",ns_praktomat+"config-CompilerOutputFlags","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerLibs",ns_praktomat+"config-CompilerLibs","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerFPatt",ns_praktomat+"config-CompilerFilePattern","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_configDescription",ns_praktomat+"config-testDescription","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_public",ns_praktomat+"public","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_required",ns_praktomat+"required","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_always",ns_praktomat+"always","test-meta-data",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CS_version",ns_praktomat +"version","test-configuration",0,".xml_test")),
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CS_warnings",ns_praktomat +"max-checkstyle-warnings","test-configuration",0,".xml_test")),


];

if (xsdSchemaFile == version094)
    uiXmlMapList.push(new UiXmlMap(MapType.SINGLE_ELEM, new ValMap("#xml_upload-mime-type",ns_praktomat+"allowed-upload-filename-mimetypes","",0)));


// -------------------------------
// SUPPORTED PROGRAMMING LANGUAGES
// -------------------------------

proglangInfos = [
  new ProglangInfo("java/1.6", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("java/1.8", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("python/2", ["addPythonTest", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("setlX/2.40", ["addSetlX", "addSetlXSynt", "addCheckStyle", "addDGSetup", "addDGTester"]),
];

// -------------------------
// XML
// -------------------------

// do not rename!
const tExtraTemplateTopLevel = '<praktomat:allowed-upload-filename-mimetypes>(text/.*)</praktomat:allowed-upload-filename-mimetypes>';


// -------------------------
// overload functions for further activities
// -------------------------
function createFurtherUiElements() {
    insertLCformelements();
}

function createFurtherOutput(tempvals) {
    if (xsdSchemaFile == version101) {
        createLONCAPAOutput(tempvals[0],codemirror,"101");
    } else {
        createLONCAPAOutput(tempvals[0],codemirror,"old");
    }
}