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
# test for SetlX functions
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>


import editor
import time



import editor
import zipFileTest

expectedZipName = "input222.zip"



class SetlxDgTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup Setlx / DejaGnu Test"
        zipFileTest.ZipFileTest.setUp(self, 'setlx_dg', 'setlx_dg')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description("input111")
        # fill title
        editor.set_task_title("input222")
        # fill filesize
        editor.set_filesize("3333")
        # fill MimeType
        editor.set_restrict_filename("filename")
        # LON-CAPA path
        editor.set_LON_CAPA_path("input4444/")
        # fill language
        editor.set_language("en")
        # fill programming language
        editor.set_prog_language("setlX/2.40")

        ####################################################################
        # fill FILES
        ####################################################################

        editor.add_file()
        editor.remove_first_file()

        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()

        # fill filename
        editor.set_filename(0, "file0.stlx")
        editor.set_filename(1, "file1.stlx")
        editor.set_filename(2, "file2.stlx")
        editor.set_filename(3, "file3.stlx")
        editor.set_filename(4, "file4.stlx")

        # fill file comment
        editor.set_file_comment(0, "comment for file file0.stlx")
        editor.set_file_comment(1, "comment for file file1.stlx")
        editor.set_file_comment(2, "comment for file file2.stlx")
        editor.set_file_comment(3, "comment for file file3.stlx")
        editor.set_file_comment(4, "comment for file file4.stlx")

        # set file class
        editor.set_code_skeleton("code skeleton")
        #editor.add_download_file()
        editor.set_download_filename("file2.stlx", 0)
        #editor.add_display_file()
        editor.set_display_filename("file4.stlx", 0)

        # editor.set_file_class(0, 0)
        # editor.set_file_class(1, 1)
        # editor.set_file_class(2, 2)
        # editor.set_file_class(3, 3)
        # editor.set_file_class(4, 4)

        # fill file text
        # does not work yet
        # Attention! The interface for set_file_text uses the internal index
        # of the editor array. This internal array has no index 0 since it has been deleted.
        # So we must use index 1 as the first!
        editor.set_file_text(1, "some text in file #0")
        editor.set_file_text(2, "/* dummy file text 1 */")
        editor.set_file_text(3, "/* dummy file text #2 */")
        # does not work with export!!
        # editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
        editor.set_file_text(4, "/* TODO: deutsche Umlautein File 3*/")
        editor.set_file_text(5, "int i = 0; # in File 4")

        # what shall I do with newline?
        ###editor.set_file_text(2, "int i = 0;\\nint j = 1;")


        # remove first file
        # editor.remove_file(4)
        # editor.remove_file(2)
        # editor.remove_file(1)
        # editor.remove_file(1)
        # editor.remove_file(0)




        ####################################################################
        # fill MODEL SOLUTION
        ####################################################################

        # add model solution
        # editor.add_model_solution() # first model solution ist added by editor
        editor.change_tab("ms_tab")
        editor.set_model_solution_comment(0, "model solution #0")

        editor.add_file_to_model_solution(0, 1)
        editor.append_file_to_model_solution(0)
        # editor.set_model_solution_fileref2(0, "4")
        editor.add_file_to_model_solution(1, 4)  # attention: new file has (absolute) index 1!

        ####################################################################
        # add SETLX test
        ####################################################################
        # test titles and filerefs use common class name :-(
        counter_test_index = 0

        editor.add_setlx_test()
        editor.add_setlx_test()

        editor.set_test_file(counter_test_index, 1)
        editor.set_test_title(counter_test_index, "SETLX Test #0")
        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")

        # framework and version cannot be changed
        # => no test
        # editor.set_test_framework(counter_test_index, "False")
        # editor.set_test_version(counter_test_index, "False")
        # editor.set_test_fileref2(counter_test_index, "1")

        counter_test_index = counter_test_index + 1

        editor.set_test_file(counter_test_index, 3)
        editor.set_test_title(counter_test_index, "SETLX Test #1")
        editor.set_test_public(counter_test_index, "True")
        editor.set_test_required(counter_test_index, "True")
        # editor.set_test_fileref2(counter_test_index, "2")


        counter_test_index = counter_test_index + 1

        ####################################################################
        # add SETLX syntax check
        ####################################################################
        # test titles and filerefs use common class name :-(
        editor.add_setlx_syntax()

        # do not set filename and title because these values are set by editor!
#        editor.set_test_file(counter_test_index, 1)
#        editor.set_test_title(counter_test_index, "SETLX Syntax check #0")
        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")

        # framework and version cannot be changed
        # => no test
        # editor.set_test_framework(counter_test_index, "False")
        # editor.set_test_version(counter_test_index, "False")
        # editor.set_test_fileref2(counter_test_index, "1")
        counter_test_index = counter_test_index + 1

        # ####################################################################
        # # add DEJAGNU tester
        # ####################################################################
        # editor.add_dejagnu_tester()
        # editor.add_dejagnu_tester()
        #
        # editor.set_test_title(counter_test_index, "dejagnu tester title #0")
        # editor.set_test_public(counter_test_index, "False")
        # editor.set_test_required(counter_test_index, "False")
        # editor.set_test_file(counter_test_index, 3)
        # counter_test_index = counter_test_index + 1
        #
        # editor.set_test_title(counter_test_index, "dejagnu tester title #1")
        # editor.set_test_public(counter_test_index, "True")
        # editor.set_test_required(counter_test_index, "True")
        # editor.set_test_file(counter_test_index, 4)
        # counter_test_index = counter_test_index + 1
        #
        # ####################################################################
        # # add DEJAGNU setup
        # ####################################################################
        # editor.add_dejagnu_setup()
        #
        # editor.set_test_title(counter_test_index, "dejagnu setup title #0")
        # editor.set_test_public(counter_test_index, "False")
        # editor.set_test_required(counter_test_index, "False")
        # editor.set_test_file(counter_test_index, 3)
        # counter_test_index = counter_test_index + 1

        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)



