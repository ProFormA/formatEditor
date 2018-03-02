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

// dictionary with files (name -> FileStorage)
var unzippedFiles = {};


/**
 * unzips the {task}.zip file
 * - store files temporarily in unzippedFiles
 * - when everything is read then iterate through all fileIds and
 *   move stored files to fileStorages
 *
 * @param blob: zip file object
 * @param location: where to put the 'task.xml'
 * @param readyCallback: callback for 'task.xml' file
 * @returns {string}
 */
unzipme = function (blob, location, readyCallback) {
    var unzipped_text = "???";
    unzippedFiles = {};
    var taskfile_read = false;


    /**
     * link files to fileStorages array
     *
     * This must be done after reading all files.
     * Unfortunately file reading is performed asynchrously. So it is not clear
     * in which order the files are read. Because of this the moveFiles function
     * is called after every processing of a single file in order to guarantee
     * that all files are handled.
     **/
    function moveFiles() {
        if (!taskfile_read)
            return; // wait and retry later

        // store not-embedded files in correct location in fileStorages array
        $.each($(".xml_file_filename"), function(index, item) {
            let fileroot = $(item).closest(".xml_file");
            let filetype = fileroot.find(".xml_file_type").val();
            if (filetype === 'file') {
                let fileid = fileroot.find(".xml_file_id").val();
                let filename = $(item).val();
                if (unzippedFiles[filename] != undefined && fileStorages[fileid] === undefined) {
                    // file is not yet relinked
                    fileStorages[fileid] = unzippedFiles[filename];
                    unzippedFiles[filename] = undefined;
                    console.log("store filename " + filename + " -> " + fileid + " " + filetype);
                    showBinaryFile(fileroot, fileStorages[fileid]);
                } else {
                    if (unzippedFiles[filename] !== undefined && fileStorages[fileid] !== undefined) {
                        // consistency check
                        alert('internal error: file is already relinked!');
                    }
                }
            } else {
                showTextFile(fileroot);
            }
        });
    }

    function unzipBlob(blob, callbackForTaskXml, callbackForFile) {
          try {
              zip.createReader(new zip.BlobReader(blob), function (zipReader) {
                  zipReader.getEntries(function (entries) {

                      $.each(entries, function(index, entry) {
                          if (entry.filename === 'task.xml') {
                              console.log('unzip taks.xml');
                              entry.getData(new zip.BlobWriter("text/plain"), function (data) {
                                  callbackForTaskXml(data, entry);
                                  if (index === entries.length -1) {
                                      zipReader.close();
                                  }

                              });
                          }
                          else {
                              // handle not embedded files'
                              console.log('unzip ' + entry.filename);
                              // store file
                              //unzippedFiles[entry.filename] =
                              //    new FileStorage(true, entry.type, content, entry.filename);
                              entry.getData(new zip.BlobWriter(), function (data) {
                                  callbackForFile(data, entry);
                                  if (index === entries.length -1) {
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
        function (unzippedBlob, entry) {
            let readfi = new FileReader();
            readfi.onload = function(e) {
                unzipped_text = e.target.result;
                // callback for task.xml
                location.val(unzipped_text);
                if (readyCallback)
                    readyCallback(unzipped_text);
                taskfile_read = true;
                moveFiles();
            };
            readfi.readAsText(unzippedBlob);
        },
        // callback for files
        function (unzippedBlob, entry) {
            let readfi = new FileReader();
            readfi.onload = function (e) {
                // read file header and derive mime type
                var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                var header = "";
                for(var i = 0; i < arr.length; i++) {
                    let number = arr[i].toString(16);
                    if (number.length === 1) {
                        number = '0' + number;
                    }

                    header += number;
                }


                let type = unzippedBlob.type; // "unknown"; // Or you can use the blob.type as fallback
                switch (header.toLowerCase()) {
                    case '504b0304': type = 'application/zip'; break;
                    case "25504446": type = 'application/pdf'; break;
                    case "89504e47": type = "image/png"; break;
                    case "47494638": type = "image/gif"; break;
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                        type = "image/jpeg";
                        break;
                }

                console.log(header + " => " + type);

                // store file
                console.log("read binary file " + entry.filename);
                unzippedFiles[entry.filename] =
                    new FileStorage(true, type, e.target.result, entry.filename);
                unzippedFiles[entry.filename].setSize(entry.uncompressedSize);
                moveFiles();
            };
            readfi.readAsArrayBuffer(unzippedBlob);
        }
        );

  return unzipped_text;
};


/**
 * create zip file
 */
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
        const embedded = fileroot.find(".xml_file_type").val() === 'embedded';
        if (!embedded) {
            // copy editor content to file storage
            fileStorages[fileId].storeAsFile = true;
            if (!fileStorages[fileId].isBinary) {
                // copy content from editor if file is non binary
                if (useCodemirror) {
                    fileStorages[fileId].content = codemirror[fileId].getValue();
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
            let f = 0;
            function nextFile(f) {
                const fs = fileStorages[f];
                if (f >= fileStorages.length) {
                    // end of recursion => write task.xml
                    zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                        zipWriter.close(callback);
                    });
                } else {
                    if (fs !== undefined && fs.storeAsFile) {
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
        let a = document.createElement("a");
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