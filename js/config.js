/**
 * Created by KarinBorm on 29.05.2017.
 */

// classes
function TestInfo(id,title, area, testType, onButtonClicked) {
    this.id   = id;
    this.title = title;
    this.testArea = area;
    this.testType = testType;
    this.onCreated = onButtonClicked;
}

function ProglangInfo(name, tests) {
    this.name   = name;
    this.tests = tests;
}

function addTestButtons() {
    $.each(testInfos, function(index, item) {
        $("#testbuttons").append("<button id='" + item.id + "'>Add " + item.title + "</button> ");
        $("#" + item.id).click(function() {

            var testNo = setcounter(testIDs);    // sets the corresponding fileref, filename and title "SetlX-Syntax-Test"
            newTest(testNo,item.title, item.testArea, item.testType);
            if (item.onCreated) {
                item.onCreated(testNo);
            }

            // newTest(setcounter(testIDs),"Java Compiler Test", TextJavaComp, "java-compilation");
            $("#tabs").tabs("option", "active", tab_page.TESTS); });
    });
}



function switchProgLang() {
    var progLang = $("#xml_programming-language").val();
    console.log("changing programming language to " + progLang);

    // hide all test buttons
    $.each(testInfos, function(index, test) {
        $("#" + test.id).hide();
    });

    // show only test buttons needed for programming language
    found = false;
    $.each(proglangInfos, function(index, pl) {
        if (pl.name == progLang) {
            found = true;
            $.each(pl.tests, function(index, test) {
                $("#" + test).show();
            });
        }
    });

    if (!found) {
        window.confirm("Unsupported Programming Language: " + progLang);
    }
    /*
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
     */
}

// -------------------------------------------------------------


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





testInfos = [
    new TestInfo("addJavaComp","Java Compiler Test", TextJavaComp, "java-compilation"),
    new TestInfo("addJavaJunit",java_JUnit_Default_Title, TextJavaJunit, "unittest"),
    new TestInfo("addPythonTest","Python Test", "","python"),
    new TestInfo("addSetlX","SetlX Test", TextSetlX, "jartest"),
    new TestInfo("addSetlXSynt","SetlX Syntax Test", TextSetlX, "jartest",
        function(tempnumber2) {
            // add file for the test
            var tempnumber1 = setcounter(fileIDs);    // adding a file for the test
            newFile(tempnumber1);                     // filename: setlxsyntaxtest.stlx, content: print()
            const filename = 'setlxsyntaxtest.stlx';
            $(".xml_file_id[value='"+tempnumber1+"']").parent().find(".xml_file_filename").first().val(filename);
            codemirror[tempnumber1].setValue('print("");');
            // add file reference
            var xml_test_root = $(".xml_test_id[value='"+tempnumber2+"']").parent();
            xml_test_root.find(".xml_test_fileref").first().val(tempnumber1);
            var element = xml_test_root.find(".xml_test_filename");
            setFilenameList(element);
            element.val(filename).change();
            xml_test_root.parent().find(".xml_test_title").first().val("SetlX-Syntax-Test");
        }
    ),
    new TestInfo("addCheckStyle","CheckStyle Test", TextJavaCheckst, "java-checkstyle"),
    new TestInfo("addDGSetup","DejaGnu Setup", "", "dejagnu-setup"),
    new TestInfo("addDGTester","DejaGnu Tester", "", "dejagnu-tester"),
];




proglangInfos = [
  new ProglangInfo("java/1.6", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("java/1.8", ["addJavaComp", "addJavaJunit", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("python/2", ["addPythonTest", "addCheckStyle", "addDGSetup", "addDGTester"]),
  new ProglangInfo("setlX/2.40", ["addSetlX", "addSetlXSynt", "addCheckStyle", "addDGSetup", "addDGTester"]),
];

