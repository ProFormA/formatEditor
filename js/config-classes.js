
// classes
/**
 * Container for test data in configuration
 *
 * @param title
 * @param extraFields
 * @param testType
 * @param withFileRef
 * @param onButtonClicked
 * @constructor
 */
function TestInfo(title, extraFields, testType, withFileRef, readXml, writeXml, onButtonClicked) {
    this.title = title; // title in html output
    this.htmlExtraFields = extraFields; // html extra input elements
    // XML
    this.testType = testType; // test type in XML
    this.readXml = readXml;
    this.writeXml = writeXml;
        // filerefs and test-meta-data
    this.withFileRef = withFileRef; // has tests asscociated files?
    if (withFileRef == null)
        this.withFileRef = true; // use filerefs
    // editor
    this.onCreated = onButtonClicked; // extra function for button clicked callback

    // derived member variables
    const compactName = title.replace(/ /g, "");
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

