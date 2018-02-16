/**
 * Created by karin on 16.02.2018.
 */

const filenameLabelInTest = "<label for='xml_test_filename'>Filename<span class='red'>*</span>: </label>";
const tdFilenameLabelInTest ="<td>" + filenameLabelInTest + "</td>";
const tdFilenameInTest = "<td><select class='mediuminput xml_test_filename' " + // onfocus = 'updateFilenameList(this)' "+
    "onchange = 'onFileSelectionChanged(this)'></select></td>"+
    "<td><label for='xml_test_fileref'>Fileref: </label>"+ // fileref
    "<input class='tinyinput xml_test_fileref' readonly/></td>";
const tdFileAddButtonInTest = "<td><button class='add_file_ref_test' title='add another filename' onclick='addTestFileRef($(this))'>+</button><br></td>";
const tdFileRemoveButtonInTest = "<td><button class='rem_file_ref_test' onclick='remTestFileRef($(this))'>x</button></td>";

var singleton = null;


class FileReference {

    constructor() {
        this.classFilename = 'xml_test_filename';
        this.classFileref = 'xml_test_fileref';
        this.classAddFileref = 'add_file_ref_test';
        this.classRemoveFileref = 'rem_file_ref_test';

        this.filenameLabelInTest = "<label for='" + this.classFilename + "'>Filename<span class='red'>*</span>: </label>";
        this.tdFilenameLabelInTest ="<td>" + filenameLabelInTest + "</td>";
        this.tdFilenameInTest = "<td><select class='mediuminput " + this.classFilename + "' " + // onfocus = 'updateFilenameList(this)' "+
            "onchange = 'onFileSelectionChanged(this)'></select></td>"+
            "<td><label for='" + this.classFileref + "'>Fileref: </label>"+ // fileref
            "<input class='tinyinput " + this.classFileref + "' readonly/></td>";
        this.tdFileAddButtonInTest = "<td><button class='" + this.classAddFileref + "' title='add another filename' onclick='FileReference.addTestFileRef($(this))'>+</button><br></td>";
        this.tdFileRemoveButtonInTest = "<td><button class='" + this.classRemoveFileref + "' onclick='FileReference.remTestFileRef($(this))'>x</button></td>";

        this.table = "<table>" +
            "<tr>" +
            this.tdFilenameLabelInTest + // label
            this.tdFilenameInTest +
            this.tdFileRemoveButtonInTest + // x-button
            this.tdFileAddButtonInTest +
            "</tr>"+
            "</table>";
        if (singleton == null) {
            singleton = this;
        }
    }

    static getTable() {
        return singleton.table;
    }

    static addTestFileRef(element) {
        // add new line for selecting a file for a test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            singleton.tdFilenameInTest +
            singleton.tdFileRemoveButtonInTest +
            singleton.tdFileAddButtonInTest +
            "</tr>");
        td.remove(); // remove current +-button
        table_body.find(".rem_file_ref_test").show(); // show all remove file buttons

        // add filelist to new file option
        updateFilenameList(table_body.find(".xml_test_filename").last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find(".xml_test_fileref").hide();
            table_body.find("label[for='xml_test_fileref']").hide();
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
            previousRow.append(singleton.tdFileAddButtonInTest);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(singleton.filenameLabelInTest); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find(".rem_file_ref_test").hide();
        }
    }
}

//let fileref = new FileReference();
//console.log(fileref.getTable());