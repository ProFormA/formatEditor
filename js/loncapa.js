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
      downloadTextFile2($("#output2"), "task.problem", anchorLC);
  })

}

// very slow!
function _arrayBufferToBase64( buffer ) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}


function createDownloadLink(fileroot, item) {
    //let fileroot = $(item).closest(".xml_file");
    //let fileclass = fileroot.find(".xml_file_class").val();
    //if (fileclass == "library" || fileclass == "instruction") {

    const megabyte = 1024*1024;
    let tempbase64 = "";
    let filetype = fileroot.find(".xml_file_type").val();
    let fileid = fileroot.find(".xml_file_id").val();
    // create download
    switch (filetype) {
        case 'embedded':
            // read from editor
            try {
                tempbase64 = window.btoa(codemirror[fileid].getValue());
                // tempbase64 = window.btoa(codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue());
            } catch(err) {
                alert("Files which are to be downloaded by students (i.e. 'library'" +
                    " or 'instruction') in LON-CAPA cannot contain raw unicode characters, " +
                    "for example, certain encodings of Umlaute and ß. Please change " +
                    "the file " + item.value + " to 'internal' or remove or change the encoding of such characters.");
            }
            break;
        case 'file':
            // read from filestorage
            if (fileStorages[fileid] === undefined || fileStorages[fileid].content === undefined) {
                alert('internal error: no file stored for id ' + fileid);
                return "";
            }

            if (fileStorages[fileid].content.byteLength > megabyte)
                alert('File ' + fileStorages[fileid].filename + ' is larger than 1MB. ' +
                    'It will be added to the LON CAPA problem file but you should think about using a smaller file.');
            tempbase64  =_arrayBufferToBase64(fileStorages[fileid].content);
            break;
        default:
            alert('unknown file type: ' + filetype);
            break;
    }

    //      if ($(item).first().parent().find(".xml_file_class").val() == "library" ||
    //        $(item).first().parent().find(".xml_file_class").val() == "instruction") {
    return "<a href='data:text/text;base64,"+ tempbase64 +
        "' download='" + item.value + "'>Download: " + item.value +"</a>\n";
}

function createDownloadLinks(/*cmhash*/) {
    let returnvalue = "";
    let templateCounter = 0;
    $.each($(".xml_file_filename"), function(index, item) {
        let fileroot = $(item).closest(".xml_file");
        let fileclass = fileroot.find(".xml_file_class").val();
        switch (fileclass) {
            case "template":
                let filetype = fileroot.find(".xml_file_type").val();
                switch (filetype) {
                    case 'file':
                        // first template is binary => do not skip
                        returnvalue = returnvalue + createDownloadLink(fileroot, item);
                        break;
                    case 'embedded':
                        // skip first embedded template
                        if (templateCounter === 0) {
                            templateCounter++;
                        } else {
                            returnvalue = returnvalue + createDownloadLink(fileroot, item);
                        }
                        break;
                }
                break;
            case "library":
            case "instruction":
                returnvalue = returnvalue + createDownloadLink(fileroot, item);
                break;
        }
    });
    return returnvalue;
}


// returns the first 'embedded file' template
function getEditorTemplate(cmhash) {
    var returnvalue = "";
    $.each($(".xml_file_filename"), function(index, item) {
        let fileroot = $(item).closest(".xml_file");
        let fileclass = fileroot.find(".xml_file_class").val();
        if (fileclass == "template") {
            let filetype = fileroot.find(".xml_file_type").val();
            if (filetype == 'embedded') {
                let fileid = fileroot.find(".xml_file_id").val();
                if (returnvalue === "")
                    returnvalue = codemirror[fileid].getValue();
            }
        }
//     if ($(item).first().parent().find(".xml_file_class").val() == "template") {
//       returnvalue = codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue();
//     }
    });
    return returnvalue;
};

function getModelSolution(cmhash) {
  var returnvalue;
  $.each($(".xml_file_id"), function(index, item) {
	  if (item.value == $(".xml_model-solution_fileref").first().val()) {
          // file is first model solution
          let fileroot = $(item).closest(".xml_file");
          let filetype = fileroot.find(".xml_file_type").val();
          if (filetype == 'embedded') {
              // file is embedded
              returnvalue = codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue();
          } else {
              // file is not embedded
              alert("The Model Solution will not be shown in LON-CAPA because file type 'file' is used for it.");
              returnvalue = 'A Model Solution is not available.';
          }
     }
   });
  return returnvalue;
};

createLONCAPAproblemFile = function(lc_descr,lc_filename,lc_problemname,lc_mimetype,cmhash,versionchck) {
  var template = getEditorTemplate(cmhash);
  var downloadable = createDownloadLinks(cmhash);
  if ($("#lczip").val().slice(-1) != "/") { $("#lczip").val($("#lczip").val()+ "/"); }  // add / to path if missing
  if (typeof template == "undefined") { template = ""; }
  if (typeof downloadable == "undefined") { downloadable = ""; }
//  lc_path = "/res/fhwf/ecult/Java/zip/";
  lc_path = "/res/fhwf/ecult";
  lc_user_path = $("#lczip").val();
  lc_codeMHeader = "/lib/SyntaxHighlighter/CodeMirror_Header.library";
  lc_codeMFooter = "/lib/SyntaxHighlighter/CodeMirror_Footer.library";
  if (lc_mimetype == "java") {lc_mimetype = "x-java";}
  else if (lc_mimetype == "python") {lc_mimetype = "x-python";}
  lc_problemname = lc_problemname.replace(/[^a-z0-9]/gi, "");      // title without special characters

  lc_return = '<problem>\n\n<!-- generated with ProFormA editor version ' + codeversion + ' -->\n\n';
  lc_return += '<import id="11">' +lc_path+ '/lib/proforma_v2.library</import>\n';
  lc_return += '<import id="91">' +lc_path + lc_codeMHeader+ '</import>\n\n';
  lc_return += '<script type="loncapa/perl">\n';
  lc_return += "$zip_file = zip_path('" + lc_user_path + "') . '" + lc_problemname+ ".zip';\n";
  lc_return += '# LON-CAPA partID, redundant taskID, submissiontype, filename of submitted file,';
  lc_return += 'Mime type, zip location\n';
  lc_return += "$externalurl = &proforma_url(0,'0', 'textfield', '" + lc_filename;
  if(versionchck == "101") {
    lc_return += "','" + lc_mimetype + "',$zip_file,'v1.0.1');\n";
  } else {
    lc_return += "','" + lc_mimetype + "',$zip_file);\n";
  }
  lc_return += "$ausgabe = &proforma_output(0,1); # LON-CAPA partID, LON-CAPA responseID \n";
  lc_return += "$modelsolution = '<pre>" + getModelSolution(cmhash) + "</pre>';\n";
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

createLONCAPAOutput = function (prgrlang,cmhash,versionchck) {
  loncapa_filename = "input.txt";
  $.each($(".xml_file_id"),function(idx4,itm4) {
   if (itm4.value == $(".xml_model-solution_fileref")[0].value ) {
     loncapa_filename = $(itm4).parent().find(".xml_file_filename").val();
   }
  });
  $("#output2").val(createLONCAPAproblemFile($("#xml_description").val(),loncapa_filename,
					     $("#xml_meta-data_title").val(),prgrlang,cmhash,versionchck));
};
