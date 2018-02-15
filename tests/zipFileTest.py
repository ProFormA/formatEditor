# coding=utf-8

import unittest
import editor

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
        editor.loadTaskFile(task_filename, False)

    def saveZipFile(self, filename_task_xml):
        self.TaskFileNo = self.TaskFileNo + 1
        editor.saveTaskFile(filename_task_xml, self.output_folder, self.getTaskFile(self.TaskFileNo)) # filename_task_xml_1
        self.lastSavedZipFile = self.output_folder + "/" + filename_task_xml

        # todo: auspacken der der Zip-Datei und auswerten
        print 'compare files: ' + self.filename_task_xml_reference + ' <-> ' + self.getTaskFile(self.TaskFileNo)
        self.assertTrue(editor.is_file1_equal_to_file2_except_for_uuid(self.filename_task_xml_reference, self.getTaskFile(self.TaskFileNo)),
                        'task.xml output ' + str(self.TaskFileNo))

        return self.TaskFileNo

    def saveLonCapaFile(self):
        self.ProblemFileNo = self.ProblemFileNo + 1
        editor.saveLonCapa(self.getProblemFile(self.ProblemFileNo)) # self.filename_problem_1)

        self.assertTrue(editor.is_file1_equal_to_file2(self.filename_problem_reference, self.getProblemFile(self.ProblemFileNo)),
                        "problem file output " + str(self.ProblemFileNo))

        return self.ProblemFileNo


    def reimportZipFile(self):
        # reimport
        editor.loadTaskFile(self.lastSavedZipFile, True) # self.output_folder + "/" + self.filename_task_xml, True)

    def saveFilesAndReloadAndSave(self, expectedFilename):
        # TODO??
        # editor.perform_xml_lint_check(filename_task_xml_1);

        self.saveZipFile(expectedFilename)
        self.saveLonCapaFile()
        self.reimportZipFile()
        self.saveZipFile(expectedFilename)
        self.saveLonCapaFile()


    if __name__ == '__main__':
        unittest.main()