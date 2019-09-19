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

expectedZipName = "HelloWorld.zip"

class Xsd_0_94_Test(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup Xsd_0_94_Test")
        zipFileTest.ZipFileTest.setUp(self, 'xsd_094', '094')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


# conversion from 0.9.4 is not supported
#    def test_zipfile_0_94(self):
#        zipFileTest.ZipFileTest.loadZipFile(self, "input/Hello_World_094.zip") # relative to testsuite
#        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)

