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
 * @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
 * @author   Karin Borm <k.borm@ostfalia.de>
 */

// todo: replace table solution with something without table!



// abstract class for a filename reference input
class DynamicList {

    constructor(classFilename, classFileref, jsClassName, label, help, mandatory) {
        this.classFilename = classFilename;
        this.classAddItem = classFileref.replace('xml_', 'add_'); // classAddItem;
        this.classRemoveItem = classFileref.replace('xml_', 'remove_'); // classRemoveItem;
        this.help = help;

        this.createTableString(jsClassName, label, mandatory);
    }

    getClassFilename() { return this.classFilename; }

    // virtual
    createRowContent() { return '';}

    createRow(first) {
        // hide first remove file button
        const tdFirstRemoveButton = "<td><button class='" + this.classRemoveItem +
            "' onclick='" + this.className + ".getInstance().removeItem($(this))' style='display: none;'>x</button></td>";

        return "<tr>" +
            "<td>" + (first?this.label:'') + "</td>" + // label

            this.createRowContent() +

            tdFirstRemoveButton + // x-button
            this.tdAddButton +
            '<td></td>'
        "</tr>";
    }

    createTableString(className, label, mandatory) {
        this.className = className;
        if (label.length > 0) {
            label = label + '(s)';
            this.label = "<label for='" + this.classFilename +
                "'>" + label + (mandatory?"<span class='red'>*</span>":"") + ": </label>";
        } else {
            this.label = "<label></label>";
        }


        this.tdAddButton = "<td><button class='" + this.classAddItem +
            "' title='add another filename' onclick='" + className + ".getInstance().addItem($(this))'>+</button><br></td>";

        this.table = "<table class='dynamic_table' cellpadding='0'>" + // cellspacing='0' >" +
            this.createRow(true) +
            "</table>";
    }

    getTableString() {
        return this.table;
    }

    /*
    doOnAll(root, callback) {
        $.each(root.find(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            callback(filerefId);
        });
    }
    */

    addItem(element) {
        // add new line for selecting a file for a test
        let td = element.parent();
        let tr = td.parent();
        let table_body = tr.parent();
        table_body.append(this.createRow(false));
        td.remove(); // remove current +-button
        table_body.find("." + this.classRemoveItem).show(); // show all remove file buttons
    }


    removeItem(element) {
        let td = element.parent();
        let tr = td.parent();
        const buttonText = td.prev().find('button').html();
        if (buttonText === hideEditorText) {
            // remove editor
            tr.next().remove();
        }

        // remove line in file table for test
        let table_body = tr.parent();
        let previousRow = tr.prev("tr");
        if (previousRow.find('td').length === 1) {
            // only one column => editor visible go to previous row
            previousRow = previousRow.prev("tr");
        }
        let hasNextTr = tr.nextAll("tr");
        let hasPrevTr = tr.prevAll("tr");

        tr.remove(); // remove row

        if (hasNextTr.length === 0) {
            // if row to be deleted is last row then add +-button to last row
            //let tds = previousRow.find("td");
            //let td = tds.last();
            $(this.tdAddButton).insertBefore(previousRow.find("td").last());
        }
        if (hasPrevTr.length === 0) {
            // row to be deleted is first row
            // => add filename label to first column
            let firstCell = table_body.find("td").first();
            firstCell.append(this.label); // without td
        }
        switch (table_body.find("tr").length) {
            case 1:
                // table has exactly one row left
                // => hide all remove file buttons
                table_body.find("." + this.classRemoveItem).hide();
                break;
            case 2:
                // check if second row has editor
                let rows = table_body.find("tr");
                let row = rows.last();
                let cols = row.find('td');
                if (cols.length === 1)
                    // => hide all remove file buttons
                    table_body.find("." + this.classRemoveItem).hide();
                break;
        }
    }
}


class SubmissionFileList extends DynamicList {

    constructor() {
        super('xml_subm_filename', 'xml_subm_fileref', 'SubmissionFileList', 'Expected File',
            'files belonging to the submission', false);
    }

    createRowContent() {
        return "<td>Filename:</td>" +
            "<td><input class='restrict_filename " + this.classFilename + "' " +
            " title='" + this.help + "'></input></td>" +

            "<td>Size[B]:</td>" +
            "<td><input class='restrict_size' " +
            " title='in bytes'></input></td>" +

            "<td>optional:</td>" +
            "<td><input type='checkbox' class='optional' title='optional file'></td>";
    }

    static getInstance() {return submissionFileSingleton;}
}
let submissionFileSingleton = new SubmissionFileList();


class SubmissionArchiveFileList extends DynamicList {

    constructor() {
        super('xml_subm_filename', 'xml_subm_fileref', 'SubmissionArchiveFileList', '',
            'files belonging to the submission archive', false);
    }

    createRowContent() {
        return "<td>Path:</td>" +
            "<td><input class='restrict_filename " + this.classFilename + "' " +
            " title='" + this.help + "'></input></td>" +

            "<td>optional:</td>" +
            "<td><input type='checkbox' class='optional' title='optional file'></td>";
    }

    static getInstance() {return archiveFileSingleton;}
}
let archiveFileSingleton = new SubmissionArchiveFileList();