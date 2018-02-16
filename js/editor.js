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
  MODEL_SOLUTION:  1,
  TESTS:  2,
  FILES:  3,
  DEBUG:  4,
  MANUAL: 5,
  FAQ:    6
};

const DEBUG_MODE = false;
const TEST_MODE = false;



//////////////////////////////////////////////////////////////////////////////
//* Global variables

var codeversion   = '2.1.1';                     // contains the current version of this code
                                                       // these variables can be set in the calling HTML file  
var readXmlActive = false;



// string constants
const loadFileOption = "<load...>";
const emptyFileOption = "";
const testTypes = getTesttypeOptions();


//////////////////////////////////////////////////////////////////////////////
//* These global variables keep track of how many of these elements currently exist. 
var fileIDs = {};
var modelSolIDs = {};
var testIDs = {};
var gradingHintCounter;                                // only 1 grading hint is allowed
var codemirror = {};

// Codemirror description editor is made global in order to allow access
// to test environment.
var descriptionEditor;

// create option list string with all test types
function getTesttypeOptions() {
    var list = "";
    var first = true;
    $.each(testInfos, function(index, item) {
        list = list + "<option";
        if (first) {
            list = list + " selected='selected'";
            first = false;
        }
        list = list + ">" + item.testType;
        list = list + "</option>";
    });
    return list;
}

// create option list string with all test types
function getProgLangOptions() {
    var list = "";
    var first = true;
    $.each(proglangInfos, function(index, item) {
        list = list + "<option";
        if (first) {
            list = list + " selected='selected'";
            first = false;
        }
        list = list + " value='" + item.name + "'>" + item.name;
        list = list + "</option>";
    });
    return list;
}


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
        styleActiveLine: true, viewportMargin: Infinity, autoCloseBrackets: true, theme: "eclipse",
            dragDrop: false
    });

    var editor = codemirror[cmID];
    $(editor.getWrapperElement()).resizable({
        handles: 's', // only resize in north-south-direction
        resize: function() {
            editor.refresh();
        }
    });
    editor.on("drop",function(editor,e){
        //uploadFileWhenDropped(e.originalEvent.dataTransfer.files, e.currentTarget);
        console.log('codemirror drop: ' + e);
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
function setErrorMessageInvalidOption(xmlpath, attribute, value) {                  // setting the error console
    setErrorMessage("'"+value+"' is not an option for '"+xmlpath + "'/'" + attribute + "'");

}

function setErrorMessage(errormess, exception) {                  // setting the error console
    var error_output = $("#error-message");
    error_output.append("\n* " + errormess);
    if (exception != undefined) {
        error_output.append("\n  (" + exception.message + ")");
        console.log(exception.stack);
    }

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
function uploadTestTaskFile(inputbutton) {
    // var filenew = inputbutton.files[0];
    // TODO....
}

function uploadTaskFile(inputbutton) {                     // upload button for textareas: output, output2
        var filenew = inputbutton.files[0];
        switch (filenew.type) {
            case 'application/zip':
            case 'application/x-zip-compressed':
                var text = unzipme(filenew, $("#output"), function (text) {
                    readXMLWithLock(text);
                });
                break;
            case "text/xml":
                if (filenew) {
                    var readfi = new FileReader();
                    readfi.onload = function (e) {
                        var text = e.target.result;
                        $("#output").val(text);
                        readXMLWithLock(text);
                    }
                    readfi.readAsText(filenew);
                }
                break;
            default:
                setErrorMessage("Unsupported file format: " + filenew.type);
                break;
        }
}

// unused
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

    // kann sein, dass das auch funktioniert
//    downloadText3(text, filename, 'text/plain');
//    return;

     var text1 = encodeURIComponent(text);
    // create dummy button for saving task.xml
    dummybutton.href = "data:text/text;charset=utf-8," + text1;
    dummybutton.download = filename;
    dummybutton.click();
}

/*
function downloadText3(text, name, type) {
    var dummyAnchor = document.getElementById("dummyAnchor");
    var file = new Blob([text], {type: type});
    dummyAnchor.href = URL.createObjectURL(file);
    dummyAnchor.download = name;
    dummyAnchor.click();
}
*/

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
    const fileId = $(inputbutton).parent().parent().find(".xml_file_id").val();
    readAndCreateFileData(filenew, fileId);
  }


  function readAndCreateFileData(file, fileId, callback) {
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
          //console.log("create filebox");
          var text = e.target.result;

          // special handling for JAVA: extract class name and package name and
          // recalc filename!
          if (filename.match(/(.java)/i)) {
              filename = java_getFilenameWithPackage(text);
          }

          // recheck if a file with that filename already is stored
          if (doesFilenameExist(filename)) {
              alert("A file named '" + filename + "' already exists.");
              return;
          }

          if (fileId < 0 ) { // create file box
              fileId = setcounter(fileIDs);
              newFile(fileId); // add file
          }
          // set filename in test
          $(".xml_file_id[value='"+fileId+"']").parent().find(".xml_file_filename").first().val(filename);
          // set file text
          if (useCodemirror) {
              codemirror[fileId].setValue(text);
          } else {
              $(inputbutton).parent().parent().find(".xml_file_text").val(text);
          }

          // update filenames in all filename options
          onFilenameChanged();

          if (callback)
            callback(filename);
      };
      //console.log("read file");
      reader.readAsText(file);
  }

  // OBSOLETE
/*
  function readSingleFileAndCreateFilebox(inputbutton, callback) {  // read a file and its filename into the HTML form
      //console.log("select file");
      var filenew = inputbutton.files[0];
      if (!filenew) {
          console.log("no file selected -> cancel");
          return;
      }

      readAndSetFileData(filenew, callback);
  }
*/

  onFilenameChanged = function(textbox) {
      // after change of filename update all filelists

      if (textbox) {
          // if thew user has changed the filename and the extension is .java
          // then the filename is recalculated on base of the source code (package class)
          // and checked against user filename
          var filename = $(textbox).val();
          if (filename.match(/(.java)/i)) {
              var filebox = $(textbox).closest(".xml_file");
              var text = "";
              if (useCodemirror) {
                  const fileId = filebox.find(".xml_file_id").val();
                  text = codemirror[fileId].getValue();
              } else {
                  var textarea = filebox.find(".xml_file_text");
                  text = textarea.val();
              }

              var expectedFilename = java_getFilenameWithPackage(text);
              if (expectedFilename != filename && expectedFilename != ".java") {
                  if (confirm("Java filenames shall consist of the " +
                      "package name, if any, and the class name. " +
                      "Thus the expected filename is '" + expectedFilename + "'\n" +
                      "Do you want to change the filename?")) {
                        $(textbox).val(expectedFilename);
                  }
              }
          }
      }



      $.each($(".xml_test_filename, .xml_model-solution_filename"), function(index, item) {
          //console.log("update filelist in test ");
          // store name of currently selected file
          var text = $("option:selected", item).text(); // selected text
          //console.log("selected is " + text);
          updateFilenameList(item); // update filename list in tests and model solutions

          if (text.length > 0) {
              // check if previously selected filename is still in list
              // (ich weiß im Moment nicht, wie man die Einträge aus
              // der Liste rauszieht...TODO)
              // TODO einfacher: einfach setzen und schauen, ob leer???
              var indexFound = -1;
              $.each($(".xml_file_filename"), function (indexOpt, item) {
                  if (item.value.length > 0 && item.value == text) {
                      indexFound = indexOpt;
                  }
              });
              if (indexFound >= 0) {
                  //console.log("selektiere " + indexFound);
                  item.selectedIndex = indexFound + 1; // +1:weil am Anfang noch ein Leerstring ist
              } else {
                  // filename not found => remove fileid
                  console.log("filename ref not found");
                  $(item).closest(".xml_test,.xml_model-solution").
                    find($(".xml_test_fileref, .xml_model-solution_fileref")).first().val("");
              }
          }
      });
  };

  newFile = function(tempcounter) {                    // create a new file HTML form element
    $("#filesection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_file drop_zone'>"+
    "<h3 class='ui-widget-header'>File #"+tempcounter+"<span "+
    "class='rightButton'><button onclick='removeFile($(this));'>x</button></span></h3>"+
    "<p><label for='xml_file_id'>ID: </label>"+
    "<input class='tinyinput xml_file_id' value='"+tempcounter+"' readonly/>"+
    " <label for='xml_file_filename'>Filename (with extension)<span class='red'>*</span>: </label>"+
    "<input class='mediuminput xml_file_filename' onchange='onFilenameChanged(this)'/>"+
    " <label for='xml_file_type'>Type: </label>"+
        "<span class='drop_zone_text'>Drop Your File Here!</span>" +
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
    var fileroot = $(".xml_file_id[value='" + tempcounter + "']").closest(".xml_file");
    if (!DEBUG_MODE) {
      fileroot.find(".xml_file_type").hide();
      fileroot.find("label[for='xml_file_type']").hide();
      fileroot.find(".xml_file_id").hide();
      fileroot.find("label[for='xml_file_id']").hide();
    }
    if (useCodemirror) { addCodemirrorElement(tempcounter); }

      fileroot.on({
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
                      uploadFileWhenDropped(e.originalEvent.dataTransfer.files, e.currentTarget);
                  }
              }
          }
      });
  };

  onFileSelectionChanged = function(tempSelElem) {              // changing a filename in the drop-down

      function setJavaClassname(newFilename) {
          // set classname if file belongs to JUNIT and if exactly one file is assigned
          var testBox = $(tempSelElem).closest(".xml_test");
          var ui_classname = $(testBox).find(".xml_ju_mainclass");
          if (ui_classname.length == 1) {
              $.each(ui_classname, function(index, element) {
                  var currentFilename = $(element).val();
                  if (!readXmlActive)
                      $(element).val(java_getFullClassnameFromFilename(newFilename)).change();
              });
          }
      }

      function setJUnitDefaultTitle(newFilename) {
          // set decsription according to classname
          var testBox = $(tempSelElem).closest(".xml_test");
          var ui_title = $(testBox).find(".xml_test_title");
          if (ui_title.length == 1) {
              $.each(ui_title, function(index, element) {
                  var currentTitle = $(element).val();
                  if (!readXmlActive && currentTitle == JUnit_Default_Title)
                      $(element).val("Junit Test " + java_getPureClassnameFromFilename(newFilename)).change();
              });
          }
      }

      var found = false;
      var selectedFilename = $(tempSelElem).val();
      //console.log("-> selected is '" + selectedFilename + "'");

      switch (selectedFilename) {
          case loadFileOption:
              // read new file
              // reset selection in case choosing a file fails
              $(tempSelElem).val(emptyFileOption); // do not call change!
              // change callback
              var dummybutton = $("#dummy_file_upload_button").first();
              dummybutton.unbind("change");
              dummybutton.change(function () {
                  var inputbutton = $("#dummy_file_upload_button")[0];
                  var filenew = inputbutton.files[0];
                  if (!filenew) {
                      console.log("no file selected -> cancel");
                      return;
                  }
                  readAndCreateFileData(filenew, -1,
                      function (newFilename) {
                          if ($(tempSelElem)) {
                              $(tempSelElem).val(newFilename).change();
                          }
                          // set classname if file belongs to JUNIT
                          setJavaClassname(newFilename);
                          setJUnitDefaultTitle(newFilename);
                      });
              });
              // perform dummy click
              dummybutton.click();
              return;
          case emptyFileOption:
              return; // do nothing
          default:
              var nextTd = $(tempSelElem).parent().next('td');
              $.each($(".xml_file_filename"), function(index, item) {
                  if (selectedFilename == item.value ) {
                      var fileid = $(item).first().parent().find(".xml_file_id").val();
                      if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
                          nextTd.find('.xml_test_fileref')[0].value=fileid;

                          //            $(tempSelElem).parent().find('.xml_test_fileref')[0].value=
                          //              $(item).first().parent().find(".xml_file_id").val();
                      } else {
//                          var fileid = $(item).first().parent().find(".xml_file_id").val();
//                          var nextTd = $(tempSelElem).parent().next('td');
                          nextTd.find('.xml_model-solution_fileref')[0].value=fileid;
                      }
                      found = true;
                      // set classname if file belongs to JUNIT
                      setJavaClassname(selectedFilename);
                      setJUnitDefaultTitle(selectedFilename);
                      return false;
                  }
              });
              // file id not found
              if (!found) {
                  console.log("could not find file id for " + selectedFilename);
                  if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
//                      var nextTd = $(tempSelElem).parent().next('td');
                      nextTd.find('.xml_test_fileref')[0].value="";
                      //$(tempSelElem).parent().find('.xml_test_fileref')[0].value="";

                  } else {
//                      var nextTd = $(tempSelElem).parent().next('td');
                      nextTd.find('.xml_model-solution_fileref')[0].value="";
                  }
              }
      }

  };

  updateFilenameList = function(tempSelElem) {            // create the drop-down with all possible filenames
     $(tempSelElem).empty();
     var tempOption = $("<option>" + emptyFileOption + "</option>");
     $(tempSelElem).append(tempOption); // empty string
     $.each($(".xml_file_filename"), function(index, item) {
        if (item.value.length > 0) {
            tempOption = $("<option></option>");
            tempOption[0].textContent = item.value;
            $(tempSelElem).append(tempOption);
        }
     });
      //tempSelElem.val(""); // preset no filename
      tempOption = $("<option></option>");
      tempOption[0].textContent = loadFileOption;
      $(tempSelElem).append(tempOption);
  }


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
        updateFilenameList(table_body.find(".xml_model-solution_filename").last());

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
  const tdFilenameInMs =  "<td><select class='mediuminput xml_model-solution_filename' " + // onfocus = 'updateFilenameList(this)' "+ // select
    "onchange = 'onFileSelectionChanged(this)'></select></td>"+
    "<td><label for='xml_model-solution_fileref'>Fileref: </label>"+ // fileref
    "<input class='tinyinput xml_model-solution_fileref' readonly/></td>";
  const tdFileAddButtonInMs = "<td><button class='add_file_ref_ms' title='add another filename' onclick='addMsFileRef($(this))'>+</button><br></td>";
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
        "<span class='drop_zone_text drop_zone'>Drop Your File(s) Here!</span>" +
    "<p><label for='xml_model-solution_comment'>Comment: </label>"+
    "<input class='largeinput xml_model-solution_comment'/></p></div>");

    var msroot = $(".xml_model-solution_id[value='" + tempcounter + "']").parent().parent();
    msroot.find(".rem_file_ref_ms").hide(); // hide remove file button
    updateFilenameList(msroot.find(".xml_model-solution_filename").last());

    if (!DEBUG_MODE) {
        // hide fields that exist only for technical reasons
        msroot.find(".xml_model-solution_id").hide();
        msroot.find("label[for='xml_model-solution_id']").hide();

        msroot.find(".xml_model-solution_fileref").hide();
        msroot.find("label[for='xml_model-solution_fileref']").hide();

//      msroot.find(".xml_model-solution_fileref").first().hide();
//      msroot.find("label[for='xml_model-solution_fileref']").first().hide();
    }

      msroot.on({
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
                      uploadModelSolFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
                  }
              }
          }
      });
  };

/*
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
        updateFilenameList(table_body.find(".xml_test_filename").last());

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
  const tdFilenameInTest = "<td><select class='mediuminput xml_test_filename' " + // onfocus = 'updateFilenameList(this)' "+
      "onchange = 'onFileSelectionChanged(this)'></select></td>"+
      "<td><label for='xml_test_fileref'>Fileref: </label>"+ // fileref
      "<input class='tinyinput xml_test_fileref' readonly/></td>";
  const tdFileAddButtonInTest = "<td><button class='add_file_ref_test' title='add another filename' onclick='addTestFileRef($(this))'>+</button><br></td>";
  const tdFileRemoveButtonInTest = "<td><button class='rem_file_ref_test' onclick='remTestFileRef($(this))'>x</button></td>";
*/

  newTest = function(tempcounter,TestName, MoreText, TestType, WithFileRef) { // create a new test HTML form element

    $("#testsection").append("<div "+
    "class='ui-widget ui-widget-content ui-corner-all xml_test'>"+
    "<h3 class='ui-widget-header'>" + TestName + " (Test #"+tempcounter+")<span "+
    "class='rightButton'><button onclick='remP3($(this));deletecounter(testIDs,$(this));'>x</button></span></h3>"+
    "<p><label for='xml_test_id'>ID<span class='red'>*</span>: </label>"+
    "<input class='tinyinput xml_test_id' value='" + tempcounter + "' readonly/>"+
        TestFileReference.getTableString() +
/*    "<table>" +
        "<tr>" +
        tdFilenameLabelInTest + // label
        tdFilenameInTest +
        tdFileRemoveButtonInTest + // x-button
        tdFileAddButtonInTest +
        "</tr>"+
    "</table>" + */
        "<span class='drop_zone drop_zone_text'>Drop Your File(s) Here!</span>" +
        //"<br>" +
//    " <label for='xml_test_validity'>Validity: </label>"+
//    "<input class='shortinput xml_test_validity'/>"+
    " <label for='xml_test_type'>Type: </label>"+
    "<select class='xml_test_type'>"+ testTypes + "</select>"+

    "<p><label for='xml_pr_public'>Public<span class='red'>*</span>: </label>"+
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
    var testroot = $(".xml_test_id[value='" + tempcounter + "']").parent().parent();
    testroot.find(".xml_test_type").val(TestType);
    testroot.find(".rem_file_ref_test").hide(); // hide remove file button
    updateFilenameList(testroot.find(".xml_test_filename").last());

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
    if (!WithFileRef) {
        testroot.find("table").hide();
        testroot.find(".drop_zone").hide();
        /*testroot.find(".xml_test_fileref").hide();
        testroot.find("label[for='xml_test_fileref']").hide();
        testroot.find(".xml_test_filename").hide();
        testroot.find("label[for='xml_test_filename']").hide();*/
    }
    else
    {
        testroot.on({
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
                        uploadTestFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
                    }
                }
            }
        });
    }

  };

  function uploadTestFiles(files, testBox){
      //console.log("uploadTestFiles");

      if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // select new filename in first empty filename select option list
                console.log("uploadFiles: select " + filename + " in option list");
                var done = false;
                $.each($(testBox).find(".xml_test_filename"), function(index, element) {
                    if (done) return false;
                    var currentFilename = $(element).val();
                    if (currentFilename == "") {
                        $(element).val(filename).change();
                        done = true;
                    }
                });


                if (!done) { // no empty select option is found
                    // create new filename option list
                    TestFileReference.addTestFileRef($(testBox).find('.add_file_ref_test').last());
                    // select filename
                    $(testBox).find(".xml_test_filename").last().val(filename).change();
                }

                // set classname if exactly one file is assigned
                var ui_classname = $(testBox).find(".xml_ju_mainclass");
                if (ui_classname.length == 1) {
                    $.each(ui_classname, function(index, element) {
                        var currentFilename = $(element).val();
                        if (currentFilename == "" && !readXmlActive) {
                            $(element).val(java_getFullClassnameFromFilename(filename)).change();
                        }
                    });
                }
            });
        });
    }

  function uploadModelSolFiles(files, modelSolBox){
        //console.log("uploadModelSolFiles");
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // select new filename in first empty filename
                //console.log("uploadFiles: select " + filename + " in option list");
                var done = false;
                $.each($(modelSolBox).find(".xml_model-solution_filename"), function(index, element) {
                    if (done) return false;
                    var currentFilename = $(element).val();
                    if (currentFilename == "") {
                        $(element).val(filename).change();
                        done = true;
                    }
                });

                if (!done) { // no empty select option is found
                    // append filename
                    addMsFileRef($(modelSolBox).find('.add_file_ref_ms').last());
                    // select filename
                    $(modelSolBox).find(".xml_model-solution_filename").last().val(filename).change();
                }
            });
        });
    }

    function uploadFileWhenDropped(files, fileBox){
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        const fileId= $(fileBox).find(".xml_file_id").val();
        readAndCreateFileData(files[0], fileId);
    }


    function uploadFilesWhenDropped(files){
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // nothing extra to be done
            });
        });
    }

///////////////////////////////////////////////////////// Configuration support





    function addTestButtons() {
        $.each(testInfos, function(index, item) {
            $("#testbuttons").append("<button id='" + item.buttonJQueryId + "'>Add " + item.title + "</button> ");
            $("#" + item.buttonJQueryId).click(function() {

                var testNo = setcounter(testIDs);    // sets the corresponding fileref, filename and title "SetlX-Syntax-Test"
                newTest(testNo,item.title, item.htmlExtraFields, item.testType, item.withFileRef);
                if (item.onCreated) {
                    item.onCreated(testNo);
                }

                $("#tabs").tabs("option", "active", tab_page.TESTS); });
        });
    }



    function switchProgLang() {
        var progLang = $("#xml_programming-language").val();
        console.log("changing programming language to " + progLang);

        // hide all test buttons
        $.each(testInfos, function(index, test) {
            $("#" + test.buttonJQueryId).hide();
        });

        // show only test buttons needed for programming language
        found = false;
        $.each(proglangInfos, function(index, pl) {
            if (pl.name == progLang) {
                found = true;
                $.each(pl.tests, function(index, test) {
                    $("#" + test.buttonJQueryId).show();
                });
            }
        });

        if (!found) {
            window.confirm("Unsupported Programming Language: " + progLang);
        }
    }

// -------------------------------------------------------------


    // helper function for customn test configuration
    createFileWithContent = function(filename, content) {
        var fileId = setcounter(fileIDs);    // adding a file for the test
        newFile(fileId);                     // filename: setlxsyntaxtest.stlx, content: print()
        $(".xml_file_id[value='"+fileId+"']").parent().find(".xml_file_filename").first().val(filename);
        codemirror[fileId].setValue(content);
        onFilenameChanged();
        return fileId;
    }

    addFileReferenceToTest = function(testId, filename) {
        var xml_test_root = $(".xml_test_id[value='"+testId+"']").parent().parent();
        //xml_test_root.find(".xml_test_fileref").first().val(tempnumber1);
        var element = xml_test_root.find(".xml_test_filename").last();
        element.val(filename).change();
    };

    getTestField = function(testId, fieldClass) {
        var xml_test_root = $(".xml_test_id[value='"+testId+"']").parent().parent();
        return xml_test_root.parent().find(fieldClass).first();
    }


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
      }, 5);

                
    }
  });
//   $("#filesection").sortable();
  $("#modelsolutionsection").sortable();
  $("#testsection").sortable();

  addTestButtons();
  $("#xml_programming-language").append(getProgLangOptions());

  $("#addGH").click(function() {                       // the code for the buttons for adding new elements
    if (gradingHintCounter == 1) {newGH();}            // only one grading hint allowed
    $("#tabs").tabs("option", "active", tab_page.MAIN); });        // where this will be added
  $("#addFile").click(function() {
    newFile(setcounter(fileIDs));
    $("#tabs").tabs("option", "active", tab_page.FILES); });
  $("#addModelsol").click(function() {
    newModelsol(setcounter(modelSolIDs));
    $("#tabs").tabs("option", "active", tab_page.MODEL_SOLUTION); });


    $("#load_xml_file").click(function() {
      console.log("load_xml_file called");
    });
    $("#save_xml_file").click(function() {
        console.log("save_xml_file called");
    });
    $("#save_zip_file").click(function() {
        console.log("save_zip_file called");
    });


///////////////////////////////////////////////////////// function: readXML

   readXMLWithLock =  function(xmlText) {
       readXmlActive = true; // lock automatic input field update
       try {
           readXML(xmlText);
       }
       catch(err) {
           setErrorMessage("uncaught exception", err);
       }
       finally {
           readXmlActive = false;
       }
   };


///////////////////////////////////////////////////////// function: insertmanual()
/* This reads the user manual and the faq as HTML files (via AJAX)
 * and places them into the main page at tabs-4 and tabs-5 respectively.
 */
/*
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
*/


  // MAIN
    /*
  try {
      insertmanual();
  } catch(err) { setErrorMessage("file 'manual.html' cannot be found");}
*/

///////////////////////////////////////////////////////// if LON-CAPA is used insert relevant form elements
  //if (useLoncapa == 1) { insertLCformelements();}

  // create further elements needed for LMS
  createFurtherUiElements();

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

  // function is used only in test environment!!
  enableTestMode = function() {
      // enable support for tests!
      console.log("enable test mode");
      $("#buttonExport").show();
      $("#buttonImport").show();
  }

  if (TEST_MODE) enableTestMode();

  // disable (drag&)drop in whole application except
  // for the intended drop zones
  // (otherwise dropping a file in the browser leaves the editor site)

    const dropzoneClass = "drop_zone";
    window.addEventListener("dragenter", function(e) {
        if (e.target.class != dropzoneClass) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    }, false);

    window.addEventListener("dragover", function(e) {
        if (e.target.class != dropzoneClass) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    });

    window.addEventListener("drop", function(e) {
        if (e.target.class != dropzoneClass) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    });

    // enable dropping files in the file section
    // with creating new file boxes
    var filesection = $("#filesection").parent();
    // use parent instead of filesection here because
    // the acual file section is too small and is not what is expected
    filesection.on({
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
                    //UPLOAD FILES HERE
                    uploadFilesWhenDropped(e.originalEvent.dataTransfer.files, e.currentTarget);
                }
            }
        }
    });


// test
//    var myCsv = "Col1,Col2,Col3\nval1,val2,val3";
//    window.open('data:text/csv;charset=utf-8,' + escape(myCsv));

    // saving files is realised with an anchor having the download attribute set.
    // Unfortunately not every browser supports downloads and not every browser
    // supports data URI as a download link.
    // The following functions check whether this feature is supported
    checkDataURISupport(function (checkResult) {
        if (checkResult) {
            console.log('Files in data URIs are supported.');
        } else {
            alert('Files in data URIs are probabely NOT supported in this browser. ' +
            'Thus saving the task file will not be possible. ' +
            'Please use another browser (Firefox, Chrome).');
        }
    });

    function checkDataURISupport(callback) {
        try {
            var request = new XMLHttpRequest();
            request.onload = function reqListener() {
                if (callback) callback(true);
            };
            request.onerror = function reqListener() {
                if (callback)
                    callback(false);
                else
                    console.log('Files in data URIs are supported.');
            };
            request.open('GET', 'data:application/pdf;base64,cw==');
            request.send();
        } catch (ex) {
            callback(false);
        }
    }

    checkDataURISupport();


    // register html preview window
    var delay;
    descriptionEditor = CodeMirror.fromTextArea(
//        $("#xml_description")[0], {
            document.getElementById('xml_description'), {
        mode: 'text/html',
        autoCloseTags: true
    });
    descriptionEditor.on("change", function() {
        clearTimeout(delay);
        delay = setTimeout(updatePreview, 300);
    });
     $(descriptionEditor.getWrapperElement()).resizable({
        handles: 's', // only resize in north-south-direction
        resize: function() {
            descriptionEditor.refresh();
        }
     });


    function updatePreview() {
        var previewFrame = document.getElementById('preview');
        var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
        preview.open();
        preview.write(descriptionEditor.getValue());
        preview.close();
    }
    setTimeout(updatePreview, 300);

    
    
});

///////////////////////////////////////////////////////// end of document ready function
