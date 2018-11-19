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



function isInputComplete() {
    let inputField = $("#xml_description");
    if (!inputField.val()) {
        setErrorMessage("Task description is empty.");
        // switch to appropriate tab and set focus
        $("#tabs").tabs("option", "active",  tab_page.MAIN);
        inputField.focus();
        return false;
    }

    inputField = $("#xml_title");
    if (!inputField.val()) {
        setErrorMessage("Task title is empty.");
        // switch to appropriate tab and set focus
        $("#tabs").tabs("option", "active",  tab_page.MAIN);
        inputField.focus();
        return false;
    }

    if ((typeof $(".xml_file_id")[0] === "undefined") ||      //  check for missing form values
        ModelSolutionFileReference.getInstance().getCountFilerefs() === 0) {
        // (typeof $(".xml_model-solution_fileref")[0] === "undefined")) {
        setErrorMessage("Required elements are missing. " +
            "At least one model solution element and its " +
            "corresponding file element must be provided. ");
        return false;
    }

    let returnFromFunction = false;
    $.each($(".xml_file_filename"), function(index, item) {  // check whether filenames are provided
        if (!item.value) {
            setErrorMessage("Filename is empty.");
            $("#tabs").tabs("option", "active",  tab_page.FILES);
            item.focus();
            returnFromFunction = true;
        }
    });
    if (returnFromFunction)
        return false;

    $.each($("." + ModelSolutionFileReference.getInstance().getClassFilename()), function(index, item) {   // check whether referenced filenames exists
        if (!item.value) {
            $("#tabs").tabs("option", "active",  tab_page.MODEL_SOLUTION);
            setErrorMessage("Filename in model solution is missing.");
            item.focus();
            returnFromFunction = true;
        }
    });
    if (returnFromFunction)
        return false;



    $.each($("." + TestFileReference.getInstance().getClassFilename()), function(index, item) {   // check whether referenced filenames exists
        if ($(item).is(":visible") && !item.value) {
            $("#tabs").tabs("option", "active",  tab_page.TESTS);
            setErrorMessage("Filename in test is missing.");
            item.focus();
            returnFromFunction = true;
        }
    });
    if (returnFromFunction)
        return false;

    $.each($(".xml_ju_mainclass"), function(index, item) {   // check whether main-class exists
        if (!item.value) {
            $("#tabs").tabs("option", "active",  tab_page.TESTS);
            setErrorMessage("Class name is missing.");
            item.focus();
            returnFromFunction = true;
        }
    });

    if (returnFromFunction)
        return false;

    return true;
}


// on document ready...:

///////////////////////////////////////////////////////// function: convertToXML


/**
 * writes data from UI elements to xml string
 */
convertToXML = function(topLevelDoc, rootNode) {

    const t0 = performance.now();
    clearErrorMessage();
    taskXml = undefined;
    descriptionEditor.save();

    // check input
    if (!isInputComplete()) {
        return;
    }

    // PRE PROCESSING
/*
    FileWrapper.doOnAllFiles(function(ui_file) {
        if (ui_file.isLibrary && ui_file.class === INTERNAL) {
            // convert to internal library if class is internal
            ui_file.class = INTERNAL_LIB;
        }
    });
*/

    // copy data to task class
    let task = new TaskClass();
    task.title = $("#xml_title").val();
    task.comment = $("#xml_task_internal_description").find('.xml_internal_description').val();
    task.description = descriptionEditor.getValue();
    let proglangAndVersion = $("#xml_programming-language").val();
    let proglangSplit = proglangAndVersion.split("/");

    task.proglang = proglangSplit[0]; // proglangAndVersion.substr(0, proglangAndVersion.indexOf("/"));
    if (proglangSplit.length > 1)
        task.proglangVersion = proglangSplit[1]; // proglangAndVersion.substr(proglangAndVersion.indexOf("/")+1);
    else
        task.proglangVersion = '';

    task.parentuuid = null;
    //task.uuid = $("#xml_uuid").val();
    //if (!task.uuid)
        task.uuid = generateUUID();
    task.lang = $("#xml_lang").val();
    task.sizeSubmission = $("#xml_subm_regexp_size").val();
    task.filenameRegExpSubmission = $("#xml_subm_regexp_name").val();

    // read files
    FileWrapper.doOnAllFiles(function(ui_file) {
        let taskfile = new TaskFile();
        taskfile.filename = ui_file.filename;
        taskfile.fileclass = ui_file.class;
        taskfile.id = ui_file.id;
        taskfile.filetype = ui_file.type;
        taskfile.comment = ui_file.comment;
        taskfile.content = ui_file.text;
        task.files[taskfile.id] = taskfile;
    });

    // read model solutions
    ModelSolutionWrapper.doOnAll(function(ms) {
        let modelSolution = new TaskModelSolution();
        modelSolution.id = ms.id;
        modelSolution.comment = ms.comment;
        modelSolution.description = ms.description;
        let counter = 0;
        ModelSolutionFileReference.getInstance().doOnAll(function(id) {
            modelSolution.filerefs[counter++] = new TaskFileRef(id);
        }, ms.root);

        //readFileRefs(xmlReader, modelSolution, thisNode);
        task.modelsolutions[modelSolution.id] = modelSolution;
    })

    // read tests
    TestWrapper.doOnAll(function(uiTest) {
        let test = new TaskTest();
        test.id = uiTest.id;
        test.title = uiTest.title;
        test.testtype = uiTest.testtype;
        test.comment = uiTest.comment;
        test.description = uiTest.description;

        let counter = 0;
        TestFileReference.getInstance().doOnAll(function(id) {
            test.filerefs[counter++] = new TaskFileRef(id);
        }, uiTest.root);

        $.each(config.testInfos, function(index, configItem) {
            // search for appropriate writexml function
            if (configItem.testType === test.testtype) {
                if (configItem.writeXml) {
                    test.writeCallback = configItem.writeXml;
                    test.uiElement = uiTest;
                }
            }
        });


        //readFileRefs(xmlReader, modelSolution, thisNode);
        task.tests[test.id] = test;
    })


    taskXml = task.writeXml(topLevelDoc, rootNode);
    const t1 = performance.now();
    console.log("Call to convertToXML took " + (t1 - t0) + " milliseconds.")
};



readAndDisplayXml = function() {
    let task = new TaskClass();

    function createMs(item, index) {
        let ms = ModelSolutionWrapper.create(item.id, item.description, item.comment);
        let counter = 0;
        item.filerefs.forEach(function(itemFileref, indexFileref) {
            let filename = task.findFilenameForId(itemFileref.refid);
            ModelSolutionFileReference.getInstance().setFilenameOnCreation(ms.root, counter++, filename);
        });
    }

    function createFile(item, index) {
        newFile(item.id);
        let ui_file = FileWrapper.constructFromId(item.id);
        ui_file.filename = item.filename;
        ui_file.class = item.fileclass;
        ui_file.type = item.filetype;
        ui_file.comment = item.comment;
        if (ui_file.type === 'embedded')
            ui_file.text = item.content;
    }

    function createTest(item, index) {
        testIDs[item.id] = 1;

        let ui_test = undefined;
        $.each(config.testInfos, function(index, configItem) {
            if (!ui_test && item.testtype === configItem.testType) {
                ui_test = TestWrapper.create(item.id, item.title, configItem.htmlExtraFields,
                    configItem.testType, configItem.withFileRef);
                if (configItem.readXml) {
                    task.readTestConfig(taskXml, item.id, configItem.readXml, ui_test.root);
                }
                ui_test.comment = item.comment;
                ui_test.description = item.description;
            }
        });
        if (!ui_test) {
            setErrorMessage("Test "+item.testtype+" not imported");
            testIDs[item.id] = 0;
            return; // wrong test-type
        }


        let counter = 0;
        item.filerefs.forEach(function(itemFileref, indexFileref) {
            let filename = task.findFilenameForId(itemFileref.refid);
            TestFileReference.getInstance().setFilenameOnCreation(ui_test.root, counter++, filename);
        });
    }

    if (taskXml.length > 0) {
        // ask user
        if (!window.confirm("All form content will be deleted and replaced.")) {
            return;
        }                         // proceed only after confirmation
    } else {
        setErrorMessage("Task.xml is empty.");
        return;
    }


    gradingHintCounter = 1;                            // variable initialisation
    clearErrorMessage();
    FileWrapper.deleteAllFiles();

    $("#modelsolutionsection")[0].textContent = "";
    $("#testsection")[0].textContent = "";

    // initialise other sections
    //FileReferenceList.init("#librarydropzone", '#librarysection', LibraryFileReference);
    FileReferenceList.init("#downloaddropzone", '#downloadsection', DownloadableFileReference);
    FileReferenceList.init("#templatedropzone", '#templatesection', TemplateFileReference);
    const templateroot = $("#templatedropzone");
    //const libroot = $("#librarydropzone");
    const downloadroot = $("#downloaddropzone");

    // fileIDs = {};
    modelSolIDs = {};
    testIDs = {};


    // TODO: check version
    // TODO: validate??
    task.readXml(taskXml);


    descriptionEditor.setValue(task.description);
    $("#xml_title").val(task.title);
    $("#xml_task_internal_description").find('.xml_internal_description').val(task.comment);
    $("#xml_uuid").val(task.uuid);
    $("#xml_subm_regexp_size").val(task.sizeSubmission);
    $("#xml_subm_regexp_name").val(task.filenameRegExpSubmission);
    if (task.proglangVersion)
        $("#xml_programming-language").val(task.proglang + '/' + task.proglangVersion);
    else
        $("#xml_programming-language").val(task.proglang);
    $("#xml_lang").val(task.lang);

    // check proglang
    if ($("#xml_programming-language").val() === null) {
        setErrorMessage("This combination of programming language and version is not supported.");
    }

    task.files.forEach(createFile);
    task.modelsolutions.forEach(createMs);
    task.tests.forEach(createTest);

    // POST PROCESSING

    // special handling for visisble files:
    // add dummy file references
    let indexTemplate = 0;
    let indexDownload = 0;
    //let indexLib = 0;
    task.files.forEach(function(item) {
        if (item.visible) {
            switch (item.usageInLms) {
                case T_Lms_Usage.DISPLAY:
                    TemplateFileReference.getInstance().setFilenameOnCreation(templateroot, indexTemplate++, item.filename);
                    break;
                case T_Lms_Usage.DOWNLOAD:
                    DownloadableFileReference.getInstance().setFilenameOnCreation(downloadroot, indexDownload++, item.filename);
                    break;
            }
        }
/*
        switch(item.fileclass) {
            case TEMPLATE:
                TemplateFileReference.getInstance().setFilenameOnCreation(templateroot, indexTemplate++, item.filename);
                break;
            case INSTRUCTION:
                DownloadableFileReference.getInstance().setFilenameOnCreation(downloadroot, indexDownload++, item.filename);
                break;
            case LIBRARY:
                LibraryFileReference.getInstance().setFilenameOnCreation(libroot, indexLib++, item.filename);
            // break; // fall through!!
            case INTERNAL_LIB:
                let ui_file = FileWrapper.constructFromId(item.id);
                ui_file.isLibrary = true;
                break;
            default:
                break;
        }
*/
    });

    // fill filename lists in empty file refences
    FileReferenceList.updateAllFilenameLists();
};