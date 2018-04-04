
// classes
/**
 * Container for test data in configuration
 *
 * @param title
 * @param extraFields
 * @param testType
 * @param template1
 * @param template2
 * @param withFileRef
 * @param onButtonClicked
 * @constructor
 */
function TestInfo(title, extraFields, testType, template1, template2, withFileRef, onButtonClicked) {
    this.title = title; // title in html output
    this.htmlExtraFields = extraFields; // html extra input elements
    // XML
    this.testType = testType; // test type in XML
    this.xmlTemplate1 = template1; // XML template for new sub elements of test-meta-data
    this.xmlTemplate2 = template2; // XML template for new elements(s) between
        // filerefs and test-meta-data
    this.withFileRef = withFileRef; // has tests asscociated files?
    if (withFileRef == null)
        this.withFileRef = true; // use filerefs
    // editor
    this.onCreated = onButtonClicked; // extra function for button clicked callback

    // derived member variables
    var compactName = title.replace(/ /g, "");
    this.xmlTemplateName = compactName;
    this.buttonJQueryId = "add" + compactName;
}

/**
 * information about programming language
 *
 * @param name
 * @param tests
 * @constructor
 */
function ProglangInfo(name, tests) {
    this.name   = name;
    this.tests = tests;
}


function ValMap(fname,xname,pname,cdata,fcont,lelem,lattr) {
    this.formname = fname; // name in formular
    this.xmlname = xname;  // element or attribute name in task.xml
    this.xmlpath = pname;  // parent element in task.xml
    this.cdata = cdata;    // create as CDATA in task.xml (bool)
    this.formcontainer = fcont;  // ToDo: use this more ?
    this.listelem = lelem;       // only for mapSubElemListArray,  mapAttrOfTestElems
    this.listattr = lattr;       // only for mapSubElemListArray
}

function UiXmlMap(mappingType, valmap) {
    this.mappingType = mappingType;
    this.valmap = valmap;
}

const MapType = {
    SINGLE_ELEM: 0,
    SINGLE_ATTRIB: 1,
    ELEM_SEQ: 2,
    TEXT_ELEM_SEQ: 3,
    CHILD_ELEM: 4,
    LIST_CHILD_ELEM: 5,
    ATTR_IN_SEQ: 6,
    ATTR_TEST_ELEMS: 7
};