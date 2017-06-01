/**
 * Created by KarinBorm on 29.05.2017.
 */

const usePraktomat = true;
const useCodemirror = true;  // setting this to false turns Codemirror off
const useLoncapa = true;    // setting this to false turns LON-CAPA elements off


// testtypes used
const TT_JAVA           = "java-compilation";
const TT_JUNIT          = "unittest";
const TT_JARTEST        = "jartest";
const TT_CHECKSTYLE     = "java-checkstyle";
const TT_DEJAGNU_SETUP  = "dejagnu-setup";
const TT_DEJAGNU_TESTER = "dejagnu-tester";
const TT_PYTHON         = "python";
//    "dejagnu" ??


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

// HTML building blocks for the tests
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
    new TestInfo("addJavaComp","Java Compiler Test", TextJavaComp, TT_JAVA, "JavaCompile", false),
    new TestInfo("addJavaJunit",java_JUnit_Default_Title, TextJavaJunit, TT_JUNIT, "JavaJunit"),
    new TestInfo("addPythonTest","Python Test", "", TT_PYTHON, "Python"),
    new TestInfo("addSetlX","SetlX Test", TextSetlX, TT_JARTEST, "SetlX"), // zunächst den jartest, der auch beim Einlesen erzeugt werden soll
    new TestInfo("addSetlXSynt","SetlX Syntax Test", TextSetlX, TT_JARTEST , "SetlX", true,
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
    new TestInfo("addCheckStyle","CheckStyle Test", TextJavaCheckst, TT_CHECKSTYLE, "CheckStyle"),
    new TestInfo("addDGSetup","DejaGnu Setup", "", TT_DEJAGNU_SETUP, "DGSetup"),
    new TestInfo("addDGTester","DejaGnu Tester", "", TT_DEJAGNU_TESTER, "DGTester"),
];




proglangInfos = [
  new ProglangInfo("java/1.6", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("java/1.8", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("python/2", ["addPythonTest", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("setlX/2.40", ["addSetlX", "addSetlXSynt", "addCheckStyle", "addDGSetup", "addDGTester"]),
];

