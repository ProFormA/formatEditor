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
 * The version number of this software is in the file js/editor.js.
 */

// string that contains the LON CAPA problem file content
var LcProblem;

function insertLCformelements () {
  var loncapaTextarea = " <div id='exportProblemXML' class=' ui-corner-all'>" +
    "<h3 class='ui-widget-header'>LON-CAPA problem file: " +

//    "<a onclick='convertToXML(); downloadFile(this)' id='downloadLCProblem' class='likebutton'" +
//    " download='task.problem'>Download LON-CAPA problem file</a>" +
      "</h3></div>" +

    "<textarea class='ui-corner-all' id='output2' rows='20' cols='80' readonly></textarea>";
    //"<textarea id='output2' rows='6' cols='80' onfocus='this.rows=12;' onblur='this.rows=6;'></textarea>";
  $('#otherSoftware2').html(loncapaTextarea);

  var inputinfo = "Can be relative or absolute. If absolute it must be \"/res/fhwf/...\" and not \"/priv/...\" because that is where it will be " +
  "after publication. The filename of the zip-file is not part of the path. When uploading the " +
  "zip-file to LON-CAPA it should be named the task title minus any non-A-z characters."; 

  var loncapaZipLocation = "<div class='ui-widget ui-widget-content ui-corner-all'>" +
  "<h3 class='ui-widget-header'>LON-CAPA</h3>" +
  "<label for='lczip'>Path to zip-file in LON-CAPA: </label>" +
  "<input title ='" + inputinfo + "' class='mediuminput' id='lczip' value='zip/'/> " +

      "<button id='button_save_lon_capa' style='float: right;'>Save LON-CAPA problem File</button>" +
          "</p>"
      // +"<a id='dummy_lon_capa_button' style='visibility: hidden'>Dummy Save Lon-capa problem file</a>"
      ;


      //"<a onclick='convertToXML(); downloadFile(this)' id='downloadLCProblem' class='likebutton'" +
      //" download='task.problem'>Download LON-CAPA problem file</a>" +

//      "</div>" +
//      "</div>";


    // create dummy button for saving task.xml
    var anchorLC = document.createElement("a");
    anchorLC.style = "display: none";
    anchorLC.id = "dummy_lon_capa_button";
    document.body.appendChild(anchorLC);

  $('#otherSoftware1').html(loncapaZipLocation);

  $("#button_save_lon_capa").click(function(){
      convertToXML();
      downloadTextFile2(LcProblem /*$("#output2")*/, "task.problem", anchorLC);
  })

}

// slow!
function _arrayBufferToBase64( buffer ) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}


function createDownloadLink(ui_file) {
    const megabyte = 1024*1024;
    let tempbase64 = "";
    // create download
    switch (ui_file.type) {
        case 'embedded':
            // read from editor
            try {
                tempbase64 = window.btoa(ui_file.text); // codemirror[fileid].getValue());
                // tempbase64 = window.btoa(codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue());
            } catch(err) {
                alert("Files which are to be downloaded by students " +
                    "in LON-CAPA cannot contain raw unicode characters, " +
                    "for example, certain encodings of Umlaute and ß. Please change " +
                    "the file " + ui_file.filename + " to 'internal' or remove or change the encoding of such characters.");
            }
            break;
        case 'file':
            if (ui_file.content.byteLength > megabyte)
                alert('File ' + ui_file.filename + ' is larger than 1MB. ' +
                    'It will be added to the LON CAPA problem file but you should think about using a smaller file.');
            tempbase64  =_arrayBufferToBase64(ui_file.content);
            break;
        default:
            alert('unknown file type: ' + ui_file.type);
            break;
    }

    return "<a href='data:text/text;base64,"+ tempbase64 +
        "' download='" + ui_file.filename + "'>Download: " + ui_file.filename +"</a>\n";
}

function createDownloadLinks() {
    let returnvalue = "";
    let templateCounter = 0;

    FileWrapper.doOnAllFiles(function(ui_file) {
        switch (ui_file.class) {
            case "template":
                // let filetype = fileroot.find(".xml_file_type").val();
                switch (ui_file.type) {
                    case 'file':
                        // first template is binary => do not skip
                        returnvalue = returnvalue + createDownloadLink(ui_file);
                        break;
                    case 'embedded':
                        // skip first embedded template
                        if (templateCounter === 0) {
                            templateCounter++;
                        } else {
                            returnvalue = returnvalue + createDownloadLink(ui_file);
                        }
                        break;
                }
                break;
            case "library":
            case "instruction":
                returnvalue = returnvalue + createDownloadLink(ui_file);
                break;
        }
    });
    return returnvalue;
}


// returns the first 'embedded file' template
function getEditorTemplate() {
    let returnvalue = "";
    FileWrapper.doOnAllFiles(function(ui_file) {
        if (ui_file.class === "template" && ui_file.type === 'embedded') {
            if (returnvalue === "") {
                returnvalue = ui_file.text;
                return false;
            }
        }
    });
    return returnvalue;
}

function getModelSolution() {
    let returnvalue = "";
    FileWrapper.doOnAllFiles(function(ui_file) {
        if (ui_file.id === $(".xml_model-solution_fileref").first().val()) {
            if (ui_file.type !== 'embedded') {
                // file is not embedded
                alert("The Model Solution will not be shown in LON-CAPA because it is stored in zip (not embedded in task).");
                returnvalue = 'A Model Solution is not available.';
            } else {
                returnvalue = ui_file.text;
            }
            return false;
        }
    });

  return returnvalue;
}

createLONCAPAproblemFile = function(lc_descr,lc_filename,lc_problemname,lc_mimetype,versionchck) {
  var template = getEditorTemplate();
  var downloadable = createDownloadLinks();
  const lc_zip = $("#lczip").val().trim();
  if (!lc_zip) {
      // empty => set to .
      $("#lczip").val('.');
  } else {
      if (lc_zip !== '.' && lc_zip.slice(-1) !== "/") {
          // add / to path if missing
          $("#lczip").val(lc_zip + "/");
      }
  }

  if (typeof template === "undefined") { template = ""; }
  if (typeof downloadable === "undefined") { downloadable = ""; }
//  lc_path = "/res/fhwf/ecult/Java/zip/";
  lc_path = "/res/fhwf/ecult";
  lc_user_path = $("#lczip").val().trim();
  lc_codeMHeader = "/lib/SyntaxHighlighter/CodeMirror_Header.library";
  lc_codeMFooter = "/lib/SyntaxHighlighter/CodeMirror_Footer.library";
  if (lc_mimetype === "java") {lc_mimetype = "x-java";}
  else if (lc_mimetype === "python") {lc_mimetype = "x-python";}
  lc_problemname = lc_problemname.replace(/[^a-z0-9]/gi, "");      // title without special characters

  lc_return = '<problem>\n\n<!-- generated with ProFormA editor version ' + codeversion + ' -->\n\n';
  lc_return += '<import id="11">' +lc_path+ '/lib/proforma_v2.library</import>\n';
  lc_return += '<import id="91">' +lc_path + lc_codeMHeader+ '</import>\n\n';
  lc_return += '<script type="loncapa/perl">\n';
  lc_return += "$zip_file = zip_path('" + lc_user_path + "') . '" + lc_problemname+ ".zip';\n";
  lc_return += '# LON-CAPA partID, redundant taskID, submissiontype, filename of submitted file,';
  lc_return += 'Mime type, zip location\n';
  lc_return += "$externalurl = &proforma_url(0,'0', 'textfield', '" + lc_filename;
  if(versionchck === "101") {
    lc_return += "','" + lc_mimetype + "',$zip_file,'v1.0.1');\n";
  } else {
    lc_return += "','" + lc_mimetype + "',$zip_file);\n";
  }
  lc_return += "$ausgabe = &proforma_output(0,1); # LON-CAPA partID, LON-CAPA responseID \n";
  lc_return += "$modelsolution = '<pre>" + getModelSolution() + "</pre>';\n";
  lc_return += "</" + "script>\n\n";
  lc_return += "<startouttext />\n" +lc_descr+ "\n" + downloadable + "<endouttext />\n\n<startouttext />\n";
  lc_return += "$pfad_error\n$error\n$ausgabe\n";
  lc_return += '<div id="codemirror-textfield">\n<endouttext />\n\n';
  lc_return += '<externalresponse answerdisplay="$modelsolution" answer="" url="$externalurl" form="%args" id="1">\n';
  lc_return += '<textfield>\n'+template+'\n</textfield>\n</externalresponse>\n\n';
  lc_return += '<startouttext />\n</div>\n<endouttext />\n';
  lc_return += '<import id="92">' +lc_path+lc_codeMFooter+ '</import>\n</problem>\n';
  return lc_return;
};

createLONCAPAOutput = function (prgrlang, versionchck) {
  loncapa_filename = "input.txt";

  FileWrapper.doOnAllFiles(function(ui_file) {
      if (ui_file.id === $(".xml_model-solution_fileref")[0].value) {
          loncapa_filename = ui_file.filename;
      }
  });

  LcProblem =  createLONCAPAproblemFile($("#xml_description").val(),loncapa_filename,
      $("#xml_meta-data_title").val(),prgrlang,versionchck);

  //$("#output2").val(createLONCAPAproblemFile($("#xml_description").val(),loncapa_filename,
	//				     $("#xml_meta-data_title").val(),prgrlang,cmhash,versionchck));
};
