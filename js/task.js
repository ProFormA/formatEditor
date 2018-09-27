/**
 * Created by karin on 01.06.2017.
 */






///////////////////////////////////////////////////////// mapping HTML form names and XML names
/* This creates the main data structure for the program.
 * It consists of arrays of elements.
 * Each element shows the relationshop between XML names and form names.
 * The arrays sort the elements depending on how deep they are in the XML file.
 * The arrays can be looped through in order to process the XML file.
 */
function createMapping(schemaversion) {                // note: the maps are global variables

    mapSingleElements = [                                // single XML elements
        new ValMap("#xml_description","description","",1),
        new ValMap("#xml_meta-data_title","meta-data > title","",0),
        new ValMap("#xml_grading-hints_text","grading-hints","",0)
    ];

    mapSingleAttrs = [                                   // single XML attributes
        new ValMap("#xml_lang","lang","task",0)
//    new ValMap("#xml_subm_unpackArchiveRegExp","unpack-files-from-archive-regexp","submission-restrictions",0),
//    new ValMap("#xml_subm_unpackArchive","unpack-files-from-archive","submission-restrictions",0),
    ];
    if (schemaversion == version094) {
        mapSingleAttrs[1] = new ValMap("#xml_subm_max-size","max-size","submission-restrictions",0);
        mapSingleAttrs[2] = new ValMap("#xml_subm_uploadNameRegexp","allowed-upload-filename-regexp","submission-restrictions",0);
    } else {
        mapSingleAttrs[1] = new ValMap("#xml_subm_max-size","max-size","regexp-restriction",0);
        mapSingleAttrs[2] = new ValMap("#xml_upload-mime-type","mime-type-regexp","regexp-restriction",0);
        mapSingleAttrs[3] = new ValMap("#xml_uuid","uuid","task",0);
    }
    mapElemSequence = [                                  // sequence of elements
        new ValMap(".xml_file","file","files",0),
        new ValMap(".xml_model-solution","model-solution","model-solutions",0),
        new ValMap(".xml_test","test","tests",0)
    ];
    mapTextInElemSequence = [                            // textcontent of elements in sequence
        new ValMap(".xml_file_text","file","files",1,".xml_file")
    ];

    mapChildElems = [                                    // child elements
        new ValMap(".xml_test_title","title","test",0,".xml_test"),
        new ValMap(".xml_test_type","test-type","test",0,".xml_test"),
        // moved to config.js
    ];


    mapListOfChildElems = [                              // list of child elements
        new ValMap(".xml_test_fileref","fileref","test-configuration",0,".xml_test","filerefs","refid"),
        new ValMap(".xml_model-solution_fileref","fileref","model-solution",0,".xml_model-solution","filerefs","refid")
    ];
    mapAttrInSequence = [                                // attributes of elements in sequences
        new ValMap(".xml_file_id","id","file",0,".xml_file"),
        new ValMap(".xml_file_filename","filename","file",0,".xml_file"),
        new ValMap(".xml_file_type","type","file",0,".xml_file"),
        new ValMap(".xml_file_class","class","file",0,".xml_file"),
        new ValMap(".xml_file_comment","comment","file",0,".xml_file"),
        new ValMap(".xml_model-solution_id","id","model-solution",0,".xml_model-solution"),
        new ValMap(".xml_model-solution_comment","comment","model-solution",0,".xml_model-solution"),
        new ValMap(".xml_test_id","id","test",0,".xml_test")
//    new ValMap(".xml_test_validity","validity","test",0,".xml_test"),
    ];
    mapAttrOfTestElems = [                               // attributes of elements in sequences
        // moved to config.js

    ];

    // add configured extra mapping
    $.each(config.createMappingList(schemaversion)/*uiXmlMapList*/, function(index, item) {
        switch(item.mappingType) {
            case MapType.CHILD_ELEM:
                mapChildElems.push(item.valmap);
                break;
            case MapType.ATTR_TEST_ELEMS:
                mapAttrOfTestElems.push(item.valmap);
                break;
            case MapType.SINGLE_ELEM:
                mapSingleElements.push(item.valmap);
                break;
            default:
                // todo add missing maps
                throw "unsupported maptype: " + item.mappingType;
        }
    });
}

///////////////////////////////////////////////////////// Create an empty xml template
/* This creates an empty XML template in the required format.
 * The first return value contains the main XML structure without individual tests.
 * The second return value contains a hash which has an element for each test type.
 */
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
/*    var xmlPrakTemp6 = "";
    if (usePraktomat) {
        xmlPrakTemp6 = '<praktomat:allowed-upload-filename-mimetypes>(text/.*)</praktomat:allowed-upload-filename-mimetypes>';}
*/
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
 * Then it loops through the data structure that was created for the XML file.
 * Proglang is dealt with separately.
 * UUID and namespace are added if required.
 * An XML file is created and placed in the textarea.
 * The XML file is validated against the schema.
 */
convertToXMLAlt = function() {
    taskXml = undefined;

    $("#output").val(""); // empty output so that the old output will not be used in future
    convertFormToXML = function(one,two,cdataBool) {
        let xmlDoc = $.parseXML('<task></task>');
        one.textContent = "";                              // delete previous content
        if (two !== 'undefined') {                                         // check whether replacement value exists
            if (cdataBool === 1) {
                const tempCdata = xmlDoc.createCDATASection(two);
                one.appendChild(tempCdata);
                const content = one.textContent;
                if (content !== two) {
                    alert('error creating CDATA section: ' + two);
                }
            } else {
                one.textContent = two;
            }
        }
    };

    const t0 = performance.now();

    clearErrorMessage();
    createMapping(config.xsdSchemaFile);
    var returntemp = createXMLTemplate(config.xsdSchemaFile);
    var xmlDoc = returntemp.xmlDoc;                          // empty XML Template
    var testtemplate = returntemp.testtemplate;              // a hash with test templates
    var xmlObject = $(xmlDoc);                               // convert it into a jQuery object
    var tempdata;
    var tempvar;
    var tempXmlDoc = $.parseXML('<task></task>');

    descriptionEditor.save();

    // check input
    if (!isInputComplete()) {
        return;
    }

    // PRE PROCESSING
    FileWrapper.doOnAllFiles(function(ui_file) {
    //$.each($(".xml_file_filename"), function(index, item) {
        //const ui_file = FileWrapper.constructFromFilename(item.value); // not nice..
        // const islib = ui_file.isLibrary;
        if (ui_file.isLibrary && ui_file.class === INTERNAL) {
            // convert to internal library if class is internal
            ui_file.class = INTERNAL_LIB;
        }
    });


    $.each(mapSingleElements, function(index, item) {
        try {
            convertFormToXML(xmlObject.find(item.xmlname)[0],$(item.formname).val(),item.cdata);
        } catch(err) { setErrorMessage("mapSingleElements: missing: "+ item.xmlname, err);}
    });
    $.each(mapSingleAttrs, function(index, item) {
        try {
            xmlObject.find(item.xmlpath)[0].setAttribute(item.xmlname,$(item.formname).val());
        } catch(err) { setErrorMessage("mapSingleAttrs: missing: "+item.xmlpath, err);}
    });

    $.each(mapElemSequence, function(index, item) {                 // loop: files, model-sols, ...
        if (typeof $(item.formname).val() != "undefined") {           // it exists in the form
            try {                                                       // delete unwanted children
                if (item.formname != ".xml_test") {
                    for(cnt=$(item.formname).length+1;cnt<=xmlObject.find(item.xmlname).length;cnt++) {
                        xmlObject.find(item.xmlpath)[0].removeChild(xmlObject.find(item.xmlname)[cnt-1]);
                    }                                                      // create as many children as needed
                    for(cnt=xmlObject.find(item.xmlname).length+1;cnt<=$(item.formname).length;cnt++) {
                        xmlObject.find(item.xmlpath)[0].appendChild(xmlObject.find(item.xmlname)[0].cloneNode(1));
                    }
                }
                if (item.formname == ".xml_test") {                       // delete all tests
                    while (xmlObject.find(item.xmlpath)[0].firstChild) {
                        xmlObject.find(item.xmlpath)[0].removeChild(xmlObject.find(item.xmlpath)[0].firstChild);
                    }
                    for(cnt=1;cnt<=$(item.formname).length;cnt++) {        // recreate all tests
                        found = false;
                        const testType = $(item.formname).find(".xml_test_type")[cnt-1].value;
                        $.each(config.testInfos, function(index, testinfo) {
                            if (!found && testType == testinfo.testType)  {
                                found = true;
                                xmlObject.find(item.xmlpath)[0].appendChild($(testtemplate[testinfo.xmlTemplateName]).find('test')[0].cloneNode(1));
                            }
                        });
                        if (!found) {
                            setErrorMessage("Test " + testType + " not found");
                        }
                    }
                }
            } catch(err) { setErrorMessage("mapElemSequence: missing: "+item.xmlpath+" or "+item.xmlname, err);}

            $(item.formname).each(function (idx1, itm1) {               // loop: xml_file existing in the form
                $.each(mapTextInElemSequence, function(idx2, itm2) {
                    if (item.xmlname === itm2.xmlname) {                    // relational join
                        try {                                                // deal with codemirror for file textarea
                            if (itm2.formname === '.xml_file_text') {
                                // special handling for file text:
                                // only store file text here if file type is 'embedded'
                                const filetype = $(itm1).find('.xml_file_type').val();
                                //console.log(filetype);
                                if (filetype === 'embedded') {
                                    if (config.useCodemirror) {
                                        //convertFormToXML(xmlObject.find(item.xmlname)[idx1],codemirror[idx1+1].getValue(),itm2.cdata);
                                        const text = codemirror[$(itm1).find('.xml_file_id').val()].getValue();
                                        convertFormToXML(xmlObject.find(item.xmlname)[idx1], text, itm2.cdata);

                                    } else {
                                        convertFormToXML(xmlObject.find(item.xmlname)[idx1],$(itm1).find(itm2.formname).val(),itm2.cdata);
                                    }
                                }
                            } else {
                                // default handling
                                convertFormToXML(xmlObject.find(item.xmlname)[idx1],$(itm1).find(itm2.formname).val(),itm2.cdata);
                            }
                        } catch(err) { setErrorMessage("formname: missing: "+item.xmlname, err);}
                    }
                });

                $.each(mapAttrInSequence, function(idx2, itm2) {         // loop: attributes
                    if (item.xmlname == itm2.xmlpath) {                    // relational join
                        try {
                            xmlObject.find(itm2.xmlpath)[idx1].setAttribute(itm2.xmlname,
                                $(itm1).find(itm2.formname).val());
                        } catch(err) { setErrorMessage("mapAttrInSequence: missing: "+item.xmlname, err);}
                    }
                });

                $.each(mapAttrOfTestElems, function(idx2, itm2) {        // loop: framework and version
                    if (typeof $(itm1).find(itm2.formname).val() != "undefined") {    // it exists in the form
                        try {
                            $(xmlObject.find(itm2.listelem)[idx1]).find(itm2.xmlpath).attr(itm2.xmlname,
                                $(itm1).find(itm2.formname).val());
                        } catch(err) { setErrorMessage("mapAttrOfTestElems: missing: "+item.xmlname, err);}
                    }
                });

                $.each(mapChildElems, function(idx2, itm2) {             // loop: test-title, ...
                    let form_elem = $(itm1).find(itm2.formname);
                    if (!form_elem || form_elem.length == 0)
                        return;
                    const input_type = form_elem[0].type;
                    let value = '';
                    switch (input_type) {
                        case 'text':
                        case 'select-one':
                            value = form_elem.val();
                            break;
                        case 'checkbox':
                            const value1 = form_elem.is(":checked");
                            // convert to string (default implementation makes lowercase)
                            if (value1)
                                value = 'True';
                            else
                                value = 'False';
                            //console.log('checkbox ' + itm2.formname + ' value = ' + value);
                            break;
                        default:
                            console.log('todo: handle input_type = ' + input_type);
                            value = form_elem.val();
                            break;
                    }
                    if (typeof value /*$(itm1).find(itm2.formname).val()*/ != "undefined") {    // it exists in the form
                        if (item.formname == itm2.formcontainer) {            // relational join
                            try {
/*                                para_1_1 = $(xmlObject.find(itm2.xmlpath)[idx1]);
                                para_1_2 = para_1_1.find(itm2.xmlname);
                                para_1_3 = para_1_2[0];
                                para1 = $(xmlObject.find(itm2.xmlpath)[idx1]).find(itm2.xmlname)[0];
                                para2 = $(itm1).find(itm2.formname).val();
                                para3 = itm2.cdata;
                                convertFormToXML(para1, para2, para3); */
                                convertFormToXML($(xmlObject.find(itm2.xmlpath)[idx1]).find(itm2.xmlname)[0],
                                    value /*$(itm1).find(itm2.formname).val()*/,itm2.cdata);
//                                setErrorMessage("mapChildElems: OK: "+itm2.xmlpath+"["+idx1+"] "+itm2.xmlname, null);
                            } catch(err) { setErrorMessage("mapChildElems: missing: "+itm2.xmlpath+"["+idx1+"] "+itm2.xmlname, err);}
                        }
                    }
                });
                $.each(mapListOfChildElems, function(idx2, itm2) {       // loop: filerefs
                    if (typeof $(itm2.formname).val() != "undefined") {    // it exists in the form
                        if (item.formname == itm2.formcontainer) {            // relational join
                            try {                                                // ToDo: filerefs deletable
                                tempvar = xmlObject.find(itm2.xmlpath)[idx1];
                                nrInForm = $(itm1).find(itm2.formname).length;
                                nrInXML = $(tempvar).find(itm2.xmlname).length;
                                for(cnt=nrInXML; cnt<=nrInForm-1; cnt++) {        // create more filerefs in the XML
                                    if ($(itm1).find(itm2.formname)[cnt].value !== "") {
                                        tempdata = tempXmlDoc.createElement(itm2.xmlname);
                                        $(xmlObject.find(itm2.xmlpath)[idx1]).find(itm2.listelem)[0].appendChild(tempdata);
                                    }
                                }
                                $.each($(tempvar).find(itm2.xmlname), function(idx3,itm3) {  // loop fileref
                                    itm3.setAttribute(itm2.listattr,$(itm1).find(itm2.formname)[idx3].value,itm2.cdata);
                                });
                            } catch(err) { setErrorMessage("mapListOfChildElems: missing: "+itm2.xmlpath+idx1+itm2.xmlname, err);}
                        }
                    }
                });
            });
        }
    });

    var tempvals = $("#xml_programming-language").val().split("/");
    try {                                                           // deal with proglang
        xmlObject.find("proglang")[0].setAttribute("version",tempvals[1]);
        xmlObject.find("proglang")[0].textContent = tempvals[0];
    } catch(err) { setErrorMessage("missing: proglang", err);}
    if (config.xsdSchemaFile === version101) {
        if ($("#xml_uuid").val() == ''){
            xmlObject.find('task').attr('uuid',generateUUID());
        } else {
            xmlObject.find('task').attr('uuid',$("#xml_uuid").val());
        }
    }
    try {
        var xmlString = (new XMLSerializer()).serializeToString(xmlDoc);
        var replacer = new RegExp('xmlns.*? ',"g");                  // remove all namespace declarations
        xmlString = xmlString.replace(replacer, "");
        replacer = new RegExp('<task ',"g");                         // insert correct namespace declaration
        xmlString = xmlString.replace(replacer, "<task "+xsdNamespace.namespace);
        // remove file refs in those tests that do not use them
        // (more a hack...)
        $.each(config.testInfos, function(index, testinfo) {
            if (!testinfo.withFileRef) {
                replacer =
                    new RegExp(testinfo.testType + '</test-type><test-configuration><filerefs><fileref refid=""/></filerefs>',"g");
                xmlString = xmlString.replace(replacer, testinfo.testType + "</test-type><test-configuration>");
            }
        })
        if ((xmlString.substring(0, 5) != "<?xml")){
            xmlString = "<?xml version='1.0' encoding='UTF-8'?>" + xmlString;
        }
        taskXml = xmlString;
        // $("#output").val(xmlString);
/*
        $.get(xsdSchemaFile, function(data, textStatus, jqXHR) {      // read XSD schema
            var valid = xmllint.validateXML({xml: xmlString, schema: jqXHR.responseText});
            if (valid.errors !== null) {                                // does not conform to schema
                setErrorMessage(valid.errors[0]);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            setErrorMessage("XSD-Schema " + xsdSchemaFile + " not found.");
        });
*/
        $.each(config.xsds, function(index, xsd_file) {       // loop: xsd files for validation
            $.get(xsd_file, function(data, textStatus, jqXHR) {      // read XSD schema
                const valid = xmllint.validateXML({xml: xmlString, schema: jqXHR.responseText});
                if (valid.errors !== null) {                                // does not conform to schema
                    setErrorMessage("Errors in XSD-Validation: " + valid.errors[0]);
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                setErrorMessage("XSD-Schema " + xsd_file + " not found.", errorThrown);
            });
        });

    } catch(err) { setErrorMessage("Problem with the XML serialisation.", err);}

    config.createFurtherOutput(tempvals[0]);
/*
    if (useLoncapa) {                                      // only if LON-CAPA is being used
        if (xsdSchemaFile == version101) {
            createLONCAPAOutput(tempvals[0],codemirror,"101");
        } else {
            createLONCAPAOutput(tempvals[0],codemirror,"old");
        }
    }
*/

    const t1 = performance.now();
    console.log("Call to convertToXML took " + (t1 - t0) + " milliseconds.")

    success = true;
};


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
    var proglangSplit = proglangAndVersion.split("/");

    task.proglang = proglangSplit[0]; // proglangAndVersion.substr(0, proglangAndVersion.indexOf("/"));
    task.proglangVersion = proglangSplit[1]; // proglangAndVersion.substr(proglangAndVersion.indexOf("/")+1);
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
    $("#xml_programming-language").val(task.proglang + '/' + task.proglangVersion);
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
    task.files.forEach(function(item, index) {
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