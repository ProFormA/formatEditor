class ModelSolutionWrapper {

    static constructFromRoot(root) {
        let ms = new ModelSolutionWrapper();
        ms._root = root;
        return ms;
    }

    static constructFromId(id) {
        // this._id = id;
        let ms = new ModelSolutionWrapper();
        ms._root = $(".xml_model-solution_id[value='" + id + "']").closest(".xml_model-solution");
        if (ms.root.length === 0)
            return undefined; // no element with id found
        return ms;
    }

    getValue(member, xmlClass) {
        if (!member) {
            member = this.root.find(xmlClass).first();
        }
        return member.val();
    }

    // getter
    get root() { return this._root; }
    get id() { return this.getValue(this._id,".xml_model-solution_id" ); }
    get comment() { return this.getValue(this._type,".xml_internal_description" /*".xml_model-solution_comment"*/ ); }
    get description() { return this.getValue(this._type,".xml_description" ); }

    // setter
    set comment(newComment) {
        this._root.find("xml_internal_description" /*".xml_model-solution_comment"*/).val(newComment);
    }
    set description(newDescription) { this._root.find(".xml_description").val(newDescription); }


    static doOnAll(callback) {
        // todo: iterate through all modelsolutions in variable
        $.each($(".xml_model-solution_id"), function (indexOpt, item) {
            let modelsolution = ModelSolutionWrapper.constructFromId(item.value);
            callback(modelsolution);
        });
    }

    static create(id, description, comment) {
        if (!comment)
            comment = '';
        if (!description)
            description = '';

        let modelsolid = id;
        if (!modelsolid) {
            modelsolid = setcounter(modelSolIDs);    // adding a file for the test
        } else {
            // this means that it is created with a known id
            // (from reading task.xml). So we nned to keep the modelSolIDs in sync!
            modelSolIDs[modelsolid] = 1;
        }


        $("#modelsolutionsection").append("<div " +
            "id='modelsolution_" + modelsolid + "'" +
            "class='ui-widget ui-widget-content ui-corner-all xml_model-solution'>" +
            "<h3 class='ui-widget-header'>Model solution #" + modelsolid + "<span " +
            "class='rightButton'><button onclick='remP3($(this));deletecounter(modelSolIDs,$(this));'>x</button></span></h3>" +
            "<p><label for='xml_model-solution_id'>ID<span class='red'>*</span>: </label>" +
            "<input class='tinyinput xml_model-solution_id' value='" + modelsolid + "' readonly/>" +

            getDescriptionHtmlString(description, comment) +
//            "<p><label for='xml_description'>Description: </label>" +
//            "<input class='largeinput xml_description' value ='" + description + "'/></p>" +

//            "<p><label for='xml_model-solution_comment'>Internal Description: </label>" +
//            "<input class='largeinput xml_model-solution_comment' value ='" + comment + "'/></p>" +

            "<p>" +
            ModelSolutionFileReference.getInstance().getTableString() +
            "</p>" +

            "</div>");

        const msroot = $(".xml_model-solution_id[value='" + modelsolid + "']").parent().parent();
        FileReferenceList.init(null, null, ModelSolutionFileReference, msroot);
        let modelsolution = ModelSolutionWrapper.constructFromRoot(msroot);

        // ModelSolutionFileReference.getInstance().init(msroot, DEBUG_MODE);

        if (!DEBUG_MODE) {
            // hide fields that exist only for technical reasons
            msroot.find(".xml_model-solution_id").hide();
            msroot.find("label[for='xml_model-solution_id']").hide();
        }
        /*
              msroot.on({
                  drop: function(e){
                      if(e.originalEvent.dataTransfer){
                          if(e.originalEvent.dataTransfer.files.length) {
                              e.preventDefault();
                              e.stopPropagation();
                              //UPLOAD FILES HERE
                              FileReferenceList.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget,
                                  ModelSolutionFileReference.getInstance());
                              // ModelSolutionFileReference.uploadFiles(e.originalEvent.dataTransfer.files, e.currentTarget);
                          }
                      }
                  }
              });
              */

        return modelsolution;
    }
}