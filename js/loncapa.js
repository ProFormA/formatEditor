/*
 * This is part of the proformaEditor which was created by the eCULT-Team
 * of Ostfalia University
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
 * Dr.Uta Priss (Karin Borm)
 */

var anchorLC = undefined;

function insertLCformelements() {
    const loncapaTextarea = " <div id='exportProblemXML' class=' ui-corner-all'>" +
        "<h3 class='ui-widget-header'>LON-CAPA problem file: " +
        "</h3></div>" +

        "<textarea class='ui-corner-all' id='output2' rows='20' cols='80' readonly></textarea>";
    $('#otherSoftware2').html(loncapaTextarea);

    const inputinfo = "Path to zip-file in LON-CAPA: Can be relative or absolute. If absolute it must be \"/res/fhwf/...\" and not \"/priv/...\" because that is where it will be " +
        "after publication. The filename of the zip-file is not part of the path. When uploading the " +
        "zip-file to LON-CAPA it should be named the task title minus any non-A-z characters.";

    const loncapaZipLocation = "<div class='ui-widget ui-widget-content ui-corner-all'>" +
        "<h3 class='ui-widget-header'>LON-CAPA</h3>" +
        "<p><label for='lczip'>Path to zip-file: </label>" +
        "<input title ='" + inputinfo + "' class='mediuminput' id='lczip' value='zip/'/> " +

        "<button id='button_save_lon_capa' style='float: right;'>Save LON-CAPA problem File</button>" +
        "</p>";

    // create dummy button for saving task.xml
    if (!anchorLC) {
        anchorLC = document.createElement("a");
        anchorLC.style = "display: none";
        anchorLC.id = "dummy_lon_capa_button";
        document.body.appendChild(anchorLC);
    }

    $('#otherSoftware1').html(loncapaZipLocation);

    $("#button_save_lon_capa").click(function () {
        let proglangAndVersion = $("#xml_programming-language").val();
        let proglangSplit = proglangAndVersion.split("/");
        let proglang = proglangSplit[0];
        let LcProblem = undefined;
        if (config.xsdSchemaFile === version101) {
            LcProblem = createLONCAPAOutput(proglang, "101");
        } else {
            LcProblem = createLONCAPAOutput(proglang, "old");
        }
        downloadTextFile("task.problem", LcProblem, anchorLC);
    })

}

// slow!
function _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function createDownloadLink(ui_file) {
    const megabyte = 1024 * 1024;
    let tempbase64 = "";
    // create download
    switch (ui_file.type) {
    case 'embedded':
        // read from editor
        try {
            tempbase64 = window.btoa(ui_file.text); // codemirror[fileid].getValue());
            // tempbase64 = window.btoa(codemirror[$(item).first().parent().find(".xml_file_id").val()].getValue());
        } catch (err) {
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
        tempbase64 = _arrayBufferToBase64(ui_file.content);
        break;
    default:
        alert('unknown file type: ' + ui_file.type);
        break;
    }

    return "<a href='data:text/text;base64," + tempbase64 +
    "' download='" + ui_file.filename + "'>Download: " + ui_file.filename + "</a>\n";
}

function createDownloadLinks() {
    let returnvalue = "";
    let templateCounter = 0;

    if (USE_VISIBLES) {
        VisibleFileReference.getInstance().doOnAll(function (id, displayMode) {
            if (displayMode === T_LMS_USAGE.EDIT && templateCounter === 0) {
                templateCounter++;
                return true;
            }
            let ui_file = FileWrapper.constructFromId(id);
            returnvalue = returnvalue + createDownloadLink(ui_file);
        });
    } else {
        DownloadableFileReference.getInstance().doOnNonEmpty(function(id) {
            let ui_file = FileWrapper.constructFromId(id);
            returnvalue = returnvalue + createDownloadLink(ui_file);
        });
        MultimediaFileReference.getInstance().doOnNonEmpty(function(id) {
            let ui_file = FileWrapper.constructFromId(id);
            returnvalue = returnvalue + createDownloadLink(ui_file);
        });
/*
        TemplateFileReference.getInstance().doOnNonEmpty(function(id) {
            if (templateCounter === 0) {
                templateCounter++;
                return true;
            }
            let ui_file = FileWrapper.constructFromId(id);
            returnvalue = returnvalue + createDownloadLink(ui_file);
        });
*/
    }
    return returnvalue;
}

// returns the first 'embedded file' template
function getEditorTemplate() {
    let returnvalue = '';

    if (USE_VISIBLES) {
        VisibleFileReference.getInstance().doOnAll(function (id, displayMode) {
            if (displayMode === T_LMS_USAGE.EDIT && returnvalue === "") {
                let ui_file = FileWrapper.constructFromId(id);
                returnvalue = ui_file.text;
                return false;
            }
        });
    } else {
        returnvalue = $("#code_template").val();
/*        TemplateFileReference.getInstance().doOnNonEmpty(function(id) {
            if (returnvalue === "") {
                let ui_file = FileWrapper.constructFromId(id);
                returnvalue = ui_file.text;
                return false;
            }
        });*/
    }

    return returnvalue;
}

/**
 * get code of first file in first model solution
 * @returns {string}
 */
function getModelSolution() {
    let returnvalue = "";
    ModelSolutionWrapper.doOnAll(function(ms) {
        FileReferenceList.doOnAll(ms.root, function(id) {
            const ui_file = FileWrapper.constructFromId(id);
            if (ui_file.type !== 'embedded') {
                // file is not embedded
                alert("The Model Solution will not be shown in LON-CAPA because it is stored in zip (not embedded in task).");
                returnvalue = 'A Model Solution is not available.';
            } else {
                returnvalue = ui_file.text;
            }
            return false;

        });
        return false;
    });

/*

    ModelSolutionFileReference.getInstance().doOnAll(function(id) {
        const ui_file = FileWrapper.constructFromId(id);
        if (ui_file.type !== 'embedded') {
            // file is not embedded
            alert("The Model Solution will not be shown in LON-CAPA because it is stored in zip (not embedded in task).");
            returnvalue = 'A Model Solution is not available.';
        } else {
            returnvalue = ui_file.text;
        }
        return false;
    });
*/
    return returnvalue;
}

createLONCAPAproblemFile = function (lc_descr, lc_filename, lc_problemname, lc_mimetype, versionchck) {

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

    if (typeof template === "undefined") {
        template = "";
    }
    if (typeof downloadable === "undefined") {
        downloadable = "";
    }
    //  lc_path = "/res/fhwf/ecult/Java/zip/";
    lc_path = "/res/fhwf/ecult";
    lc_user_path = $("#lczip").val().trim();
    lc_codeMHeader = "/lib/SyntaxHighlighter/CodeMirror_Header.library";
    lc_codeMFooter = "/lib/SyntaxHighlighter/CodeMirror_Footer.library";
    if (lc_mimetype === "java") {
        lc_mimetype = "x-java";
    } else if (lc_mimetype === "python") {
        lc_mimetype = "x-python";
    }
    lc_problemname = lc_problemname.replace(/[^a-z0-9]/gi, ""); // title without special characters

    lc_return = '<problem>\n\n<!-- generated with ProFormA editor version ' + codeversion + ' -->\n\n';
    lc_return += '<import id="11">' + lc_path + '/lib/proforma_v2.library</import>\n';
    lc_return += '<import id="91">' + lc_path + lc_codeMHeader + '</import>\n\n';
    lc_return += '<script type="loncapa/perl">\n';
    lc_return += "$zip_file = zip_path('" + lc_user_path + "') . '" + lc_problemname + ".zip';\n";
    lc_return += '# LON-CAPA partID, redundant taskID, submissiontype, filename of submitted file,';
    lc_return += 'Mime type, zip location\n';
    lc_return += "$externalurl = &proforma_url(0,'0', 'textfield', '" + lc_filename;
    if (versionchck === "101") {
        lc_return += "','" + lc_mimetype + "',$zip_file,'v1.0.1');\n";
    } else {
        lc_return += "','" + lc_mimetype + "',$zip_file);\n";
    }
    lc_return += "$ausgabe = &proforma_output(0,1); # LON-CAPA partID, LON-CAPA responseID \n";
    lc_return += "$modelsolution = '<pre>" + getModelSolution() + "</pre>';\n";
    lc_return += "</" + "script>\n\n";
    lc_return += "<startouttext />\n" + lc_descr + "\n" + downloadable + "<endouttext />\n\n<startouttext />\n";
    lc_return += "$pfad_error\n$error\n$ausgabe\n";
    lc_return += '<div id="codemirror-textfield">\n<endouttext />\n\n';
    lc_return += '<externalresponse answerdisplay="$modelsolution" answer="" url="$externalurl" form="%args" id="1">\n';
    lc_return += '<textfield>\n' + template + '\n</textfield>\n</externalresponse>\n\n';
    lc_return += '<startouttext />\n</div>\n<endouttext />\n';
    lc_return += '<import id="92">' + lc_path + lc_codeMFooter + '</import>\n</problem>\n';

    return lc_return;
};

createLONCAPAOutput = function (prgrlang, versionchck) {
    let loncapa_filename = "input.txt";

    // ??? why do we use first Model Solution filename?
    ModelSolutionWrapper.doOnAll(function(ms) {
        FileReferenceList.doOnAll(ms.root, function(id) {
            const ui_file = FileWrapper.constructFromId(id);
            loncapa_filename = ui_file.filename;
            return false;
        });
        return false;
    });

/*
    ModelSolutionFileReference.getInstance().doOnAll(function(fileid) {
        const ui_file = FileWrapper.constructFromId(fileid);
        loncapa_filename = ui_file.filename;
        return false;
    });
*/
/*
    FileWrapper.doOnAllFiles(function (ui_file) {
        if (ui_file.id === $(".xml_model-solution_fileref")[0].value) {
            loncapa_filename = ui_file.filename;
        }
    });
*/
    return createLONCAPAproblemFile($("#xml_description").val(), loncapa_filename,
        $("#xml_title").val(), prgrlang, versionchck);
};