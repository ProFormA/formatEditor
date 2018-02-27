/*
 * This proformaEditor was created by the eCULT-Team of Ostfalia University
 * http://ostfalia.de/cms/de/ecult/
 * The softwareis distributed under a CC BY-SA 3.0 Creative Commons license
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

zip.workerScriptsPath = "./js/";

var unzippedFiles = {};


unzipme = function (blob, location, readyCallback) {
    var unzipped_text = "???";
    unzippedFiles = {};

    function moveFiles() {
        // store files in correct location
    }

    function unzipBlob(blob, callbackForTaskXml, callbackForFile) {
          try {
              zip.createReader(new zip.BlobReader(blob), function (zipReader) {
                  zipReader.getEntries(function (entries) {
                      if (entries.length > 1) {
                          alert('Sorry! Binary files in zip file are not yet supported!');
                      }

                      $.each(entries, function(index, entry) {
                          if (entry.filename = 'task.xml') {
                              console.log('unzip taks.xml');
                              entry.getData(new zip.BlobWriter("text/plain"), function (data) {
                                  callbackForTaskXml(data);
                                  if (index == entries.length -1) {
                                      moveFiles();
                                      zipReader.close();
                                  }

                              });
                          }
                          else {
                              // handle not embedded files'
                              console.log('unzip ' + entry.filename);
                              unzippedFiles[entry.filename] = entry;
                              entry.getData(new zip.BlobWriter(), function (data) {
                                  callbackForFile(data);
                                  if (index == entries.length -1) {
                                      moveFiles();
                                      zipReader.close();
                                  }
                              });
                          }
                      });
                    });
            }, onerror);
          } catch(e) {
              console.log(e);
          }
    }

    unzipBlob(blob,
        // callback for task.xml
        function (unzippedBlob) {
          var readfi = new FileReader();
          readfi.onload = function(e) {
              unzipped_text = e.target.result;
              // callback for task.xml
              if (readyCallback)
                  readyCallback(unzipped_text);
              location.val(unzipped_text);
          }
          readfi.readAsText(unzippedBlob);
        },
        // callback for files
        function (unzippedBlob) {
            var readfi = new FileReader();
            readfi.onload = function (e) {
                // store file
                unzippedFiles[entry.filename].content = e.target.result;
            }
            readfi.readAsArrayBuffer(unzippedBlob);
        }
        );

  return unzipped_text;
};


zipme = function() {
    // get task.xml content from user interface
    var TEXT_CONTENT = $("#output").val();
    if (TEXT_CONTENT.length == 0) {
        console.log("zipme called with empty output");
        return;
    }
    var FILENAME = "task.xml";
    var blob;
    var zipname = $("#xml_meta-data_title").val();
    zipname = zipname.replace(/[^a-z0-9]/gi, "");
    zipname = zipname + '.zip';

    // iterate through all files:
    // - if file type is 'file' the file must be added to zip file
    // - if file is non binary it is stored in the editor!
    $.each($(".xml_file_id"), function(index, item) {
        let fileroot = $(item).closest(".xml_file");
        const fileId = fileroot.find(".xml_file_id").val();
        const embedded = fileroot.find(".xml_file_type").val() == 'embedded';
        if (!embedded) {
            // copy editor content to file storage
            fileStorages[fileId].storeAsFile = true;
            if (!fileStorages[fileId].isBinary) {
                // copy content from editor
                if (useCodemirror) {
                    var text = codemirror[fileId].getValue();
                    fileStorages[fileId].content = text;
                } else {
                    fileStorages[fileId].content = fileroot.find(".xml_file_text").val();
                }
            }
        }
    });

    // bom: aus dem Internet gefunden
    function onerror(message) {
        console.error(message);
        alert(message);
    }

    function zipBlob(blob, callback) {
        zip.createWriter(new zip.BlobWriter("application/zip"), function (zipWriter) {

            // bom: new
            var f = 0;
            function nextFile(f) {
                const fs = fileStorages[f];
                if (f >= fileStorages.length) {
                    // end of recursion => write task.xml
                    zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                        zipWriter.close(callback);
                    });
                } else {
                    if (fs != undefined && fs.storeAsFile) {
                        fblob = new Blob([fs.content], {type: fs.mimetype});
                        zipWriter.add(fs.filename, new zip.BlobReader(fblob), function () {
                            // callback
                            f++;
                            nextFile(f);
                        });
                    } else {
                        f++;
                        nextFile(f);
                    }
                }
            }

            /*zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                zipWriter.close(callback);
            }); */
            nextFile(f);
        }, onerror);
    }
    blob = new Blob([ TEXT_CONTENT ], {
        type : zip.getMimeType(FILENAME)
    });
    zipBlob(blob, function(zippedBlob){
        // console.log(zippedBlob);
        url = window.URL.createObjectURL(zippedBlob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.download = zipname;
        a.href = url;
        // a.dataset.downloadurl = ['application/zip', a.download, a.href].join(':');

/*        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent && !navigator.userAgent.match('CriOS');
*/
        // var userAgent = navigator.userAgent;
        // alert(userAgent);

//	    if (!isSafari) {// navigator.userAgent.indexOf('Safari') <= 0) {
	      a.click();
/*	    } else {
	      alert("zip does not work on this browser");
	    }
*/        // window.URL.revokeObjectURL(url);
        // window.navigator.msSaveBlob(zippedBlob, "task.zip");
    });
};