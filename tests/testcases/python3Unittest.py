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
# test for Java functions
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

import editor
import time
import editor
import zipFileTest


expectedZipName = "pythonunittesttestcase.zip"


description = "python unittest description"
title = "python unittest testcase"
filesize = "3333"
language = "en"
prog_lang = "python/3"


class Python3Unittest(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup Python 3 Unittest")
        zipFileTest.ZipFileTest.setUp(self, 'python', 'pythonunittest')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        # I N P U T

        ####################################################################
        ## fill MAIN page
        ####################################################################

        # fill Task decription
        editor.set_task_description(description)
        # fill title
        editor.set_task_title(title)
        # fill internal description
        editor.set_task_comment('task internal description')
        # fill filesize
        editor.set_filesize(filesize)
        # fill regexp filename
        editor.set_restrict_filename(0, "ABC123*", False, False)
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

        # fill filename (0-based)
        editor.set_filename(0, "file0.py")
        editor.set_filename(1, "file1.py")
        editor.set_filename(2, "file2.py")
        editor.set_filename(3, "file3.py")
        # set filename for file 4 later
        editor.set_filename(5, "file4.py")

        # fill file comment (0-based)
        editor.set_file_comment(0, "comment for file file0.py")
        editor.set_file_comment(1, "comment for file file1.py")
        editor.set_file_comment(2, "comment for file file2.py")
        editor.set_file_comment(3, "comment for file file3.py")
        # set comment for file 4 later
        editor.set_file_comment(5, "comment for file file4.py")

        # set file class
        editor.set_code_skeleton("code skeleton")
        #editor.add_download_file()
        editor.set_download_filename("file1.py", 0)

        # fill file text (1-based !!)
        editor.set_file_text(1, "// dummy file text 1")
        editor.set_file_text(2, "// dummy file text #2")
        # does not work with export!!
        # editor.set_file_text(3, "// deutsche Umlaute öäüß in File 3")
        editor.set_file_text(3, "// TODO: deutsche Umlautein File 3")
        editor.set_file_text(4, "int i = 0; // in File 4")
        editor.set_file_text(5, "class MyClass {}")

        editor.set_filename(4, "file5.py")
        editor.set_file_comment(4, "comment for file file5.py")

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
        editor.add_model_solution() # second model solution

        editor.set_model_solution_comment(0, "model solution #0")
        editor.set_model_solution_comment(1, "model solution #1")

        editor.add_file_to_model_solution(0, 2) # file2.py
        editor.add_file_to_model_solution(1, 1) # file1.py

        editor.append_file_to_model_solution(1)
        editor.add_file_to_model_solution(2, 3)  # file3.py attention: new file has (absolute) index 2!
        # editor.set_model_solution_fileref2(1, "4")

        ####################################################################
        # add Googletest
        ####################################################################
        editor.add_python_unittest()
        editor.add_python_unittest()

        # fill test #0
        counter_test_index = 0
        editor.set_test_title(counter_test_index, "Python Test #0")
        editor.set_test_description(counter_test_index, "pythontest description # 0")
        editor.set_test_file(counter_test_index, 1) # file1.py

        counter_test_index = counter_test_index + 1

        # fill test #1
        editor.set_test_title(counter_test_index, "Python Test #1")
        editor.add_test_file(counter_test_index)
        editor.set_test_description(counter_test_index, "pythontest description # 1")
        editor.set_test_weight(counter_test_index, '4')
        editor.set_test_file(counter_test_index, 4) # file5.py
        editor.set_test_file(counter_test_index + 1, 3) # file3.py

        counter_test_index = counter_test_index + 1

        # create zip
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)

