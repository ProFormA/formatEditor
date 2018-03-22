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


/*
let testFileRefSingleton = null;
let modelSolutionFileRefSingleton = null;
let templSingleton = null;
let instructionSingleton = null;
let librarySingleton = null;
*/

let filenameClassList = [];
let filerefClassList = [];

// abstract class for a filename reference input
class FileReference {

    constructor(classFilename, classFileref, jsClassName, label, help, mandatory) {
        this.classFilename = classFilename;
        this.classFileref = classFileref;
        this.classAddFileref = classFileref.replace('xml_', 'add_'); // classAddFileref;
        this.classRemoveFileref = classFileref.replace('xml_', 'remove_'); // classRemoveFileref;
        this.help = help;

        this.createTableStrings(jsClassName, label, mandatory);
        this.JsClassname = jsClassName;

        filenameClassList.push('.' + this.classFilename);
        filerefClassList.push('.' + this.classFileref);
    }

    getClassFilename() { return this.classFilename; }

    createTableStrings(className, label, mandatory) {
        label = label + '(s)';
        this.filenameLabel = "<label for='" + this.classFilename +
            "'>" + label + (mandatory?"<span class='red'>*</span>":"") + ": </label>";
        this.tdFilenameLabel ="<td>" + this.filenameLabel + "</td>";
        this.tdFilename = "<td><select class='mediuminput fileref_filename " + this.classFilename + "' " +
            "onchange = 'FileReference.onFileSelectionChanged(this)' title='" + this.help + "'></select></td>"+
            "<td><label for='" + this.classFileref + "'>Fileref: </label>"+ // fileref
            "<input class='tinyinput fileref_fileref " + this.classFileref + "' readonly/></td>";
        this.tdAddButton = "<td><button class='" + this.classAddFileref +
            "' title='add another filename' onclick='" + className + ".getInstance().addFileRef($(this))'>+</button><br></td>";
        this.tdRemoveButton = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".getInstance().removeFileRef($(this))'>x</button></td>";
        // hide first remove file button
        const tdFirstRemoveButton = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".getInstance().removeFileRef($(this))' style='display: none;'>x</button></td>";

        this.table = "<table>" +
            "<tr>" +
            this.tdFilenameLabel + // label
            this.tdFilename +
            tdFirstRemoveButton + // x-button
            this.tdAddButton +
            "</tr>"+
            "</table>" +
            "<span class='drop_zone_text drop_zone'>Drop Your File(s) Here!</span>";
    }

    getTableString() {
        return this.table;
    }

    // init table
    init(root, DEBUG_MODE) {
        updateFilenameList(root.find("." + this.classFilename).last());
        if (!DEBUG_MODE) {
            root.find("." + this.classFileref).hide();
            root.find("label[for='" + this.classFileref + "']").hide();
        }

        // register dragenter, dragover.
        root.on({
            dragover: function(e) {
                e.preventDefault();
                e.stopPropagation();
                //e.dataTransfer.dropEffect = 'copy';
            },
            dragenter: function(e) {
                e.preventDefault();
                e.stopPropagation();
            },
/*
            drop: function(e){
                if(e.originalEvent.dataTransfer){
                    if(e.originalEvent.dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        //UPLOAD FILES HERE
                        this.JsClassname.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
                    }
                }
            } */
        });
    }

    // for creation by reading xml
    setFilenameOnCreation(box, index, filename) { // index is 0-based
        // set filename
        if (index > 0) {
            // create new fileref if index > 0
            this.addFileRef(box.find("." + this.classAddFileref).first());
        }
        let element = box.find("." + this.classFilename);
        updateFilenameList(element.eq(index));
        element.eq(index).val(filename).change();
    }


    addFileRef(element) {
        // add new line for selecting a file for a test
        let td = element.parent();
        let tr = td.parent();
        let table_body = tr.parent();
        table_body.append(
            "<tr><td></td>" + // label
            this.tdFilename +
            this.tdRemoveButton +
            this.tdAddButton +
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


    removeFileRef(element) {
        let td = element.parent();
        let tr = td.parent();
        // get associated fileid
        const fileid = tr.find('.fileref_fileref')[0].value;

        // TODO:
        // if fileclass == library => internal???

        // remove line in file table for test
        let table_body = tr.parent();
        let previousRow = tr.prev("tr");
        let hasNextTr = tr.nextAll("tr");
        let hasPrevTr = tr.prevAll("tr");
        tr.remove(); // remove row
        if (hasNextTr.length === 0) {
            // if row to be deleted is last row then add +-button to last row
            previousRow.append(this.tdAddButton);
        }
        if (hasPrevTr.length === 0) {
            // row to be deleted is first row
            // => add filename label to first column
            let firstCell = table_body.find("td").first();
            firstCell.append(this.filenameLabel); // without td
        }
        if (table_body.find("tr").length === 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find("." + this.classRemoveFileref).hide();
        }

        if (fileid) {
            FileReference.deleteFile(fileid);
        }
    }

    static deleteFile(fileid) {
        // check how many references exist
        const references = $(".fileref_fileref");
        let exit = false;
        $.each(references, function(index, item) {
            if (item.value === fileid) {
                // fileid found => do not delete
                exit = true;
            }
        });
        if (exit)
            return;

        // delete file
        let ui_file = FileWrapper.constructFromId(fileid);
        ui_file.delete();

        /*const fileroot = $(".xml_file_id[value='" + fileid + "']").closest(".xml_file");
        fileroot.remove();
        delete fileIDs[fileid];*/

        // onFilenameChanged(); // update filenames
    }

    // checks if a given file id is used somewhere
    // (needed when file shall be deleted)
    static isFileIdReferenced(fileId) {
        let found = false;
        $.each($(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            if (filerefId === fileId)
                found = true;
        });

        return found;
    }

    onFileUpload(filename, uploadBox) {
        // select new filename in first empty filename
        //console.log("uploadFiles: select " + filename + " in option list");
        var done = false;
        $.each($(uploadBox).find("." + this.classFilename), function(index, element) {
            if (done) return false;
            const currentFilename = $(element).val();
            if (currentFilename === "") {
                $(element).val(filename).change();
                done = true;
            }
        });

        if (!done) { // no empty select option is found
            // append filename
            this.addFileRef($(uploadBox).find('.' + this.classAddFileref).last());
            // select filename
            $(uploadBox).find("." + this.classFilename).last().val(filename).change();
        }
    }

    // TODO: split for different handling in classes
    static onFileSelectionChanged (tempSelElem) {              // changing a filename in the drop-down

        // whenever a file is selected that causes a file class change,
        // it must be checked whether a reference needs to be removed
        // (e.g. from template to library)
        function handleClassChange(fileclassobject, fileid, newClass) {
            const oldclass = fileclassobject.val();
            if (oldclass === newClass)
                return; // ??? TODO: do not add 2nd reference!
            // set new class
            fileclassobject.val(newClass);
            if (oldclass ===  'internal' || oldclass === 'internal-library') {
                return;
            }

            alert("file class will be no longer '" + oldclass + "'");

            // iterate through all filerefence objects to find the 'old' one
            let found = false;
            $.each($(".fileref_fileref"), function(index, item) {
                if (!found && item.value === fileid) {
                    // file id matches
                    const filenameobject = $(item).closest('tr').find('.fileref_filename');
                    switch (oldclass) {
                        case 'template':
                            found = filenameobject.hasClass('xml_template_filename');
                            break;
                        case 'library':
                            found = filenameobject.hasClass('xml_library_filename');
                            break;
                        case 'instruction':
                            found = filenameobject.hasClass('xml_instruction_filename');
                            break;
                        default:
                            alert('tbd 1');
                            break;
                    }

                    if (found) {
                        // remove old fileref object
                        filenameobject.val(emptyFileOption).change();
                        item.value = '';
                    }
                }
            });

        }

        var found = false;
        var selectedFilename = $(tempSelElem).val();
        // get old file id
        const nextTd = $(tempSelElem).parent().next('td');
        const oldFileId = nextTd.find('.fileref_fileref')[0].value;


        switch (selectedFilename) {
            case loadFileOption:
                // read new file
                // reset selection in case choosing a file fails
                $(tempSelElem).val(emptyFileOption); // do not call change!
                // change callback
                var dummybutton = $("#dummy_file_upload_button").first();
                dummybutton.unbind("change");
                dummybutton.change(function () {
                    var inputbutton = $("#dummy_file_upload_button")[0];
                    var filenew = inputbutton.files[0];
                    if (!filenew) {
                        console.log("no file selected -> cancel");
                        return;
                    }
                    readAndCreateFileData(filenew, -1,
                        function (newFilename, fileId) {
                            if ($(tempSelElem)) {
                                $(tempSelElem).val(newFilename).change();
                            }
                            // set classname if file belongs to JUNIT
                            //setJavaClassname(newFilename);
                            //setJUnitDefaultTitle(newFilename);
                        });
                });
                // perform dummy click
                dummybutton.click();
                return;
            case emptyFileOption:
                // delete fileref id
                alert('empty file option'); // is never called - why???
                // fall through
            default:
                // find file id belonging to the filename
                let fileid = "";
                let fileclassobject;
                $.each($(".xml_file_filename"), function(index, item) {
                    if (selectedFilename === item.value ) {
                        const fileroot = $(item).first().parent();
                        fileid = fileroot.find(".xml_file_id").val();
                        fileclassobject = fileroot.find(".xml_file_class");
                    }
                });
                // set new file id
                nextTd.find('.fileref_fileref')[0].value = fileid;
                if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
                    // call test specific configured handler
                    if (fileid) {
                        // setJavaClassname(selectedFilename);
                        // setJUnitDefaultTitle(selectedFilename);
                        config.handleFilenameChangeInTest(selectedFilename, tempSelElem);
                    }
                } else if ($(tempSelElem).hasClass('xml_template_filename')) {
                    handleClassChange(fileclassobject, fileid, 'template');
                } else if ($(tempSelElem).hasClass('xml_instruction_filename')) {
                    handleClassChange(fileclassobject, fileid, 'instruction');
                } else if ($(tempSelElem).hasClass('xml_library_filename')) {
                    handleClassChange(fileclassobject, fileid, 'library');
                } else {
                    // model solution, nothing to be done
                }

        }

        if (oldFileId !== '') {
            // delete old file
            FileReference.deleteFile(oldFileId);
        }
    };

    // update all filename lists
    static updateAllFilenameLists() {
//        $.each($(".xml_test_filename, .xml_model-solution_filename, .xml_template_filename, .xml_instruction_filename"),
        $.each($(filenameClassList.join(',')),
            function(index, item) {
                //console.log("update filelist in test ");
                // store name of currently selected file
                var text = $("option:selected", item).text(); // selected text
                //console.log("selected is " + text);
                updateFilenameList(item); // update filename list in tests and model solutions

                if (text.length > 0) {
                    // check if previously selected filename is still in list
                    // (ich weiß im Moment nicht, wie man die Einträge aus
                    // der Liste rauszieht...TODO)
                    // TODO einfacher: einfach setzen und schauen, ob leer???
                    var indexFound = -1;
                    $.each($(".xml_file_filename"), function (indexOpt, item) {
                        if (item.value.length > 0 && item.value === text) {
                            indexFound = indexOpt;
                        }
                    });

                    if (indexFound >= 0) {
                        //console.log("selektiere " + indexFound);
                        item.selectedIndex = indexFound + 1; // +1:weil am Anfang noch ein Leerstring ist
                    } else {
                        // filename not found => remove file id
                        console.log("filename ref not found");
                        $(item).closest(".xml_test,.xml_model-solution, #templatedropzone, #instructiondropzone, #librarydropzone").
                            find($(filerefClassList.join(','))).first().val("");
                        // $(item).closest(".xml_test,.xml_model-solution, #templatedropzone").
                        // find($(".xml_test_fileref, .xml_model-solution_fileref, .xml_template_fileref, .xml_template_fileref")).first().val("");
                    }
                }
        });
    }

    static uploadFiles(files, box, instance) {
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                instance.onFileUpload(filename, box);
            });
        });
    }

    static init(dropzoneSelector, sectionSelector, classname, dropZoneObject) {
        let root = dropZoneObject;
        if (dropzoneSelector)
            root = $(dropzoneSelector); // find approach that fits all classes

        if (sectionSelector) {
            $(sectionSelector)[0].textContent = "";
            $(sectionSelector).append(classname.getInstance().getTableString());
        }

        classname.getInstance().init(root, DEBUG_MODE);
        root.on({
            drop: function(e){
                if(e.originalEvent.dataTransfer){
                    if(e.originalEvent.dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        //UPLOAD FILES HERE
                        FileReference.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                            classname.getInstance());
                    }
                }
            }
        });
    }
}





class TestFileReference extends FileReference {

    constructor() {
        super('xml_test_filename', 'xml_test_fileref', 'TestFileReference', 'Testscript',
            'file containing test cases or test specification', true);
    }

    static getInstance() {return testFileRefSingleton;}
    static getClassRoot() { return "xml_test"; }

    onFileUpload(filename, uploadBox) {
        super.onFileUpload(filename, uploadBox);
        // set classname if exactly one file is assigned
        const ui_classname = $(uploadBox).find(".xml_ju_mainclass");
        if (ui_classname.length === 1) {
            $.each(ui_classname, function(index, element) {
                const currentFilename = $(element).val();
                if (currentFilename === "" && !readXmlActive) {
                    $(element).val(javaParser.getFullClassnameFromFilename(filename)).change();
                }
            });
        }
    }
}
let testFileRefSingleton = new TestFileReference();


class ModelSolutionFileReference extends FileReference {

    constructor() {
        super('xml_model-solution_filename', 'xml_model-solution_fileref',
            'ModelSolutionFileReference', 'Filename',
            'file belonging to a model solution', true);
    }
    static getInstance() {return modelSolutionFileRefSingleton;}
    static getClassRoot() { return "xml_model-solution"; }
}
let modelSolutionFileRefSingleton = new ModelSolutionFileReference();



class InstructionFileReference extends FileReference {

    constructor() {
        super('xml_instruction_filename', 'xml_instruction_fileref',
            'InstructionFileReference', 'Documentation Attachment',
            'e.g. pdf with further informations, images (file NOT available for grader/tests)', false);
    }
    static getInstance() {return instructionSingleton;}
}
let instructionSingleton = new InstructionFileReference();


class TemplateFileReference extends FileReference {
    constructor() {
        super('xml_template_filename', 'xml_template_fileref',
            'TemplateFileReference', 'Template',
            'code snippet that the student should use as a starting point for coding', false);
    }
    static getInstance() {return templSingleton;}
}
let templSingleton = new TemplateFileReference();

class LibraryFileReference extends FileReference {
    constructor() {
        super('xml_library_filename', 'xml_library_fileref',
            'LibraryFileReference', 'Code Attachment',
            'e.g. library, interface (file is also available for grader/tests)', false);
    }
    static getInstance() {return librarySingleton;}
}
let librarySingleton = new LibraryFileReference();