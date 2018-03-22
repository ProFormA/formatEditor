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
 *
 * Known bugs: search the code for the string "ToDo" below and check faq.html and installationFAQ.html
 */

// class for simpler access to file members from user interface
class FileWrapper {

    constructFromId(id) {
        // this._id = id;
        this._root = $(".xml_file_id[value='" + id + "']").closest(".xml_file");
    }

    constructFromRoot(root) {
        this._root = root;
    }

    constructFromFilename(filename) {
        $.each($(".xml_file_filename"), function(index, item) {
            if (filename === item.value ) {
                this._root = $(item).first().parent();
            }
        });
        if (!this._root)
            console.error('FileWrapper.constructFromFilename cannot find root for ' + filename);
    }

    get id() {
        if (!this._id) {
            this._id = this.root.find(".xml_file_id").first();
        }
        return this._id.val();
    }

    get text() {
        if (useCodemirror) {
            return codemirror[this.id].getValue();
        } else {
            return this._root.find(".xml_file_text").val();
        }
    }


    get root() {
        return this._root;
    }
    get filename() {
        if (!this._filename) {
            this._filename = this.root.find(".xml_file_filename").first();
        }
        return this._filename.val();
    }

    set filename(name) {
        if (!this._filename) {
            this._filename = this.root.find(".xml_file_filename").first();
        }
        this._filename.val(name);
        filenameHeader(name);
    }

    set filenameHeader(name) {
        this._root.find(".xml_filename_header").first().text(name);
    }

    get class() {
        if (!this._class) {
            this._class = this.root.find(".xml_file_class").first();
        }
        return this._class.val();
    }

    get type() {
        if (!this._type) {
            this._type = this.root.find(".xml_file_type").first();
        }
        return this._type.val();
    }

    set type(newType) {
        if (!this._type) {
            this._type = this.root.find(".xml_file_type").first();
        }
        this._type.val(newType);
        this._type.attr('disabled', newType === 'file')
    }
}