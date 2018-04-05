# coding=utf-8

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains

import os.path
import shutil

import testconfig
import time
import sys

import os

from pynput.keyboard import Key, Controller

codemirror = True


# firstTimeDialogs = True
# needed for Firefox to store the dialog-opened-state
firstTimeDialogs = {'zip': True, 'loncapa': True}


####################################################################
# open browser window
####################################################################

driver = 0
browser = testconfig.browser # "Chrome"
#browser = "Edge"

def openBrowser():
    # startHttpServer()
    global firstTimeDialogs
    firstTimeDialogs['zip'] = True
    firstTimeDialogs['loncapa'] = True

    if browser == "Chrome":
        return openChrome()
    elif browser == "Firefox":
        return openFirefox()
    elif browser == "Edge":
        return openEdge()
    elif browser == "PhantomJS":
        return openPhantomJs()
    else:
        sys.stderr.write("invalid browser value: " + browser)




def openChrome():
    print "Starting Chrome"
    # chromedriver = "/Users/adam/Downloads/chromedriver"
    # os.environ["webdriver.chrome.driver"] = chromedriver
    # driver = webdriver.Chrome(chromedriver)
    driver = webdriver.Chrome()
    return driver


def openEdge():
    print "Starting Edge"

    driver = webdriver.Edge()
    return driver


def openPhantomJs():
    print "Starting PhantomJS"

    driver = webdriver.PhantomJS()
    return driver

def openFirefox():
    print "Starting Firefox"

    driver = webdriver.Firefox()

    return driver

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


def openEditorPageFile():
    the_path = os.path.dirname(os.path.abspath(__file__))
    # print the_path
    editor_path = the_path + "/../proformaEditor101.html"
    # print editor_path
    driver.get("file:///" + editor_path)
    driver.execute_script('enableTestMode();')


def openEditorPage():
#    driver.get("https://media.elan-ev.de/proforma/editor/releases/preview/proformaEditor101.html")
    driver.get("http://127.0.0.1:8000/proformaEditor101.html")
    driver.execute_script('enableTestMode();')


def init(the_driver):
    global driver
    driver = the_driver

def closeBrowser():
    # driver.close() # webdriver throws an exception for Firefox if close and quit is called
    driver.quit()

####################################################################

def load_task_file(task_file, content_will_be_deleted):
    the_path = os.path.dirname(os.path.abspath(__file__))
    filename = the_path + "/" + task_file
    filename = filename.replace("/", "\\") # needed on Windows!!
    # print filename

    # print "press load button"
    elem = driver.find_element_by_id("button_load")
    elem.click() # .... Edge kommt erst wieder, wenn man den Dialog beendet hat :-(D:\users\karin\Code\zell\git\formatEditor\tests\input\Hello_World_094.zip

    # print "wait for dialog"
    time.sleep(2)

    # print "type text into dialog"
    # control the modal window with pynpy (not selenium!)
    # type filename in input field
    keyboard = Controller()
    keyboard.type(filename)
    # Press and release enterD:\users\karin\Code\zell\git\formatEditor\tests\input\Hello_World_094.zip
    time.sleep(1)

    keyboard.press(Key.enter)
    keyboard.release(Key.enter)

    # print "wait for rendering to complete"
    time.sleep(3)

    if content_will_be_deleted:
        alert = driver.switch_to.alert
        alert.accept()


def getFilenameWithWildcard(file_name):
    tokens = file_name.split('.')
    filename_with_wildcards = tokens[0] + "*." + tokens[1]
    # print filename_with_wildcards
    return filename_with_wildcards


def confirmDownloadSaveDialog(dialogkey):

    time.sleep(3)
    # a new window is opened asking what to do with the download
    # print "confirm dialog"
    keyboard = Controller()

    global firstTimeDialogs
    if firstTimeDialogs[dialogkey]:
        print "1. Download => Speichern statt Öffnen wählen"
        # switch to save (instead of open)
        print "cursor down"
        keyboard.press(Key.down)
        keyboard.release(Key.down)
        time.sleep(1)
        firstTimeDialogs[dialogkey] = False

    print "enter"
    keyboard.press(Key.enter)
    keyboard.release(Key.enter)

    # print "confirmDownloadSaveDialog finished"

def save_task_file_plain(modelSolution_alert):
    # print "press save zip button"
    elem = driver.find_element_by_id("buttonZip")
    elem.click()

    if modelSolution_alert:
        confirmPopup()

    if browser == "Firefox":
        confirmDownloadSaveDialog('zip')

    # wait for download to complete
    time.sleep(2)


def save_task_file(expected_file_name, move_to_folder, move_to_filename_xml):
    # print "press save zip button"
    elem = driver.find_element_by_id("buttonZip")
    elem.click()

    if browser == "Firefox":
        confirmDownloadSaveDialog('zip')

    # wait for download to complete
    time.sleep(2)



    # move downloaded file to output folder in order to avoid name clashes
    # letting the browser to rename the next download and
    # to ease handling

    # Chrome increments an internal counter for each file in a new test.
    # So HelloWorld.zip is in the next test HelloWorld (1).zip no mather
    # if the file exists in the download folder. SO we move and rename the
    # downloaded file
    filename_with_wildcards = getFilenameWithWildcard(expected_file_name)

    import glob
    lastname = None
    listing = glob.glob(testconfig.download_path + "/" + filename_with_wildcards)
    for filename in listing:
        lastname = filename
        # print filename

    if lastname == None:
        print testconfig.download_path + "/" + filename_with_wildcards + ' does not exist'

    # könnte man auch direkt auspacken... (TODO)
    # print "rename " + lastname + " to " + move_to_folder + "/" + expected_file_name

    # todo: rename it
    try:
        os.remove(move_to_folder + "/" + expected_file_name)
    except:
        pass

    shutil.move(lastname, move_to_folder + "/" + expected_file_name)

    import zipfile

    with zipfile.ZipFile(move_to_folder + "/" + expected_file_name, "r") as z:
        z.extractall(move_to_folder)

    shutil.move(move_to_folder + "/task.xml", move_to_filename_xml)





def save_lon_capa_problem(expected_file_name, modelSolution_alert):
    change_tab("main_tab")

    elem = driver.find_element_by_id("button_save_lon_capa").click()

    if modelSolution_alert:
        confirmPopup()

    if browser == "Firefox":
        confirmDownloadSaveDialog('loncapa')

    # wait for download to complete
    time.sleep(2)

    import glob
    listing = glob.glob(testconfig.download_path + "/task*.problem")
    for filename in listing:
        lastname = filename
        # print filename

    print "rename " + lastname + " to " +expected_file_name
    shutil.move(lastname, expected_file_name)


####################################################################
# test support    
####################################################################
pass_counter = 0
failed_counter = 0
def PASS(message):
    global pass_counter
    print "PASSED: " + message
    pass_counter = pass_counter + 1
    

def FAILED(message):
    global failed_counter
    sys.stderr.write("FAILED: " + message + "\n")
    failed_counter = failed_counter + 1

def TEST_SUMMARY():
    global pass_counter
    global failed_counter
    print str(pass_counter) + " tests passed"
    if failed_counter > 0:
        sys.stderr.write (str(failed_counter) + " tests failed\n")
    else:
        print str(failed_counter) + " tests failed"
        

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


def confirmPopup():
    alert = driver.switch_to.alert
    alert.accept()


####################################################################
# editor input helpers
####################################################################

####################################################################
# MAIN
####################################################################
def set_task_description(text):
    elem = driver.find_elements_by_id('xml_description')
    if codemirror:
        command = 'descriptionEditor.setValue("' + text + '")'
        # print command
        driver.execute_script(command);
    else:
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


###########
# FILE REF
###########

# workaround for select_by_visible_text in Chrome
def select_chrome_option(elem, select):
    options_list = select.options
    opt_index = 0
    for option in options_list:
        if option.text == "<load...>":
            break
        opt_index = opt_index + 1

    # print "index of <load...> is " + str(opt_index)
    elem.click()
    time.sleep(1)
    keyboard = Controller()

    for i in range (0, opt_index):
        # print "[down]"
        keyboard.press(Key.down)
        keyboard.release(Key.down)
        # time.sleep(1)

    # print "[enter]"
    keyboard.press(Key.enter)
    keyboard.release(Key.enter)


def add_instruction_file():
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("add_instruction_fileref")
    elem = elems[0].click()

def add_template_file():
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("add_template_fileref")
    elem = elems[0].click()

def add_library_file():
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("add_library_fileref")
    elem = elems[0].click()

def add_test_file(index):
    change_tab("test_tab")
    elems = driver.find_elements_by_class_name("add_test_fileref")
    elem = elems[index].click()

def set_fileref(filename, index, xml_class):
    filename = filename.replace("/", "\\") # needed on Windows!!

    elems = driver.find_elements_by_class_name(xml_class)
    elem = elems[index]
    select = Select(elem)

    # select <load...>
#    if browser == 'Chrome':
        # does not work with Chrome (maybe because of a bug!)
#        select_chrome_option(elem, select)
#    else:
    select.select_by_visible_text(filename)

    # print "wait for dialog"

    time.sleep(0.3)


def load_fileref(filename, index, xml_class):
    the_path = os.path.dirname(os.path.abspath(__file__))
    filename = the_path + "/" + filename
    filename = filename.replace("/", "\\") # needed on Windows!!
    # print filename

    elems = driver.find_elements_by_class_name(xml_class)
    elem = elems[index]
    select = Select(elem)

    # select <load...>
    if browser == 'Chrome':
        # does not work with Chrome (maybe because of a bug!)
        select_chrome_option(elem, select)
    else:
        select.select_by_visible_text('<load...>')

    # print "wait for dialog"

    time.sleep(2)

    # print "type text into dialog"
    # control the modal window with pynpy (not selenium!)
    # type filename in input field
    keyboard = Controller()
    keyboard.type(filename)
    time.sleep(1)

    keyboard.press(Key.enter)
    keyboard.release(Key.enter)

    # print "wait for rendering to complete"
    time.sleep(3)


def load_instruction_file(filename, index):
    change_tab("main_tab")
    load_fileref(filename, index, "xml_instruction_filename")

def set_instruction_filename(filename, index):
    change_tab("main_tab")
    set_fileref(filename, index, "xml_instruction_filename")


def load_library_file(filename, index):
    change_tab("main_tab")
    load_fileref(filename, index, "xml_library_filename")

def set_library_filename(filename, index):
    change_tab("main_tab")
    set_fileref(filename, index, "xml_library_filename")


def load_template_file(filename, index):
    change_tab("main_tab")
    load_fileref(filename, index, "xml_template_filename")

def set_template_filename(filename, index):
    change_tab("main_tab")
    set_fileref(filename, index, "xml_template_filename")


def set_ms_filename(filename, index):
    change_tab("ms_tab")
    set_fileref(filename, index, "xml_model-solution_filename")

def set_test_filename(filename, index):
    change_tab("test_tab")
    set_fileref(filename, index, "xml_test_filename")

def load_test_file(filename, index):
    change_tab("test_tab")
    load_fileref(filename, index, "xml_test_filename")

def delete_template(index):
    change_tab("main_tab")
    elem = driver.find_elements_by_class_name("remove_template_fileref")
    elem[index].click()

def delete_library(index):
    change_tab("main_tab")
    elem = driver.find_elements_by_class_name("remove_library_fileref")
    elem[index].click()

def delete_instruction(index):
    change_tab("main_tab")
    elem = driver.find_elements_by_class_name("remove_instruction_fileref")
    elem[index].click()


####################################################################
# RETRIEVE VALUES
####################################################################
def get_template_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_template_filename")
    return elems[index].get_attribute("value")


def get_instruction_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_instruction_filename")
    return elems[index].get_attribute("value")

def get_library_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_library_filename")
    return elems[index].get_attribute("value")

def get_ms_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_model-solution_filename")
    return elems[index].get_attribute("value")

def get_test_file(index):
    change_tab("test_tab")
    elems = driver.find_elements_by_class_name("xml_test_filename")
    return elems[index].get_attribute("value")

def get_file_usage(filename):
    change_tab("file_tab")
    elems = driver.find_elements_by_class_name("xml_file_filename")
    index = 0
    for elem in elems:
        if elem.get_attribute("value") == filename:
            break
        index = index + 1

    # print ' ' + filename + ' => ' + str(index)
    usages = driver.find_elements_by_class_name("xml_file_class")
    # print 'get_file_usage for file ' + filename + ' is "' +  usages[index].get_attribute("value") + '"'
    return usages[index].get_attribute("value")



####################################################################
# FILE
####################################################################
def add_file():
    change_tab("file_tab")
    elem = driver.find_element_by_id("addFile").click()

# does not work! only first element is found :-(
#def remove_file(index): # 0-based
#    elem = driver.find_element_by_class_name('xml_file')
#    elem[index].find_element_by_tag_name('button').click()
#    alert = driver.switch_to.alert
#    alert.accept()


def remove_first_file():
    change_tab("file_tab")
    elem = driver.find_element_by_class_name('xml_file')
    elem.find_element_by_tag_name('button').click()
    alert = driver.switch_to.alert
    alert.accept()

def set_filename(file_index, filename): # 0-based
    change_tab("file_tab")
    elem = driver.find_elements_by_class_name('xml_file_filename')
    elem[file_index].send_keys(filename)

def set_file_comment(file_index, text): # 0-based
    # change_tab("file_tab")
    elem = driver.find_elements_by_class_name('xml_file_comment')
    elem[file_index].send_keys(text)

def set_file_class(file_index, option_index):  # 0-based
    change_tab("file_tab")
    elem = driver.find_elements_by_class_name('xml_file_class')
    select = Select(elem[file_index])
    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(option_index)


def set_file_type(file_index, option):  # 0-based
    change_tab("file_tab")
    elem = driver.find_elements_by_class_name('xml_file_type')
    select = Select(elem[file_index])
    # select.select_by_value(value) # unfortunately does not work
    # select.select_by_visible_text(option)
    select.select_by_value(option)


def set_file_text(file_index, text): # 0-based
    change_tab("file_tab")
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
    change_tab("ms_tab")       
    elem = driver.find_element_by_id("addModelsol").click()


def set_model_solution_comment(ms_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_model-solution_comment')
    elem[ms_index].send_keys(text)


# ms_index: 0-based
# file_index: 1-based
def add_file_to_model_solution(ms_index, file_index):
    change_tab("ms_tab")
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!

    elem = driver.find_elements_by_class_name('xml_model-solution_filename')

    # the option has to get the focus in order to fill the list!
    (elem[ms_index]).send_keys(Keys.NULL)
    time.sleep(1);
    showModalWindow()

    # elem = driver.find_elements_by_class_name('mediuminput xml_model-solution_filename')
    select = Select(elem[ms_index])

    # select.select_by_index(0)

    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(file_index)

def append_file_to_model_solution(ms_index):
    change_tab("ms_tab")
    elem = driver.find_elements_by_class_name("add_model-solution_fileref")
    elem[ms_index].click()


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


# Achtung! Index!
# Alle Tests haben ein Fileref-Feld. Der Index muss entsprechend angepasst werden.
# Compiler test hat auch ein solches Feld, was
# aber nicht sichtbar ist. Es zählt aber mit!!
def set_test_file(test_index, file_index):  # 0-based
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!
    elem = driver.find_elements_by_class_name('xml_test_filename')

    # the option has to get the focus in order to fill the list!
    (elem[test_index]).send_keys(Keys.NULL)
    time.sleep(1);
    showModalWindow()

    # elem = driver.find_elements_by_class_name('mediuminput xml_model-solution_filename')
    select = Select(elem[test_index])

    select.select_by_index(0)

    #select.select_by_value(value) # unfortunately does not work
    select.select_by_index(file_index)

####################################################################
# JAVA COMPILER TEST
####################################################################
def add_java_compiler_test():
    change_tab("test_tab")          
    elem = driver.find_element_by_id("addJavaCompilerTest").click()


def set_jct_flags(jct_index, flags): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerFlags')
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(flags)
    set_input_value(elem[jct_index], flags)

def set_jct_output_flags(jct_index, flags): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerOutputFlags')
    set_input_value(elem[jct_index], flags)
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(flags)

def set_jct_libs(jct_index, libs): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerLibs')
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(libs)
    set_input_value(elem[jct_index], libs)


def set_jct_file_pattern(jct_index, pattern): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_CompilerFPatt')
    set_input_value(elem[jct_index], pattern)

#    elem[jct_index].clear()
#    elem[jct_index].send_keys(pattern)
#    value = elem[jct_index].get_attribute('value')
#    if value != pattern:
#        raise Exception('field is not set properly: ' + pattern)


def set_input_value(field, value):
    field.clear()
    if testconfig.browser == "Chrome":
        # value1 = value.replace("^", "\^")
        # Chrome driver does not send ^
        # solution need to be found...
        field.send_keys(value)
    else:
        field.send_keys(value)

    actual_value = field.get_attribute('value')
    if actual_value != value:
        print 'field is not set properly'
        print 'expected = ' + value
        print 'actual   = ' + actual_value
        raise Exception('field is not set properly: ' + value)


####################################################################
# JUNIT TEST
####################################################################
def add_junit_test():
    change_tab("test_tab")              
    elem = driver.find_element_by_id("addJavaJUnitTest").click()


def set_junit_description(junit_index, text): # 0-based
    elem = driver.find_elements_by_class_name('xml_pr_configDescription')
    set_input_value(elem[junit_index], text)
    # elem[junit_index].clear()
    # elem[junit_index].send_keys(text)

def set_junit_test_class(junit_index, classtext):
    elem = driver.find_elements_by_class_name('xml_ju_mainclass')
    # set_input_value(elem[junit_index], classtext)
    elem[junit_index].send_keys(classtext)





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
    change_tab("test_tab")                  
    elem = driver.find_element_by_id("addCheckStyleTest").click()

def set_cs_version(cs_index, version):
    elem = driver.find_elements_by_class_name('xml_pr_CS_version')
    select = Select(elem[cs_index])
    select.select_by_index(version)

def set_cs_max_warnings(cs_index, max_warnings):
    elem = driver.find_elements_by_class_name('xml_pr_CS_warnings')
    set_input_value(elem[cs_index], max_warnings)
    #(elem[cs_index]).clear()
    #(elem[cs_index]).send_keys(max_warnings)



####################################################################
# PYTHON TEST
####################################################################
def add_python_test():
    change_tab("test_tab")                  
    elem = driver.find_element_by_id("addPythonTest").click()


####################################################################
# SETLX TEST
####################################################################
def add_setlx_test():
    change_tab("test_tab")                  
    elem = driver.find_element_by_id("addSetlXTest").click()

####################################################################
# SETLX SYNTAX CHECK
####################################################################
def add_setlx_syntax():
    change_tab("test_tab")                     
    elem = driver.find_element_by_id("addSetlXSyntaxTest").click()

####################################################################
# DEJAGNU SETUP
####################################################################
def add_dejagnu_setup():
    change_tab("test_tab")                      
    elem = driver.find_element_by_id("addDejaGnuSetup").click()

####################################################################
# DEJAGNU TESTER
####################################################################
def add_dejagnu_tester():
    change_tab("test_tab")                     
    elem = driver.find_element_by_id("addDejaGnuTester").click()



####################################################################
# EXPORT/IMPORT
####################################################################
def change_tab(name):
    element = driver.find_element_by_id(name)
    element.click()


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
    change_tab("debug_output")
    elem = driver.find_element_by_id("buttonExport").click()

# 'download' of task.xml
# needs more interaction...
def export_1():
    elem = driver.find_element_by_id("downloadOutput").click()

def import_task_xml():
    change_tab("debug_output");
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

def delete_old_task_files(expected_output, output_folder):

    filename_with_wildcards = getFilenameWithWildcard(expected_output)

    for fl in glob.glob(testconfig.download_path + "/" + filename_with_wildcards):
        os.remove(fl)
    for fl in glob.glob(testconfig.download_path + "/task*.problem"):
        os.remove(fl)
    for fl in glob.glob(output_folder + "/" + filename_with_wildcards):
        os.remove(fl)


# compares two files
def is_file1_equal_to_file2(file1, file2):
    f1 = open(file1, 'r')
    f2 = open(file2, 'r')

    diff_file = file1 + "_diff.tmp"
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
