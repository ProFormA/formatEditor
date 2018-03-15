# coding=utf-8

import editor
import time



import editor
import zipFileTest

title = "base"
expectedZipName = title + ".zip"


prog_lang = "java/1.8"




class BaseFunctionalityTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup BaseTest"
        zipFileTest.ZipFileTest.setUp(self, 'java', 'base')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        # I N P U T

        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description("input111")
        # fill title
        editor.set_task_title(title)
        # fill programming language
        editor.set_prog_language(prog_lang)

        ####################################################################
        # fill FILES
        ####################################################################

        editor.add_file()

        # fill filename
        editor.set_filename(0, "file0.java")


        # fill file text
        # does not work yet
        editor.set_file_text(1, "// dummy file text 1")

        ####################################################################
        # fill MODEL SOLUTION
        ####################################################################

        editor.add_file_to_model_solution(0, 1)

        ####################################################################
        # add Java compiler test
        ####################################################################
        # test titles and filerefs use common class name :-(
        counter_test_index = 0


        # add 2 compiler tests
        editor.add_java_compiler_test()

        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)
        # zipFileTest.ZipFileTest.saveZipFile(self, expectedZipName)
        # zipFileTest.ZipFileTest.saveLonCapaFile(self)



