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
 * The version number of this software is in the variable codeversion below.
 *
 * Known bugs: search the code for the string "ToDo" below and check faq.html and installationFAQ.html
 */


//var fileRefSingleton = null;
var testFileRefSingleton = null;

class FileReference {

    constructor(classFilename, classFileref, classAddFileref, classRemoveFileref, className) {
/*        this.classFilename = 'xml_test_filename';
        this.classFileref = 'xml_test_fileref';
        this.classAddFileref = 'add_file_ref_test';
        this.classRemoveFileref = 'rem_file_ref_test';

        this.createTableStrings("FileReference");
        */
        this.classFilename = classFilename;
        this.classFileref = classFileref;
        this.classAddFileref = classAddFileref;
        this.classRemoveFileref = classRemoveFileref;

        this.createTableStrings(className);

/*
        if (fileRefSingleton == null) {
            fileRefSingleton = this;
        }*/
    }

    createTableStrings(className) {
        this.filenameLabelInTest = "<label for='" + this.classFilename +
            "'>Filename<span class='red'>*</span>: </label>";
        this.tdFilenameLabelInTest ="<td>" + this.filenameLabelInTest + "</td>";
        this.tdFilenameInTest = "<td><select class='mediuminput " + this.classFilename + "' " + // onfocus = 'updateFilenameList(this)' "+
            "onchange = 'onFileSelectionChanged(this)'></select></td>"+
            "<td><label for='" + this.classFileref + "'>Fileref: </label>"+ // fileref
            "<input class='tinyinput " + this.classFileref + "' readonly/></td>";
        this.tdFileAddButtonInTest = "<td><button class='" + this.classAddFileref +
            "' title='add another filename' onclick='" + className + ".addTestFileRef($(this))'>+</button><br></td>";
        this.tdFileRemoveButtonInTest = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".remTestFileRef($(this))'>x</button></td>";

        this.table = "<table>" +
            "<tr>" +
            this.tdFilenameLabelInTest + // label
            this.tdFilenameInTest +
            this.tdFileRemoveButtonInTest + // x-button
            this.tdFileAddButtonInTest +
            "</tr>"+
            "</table>";
    }

    getTableString() {
        return this.table;
    }

    addTestFileRef(element) {
        // add new line for selecting a file for a test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            this.tdFilenameInTest +
            this.tdFileRemoveButtonInTest +
            this.tdFileAddButtonInTest +
            "</tr>");
        td.remove(); // remove current +-button
        table_body.find("." + this.classRemoveFileref).show(); // show all remove file buttons

        // add filelist to new file option
        updateFilenameList(table_body.find("." + this.classFilename).last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find("." + this.classFileref).hide();
            table_body.find("label[for='" + this.classFileref + "']").hide();
        }
    }


    remTestFileRef(element) {
        // remove line in file table for test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        var previousRow = tr.prev("tr");
        var hasNextTr = tr.nextAll("tr");
        var hasPrevTr = tr.prevAll("tr");
        tr.remove(); // remove row
        if (hasNextTr.length == 0) {
            // if row to be deleted is last row then add +-button to last row
            previousRow.append(this.tdFileAddButtonInTest);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(this.filenameLabelInTest); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find("." + this.classRemoveFileref).hide();
        }
    }



/*
    static getTableString() {
        return fileRefSingleton.table;
    }

    static addTestFileRef(element) {
        // add new line for selecting a file for a test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            fileRefSingleton.tdFilenameInTest +
            fileRefSingleton.tdFileRemoveButtonInTest +
            fileRefSingleton.tdFileAddButtonInTest +
            "</tr>");
        td.remove(); // remove current +-button
        table_body.find("." + this.classRemoveFileref).show(); // show all remove file buttons

        // add filelist to new file option
        updateFilenameList(table_body.find("." + fileRefSingleton.classFilename).last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find("." + fileRefSingleton.classFileref).hide();
            table_body.find("label[for='" + fileRefSingleton.classFileref + "']").hide();
        }
    }


    static remTestFileRef(element) {
        // remove line in file table for test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        var previousRow = tr.prev("tr");
        var hasNextTr = tr.nextAll("tr");
        var hasPrevTr = tr.prevAll("tr");
        tr.remove(); // remove row
        if (hasNextTr.length == 0) {
            // if row to be deleted is last row then add +-button to last row
            previousRow.append(fileRefSingleton.tdFileAddButtonInTest);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(fileRefSingleton.filenameLabelInTest); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find("." + fileRefSingleton.classRemoveFileref).hide();
        }
    }
    */
}

//fileRefSingleton = new FileReference();

class TestFileReference extends FileReference {

    constructor() {
        super('xml_test_filename', 'xml_test_fileref', 'add_file_ref_test', 'rem_file_ref_test', 'TestFileReference');

        if (testFileRefSingleton == null) {
            testFileRefSingleton = this;
        }
    }
    static getTableString() { return testFileRefSingleton.getTableString(); }
    static addTestFileRef(element) { return testFileRefSingleton.addTestFileRef(element); }
    static remTestFileRef(element) { return testFileRefSingleton.remTestFileRef(element); }
}


testFileRefSingleton = new TestFileReference();