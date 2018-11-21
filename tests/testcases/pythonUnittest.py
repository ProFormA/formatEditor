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
# test for Python functions
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

import editor
import time



import editor
import zipFileTest

description = "input111"
title = "input222"
filesize = "3333"

lon_capa_path = "input4444/"
language = "en"
prog_lang = "python/2"

expectedZipName = "input222.zip"



class PythonTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup Python Test"
        zipFileTest.ZipFileTest.setUp(self, 'python', 'python')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description(description)
        # fill title
        editor.set_task_title(title)
        # fill filesize
        editor.set_filesize(filesize)
        # fill Fielname
        editor.set_regexp_filename("TestAbc*")
        # LON-CAPA path
        editor.set_LON_CAPA_path(lon_capa_path)
        # fill language
        editor.set_language(language)
        # fill programming language
        editor.set_prog_language(prog_lang)

        ####################################################################
        # fill FILES
        ####################################################################

        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()
        editor.add_file()

        # fill filename
        editor.set_filename(0, "file0.py")
        editor.set_filename(1, "file1.py")
        editor.set_filename(2, "file2.py")
        editor.set_filename(3, "file3.py")
        editor.set_filename(4, "file4.py")
        editor.set_filename(5, "file5.py")

        # fill file comment
        editor.set_file_comment(0, "comment for file file0.py")
        editor.set_file_comment(1, "comment for file file1.py")
        editor.set_file_comment(2, "comment for file file2.py")
        editor.set_file_comment(3, "comment for file file3.py")
        editor.set_file_comment(4, "comment for file file4.py")
        editor.set_file_comment(5, "comment for file file5.py")

        # set file class
        editor.set_template_filename("file1.py", 0)
        editor.add_download_file()
        editor.set_download_filename("file2.py", 1)
        editor.add_display_file()
        editor.set_display_filename("file4.py", 2)


        # editor.set_file_class(0, 0)
#        # editor.set_file_class(1, 1)
#        editor.set_file_class(2, 2)
#        editor.set_file_class(3, 3)
#        editor.set_file_class(4, 4)
#        editor.set_file_class(5, 0)

        # fill file text
        # does not work yet
        editor.set_file_text(1, "# dummy file text 1")
        editor.set_file_text(2, "# dummy file text #2")
        # does not work with export!!
        # editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
        editor.set_file_text(3, "# TODO: deutsche Umlautein File 3")
        editor.set_file_text(4, "int i = 0; # in File 4")
        editor.set_file_text(5, "some text in file #5")

        # what shall I do with newline?
        ###editor.set_file_text(2, "int i = 0;\\nint j = 1;")

        # remove first file
        # editor.remove_file(4)
        # editor.remove_file(2)
        # editor.remove_file(1)
        # editor.remove_file(1)
        # editor.remove_file(0)
        editor.remove_first_file()

        ####################################################################
        # fill MODEL SOLUTION
        ####################################################################

        # add model solution
        # editor.add_model_solution() # first model solution ist added by editor
        editor.add_model_solution()

        editor.set_model_solution_comment(0, "Internal description for model solution #0")
        editor.set_model_solution_comment(1, "Internal description for model solution #1")
        editor.set_model_solution_description(0, "Description for model solution #0")
        editor.set_model_solution_description(1, "Description for model solution #1")

        editor.add_file_to_model_solution(0, 2)
        editor.add_file_to_model_solution(1, 1)

        editor.append_file_to_model_solution(1)
        editor.add_file_to_model_solution(2, 3)  # attention: new file has (absolute) index 2!
        # editor.set_model_solution_fileref2(1, "4")

        ####################################################################
        # add Python test
        ####################################################################
        # test titles and filerefs use common class name :-(
        counter_test_index = 0

        editor.add_python_test()
        editor.add_python_test()

        editor.set_test_file(counter_test_index, 1)
        editor.set_test_title(counter_test_index, "Python Test #0")
        editor.set_test_description(counter_test_index, "Description for Python Test #0")
        editor.set_test_comment(counter_test_index, "Internal description for Python Test #0")

        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")
        # editor.set_junit_fileref2(counter_test_index, "1")

        counter_test_index = counter_test_index + 1

        editor.set_test_file(counter_test_index, 3)
        editor.set_test_title(counter_test_index, "Python Test #1")
        editor.set_test_description(counter_test_index, "Description for Python Test #1")
        editor.set_test_comment(counter_test_index, "Internal description for Python Test #1")
        editor.set_test_public(counter_test_index, "True")
        editor.set_test_required(counter_test_index, "True")
        # editor.set_junit_fileref2(counter_test_index, "2")


        counter_test_index = counter_test_index + 1

        ####################################################################
        # add CHECKSTYLE test
        ####################################################################
        editor.add_checkstyle()
        editor.add_checkstyle()

        editor.set_test_title(counter_test_index, "checkstyle test title #0")
        editor.set_test_public(counter_test_index, "False")
        editor.set_test_required(counter_test_index, "False")
        editor.set_cs_version(0, 0)
        editor.set_cs_max_warnings(0, "2")
        editor.set_test_file(counter_test_index, 4)
        counter_test_index = counter_test_index + 1

        editor.set_test_title(counter_test_index, "checkstyle test title #1")
        editor.set_test_public(counter_test_index, "True")
        editor.set_test_required(counter_test_index, "True")
        editor.set_cs_version(1, 1)
        editor.set_cs_max_warnings(1, "0")
        editor.set_test_file(counter_test_index, 4)
        counter_test_index = counter_test_index + 1

        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)



