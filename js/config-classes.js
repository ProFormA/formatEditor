//TODO:
// 2. test button name automatisch generieren
// 3. test template name automatisch generieren

// classes
function TestInfo(title, area, testType, template1, template2, withFileRef, onButtonClicked) {
    this.title = title; // title in html output
    this.testArea = area; // html extra elements
    this.testType = testType;
    this.xmlTemplate1 = template1;
    this.xmlTemplate2 = template2;
    this.withFileRef = withFileRef;
    if (withFileRef == null)
        this.withFileRef = true; // use filerefs
    this.onCreated = onButtonClicked;

    var compactName = title.replace(/ /g, "");
    console.log(compactName);
    this.xmlTemplateName = compactName;
    this.buttonJQueryId = "add" + compactName;

}

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