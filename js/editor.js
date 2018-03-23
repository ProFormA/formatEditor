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


//////////////////////////////////////////////////////////////////////////////
//* Global variables


// lock
let readXmlActive = false;



// string constants

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
    let list = "";
    let first = true;
    $.each(config.testInfos, function(index, item) {
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
    let list = "";
    let first = true;
    $.each(config.proglangInfos, function(index, item) {
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

/*
function showBinaryFile(fileroot, fileObject) {
    fileroot.find(".xml_file_binary").show(); // show binary text
    fileroot.find(".xml_file_non_binary").hide(); // hide editor
    let xml_file_size = fileroot.find(".xml_file_size");
    xml_file_size.first().text('File size: ' + fileObject.size.toLocaleString() + ", " +
        'File type: ' + fileObject.mimetype);
}

function showTextFile(fileroot) {
    fileroot.find(".xml_file_binary").hide(); // hide binary text
    fileroot.find(".xml_file_non_binary").show(); // show editor
}
*/



//////////////////////////////////////////////////////////////////////////////
/* setcounter and deletecounter are only used for fileIDs, modelSolIDs, testIDs
 * setcounter finds the first available ID and returns it
 * setcounter should be called when a new item is created
 * deletecounter deletes an ID from the hash, to be used when deleting an item
 */
function setcounter(temphash) {
    let tempcnter = 1;
    while (temphash.hasOwnProperty(tempcnter)) {         // if the counter is already used, take next one
        tempcnter++;
    }
    temphash[tempcnter] = 1;
    return tempcnter;
}
function deletecounter(temphash,tempelement) {         // for modelSolIDs, testIDs
  //console.log('deletecounter called');
  // let tempcnter;
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
    let error_output = $("#error-message");
    error_output.append("\n* " + errormess);
    if (exception !== undefined) {
        error_output.append("\n  (" + exception.message + ")");
        console.log(exception.stack);
    }

    error_output.css('visibility', 'visible');
    error_output.scrollTop(error_output[0].scrollHeight);
//    error_output.scrollTop($("#error-message")[0].scrollHeight);
}

function clearErrorMessage() {                         // clearing the error console
    let error_output = $("#error-message");
    error_output.text("");
    error_output.css('visibility', 'hidden');
}

//////////////////////////////////////////////////////////////////////////////
/* Allows to upload a file into a textarea
 * or to create a download link for text from a textarea.
 * These functions are used in click events associated with textareas.
 */
/*
function uploadTestTaskFile(inputbutton) {
    // var filenew = inputbutton.files[0];
    // TODO....
}
*/

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
/*
function downloadFile(downloadLink) {                  // download link for textareas: output, output2
  console.log("downloadFile called");

  var tempbase64 = "";
  try {
      // tempbase64 = window.btoa($(downloadLink).parent().parent().parent().find("textarea").val());
      // $(downloadLink).attr("href",'data:text/text;base64,'+tempbase64);
      var text = $("#output").val();
      /// var text = $(downloadLink).parent().parent().parent().find("textarea").val();
      var text1 = encodeURIComponent(text);
      // var tempbase64 = window.btoa(text); // unused
      $(downloadLink).attr("href",'data:text/text;charset=utf-8,' + text1); // encodeURIComponent(text));
  } catch(err) { setErrorMessage("File cannot be downloaded because it contains an invalid character.");}
}
*/
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




///////////////////////////////////////////////////////// document ready function
/* The main part of this program. To be executed on "document ready".
 * It creates the dynamic HTML elements that are not already defined in the static HTML page.
 * It contains a function for converting the form into an XML file and
 * a function for filling the form from an uploaded XML file.
 */
$(function() {

    $('#codeversion').text("Version "+codeversion);

    gradingHintCounter = 1;

    remP3 = function(bt) {bt.parent().parent().parent().remove();};   // for removing model solutions and tests

/*  remP3Check = function(bt) {                                       // ask before removing
     var remtemp = window.confirm("Do you really want to delete this?");
     if (remtemp) { bt.parent().parent().parent().remove(); }
  };
*/


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

    readAndCreateFileData = function(file, fileId, callback) {
        if (!file)
            return;
        let filename = file.name;

        // check if a file with that filename already is stored
        if (FileWrapper.doesFilenameExist(filename)) {
            alert("A file named '" + filename + "' already exists.");
            return;
        }

        const size = file.size; //get file size
        const mimetype = getMimeType(file.type, filename); //get mime type
        // determine if we have a binary or non-binary file
        const isBinaryFile =  config.isBinaryFile(file, mimetype);
        let reader = new FileReader();
        reader.onload = function(e) {

          // special handling for JAVA: extract class name and package name and
          // recalc filename!
          if (getExtension(filename) === 'java') {
              const text = e.target.result;
              filename = javaParser.getFilenameWithPackage(text, filename);
          }

          // recheck if a file with that filename already is stored
          if (FileWrapper.doesFilenameExist(filename)) {
              alert("A file named '" + filename + "' already exists.");
              return;
          }

          if (fileId < 0 ) { // create file box
              fileId = setcounter(fileIDs);
              newFile(fileId); // add file
          }
          // set filename in test
          let ui_file = FileWrapper.constructFromId(fileId);
          ui_file.filename = filename;

          if (isBinaryFile) {
              // binary file
              // at first update fileStorages because
              // it is needed for changing file type
              let fileObject = new FileStorage(isBinaryFile, mimetype, e.target.result, filename);
              fileObject.setSize(size);
              fileStorages[fileId] = fileObject;
              ui_file.type = 'file';
          } else {
              // assume non binary file
              let fileObject = new FileStorage(isBinaryFile, mimetype, 'text is in editor', filename);
              fileStorages[fileId] = fileObject;
              ui_file.text = e.target.result;
              ui_file.type = 'embedded';
          }

          if (callback)
            callback(filename, fileId);
        };

        //console.log("read file");
        if (isBinaryFile)
            reader.readAsArrayBuffer(file);
        else
            reader.readAsText(file);
    }

    newFile = function(tempcounter) {                    // create a new file HTML form element
        let ui_file = FileWrapper.create(tempcounter);

        // enable drag & drop
        ui_file.root.on({
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



    newModelsol = function(tempcounter) {                // create a new model solution HTML form element
        $("#modelsolutionsection").append("<div "+
        "class='ui-widget ui-widget-content ui-corner-all xml_model-solution'>"+
        "<h3 class='ui-widget-header'>Model solution #"+tempcounter+"<span "+
        "class='rightButton'><button onclick='remP3($(this));deletecounter(modelSolIDs,$(this));'>x</button></span></h3>"+
        "<p><label for='xml_model-solution_id'>ID<span class='red'>*</span>: </label>"+
        "<input class='tinyinput xml_model-solution_id' value='"+tempcounter+"' readonly/>"+
            ModelSolutionFileReference.getInstance().getTableString() +
         //   "<span class='drop_zone_text drop_zone'>Drop Your File(s) Here!</span>" +
        "<p><label for='xml_model-solution_comment'>Comment: </label>"+
        "<input class='largeinput xml_model-solution_comment'/></p></div>");

        const msroot = $(".xml_model-solution_id[value='" + tempcounter + "']").parent().parent();
        FileReference.init(null, null, ModelSolutionFileReference, msroot);

        // ModelSolutionFileReference.getInstance().init(msroot, DEBUG_MODE);

        if (!DEBUG_MODE) {
            // hide fields that exist only for technical reasons
            msroot.find(".xml_model-solution_id").hide();
            msroot.find("label[for='xml_model-solution_id']").hide();
        }
/*
      msroot.on({
          drop: function(e){
              if(e.originalEvent.dataTransfer){
                  if(e.originalEvent.dataTransfer.files.length) {
                      e.preventDefault();
                      e.stopPropagation();
                      //UPLOAD FILES HERE
                      FileReference.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                          ModelSolutionFileReference.getInstance());
                      // ModelSolutionFileReference.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
                  }
              }
          }
      });
      */
    };

    newTest = function(tempcounter,TestName, MoreText, TestType, WithFileRef) { // create a new test HTML form element

        $("#testsection").append("<div "+
        "class='ui-widget ui-widget-content ui-corner-all xml_test'>"+
        "<h3 class='ui-widget-header'>" + TestName + " (Test #"+tempcounter+")<span "+
        "class='rightButton'><button onclick='remP3($(this));deletecounter(testIDs,$(this));'>x</button></span></h3>"+
        "<p><label for='xml_test_id'>ID<span class='red'>*</span>: </label>"+
        "<input class='tinyinput xml_test_id' value='" + tempcounter + "' readonly/>"+
            TestFileReference.getInstance().getTableString() +
            // "<span class='drop_zone drop_zone_text'>Drop Your File(s) Here!</span>" +
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

        FileReference.init(null, null, TestFileReference, testroot);
        // TestFileReference.getInstance().init(testroot, DEBUG_MODE);

        if (!DEBUG_MODE) {
          testroot.find(".xml_test_type").hide();
          testroot.find("label[for='xml_test_type']").hide();
          testroot.find(".xml_pr_always").hide();
          testroot.find("label[for='xml_pr_always']").hide();
          testroot.find(".xml_test_id").hide();
          testroot.find("label[for='xml_test_id']").hide();
        }
        if (!WithFileRef) {
            testroot.find("table").hide();
            testroot.find(".drop_zone").hide();
        }
        else
        {
            // TODO: disable drag & drop!
    /*
            testroot.on({
                drop: function(e){
                    if(e.originalEvent.dataTransfer){
                        if(e.originalEvent.dataTransfer.files.length) {
                            e.preventDefault();
                            e.stopPropagation();
                            //UPLOAD FILES HERE
                            FileReference.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                                TestFileReference.getInstance());
                        }
                    }
                }
            });
    */
        }

    };

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
        $.each(config.testInfos, function(index, item) {
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
        $.each(config.testInfos, function(index, test) {
            $("#" + test.buttonJQueryId).hide();
        });

        // show only test buttons needed for programming language
        found = false;
        $.each(config.proglangInfos, function(index, pl) {
            if (pl.name === progLang) {
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


    // helper function for custom test configuration
    createFileWithContent = function(filename, content) {
        const fileId = setcounter(fileIDs);    // adding a file for the test
        newFile(fileId);                     // filename: setlxsyntaxtest.stlx, content: print()

        let ui_file = FileWrapper.constructFromId(fileId);
        ui_file.filename = filename;
        ui_file.text = content;
        // onFilenameChanged(ui_file);
        return fileId;
    }

    addFileReferenceToTest = function(testId, filename) {
        var xml_test_root = $(".xml_test_id[value='"+testId+"']").parent().parent();
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
    if (gradingHintCounter === 1) {newGH();}            // only one grading hint allowed
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
  config.createFurtherUiElements();

  // create dummy button for saving task.xml
  let anchor = document.createElement("a");
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

/*
  $("#button_save_xml").click(function(){
    console.log("button_save_xml clicked");
    convertToXML();
    downloadTextFile2($("#output"), "task.xml", anchor);
    //downloadTextFile2($("#output"), "task.xml", $("#dummy_save_xml_button")[0]);
  })
*/


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
    function noDragNDropSupport(e) {
        if (e.target.class !== dropzoneClass) {
            e.preventDefault();
            e.dataTransfer.effectAllowed = "none";
            e.dataTransfer.dropEffect = "none";
        }
    }
    window.addEventListener("dragenter", noDragNDropSupport, false);
    window.addEventListener("dragover", noDragNDropSupport);
    window.addEventListener("drop", noDragNDropSupport);

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

    // add file reference for template, library instruction
    FileReference.init("#librarydropzone", '#librarysection', LibraryFileReference);
    FileReference.init("#instructiondropzone", '#instructionsection', InstructionFileReference);
    FileReference.init("#templatedropzone", '#templatesection', TemplateFileReference);


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
