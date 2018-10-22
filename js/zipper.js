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

const debug_unzip = false;
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
unzipme = function (blob, readyCallback) {
    var unzipped_text = "???";
    // dictionary with files (name -> FileStorage)
    let unzippedFiles = {};
    let taskfile_read = false;
    let filesRead = 0;
    let filesToBeRead = undefined;



    /**
     * link files to fileStorages array
     *
     * This must be done after reading all files.
     * Unfortunately file reading is performed asynchrously. So it is not clear
     * in which order the files are read. Because of this the relinkFiles function
     * is called after every processing of a single file in order to guarantee
     * that all files are handled.
     **/
    function relinkFiles() {
        if (!taskfile_read)
            return; // wait and retry later
        if (debug_unzip) console.log("relinkFiles ");

        // store not-embedded files in correct location in fileStorages array
        FileWrapper.doOnAllFiles(function(ui_file) {
            if (debug_unzip) console.log("relink " + ui_file.filename + " type: " + ui_file.type);

            if (ui_file.type === 'file') {
                const fileid = ui_file.id; // fileroot.find(".xml_file_id").val();
                const filename = ui_file.filename; //$(item).val();
                if (unzippedFiles[filename] && !fileStorages[fileid].byZipper) {//!fileStorages[fileid].filename.length) {
                    // note that there is always a fileStorage object whenever there is a ui file object!
                    // file is not yet relinked => link to fileStorage
                    fileStorages[fileid] = unzippedFiles[filename];
                    unzippedFiles[filename] = undefined;
                    if (debug_unzip) console.log("relinkFiles " + filename + " -> " + fileid + " " + ui_file.type + " size: " + ui_file.size);
                    //ui_file.isBinary = true;
                    //ui_file.storeAsFile = true;
                    ui_file.type = ui_file.type;
                    //ui_file.disableTypeChange();
                } else {
                    if (unzippedFiles[filename] && fileStorages[fileid].byZipper) { // fileStorages[fileid].filename.length) {
                        // consistency check
                        console.error("internal error: file is already relinked! filename " + filename + " -> " + fileid + " " + ui_file.type);
                        alert('internal error: file ' + filename + ' is already relinked!');
                    } else {
                        /*if (!unzippedFiles[filename])
                            console.error("unzippedFiles[ " + filename + "] is missing");
                        if (fileStorages[fileid].filename.length)
                            console.error("fileStorages[ " + fileid + "] already mapped");
                        */
                    }
                }
            }
        });
    }

    function onFilesRead(zipReader) {
        relinkFiles();
        zipReader.close();
        const t1 = performance.now();
        console.log("Call to unzipme took " + (t1 - t0) + " milliseconds.")
    }

    function unzipBlob(blob, callbackForTaskXml, callbackForFile) {
          try {
              zip.createReader(new zip.BlobReader(blob), function (zipReader) {
                  zipReader.getEntries(function (entries) {
                      filesToBeRead = entries.length;

                      $.each(entries, function(index, entry) {
                          if (entry.filename === 'task.xml') {
                              console.log('unzip taks.xml');
                              entry.getData(new zip.BlobWriter("text/plain"), function (data) {
                                  if (debug_unzip) console.log('call callback For task.xml');
                                  callbackForTaskXml(data, entry, zipReader);
                              });
                          }
                          else {
                              // handle attached files'
                              console.log('unzip ' + entry.filename);
                              // store file
                              entry.getData(new zip.BlobWriter(), function (data) {
                                  if (debug_unzip) console.log('call callbackForFile ' + entry.filename);
                                  callbackForFile(data, entry, zipReader);
                              });
                          }
                      });
                    });
            }, onerror);
          } catch(e) {
              console.error(e);
          }
    }

    const t0 = performance.now();

    unzipBlob(blob,
        // callback for task.xml
        function (unzippedBlob, entry, zipReader) {
            let readfi = new FileReader();
            readfi.onload = function(e) {
                unzipped_text = e.target.result;
                // callback for task.xml
                // todo: check for racing
                // muss man zum Auswerten der task.xml bereits Daten haben aus den
                // attached files? Falls ja, dann muss hier etwas geändert werden!!
                if (debug_unzip) console.log('call readyCallback');
                if (readyCallback)
                    readyCallback(unzipped_text);

                if (debug_unzip) console.log('set taskfile_read = true');
                taskfile_read = true;
                filesRead++;
                if (debug_unzip) console.log('filesRead value: ' + filesRead + ' filesToBeRead=' + filesToBeRead);
                if (filesRead === filesToBeRead) {
                    onFilesRead(zipReader);
                }

            };
            readfi.readAsText(unzippedBlob);
        },
        // callback for attached files
        function (unzippedBlob, entry, zipReader) {
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

                // console.log(header + " => " + type);

                // store file
                unzippedFiles[entry.filename] =
                    new FileStorage(true, type, e.target.result, entry.filename);
                unzippedFiles[entry.filename].setZipperFlag();
                unzippedFiles[entry.filename].setSize(entry.uncompressedSize);
                filesRead++
                if (debug_unzip) console.log('filesRead value: ' + filesRead + ' filesToBeRead=' + filesToBeRead);
                if (filesRead === filesToBeRead) {
                    onFilesRead(zipReader);
                }

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
    var TEXT_CONTENT = taskXml; // $("#output").val();
    if (!TEXT_CONTENT || TEXT_CONTENT.length == 0) {
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
    FileWrapper.doOnAllFiles(function(ui_file) {
    //$.each($(".xml_file_id"), function(index, item) {
        //const ui_file = FileWrapper.constructFromRoot($(item).closest(".xml_file"));
        // let fileroot = $(item).closest(".xml_file");
        // const fileId = fileroot.find(".xml_file_id").val();
        if (!ui_file.type === 'embedded') {
            // copy editor content to file storage
            ui_file.storeAsFile = true; // fileStorages[ui_file.id].storeAsFile = true;
            if (!ui_file.isBinary) {
                // copy content from editor if file is non binary
                ui_file.content = ui_file.text;
                // fileStorages[ui_file.id].content = ui_file.text;
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
                if (f >= fileStorages.length) {
                    // end of recursion => write task.xml
                    zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                        zipWriter.close(callback);
                    });
                } else {
                    const ui_file = FileWrapper.constructFromId(f);
                    if (ui_file && ui_file.storeAsFile) {
                        fblob = new Blob([ui_file.content], {type: ui_file.mimetype});
                        zipWriter.add(ui_file.filename, new zip.BlobReader(fblob), function () {
                            // callback
                            f++;
                            nextFile(f);
                        });

/*
                    const fs = fileStorages[f];
                    if (fs !== undefined && fs.storeAsFile) {
                        fblob = new Blob([fs.content], {type: fs.mimetype});
                        zipWriter.add(fs.filename, new zip.BlobReader(fblob), function () {
                            // callback
                            f++;
                            nextFile(f);
                        });
                        */
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