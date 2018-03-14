# coding=utf-8


import editor
import zipFileTest

expectedZipName = "HelloWorld.zip"

class Xsd_0_94_Test(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup Xsd_0_94_Test"
        zipFileTest.ZipFileTest.setUp(self, 'xsd_094', '094')
        editor.delete_old_task_files(expectedZipName, self.output_folder)


    def test_zipfile_0_94(self):
        zipFileTest.ZipFileTest.loadZipFile(self, "input/Hello_World_094.zip") # relative to testsuite
        zipFileTest.ZipFileTest.saveFilesAndReloadAndSave(self, expectedZipName, False)

