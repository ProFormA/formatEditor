class TestWrapper {
    static constructFromRoot(root) {
        let test = new TestWrapper();
        test._root = root;
        return test;
    }


    static constructFromId(id) {
        // this._id = id;
        let test = new TestWrapper();
        test._root = $(".xml_test_id[value='" + id + "']").closest(".xml_test");
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
    get testtype() { return this.getValue(this._id,".xml_test_type" ); }



    static doOnAll(callback) {
        // todo: iterate through all modelsolutions in variable
        $.each($(".xml_test_id"), function (indexOpt, item) {
            let test = TestWrapper.constructFromId(item.value);
            callback(test);
        });
    }

    static create(tempcounter, TestName, MoreText, TestType, WithFileRef) {
    // create a new test HTML form element

        $("#testsection").append("<div "+
            "class='ui-widget ui-widget-content ui-corner-all xml_test'>"+
            "<h3 class='ui-widget-header'>" + TestName + " (Test #"+tempcounter+")<span "+
            "class='rightButton'><button onclick='remP3($(this));deletecounter(testIDs,$(this));'>x</button></span></h3>"+

            "<p><label for='xml_test_id'>ID<span class='red'>*</span>: </label>"+
            "<input class='tinyinput xml_test_id' value='" + tempcounter + "' readonly/>"+
            // TestFileReference.getInstance().getTableString() +
            // "<span class='drop_zone drop_zone_text'>Drop Your File(s) Here!</span>" +
            //"<br>" +
            //    " <label for='xml_test_validity'>Validity: </label>"+
            //    "<input class='shortinput xml_test_validity'/>"+
            "<p><label for='xml_test_type'>Type: </label>"+
            "<select class='xml_test_type'>"+ testTypes + "</select>"+

            /*        "<p><label for='xml_pr_public'>Public<span class='red'>*</span>: </label>"+
                    "<select class='xml_pr_public'>"+
                    "<option selected='selected'>True</option><option>False</option></select>"+

                    " <label for='xml_pr_required'>Required<span class='red'>*</span>: </label>"+
                    "<select class='xml_pr_required'>"+
                    "<option selected='selected'>True</option><option>False</option></select>"+
            */
            " <label for='xml_pr_always'>Always: </label>"+
            "<select class='xml_pr_always'>"+
            "<option selected='selected'>True</option><option>False</option></select>" +
            "</p>" +

            "<p><label for='xml_test_title'>Title<span class='red'>*</span>: </label>"+
            "<input class='mediuminput xml_test_title' value='"+ TestName +"'/>" +
            //"<p>" +
            " Public:<input type='checkbox' class='xml_pr_public' checked title='results are shown to the students'>" +
            " Required:<input type='checkbox' class='xml_pr_required' checked title='test must be passed in order to pass the task'></p>" +
            //"</p>" +

            "</p>"+

            MoreText +
            "<p>" + TestFileReference.getInstance().getTableString() + "</p>" +

            "</div>");

        // hide fields that exist only for technical reasons
        var testroot = $(".xml_test_id[value='" + tempcounter + "']").parent().parent();
        testroot.find(".xml_test_type").val(TestType);
        let test = TestWrapper.constructFromRoot(testroot);

        FileReferenceList.init(null, null, TestFileReference, testroot);
        // TestFileReference.getInstance().init(testroot, DEBUG_MODE);

        if (!DEBUG_MODE) {
            testroot.find(".xml_test_type").hide();
            testroot.find("label[for='xml_test_type']").hide();
            testroot.find(".xml_pr_always").hide();
            testroot.find("label[for='xml_pr_always']").hide();
            testroot.find(".xml_test_id").hide();
            testroot.find("label[for='xml_test_id']").hide();
        }
        if (!WithFileRef) {
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