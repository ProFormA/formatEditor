# coding=utf-8

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains

import os.path

import testconfig
import time

driver = 0
codemirror = True


def openChrome():
    # chromedriver = "/Users/adam/Downloads/chromedriver"
    # os.environ["webdriver.chrome.driver"] = chromedriver
    # driver = webdriver.Chrome(chromedriver)
    driver = webdriver.Chrome()
    return driver


def openFirefox():
    d = DesiredCapabilities.FIREFOX

    usr_bin_firefox = "/usr/bin/firefox"
    c_program_x86_firefox = r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe"

    if len(testconfig.firefox_executable) <= 0:
        if os.path.isfile(usr_bin_firefox):
            testconfig.firefox_executable = usr_bin_firefox
            print usr_bin_firefox + " exists"
        elif os.path.isfile(c_program_x86_firefox):
            testconfig.firefox_executable = c_program_x86_firefox
            print c_program_x86_firefox + " exists"

    if len(testconfig.firefox_executable) > 0:
        driver = webdriver.Firefox(firefox_binary=testconfig.firefox_executable, capabilities=d)
    else:
        # try default
        driver = webdriver.Firefox(capabilities=d)

    return driver


def openEditorPage():
    the_path = os.path.dirname(os.path.abspath(__file__))
    # print the_path
    editor_path = the_path + "/../proformaEditor101.html"
    # print editor_path

    # driver.get("proformaEditor.html")
    driver.get("file:///" + editor_path)

def init(the_driver):
    global driver
    driver = the_driver

####################################################################
# generic input helpers
####################################################################
def set_input_field(html_id, text):
    elem = driver.find_element_by_id(html_id)
    elem.clear()
    elem.send_keys(text)


def select_option(html_id, value):
    select = Select(driver.find_element_by_id(html_id))
    select.select_by_value(value)  


def showModalWindow():
   global alert
   try:
      driver.execute_script('window.alert("Hi")')
   except:
      pass
   alert = driver.switch_to.alert
   alert.accept()

####################################################################
# editor input helpers
####################################################################

####################################################################
# MAIN
####################################################################
def set_task_description(text):
    set_input_field("xml_description", text)

def set_task_title(text):
    set_input_field("xml_meta-data_title", text)

def set_filesize(text):
    set_input_field("xml_subm_max-size", text)

def set_mimetype(text):
    set_input_field("xml_upload-mime-type", text)

def set_LON_CAPA_path(text):
    set_input_field("lczip", text)

def set_language(text):
    select_option("xml_lang", text)

def set_prog_language(text):
    select_option("xml_programming-language", text)

####################################################################
# FILE
####################################################################
def add_file():
    elem = driver.find_element_by_id("addFile").click()

# does not work! only first element is found :-(
#def remove_file(index): # 0-based
#    elem = driver.find_element_by_class_name('xml_file')
#    elem[index].find_element_by_tag_name('button').click()
#    alert = driver.switch_to.alert
#    alert.accept()


def remove_first_file():
    elem = driver.find_element_by_class_name('xml_file')
    elem.find_element_by_tag_name('button').click()
    alert = driver.switch_to.alert
    alert.accept()

def set_filename(file_index, filename): # 0-based
    elem = driver.find_elements_by_class_name('xml_file_filename')
    elem[file_index].send_keys(filename)

def set_file_comment(file_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_file_comment')
    elem[file_index].send_keys(text)

def set_file_class(file_index, option_index):  # 0-based
    elem = driver.find_elements_by_class_name('xml_file_class')
    select = Select(elem[file_index])
    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(option_index)

def set_file_text(file_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_file_text')
    if codemirror:
        command = 'codemirror['+ str(file_index) +'].setValue("' + text + '")'
        # print command
        driver.execute_script(command);
    else:
        # never ever tested!!
        elem = driver.find_elements_by_class_name('xml_file_text')
        elem[file_index].send_keys(text)


####################################################################
# MODEL SOLUTION
####################################################################

def add_model_solution():
    elem = driver.find_element_by_id("addModelsol").click()


def set_model_solution_comment(ms_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_model-solution_comment')
    elem[ms_index].send_keys(text)


def add_file_to_model_solution(ms_index, file_index):  # 0-based
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!

    elem = driver.find_elements_by_class_name('xml_model-solution_filename')

    # the option has to get the focus in order to fill the list!
    (elem[ms_index]).send_keys(Keys.NULL)
    time.sleep(1);
    showModalWindow()

    # elem = driver.find_elements_by_class_name('mediuminput xml_model-solution_filename')
    select = Select(elem[ms_index])

    select.select_by_index(0)

    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(file_index)



def set_model_solution_fileref2(ms_index, filefer_number):
    fileref_index = 1 # fileref 1 and fileref2 use the same class!
    elem = driver.find_elements_by_class_name('xml_model-solution_fileref')
    elem[(ms_index * 2) + fileref_index].send_keys(filefer_number)


####################################################################
# common TEST functions
####################################################################
def set_test_title(jct_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_test_title')
    elem[jct_index].clear()
    elem[jct_index].send_keys(text)

def set_test_public(test_index, public):
    elem = driver.find_elements_by_class_name('xml_pr_public')
    select = Select(elem[test_index])
    #select.select_by_value(value) # unfortunately does not work
    select.select_by_visible_text(public)


def set_test_required(test_index, required):
    elem = driver.find_elements_by_class_name('xml_pr_required')
    select = Select(elem[test_index])
    #select.select_by_value(value) # unfortunately does not work
    select.select_by_visible_text(required)

####################################################################
# JAVA COMPILER TEST
####################################################################
def add_java_compiler_test():
    elem = driver.find_element_by_id("addJavaComp").click()


def set_jct_flags(jct_index, flags): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerFlags')
    elem[jct_index].clear()
    elem[jct_index].send_keys(flags)

def set_jct_output_flags(jct_index, flags): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerOutputFlags')
    elem[jct_index].clear()
    elem[jct_index].send_keys(flags)

def set_jct_libs(jct_index, libs): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerLibs')
    elem[jct_index].clear()
    elem[jct_index].send_keys(libs)

def set_jct_file_pattern(jct_index, pattern): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerFPatt')
    elem[jct_index].clear()
    elem[jct_index].send_keys(pattern)


####################################################################
# JUNIT TEST
####################################################################
def add_junit_test():
    elem = driver.find_element_by_id("addJavaJunit").click()


def set_junit_description(junit_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_configDescription')
    elem[junit_index].clear()
    elem[junit_index].send_keys(text)

def set_junit_test_class(junit_index, classtext):
    elem = driver.find_elements_by_class_name('xml_ju_mainclass')
    elem[junit_index].send_keys(classtext)

# Achtung! Index!
# Alle Tests haben ein Fileref-Feld. Der Index muss entsprechend angepasst werden.
# Compiler test hat auch ein solches Feld, was
# aber nicht sichtbar ist. Es zählt aber mit!!
def add_file_to_junit(junit_index, file_index):  # 0-based
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!
    elem = driver.find_elements_by_class_name('xml_test_filename')

    # the option has to get the focus in order to fill the list!
    (elem[junit_index]).send_keys(Keys.NULL)
    time.sleep(1);
    showModalWindow()

    # elem = driver.find_elements_by_class_name('mediuminput xml_model-solution_filename')
    select = Select(elem[junit_index])

    select.select_by_index(0)

    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(file_index)



def set_junit_version(junit_index, version):
    elem = driver.find_elements_by_class_name('xml_ju_version')
    select = Select(elem[junit_index])
    select.select_by_index(version)


# Attention! The input field is read-only! So you cannot
# set this value via test!
def set_junit_fileref2(junit_index, fileref_number):
    fileref_index = 1 # fileref 1 and fileref2 use the same class!
    elem = driver.find_elements_by_class_name('xml_test_fileref')
    elem[(junit_index * 2) + fileref_index].send_keys(fileref_number)


####################################################################
# CHECKSTYLE TEST
####################################################################
def add_checkstyle():
    elem = driver.find_element_by_id("addCheckStyle").click()

# Achtung! Index!
# Alle Tests haben ein Fileref-Feld. Der Index muss entsprechend angepasst werden.
# Compiler test hat auch ein solches Feld, was
# aber nicht sichtbar ist. Es zählt aber mit!!
def add_file_to_checkstyle(cs_index, file_index):  # 0-based
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!
    elem = driver.find_elements_by_class_name('xml_test_filename')

    # the option has to get the focus in order to fill the list!
    (elem[cs_index]).send_keys(Keys.NULL)
    time.sleep(1);
    showModalWindow()

    # elem = driver.find_elements_by_class_name('mediuminput xml_model-solution_filename')
    select = Select(elem[cs_index])

    select.select_by_index(0)

    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(file_index)


# only one version can be selected (=> no test needed)
def set_cs_version(cs_index, version):
    elem = driver.find_elements_by_class_name('xml_pr_CS_version')
    select = Select(elem[cs_index])
    select.select_by_index(version)

def set_cs_max_warnings(cs_index, max_warnings):
    elem = driver.find_elements_by_class_name('xml_pr_CS_warnings')
    (elem[cs_index]).clear()
    (elem[cs_index]).send_keys(max_warnings)






####################################################################
# EXPORT/IMPORT
####################################################################
def export_to(task_xml, lon_capa_problem):
    export()
    task_xml_field_value_1 = get_task_xml()
    lon_capa_problem_field_value_1 = get_lon_capa_problem()

    text_file = open(task_xml, "w")
    text_file.write(task_xml_field_value_1)
    text_file.close()

    text_file = open(lon_capa_problem, "w")
    text_file.write(lon_capa_problem_field_value_1)
    text_file.close()


def export():
    elem = driver.find_element_by_id("buttonExport").click()

def import_task_xml():
    elem = driver.find_element_by_id("buttonImport").click()
    alert = driver.switch_to.alert
    alert.accept()


def get_task_xml():
    outputarea1 = driver.find_element_by_id("output")
    task_xml_field_value_1 = outputarea1.get_attribute('value')
    return task_xml_field_value_1

def get_lon_capa_problem():
    outputarea2 = driver.find_element_by_id("output2")
    lon_capa_problem_field_value_1 = outputarea2.get_attribute('value')
    return lon_capa_problem_field_value_1

import difflib
import glob




def delete_file(filename):
    if os.path.isfile(filename):
        os.remove(filename)

def delete_temporary_files():
    for fl in glob.glob("*.tmp"):
        os.remove(fl)


# compares two files
def is_file1_equal_to_file2(file1, file2):
    f1 = open(file1, 'r')
    f2 = open(file2, 'r')

    diff_file = "diff_" + file1 + ".tmp"
    f = open(diff_file, 'w')
    for line in difflib.ndiff(f1.readlines(), f2.readlines()):
        if line.startswith('+ ') or line.startswith('- ') or line.startswith('? '):
            f.write(line)
    f.close()

    statinfo = os.stat(diff_file)
    if statinfo.st_size > 0:
        return False

    return True

from xml.dom.minidom import parse, parseString
#from lxml import etree

# comparison for task.xml file
# does not yet work properly because pretty printing is not working!
def is_file1_equal_to_file2_except_for_uuid(file1, file2):

    #x = lxml.etree.parse("filename")
    #print lxml.etree.tostring(x, pretty_print=True)


    # convert files to pretty printed files
    dom1 = parse(file1)  # parse an XML file by name

    # replace uuid by 'unknown'
    for subelement in dom1.getElementsByTagName("task"):
        if subelement.hasAttribute("uuid"):
            subelement.setAttribute('uuid', 'unknown')


    # attention! The pretty printer changes the content of the file :-(
    # So the .tmp file is wrong!
    # TODO: search better solution!
    f = open(file1 + ".tmp", 'w')
    f.write(dom1.toprettyxml(indent=" "))
    f.close()

    dom2 = parse(file2)  # parse an XML file by name

    # replace uuid by 'unknown'
    for subelement in dom2.getElementsByTagName("task"):
        if subelement.hasAttribute("uuid"):
            subelement.setAttribute('uuid', 'unknown')

    f = open(file2 + ".tmp", 'w')
    f.write(dom2.toprettyxml(indent=" "))
    f.close()

    # write diff with pretty printed files to new file
    f1 = open(file1 + ".tmp", 'r')
    f2 = open(file2 + ".tmp", 'r')

    f = open("diff.tmp", 'w')
    for line in difflib.ndiff(f1.readlines(), f2.readlines()):
        if line.startswith('+ ') or line.startswith('- ') or line.startswith('? '):
            f.write(line)
    f.close()

    statinfo = os.stat("diff.tmp")
    if statinfo.st_size > 0:
        return False

    return True

def perform_xml_lint_check(task_xml):
    filename = "xmllint.exe"
    if os.path.isfile(filename):
        os.system("xmllint --noout --schema ../taskxml1.0.1.xsd " + task_xml);

    pass
    # xmllint --noout --schema schema.xsd file.xml