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
# test for special user interface functions
#
# @copyright 2019 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>


import editor
import zipFileTest


class SpecialTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup special_Test"

        zipFileTest.ZipFileTest.setUp(self, 'user_interface', 'files')



    # tests if files are removed if they are no longer referenced (test, model solution or download)
    def test_remove_files_indirect(self):
        # initialise
        self.filename_task_xml_reference = self.output_folder + "/removefiles_reference.xml"
        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_java.xml") # relative to testsuite

        # remove download
        #editor.set_download_filename('', 1)
        editor.delete_download(1) # file2.java
        # => expect associated file is missing

        # remove tests
        editor.remove_test(3) # file1.java
        editor.remove_test(4) # MyClass.java
        # => expect associated file is missing

        # add new test
        editor.add_java_compiler_test()
        # => expect new test to have ID 3

        # remove model solution
        editor.remove_model_solution(2) # file1.java, file3.java
        # => expect associated file is missing

        # save zipfile and compare with reference
        zipFileTest.ZipFileTest.saveZipFile(self, "input222.zip", False)


    def test_change_file(self):
        # initialise
        self.filename_task_xml_reference = self.output_folder + "/file_reference.xml"
        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_java.xml") # relative to testsuite

        # change filename
        editor.change_filename(3, 'download.txt')
        # => expect 'referenced' filenames to be changed, too


        # delete file and re-add file with same name
        editor.remove_file_by_file_id(4)
        editor.add_file()
        # should have id=1
        editor.set_filename(4, 'file3.java') # 0-based index counting in display (not ids)
        editor.set_test_filename('file3.java', 4)

        # ERROR: weil dbei gelöschten Dateien die leeren Referenzen nicht entfernt werden.
        # Daher wird beim Schreiben der zip erkannt, dass Filenamen leer sind
        zipFileTest.ZipFileTest.saveZipFile(self, "input222.zip", False)









