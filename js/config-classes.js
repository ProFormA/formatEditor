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

// classes

class CustomTest {

    constructor(title, testType, extraFields) {
        this.title = title; // title in html output
        this.testType = testType; // test type in XML
        this.htmlExtraFields = extraFields; // html extra input elements

        this.withFileRef = true; // default: with test script(s)

        // derived member variables
        const compactName = title.replace(/ /g, "");
        this.xmlTemplateName = compactName;
        this.buttonJQueryId = "add" + compactName;
    }

    // override
    onCreate(testId) {}
    onReadXml(test, xmlReader, testConfigNode, testroot) {}
    onWriteXml(test, uiElement, testConfigNode, xmlDoc, xmlWriter) {}
}


/**
 * Container for test data in configuration
 *
 * @param title: test title
 * @param extraFields: extra fields in user interface
 * @param testType: test type
 * @param withFileRef: show file reefrences (true/false)
 * @param readXml: function for reading xml
 * @param writeXml: function for writing xml
 * @param onButtonClicked: callback for test creation
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
    this.name  = name;
    this.tests = tests;
}


// -------------------------------------------------------------


// helper function for custom test configuration
createFileWithContent = function(filename, content) {
    let ui_file = newFile();
    ui_file.filename = filename;
    ui_file.text = content;
    // onFilenameChanged(ui_file);
    return ui_file.id;
}

addFileReferenceToTest = function(testId, filename) {
    var xml_test_root = $(".xml_test_id[value='"+testId+"']").parent().parent();
    var element = xml_test_root.find(".xml_test_filename").last();
    element.val(filename).change();
};

getTestField = function(testId, fieldClass) {
    var xml_test_root = $(".xml_test_id[value='"+testId+"']").parent().parent();
    return xml_test_root.parent().find(fieldClass).first();
}
