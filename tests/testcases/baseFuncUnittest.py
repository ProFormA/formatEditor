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
# test of base functionality
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>


import editor
import time



import zipFileTest

title = "base"
expectedZipName = title + ".zip"


prog_lang = "java/1.8"




class BaseFunctionalityTest(zipFileTest.ZipFileTest):

    def setUp(self):
        print("setup BaseTest")
        zipFileTest.ZipFileTest.setUp(self, 'java', 'base')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_input(self):
        # I N P U T

        # try:
            ####################################################################
            ## fill MAIN page
            ####################################################################

            # fill Task decription
            editor.set_task_description("input111")
            # fill title
            editor.set_task_title(title)
            # fill programming language
            editor.set_prog_language(prog_lang)

            ####################################################################
            # fill FILES
            ####################################################################

            editor.add_file()

            # fill filename
            editor.set_filename(0, "file0.java")


            # fill file text
            # does not work yet
            editor.set_file_text(1, "// dummy file text 1")

            ####################################################################
            # fill MODEL SOLUTION
            ####################################################################

            editor.add_file_to_model_solution(0, 1)

            ####################################################################
            # add Java compiler test
            ####################################################################
            # test titles and filerefs use common class name :-(
            counter_test_index = 0


            # add 2 compiler tests
            editor.add_java_compiler_test()

            zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)
            # zipFileTest.ZipFileTest.saveZipFile(self, expectedZipName)
            # zipFileTest.ZipFileTest.saveLonCapaFile(self)
        # except Exception,e:
        #     try:
        #         editor.driver.save_screenshot('screenshot.png')
        #     except:
        #         pass
        #     raise e


