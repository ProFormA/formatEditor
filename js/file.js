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

    static constructFromId(id) {
        // this._id = id;
        let file = new FileWrapper();
        file._root = $(".xml_file_id[value='" + id + "']").closest(".xml_file");
        return file;
    }

    static constructFromRoot(root) {
        let file = new FileWrapper();
        file._root = root;
        return file;
    }

    static constructFromFilename(filename) {
        let file = new FileWrapper();
        $.each($(".xml_file_filename"), function(index, item) {
            if (filename === item.value ) {
                file._root = $(item).first().parent();
            }
        });
        if (!file._root) {
            console.error('FileWrapper.constructFromFilename cannot find root for ' + filename);
            return undefined;
        }
        return file;
    }

    // getter
    get root() {
        return this._root;
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

    get filename() {
        if (!this._filename) {
            this._filename = this.root.find(".xml_file_filename").first();
        }
        return this._filename.val();
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

    // setter
    set text(newText) {
        if (useCodemirror) {
            codemirror[this.id].setValue(newText);
        } else {
            this._root.find(".xml_file_text").val(newText);
        }
    }

    set filename(name) {
        if (!this._filename) {
            this._filename = this.root.find(".xml_file_filename").first();
        }
        this._filename.val(name);
        this._root.find(".xml_filename_header").first().text(name);
    }

    set type(newType) {
        if (!this._type) {
            this._type = this.root.find(".xml_file_type").first();
        }
        this._type.val(newType);
        this._type.attr('disabled', newType === 'file')
    }

    // other functions
    delete() {
        // const fileroot = $(".xml_file_id[value='" + fileid + "']").closest(".xml_file");
        this.root.remove();
        delete fileIDs[this.id];
        onFilenameChanged(); // update filenames
    }

    static doesFilenameExist(filename) {
        let found = false;
        $.each($(".xml_file_filename"), function(index, item) {
            if (item.value === filename) {
                found = true;
                return false;
            }
        });

        return found;
    }
}