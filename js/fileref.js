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
var templSingleton = null;
var instructionSingleton = null;


// abstract class for a filename reference input
class FileReference {

    constructor(classFilename, classFileref, classAddFileref, classRemoveFileref, jsClassName, label, mandatory) {
        this.classFilename = classFilename;
        this.classFileref = classFileref;
        this.classAddFileref = classAddFileref;
        this.classRemoveFileref = classRemoveFileref;

        this.createTableStrings(jsClassName, label, mandatory);
        this.JsClassname = jsClassName;
    }

    getClassFilename() { return this.classFilename; }

    // getClassFilename() { return this.classFilename; }
    // getClassFileRef() { return this.classFileref; }


    createTableStrings(className, label, mandatory) {
        label = label + '(s)';
        this.filenameLabel = "<label for='" + this.classFilename +
            "'>" + label + (mandatory?"<span class='red'>*</span>":"") + ": </label>";
        this.tdFilenameLabel ="<td>" + this.filenameLabel + "</td>";
        this.tdFilename = "<td><select class='mediuminput fileref_filename " + this.classFilename + "' " + // onfocus = 'updateFilenameList(this)' "+
            "onchange = 'FileReference.onFileSelectionChanged(this)'></select></td>"+
            "<td><label for='" + this.classFileref + "'>Fileref: </label>"+ // fileref
            "<input class='tinyinput fileref_fileref " + this.classFileref + "' readonly/></td>";
        this.tdAddButton = "<td><button class='" + this.classAddFileref +
            "' title='add another filename' onclick='" + className + ".getInstance().addFileRef($(this))'>+</button><br></td>";
        this.tdRemoveButton = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".getInstance().remFileRef($(this))'>x</button></td>";
        // hide first remove file button
        var tdFirstRemoveButton = "<td><button class='" + this.classRemoveFileref +
            "' onclick='" + className + ".getInstance().remFileRef($(this))' style='display: none;'>x</button></td>";

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
        var element = box.find("." + this.classFilename);
        updateFilenameList(element.eq(index));
        element.eq(index).val(filename).change();
    }


    addFileRef(element) {
        // add new line for selecting a file for a test
        var td = element.parent();
        var tr = td.parent();
        var table_body = tr.parent();
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
            previousRow.append(this.tdAddButton);
        }
        if (hasPrevTr.length == 0) {
            // row to be deleted is first row
            // => add filename label to first column
            var firstCell =table_body.find("td").first();
            firstCell.append(this.filenameLabel); // without td
        }
        if (table_body.find("tr").length == 1) {
            // table has exactly one row left
            // => hide all remove file buttons
            table_body.find("." + this.classRemoveFileref).hide();
        }
    }

    onFileUpload(filename, uploadBox) {
        // select new filename in first empty filename
        //console.log("uploadFiles: select " + filename + " in option list");
        var done = false;
        $.each($(uploadBox).find("." + this.classFilename), function(index, element) {
            if (done) return false;
            var currentFilename = $(element).val();
            if (currentFilename == "") {
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

        function setJavaClassname(newFilename) {
            // set classname if file belongs to JUNIT and if exactly one file is assigned
            var testBox = $(tempSelElem).closest(".xml_test");
            var ui_classname = $(testBox).find(".xml_ju_mainclass");
            if (ui_classname.length == 1) {
                $.each(ui_classname, function(index, element) {
                    var currentFilename = $(element).val();
                    if (!readXmlActive)
                        $(element).val(java_getFullClassnameFromFilename(newFilename)).change();
                });
            }
        }

        function setJUnitDefaultTitle(newFilename) {
            // set decsription according to classname
            var testBox = $(tempSelElem).closest(".xml_test");
            var ui_title = $(testBox).find(".xml_test_title");
            if (ui_title.length == 1) {
                $.each(ui_title, function(index, element) {
                    var currentTitle = $(element).val();
                    if (!readXmlActive && currentTitle == JUnit_Default_Title)
                        $(element).val("Junit Test " + java_getPureClassnameFromFilename(newFilename)).change();
                });
            }
        }

        var found = false;
        var selectedFilename = $(tempSelElem).val();
        //console.log("-> selected is '" + selectedFilename + "'");

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
                return; // do nothing
            default:
                var nextTd = $(tempSelElem).parent().next('td');
                var fileid = "";
                $.each($(".xml_file_filename"), function(index, item) {
                    if (selectedFilename == item.value ) {
                        fileid = $(item).first().parent().find(".xml_file_id").val();
                        return;
                    }
                });
                if ($(tempSelElem).hasClass('xml_test_filename')) {   // is it a test or a model-solution
                    nextTd.find('.xml_test_fileref')[0].value = fileid;
                    // set classname if file belongs to JUNIT
                    if (fileid != '') {
                        setJavaClassname(selectedFilename);
                        setJUnitDefaultTitle(selectedFilename);
                    }
                } else if ($(tempSelElem).hasClass('xml_template_filename')) {
                    nextTd.find('.xml_template_fileref')[0].value = fileid;
                    // set to file class to 'template'
                    var fileclass = $(".xml_file_id[value='"+fileid+"']").parent().find(".xml_file_class").first();
                    fileclass.val('template');
                    // TODO: disable class is easy, but when to enable it??
                    // fileclass.attr('disabled', true);

                } else if ($(tempSelElem).hasClass('xml_instruction_filename')) {
                    nextTd.find('.xml_instruction_fileref')[0].value = fileid;
                    // set to file class to 'template'
                    $(".xml_file_id[value='"+fileid+"']").parent().find(".xml_file_class").first().val('instruction');

                } else {
                    nextTd.find('.xml_model-solution_fileref')[0].value = fileid;
                }
        }
    };


    // update all filename lists
    static updateAllFilenameLists() {
        $.each($(".xml_test_filename, .xml_model-solution_filename, .xml_template_filename, .xml_instruction_filename"), function(index, item) {
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
                if (item.value.length > 0 && item.value == text) {
                    indexFound = indexOpt;
                }
            });
            if (indexFound >= 0) {
                //console.log("selektiere " + indexFound);
                item.selectedIndex = indexFound + 1; // +1:weil am Anfang noch ein Leerstring ist
            } else {
                // filename not found => remove fileid
                console.log("filename ref not found");
                $(item).closest(".xml_test,.xml_model-solution, #templatedropzone").
                find($(".xml_test_fileref, .xml_model-solution_fileref, .xml_template_fileref, .xml_template_fileref")).first().val("");
            }
        }
        });
    }

}



class TestFileReference extends FileReference {

    constructor() {
        super('xml_test_filename', 'xml_test_fileref',
            'add_file_ref_test', 'rem_file_ref_test', 'TestFileReference', 'Testscript', true);

        if (testFileRefSingleton == null) {
            testFileRefSingleton = this;
        }
    }

    static getInstance() {return testFileRefSingleton;}
    static getClassRoot() { return "xml_test"; }

    onFileUpload(filename, uploadBox) {
        super.onFileUpload(filename, uploadBox);
        // set classname if exactly one file is assigned
        var ui_classname = $(uploadBox).find(".xml_ju_mainclass");
        if (ui_classname.length == 1) {
            $.each(ui_classname, function(index, element) {
                var currentFilename = $(element).val();
                if (currentFilename == "" && !readXmlActive) {
                    $(element).val(java_getFullClassnameFromFilename(filename)).change();
                }
            });
        }
    }

    static uploadFiles(files, testBox) {
        //console.log("uploadFiles");
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                TestFileReference.getInstance().onFileUpload(filename, testBox);
            });
        });
    }
}
testFileRefSingleton = new TestFileReference();


class ModelSolutionFileReference extends FileReference {

    constructor() {
        super('xml_model-solution_filename', 'xml_model-solution_fileref',
            'add_file_ref_ms', 'rem_file_ref_ms', 'ModelSolutionFileReference', 'Filename', true);

        if (modelSolutionFileRefSingleton == null) {
            modelSolutionFileRefSingleton = this;
        }
    }
    static getInstance() {return modelSolutionFileRefSingleton;}
    static getClassRoot() { return "xml_model-solution"; }

    // TODO: move back to editor.js???
    static uploadFiles(files, modelSolBox) {
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                ModelSolutionFileReference.getInstance().onFileUpload(filename, modelSolBox);
            });
        });
    }
}
modelSolutionFileRefSingleton = new ModelSolutionFileReference();




class InstructionFileReference extends FileReference {

    constructor() {
        super('xml_instruction_filename', 'xml_instruction_fileref',
            'add_file_ref_instr', 'rem_file_ref_instr', 'InstructionFileReference', 'Attachment', false);

        if (instructionSingleton == null) {
            instructionSingleton = this;
        }
    }
    static getInstance() {return instructionSingleton;}
    //static getClassRoot() { return "???"; }

    // TODO: move back to editor.js???
    static uploadFiles(files, box) {
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                InstructionFileReference.getInstance().onFileUpload(filename, box);
            });
        });
    }
}
instructionSingleton = new InstructionFileReference();


class TemplateFileReference extends FileReference {

    constructor() {
        super('xml_template_filename', 'xml_template_fileref',
            'add_file_ref_templ', 'rem_file_ref_templ', 'TemplateFileReference', 'Template', false);

        if (templSingleton == null) {
            templSingleton = this;
        }
    }

    static getInstance() {return templSingleton;}

    //static getClassRoot() { return "xml_model-solution"; }

    // TODO: move back to editor.js???
    static uploadFiles(files, box) {
        if (files.length > 1) {
            alert('You have dragged more than one file. You must drop exactly one file!');
            return;
        }
        $.each(files, function(index, file) {
            readAndCreateFileData(file, -1, function(filename) {
                TemplateFileReference.getInstance().onFileUpload(filename, box);
            });
        });
    }
}
templSingleton = new TemplateFileReference();