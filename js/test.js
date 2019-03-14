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
 * Author:
 * Karin Borm (Dr.Uta Priss)
 */

var testIDs = {};


class TestWrapper {
    static constructFromRoot(root) {
        let test = new TestWrapper();
        test._root = root;
        return test;
    }


    static constructFromId(id) {
        // this._id = id;
        let test = new TestWrapper();
        test._root = $("#test_" + id);
        if (test.root.length === 0)
            return undefined; // no element with id found
        return test;
    }


    getValue(member, xmlClass) {
        if (!member) {
            member = this.root.find(xmlClass).first();
        }
        return member.val();
    }

    // getter
    get root() { return this._root; }
    get id() { return this.getValue(this._id,".xml_test_id" ); }
    get title() { return this.getValue(this._id,".xml_test_title" ); }
    get comment() { return this.getValue(this._comment,".xml_internal_description"); }
    get description() { return this.getValue(this._description,".xml_description" ); }
    get testtype() { return this.getValue(this._type,".xml_test_type" ); }
    get weight() { return this.getValue(this._type,".xml_test_weight" ); }



    // setter
    set comment(newComment) { this._root.find(".xml_internal_description").val(newComment); }
    set description(newDescription) { this._root.find(".xml_description").val(newDescription); }
    set weight(newWeight) { this._root.find(".xml_test_weight").val(newWeight); }



    static doOnAll(callback) {
        // todo: iterate through all tests in variable
        $.each($(".xml_test_id"), function (indexOpt, item) {
            let test = TestWrapper.constructFromId(item.value);
            callback(test, indexOpt);
        });
    }

    delete() {
        // iterate through all referenced files and remove the references
        // => checks whether the file can be removed
        FileReferenceList.doOnAllElements(this.root, function(fileref_element) {
            let row = $(fileref_element).closest('tr');
            row.find('.remove_item').first().click();
        });

        delete testIDs[this.id];
        this.root.remove();
    }

    static delete(button) {
        let instance = TestWrapper.constructFromRoot(button.closest('.xml_test'));
        // remove instance
        instance.delete();
    }

//    static create(id, TestName, MoreText, TestType, WithFileRef) {
    // create a new test HTML form element
    static create(id, TestName, config, weight) {
        let theWeight =  config.gradingWeight;
        if (typeof weight !== 'undefined')
            theWeight = weight;

        let testid = id;
        if (!testid)
            testid = setcounter(testIDs);

        TestFileReference.getInstance().createTableString('TestFileReference', config.fileRefLabel,
            config.manadatoryFile, 'xml_fileref_table');
        $("#testsection").append("<div "+
            "id='test_" + testid + "'" +
            "class='ui-widget ui-widget-content ui-corner-all xml_test'>"+
            "<h3 class='ui-widget-header'>" + TestName + " (Test #"+testid+")<span "+
            "class='rightButton'><button onclick='TestWrapper.delete($(this));'>x</button></span></h3>"+

            "<p><label for='xml_test_id'>ID<span class='red'>*</span>: </label>"+
            "<input class='tinyinput xml_test_id' value='" + testid + "' readonly/>"+
            //    " <label for='xml_test_validity'>Validity: </label>"+
            //    "<input class='shortinput xml_test_validity'/>"+
            "<p><label for='xml_test_type'>Type: </label>"+
            "<select class='xml_test_type'>"+ testTypes + "</select>"+

            "</p>" +

            "<p><label for='xml_test_title'>Title<span class='red'>*</span>: </label>"+
            "<input class='maxinput xml_test_title' value='"+ TestName +"'/>" +
            "</p>"+
            getDescriptionHtmlString('', '') +

            config.htmlExtraFields +
            "<p>" + TestFileReference.getInstance().getTableString() + "</p>" +

            "<p><label>Grading Weight<span class='red'>*</span>:</label>"+
            "<input class='tinyinput xml_test_weight' value='"+ theWeight +"'/>" +
            "</p>"+

            "</div>");

        // hide fields that exist only for technical reasons
        var testroot = $(".xml_test_id[value='" + testid + "']").parent().parent();
        testroot.find(".xml_test_type").val(config.testType);
        let test = TestWrapper.constructFromRoot(testroot);

        FileReferenceList.init(null, null, TestFileReference, testroot);
        // TestFileReference.getInstance().init(testroot, DEBUG_MODE);

        if (!DEBUG_MODE) {
            testroot.find(".xml_test_type").hide();
            testroot.find("label[for='xml_test_type']").hide();
            testroot.find(".xml_test_id").hide();
            testroot.find("label[for='xml_test_id']").hide();
        }
        if (!config.withFileRef) {
            testroot.find("table").hide();
            testroot.find(".drop_zone").hide();
        }
        else
        {
            // TODO: disable drag & drop!
            /*
                    testroot.on({
                        drop: function(e){
                            if(e.originalEvent.dataTransfer){
                                if(e.originalEvent.dataTransfer.files.length) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    //UPLOAD FILES HERE
                                    FileReferenceList.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                                        TestFileReference.getInstance());
                                }
                            }
                        }
                    });
            */
        }

        return test;
    };

}