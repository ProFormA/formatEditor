/**
 * Created by karin on 01.06.2017.
 */

/*
var version094;                                        // names of the xsd schema files
var version101;
var xsdSchemaFile;                                     // choose version

if (version094 === undefined || version094 === null) { version094 = 'taskxml0.9.4.xsd'; }
if (version101 === undefined || version101 === null) { version101 = 'taskxml1.0.1.xsd'; }
if (xsdSchemaFile === undefined || xsdSchemaFile === null) { xsdSchemaFile = version094; }
*/
/*
const pfix_unit = "unit";                                // fixing namespace prefixes because of
const pfix_jart = "jartest";                             // browser compatibility and jquery limitations
const pfix_prak = "praktomat";
*/

/*
if (xsdSchemaFile == version094) {
    var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:unittest" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.1" ' +
        'xmlns="urn:proforma:task:v0.9.4" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
} else {
    var namespace = 'xmlns:'+pfix_unit+'="urn:proforma:tests:unittest:v1" xmlns:'+pfix_prak+'="urn:proforma:praktomat:v0.2" '
        + 'xmlns="urn:proforma:task:v1.0.1" xmlns:'+pfix_jart+'="urn:proforma:tests:jartest:v1" ';
}
*/

//var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+


///////////////////////////////////////////////////////// mapping HTML form names and XML names
/* This creates the main data structure for the program.
 * It consists of arrays of elements.
 * Each element shows the relationshop between XML names and form names.
 * The arrays sort the elements depending on how deep they are in the XML file.
 * The arrays can be looped through in order to process the XML file.
 */
function createMapping(schemaversion) {                // note: the maps are global variables
/*
    if (usePraktomat) { var ns_praktomat = ""; }
    var ns_unit = "";
    if (isFirefox) {
        if (usePraktomat) { var ns_praktomat = pfix_prak + "\\:"; }
        var ns_unit = pfix_unit + "\\:";
        var ns_jartest = pfix_jart + "\\:";
    }
*/
    mapSingleElements = [                                // single XML elements
        new ValMap("#xml_description","description","",1),
        new ValMap("#xml_meta-data_title","meta-data > title","",0),
        new ValMap("#xml_grading-hints_text","grading-hints","",0)
    ];

    // moved to config.js
    /*
    if (schemaversion == version094 && usePraktomat) {
        mapSingleElements[3] =  new ValMap("#xml_upload-mime-type",ns_praktomat+"allowed-upload-filename-mimetypes","",0);
    }
    */
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
        // new ValMap(".xml_ju_mainclass",ns_unit+"main-class","test-configuration",0,".xml_test"),
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
/*
        new ValMap(".xml_ju_framew","framework",ns_unit+"unittest",0,".xml_test","test"),
        new ValMap(".xml_ju_version","version",ns_unit+"unittest",0,".xml_test","test"),
        new ValMap(".xml_jt_framew","framework",ns_jartest+"jartest",0,".xml_test","test"),
        new ValMap(".xml_jt_version","version",ns_jartest+"jartest",0,".xml_test","test")
*/
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
convertToXML = function() {
    $("#output").val(""); // empty output so that the old output will not be used in future
    convertFormToXML = function(one,two,cdataBool) {
        var xmlDoc = $.parseXML('<task></task>');
        one.textContent = "";                              // delete previous content
        if (two) {                                         // check whether replacement value exists
            if (cdataBool == 1) {
                var tempCdata = xmlDoc.createCDATASection(two);
                one.appendChild(tempCdata);
            } else {
                one.textContent = two;
            }
        }
    };
    clearErrorMessage();
    createMapping(xsdSchemaFile);
    var returntemp = createXMLTemplate(xsdSchemaFile);
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
                                    if (useCodemirror) {
                                        //convertFormToXML(xmlObject.find(item.xmlname)[idx1],codemirror[idx1+1].getValue(),itm2.cdata);
                                        var text = codemirror[$(itm1).find('.xml_file_id').val()].getValue();
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
                    if (typeof $(itm1).find(itm2.formname).val() != "undefined") {    // it exists in the form
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
                                    $(itm1).find(itm2.formname).val(),itm2.cdata);
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
    } catch(err) { setErrorMessage("missing: proglang");}
    if (xsdSchemaFile == version101) {
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
        replacer =                                                   // ToDo: this is a hack, set filerefs properly
            new RegExp(xmlTesttypeJavaComp + '</test-type><test-configuration><filerefs><fileref refid=""/></filerefs>',"g");
        xmlString = xmlString.replace(replacer, xmlTesttypeJavaComp + "</test-type><test-configuration>");
        if ((xmlString.substring(0, 5) != "<?xml")){
            xmlString = "<?xml version='1.0' encoding='UTF-8'?>" + xmlString;
        }
        $("#output").val(xmlString);
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

    } catch(err) { setErrorMessage("Problem with the XML serialisation.");}

    config.createFurtherOutput(tempvals);
/*
    if (useLoncapa) {                                      // only if LON-CAPA is being used
        if (xsdSchemaFile == version101) {
            createLONCAPAOutput(tempvals[0],codemirror,"101");
        } else {
            createLONCAPAOutput(tempvals[0],codemirror,"old");
        }
    }
*/
    success = true;
};


/* This converts an XML file into form elements.
 * First, it does some initialisation and validation.
 * Then it loops through the data structure that was created for the XML file.
 * It deletes most of the form and wipes the counter variables before it recreates things.
 * Proglang is dealt with separately.
 */

readXML = function(xmlText) {
    changeNamespaces = function(somexml) {
        replaceNamespace = function(smxml,tempstr,tempnsprefix,tempcl) {
            if (tempstr) { tempstr = tempstr[1] }
            if (tempstr != tempnsprefix) {
                var replacer = new RegExp('<'+tempstr+':',"g");
                smxml = smxml.replace(replacer,"<"+tempnsprefix+tempcl);    // rename start tags
                replacer = new RegExp('</'+tempstr+':',"g");
                smxml = smxml.replace(replacer,"</"+tempnsprefix+tempcl);   // rename end tags
                replacer = new RegExp('xmlns\\s*:'+tempstr);
                smxml = smxml.replace(replacer,"xmlns"+tempcl+tempnsprefix);   // change the declaration
            }
            return smxml;
        }
        var copysomexml = somexml;

        var tempreg = new RegExp("<(\\S*?):task\\s+");                     // is there a global prefix
        tempmatch = somexml.match(tempreg);
        somexml = replaceNamespace(somexml,tempmatch,"","");

        $.each(xsdNamespace.namespaceRE, function(index, item) {
            tempreg = new RegExp("xmlns:(\\S*?)=[\"']" + item[0]);   // unittests
            tempmatch = somexml.match(tempreg);
            somexml = replaceNamespace(somexml,tempmatch,item[1],":");

        })

/*
        tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:(tests:)?unittest");   // unittests
        tempmatch = somexml.match(tempreg);
        somexml = replaceNamespace(somexml,tempmatch,pfix_unit,":");

        tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:tests:jartest");       // jartests
        tempmatch = somexml.match(tempreg);
        somexml = replaceNamespace(somexml,tempmatch,pfix_jart,":");

        tempreg = new RegExp("xmlns:(\\S*?)=[\"']urn:proforma:praktomat");           // praktomat
        tempmatch = somexml.match(tempreg);
        somexml = replaceNamespace(somexml,tempmatch,pfix_prak,":");
*/
        if (somexml != copysomexml)
            console.log("geändert!");
        return somexml;
    }

    var outputValue = $("#output").val();
    if (outputValue.length > 0) {
        var checktemp = window.confirm("All form content will be deleted and replaced.");
        if (!checktemp) {
            return;
        }                         // proceed only after confirmation
    }
    gradingHintCounter = 1;                            // variable initialisation
    clearErrorMessage();
    /* codemirror = {};
    fileStorages = []; // empty array
    $("#filesection")[0].textContent = "";                     // delete previous content
    */

    FileStorage.deleteAllFiles();

    $("#modelsolutionsection")[0].textContent = "";
    $("#testsection")[0].textContent = "";

    // initialise other sections
    FileReference.init("#librarydropzone", '#librarysection', LibraryFileReference);
    FileReference.init("#instructiondropzone", '#instructionsection', InstructionFileReference);
    FileReference.init("#templatedropzone", '#templatesection', TemplateFileReference);
    const templateroot = $("#templatedropzone");
    const libroot = $("#librarydropzone");
    const instructionroot = $("#instructiondropzone");


    // fileIDs = {};
    modelSolIDs = {};
    testIDs = {};


    var xmlTemplate = xmlText; // copy text from variable if available
    if (xmlTemplate == undefined)
        xmlTemplate = outputValue;              // read textarea

    if (xmlTemplate !== "") {
        xmlTemplate = changeNamespaces(xmlTemplate);     // rename namespaces if necessary
        try {
            var xmlDoc = $.parseXML(xmlTemplate);          // parse its XML
        } catch (err){
            setErrorMessage("Error while parsing the xml file. The file has not been imported.". err);
            return;                                        // Stop. Do not make any further changes.
        }
        var xmlObject = $(xmlDoc);                       // convert it into a jQuery object
        var tempschema;                                  // create the data structure according to the version
        if (xmlObject.find('task').attr('xmlns') == "urn:proforma:task:v1.0.1") {
            tempschema = version101;
            createMapping(version101);
        } else {
            tempschema = version094;
            createMapping(version094);
        }
        $.get(tempschema, function(data, textStatus, jqXHR) {      // read XSD schema and validate
            var valid = xmllint.validateXML({xml: xmlTemplate, schema: jqXHR.responseText});
            if (valid.errors !== null) {                             // does not conform to schema?
                setErrorMessage("Validation of " + tempschema + ": " + valid.errors[0]);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            setErrorMessage("XSD-Schema " + tempschema + " not found.", errorThrown);
        });

        if (tempschema == xsdSchemaFile) {
            // current schema is used => validate all configured xsd files
            $.each(config.xsds, function(index, xsd_file) {       // loop: xsd files for validation
                $.get(xsd_file, function(data, textStatus, jqXHR) {      // read XSD schema and validate
                    var valid = xmllint.validateXML({xml: xmlTemplate, schema: jqXHR.responseText});
                    if (valid.errors !== null) {                             // does not conform to schema?
                        setErrorMessage("Validation of " + xsd_file + ": " + valid.errors[0]);
                    }
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    setErrorMessage("XSD-Schema " + xsd_file + " not found.", errorThrown);
                });
            });
        }

        $.each(mapSingleElements, function(index, item) {          // ToDo grading hints
            if (xmlObject.find(item.xmlname)[0]) {
                $(item.formname).val(xmlObject.find(item.xmlname)[0].textContent);}
        });
        $.each(mapSingleAttrs, function(index, item) {
            if (xmlObject.find(item.xmlpath)[0]) {
                $(item.formname).val(xmlObject.find(item.xmlpath)[0].getAttribute(item.xmlname));
                if ($(item.formname).val() === null) {                 // check if selected element exists
                    setErrorMessage("'"+xmlObject.find(item.xmlpath)[0].getAttribute(item.xmlname)+"' is not an option for "+item.xmlname);
                }
            }
        });


        $.each(mapElemSequence, function(index, item) {
            idx1cnt = 0;                                                 // differs from idx1 if wrong test-type
            xmlObject.find(item.xmlname).each(function (idx1, itm1) {    // loop: file, test, ...
                if (item.xmlpath == "files") {
                    newFile($(itm1).attr("id"));
                    fileIDs[$(itm1).attr("id")] = 1;
                }
                if (item.xmlpath == "model-solutions") {
                    newModelsol($(itm1).attr("id"));
                    modelSolIDs[$(itm1).attr("id")];
                }
                if (item.xmlpath == "tests") {
                    testIDs[$(itm1).attr("id")] = 1;

                    found = false;
                    $.each(config.testInfos, function(index, item) {
                        if (!found && $(itm1).find('test-type')[0].textContent == item.testType) {
                            newTest($(itm1).attr("id"), item.title, item.htmlExtraFields, item.testType, item.withFileRef);
                            found = true;
                        }
                    });
                    if (!found) {
                        setErrorMessage("Test "+$(itm1).find('test-type')[0].textContent+" not imported");
                        testIDs[$(itm1).attr("id")] = 0;
                        return true;                                        // next iteration because wrong test-type
                    }
                }
                $.each(mapTextInElemSequence, function(idx2, itm2) {
                    if (item.xmlname == itm2.xmlname) {                      // relational join
                        try {                                                  // deal with codemirror for file textarea
                            if ((itm2.formname == '.xml_file_text') && (useCodemirror)) {
                                codemirror[$(itm1).attr('id')].setValue(itm1.textContent);
                            } else {
                                $($(item.formname)[idx1cnt]).find('textarea')[0].textContent = itm1.textContent;
                            }
                        } catch(err) { setErrorMessage("problem with: "+item.xmlname+idx1+itm1);}
                    }
                });
                $.each(mapAttrInSequence, function(idx2, itm2) {          // loop: attributes
                    if (item.xmlname == itm2.xmlpath) {                    // only relevant attributes
                        try {
                            $($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                                xmlObject.find(itm2.xmlpath)[idx1].getAttribute(itm2.xmlname);
                        } catch(err) {setErrorMessage("problem with "+itm2.formname+idx1);}
                    }
                });
                $.each(mapAttrOfTestElems, function(idx2, itm2) {         // loop: framework and version
                    if ($(itm1).find(itm2.xmlpath).length > 0) {           // is it defined in this case?
                        try {
                            //$($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                            //$(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname);
                            const ui_element = $($($(item.formname)[idx1cnt]).find(itm2.formname)[0]);
                            const ui_value = $(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname);
                            // set value in option list
                            //$($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val($(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname));
                            ui_element.val(ui_value);
                            // check if value is actually set, if not it is not a valid option
                            //if ($($($(item.formname)[idx1cnt]).find(itm2.formname)[0]).val() === null) { // check selected
                            if (ui_element.val() === null) { // check selected
                                setErrorMessageInvalidOption(itm2.xmlpath, itm2.xmlname, ui_value);
                                //setErrorMessage("'"+$(itm1).find(itm2.xmlpath)[0].getAttribute(itm2.xmlname)+"' is not an option for "+itm2.xmlname);
                            }
                        } catch(err) {setErrorMessage("problem with "+itm2.formname+idx1);}
                    }
                });
                $.each(mapChildElems, function(idx2, itm2) {              // loop: test-title, ...
                    if ($(itm1).find(itm2.xmlname).length > 0) {           // is it defined in this case?
                        try {
                            //$($(item.formname)[idx1cnt]).find(itm2.formname)[0].value=
                            //    $(itm1).find(itm2.xmlname)[0].textContent;
                            const ui_element = $($($(item.formname)[idx1cnt]).find(itm2.formname)[0]);
                            const ui_value = $(itm1).find(itm2.xmlname)[0].textContent;
                            ui_element.val(ui_value);
                            if (ui_element.val() === null) {   // check selected
                                setErrorMessageInvalidOption(itm2.xmlpath, itm2.xmlname, ui_value);
                                //setErrorMessage("'"+ui_value+"' is not an option for "+itm2.xmlname);
                            }
                        } catch(err) {setErrorMessage( "problem with "+itm2.formname+idx1);}
                    }
                });

                $.each(mapListOfChildElems, function(idx2, itm2) {        // loop: fileref (and filenames)
                    if ($(itm1).find(itm2.xmlname).length > 0 && item.formname == itm2.formcontainer) {
                        try {
                            // retrieve filename from fileid
                            var itm1_itm2_xmlname = $(itm1).find(itm2.xmlname);

                            $.each(itm1_itm2_xmlname, function(index, refid_tag) {
                                var fileid = refid_tag.getAttribute(itm2.listattr);
                                var fileid_obj = $("#filesection").find(".xml_file_id[value='"+ fileid +"']");
                                var filename = fileid_obj.parent().find(".xml_file_filename").val();

                                if ("" == fileid && !filename && version094 == tempschema ) {
                                    // accept empty fileids in version 0.9.4 and ignore
                                    return false;
                                }
                                // set filename in item
                                var object = $($(item.formname)[idx1cnt]);
                                switch (item.formname) {
                                    case "." + TestFileReference.getClassRoot():
                                        TestFileReference.getInstance().setFilenameOnCreation(object, index, filename, itm2); break;
                                    case "." + ModelSolutionFileReference.getClassRoot():
                                        ModelSolutionFileReference.getInstance().setFilenameOnCreation(object, index, filename, itm2); break;
                                    default:
                                        alert('invalid item.formname ' + item.formname);
                                        break;
                                }
                                // TODO: what is itm2?
                                object.find(itm2.formname)[index].value = fileid;
/*
                                if (item.formname == ".xml_test") {
                                    // set filename in test
                                    if (index > 0) {
                                        TestFileReference.addFileRef(object.find(".add_file_ref_test").first());
                                    }
                                    var element = object.find(".xml_test_filename");
                                    updateFilenameList(element.eq(index));
                                    element.eq(index).val(filename).change();
                                    object.find(itm2.formname)[index].value = fileid;
                                } else if (item.formname == ".xml_model-solution") {
                                    // set filename in model solution
                                    if (index > 0) {
                                        ModelSolutionFileReference.addFileRef(object.find(".add_file_ref_ms").first());
                                    }
                                    var element = object.find(".xml_model-solution_filename");
                                    updateFilenameList(element.eq(index));
                                    element.eq(index).val(filename).change();
                                    object.find(itm2.formname)[index].value = fileid;
                                } */
                            });
                        } catch(err) {setErrorMessage( "problem with reading filerefs", err);}
                    }
                });

                idx1cnt++;
            });
        });

        // post processing

        // copy description into CodeMirror element
        descriptionEditor.setValue($("#xml_description").val());

        // special handling for template, library and instruction file class:
        // add dummy file references
        var indexTemplate = 0;
        var indexInstruction = 0;
        var indexLib = 0;
        // var templateroot = $("#templatedropzone");
        // var instructionroot = $("#instructiondropzone");
        xmlObject.find('file').each(function (index, element) {    // iterate through all files
            console.log(index + ' ' + element);
            var fileid = element.getAttribute('id');
            var filename = element.getAttribute('filename');
            switch(element.getAttribute('class')) {
                case 'template':
                    TemplateFileReference.getInstance().setFilenameOnCreation(templateroot, indexTemplate++, filename);
                    break;
                case 'instruction':
                    InstructionFileReference.getInstance().setFilenameOnCreation(instructionroot, indexInstruction++, filename);
                    break;
                case 'library':
                    LibraryFileReference.getInstance().setFilenameOnCreation(libroot, indexLib++, filename);
                    break;
                default:
                    break;
            }
        });


        // deal with proglang
        if (xmlObject.find("proglang")[0]) {
            const tempvals1 = xmlObject.find("proglang")[0].getAttribute("version");
            const tempvals0 = xmlObject.find("proglang")[0].textContent;
            $("#xml_programming-language").val(tempvals0+"/"+tempvals1);
            if ($("#xml_programming-language").val() === null) {
                setErrorMessage("This combination of programming language and version is not supported.");
            }
        }

        // show filenames in filename headers
        $.each($(".xml_file_filename"), function(index, item) {
            if (item.value.length > 0) {
                let filebox = $(item).closest(".xml_file");
                let filenameheader = filebox.find(".xml_filename_header").first();
                filenameheader.text(item.value);
            }
        });

        // fill filename lists in empty file refences
        FileReference.updateAllFilenameLists();

    } else {                                           // end: if there is xml content provided
        setErrorMessage("The textarea is empty.");
    }
};
