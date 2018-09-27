# coding=utf-8

import unittest
import editor
import testconfig
import os
import shutil


# TODO Baustelle:
# mal versuchen, ein Framework aufzubauen, was das Laden und Schreiben der Zip-Dateien
# ermöglicht und automatisch mit Reefrenzdateien vergleicht (beim Speichern)

class ZipFileTest(unittest.TestCase):
   
    default_output_folder = "output"

    def setUp(self, testdir, testfile): # testdir e.g. 'xsd_094', testfile e.g. 'task_094'
        print "----------------------------------------------------"
        print "starting ZipFileTest " + testdir + "/" + testfile
        print "----------------------------------------------------"

        self.output_folder = self.default_output_folder + "/" + testdir
        self.testfile = testfile

        # set filenames for further tests
        self.filename_task_xml_reference = self.output_folder + "/task_" + testfile + "_reference.xml" # "output/xsd_094/task_094_reference.xml"
        self.filename_problem_reference  = self.output_folder + "/problem_" + testfile + "_reference.txt" # "output/xsd_094/problem_094_reference.txt"

        # cleanup files from previous run
        for x in range(1, 10):
            editor.delete_file(self.getTaskFile(x))
        for x in range(1, 10):
            editor.delete_file(self.getProblemFile(x))
        editor.delete_temporary_files()

        self.TaskFileNo = 0
        self.ProblemFileNo = 0

        self.driver = editor.openBrowser()
        editor.init(self.driver)
        editor.openEditorPage()

    def getTaskFile(self, number):
        return self.output_folder + "/task_" + self.testfile + "_" + str(number) + ".xml"
    def getProblemFile(self, number):
        return self.output_folder + "/problem_" + self.testfile + "_" + str(number) + ".txt"

    def tearDown(self):
        editor.closeBrowser()
        self.driver = None
        print "test finished"


    def loadZipFile(self, task_filename):
        editor.load_task_file(task_filename, True)

    def saveZipFile(self, filename_task_xml, modelSolution_alert):
        self.TaskFileNo = self.TaskFileNo + 1
        editor.save_task_file_plain(modelSolution_alert) # filename_task_xml_1
        # self.assertTrue()

        move_to_folder = self.output_folder
        move_to_filename_xml = self.getTaskFile(self.TaskFileNo)
        expected_file_name = filename_task_xml

        # move downloaded file to output folder in order to avoid name clashes
        # letting the browser to rename the next download and
        # to ease handling

        # Chrome increments an internal counter for each file in a new test.
        # So HelloWorld.zip is in the next test HelloWorld (1).zip no mather
        # if the file exists in the download folder. SO we move and rename the
        # downloaded file
        filename_with_wildcards = editor.getFilenameWithWildcard(filename_task_xml)

        import glob
        lastname = None
        listing = glob.glob(testconfig.download_path + "/" + filename_with_wildcards)
        for filename in listing:
            lastname = filename
            # print filename

        self.assertTrue(lastname != None,
                        'expected task.zip file ' + testconfig.download_path + "/" + filename_with_wildcards + ' does not exist')

        # könnte man auch direkt auspacken... (TODO)
        # print "rename " + lastname + " to " + move_to_folder + "/" + expected_file_name

        # todo: rename it
        try:
            # delete old file in target folder
            os.remove(move_to_folder + "/" + expected_file_name)
        except:
            pass

        shutil.move(lastname, move_to_folder + "/" + expected_file_name)

        import zipfile

        with zipfile.ZipFile(move_to_folder + "/" + expected_file_name, "r") as z:
            z.extractall(move_to_folder)

        shutil.move(move_to_folder + "/task.xml", move_to_filename_xml)



        self.lastSavedZipFile = self.output_folder + "/" + filename_task_xml

        # todo: auspacken der der Zip-Datei und auswerten
        # print 'compare files: ' + self.filename_task_xml_reference + ' <-> ' + self.getTaskFile(self.TaskFileNo)
        self.assertTrue(editor.is_file1_equal_to_file2_except_for_uuid(self.filename_task_xml_reference, self.getTaskFile(self.TaskFileNo)),
                        'task.xml output mismatch ' + str(self.TaskFileNo))

        return self.TaskFileNo

    def saveLonCapaFile(self, modelSolution_alert):
        self.ProblemFileNo = self.ProblemFileNo + 1
        editor.save_lon_capa_problem(self.getProblemFile(self.ProblemFileNo), modelSolution_alert) # self.filename_problem_1)

        # < !-- generated with ProFormA editor version 2.2.1 -->

        self.assertTrue(editor.is_problem_file1_equal_to_file2_except_for_version(self.filename_problem_reference, self.getProblemFile(self.ProblemFileNo)),
                        "problem file output mismatch " + str(self.ProblemFileNo))

        return self.ProblemFileNo


    def reimportZipFile(self):
        # reimport
        editor.load_task_file(self.lastSavedZipFile, True) # self.output_folder + "/" + self.filename_task_xml, True)

    def saveFilesAndReloadAndSave(self, expectedFilename, modelSolution_alert):
        # TODO??
        # editor.perform_xml_lint_check(filename_task_xml_1);

        self.saveZipFile(expectedFilename, modelSolution_alert)
        self.saveLonCapaFile(modelSolution_alert)

        self.reimportZipFile()
        self.saveZipFile(expectedFilename, modelSolution_alert)
        self.saveLonCapaFile(modelSolution_alert)

    if __name__ == '__main__':
        unittest.main()