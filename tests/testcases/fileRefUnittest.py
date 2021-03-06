# coding=utf-8# coding=utf-8

# This is part of the ProFormA Editor
#
# This proformaEditor was created by the eCULT-Team of Ostfalia University
# http://ostfalia.de/cms/de/ecult/
# The software is distributed under a CC BY-SA 3.0 Creative Commons license
# https://creativecommons.org/licenses/by-sa/3.0/
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# test for file reference usage
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

import editor
import time
import editor
import zipFileTest

title = "fileUsage"
expectedZipName = title + ".zip"


class FileRefAndCTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup CTest")
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
        editor.set_restrict_filename(0, "Filename*", False, False)
        # LON-CAPA path
        # editor.set_LON_CAPA_path("input4444/")
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

        editor.set_code_skeleton("code skeleton")
        #editor.add_template_file()
        #editor.set_code_skeleton("file2.c", 1)
        #editor.add_template_file()
        #editor.set_code_skeleton("file3.c", 2)

        #editor.add_display_file()
#        editor.set_display_filename("file4.c", 0)
#        editor.add_display_file()
#        editor.set_display_filename("file5.c", 1)

        #editor.add_download_file()
        editor.set_download_filename("file6.c", 0)
        editor.add_download_file()
        editor.set_download_filename("file7.c", 1)

        editor.set_ms_filename("file8.c", 0)

        editor.add_c_compiler_test() #add_dejagnu_tester()
        editor.add_c_compiler_test()
        editor.add_c_compiler_test()

        editor.set_test_filename("file9.c", 0)

        editor.set_test_filename("file10.c", 1)
        editor.add_test_file(1)
        editor.set_test_filename("file12.c", 2) # 2!!

        editor.set_test_filename("file11.c", 3) # 3!!
        editor.add_test_file(2)
        editor.set_test_filename("file12.c", 4) # 4!!

        # check precondition
#        self.assertTrue('file4.c' == editor.get_display_file(0))
#        self.assertTrue('file5.c' == editor.get_display_file(1))


        self.assertTrue('file6.c' == editor.get_download_file(0))
        self.assertTrue('file7.c' == editor.get_download_file(1))



        self.assertTrue('file8.c' == editor.get_ms_file(0))


        self.assertTrue('file9.c' == editor.get_test_file(0))


        self.assertTrue('file10.c' == editor.get_test_file(1))
        self.assertTrue('file12.c' == editor.get_test_file(2))


        self.assertTrue('file11.c' == editor.get_test_file(3))
        self.assertTrue('file12.c' == editor.get_test_file(4))


        # ACTIONS

        # file4.c: display -> download
        # => old display field shall be removed!!
        editor.add_download_file()
        editor.set_download_filename("file4.c", 2)
#        alert = editor.driver.switch_to.alert
#        alert.accept()


#        self.assertTrue('file5.c' == editor.get_display_file(0))


        self.assertTrue('file7.c' == editor.get_download_file(1))
        self.assertTrue('file4.c' == editor.get_download_file(2))



        # todo??
        # test/instruction, test/test, test/model-solution(?), template/library, template/test/test


        # delete download 1
        # => file7.c will be deleted
        indexFile7 = 1
        # check for correct index
        self.assertTrue('file7.c' == editor.get_download_file(indexFile7))
        editor.delete_download(indexFile7)

#        alert = editor.driver.switch_to.alert
#        alert.accept() # dismiss()
        #        if alert.text == 'A value you are looking for':
        #            alert.dismiss
        #        else:
        #            alert.accept


        self.assertTrue('file6.c' == editor.get_download_file(0)) # still there
        self.assertTrue('file4.c' == editor.get_download_file(indexFile7)) # still there
        #try:
            # is deleted :-)
            #editor.get_displaymode('file3.c')
            #self.assertTrue(False, 'file3.c still exists')
        #except:
        #    pass


        # add and delete file11.c to display
        #self.assertTrue('internal' == editor.get_displaymode('file11.c'))
        indexDisplay = 1
#        editor.add_display_file()
#        editor.set_display_filename("file11.c", indexDisplay)
#        self.assertTrue('file11.c' == editor.get_display_file(indexDisplay))

        # delete 11
        #self.assertTrue('file11.c' == editor.get_download_file(indexLib))
#        editor.delete_display(indexDisplay)
        #self.assertTrue('internal' == editor.get_displaymode('file11.c'))



        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)



