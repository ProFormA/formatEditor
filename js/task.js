/**
 * Created by karin on 01.06.2017.
 */



///////////////////////////////////////////////////////// Create an empty xml template
/* This creates an empty XML template in the required format.
 * The first return value contains the main XML structure without individual tests.
 * The second return value contains a hash which has an element for each test type.
 */
/*
function createXMLTemplate(schemaversion) {            // parseXML is not namespace-aware
    if (schemaversion === version094) {
        var xmlTemp1 = '<task ' + xsdNamespace.namespace + 'lang="">';
        var xmlTemp2 = '<description></description><proglang version=""></proglang><submission-restrictions max-size=""/>';
    } else {
        var xmlTemp1 = '<task ' + xsdNamespace.namespace + 'uuid ="" lang="">';
        var xmlTemp2 = '<description></description><proglang version=""></proglang><submission-restrictions>'+
            '<regexp-restriction max-size="" mime-type-regexp=""/></submission-restrictions>';
    }
    const xmlTemp3 = '<files><file class="internal" filename="" id="" type="embedded"/></files>';
    const xmlTemp4 = '<model-solutions><model-solution id=""><filerefs><fileref/></filerefs></model-solution></model-solutions>';
    const xmlTemp5 = '<tests></tests><grading-hints /><meta-data><title/>';
    const xmlTemp6 = '</meta-data></task>';

    var extra = tExtraTemplateTopLevel;
    if (!extra)
        extra = "";
    var xmlDc = $.parseXML(xmlTemp1 + xmlTemp2 + xmlTemp3 + xmlTemp4 + xmlTemp5 + tExtraTemplateTopLevel + xmlTemp6);

    function createXmlTestTemplate(testtype, metaDataElements, addElement) {
        const xstrTestType = '<test ' + xsdNamespace.namespace + 'id=""><title/><test-type>';
        const xstrFileRef = '</test-type><test-configuration><filerefs><fileref/></filerefs>';
        const xstrMetaData = '<test-meta-data>';
        const xstrTestCfg = '</test-meta-data></test-configuration></test>';

        if (!addElement)
            addElement = "";
        var strTemplate = xstrTestType + testtype + xstrFileRef +
            addElement + xstrMetaData + metaDataElements + xstrTestCfg;
        return $.parseXML(strTemplate);
    }

    // build hash from testinfos
    var xmlHash = {};
    $.each(config.testInfos, function(index, testinfo) {
        xmlHash[testinfo.xmlTemplateName] =
            createXmlTestTemplate(testinfo.testType, testinfo.xmlTemplate1, testinfo.xmlTemplate2);
    })

    return {xmlDoc : xmlDc, testtemplate: xmlHash};
}
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

    inputField = $("#xml_meta-data_title");
    if (!inputField.val()) {
        setErrorMessage("Task title is empty.");
        // switch to appropriate tab and set focus
        $("#tabs").tabs("option", "active",  tab_page.MAIN);
        inputField.focus();
        return false;
    }

    if ((typeof $(".xml_file_id")[0] === "undefined") ||      //  check for missing form values
        (typeof $(".xml_model-solution_fileref")[0] === "undefined")) {
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
/* This converts the form elements into the XML file.
 * First, it checks for some required values and stops executing if these are missing.
 * TODO: The XML file is validated against the schema.
 */


convertToXML = function() {

    const t0 = performance.now();
    clearErrorMessage();
    taskXml = undefined;
    descriptionEditor.save();

    // check input
    if (!isInputComplete()) {
        return;
    }

    // PRE PROCESSING
    FileWrapper.doOnAllFiles(function(ui_file) {
        if (ui_file.isLibrary && ui_file.class === INTERNAL) {
            // convert to internal library if class is internal
            ui_file.class = INTERNAL_LIB;
        }
    });

    // copy data to task class
    let task = new TaskClass();
    task.title = $("#xml_meta-data_title").val();
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
    task.sizeSubmission = $("#xml_subm_max-size").val();
    task.mimeTypeRegExpSubmission = $("#xml_upload-mime-type").val();

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
        let counter = 0;
        ModelSolutionFileReference.getInstance().doOnAll(ms.root, function(id) {
            modelSolution.filerefs[counter++] = new TaskFileRef(id);
        });

        //readFileRefs(xmlReader, modelSolution, thisNode);
        task.modelsolutions[modelSolution.id] = modelSolution;
    })

    // read tests
    TestWrapper.doOnAll(function(uiTest) {
        let test = new TaskTest();
        test.id = uiTest.id;
        test.title = uiTest.title;
        test.testtype = uiTest.testtype;
        let counter = 0;
        TestFileReference.getInstance().doOnAll(uiTest.root, function(id) {
            test.filerefs[counter++] = new TaskFileRef(id);
        });

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


    taskXml = task.writeXml();

    config.createFurtherOutput(task.proglang);

    const t1 = performance.now();
    console.log("Call to convertToXML took " + (t1 - t0) + " milliseconds.")
};



readAndDisplayXml = function() {
    let task = new TaskClass();

    function createMs(item, index) {
        let ms = ModelSolutionWrapper.create(item.id, item.comment);
        //let root = newModelsol(item.id, item.comment);
        //modelSolIDs[item.id];

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

        let testroot = undefined;
        $.each(config.testInfos, function(index, configItem) {
            if (!testroot && item.testtype === configItem.testType) {
                testroot = TestWrapper.create(item.id, /* configItem.title */item.title, configItem.htmlExtraFields,
                    configItem.testType, configItem.withFileRef).root;
                if (configItem.readXml) {
                    task.readTestConfig(taskXml, item.id, configItem.readXml, testroot);
                }
            }
        });
        if (!testroot) {
            setErrorMessage("Test "+item.testtype+" not imported");
            testIDs[item.id] = 0;
            return; // wrong test-type
        }


        let counter = 0;
        item.filerefs.forEach(function(itemFileref, indexFileref) {
            let filename = task.findFilenameForId(itemFileref.refid);
            TestFileReference.getInstance().setFilenameOnCreation(testroot, counter++, filename);
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
    FileReferenceList.init("#librarydropzone", '#librarysection', LibraryFileReference);
    FileReferenceList.init("#instructiondropzone", '#instructionsection', InstructionFileReference);
    FileReferenceList.init("#templatedropzone", '#templatesection', TemplateFileReference);
    const templateroot = $("#templatedropzone");
    const libroot = $("#librarydropzone");
    const instructionroot = $("#instructiondropzone");

    // fileIDs = {};
    modelSolIDs = {};
    testIDs = {};


    // TODO: check version
    // TODO: validate??
    task.readXml(taskXml);


    descriptionEditor.setValue(task.description);
    $("#xml_meta-data_title").val(task.title);
    $("#xml_uuid").val(task.uuid);
    $("#xml_subm_max-size").val(task.sizeSubmission);
    $("#xml_upload-mime-type").val(task.mimeTypeRegExpSubmission);
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

    // special handling for template, library and instruction file class:
    // add dummy file references
    let indexTemplate = 0;
    let indexInstruction = 0;
    let indexLib = 0;
    task.files.forEach(function(item) {
        switch(item.fileclass) {
            case TEMPLATE:
                TemplateFileReference.getInstance().setFilenameOnCreation(templateroot, indexTemplate++, item.filename);
                break;
            case INSTRUCTION:
                InstructionFileReference.getInstance().setFilenameOnCreation(instructionroot, indexInstruction++, item.filename);
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
    });

    // fill filename lists in empty file refences
    FileReferenceList.updateAllFilenameLists();
};