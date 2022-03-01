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
# test for import of zip file with 0.94 version
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>


import editor
import zipFileTest
import unittest

class Xsd_1_0_1_Test(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup Xsd_1_0_1_Test")

        zipFileTest.ZipFileTest.setUp(self, 'xsd_101', '101')
        editor.delete_old_task_files("input222.zip", self.output_folder)
        editor.delete_old_task_files("javatest2.zip", self.output_folder)
        editor.delete_old_task_files("python101.zip", self.output_folder)


    @unittest.skip("Doctest is currently not supported => SKIP")
    def test_zipfile_python(self):
#        # change reference test file
        self.filename_task_xml_reference = self.output_folder + "/task_101_python_reference.xml"

        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_python_101.xml") # relative to testsuite
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, "python101.zip", False)


    def test_zipfile_java1(self):
        self.filename_task_xml_reference = self.output_folder + "/task_101_java1_reference.xml"
        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_java_1_101.xml") # relative to testsuite
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, "input222.zip", False)

    def test_zipfile_java2(self):
        # change reference test file
        self.filename_task_xml_reference = self.output_folder + "/task_101_java2_reference.xml"

        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_java_2_101.xml") # relative to testsuite
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, "javatest2.zip", False)



