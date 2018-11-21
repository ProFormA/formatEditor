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

const loadFileOption = "<open...>";
const emptyFileOption = " "; // must not be empty!!

const showEditorText = 'View';
const hideEditorText = 'Hide';

let filenameClassList = [];
let filerefClassList = [];

// abstract class for a filename reference input
class FileReferenceList extends DynamicList {

    constructor(classFilename, classFileref, jsClassName, label, help, mandatory) {
        super(classFilename, classFileref, jsClassName, label, help, mandatory, 'xml_fileref_table');

        this.table = this.table +
            "<span class='drop_zone_text drop_zone'>Drop Your File(s) Here!</span>";

        filenameClassList.push('.' + this.classFilename);
        filerefClassList.push('.' + classFileref);
    }

    createExtraContent() { return ''; }

    createRowContent() {
        const tdFilename = "<td><select class='mediuminput fileref_filename " + this.classFilename + "' " +
            "onchange = 'FileReferenceList.onFileSelectionChanged(this)' title='" + this.help + "'></select></td>"+
            "<td><label for='fileref_fileref'>Fileref: </label>"+ // fileref
            "<input class='tinyinput fileref_fileref' readonly/></td>";



        const tdExpandButton = "<td><button class='collapse' title='show content' onclick='" +
            this.className + ".getInstance().toggleEditor($(this))'>"+showEditorText+"</button><br></td>";

        return tdFilename + tdExpandButton + this.createExtraContent();
    }


/*
    createTableString(className, label, mandatory) {
        this.className = className;
        label = label + '(s)';
        this.filenameLabel = "<label for='" + this.classFilename +
            "'>" + label + (mandatory?"<span class='red'>*</span>":"") + ": </label>";

        this.tdFilename = "<td><select class='mediuminput fileref_filename " + this.classFilename + "' " +
            "onchange = 'FileReferenceList.onFileSelectionChanged(this)' title='" + this.help + "'></select></td>"+
            "<td><label for='" + this.classFileref + "'>Fileref: </label>"+ // fileref
            "<input class='tinyinput fileref_fileref " + this.classFileref + "' readonly/></td>";
        this.tdAddButton = "<td><button class='" + this.classAddFileref +
            "' title='add another filename' onclick='" + className + ".getInstance().addFileRef($(this))'>+</button><br></td>";

        //this.tdRemoveButton = "<td><button class='" + this.classRemoveFileref +
        //    "' onclick='" + className + ".getInstance().removeFileRef($(this))'>x</button></td>";

        this.table = "<table class='xml_fileref_table' cellpadding='0'>" + // cellspacing='0' >" +
            this.createRow(true) +
            "</table>" +
            "<span class='drop_zone_text drop_zone'>Drop Your File(s) Here!</span>";
    }
*/
    doOnAll(callback, root) {
        if (root)
            console.log('doOnAll ios deprecated, use static version instead');
        let theRoot = root?root:this.root;
        $.each(theRoot.find(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            return callback(filerefId);
        });
    }

    static doOnAll(root, callback) {
        $.each(root.find(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            return callback(filerefId);
        });
    }

    // init table
    init(root, DEBUG_MODE) {
        if (!this.root)
            this.root = root;
        FileReferenceList.updateFilenameList(root.find("." + this.classFilename).last());
        FileReferenceList.rowEnableEditorButton(root, false);
        if (!DEBUG_MODE) {
            root.find(".fileref_fileref").hide();
            root.find("label[for='fileref_fileref']").hide();
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
            this.addItem(box.find("." + this.classAddItem).first());
        }
        let element = box.find("." + this.classFilename);
        FileReferenceList.updateFilenameList(element.eq(index));
        element.eq(index).val(filename).change();
    }

    getCountFilerefs(root) {
        let counter = 0;
        this.doOnAll(function () {
            counter++;
        }, root);
        return counter;
    }

    getNumberOfExtraColumns() { return 0;}

    toggleEditor(element, hide) {
        let td = element.parent();
        let tr = td.parent();
        const fileid = tr.find('.fileref_fileref')[0].value;
        let ui_file = FileWrapper.constructFromId(fileid);

        if (element.html() === hideEditorText) {
            element.html(showEditorText);
            tr.next().remove();
        }
        else {
            const numberOfColumns = 7 + this.getNumberOfExtraColumns();
            if (ui_file && !ui_file.isBinary) {
                element.html(hideEditorText);
                $( "<tr><td colspan='"+ numberOfColumns + "'><textarea disabled cols='80' rows='10' class='fileref_viewer'>"+
                    ui_file.text
                    +"</textarea></td></tr>" ).insertAfter(tr);
            }
        }
    }

    static rowGetFileId(row) {
        return row.find('.fileref_fileref')[0].value;
    }

    static rowEnableEditorButton(row, enabled) {
        if (enabled) {
            // check if file is binary and cannot be viewed
            const fileid = FileReferenceList.rowGetFileId(row);
            if (!fileid)
                return;
            let ui_file = FileWrapper.constructFromId(fileid);
            if (ui_file.isBinary)
                enabled = false;
            //console.log('enable view button in fileref for ' + ui_file.filename + ', enabled = ' + enabled);
        }

        row.find(".collapse").last().prop('disabled', !enabled);
    }

    addItem(element) {
        let td = element.parent();
        let tr = td.parent();
        let table_body = tr.parent();

        let newRow = super.addItem(element);
        FileReferenceList.rowEnableEditorButton(newRow, false);
/*
        // add new line for selecting a file for a test
        let td = element.parent();
        let tr = td.parent();
        let table_body = tr.parent();
        table_body.append(this.createRow(false));
        td.remove(); // remove current +-button
        table_body.find("." + this.classRemoveFileref).show(); // show all remove file buttons
*/
        // add filelist to new file option
        FileReferenceList.updateFilenameList(table_body.find("." + this.classFilename).last());

        if (!DEBUG_MODE) {
            // hide new fileref fields
            table_body.find(".fileref_fileref").hide();
            table_body.find("label[for='fileref_fileref']").hide();
        }
    }


    // override
    getItemCount(table_body) {
        let count = 0;
        $.each(table_body.find("tr"), function(index, item) {
            if ($(item).find("td").length > 2)
                count++;
        });
        return count;
    }

    // override
    getPreviousItem(tr) {
        let previousRow = tr.prev("tr");

        if (previousRow.find('td').length === 1) {
            // only one column => editor visible go to previous row
            previousRow = previousRow.prev("tr");
        }
        return previousRow;
    }

    removeItem(element) {
        let td = element.parent();
        let tr = td.parent();

        // save associated fileid
        const fileid = FileReferenceList.rowGetFileId(tr); // tr.find('.fileref_fileref')[0].value;

        // remove editor
        const buttonText = td.prev().find('button').html();
        if (buttonText === hideEditorText) {
            // remove editor
            tr.next().remove();
        }

        super.removeItem(element);



/*
        // TODO:
        // if fileclass == library => internal???

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
            firstCell.append(this.filenameLabel); // without td
        }
        switch (table_body.find("tr").length) {
            case 1:
                // table has exactly one row left
                // => hide all remove file buttons
                table_body.find("." + this.classRemoveFileref).hide();
                break;
            case 2:
                // check if second row has editor
                let rows = table_body.find("tr");
                let row = rows.last();
                let cols = row.find('td');
                if (cols.length === 1)
                    // => hide all remove file buttons
                    table_body.find("." + this.classRemoveFileref).hide();
                break;
        }
*/
        if (fileid) {
            FileReferenceList.deleteFile(fileid);
        }
    }

    // TODO move to file??
    static deleteFile(fileid) {
        // check if there any references
        let ui_file = FileWrapper.constructFromId(fileid);
        // check if there is still a special kind of reference (template, library or instruction)
        if (!FileReferenceList.getCountSpecialReferences(fileid)) {
            switch(FileReferenceList.getCountFileIdReferenced(fileid)) {
                case 0:
                    // no reference at all => delete file
                    ui_file.delete();
                    break;
                case 1:
                    // change to internal
                    ui_file.class = INTERNAL;
                    break;
                default:
                    // change to internal-library
                    ui_file.class = INTERNAL_LIB;
                    break;
            }
        }
    }

    // checks if a given file id is used somewhere
    // (needed when file shall be deleted)
    static getCountFileIdReferenced(fileId) {
        let count = 0;
        $.each($(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            if (filerefId === fileId) {
                count++;
            }
        });

        return count;
    }



    static getCountSpecialReferences(fileId) {
        let count = 0;

        //librarySingleton.doOnAll(function(id) { if (id === fileId) count++; });
        templSingleton.doOnAll(function(id) { if (id === fileId) count++; });
        downloadableSingleton.doOnAll(function(id) { if (id === fileId) count++; });

/*
        $.each($(".xml_multmedia_fileref, .xml_template_fileref, .xml_instruction_fileref"),
            function(index, item) {
                const filerefId = item.value;
                if (filerefId === fileId) {
                    count++;
                }
        });
*/

        return count;
    }


    onFileUpload(filename, uploadBox) {
        // select new filename in first empty filename
        //console.log("uploadFiles: select " + filename + " in option list");
        let done = false;
        $.each($(uploadBox).find("." + this.classFilename), function(index, element) {
            if (done)
                return false;
            const currentFilename = $(element).val();
            if (currentFilename === "") {
                $(element).val(filename).change();
                // FileReferenceList.rowEnableEditorButton($(element).parent(), true);
                done = true;
            }
        });

        if (!done) { // no empty select option is found
            // append filename
            let newRow = this.addItem($(uploadBox).find('.' + this.classAddItem).last());
            // select filename
            $(uploadBox).find("." + this.classFilename).last().val(filename).change();
            // FileReferenceList.rowEnableEditorButton(newRow, true);
        }
    }

    static onFileSelectionChanged (tempSelElem) {              // changing a filename in the drop-down

        function isDuplicateId(fileid) {
            const filerefs = $(tempSelElem).closest('table').find(".fileref_fileref");
            let found = false;
            $.each(filerefs, function(index, item) {
                if (item.value === fileid) {
                    // fileref already in list!
                    alert('file is already in this list!');
                    found = true;
                    return false;
                }
            });
            return found;
        }

        // whenever a file is selected that causes a file class change,
        // it must be checked whether a reference needs to be removed
        // (e.g. from template to library)
        function handleClassChange(ui_file, fileid, newClass) {
            if (ui_file.class === newClass)
                return;
            const oldclass = ui_file.class;
            ui_file.class = newClass;
            if (!oldclass || oldclass === INTERNAL || oldclass === INTERNAL_LIB) {
                return;
            }

            alert("file class for file '" + ui_file.filename + "' will be no longer '" + oldclass + "'");

            // iterate through all file reference objects to find the 'old' one
            let found = false;
            $.each($(".fileref_fileref"), function(index, item) {
                if (!found && item.value === fileid) {
                    // file id matches
                    const filenameobject = $(item).closest('tr').find('.fileref_filename');
                    switch (oldclass) {
                        case 'template':
                            found = filenameobject.hasClass('xml_template_filename');
                            break;
/*                        case 'library':
                            found = filenameobject.hasClass('xml_multimedia_filename');
                            break;*/
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
                        // FileReferenceList.updateAllFilenameLists();
                        // remove actual numeric fileref value
                        let td = $(item).parent();
                        let tr = td.parent();
                        tr.find('.fileref_fileref').first().val('');
                        // check if complete row can be deleted
                        const table_body = tr.parent();
                        if (table_body.find('tr').length > 1) {
                            // more than one row => delete row
                            // (object does not matter)
                            modelSolutionFileRefSingleton.removeItem($(item));
                        }
                    }
                }
            });
        }

        // var found = false;
        const selectedFilename = $(tempSelElem).val();
        // get old file id
        const nextTd = $(tempSelElem).parent().next('td');
        const row = $(tempSelElem).closest('tr');
        const oldFileId = nextTd.find('.fileref_fileref')[0].value;

        FileReferenceList.rowEnableEditorButton(row, false);

        switch (selectedFilename) {
            case loadFileOption:
                // read new file
                // reset selection in case choosing a file fails
                $(tempSelElem).val(emptyFileOption); // do not call change!
                // change callback
                let dummybutton = $("#dummy_file_upload_button").first();
                dummybutton.unbind("change");
                dummybutton.change(function () {
                    let inputbutton = $("#dummy_file_upload_button")[0];
                    let filenew = inputbutton.files[0];
                    if (!filenew) {
                        console.log("no file selected -> cancel");
                        return;
                    }

                    readAndCreateFileData(filenew, undefined /*-1*/,
                        function (newFilename, fileId) {
                            if ($(tempSelElem)) {
                                $(tempSelElem).val(newFilename).change();
                                FileReferenceList.rowEnableEditorButton(row, true);
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
                if (selectedFilename && selectedFilename.trim().length) {
                    let ui_file = FileWrapper.constructFromFilename(selectedFilename);
                    if (ui_file) { // can be undefined when no filename is selected
                        const fileid = ui_file.id;
                        if (isDuplicateId(fileid)) {
                            // clean input field
                            $(tempSelElem).val(emptyFileOption).change();
                            return;
                        }

                        // set new file id
                        nextTd.find('.fileref_fileref')[0].value = fileid;
                        FileReferenceList.rowEnableEditorButton(row, true);
                        if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
                            // call test specific configured handler
                            if (fileid) {
                                // setJavaClassname(selectedFilename);
                                // setJUnitDefaultTitle(selectedFilename);
                                config.handleFilenameChangeInTest(selectedFilename, tempSelElem);
                            }
                            // TODO: check for internal-library
                        } else if ($(tempSelElem).hasClass('xml_template_filename')) {
                            handleClassChange(ui_file, fileid, TEMPLATE);
                        } else if ($(tempSelElem).hasClass('xml_instruction_filename')) {
                            handleClassChange(ui_file, fileid, INSTRUCTION);
/*                        } else if ($(tempSelElem).hasClass('xml_multimedia_filename')) {
                            handleClassChange(ui_file, fileid, LIBRARY);*/
                        } else {
                            // model solution, nothing to be done
                        }
                    }
                }
        }

        if (oldFileId !== '') {
            // delete old file
            FileReferenceList.deleteFile(oldFileId);
        }
    };

    static updateAllEditorButtons() {
        $.each($(".fileref_fileref"), function(index, item) {
            let row = $(item).parent().parent();
            FileReferenceList.rowEnableEditorButton(row, true);
        });
    }

    // update all filename lists
    static updateAllFilenameLists() {
        $.each($(filenameClassList.join(',')), function(index, item) {
            //console.log("update filelist in test ");
            // store name of currently selected file
            const text = $("option:selected", item).text(); // selected text
            //console.log("selected is " + text);
            FileReferenceList.updateFilenameList(item); // update filename list
            let indexFound = -1;
            if (text.trim().length > 0) {  // always true!
                // check if previously selected filename is still in list
                // (ich weiß im Moment nicht, wie man die Einträge aus
                // der Liste rauszieht...TODO)
                // TODO einfacher: einfach setzen und schauen, ob leer???

                $.each($(".xml_file_filename"), function (indexOpt, item) {
                    if (item.value.length > 0 && item.value === text) {
                        indexFound = indexOpt;
                        return false;
                    }
                });
            }

            if (indexFound >= 0) {
                //console.log("selektiere " + indexFound);
                item.selectedIndex = indexFound + 1; // +1:weil am Anfang noch ein Leerstring ist
            } else {
/*
                // das ist kein guter Ort für so was!!
                // remove actual numeric fileref value
                let td = $(item).parent();
                let tr = td.parent();
                tr.find('.fileref_fileref').first().val('');
                // check if complete row can be deleted
                const table_body = tr.parent();
                if (table_body.find('tr').length > 1) {
                    // more than one row => delete row
                    modelSolutionFileRefSingleton.removeFileRef($(item));
                }
*/
            }
        });
    }

    // create the drop-down with all possible filenames
    static updateFilenameList(tempSelElem) {
        $(tempSelElem).empty();
        let tempOption = $("<option>" + emptyFileOption + "</option>");
        $(tempSelElem).append(tempOption); // empty string
        $.each($(".xml_file_filename"), function(index, item) {
            if (item.value.length > 0) {
                tempOption = $("<option></option>");
                tempOption[0].textContent = item.value;
                $(tempSelElem).append(tempOption);
            }
        });
        //tempSelElem.val(""); // preset no filename
        tempOption = $("<option></option>");
        tempOption[0].textContent = loadFileOption;
        $(tempSelElem).append(tempOption);
    }


    static uploadFiles(files, box, instance) {
        /*if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        */
        $.each(files, function(index, file) {
            readAndCreateFileData(file, undefined/*-1*/, function(filename) {
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
                        FileReferenceList.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                            classname.getInstance());
                    }
                }
            }
        });
    }
}





class TestFileReference extends FileReferenceList {

    constructor() {
        super('xml_test_filename', 'xml_test_fileref', 'TestFileReference', 'Testscript',
            'file containing test cases or test specification', true);
    }

    static getInstance() {return testFileRefSingleton;}

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


class ModelSolutionFileReference extends FileReferenceList {

    constructor() {
        super('xml_model-solution_filename', 'xml_model-solution_fileref',
            'ModelSolutionFileReference', 'File',
            'file belonging to a model solution', true);
    }
    static getInstance() {return modelSolutionFileRefSingleton;}
}
let modelSolutionFileRefSingleton = new ModelSolutionFileReference();



class VisibleFileReference extends FileReferenceList {

    constructor() {
        super('xml_visible_filename', 'xml_visible_fileref',
            'VisibleFileReference', 'Student visible File',
            'files that the student can see (e.g. pdf, image, library ', false);
    }

    createExtraContent() {
        return "<td><select class='xml_lms_usage'>"+
            "<option value='download' selected='selected'>Download</option>"+
            "<option value='edit'>Editor (e.g. Code Snippet)</option>"+
            "<option value='display'>Display (e.g. multimedia)</option>"+
            "</select><br></td>";
    }

    getNumberOfExtraColumns() { return 1;}

    doOnAll(callback) {
        $.each(this.root.find(".fileref_fileref"), function(index, item) {
            const filerefId = item.value;
            if (filerefId) {
                const row = $(item).parent().parent();
                const displayMode_row = row.find(".xml_lms_usage").first();
                let displayMode = displayMode_row.val();
                return callback(filerefId, displayMode);
            }
        });
    }

    setDisplayMode(box, index, displayMode) {
        let elements = box.find(".xml_lms_usage");
        let element = elements.eq(index);
        $(element).val(displayMode);
    }

    static getInstance() {return visibleFileseSingleton;}
}
let visibleFileseSingleton = new VisibleFileReference();




class DownloadableFileReference extends FileReferenceList {

    constructor() {
        super('xml_instruction_filename', 'xml_instruction_fileref',
            'DownloadableFileReference', 'Downloadable File',
            'files that can be downloaded by student (e.g. pdf, image, library ', false);
    }
    static getInstance() {return downloadableSingleton;}
}
let downloadableSingleton = new DownloadableFileReference();


class TemplateFileReference extends FileReferenceList {
    constructor() {
        super('xml_template_filename', 'xml_template_fileref',
            'TemplateFileReference', 'Code template',
            'code snippet that the student should use as a starting point for coding', false);
    }
    static getInstance() {return templSingleton;}
}
let templSingleton = new TemplateFileReference();



class MultimediaFileReference extends FileReferenceList {
    constructor() {
        super('xml_multimedia_filename', 'xml_multmedia_fileref',
            'MultimediaFileReference', 'Multmedia File',
            'files belonging to descripton (e.g. images) ' +
            'that should be displayed inline (if supported by LMS)', false);
    }
    static getInstance() {return librarySingleton;}
}
let librarySingleton = new MultimediaFileReference();
