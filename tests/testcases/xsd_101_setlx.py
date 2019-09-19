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


class Xsd_setlx_1_0_1_Test(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup Xsd_setlx_1_0_1_Test")
        zipFileTest.ZipFileTest.setUp(self, 'xsd_101', 'setlx101')
        editor.delete_old_task_files("setlx101.zip", self.output_folder)

    def test_zipfile_setlx(self):
        # change reference test file
        self.filename_task_xml_reference = self.output_folder + "/task_101_setlx_reference.xml"

        zipFileTest.ZipFileTest.loadZipFile(self, "input/task_setlx_101.xml") # relative to testsuite
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, "setlx101.zip", False)

