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



var testFileRefSingleton = null;
var modelSolutionFileRefSingleton = null;


class FileReference {

    constructor(classFilename, classFileref, classAddFileref, classRemoveFileref, className) {
        this.classFilename = classFilename;
        this.classFileref = classFileref;
        this.classAddFileref = classAddFileref;
        this.classRemoveFileref = classRemoveFileref;

        this.createTableStrings(className);

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
            "' title='add another filename' onclick='" + className + ".addFileRef($(this))'>+</button><br></td>";
        this.tdFileRemoveButtonInTest = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".remFileRef($(this))'>x</button></td>";

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

    addFileRef(element) {
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


    remFileRef(element) {
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

    // TODO: das läuft so nicht!!!!!!!!!!!!!!!!
    uploadFiles(files, modelSolBox) {
        alert('FileReference.uploadFiles');
        //console.log("uploadModelSolFiles");
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // select new filename in first empty filename
                //console.log("uploadFiles: select " + filename + " in option list");
                var done = false;
                $.each($(modelSolBox).find("." + this.classFilename), function(index, element) {
                    if (done) return false;
                    var currentFilename = $(element).val();
                    if (currentFilename == "") {
                        $(element).val(filename).change();
                        done = true;
                    }
                });

                if (!done) { // no empty select option is found
                    // append filename
                    addFileRef($(modelSolBox).find('.' + this.classAddFileref).last());
                    // select filename
                    $(modelSolBox).find("." + this.classFilename).last().val(filename).change();
                }
            });
        });
    }
}



class TestFileReference extends FileReference {

    constructor() {
        super('xml_test_filename', 'xml_test_fileref',
            'add_file_ref_test', 'rem_file_ref_test', 'TestFileReference');

        if (testFileRefSingleton == null) {
            testFileRefSingleton = this;
        }
    }
    static getTableString() { return testFileRefSingleton.getTableString(); }
    static addFileRef(element) { return testFileRefSingleton.addFileRef(element); }
    static remFileRef(element) { return testFileRefSingleton.remFileRef(element); }
    // TODO: statisch läuft es, aber nicht mit der Instanz in der Basisklasse
    static uploadTestFiles(files, testBox){
        //console.log("uploadTestFiles");

        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // select new filename in first empty filename select option list
                console.log("uploadFiles: select " + filename + " in option list");
                var done = false;
                $.each($(testBox).find(".xml_test_filename"), function(index, element) {
                    if (done) return false;
                    var currentFilename = $(element).val();
                    if (currentFilename == "") {
                        $(element).val(filename).change();
                        done = true;
                    }
                });


                if (!done) { // no empty select option is found
                    // create new filename option list
                    TestFileReference.addFileRef($(testBox).find('.add_file_ref_test').last());
                    // select filename
                    $(testBox).find(".xml_test_filename").last().val(filename).change();
                }

                // set classname if exactly one file is assigned
                var ui_classname = $(testBox).find(".xml_ju_mainclass");
                if (ui_classname.length == 1) {
                    $.each(ui_classname, function(index, element) {
                        var currentFilename = $(element).val();
                        if (currentFilename == "" && !readXmlActive) {
                            $(element).val(java_getFullClassnameFromFilename(filename)).change();
                        }
                    });
                }
            });
        });
    }
}

testFileRefSingleton = new TestFileReference();


class ModelSolutionFileReference extends FileReference {

    constructor() {
        super('xml_model-solution_filename', 'xml_model-solution_fileref',
            'add_file_ref_ms', 'rem_file_ref_ms', 'ModelSolutionFileReference');

        if (modelSolutionFileRefSingleton == null) {
            modelSolutionFileRefSingleton = this;
        }
    }
    static getTableString() { return modelSolutionFileRefSingleton.getTableString(); }
    static addFileRef(element) { return modelSolutionFileRefSingleton.addFileRef(element); }
    static remFileRef(element) { return modelSolutionFileRefSingleton.remFileRef(element); }


    // TODO: statisch läuft es, aber nicht mit der Instanz in der Basisklasse
    static uploadModelSolFiles(files, modelSolBox) {
        //modelSolutionFileRefSingleton.uploadFiles(files, modelSolBox);
        //return;

        //alert('ModelSolutionFileReference.uploadModelSolFiles');
        //console.log("uploadModelSolFiles");
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                // select new filename in first empty filename
                //console.log("uploadFiles: select " + filename + " in option list");
                var done = false;
                $.each($(modelSolBox).find("." + modelSolutionFileRefSingleton.classFilename), function(index, element) {
                    if (done) return false;
                    var currentFilename = $(element).val();
                    if (currentFilename == "") {
                        $(element).val(filename).change();
                        done = true;
                    }
                });

                if (!done) { // no empty select option is found
                    // append filename
                    ModelSolutionFileReference.addFileRef($(modelSolBox).find('.' + modelSolutionFileRefSingleton.classAddFileref).last());
                    // select filename
                    $(modelSolBox).find("." + modelSolutionFileRefSingleton.classFilename).last().val(filename).change();
                }
            });
        });
    }
}

modelSolutionFileRefSingleton = new ModelSolutionFileReference();

