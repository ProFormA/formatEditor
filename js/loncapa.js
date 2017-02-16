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

  var inputinfo = "It must be \"/res/fhwf/...\" and not \"/priv/...\" because that is where it will be " +
  "after publication. The filename of the zip-file is not part of the path. When uploading the " +
  "zip-file to LON-CAPA it should be named the task title minus any non-A-z characters."; 

  var loncapaZipLocation = "<div class='ui-widget ui-widget-content ui-corner-all'>" +
  "<h3 class='ui-widget-header'>LON-CAPA</h3>" +
  "<label for='lczip'>Path to zip-file in LON-CAPA: /res/fhwf/ </label>" +
  "<input title ='" + inputinfo + "' class='mediuminput' id='lczip' value='ecult/Java/zip/'/> " +

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


function checkForLibOrInstr(cmhash) {
  var returnvalue = "";
  var tempbase64 = "";
  $.each($(".xml_file_filename"), function(index, item) {
    if ($(item).first().parent().find(".xml_file_class").val() == "library" ||
        $(item).first().parent().find(".xml_file_class").val() == "instruction") {
      try {
        tempbase64 = window.btoa(codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue());
      } catch(err) { alert("Files which are to be downloaded by students (i.e. 'library'" +
                            " or 'instruction') cannot contain raw unicode characters, " +
                            "for example, certain encodings of Umlaute and ß. Please change" +
			    "the file to 'internal' or remove or change the encoding of such characters.");}
       returnvalue = returnvalue + "<a href='data:text/text;base64,"+ tempbase64 +
         "' download='" + item.value + "'>Download: " + item.value +"</a>\n";
    }
  });
  return returnvalue;
};


function checkForTemplate(cmhash) {
  var returnvalue;
  $.each($(".xml_file_filename"), function(index, item) {
     if ($(item).first().parent().find(".xml_file_class").val() == "template") {
       returnvalue = codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue();
     }
   });
  return returnvalue;
};

function getModelSolution(cmhash) {
  var returnvalue;
  $.each($(".xml_file_id"), function(index, item) {
	  if (item.value == $(".xml_model-solution_fileref").first().val()) {
       returnvalue = codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue();
     }
   });
  return returnvalue;
};

createLONCAPAproblemFile = function(lc_descr,lc_filename,lc_problemname,lc_mimetype,cmhash,versionchck) {
  var template = checkForTemplate(cmhash);
  var downloadable = checkForLibOrInstr(cmhash);
  if ($("#lczip").val().slice(-1) != "/") { $("#lczip").val($("#lczip").val()+ "/"); }  // add / to path if missing
  if (typeof template == "undefined") { template = ""; }
  if (typeof downloadable == "undefined") { downloadable = ""; }
//  lc_path = "/res/fhwf/ecult/Java/zip/";
  lc_path = "/res/fhwf/ecult";
  lc_user_path = "/res/fhwf/" + $("#lczip").val();
  lc_codeMHeader = "/lib/SyntaxHighlighter/CodeMirror_Header.library";
  lc_codeMFooter = "/lib/SyntaxHighlighter/CodeMirror_Footer.library";
  if (lc_mimetype == "java") {lc_mimetype = "x-java";}
  else if (lc_mimetype == "python") {lc_mimetype = "x-python";}
  lc_problemname = lc_problemname.replace(/[^a-z0-9]/gi, "");      // title without special characters

  lc_return = '<problem>\n\n';
  lc_return += '<import id="11">' +lc_path+ '/lib/proforma_v2.library</import>\n';
  lc_return += '<import id="91">' +lc_path + lc_codeMHeader+ '</import>\n\n';
  lc_return += '<script type="loncapa/perl">\n';
  lc_return += '# LON-CAPA partID, redundant taskID, submissiontype, filename of submitted file,';
  lc_return += 'Mime type, zip location\n';
  lc_return += "$externalurl = &proforma_url(0,'0', 'textfield', '" + lc_filename;
  if(versionchck == "101") {
    lc_return += "','" + lc_mimetype + "','" + lc_user_path +lc_problemname+ ".zip','v1.0.1');\n";
  } else {
    lc_return += "','" + lc_mimetype + "','" + lc_user_path +lc_problemname+ ".zip');\n";
  }
  lc_return += "$ausgabe = &proforma_output(0,1); # LON-CAPA partID, LON-CAPA responseID \n";
  lc_return += "$modelsolution = '<pre>" + getModelSolution(cmhash) + "</pre>';\n";
  lc_return += "</" + "script>\n";
  lc_return += "<startouttext />\n" +lc_descr+ "\n" + downloadable + "<endouttext />\n\n<startouttext />\n";
  lc_return += "$error\n$ausgabe\n";
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
