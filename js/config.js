/**
 * Created by KarinBorm on 29.05.2017.
 */

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

const TextSetlX =  " <label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
    " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";

const TextJavaCheckst = "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_CS_version'><option selected='selected' value='6.2'>6.2</option></select>"+
    " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";


function TestInfo(id,title, area, testType) {
    this.id   = id;
    this.title = title;
    this.testArea = area;
    this.testType = testType;
}

testInfos = [
    new TestInfo("addJavaComp","Java Compiler Test", TextJavaComp, "java-compilation"),
    new TestInfo("addJavaJunit",java_JUnit_Default_Title, TextJavaJunit, "unittest"),
    new TestInfo("addPythonTest","Python Test", "","python"),
    new TestInfo("addSetlX","SetlX Test", TextSetlX, "jartest"),
    new TestInfo("addCheckStyle","CheckStyle Test", TextJavaCheckst, "java-checkstyle"),
    new TestInfo("addDGSetup","DejaGnu Setup", "", "dejagnu-setup"),
    new TestInfo("addDGTester","DejaGnu Tester", "", "dejagnu-tester")
// TODO!
//    new TestInfo("addSetlXSynt","SetlX Syntax Test"),
];


function addTestButtons() {

    $.each(testInfos, function(index, item) {
        $("#testbuttons").append("<button id='" + item.id + "'>Add " + item.title + "</button> ");
        $("#" + item.id).click(function() {
            newTest(setcounter(testIDs),item.title, item.testArea, item.testType);
            // newTest(setcounter(testIDs),"Java Compiler Test", TextJavaComp, "java-compilation");
            $("#tabs").tabs("option", "active", tab_page.TESTS); });
    });
}


function switchProgLang() {
//        var progLang = this.val();
    var progLang = $("#xml_programming-language").val();
    console.log("changing programming language to " + progLang);
    //$("#addCheckStyle").hide();
    $("#addJavaComp").hide();
    $("#addJavaJunit").hide();
    //$("#addDGSetup").hide();
    //$("#addDGTester").hide();
    $("#addPythonTest").hide();
    $("#addSetlX").hide();
    $("#addSetlXSynt").hide();

    switch(progLang) {
        case "java/1.6":
        case "java/1.8":
            $("#addJavaComp").show();
            $("#addJavaJunit").show();
            break;
        case "python/2":
            $("#addPythonTest").show();
            break;
        case "setlX/2.40":
            $("#addSetlX").show();
            $("#addSetlXSynt").show();
            break;
        default:
            window.confirm("Unsupported Programming Language: " + progLang);
            break;
    };
}