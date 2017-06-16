# coding=utf-8


import editor
import zipFileTest

task_filename     =  "input/Hello_World_094.zip" # relative to testsuite
filename_task_xml = "HelloWorld.zip"


class Xsd_0_94_Test(zipFileTest.ZipFileTest):

    def setUp(self):
        print "setup Xsd_0_94_Test"
        zipFileTest.ZipFileTest.setUp(self, 'xsd_094', '094')

        editor.delete_old_task_files(filename_task_xml, self.output_folder)


    def test_zipfile_0_94(self):
        zipFileTest.ZipFileTest.loadZipFile(self, task_filename)
        # editor.loadTaskFile(task_filename, False)
        # TODO
        # editor.perform_xml_lint_check(filename_task_xml_1);

        zipFileTest.ZipFileTest.saveZipFile(self, filename_task_xml)

        zipFileTest.ZipFileTest.saveLonCapaFile(self)

        zipFileTest.ZipFileTest.reimportZipFile(self)

        zipFileTest.ZipFileTest.saveZipFile(self, filename_task_xml)

        zipFileTest.ZipFileTest.saveLonCapaFile(self)

