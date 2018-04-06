# coding=utf-8

import editor
import time
import editor
import zipFileTest

title = "fileUsage"
expectedZipName = title + ".zip"


class JavaTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup CTest"
        zipFileTest.ZipFileTest.setUp(self, 'c', 'fileUsage')
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
        # fill filesize
        editor.set_filesize("3333")
        # fill MimeType
        editor.set_mimetype("text/TEST")
        # LON-CAPA path
        editor.set_LON_CAPA_path("input4444/")
        # fill language
        editor.set_language("en")
        # fill programming language
        editor.set_prog_language("c")

        ####################################################################
        # fill FILES
        ####################################################################

        # create 13 files
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()


        # fill filename
        editor.set_filename(0, "file0.c")
        editor.set_filename(1, "file1.c")
        editor.set_filename(2, "file2.c")
        editor.set_filename(3, "file3.c")
        editor.set_filename(4, "file4.c")
        editor.set_filename(5, "file5.c")
        editor.set_filename(6, "file6.c")
        editor.set_filename(7, "file7.c")
        editor.set_filename(8, "file8.c")
        editor.set_filename(9, "file9.c")
        editor.set_filename(10, "file10.c")
        editor.set_filename(11, "file11.c")
        editor.set_filename(12, "file12.c")


        # set file usage:
        # set template: 1, 2, 3
        # set instruction: 4, 5
        # set library: 6, 7
        # set ms: 8
        # set test1: 9
        # set test2: 10, 12
        # set test3: 11, 12

        editor.set_template_filename("file1.c", 0)
        editor.add_template_file()
        editor.set_template_filename("file2.c", 1)
        editor.add_template_file()
        editor.set_template_filename("file3.c", 2)

        editor.set_instruction_filename("file4.c", 0)
        editor.add_instruction_file()
        editor.set_instruction_filename("file5.c", 1)

        editor.set_library_filename("file6.c", 0)
        editor.add_library_file()
        editor.set_library_filename("file7.c", 1)

        editor.set_ms_filename("file8.c", 0)

        editor.add_dejagnu_tester()
        editor.add_dejagnu_tester()
        editor.add_dejagnu_tester()

        editor.set_test_filename("file9.c", 0)

        editor.set_test_filename("file10.c", 1)
        editor.add_test_file(1)
        editor.set_test_filename("file12.c", 2) # 2!!

        editor.set_test_filename("file11.c", 3) # 3!!
        editor.add_test_file(2)
        editor.set_test_filename("file12.c", 4) # 4!!

        # check precondition
        self.assertTrue('file1.c' == editor.get_template_file(0))
        self.assertTrue('file2.c' == editor.get_template_file(1))
        self.assertTrue('file3.c' == editor.get_template_file(2))
        self.assertTrue('template' == editor.get_file_usage('file1.c'))
        self.assertTrue('template' == editor.get_file_usage('file2.c'))
        self.assertTrue('template' == editor.get_file_usage('file3.c'))

        self.assertTrue('file4.c' ==  editor.get_instruction_file(0))
        self.assertTrue('file5.c' ==  editor.get_instruction_file(1))
        self.assertTrue('instruction' == editor.get_file_usage('file4.c'))
        self.assertTrue('instruction' == editor.get_file_usage('file5.c'))

        self.assertTrue('file6.c' == editor.get_library_file(0))
        self.assertTrue('file7.c' == editor.get_library_file(1))
        self.assertTrue('library' == editor.get_file_usage('file6.c'))
        self.assertTrue('library' == editor.get_file_usage('file7.c'))


        self.assertTrue('file8.c' == editor.get_ms_file(0))
        self.assertTrue('internal' ==  editor.get_file_usage('file8.c'))

        self.assertTrue('file9.c' == editor.get_test_file(0))
        self.assertTrue('internal' == editor.get_file_usage('file9.c'))

        self.assertTrue('file10.c' == editor.get_test_file(1))
        self.assertTrue('file12.c' == editor.get_test_file(2))
        self.assertTrue('internal' ==  editor.get_file_usage('file10.c'))
        self.assertTrue('internal' == editor.get_file_usage('file12.c'))


        self.assertTrue('file11.c' == editor.get_test_file(3))
        self.assertTrue('file12.c' == editor.get_test_file(4))
        self.assertTrue('internal' == editor.get_file_usage('file11.c'))
        self.assertTrue('internal' == editor.get_file_usage('file12.c'))
        # self.assertTrue('internal-library' == editor.get_file_usage('file12.c'))

        # actions

        # file1.c: template -> library
        # => old template field will be removed!!
        editor.set_library_filename("file1.c", 0)
        alert = editor.driver.switch_to.alert
        alert.accept()

        self.assertTrue('library' == editor.get_file_usage('file1.c'))
        #print 'empty field: "' + editor.get_template_file(0) + '"'
        #self.assertTrue('' == editor.get_template_file(0))
        self.assertTrue('file1.c' == editor.get_library_file(0))
        self.assertTrue('file7.c' == editor.get_library_file(1))
        self.assertTrue('file2.c' == editor.get_template_file(0)) # index -1
        self.assertTrue('file3.c' == editor.get_template_file(1)) # index -1
        self.assertTrue('template' == editor.get_file_usage('file2.c'))
        self.assertTrue('template' == editor.get_file_usage('file3.c'))

        # todo??
        # test/instruction, test/test, test/model-solution(?), template/library, template/test/test


        # delete template 3
        # => file3.c will be deleted
        indexFile3 = 1
        # check for correct index
        self.assertTrue('file3.c' == editor.get_template_file(indexFile3))
        editor.delete_template(indexFile3)

        self.assertTrue('file2.c' == editor.get_template_file(0)) # still there
        try:
            editor.get_file_usage('file3.c')
            self.assertTrue(False, 'file3.c still exists')
        except:
            pass


        # add file11.c to library
        # => file usage = library
        self.assertTrue('internal' == editor.get_file_usage('file11.c'))
        indexLib = 2
        editor.add_library_file()
        editor.set_library_filename("file11.c", indexLib)
        self.assertTrue('library' == editor.get_file_usage('file11.c'))

        # delete 11 bei library
        # => file usage = internal
        self.assertTrue('file11.c' == editor.get_library_file(indexLib))
        editor.delete_library(indexLib)
        self.assertTrue('internal' == editor.get_file_usage('file11.c'))




        # zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)



