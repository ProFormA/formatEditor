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
 * The version number of this software is in the variable codeversion below.
 *
 * Known bugs: search the code for the string "ToDo" below and check faq.html and installationFAQ.html
 */


// constants

// TAB pages
const tab_page = {
  MAIN:   0,
  FILES:  1,
  MODEL_SOLUTION:  2,
  TESTS:  3,
  DEBUG:  4,
  MANUAL: 5,
  FAQ:    6
};

const DEBUG_MODE = true;
var TEST_MODE = true;



//////////////////////////////////////////////////////////////////////////////
//* Global variables

var codeversion   = '2.0.0 alpha';                     // contains the current version of this code
                                                       // these variables can be set in the calling HTML file  
var version094;                                        // names of the xsd schema files
var version101;
var xsdSchemaFile;                                     // choose version
var codemirrorOnOrOff;                                 // setting this to 0 turns Codemirror off
var loncapaOnOrOff;                                    // setting this to 0 turns LON-CAPA elements off
var praktomatOnOrOff;
if (version094 === undefined || version094 === null) { version094 = 'taskxml0.9.4.xsd'; }
if (version101 === undefined || version101 === null) { version101 = 'taskxml1.0.1.xsd'; }
if (xsdSchemaFile === undefined || xsdSchemaFile === null) { xsdSchemaFile = version094; }
if (codemirrorOnOrOff === undefined || codemirrorOnOrOff === null) { codemirrorOnOrOff = 1; }
if (loncapaOnOrOff === undefined || loncapaOnOrOff === null) { loncapaOnOrOff = 1; }
if (praktomatOnOrOff === undefined || praktomatOnOrOff === null) { praktomatOnOrOff = 1; }

var pfix_unit = "unit";                                // fixing namespace prefixes because of
var pfix_jart = "jartest";                             // browser compatibility and jquery limitations
var pfix_prak = "praktomat";

if (xsdSchemaFile == version094) {
  var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:unittest" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.1" ' +
                  'xmlns="urn:proforma:task:v0.9.4" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';   
} else {
  var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:tests:unittest:v1" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.2" '
                + 'xmlns="urn:proforma:task:v1.0.1" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
}
var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+

const loadFileOption = "load...";
//////////////////////////////////////////////////////////////////////////////
//* These global variables keep track of how many of these elements currently exist. 
var fileIDs = {};
var modelSolIDs = {};
var testIDs = {};
var gradingHintCounter;                                // only 1 grading hint is allowed
var codemirror = {};

///////////////////////////////////////////////////////// utility functions
/* Codemirror is a library that provides more sophisticated editor support for textareas.
 * Once it is turned on for a textarea, this textarea can no longer be accessed
 * using normal DOM methods. Instead it must be accessed using codemirror methods.
 * Currently codemirror is only used for xml_file_text.
 * The global codemirror hash above uses the fileID to identify the codemirror element.
 */
function addCodemirrorElement(cmID) {                     // cmID is determined by setcounter(), starts at 1
  codemirror[cmID] = CodeMirror.fromTextArea(
    $(".xml_file_id[value='"+ cmID +"']").parent().parent().find(".xml_file_text")[0],{
    mode : "text/x-java", indentUnit: 4, lineNumbers: true, matchBrackets: true, tabMode : "shift",
    styleActiveLine: true, viewportMargin: Infinity, autoCloseBrackets: true, theme: "eclipse"
  });

    var editor = codemirror[cmID];
    $(editor.getWrapperElement()).resizable({
        handles: 'n, s', // only resize in north-south-direction
        resize: function() {
            editor.setSize($(this).width(), $(this).height());
            editor.refresh(); // is this really needed?
        }
    });
}

//////////////////////////////////////////////////////////////////////////////
/* setcounter and deletecounter are only used for fileIDs, modelSolIDs, testIDs
 * setcounter finds the first available ID and returns it
 * setcounter should be called when a new item is created
 * deletecounter deletes an ID from the hash, to be used when deleting an item
 */
function setcounter(temphash) {
  var tempcnter = 1;
  while (temphash.hasOwnProperty(tempcnter)) {         // if the counter is already used, take next one
    tempcnter++;
  }
  temphash[tempcnter] = 1;
  return tempcnter;
}
function deletecounter(temphash,tempelement) {         // for fileIDs, modelSolIDs, testIDs
  //console.log('deletecounter called');
  var tempcnter;
  delete temphash[tempelement.parent().parent().parent().find('.tinyinput')[0].value];
}

//////////////////////////////////////////////////////////////////////////////
/* The HTML div-element "error-message" displays error messages if required.
 * all catch(err) statements should use this function (instead of console.log)
 */
function setErrorMessage(errormess, exception) {                  // setting the error console
    var error_output = $("#error-message");
    error_output.append("\n* " + errormess);
    if (exception != undefined)
        error_output.append("\n  " + exception.message);

    error_output.css('visibility', 'visible');
    error_output.scrollTop(error_output[0].scrollHeight);
//    error_output.scrollTop($("#error-message")[0].scrollHeight);
}
function clearErrorMessage() {                         // clearing the error console
  var error_output = $("#error-message");
  error_output.text("");
  error_output.css('visibility', 'hidden');
}

//////////////////////////////////////////////////////////////////////////////
/* Allows to upload a file into a textarea
 * or to create a download link for text from a textarea.
 * These functions are used in click events associated with textareas.
 */
function uploadFile(inputbutton) {                     // upload button for textareas: output, output2
  var filenew = inputbutton.files[0];
  switch (filenew.type) {
      case 'application/zip':
      case 'application/x-zip-compressed':
        /// unzipme(filenew,$(inputbutton).parent().parent().parent().find("textarea"));
        var text = unzipme(filenew,$("#output"), readXML);
        // readXML(text); // avoid racing by setting the text
          // (when the text is set in the text area and later on read by readXml
          // it could be empty because of racing condition)
        break;
      case "text/xml":
        if (filenew) {
            var readfi = new FileReader();
            readfi.onload = function(e) {
                var text = e.target.result;
                $("#output").val(text);
                /// $(inputbutton).parent().parent().parent().find("textarea").val(e.target.result);
                readXML(text);
            }
            readfi.readAsText(filenew);
        }
        break;
      default:
        setErrorMessage("Unsupported file format: " + filenew.type);
        break;
  }


}
function downloadFile(downloadLink) {                  // download link for textareas: output, output2
  console.log("downloadFile called");

  var tempbase64 = "";
  try {
      /*  tempbase64 = window.btoa($(downloadLink).parent().parent().parent().find("textarea").val());
      $(downloadLink).attr("href",'data:text/text;base64,'+tempbase64);
      */
      var text = $("#output").val();
      /// var text = $(downloadLink).parent().parent().parent().find("textarea").val();
      var text1 = encodeURIComponent(text);
      // var tempbase64 = window.btoa(text); // unused
      $(downloadLink).attr("href",'data:text/text;charset=utf-8,' + text1); // encodeURIComponent(text));
  } catch(err) { setErrorMessage("File cannot be downloaded because it contains an invalid character.");}
}

function downloadTextFile2(textarea, filename, dummybutton) {
    console.log("downloadTextFile2 called");
    var text = textarea.val();
    if (text.length == 0) {
        console.log("downloadTextFile2 called with empty output");
        return;
    }
    var text1 = encodeURIComponent(text);

  /*var a = document.createElement("a");
   document.body.appendChild(a);
   a.style = "display: none";
   */
    dummybutton.download = filename;
    dummybutton.href = "data:text/text;charset=utf-8," + text1;
    dummybutton.click();

    // try {document.removeChild(a); } catch (err) {/* ignore error */}
}



//////////////////////////////////////////////////////////////////////////////
/* Each newly exported task needs its own UUID.
 * This function generates and returns an UUID.
 */
function generateUUID(){
  var date = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c_value) {
      var rand = (date + Math.random()*16)%16 | 0;
      date = Math.floor(date/16);
      return (c_value == 'x' ? rand : (rand&0x3|0x8)).toString(16);
    });
  return uuid;
};

///////////////////////////////////////////////////////// mapping HTML form names and XML names
/* This creates the main data structure for the program.
 * It consists of arrays of elements.
 * Each element shows the relationshop between XML names and form names.
 * The arrays sort the elements depending on how deep they are in the XML file.
 * The arrays can be looped through in order to process the XML file.
 */
function createMapping(schemaversion) {                // note: the maps are global variables
  function ValMap(fname,xname,pname,cdata,fcont,lelem,lattr) {
    this.formname = fname; // name in formular
    this.xmlname = xname;  // element or attribute name in task.xml
    this.xmlpath = pname;  // parent element in task.xml
    this.cdata = cdata;    // create as CDATA in task.xml (bool)
    this.formcontainer = fcont;                        // ToDo: use this more ?
    this.listelem = lelem;                             // only for mapSubElemListArray,  mapAttrOfTestElems
    this.listattr = lattr;                             // only for mapSubElemListArray
  }
  if (praktomatOnOrOff == 1) { var ns_praktomat = ""; }
  var ns_unit = "";
  if (isFirefox) {
    if (praktomatOnOrOff == 1) { var ns_praktomat = pfix_prak + "\\:"; }
    var ns_unit = pfix_unit + "\\:";
    var ns_jartest = pfix_jart + "\\:";
  }
  mapSingleElements = [                                // single XML elements
    new ValMap("#xml_description","description","",1),
    new ValMap("#xml_meta-data_title","meta-data > title","",0),
    new ValMap("#xml_grading-hints_text","grading-hints","",0)
  ];
  if (schemaversion == version094 && praktomatOnOrOff == 1) {
      mapSingleElements[3] =  new ValMap("#xml_upload-mime-type",ns_praktomat+"allowed-upload-filename-mimetypes","",0);
  }
  mapSingleAttrs = [                                   // single XML attributes
    new ValMap("#xml_lang","lang","task",0)
//    new ValMap("#xml_subm_unpackArchiveRegExp","unpack-files-from-archive-regexp","submission-restrictions",0),
//    new ValMap("#xml_subm_unpackArchive","unpack-files-from-archive","submission-restrictions",0),
  ];
  if (schemaversion == version094) {
    mapSingleAttrs[1] = new ValMap("#xml_subm_max-size","max-size","submission-restrictions",0);
    mapSingleAttrs[2] = new ValMap("#xml_subm_uploadNameRegexp","allowed-upload-filename-regexp","submission-restrictions",0);
  } else {
    mapSingleAttrs[1] = new ValMap("#xml_subm_max-size","max-size","regexp-restriction",0);
    mapSingleAttrs[2] = new ValMap("#xml_upload-mime-type","mime-type-regexp","regexp-restriction",0);
    mapSingleAttrs[3] = new ValMap("#xml_uuid","uuid","task",0);
  }
  mapElemSequence = [                                  // sequence of elements
    new ValMap(".xml_file","file","files",0),
    new ValMap(".xml_model-solution","model-solution","model-solutions",0),
    new ValMap(".xml_test","test","tests",0)
  ];
  mapTextInElemSequence = [                            // textcontent of elements in sequence
    new ValMap(".xml_file_text","file","files",1,".xml_file")
  ];
  if (praktomatOnOrOff == 1) {
    mapChildElems = [                                    // child elements
      new ValMap(".xml_test_title","title","test",0,".xml_test"),
      new ValMap(".xml_test_type","test-type","test",0,".xml_test"),
      new ValMap(".xml_ju_mainclass",ns_unit+"main-class","test-configuration",0,".xml_test"),
      new ValMap(".xml_pr_CompilerFlags",ns_praktomat + "config-CompilerFlags","test test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_CompilerOutputFlags",ns_praktomat+"config-CompilerOutputFlags","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_CompilerLibs",ns_praktomat+"config-CompilerLibs","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_CompilerFPatt",ns_praktomat+"config-CompilerFilePattern","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_configDescription",ns_praktomat+"config-testDescription","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_public",ns_praktomat+"public","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_required",ns_praktomat+"required","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_always",ns_praktomat+"always","test-meta-data",0,".xml_test"),
      new ValMap(".xml_pr_CS_version",ns_praktomat +"version","test-configuration",0,".xml_test"),
      new ValMap(".xml_pr_CS_warnings",ns_praktomat +"max-checkstyle-warnings","test-configuration",0,".xml_test")
    ];
  } else {
    mapChildElems = [
      new ValMap(".xml_test_title","title","test",0,".xml_test"),
      new ValMap(".xml_test_type","test-type","test",0,".xml_test"),
      new ValMap(".xml_ju_mainclass",ns_unit+"main-class","test-configuration",0,".xml_test"),
    ];
  }
  mapListOfChildElems = [                              // list of child elements
    new ValMap(".xml_test_fileref","fileref","test-configuration",0,".xml_test","filerefs","refid"),
    new ValMap(".xml_model-solution_fileref","fileref","model-solution",0,".xml_model-solution","filerefs","refid")
  ];
  mapAttrInSequence = [                                // attributes of elements in sequences
    new ValMap(".xml_file_id","id","file",0,".xml_file"),
    new ValMap(".xml_file_filename","filename","file",0,".xml_file"),
    new ValMap(".xml_file_type","type","file",0,".xml_file"),
    new ValMap(".xml_file_class","class","file",0,".xml_file"),
    new ValMap(".xml_file_comment","comment","file",0,".xml_file"),
    new ValMap(".xml_model-solution_id","id","model-solution",0,".xml_model-solution"),
    new ValMap(".xml_model-solution_comment","comment","model-solution",0,".xml_model-solution"),
    new ValMap(".xml_test_id","id","test",0,".xml_test")
//    new ValMap(".xml_test_validity","validity","test",0,".xml_test"),
  ];
  mapAttrOfTestElems = [                               // attributes of elements in sequences
    new ValMap(".xml_ju_framew","framework",ns_unit+"unittest",0,".xml_test","test"),
    new ValMap(".xml_ju_version","version",ns_unit+"unittest",0,".xml_test","test"),
    new ValMap(".xml_jt_framew","framework",ns_jartest+"jartest",0,".xml_test","test"),
    new ValMap(".xml_jt_version","version",ns_jartest+"jartest",0,".xml_test","test")
  ];
}

///////////////////////////////////////////////////////// Create an empty xml template
/* This creates an empty XML template in the required format.
 * The first return value contains the main XML structure without individual tests.
 * The second return value contains a hash which has an element for each test type.
 */
function createXMLTemplate(schemaversion) {            // parseXML is not namespace-aware
  if (schemaversion == version094) {       
    var xmlTemp1 = '<task ' + namespace + 'lang="">';
    var xmlTemp2 = '<description></description><proglang version=""></proglang><submission-restrictions max-size=""/>';
  } else {
    var xmlTemp1 = '<task ' + namespace + 'uuid ="" lang="">';
    var xmlTemp2 = '<description></description><proglang version=""></proglang><submission-restrictions>'+
                   '<regexp-restriction max-size="" mime-type-regexp=""/></submission-restrictions>';
  }
  var xmlTemp3 = '<files><file class="internal" filename="" id="" type="embedded"/></files>';
  var xmlTemp4 = '<model-solutions><model-solution id=""><filerefs><fileref/></filerefs></model-solution></model-solutions>';
  var xmlTemp5 = '<tests></tests><grading-hints /><meta-data><title/>';
  var xmlTemp6 = "";
  if (praktomatOnOrOff == 1) {
    xmlTemp6 = '<praktomat:allowed-upload-filename-mimetypes>(text/.*)</praktomat:allowed-upload-filename-mimetypes>';} 
  var xmlTemp7 = '</meta-data></task>';
  
  var xmlDc = $.parseXML(xmlTemp1 + xmlTemp2 + xmlTemp3 + xmlTemp4 + xmlTemp5 + xmlTemp6 + xmlTemp7);

  var xstrTestType = '<test ' + namespace + 'id=""><title/><test-type>';
  var xstrFileRef = '</test-type><test-configuration><filerefs><fileref/></filerefs>';
  var xstrMetaData = '<test-meta-data>';
  var xstrTestCfg = '</test-meta-data></test-configuration></test>';
  var xstrCF1 = ""; 
  var xstrMD1 = ""; 
  var xstrMD2 = ""; 
  var xstrMD3 = ""; 
  var xstrMD4 = "";
  if (praktomatOnOrOff == 1) {
    xstrCF1 = '<praktomat:version/>';
    xstrMD1 = '<praktomat:public>True</praktomat:public><praktomat:required>True' +
              '</praktomat:required><praktomat:always>True</praktomat:always>';
    xstrMD2 = '<praktomat:config-CompilerFlags/><praktomat:config-CompilerOutputFlags/>' +
              '<praktomat:config-CompilerLibs/><praktomat:config-CompilerFilePattern/>'; 
    xstrMD3 = '<praktomat:config-testDescription/>';
    xstrMD4 = '<praktomat:max-checkstyle-warnings/>';
  } 

  var xmlHash = {};
  xmlHash["JavaCompile"] = $.parseXML(xstrTestType + 'java-compilation' + xstrFileRef + xstrMetaData + xstrMD1 +
                           xstrMD2 + xstrTestCfg);
  xmlHash["JavaJunit"] = $.parseXML(xstrTestType + 'unittest' + xstrFileRef + 
                         '<unit:unittest framework="junit" version="4.10"><unit:main-class></unit:main-class></unit:unittest>'
                         + xstrMetaData + xstrMD1 + xstrMD3 + xstrTestCfg);
  xmlHash["SetlX"] = $.parseXML(xstrTestType + 'jartest' + xstrFileRef + 
                   '<jartest:jartest framework="setlX" version ="2.40"></jartest:jartest>' +
                   xstrMetaData + xstrMD1 + xstrTestCfg);
  xmlHash["CheckStyle"] = $.parseXML(xstrTestType + 'java-checkstyle' + xstrFileRef + xstrCF1 + xstrMetaData +
                          xstrMD1 + xstrMD4 + xstrTestCfg);
  xmlHash["DGSetup"] = $.parseXML(xstrTestType + 'dejagnu-setup' + xstrFileRef + xstrMetaData + xstrMD1 + xstrTestCfg);
  xmlHash["DGTester"] = $.parseXML(xstrTestType + 'dejagnu-tester' + xstrFileRef + xstrMetaData + xstrMD1 + xstrTestCfg);
  xmlHash["Python"] = $.parseXML(xstrTestType + 'python' + xstrFileRef + xstrMetaData + xstrMD1 + xstrTestCfg);

  return {xmlDoc : xmlDc, testtemplate: xmlHash};
}

///////////////////////////////////////////////////////// document ready function
/* The main part of this program. To be executed on "document ready".
 * It creates the dynamic HTML elements that are not already defined in the static HTML page.
 * It contains a function for converting the form into an XML file and 
 * a function for filling the form from an uploaded XML file.
 */
$(function() {
  $('#codeversion').text("Version "+codeversion);
  gradingHintCounter = 1;

  remP3 = function(bt) {bt.parent().parent().parent().remove();};   // for removing files, etc

/*  remP3Check = function(bt) {                                       // ask before removing
     var remtemp = window.confirm("Do you really want to delete this?");
     if (remtemp) { bt.parent().parent().parent().remove(); }
  };
*/
  removeFile = function(bt) {                                       // ask before removing
    // TODO: check if file is referenced somewhere
    // if true: cancel or remove all filenames/filerefs from model solution and test
    var remtemp = window.confirm("Do you really want to delete this file?");
    if (remtemp) {
      bt.parent().parent().parent().remove();
      deletecounter(fileIDs,bt);
      onFilenameChanged(); // update filenames
    }
  };

  doesFilenameExist = function(filename) {
      var found = false;
      $.each($(".xml_file_filename"), function(index, item) {
              if (item.value == filename) {
                  found = true;
              }
      });

      return found;
  }

///////////////////////////////////////////////////////// creating new HTML form elements
  newGH = function() {                                 // create a new grading hint HTML form element
    $("#gradinghintsection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_grading-hints'>"+
    "<h3 class='ui-widget-header'>Grading hints<span class='rightButton'>"+
    "<button onclick='remP3($(this));gradingHintCounter--;'>x</button></span></h3>"+
    "<p><textarea rows='3' cols='80' id='xml_grading-hints_text'"+
    "onfocus='this.rows=10;' onmouseout='this.rows=6;'></textarea></p></div>");
    gradingHintCounter++;
  };

  readSingleFile = function(inputbutton) {             // read a file and its filename into the HTML form
    var filenew = inputbutton.files[0];
    if (filenew) {
      var filename = filenew.name;
      var readfi = new FileReader();
      readfi.onload = function(e) {
        if (codemirrorOnOrOff == 1) {
          codemirror[$(inputbutton).parent().parent().find(".xml_file_id").val()].setValue(e.target.result);
          $(inputbutton).parent().parent().find(".xml_file_filename").val(filename);
        } else {
          $(inputbutton).parent().parent().find(".xml_file_text").val(e.target.result);
          $(inputbutton).parent().parent().find(".xml_file_filename").val(filename);
        }
      }
      readfi.readAsText(filenew);
    }
  };

  readAndSetFileData = function(file, callback) {
      if (!file) return;
      var filename = file.name;
      // check if a file with that filename already is stored
      if (doesFilenameExist(filename)) {
          alert("A file named '" + filename + "' already exists.");
          return;
      }
      var type = file.type;
      var reader = new FileReader();

      reader.onload = function(e) {
          // get file content
          console.log("create filebox");
          var text = e.target.result;
          var newFileId = setcounter(fileIDs);
          newFile(newFileId); // add file
          // set filename in test
          $(".xml_file_id[value='"+newFileId+"']").parent().find(".xml_file_filename").first().val(filename);
          // set file text
          codemirror[newFileId].setValue(text);
          /*
           if (codemirrorOnOrOff == 1) {
           codemirror[$(inputbutton).parent().parent().find(".xml_file_id").val()].setValue(e.target.result);
           $(inputbutton).parent().parent().find(".xml_file_filename").val(filename);
           } else {
           $(inputbutton).parent().parent().find(".xml_file_text").val(e.target.result);
           $(inputbutton).parent().parent().find(".xml_file_filename").val(filename);
           }
           */

          // update filenames in all filename options
          onFilenameChanged();

          if (callback)
            callback();
      }
      console.log("read file");
      reader.readAsText(file);
  };

  readSingleFileAndCreateFilebox = function(inputbutton, filenameSelect) {             // read a file and its filename into the HTML form
      console.log("select file");
      var filenew = inputbutton.files[0];
      if (!filenew) {
          console.log("no file selected -> cancel");
          return;
      }

      if (filenameSelect) {
          // console.log("+++ readSingleFileAndCreateFilebox (1)" + JSON.stringify(filenameSelect));
      }

      readAndSetFileData(filenew, function(){
          if (filenameSelect) {
              var filename = filenew.name;
              // console.log("+++ readSingleFileAndCreateFilebox (2)" + JSON.stringify(filenameSelect));
              filenameSelect.val(filenew.name).change();
          }
      });
  }


  onFilenameChanged = function() {
      // after change of filename update all filelists
      console.log("onFilenameChanged");

      $.each($(".xml_test_filename, .xml_model-solution_filename"), function(index, item) {
          //console.log("update filelist in test ");
          var text = $("option:selected", item).text(); // selected text
          //console.log("selected is " + text);
          setFilenameList(item); // update filenames
          // check if previously selected filename is still in list
          // (ich weiß im Moment nicht, wie man die Einträge aus
          // der Liste rauszieht...TODO)
          var indexFound = -1;
          $.each($(".xml_file_filename"), function(indexOpt, item) {
              if (item.value.length > 0 && item.value == text) {
                  indexFound = indexOpt;
              }
          });
          if (indexFound >= 0) {
              console.log("selektiere " + indexFound);
              item.selectedIndex = indexFound+1; // +1:weil am Anfang noch ein Leerstring ist
          }
      });
  }

  newFile = function(tempcounter) {                    // create a new file HTML form element
    $("#filesection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_file'>"+
    "<h3 class='ui-widget-header'>File #"+tempcounter+"<span "+
    "class='rightButton'><button onclick='removeFile($(this));'>x</button></span></h3>"+
    "<p><label for='xml_file_id'>ID: </label>"+
    "<input class='tinyinput xml_file_id' value='"+tempcounter+"' readonly/>"+
    " <label for='xml_file_filename'>Filename (with extension)<span class='red'>*</span>: </label>"+
    "<input class='mediuminput xml_file_filename' onchange='onFilenameChanged(this)'/>"+
    " <label for='xml_file_type'>Type: </label>"+
    "<select class='xml_file_type'>"+
    "<option selected='selected'>embedded</option>"+
    "<option>file</option></select>"+
    " <label for='xml_file_class'>Class<span class='red'>*</span>: </label>"+
    "<select class='xml_file_class'>"+
    "<option selected='selected'>internal</option>"+
    "<option>template</option>"+
    "<option>library</option>"+
//  "<option>inputdata</option>"+                      // not used at the moment
    "<option>internal-library</option>"+
    "<option>instruction</option></select></p>"+
    "<p><label for='xml_file_comment'>Comment: </label>"+
    "<input class='largeinput xml_file_comment'/></p>"+
    "<p><label>File content<span class='red'>*</span>: </label>"+
    "<input type='file' class='largeinput file_input' onchange='readSingleFile(this)'/>" +
    "<textarea rows='3' cols='80' class='xml_file_text'"+
    "onfocus='this.rows=10;' onmouseout='this.rows=6;'></textarea></p></div>");
    // hide fields that exist only for technical reasons
    if (!DEBUG_MODE) {
      var fileroot = $(".xml_file_id[value='" + tempcounter + "']").parent();
      fileroot.find(".xml_file_type").hide();
      fileroot.find("label[for='xml_file_type']").hide();
      fileroot.find(".xml_file_id").hide();
      fileroot.find("label[for='xml_file_id']").hide();
    }
    if (codemirrorOnOrOff == 1) { addCodemirrorElement(tempcounter); }
  };

  switchFileref = function(tempSelElem) {              // changing a filename in the drop-down changes the id

    // console.log("+++ switchFileref" + JSON.stringify(tempSelElem));

    var found = false;
    var selectedFilename = $(tempSelElem).val();
    console.log("-> selected is '" + selectedFilename + "'");

    if (selectedFilename == loadFileOption) {
        // read new file
        // remove old callback
        var dummybutton = $("#dummy_file_upload_button").first();
        dummybutton.unbind("change");
        // change callback
        dummybutton.change(function() {
            readSingleFileAndCreateFilebox($("#dummy_file_upload_button")[0], $(tempSelElem));
        });

        dummybutton.click();
        return;
    }
    $.each($(".xml_file_filename"), function(index, item) {
       if (selectedFilename == item.value ) {
          if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
              var fileid = $(item).first().parent().find(".xml_file_id").val();
              var nextTd = $(tempSelElem).parent().next('td');
              nextTd.find('.xml_test_fileref')[0].value=fileid;

//            $(tempSelElem).parent().find('.xml_test_fileref')[0].value=
//              $(item).first().parent().find(".xml_file_id").val();
          } else {
              var fileid = $(item).first().parent().find(".xml_file_id").val();
              var nextTd = $(tempSelElem).parent().next('td');
              nextTd.find('.xml_model-solution_fileref')[0].value=fileid;
          }
          found = true;
          return false;
       }
    });
    // file id not found
    if (!found) {
        console.log("could not find file id for " + selectedFilename);
        if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
            var nextTd = $(tempSelElem).parent().next('td');
            nextTd.find('.xml_model-solution_fileref')[0].value="";
            //$(tempSelElem).parent().find('.xml_test_fileref')[0].value="";

        } else {
            var nextTd = $(tempSelElem).parent().next('td');
            nextTd.find('.xml_model-solution_fileref')[0].value="";
        }
    }
  };


  setFilenameList = function(tempSelElem) {            // create the drop-down with all possible filenames
     $(tempSelElem).empty();
     var tempOption = $("<option></option>");
     $(tempSelElem).append(tempOption); // empty string
     $.each($(".xml_file_filename"), function(index, item) {
        if (item.value.length > 0) {
            tempOption = $("<option></option>");
            tempOption[0].textContent = item.value;
            $(tempSelElem).append(tempOption);
        }
     });
      //tempSelElem.val(""); // preset no filename
      tempOption = $("<option>" + loadFileOption + "</option>");
      $(tempSelElem).append(tempOption);
  };


    addMsFileRef = function(element) {
        // add new line for selecting a file for a model solution
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            tdFilenameInMs +
            tdFileRemoveButtonInMs +
            tdFileAddButtonInMs +
            "</tr>");
        td.remove(); // remove current +-button
        table_body.find(".rem_file_ref_ms").show(); // show all remove file buttons
        // add filelist to new file option
        setFilenameList(table_body.find(".xml_model-solution_filename").last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find(".xml_model-solution_fileref").hide();
            table_body.find("label[for='xml_model-solution_fileref']").hide();
        }
    };


    remMsFileRef = function(element) {
        // remove line in file table for model solution
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        var previousRow = tr.prev("tr");
        var hasNextTr = tr.nextAll("tr");
        var hasPrevTr = tr.prevAll("tr");
        tr.remove(); // remove row
        if (hasNextTr.length == 0) {
            // if row to be deleted is last row then add +-button to last row
            previousRow.append(tdFileAddButtonInMs);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(filenameLabelInMs); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find(".rem_file_ref_ms").hide();
        }
    };


  const filenameLabelInMs ="<label for='xml_model-solution_filename'>Filename<span class='red'>*</span>: </label>"; // label
  const tdFilenameLabelInMs ="<td>" + filenameLabelInMs + "</td>"; // label
  const tdFilenameInMs =  "<td><select class='mediuminput xml_model-solution_filename' " + // onfocus = 'setFilenameList(this)' "+ // select
    "onchange = 'switchFileref(this)'></select></td>"+
    "<td><label for='xml_model-solution_fileref'>Fileref: </label>"+ // fileref
    "<input class='tinyinput xml_model-solution_fileref' readonly/></td>";
  const tdFileAddButtonInMs = "<td><button class='add_file_ref' title='add another filename' onclick='addMsFileRef($(this))'>+</button><br></td>";
  const tdFileRemoveButtonInMs = "<td><button class='rem_file_ref_ms' onclick='remMsFileRef($(this))'>x</button></td>";

  newModelsol = function(tempcounter) {                // create a new model solution HTML form element
    $("#modelsolutionsection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_model-solution'>"+
    "<h3 class='ui-widget-header'>Model solution #"+tempcounter+"<span "+
    "class='rightButton'><button onclick='remP3($(this));deletecounter(modelSolIDs,$(this));'>x</button></span></h3>"+
    "<p><label for='xml_model-solution_id'>ID<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_model-solution_id' value='"+tempcounter+"' readonly/>"+

    "<table>" +
        "<tr>" +
        tdFilenameLabelInMs + // label
        tdFilenameInMs + // filename and fileref
        tdFileRemoveButtonInMs + // x-button
        tdFileAddButtonInMs + // +-button
        "</tr>"+
    "</table>" +
    "<p><label for='xml_model-solution_comment'>Comment: </label>"+
    "<input class='largeinput xml_model-solution_comment'/></p></div>");

    var msroot = $(".xml_model-solution_id[value='" + tempcounter + "']").parent().parent();
    msroot.find(".rem_file_ref_ms").hide(); // hide remove file button
    setFilenameList(msroot.find(".xml_model-solution_filename").last());

    if (!DEBUG_MODE) {
        // hide fields that exist only for technical reasons
        msroot.find(".xml_model-solution_id").hide();
        msroot.find("label[for='xml_model-solution_id']").hide();

        msroot.find(".xml_model-solution_fileref").hide();
        msroot.find("label[for='xml_model-solution_fileref']").hide();

//      msroot.find(".xml_model-solution_fileref").first().hide();
//      msroot.find("label[for='xml_model-solution_fileref']").first().hide();
    }
  };
                                                       // HTML building blocks for the tests
  var TextJavaComp = "<p><label for='xml_pr_CompilerFlags'>Compiler Flags: </label>"+
    "<input class='tinyinput xml_pr_CompilerFlags'/>"+
    " <label for='xml_pr_CompilerOutputFlags'>Compiler output flags: </label>"+
    "<input class='tinyinput xml_pr_CompilerOutputFlags'/>"+
    " <label for='xml_pr_CompilerLibs'>Compiler libs: </label>"+
    "<input class='shortinput xml_pr_CompilerLibs' value='JAVA_LIBS'/>"+
    " <label for='xml_pr_CompilerFPatt'>Compiler File Pattern: </label>"+
    "<input class='shortinput xml_pr_CompilerFPatt' value='^.*\\.[jJ][aA][vV][aA]$'/></p>";
  var TextJavaJunit = "<p><label for='xml_ju_mainclass'>Test class (no extension)<span class='red'>*</span>: </label>"+
    "<input class='mediuminput xml_ju_mainclass'/>"+
    " <label for='xml_ju_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_framew'><option selected='selected' value='JUnit'>JUnit</option></select>"+
    " <label for='xml_ju_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_ju_version'><option selected='selected' value='4.10'>4.10</option>"+
    "<option value='3'>3</option></select></p>"+
    "<p><label for='xml_pr_configDescription'>Test description: </label>"+
    "<input class='largeinput xml_pr_configDescription'/></p>";
  var TextSetlX =  " <label for='xml_jt_framew'>Framework<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_framew'><option selected='selected' value='setlX'>setlX</option></select>"+
    " <label for='xml_jt_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_jt_version'><option selected='selected' value='2.40'>2.40</option></select></p>";
  var TextJavaCheckst = "<p><label for='xml_pr_CS_version'>Version<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_CS_version'><option selected='selected' value='6.2'>6.2</option></select>"+
    " <label for='xml_pr_CS_warnings'>Maximum warnings allowed<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_pr_CS_warnings' value='0'/></p>";



    addTestFileRef = function(element) {
        // add new line for selecting a file for a test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            tdFilenameInTest +
            tdFileRemoveButtonInTest +
            tdFileAddButtonInTest +
            "</tr>");
        td.remove(); // remove current +-button
        table_body.find(".rem_file_ref_test").show(); // show all remove file buttons

        // add filelist to new file option
        setFilenameList(table_body.find(".xml_test_filename").last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find(".xml_test_fileref").hide();
            table_body.find("label[for='xml_test_fileref']").hide();
        }
    };


    remTestFileRef = function(element) {
        // remove line in file table for test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        var previousRow = tr.prev("tr");
        var hasNextTr = tr.nextAll("tr");
        var hasPrevTr = tr.prevAll("tr");
        tr.remove(); // remove row
        if (hasNextTr.length == 0) {
            // if row to be deleted is last row then add +-button to last row
            previousRow.append(tdFileAddButtonInTest);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(filenameLabelInTest); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find(".rem_file_ref_test").hide();
        }
    };

  const filenameLabelInTest = "<label for='xml_test_filename'>Filename<span class='red'>*</span>: </label>";
  const tdFilenameLabelInTest ="<td>" + filenameLabelInTest + "</td>";
  const tdFilenameInTest = "<td><select class='mediuminput xml_test_filename' " + // onfocus = 'setFilenameList(this)' "+
      "onchange = 'switchFileref(this)'></select></td>"+
      "<td><label for='xml_test_fileref'>Fileref1: </label>"+ // fileref
      "<input class='tinyinput xml_test_fileref' readonly/></td>";
  const tdFileAddButtonInTest = "<td><button class='add_file_ref_test' title='add another filename' onclick='addTestFileRef($(this))'>+</button><br></td>";
  const tdFileRemoveButtonInTest = "<td><button class='rem_file_ref_test' onclick='remTestFileRef($(this))'>x</button></td>";


  newTest = function(tempcounter,TestName, MoreText, TestType) { // create a new test HTML form element
    $("#testsection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_test'>"+
    "<h3 class='ui-widget-header'>" + TestName + " (Test #"+tempcounter+")<span "+
    "class='rightButton'><button onclick='remP3($(this));deletecounter(testIDs,$(this));'>x</button></span></h3>"+
    "<p><label for='xml_test_id'>ID<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_test_id' value='" + tempcounter + "' readonly/>"+
    "<table>" +
        "<tr>" +
        tdFilenameLabelInTest + // label
        tdFilenameInTest +
        tdFileRemoveButtonInTest + // x-button
        tdFileAddButtonInTest +
        "</tr>"+
    "</table><br>" +
//    " <label for='xml_test_validity'>Validity: </label>"+
//    "<input class='shortinput xml_test_validity'/>"+
    " <label for='xml_test_type'>Type: </label>"+
    "<select class='xml_test_type'>"+
    "<option selected='selected'>java-compilation</option>"+
    "<option>unittest</option>"+
    "<option>jartest</option>"+
    "<option>java-checkstyle</option>"+
    "<option>dejagnu-setup</option>"+
    "<option>dejagnu-tester</option>"+
//    "<option>dejagnu</option>"+
    "<option>python</option></select>"+

    " <label for='xml_pr_public'>Public<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_public'>"+
    "<option selected='selected'>True</option><option>False</option></select>"+
    " <label for='xml_pr_required'>Required<span class='red'>*</span>: </label>"+
    "<select class='xml_pr_required'>"+
    "<option selected='selected'>True</option><option>False</option></select>"+
    " <label for='xml_pr_always'>Always: </label>"+
    "<select class='xml_pr_always'>"+
    "<option selected='selected'>True</option><option>False</option></select></p>"+
    "<p><label for='xml_test_title'>Title<span class='red'>*</span>: </label>"+
    "<input class='largeinput xml_test_title' value='"+ TestName +"'/></p>"+ MoreText + "</div>");

      // hide fields that exist only for technical reasons
    var testroot = $(".xml_test_id[value='" + tempcounter + "']").parent();
    testroot.find(".xml_test_type").val(TestType);
    testroot.find(".rem_file_ref_test").hide(); // hide remove file button
    setFilenameList(testroot.find(".xml_test_filename").last());

    if (!DEBUG_MODE) {
      testroot.find(".xml_test_type").hide();
      testroot.find("label[for='xml_test_type']").hide();
      testroot.find(".xml_pr_always").hide();
      testroot.find("label[for='xml_pr_always']").hide();
      testroot.find(".xml_test_id").hide();
      testroot.find("label[for='xml_test_id']").hide();
      // hide first fileref since we have a filename instead
      // testroot.find(".xml_test_fileref").first().hide();
      // testroot.find("label[for='xml_test_fileref']").first().hide();
      // hide all filerefs (first has filename instead, second is not supported)
      testroot.find(".xml_test_fileref").hide();
      testroot.find("label[for='xml_test_fileref']").hide();
    }
    if (TestType == "java-compilation") {
        testroot.find("table").hide();
        /*testroot.find(".xml_test_fileref").hide();
        testroot.find("label[for='xml_test_fileref']").hide();
        testroot.find(".xml_test_filename").hide();
        testroot.find("label[for='xml_test_filename']").hide();*/
    }

    $('.xml_test').on({
      dragover: function(e) {
          e.preventDefault();
          e.stopPropagation();
          //e.dataTransfer.dropEffect = 'copy';
      },
      dragenter: function(e) {
          e.preventDefault();
          e.stopPropagation();
      },
      drop: function(e){
          if(e.originalEvent.dataTransfer){
              if(e.originalEvent.dataTransfer.files.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  /*UPLOAD FILES HERE*/
                  uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
              }
          }
      }
    });

    function uploadFiles(files, testBox){
      if (files.length > 1) {
          alert('You have dragged more than one file. You must drop exactly one file!');
          return;
      }
      $.each(files, function(index, file) {
          readAndSetFileData(file, function() {
              // select new filename in first empty filename
              console.log("uploadFiles: select " + file.name + " in option list");
              var done = false;

              $.each($(testBox).find(".xml_test_filename"), function(index, element) {
                  console.log("-> loop");

                  if (done) return false;
                  var currentFilename = $(element).val();
                  console.log("-> " + currentFilename);
                  if (currentFilename == "") {
                      $(element).val(file.name).change();
                      done = true;
                  }
              });

              if (!done) { // no empty select option is found
                  // append filename
                  addTestFileRef($(testBox).find('.add_file_ref_test').last());
                  // select filename
                  $(testBox).find(".xml_test_filename").last().val(file.name).change();
              }
          });
      });
    }
  };

///////////////////////////////////////////////////////// jQuery UI settings
  $("#tabs").tabs();                                   // hide HTML elements when the manual or FAQ are selected
  $('#tabs').click(function(e) {
    var curTab = $('.ui-tabs-active');
    if (curTab.index() == tab_page.MANUAL || curTab.index() == tab_page.FAQ){ // if manual or FAQ selected
      $("#rightPanel").hide();
      $("#button-list").hide();
      $("#end-container").hide();
      $("#xml-output-input").hide();
      $("#otherSoftware2").hide();
    } else {
      $("#rightPanel").show();
      $("#button-list").show();
      $("#end-container").show();
      $("#xml-output-input").show();
      $("#otherSoftware2").show();
      
      // refresh codemirror editors  - 
      // otherwise content is visible only after first click in window
      setTimeout(function () {
          Object.keys(codemirror).forEach(function(item) {codemirror[item].refresh();});
      }, 10);

                
    }
  });
//   $("#filesection").sortable();
  $("#modelsolutionsection").sortable();
  $("#testsection").sortable();

  $("#addGH").click(function() {                       // the code for the buttons for adding new elements
    if (gradingHintCounter == 1) {newGH();}            // only one grading hint allowed
    $("#tabs").tabs("option", "active", tab_page.MAIN); });        // where this will be added
  $("#addFile").click(function() {
    newFile(setcounter(fileIDs));
    $("#tabs").tabs("option", "active", tab_page.FILES); });
  $("#addModelsol").click(function() {
    newModelsol(setcounter(modelSolIDs));
    $("#tabs").tabs("option", "active", tab_page.MODEL_SOLUTION); });
  $("#addJavaComp").click(function() {
    newTest(setcounter(testIDs),"Java Compiler Test", TextJavaComp, "java-compilation");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addJavaJunit").click(function() {
    newTest(setcounter(testIDs),"Java JUnit Test", TextJavaJunit, "unittest");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addSetlX").click(function() {
    newTest(setcounter(testIDs),"SetlX Test", TextSetlX, "jartest");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addSetlXSynt").click(function() {
    var tempnumber1 = setcounter(fileIDs);    // adding a file for the test
    newFile(tempnumber1);                     // filename: setlxsyntaxtest.stlx, content: print()
    const filename = 'setlxsyntaxtest.stlx';
    $(".xml_file_id[value='"+tempnumber1+"']").parent().find(".xml_file_filename").first().val(filename);
    codemirror[tempnumber1].setValue('print("");');
    var tempnumber2 = setcounter(testIDs);    // sets the corresponding fileref, filename and title "SetlX-Syntax-Test"
    newTest(tempnumber2,"SetlX Test", TextSetlX, "jartest");
    var xml_test_root = $(".xml_test_id[value='"+tempnumber2+"']").parent();
    xml_test_root.find(".xml_test_fileref").first().val(tempnumber1);
    var element = xml_test_root.find(".xml_test_filename");
    setFilenameList(element);
    element.val(filename).change();
    xml_test_root.parent().find(".xml_test_title").first().val("SetlX-Syntax-Test");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addCheckStyle").click(function() {
    newTest(setcounter(testIDs),"CheckStyle Test", TextJavaCheckst, "java-checkstyle");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addDGSetup").click(function() {
    newTest(setcounter(testIDs),"DejaGnu Setup","", "dejagnu-setup");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addDGTester").click(function() {
    newTest(setcounter(testIDs),"DejaGnu Tester","", "dejagnu-tester");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });
  $("#addPythonTest").click(function() {
    newTest(setcounter(testIDs),"Python Test","","python");
    $("#tabs").tabs("option", "active", tab_page.TESTS); });

    $("#load_xml_file").click(function() {
      console.log("load_xml_file called");
    });
    $("#save_xml_file").click(function() {
        console.log("save_xml_file called");
    });
    $("#save_zip_file").click(function() {
        console.log("save_zip_file called");
    });

///////////////////////////////////////////////////////// function: convertToXML
/* This converts the form elements into the XML file.
 * First, it checks for some required values and stops executing if these are missing.
 * Then it loops through the data structure that was created for the XML file.
 * Proglang is dealt with separately.
 * UUID and namespace are added if required.
 * An XML file is created and placed in the textarea. 
 * The XML file is validated against the schema.
 */
  convertToXML = function() {
    $("#output").val(""); // empty output so that the old output will not be used in future
    convertFormToXML = function(one,two,cdataBool) {
      var xmlDoc = $.parseXML('<task></task>');
      one.textContent = "";                              // delete previous content
      if (two) {                                         // check whether replacement value exists
        if (cdataBool == 1) {
          var tempCdata = xmlDoc.createCDATASection(two);
          one.appendChild(tempCdata);
        } else { one.textContent = two; }
      }
    };
    clearErrorMessage();
    createMapping(xsdSchemaFile);
    var returntemp = createXMLTemplate(xsdSchemaFile);
    var xmlDoc = returntemp.xmlDoc;                          // empty XML Template
    var testtemplate = returntemp.testtemplate;              // a hash with test templates
    var xmlObject = $(xmlDoc);                               // convert it into a jQuery object
    var tempdata;
    var tempvar;
    var tempXmlDoc = $.parseXML('<task></task>');

    var inputField = $("#xml_description");
    if (inputField.val() == "") {
        setErrorMessage("Task description is empty.");
        // switch to appropriate tab and set focus
        $("#tabs").tabs("option", "active",  tab_page.MAIN);
        inputField.focus();
        return;
    }

    inputField = $("#xml_meta-data_title");
    if (inputField.val() == "") {
        setErrorMessage("Task title is empty.");
        // switch to appropriate tab and set focus
        $("#tabs").tabs("option", "active",  tab_page.MAIN);
        inputField.focus();
        return;
    }

    if ((typeof $(".xml_file_id")[0] == "undefined") ||      //  check for missing form values
        (typeof $(".xml_model-solution_fileref")[0] == "undefined")) {
          setErrorMessage("Required elements are missing. " +
                           "At least one model solution element and its " +
                           "corresponding file element must be provided. ");
         return;
    }

    var returnFromFunction = false;
    $.each($(".xml_file_filename"), function(index, item) {  // check whether filenames are provided
      if (item.value == "") {
        setErrorMessage("Filename is empty.");
        $("#tabs").tabs("option", "active",  tab_page.FILES);
        item.focus();
        returnFromFunction = true;
      }
    });
    if (returnFromFunction)
      return;

    $.each($(".xml_model-solution_filename"), function(index, item) {   // check whether referenced filenames exists
      if (item.value == "") {
        $("#tabs").tabs("option", "active",  tab_page.MODEL_SOLUTION);
        setErrorMessage("Filename in model solution is missing.");
        item.focus();
        returnFromFunction = true;
      }
    });
    if (returnFromFunction)
        return;

    $.each($(".xml_ju_mainclass"), function(index, item) {   // check whether main-class exists
      if (item.value == "") {
          $("#tabs").tabs("option", "active",  tab_page.TESTS);
        setErrorMessage("Name of test class is missing.");
        item.focus();
        returnFromFunction = true;
      }
    });
    if (returnFromFunction)
      return;

    $.each(mapSingleElements, function(index, item) {
      try {
         convertFormToXML(xmlObject.find(item.xmlname)[0],$(item.formname).val(),item.cdata);
      } catch(err) { setErrorMessage("missing: "+ item.xmlname);}
    });
    $.each(mapSingleAttrs, function(index, item) {
      try {
        xmlObject.find(item.xmlpath)[0].setAttribute(item.xmlname,$(item.formname).val());
      } catch(err) { setErrorMessage("missing: "+item.xmlpath);}
    });

    $.each(mapElemSequence, function(index, item) {                 // loop: files, model-sols, ...
      if (typeof $(item.formname).val() != "undefined") {           // it exists in the form
        try {                                                       // delete unwanted children
          if (item.formname != ".xml_test") {
             for(cnt=$(item.formname).length+1;cnt<=xmlObject.find(item.xmlname).length;cnt++) {
                xmlObject.find(item.xmlpath)[0].removeChild(xmlObject.find(item.xmlname)[cnt-1]);
             }                                                      // create as many children as needed
             for(cnt=xmlObject.find(item.xmlname).length+1;cnt<=$(item.formname).length;cnt++) {
                xmlObject.find(item.xmlpath)[0].appendChild(xmlObject.find(item.xmlname)[0].cloneNode(1));
             }
          }
          if (item.formname == ".xml_test") {                       // delete all tests
             while (xmlObject.find(item.xmlpath)[0].firstChild) {
               xmlObject.find(item.xmlpath)[0].removeChild(xmlObject.find(item.xmlpath)[0].firstChild);
             }
             for(cnt=1;cnt<=$(item.formname).length;cnt++) {        // recreate all tests
              if ($(item.formname).find(".xml_test_type")[cnt-1].value == "java-compilation") {
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["JavaCompile"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "unittest") {
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["JavaJunit"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "jartest") {
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["SetlX"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "java-checkstyle"){
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["CheckStyle"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "dejagnu-setup"){
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["DGSetup"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "dejagnu-tester"){
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["DGTester"]).find('test')[0].cloneNode(1));
              } else if ($(item.formname).find(".xml_test_type")[cnt-1].value == "python") {
                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate["Python"]).find('test')[0].cloneNode(1));
              }
             }
          }
        } catch(err) { setErrorMessage("missing: "+item.xmlpath+" or "+item.xmlname);}

        $(item.formname).each(function (idx1, itm1) {               // loop: xml_file existing in the form
           $.each(mapTextInElemSequence, function(idx2, itm2) {
             if (item.xmlname == itm2.xmlname) {                    // relational join
               try {                                                // deal with codemirror for file textarea
                 if ((itm2.formname == '.xml_file_text') && (codemirrorOnOrOff == 1)) {
                   //convertFormToXML(xmlObject.find(item.xmlname)[idx1],codemirror[idx1+1].getValue(),itm2.cdata);
                   convertFormToXML(xmlObject.find(item.xmlname)[idx1],codemirror[$(itm1).find('.xml_file_id').val()].getValue(),itm2.cdata);
                 } else {
                    convertFormToXML(xmlObject.find(item.xmlname)[idx1],$(itm1).find(itm2.formname).val(),itm2.cdata);
                 }
               } catch(err) { setErrorMessage("missing: "+item.xmlname);}
             }
           });

           $.each(mapAttrInSequence, function(idx2, itm2) {         // loop: attributes
             if (item.xmlname == itm2.xmlpath) {                    // relational join
               try {
                 xmlObject.find(itm2.xmlpath)[idx1].setAttribute(itm2.xmlname,
                         $(itm1).find(itm2.formname).val());
               } catch(err) { setErrorMessage("missing: "+item.xmlname);}
             }
           });

           $.each(mapAttrOfTestElems, function(idx2, itm2) {        // loop: framework and version
             if (typeof $(itm1).find(itm2.formname).val() != "undefined") {    // it exists in the form
               try {
                  $(xmlObject.find(itm2.listelem)[idx1]).find(itm2.xmlpath).attr(itm2.xmlname,
                         $(itm1).find(itm2.formname).val());
               } catch(err) { setErrorMessage("missing: "+item.xmlname);}
             }
           });

           $.each(mapChildElems, function(idx2, itm2) {             // loop: test-title, ...
             if (typeof $(itm1).find(itm2.formname).val() != "undefined") {    // it exists in the form
              if (item.formname == itm2.formcontainer) {            // relational join
               try {
                 convertFormToXML($(xmlObject.find(itm2.xmlpath)[idx1]).find(itm2.xmlname)[0],
                                 $(itm1).find(itm2.formname).val(),itm2.cdata);
               } catch(err) { setErrorMessage("missing: "+itm2.xmlpath+idx1+itm2.xmlname);}
              }
            }
           });
           $.each(mapListOfChildElems, function(idx2, itm2) {       // loop: filerefs
             if (typeof $(itm2.formname).val() != "undefined") {    // it exists in the form
              if (item.formname == itm2.formcontainer) {            // relational join
               try {                                                // ToDo: filerefs deletable
                  tempvar = xmlObject.find(itm2.xmlpath)[idx1];
                  nrInForm = $(itm1).find(itm2.formname).length;
                  nrInXML = $(tempvar).find(itm2.xmlname).length;
                  for(cnt=nrInXML; cnt<=nrInForm-1; cnt++) {        // create more filerefs in the XML
                     if ($(itm1).find(itm2.formname)[cnt].value !== "") {
                        tempdata = tempXmlDoc.createElement(itm2.xmlname);
                        $(xmlObject.find(itm2.xmlpath)[idx1]).find(itm2.listelem)[0].appendChild(tempdata);
                     }
                  }
                  $.each($(tempvar).find(itm2.xmlname), function(idx3,itm3) {  // loop fileref
                      itm3.setAttribute(itm2.listattr,$(itm1).find(itm2.formname)[idx3].value,itm2.cdata);
                  });
               } catch(err) { setErrorMessage("missing: "+itm2.xmlpath+idx1+itm2.xmlname);}
              }
            }
           });
        });
      }
    });

    var tempvals = $("#xml_programming-language").val().split("/");
    try {                                                           // deal with proglang
      xmlObject.find("proglang")[0].setAttribute("version",tempvals[1]);
      xmlObject.find("proglang")[0].textContent = tempvals[0];
    } catch(err) { setErrorMessage("missing: proglang");}
    if (xsdSchemaFile == version101) {
      if ($("#xml_uuid").val() == ''){
        xmlObject.find('task').attr('uuid',generateUUID());
      } else {
        xmlObject.find('task').attr('uuid',$("#xml_uuid").val());
      }
    }
    try {
      var xmlString = (new XMLSerializer()).serializeToString(xmlDoc);
      var replacer = new RegExp('xmlns.*? ',"g");                  // remove all namespace declarations
      xmlString = xmlString.replace(replacer, "");
      replacer = new RegExp('<task ',"g");                         // insert correct namespace declaration
      xmlString = xmlString.replace(replacer, "<task "+namespace);
      replacer =                                                   // ToDo: this is a hack, set filerefs properly
        new RegExp('java-compilation</test-type><test-configuration><filerefs><fileref refid=""/></filerefs>',"g");   
      xmlString = xmlString.replace(replacer, "java-compilation</test-type><test-configuration>");
      if ((xmlString.substring(0, 5) != "<?xml")){
        xmlString = "<?xml version='1.0' encoding='UTF-8'?>" + xmlString;
      }
      $("#output").val(xmlString);
      $.get(xsdSchemaFile, function(data, textStatus, jqXHR) {      // read XSD schema
        var valid = xmllint.validateXML({xml: xmlString, schema: jqXHR.responseText});
        if (valid.errors !== null) {                                // does not conform to schema
          setErrorMessage(valid.errors[0]);
        }
      }).fail(function(jqXHR, textStatus, errorThrown) {
        setErrorMessage("XSD-Schema not found.");
      });
    } catch(err) { setErrorMessage("Problem with the XML serialisation.");}
    if (loncapaOnOrOff == 1) {                                      // only if LON-CAPA is being used
      if (xsdSchemaFile == version101) {
        createLONCAPAOutput(tempvals[0],codemirror,"101"); 
      } else { 
	    createLONCAPAOutput(tempvals[0],codemirror,"old");
      }  
    }

      success = true;
  };

///////////////////////////////////////////////////////// function: readXML
/* This converts an XML file into form elements.
 * First, it does some initialisation and validation.
 * Then it loops through the data structure that was created for the XML file.
 * It deletes most of the form and wipes the counter variables before it recreates things.
 * Proglang is dealt with separately.
 */

  readXML = function(xmlText) {
    changeNamespaces = function(somexml) {
      replaceNamespace = function(smxml,tempstr,tempnsprefix,tempcl) {
        if (tempstr) { tempstr = tempstr[1] }
        if (tempstr != tempnsprefix) {
	  var replacer = new RegExp('<'+tempstr+':',"g");
	  smxml = smxml.replace(replacer,"<"+tempnsprefix+tempcl);    // rename start tags
          replacer = new RegExp('</'+tempstr+':',"g");
          smxml = smxml.replace(replacer,"</"+tempnsprefix+tempcl);   // rename end tags
          replacer = new RegExp('xmlns\\s*:'+tempstr);
	  smxml = smxml.replace(replacer,"xmlns"+tempcl+tempnsprefix);   // change the declaration
        }	
        return smxml;
      }
      var tempreg = new RegExp("<(\\S*?):task\\s+");                     // is there a global prefix
      tempmatch = somexml.match(tempreg);
      somexml = replaceNamespace(somexml,tempmatch,"","");
      tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:(tests:)?unittest");   // unittests
      tempmatch = somexml.match(tempreg);
      somexml = replaceNamespace(somexml,tempmatch,pfix_unit,":");
      tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:tests:jartest");       // jartests
      tempmatch = somexml.match(tempreg);
      somexml = replaceNamespace(somexml,tempmatch,pfix_jart,":");
      tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:praktomat");           // praktomat
      tempmatch = somexml.match(tempreg);
      somexml = replaceNamespace(somexml,tempmatch,pfix_prak,":");
      return somexml;
    }

    var outputValue = $("#output").val();
    if (outputValue.length > 0) {
        var checktemp = window.confirm("All form content will be deleted and replaced.");
        if (!checktemp) {
            return;
        }                         // proceed only after confirmation
    }
    gradingHintCounter = 1;                            // variable initialisation
    codemirror = {};
    clearErrorMessage();

    var xmlTemplate = xmlText; // copy text from variable if available
    if (xmlTemplate == undefined)
      xmlTemplate = outputValue;              // read textarea

    if (xmlTemplate !== "") {
      xmlTemplate = changeNamespaces(xmlTemplate);     // rename namespaces if necessary
      try {
        var xmlDoc = $.parseXML(xmlTemplate);          // parse its XML
      } catch (err){
        setErrorMessage("Error while parsing the xml file. The file has not been imported.");
        return;                                        // Stop. Do not make any further changes.
      }
      var xmlObject = $(xmlDoc);                       // convert it into a jQuery object
      var tempschema;                                  // create the data structure according to the version
      if (xmlObject.find('task').attr('xmlns') == "urn:proforma:task:v1.0.1") {
        tempschema = version101;
        createMapping(version101);
      } else {
        tempschema = version094;
        createMapping(version094);
      }
      $.get(tempschema, function(data, textStatus, jqXHR) {      // read XSD schema and validate
        var valid = xmllint.validateXML({xml: xmlTemplate, schema: jqXHR.responseText});
        if (valid.errors !== null) {                             // does not conform to schema? 
          setErrorMessage(valid.errors[0]);
        }
      }).fail(function(jqXHR, textStatus, errorThrown) {
        setErrorMessage("XSD-Schema not found.");
      });

      $.each(mapSingleElements, function(index, item) {          // ToDo grading hints
        if (xmlObject.find(item.xmlname)[0]) {
          $(item.formname).val(xmlObject.find(item.xmlname)[0].textContent);}
      });
      $.each(mapSingleAttrs, function(index, item) {
        if (xmlObject.find(item.xmlpath)[0]) {
          $(item.formname).val(xmlObject.find(item.xmlpath)[0].getAttribute(item.xmlname));
          if ($(item.formname).val() === null) {                 // check if selected element exists
            setErrorMessage("'"+xmlObject.find(item.xmlpath)[0].getAttribute(item.xmlname)+"' is not an option for "+item.xmlname);
          }
        }
      });
      $("#filesection")[0].textContent = "";                     // delete previous content
      $("#modelsolutionsection")[0].textContent = "";
      $("#testsection")[0].textContent = "";
      fileIDs = {};
      modelSolIDs = {};
      testIDs = {};

      $.each(mapElemSequence, function(index, item) {
         idx1cnt = 0;                                                 // differs from idx1 if wrong test-type
         xmlObject.find(item.xmlname).each(function (idx1, itm1) {    // loop: file, test, ...
            if (item.xmlpath == "files") {
               newFile($(itm1).attr("id"));
               fileIDs[$(itm1).attr("id")] = 1;
            }
            if (item.xmlpath == "model-solutions") {
               newModelsol($(itm1).attr("id"));
               modelSolIDs[$(itm1).attr("id")];
            }
            if (item.xmlpath == "tests") {
               testIDs[$(itm1).attr("id")] = 1;
               if ($(itm1).find('test-type')[0].textContent == 'java-compilation') {
                  newTest($(itm1).attr("id"),"Java Compiler Test", TextJavaComp, "java-compilation");
               } else if ($(itm1).find('test-type')[0].textContent == 'unittest') {
                  newTest($(itm1).attr("id"),"Java JUnit Test", TextJavaJunit, "unittest");
               } else if ($(itm1).find('test-type')[0].textContent == 'jartest') {
                  newTest($(itm1).attr("id"),"SetlX Test", TextSetlX, "jartest");
               } else if ($(itm1).find('test-type')[0].textContent == 'java-checkstyle') {
                  newTest($(itm1).attr("id"),"CheckStyle Test", TextJavaCheckst, "java-checkstyle");
               } else if ($(itm1).find('test-type')[0].textContent == 'dejagnu-setup') {
                  newTest($(itm1).attr("id"),"DejaGnu Setup","", "dejagnu-setup");
               } else if ($(itm1).find('test-type')[0].textContent == 'dejagnu-tester') {
                  newTest($(itm1).attr("id"),"DejaGnu Tester","", "dejagnu-tester");
               } else if ($(itm1).find('test-type')[0].textContent == 'python') {
                  newTest($(itm1).attr("id"),"Python Test","","python");
               } else if ($(itm1).find('test-type')[0].textContent) {
                  setErrorMessage("Test "+$(itm1).find('test-type')[0].textContent+" not imported");
                  testIDs[$(itm1).attr("id")] = 0;
                  return true;                                        // next iteration because wrong test-type
               }
            }
            $.each(mapTextInElemSequence, function(idx2, itm2) {
             if (item.xmlname == itm2.xmlname) {                      // relational join
               try {                                                  // deal with codemirror for file textarea
                  if ((itm2.formname == '.xml_file_text') && (codemirrorOnOrOff == 1)) {
                     codemirror[$(itm1).attr('id')].setValue(itm1.textContent);
                  } else {
                     $($(item.formname)[idx1cnt]).find('textarea')[0].textContent = itm1.textContent;
                  }
               } catch(err) { setErrorMessage("problem with: "+item.xmlname+idx1+itm1);}
             }
            });
            $.each(mapAttrInSequence, function(idx2, itm2) {          // loop: attributes
               if (item.xmlname == itm2.xmlpath) {                    // only relevant attributes
                 try {
                   $($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                   xmlObject.find(itm2.xmlpath)[idx1].getAttribute(itm2.xmlname);
                 } catch(err) {setErrorMessage("problem with "+itm2.formname+idx1);}
               }
            });
            $.each(mapAttrOfTestElems, function(idx2, itm2) {         // loop: framework and version
               if ($(itm1).find(itm2.xmlpath).length > 0) {           // is it defined in this case?
                 try {
                   //$($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                   //$(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname);
                   $($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val($(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname));
                   if ($($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val() === null) { // check selected
                     setErrorMessage("'"+$(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname)+"' is not an option for "+itm2.xmlname);
                   }
                 } catch(err) {setErrorMessage("problem with "+itm2.formname+idx1);}
               }
            });
            $.each(mapChildElems, function(idx2, itm2) {              // loop: test-title, ...
               if ($(itm1).find(itm2.xmlname).length > 0) {           // is it defined in this case?
                 try {
                   //$($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                   //    $(itm1).find(itm2.xmlname)[0].textContent;
                   $($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val($(itm1).find(itm2.xmlname)[0].textContent);
                   if ($($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val() === null) {   // check selected
                     setErrorMessage("'"+$(itm1).find(itm2.xmlname)[0].textContent+"' is not an option for "+itm2.xmlname);
                   }
                 } catch(err) {setErrorMessage( "problem with "+itm2.formname+idx1);}
               }
            });

            $.each(mapListOfChildElems, function(idx2, itm2) {        // loop: fileref (and filenames)
               if ($(itm1).find(itm2.xmlname).length > 0 && item.formname == itm2.formcontainer) {
                 try {
                   // retrieve filename from fileid
                   var itm1_itm2_xmlname = $(itm1).find(itm2.xmlname);

                   $.each(itm1_itm2_xmlname, function(index, refid_tag) {
                       var fileid = refid_tag.getAttribute(itm2.listattr);
                       var fileid_obj = $("#filesection").find(".xml_file_id[value='"+ fileid +"']");
                       var filename = fileid_obj.parent().find(".xml_file_filename").val();

                       if ("" == fileid && !filename && version094 == tempschema ) {
                           // accept empty fileids in version 0.9.4 and ignore
                           return false;
                       }
                       // set filename in item
                       var object = $($(item.formname)[idx1cnt]);
                       if (item.formname == ".xml_test") {
                           // set filename in test
                           if (index > 0) {
                               addTestFileRef(object.find(".add_file_ref_test").first());
                           }
                           var element = object.find(".xml_test_filename");
                           setFilenameList(element.eq(index));
                           element.eq(index).val(filename).change();
                           object.find(itm2.formname)[index].value = fileid;
                       } else if (item.formname == ".xml_model-solution") {
                           // set filename in model solution
                           if (index > 0) {
                               addMsFileRef(object.find(".add_file_ref").first());
                           }
                           var element = object.find(".xml_model-solution_filename");
                           setFilenameList(element.eq(index));
                           element.eq(index).val(filename).change();
                           object.find(itm2.formname)[index].value = fileid;
                       }
                   });
                 } catch(err) {setErrorMessage( "problem with reading filerefs", err);}
               }
            });

            idx1cnt++;
         });
      });

      if (xmlObject.find("proglang")[0]) {              // deal with proglang
        var tempvals1, tempvals0;
        tempvals1 = xmlObject.find("proglang")[0].getAttribute("version");
        tempvals0 = xmlObject.find("proglang")[0].textContent;
        $("#xml_programming-language").val(tempvals0+"/"+tempvals1);
        if ($("#xml_programming-language").val() === null) {
          setErrorMessage("This combination of programming language and version is not supported.");
        }
      }
    } else {                                           // end: if there is xml content provided
      setErrorMessage("The textarea is empty.");
    }
  };

///////////////////////////////////////////////////////// function: insertmanual()
/* This reads the user manual and the faq as HTML files (via AJAX)
 * and places them into the main page at tabs-4 and tabs-5 respectively.
 */
  function insertmanual() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
       if (request.readyState==4) {
           var text = request.responseText;
           $("#tabs-5").html(text);
       }
    };
    request.open("GET","manual.html",true);
    request.send(null);
    var request1 = new XMLHttpRequest();
    request1.onreadystatechange = function() {
      if (request1.readyState==4) {
        var text = request1.responseText;
        $("#tabs-6").html(text);
      }
    };
    request1.open("GET","faq.html",true);
    request1.send(null);
  }

  function switchProgLang() {
//        var progLang = this.val();
    var progLang = $("#xml_programming-language").val();
    console.log("change programming language to " + progLang);
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

  // MAIN
  try {
      insertmanual();
  } catch(err) { setErrorMessage("file 'manual.html' cannot be found");}


///////////////////////////////////////////////////////// if LON-CAPA is used insert relevant form elements
  if (loncapaOnOrOff == 1) { insertLCformelements();}

  // create dummy button for saving task.xml
  var anchor = document.createElement("a");
  anchor.style = "display: none";
  //anchor.id = "dummy_save_xml_button";
  document.body.appendChild(anchor);

  // There must be at least one model solution
  // newFile(setcounter(fileIDs));
  newModelsol(setcounter(modelSolIDs));
  // show/hide buttons according to programming language
  switchProgLang();

  // register callback
  $("#xml_programming-language").on("change", switchProgLang )
  $("#button_load").click(function(){
    $("#upload_xml_file").click();
  })

  $("#button_save_xml").click(function(){
    console.log("button_save_xml clicked");
    convertToXML();
    downloadTextFile2($("#output"), "task.xml", anchor);
    //downloadTextFile2($("#output"), "task.xml", $("#dummy_save_xml_button")[0]);
  })





    if (!DEBUG_MODE) {
    $("#buttonClear").hide();
    $("#output").attr("readonly", true);

    $("#button_text").hide();
    $("#buttonExport").hide();
    $("#buttonImport").hide();
  }

  if (TEST_MODE) {
      $("#buttonExport").show();
      $("#buttonImport").show();
  }
    // TODO: try
    // $('a').on('click', function(e){e.preventDefault();alert("clicked");});

    // TODO: hide debug_tab
  //if (!TEST_ENABLED) {
/*    $("#tabs-Debug").tabs("option", "hide", { effect: "explode", duration: 1000 });
    $("#debug_output").tabs("option", "hide", { effect: "explode", duration: 1000 });
    $("#tabs").tabs("option", "hide", { effect: "explode", duration: 1000 });
    */
  //  $("debug_output").style.display = "none";
  //}


});

///////////////////////////////////////////////////////// end of document ready function
