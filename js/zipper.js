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

unzipme = function (blob,location, readyCallback) {
  var unzipped_text = "???";
  function unzipBlob(blob, callback) {
    try{
      zip.createReader(new zip.BlobReader(blob), function (zipReader) {
	  zipReader.getEntries(function (entries) {
	      entries[0].getData(new zip.BlobWriter("text/plain"), function (data) {
		  zipReader.close();
		  callback(data);
		});
	    });
	}, onerror);
    } catch(e) { console.log(e); }
  }

  unzipBlob(blob, function (unzippedBlob) {
      var readfi = new FileReader();
      readfi.onload = function(e) {
        unzipped_text = e.target.result;
        if (readyCallback) readyCallback(unzipped_text);
	    location.val(unzipped_text);
      }
      readfi.readAsText(unzippedBlob);
  });
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
                    // end of recursion
                    zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                        zipWriter.close(callback);
                    });
                } else {
                    if (fs != undefined && fs.isBinary) {
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