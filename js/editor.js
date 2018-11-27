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
 * Karin Borm, Dr. Uta Priss
 */

// Known bugs: search the code for the string "ToDo" below and check faq.html and installationFAQ.html

// constants

// TAB pages
const tab_page = {
    MAIN:   0,
    MODEL_SOLUTION:  1,
    TESTS:  2,
    FILES:  3,
/*    DEBUG:  4,
    MANUAL: 5,
    FAQ:    6*/
};


//////////////////////////////////////////////////////////////////////////////
//* Global variables


// lock
let readXmlActive = false;



// string constants

const testTypes = getTesttypeOptions();


//////////////////////////////////////////////////////////////////////////////
//* These global variables keep track of how many of these elements currently exist.
var gradingHintCounter;                                // only 1 grading hint is allowed



// Codemirror description editor is made global in order to allow access
// to test environment.
var descriptionEditor;

// string that holds the task.xml content
var taskXml;

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





//////////////////////////////////////////////////////////////////////////////
/* The HTML div-element "error-message" displays error messages if required.
 * all catch(err) statements should use this function (instead of console.log)
 */
function setErrorMessageInvalidOption(xmlpath, attribute, value) {                  // setting the error console
    setErrorMessage("'"+value+"' is not an option for '"+xmlpath + "'/'" + attribute + "'");

}

function setErrorMessage(errormess, exception) {                  // setting the error console
    let error_output = $("#error-message");
    if (errormess) {
        error_output.append("\n* " + errormess);
    }

    if (exception) {
        if (exception instanceof Error) {
            error_output.append("\n  (" + exception.message + ")");
            console.error(exception.stack);
        } else {
            error_output.append("\n* " + exception);
        }
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



function uploadTaskFile(inputbutton) {                     // upload button for textareas: output, output2
    var filenew = inputbutton.files[0];
    switch (filenew.type) {
        case 'application/zip':
        case 'application/x-zip-compressed':
            var text = unzipme(filenew, function (text) {
                taskXml = text;
                readXMLWithLock();
            });
            break;
        case "text/xml":
            if (filenew) {
                var readfi = new FileReader();
                readfi.onload = function (e) {
                    var text = e.target.result;
                    taskXml = text; // $("#output").val(text);
                    readXMLWithLock();
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
function downloadTextFile2(text, filename, dummybutton) {
    if (text.length === 0) {
        console.error("downloadTextFile2 called with empty output");
        return;
    }

    const text1 = encodeURIComponent(text);

    // create dummy button for saving task.xml
    dummybutton.href = "data:text/text;charset=utf-8," + text1;
    dummybutton.download = filename;
    dummybutton.click();
}


function downloadTextFile(filename, text, a) {
    // Edge crashes with normnal data uri but
    // supports blobs in download.
    var blob = new Blob([text], { "type": "text/text;charset=utf8;" });

    document.body.appendChild(a);
    a.style = "display: none";
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
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
        let isBinaryFile =  config.isBinaryFile(file, mimetype);
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

          let ui_file = undefined;
          if (!fileId) {
              ui_file = newFile(); // create file box
          } else {
              ui_file = FileWrapper.constructFromId(fileId); // file box already exists
          }
          // set filename
          ui_file.filename = filename;

          if (size > config.maxSizeForEditor) {
              //console.log('file '+ filename + ' is too large => no editor support');
              //isBinaryFile = true;
          }

          if (isBinaryFile) {
              // binary file
              // at first update fileStorages because
              // it is needed for changing file type
              let fileObject = new FileStorage(isBinaryFile, mimetype, e.target.result, filename);
              fileObject.setSize(size);
              fileStorages[ui_file.id] = fileObject;
              ui_file.type = 'file';
          } else {
              // assume non binary file
              let fileObject = new FileStorage(isBinaryFile, mimetype, 'text is in editor', filename);
              fileStorages[ui_file.id] = fileObject;
              ui_file.text = e.target.result;
              ui_file.type = 'embedded';
          }

          if (callback)
            callback(filename, ui_file.id);
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
        return ui_file;
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
            readAndCreateFileData(file, undefined /*-1*/, function(filename) {
                // nothing extra to be done
            });
        });
    }

///////////////////////////////////////////////////////// Configuration support


    function addTestButtons() {
        $.each(config.testInfos, function(index, item) {
            $("#testbuttons").append("<button id='" + item.buttonJQueryId + "'>New " + item.title + "</button> ");
            $("#" + item.buttonJQueryId).click(function() {

                //var testNo = setcounter(testIDs);    // sets the corresponding fileref, filename and title "SetlX-Syntax-Test"
                let ui_test = TestWrapper.create(null, item.title, item.htmlExtraFields, item.testType, item.withFileRef);
                if (item.onCreated) {
                    item.onCreated(ui_test.id); // testNo);
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


    function createSubmissionXml() {
        let submissionXml = '';
        const xmlns = "urn:proforma:v2.0";

        try {
            let xmlDoc = document.implementation.createDocument(xmlns, "submission", null);
            let submission = xmlDoc.documentElement;

            xmlWriter = new XmlWriter(xmlDoc, xmlns);

            // first approach: everthing is inline
            // xmlWriter.createTextElement(submission, 'task', taskXml);
            convertToXML(xmlDoc, submission); // create task
            //xmlWriter.createTextElement(submission, 'external-submission', 'submission');

            let files = xmlDoc.createElementNS(xmlns, "files");
            submission.appendChild(files);
            // read model solution files
            ModelSolutionWrapper.doOnAll(function(ms) {
                FileReferenceList.doOnAll(ms.root, function(id) {
                    const ui_file = FileWrapper.constructFromId(id);
                    let fileElem = xmlDoc.createElementNS(xmlns, "file");
                    files.appendChild(fileElem);
                    let fileContentElem = xmlDoc.createElementNS(xmlns, "embedded-txt-file");
                    fileContentElem.setAttribute("filename", ui_file.filename);
                    fileContentElem.appendChild(xmlDoc.createCDATASection(ui_file.content));
                    fileElem.appendChild(fileContentElem);
                    return false;
                });
            });

//            if (item.filetype === 'embedded') {


/*            } else {
                xmlWriter.createTextElement(fileElem, 'attached-bin-file', item.filename);
            }
*/


            let resultspec = xmlWriter.createTextElement(submission, 'result-spec', '');
            resultspec.setAttribute("format", 'xml');
            resultspec.setAttribute("structure", 'separate-test-feedback');


            let serializer = new XMLSerializer();
            submissionXml = serializer.serializeToString (xmlDoc);

            if ((submissionXml.substring(0, 5) !== "<?xml")){
                submissionXml = '<?xml version="1.0"?>' + submissionXml;
                // result = "<?xml version='1.0' encoding='UTF-8'?>" + result;
            }

            const xsd_file = 'proforma.xsd';
            // validate output
            $.get(xsd_file, function(data, textStatus, jqXHR) {      // read XSD schema
                const valid = xmllint.validateXML({xml: submissionXml, schema: jqXHR.responseText});
                if (valid.errors !== null) {                                // does not conform to schema
                    setErrorMessage("Errors in XSD-Validation: ");
                    valid.errors.some(function(error, index) {
                        setErrorMessage(error);
                        return index > 15;
                    })

                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                setErrorMessage("XSD-Schema " + xsd_file + " not found.", errorThrown);
            });

        } catch (err){
            setErrorMessage("Error sending to grader", err);
            return '';
        }

        console.log('Submissionxml=\n');
        console.log(submissionXml);
        return submissionXml;
    }




///////////////////////////////////////////////////////// jQuery UI settings
    $("#tabs").tabs();                                   // hide HTML elements when the manual or FAQ are selected
    $('#tabs').click(function(e) {
        var curTab = $('.ui-tabs-active');
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
    });



    // $( "#tabs" ).on( "tabsactivate", function( event, ui ) {alert('tabsactivate');} );

//   $("#filesection").sortable();
    $("#modelsolutionsection").sortable();
    $("#testsection").sortable();

    addTestButtons();
    $("#xml_programming-language").append(getProgLangOptions());

  $("#addGH").click(function() {                       // the code for the buttons for adding new elements
    if (gradingHintCounter === 1) {newGH();}            // only one grading hint allowed
    $("#tabs").tabs("option", "active", tab_page.MAIN); });        // where this will be added
  $("#addFile").click(function() {
    let ui_file = newFile();
    FileWrapper.showEditor(undefined, ui_file);
    $("#tabs").tabs("option", "active", tab_page.FILES); });

  $("#loadFile").click(function() {
      // todo do not create file ibject at once
      $(".xml_load_and_create_file").click();
        //let ui_file = newFile();
        //ui_file.root.find(".xml_upload_file").click();

        //FileWrapper.showEditor(undefined, ui_file);
  });

  $("#addModelsol").click(function() {
      ModelSolutionWrapper.create();
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


    $("#submit_test").click(function() {

        const grader = $("#grader_uri").val();
        const t1 = performance.now();
        // convertToXML();

        // use proxy in order to circumvent the CORS problem
        const newUrl = "https://cors-anywhere.herokuapp.com/" + grader;
        //const newUrl = grader;

        // Create an FormData object
        //var data = new FormData(form);
        //data.append("xml", taskXml);


        let submissionXml = createSubmissionXml();
        const t2 = performance.now();
        console.log("Creating XML took " + (t2 - t1) + " ms.")


        let formData = new FormData();
//        let blob1 = new Blob(['Lorem ipsum'], { type: 'plain/text' });
        let blob1 = new Blob([submissionXml], { type: 'application/xml' });
        formData.append('file', blob1, 'submission.xml');
        let blob2 = new Blob([taskXml], { type: 'application/xml' });
        formData.append('file', blob2, 'task.xml');

        let ans = $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: newUrl,
            data: formData, // taskXml,
            dataType: "html", // convert XML to html in order to show result in textarea
            processData: false, // prevent jQuery form transforming the data into a query string
            contentType: false,
            success : function(data){
                //alert("success " + data);
                $("#submit_response").html(data);
            },
            error : function($xhr, textStatus, errorThrown){
                alert("error " + $xhr.status);
                console.log("ERROR : ", errorThrown);
                console.log("ERROR : ", $xhr);
                console.log("ERROR : ", textStatus);
            },
            ajaxError  : function($xhr, textStatus, errorThrown){
                alert("ajaxError " + $xhr.status);
                console.log("ERROR : ", errorThrown);
                console.log("ERROR : ", $xhr);
                console.log("ERROR : ", textStatus);
            }
        });

        // VERSION 0
/*
        $.ajax({
            type: "POST",
            dataType: 'xml',
            url: grader,
            crossDomain : true,
        })
            .done(function( data ) {
                alert(data);
                console.log("done");
            })
            .fail( function($xhr, textStatus, errorThrown) {
                alert($xhr.responseXml);
                alert(textStatus);
                //alert(errorThrown.message);
            });
*/

        // VERSION 1
/*
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                // Request finished. Do processing here.
                $("#submit_response").html(this.responseText);
            } else {
                let text = this.responseText + ' Status=' + this.status + " statusText=" + this.statusText + " readyState=" +
                    this.readyState;
                alert(text);
                $("#submit_response").html(text);
            }
        };
        try {
            request.open("POST",grader,true);
            //Send the proper header information along with the request
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.send(taskXml);
        }
        catch(err) {
            alert("XMLHttpRequest error");
            setErrorMessage("XMLHttpRequest exception", err);
        }
*/
/*
        fetch(grader, {
            method : "POST",
            body: taskXml // new FormData(taskXml),
            // -- or --
            // body : JSON.stringify({
            // user : document.getElementById('user').value,
            // ...
            // })
        }).then(
            response => alert("Response " + text)
            //response => response.text() // .json(), etc.
            // same as function(response) {return response.text();}
        ).then(
            html => alert("Response 1 " + html)
        );
*/
    });

    // Restriction selection handling
    let restriction_files = $("#files_restriction");
    let restriction_regexp = $("#regexp_restriction");
    let restriction_archive = $("#archive_restriction");

    $("#restriction_selector").change(function() {
        let value = $("#restriction_selector").val();
        switch(value) {
            case 'files':
                restriction_regexp.hide();
                restriction_files.show();
                restriction_archive.hide();
                break;
            case 'file_regexp':
                restriction_regexp.show();
                restriction_files.hide();
                restriction_archive.hide();
                break;
            case 'archive':
                restriction_archive.show();
                restriction_regexp.hide();
                restriction_files.hide();
                break;
            default:
                alert('unsupported value for restriction');
                break;
        }
    });

    // initial selection
    restriction_regexp.show();
    restriction_files.hide();
    restriction_archive.hide();

    if (!SUBMISSION_TEST)
        $("#submission_preview").hide();



    let restriction_arch_files = $("#archive_files_restriction");
    let restriction_arch_regexp = $("#archive_regexp_restriction");

    $("#archive_list_selector").change(function() {
        let value = $("#archive_list_selector").val();
        switch(value) {
            case 'files':
                restriction_arch_files.show();
                restriction_arch_regexp.hide();
                break;
            case 'file_regexp':
                restriction_arch_files.hide();
                restriction_arch_regexp.show();
                break;
            default:
                alert('unsupported value for restriction');
                break;
        }
    });

    restriction_arch_files.show();
    restriction_arch_regexp.hide();


///////////////////////////////////////////////////////// function: readXML

   readXMLWithLock =  function() {
       readXmlActive = true; // lock automatic input field update
       try {
           readAndDisplayXml();
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

  // create further elements needed for LMS
  config.createFurtherUiElements();

  // There must be at least one model solution
    ModelSolutionWrapper.create();
  // show/hide buttons according to programming language
  switchProgLang();

  // register callback
  $("#xml_programming-language").on("change", switchProgLang )
  $("#button_load").click(function(){
    $("#upload_xml_file").click();
  })
/*
    $("#button_new").click(function(){
        $("#upload_xml_file").click();
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
    if (USE_VISIBLES)
        FileReferenceList.init("#visiblefiledropzone", '#visiblesection', VisibleFileReference);


    FileReferenceList.init("#multimediadropzone", '#multimediasection', MultimediaFileReference);
    FileReferenceList.init("#downloaddropzone", '#downloadsection', DownloadableFileReference);
    //FileReferenceList.init("#templatedropzone", '#templatesection', TemplateFileReference);


    /*$("#templatedropzone").hide();
    $("#multimediadropzone").hide();
    $("#downloaddropzone").hide();*/
    if (!USE_VISIBLES)
        $("#visiblefiledropzone").hide();


    $("#files_restriction").append(SubmissionFileList.getInstance().getTableString());
    $("#archive_files_restriction").append(SubmissionArchiveFileList.getInstance().getTableString());

    $("#xml_task_internal_description").append(getInternalDescriptionString(''));


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
