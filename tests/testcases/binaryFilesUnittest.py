# coding=utf-8

import editor
import time
import glob
import os
import testconfig

import editor
import zipFileTest

title = "binary"
expectedZipName = title + ".zip"


prog_lang = "java/1.8"




class BinaryFilesTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup BinaryTest"
        zipFileTest.ZipFileTest.setUp(self, 'java', 'binary')
        editor.delete_old_task_files(expectedZipName, self.output_folder)

        for fl in glob.glob(self.output_folder + "/instruction.zip"):
            os.remove(fl)
        for fl in glob.glob(self.output_folder + "/templates.zip"):
            os.remove(fl)
        for fl in glob.glob(self.output_folder + "/de/myproject/file0.java"):
            os.remove(fl)


    def checkForFilesInZip(self):
        # check if not-embedded files exist

        # check for instruction.zip in zip file
        # extractedFile = None
        # listing = glob.glob(self.output_folder + "/instruction.zip")
        # for filename in listing:
        #    extractedFile = filename
        #self.assertTrue(None != extractedFile, 'instruction.zip exists in zip file')

        # check for templates.zip in zip file
        #extractedFile = None
        #listing = glob.glob(self.output_folder + "/templates.zip")
        #for filename in listing:
        #    extractedFile = filename
        #self.assertTrue(None != extractedFile, 'templates.zip exists in zip file')

        # check for /de/myproject/file0.java in zip file
        #extractedFile = None
        #listing = glob.glob(self.output_folder + "/de/myproject/file0.java")
        #for filename in listing:
        #    extractedFile = filename
        #self.assertTrue(None != extractedFile, '/de/myproject/file0.java exists in zip file')

        import filecmp
        self.assertTrue(filecmp.cmp(self.output_folder + "/template.zip", "input/template.zip", 0))
        self.assertTrue(filecmp.cmp(self.output_folder + "/instruction.zip", "input/instruction.zip", 0))
        self.assertTrue(filecmp.cmp(self.output_folder + "/de/myproject/file0.java", "input/file0.java", 0))


        for fl in glob.glob(self.output_folder + "/instruction.zip"):
            os.remove(fl)
        for fl in glob.glob(self.output_folder + "/template.zip"):
            os.remove(fl)
        for fl in glob.glob(self.output_folder + "/de/myproject/file0.java"):
            os.remove(fl)




    def test_input(self):
        # I N P U T

        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description('binary files test')
        # fill title
        editor.set_task_title(title)
        # fill programming language
        editor.set_prog_language(prog_lang)

        # #############################################
        # fill FILES
        ####################################################################

        editor.add_file()

        # fill filename
        editor.set_filename(0, "de/myproject/file0.java")
        # fill file text
        editor.set_file_text(1, "// dummy file text 1")
        editor.set_file_type(0, "file")

        ####################################################################
        # fill MODEL SOLUTION
        ####################################################################

        editor.add_file_to_model_solution(0, 1)


        ####################################################################
        # Instruction FILES
        ####################################################################

        editor.load_instruction_file('input/instruction.txt', 0)
        editor.add_instruction_file()
        editor.load_instruction_file('input/instruction.zip', 1)

        ####################################################################
        # Template FILES
        ####################################################################

        editor.load_template_file('input/template.txt', 0)
        editor.add_template_file()
        editor.load_template_file('input/template.zip', 1)

        ####################################################################
        # add Java compiler test
        ####################################################################
        # test titles and filerefs use common class name :-(
        counter_test_index = 0

        # add 2 compiler tests
        # editor.add_java_compiler_test()

        editor.add_junit_test()

        # fill JUnit test #0
        # editor.set_junit_description(0, "junit description # 0")
        editor.load_test_file("input/MyStringTest.java", 0)
        # editor.set_test_file(counter_test_index, 1)
        # editor.set_junit_test_class(0, "reverse_task.MyStringTest_modified")
        # editor.set_junit_fileref2(counter_test_index, "1")

        counter_test_index = counter_test_index + 1


        # do not use compact test function in order to perform more
        # test
        ## zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, True)
        zipFileTest.ZipFileTest.saveZipFile(self, expectedZipName, True)

        self.checkForFilesInZip()

        zipFileTest.ZipFileTest.saveLonCapaFile(self, True)
        zipFileTest.ZipFileTest.reimportZipFile(self)
        zipFileTest.ZipFileTest.saveZipFile(self, expectedZipName, True)
        self.checkForFilesInZip()

        zipFileTest.ZipFileTest.saveLonCapaFile(self, True)

        # check for visible template and instruction filesD:\users\karin\Code\zell\git\formatEditor\tests\output\java\binary.zip

        self.assertTrue('instruction.txt', editor.get_instruction_file(0))
        self.assertTrue('instruction.zip', editor.get_instruction_file(1))
        self.assertTrue('template.txt', editor.get_template_file(0))
        self.assertTrue('template.zip', editor.get_template_file(1))


