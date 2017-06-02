/**
 * Created by KarinBorm on 29.05.2017.
 */

const usePraktomat = true;
const useCodemirror = true;  // setting this to false turns Codemirror off
const useLoncapa = true;    // setting this to false turns LON-CAPA elements off

// The values of these variables can be changed as needed.
const version094    = 'taskxml0.9.4.xsd';                // name of schema files
const version101    = 'taskxml1.0.1.xsd';
const xsdSchemaFile = version101;                        // choose version


const pfix_unit = "unit";        // fixing namespace prefixes because of
const pfix_jart = "jartest";     // browser compatibility and jquery limitations
const pfix_prak = "praktomat";

const isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+

var ns_unit = "";
if (usePraktomat) { var ns_praktomat = ""; }
if (isFirefox) {
    if (usePraktomat) { ns_praktomat = pfix_prak + "\\:"; }
    ns_unit = pfix_unit + "\\:";
    var ns_jartest = pfix_jart + "\\:";
}

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


// classes
function TestInfo(buttonJQueryId,title, area, testType, testTemplate, withFileRef, onButtonClicked) {
    this.buttonJQueryId   = buttonJQueryId;
    this.title = title;
    this.testArea = area;
    this.testType = testType;
    this.testTemplate = testTemplate;
    if (!testTemplate)
        throw "Configuration Error: TestInfo incomplete";
    this.withFileRef = withFileRef;
    if (withFileRef == null)
        this.withFileRef = true; // use filerefs
    this.onCreated = onButtonClicked;
}

function ProglangInfo(name, tests) {
    this.name   = name;
    this.tests = tests;
}


function ValMap(fname,xname,pname,cdata,fcont,lelem,lattr) {
    this.formname = fname; // name in formular
    this.xmlname = xname;  // element or attribute name in task.xml
    this.xmlpath = pname;  // parent element in task.xml
    this.cdata = cdata;    // create as CDATA in task.xml (bool)
    this.formcontainer = fcont;  // ToDo: use this more ?
    this.listelem = lelem;       // only for mapSubElemListArray,  mapAttrOfTestElems
    this.listattr = lattr;       // only for mapSubElemListArray
}


const MapType = {
    CHILD_ELEM: 0,
    ATTR_OF_TEST_ELEMS: 1,
    SINGLE_ELEM: 2
};
function UiXmlMap(mappingType, valmap) {
    this.mappingType = mappingType;
    this.valmap = valmap;
}
// UI <-> XML mapping
uiXmlMapList = [
    // JUnit test
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_ju_mainclass",ns_unit+"main-class","test-configuration",0,".xml_test")),
    new UiXmlMap(MapType.ATTR_OF_TEST_ELEMS, new ValMap(".xml_ju_framew","framework",ns_unit+"unittest",0,".xml_test","test")),
    new UiXmlMap(MapType.ATTR_OF_TEST_ELEMS, new ValMap(".xml_ju_version","version",ns_unit+"unittest",0,".xml_test","test")),
    // Jatest
    new UiXmlMap(MapType.ATTR_OF_TEST_ELEMS, new ValMap(".xml_jt_framew","framework",ns_jartest+"jartest",0,".xml_test","test")),
    new UiXmlMap(MapType.ATTR_OF_TEST_ELEMS, new ValMap(".xml_jt_version","version",ns_jartest+"jartest",0,".xml_test","test")),

    // Praktomat
    new UiXmlMap(MapType.CHILD_ELEM, new ValMap(".xml_pr_CompilerFlags",ns_praktomat + "config-CompilerFlags","test test-meta-data",0,".xml_test")),
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


// HTML building blocks for the extra fields in tests
const TextJavaComp = "<p><label for='xml_pr_CompilerFlags'>Compiler Flags: </label>"+
        "<input class='tinyinput xml_pr_CompilerFlags'/>"+
        " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
        "<input class='tinyinput xml_pr_CompilerOutputFlags'/>"+
        " <label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
        "<input class='shortinput xml_pr_CompilerLibs' value='JAVA_LIBS'/>"+
        " <label for='xml_pr_CompilerFPatt'>Compiler File Pattern: </label>"+
        "<input class='shortinput xml_pr_CompilerFPatt' value='^.*\\.[jJ][aA][vV][aA]$'/></p>";


const TextJavaJunit = "<p><label for='xml_ju_mainclass'>Test class (no extension)<span class='red'>*</span>: </label>"+
    "<input class='mediuminput xml_ju_mainclass'/>"+
    " <label for='xml_ju_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_framew'><option selected='selected' value='JUnit'>JUnit</option></select>"+
    " <label for='xml_ju_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_version'><option value='4.12'>4.12</option><option selected='selected' value='4.10'>4.10</option>"+
    "<option value='3'>3</option></select></p>"+
    "<p><label for='xml_pr_configDescription'>Test description: </label>"+
    "<input class='largeinput xml_pr_configDescription'/></p>";

const TextSetlX =  "<p><label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
    " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

const TextJavaCheckst = "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_CS_version'><option selected='selected' value='6.2'>6.2</option></select>"+
    " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";



const java_JUnit_Default_Title = "Java JUnit Test";


testInfos = [
    new TestInfo("addJavaComp","Java Compiler Test", TextJavaComp, TT_JAVA_COMP, T_JAVA_COMP, false),
    new TestInfo("addJavaJunit",java_JUnit_Default_Title, TextJavaJunit, TT_JUNIT, T_JUNIT),
    new TestInfo("addPythonTest","Python Test", "", TT_PYTHON, T_PYTHON),
    new TestInfo("addSetlX","SetlX Test", TextSetlX, TT_JARTEST, T_SETLX), // zunächst den jartest, der auch beim Einlesen erzeugt werden soll
    new TestInfo("addSetlXSynt","SetlX Syntax Test", TextSetlX, TT_JARTEST , T_SETLX, true,
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
    new TestInfo("addCheckStyle","CheckStyle Test", TextJavaCheckst, TT_CHECKSTYLE, T_CHECKSTYLE),
    new TestInfo("addDGSetup","DejaGnu Setup", "", TT_DEJAGNU_SETUP, T_DG_SETUP),
    new TestInfo("addDGTester","DejaGnu Tester", "", TT_DEJAGNU_TESTER, T_DG_TESTER),
];




proglangInfos = [
  new ProglangInfo("java/1.6", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("java/1.8", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("python/2", ["addPythonTest", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("setlX/2.40", ["addSetlX", "addSetlXSynt", "addCheckStyle", "addDGSetup", "addDGTester"]),
];

