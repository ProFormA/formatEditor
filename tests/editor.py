# coding=utf-8

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
# editor controlling functions
#
# @copyright 2018 Ostfalia Hochschule fuer angewandte Wissenschaften
# @author   Karin Borm <k.borm@ostfalia.de>

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
import thread

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



timeoutSave = 3.5
timeoutSaveLonCapa = 3.5
timeoutSelectChrome = 1
timeoutLoadFileref = 1.5
timeoutTypeFilename = 1
timeoutSetFileref = 0.3
#timeoutSetFileref = 1.5
timeoutAddFileToMs = 1
timeoutSetFileTest = 1
timeoutOpenLoadDialog = 1.5
timeoutReadXml = 1.5
timeoutConfirmSave = 2.5
timeoutConfirmOpen = 2.5
timeoutSwitchToSave = 1
timeoutClickAndAlert = 1
timeoutClick = 0.2

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
    editor_path = the_path + "/../proformaEditor.html"
    # print editor_path
    driver.get("file:///" + editor_path)
    driver.execute_script('enableTestMode();')


def openEditorPage():
#    driver.get("https://media.elan-ev.de/proforma/editor/releases/preview/proformaEditor101.html")
    driver.get("http://127.0.0.1:8000/proformaEditor.html")
    driver.set_window_size(1024,768)
    driver.execute_script('enableTestMode();')


def init(the_driver):
    global driver
    driver = the_driver

def closeBrowser():
    # driver.close() # webdriver throws an exception for Firefox if close and quit is called
    driver.quit()

####################################################################

thread_started = False
def fillOpenFileDialog(filename):
    global thread_started
    thread_started = True
    # print "thread started"
    time.sleep(timeoutOpenLoadDialog)

    # print "type text into dialog"
    # control the modal window with pynpy (not selenium!)
    # type filename in input field
    keyboard = Controller()
    keyboard.type(filename)
    # Press and release enterD:\users\karin\Code\zell\git\formatEditor\tests\input\Hello_World_094.zip
    time.sleep(timeoutTypeFilename)

    keyboard.press(Key.enter)
    keyboard.release(Key.enter)


def load_task_file(task_file, content_will_be_deleted):
    the_path = os.path.dirname(os.path.abspath(__file__))
    filename = the_path + "/" + task_file
    filename = filename.replace("/", "\\") # needed on Windows!!
    # print filename

    # print "press load button"
    elem = driver.find_element_by_id("button_load")
    if browser == "Edge":
        global thread_started
        thread_started = False
        # .... Edge kommt erst wieder, wenn man den Dialog beendet hat :-(
        thread.start_new_thread(fillOpenFileDialog, (filename,))
        while not thread_started:
            pass
    elem.click()

    if browser != "Edge":
        fillOpenFileDialog(filename)

        #time.sleep(timeoutOpenLoadDialog)

        # control the modal window with pynpy (not selenium!)
        # type filename in input field
        #keyboard = Controller()
        #keyboard.type(filename)
        # Press and release enterD:\users\karin\Code\zell\git\formatEditor\tests\input\Hello_World_094.zip
        #time.sleep(timeoutTypeFilename)

        #keyboard.press(Key.enter)
        #keyboard.release(Key.enter)

        #time.sleep(timeoutReadXml)

    # print "wait for rendering to complete"
    time.sleep(timeoutConfirmOpen)

    if content_will_be_deleted:
        alert = driver.switch_to.alert
        alert.accept()


def getFilenameWithWildcard(file_name):
    tokens = file_name.split('.')
    filename_with_wildcards = tokens[0] + "*." + tokens[1]
    # print filename_with_wildcards
    return filename_with_wildcards


def confirmDownloadSaveDialog(dialogkey):

    if browser == "Chrome":
        return

    time.sleep(timeoutConfirmSave)
    # a new window is opened asking what to do with the download
    # print "confirm dialog"
    keyboard = Controller()

    if browser == "Firefox":
        global firstTimeDialogs
        if firstTimeDialogs[dialogkey]:
            # print "1. Download => Speichern statt Öffnen wählen"
            # switch to save (instead of open)
            # print "cursor down"
            keyboard.press(Key.down)
            keyboard.release(Key.down)
            time.sleep(timeoutSwitchToSave)
            firstTimeDialogs[dialogkey] = False

        # print "enter"

        keyboard.press(Key.enter)
        keyboard.release(Key.enter)
    elif browser == "Edge":
        pass
        #alert = driver.switch_to.alert
        #alert.dismiss()

    # print "confirmDownloadSaveDialog finished"

def save_task_file_plain(modelSolution_alert):
    # print "press save zip button"
    elem = driver.find_element_by_id("buttonZip")
    elem.click()

    if modelSolution_alert:
        confirmPopup()

    # if browser == "Firefox":
    confirmDownloadSaveDialog('zip')


    # wait for download to complete
    time.sleep(timeoutSave)


def save_task_file(expected_file_name, move_to_folder, move_to_filename_xml):
    # print "press save zip button"
    elem = driver.find_element_by_id("buttonZip")
    elem.click()

    # if browser == "Firefox":
    confirmDownloadSaveDialog('zip')

    # wait for download to complete
    time.sleep(timeoutSave)



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

    # if browser == "Firefox":
    confirmDownloadSaveDialog('loncapa')

    # wait for download to complete
    time.sleep(timeoutSaveLonCapa)

    import glob
    listing = glob.glob(testconfig.download_path + "/task*.problem")
    lastname = None
    for filename in listing:
        lastname = filename
        # print filename

    if lastname == None:
        raise Exception('expected LON-CAPA-problem file ' + testconfig.download_path + "/task*.problem does not exist")

    # print "rename " + lastname + " to " +expected_file_name
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
    set_input_field("xml_title", text)

def set_task_comment(text):
    elem = driver.find_element_by_css_selector('#xml_task_internal_description .xml_internal_description')
    elem.clear()
    elem.send_keys(text)

#    set_input_field("xml_task_internal_description", text)


def set_filesize(text):
    change_tab("ms_tab")
    set_input_field("xml_submission_size", text)

# depricated
#def set_mimetype(text):
#    set_input_field("xml_upload-mime-type", text)

def add_restrict_filename():
    change_tab("ms_tab")
    elems = driver.find_elements_by_class_name("add_subm_files")
    elem = elems[0].click()

def set_restrict_filename(index, text, regexp, optional):
    change_tab("ms_tab")
    elems = driver.find_elements_by_class_name("xml_restrict_filename")
    elem = elems[index]
    elem.clear()
    elem.send_keys(text)

    elems = driver.find_elements_by_class_name("xml_file_regexp")
    set_checkbox_value(elems[index], regexp)

    elems = driver.find_elements_by_class_name("xml_optional")
    set_checkbox_value(elems[index], optional)

#    set_input_field("xml_restrict_filename", text)

#def set_LON_CAPA_path(text):
#    change_tab("main_tab")
#    set_input_field("lczip", text)

def set_language(text):
    change_tab("main_tab")
    select_option("xml_lang", text)

def set_prog_language(text):
    change_tab("main_tab")
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
    time.sleep(timeoutSelectChrome)
    keyboard = Controller()

    for i in range (0, opt_index):
        # print "[down]"
        keyboard.press(Key.down)
        keyboard.release(Key.down)
        # time.sleep(1)

    # print "[enter]"
    keyboard.press(Key.enter)
    keyboard.release(Key.enter)


#def add_display_file():
#    change_tab("main_tab")
#    elems = driver.find_elements_by_class_name("add_multimedia_fileref")
#    #    elems = driver.find_elements_by_class_name("add_visible_fileref")
#    elem = elems[0].click()

def add_template_file():
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("add_template_fileref")
#    elems = driver.find_elements_by_class_name("add_visible_fileref")
    elem = elems[0].click()

def add_download_file():
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("add_download_fileref")
#    elems = driver.find_elements_by_class_name("add_visible_fileref")
    elem = elems[0].click()

def add_test_file(index):
    change_tab("test_tab")
    elems = driver.find_elements_by_class_name("add_test_fileref")
    elem = elems[index].click()


# def set_visible_fileref(filename, index, displaymode):
#     set_fileref(filename, index, "xml_visible_filename")
#     elems = driver.find_elements_by_class_name('xml_lms_usage')
#     elem = elems[index]
#     select = Select(elem)
#     select.select_by_value(displaymode)
#     time.sleep(timeoutClick)


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

    time.sleep(timeoutSetFileref)


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

    time.sleep(timeoutLoadFileref)

    # print "type text into dialog"
    # control the modal window with pynpy (not selenium!)
    # type filename in input field
    keyboard = Controller()
    keyboard.type(filename)
    time.sleep(timeoutTypeFilename)

    keyboard.press(Key.enter)
    keyboard.release(Key.enter)

    # print "wait for rendering to complete"
    time.sleep(timeoutSetFileref)


def set_display_mode(index, displaymode):
    elems = driver.find_elements_by_class_name('xml_lms_usage')
    elem = elems[index]
    select = Select(elem)
    select.select_by_value(displaymode)
    time.sleep(timeoutClick)


#def load_display_file(filename, index):
#    change_tab("main_tab")
#    load_fileref(filename, index, "xml_multimedia_filename")
##    load_fileref(filename, index, "xml_visible_filename")
##    set_display_mode(index, 'display')

#def set_display_filename(filename, index):
#    change_tab("main_tab")
##    set_visible_fileref(filename, index, "display")
#    set_fileref(filename, index, "xml_multimedia_filename")


def load_download_file(filename, index):
    change_tab("main_tab")
    load_fileref(filename, index, "xml_download_filename")
#    load_fileref(filename, index, "xml_visible_filename")
#    set_display_mode(index, 'download')

def set_download_filename(filename, index):
    change_tab("main_tab")
    set_fileref(filename, index, "xml_download_filename")

#    set_visible_fileref(filename, index, "download")
    #set_fileref(filename, index, "xml_multimedia_filename")


def load_template_file(filename, index):
    change_tab("main_tab")
    load_fileref(filename, index, "xml_template_filename")
#    load_fileref(filename, index, "xml_visible_filename")
#    set_display_mode(index, 'edit')


def set_code_skeleton(text):
    change_tab("main_tab")
    command = 'codeskeleton.setValue("' + text + '")'
    # print command
    driver.execute_script(command);

    #set_fileref(filename, index, "xml_template_filename")
    #set_visible_fileref(filename, index, "edit")



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

def delete_download(index):
    change_tab("main_tab")
    elem = driver.find_elements_by_class_name("remove_download_fileref")
    elem[index].click()

def delete_display(index):
    change_tab("main_tab")
    elem = driver.find_elements_by_class_name("remove_multimedia_fileref")
    elem[index].click()


####################################################################
# RETRIEVE VALUES
####################################################################
#def get_visible_file(index):
#    change_tab("main_tab")
#    elems = driver.find_elements_by_class_name("xml_visible_filename")
#    return elems[index].get_attribute("value")

def get_template_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_template_filename")
    return elems[index].get_attribute("value")


def get_display_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_multimedia_filename")
    #print 'displayfile ' + elems[index].get_attribute("value")
    return elems[index].get_attribute("value")

def get_download_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_download_filename")
    return elems[index].get_attribute("value")

def get_ms_file(index):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_model-solution_filename")
    return elems[index].get_attribute("value")

def get_test_file(index):
    change_tab("test_tab")
    elems = driver.find_elements_by_class_name("xml_test_filename")
    return elems[index].get_attribute("value")

def get_displaymode(filename):
    change_tab("main_tab")
    elems = driver.find_elements_by_class_name("xml_visible_filename")
    index = 0
    for elem in elems:
        if elem.get_attribute("value") == filename:
            break
        index = index + 1

    # print ' ' + filename + ' => ' + str(index)
    usages = driver.find_elements_by_class_name("xml_lms_usage")
    # print 'get_displaymode for file ' + filename + ' is "' +  usages[index].get_attribute("value") + '"'
    return usages[index].get_attribute("value")



####################################################################
# FILE
####################################################################
# todo: adding files is no longer supported
# => add file in fileref drop down list
def add_file():
    change_tab("file_tab")
    elem = driver.find_element_by_id("addFile").click()
    time.sleep(timeoutClick);

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
    time.sleep(timeoutClickAndAlert);
    alert = driver.switch_to.alert
    alert.accept()

def set_filename(file_index, filename): # 0-based
    change_tab("file_tab")
    elem = driver.find_elements_by_class_name('xml_file_filename')
    elem[file_index].send_keys(filename)

def set_file_comment(file_index, text): # 0-based
    # change_tab("file_tab")
    #elem = driver.find_elements_by_class_name('xml_file_comment')
    #elem[file_index].send_keys(text)
    elem = driver.find_element_by_css_selector('#file_' + str(file_index+1) + ' .xml_internal_description')
    elem.send_keys(text)


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

def set_model_solution_description(ms_index, text): # 0-based
    elem = driver.find_element_by_css_selector('#modelsolution_' + str(ms_index+1) + ' .xml_description')
    elem.send_keys(text)

def set_model_solution_comment(ms_index, text): # 0-based
    # Edge-Treiber kann leider kein find_element_by_css_selector
    elem = driver.find_element_by_css_selector('#modelsolution_' + str(ms_index+1) + ' .xml_internal_description')
    elem.send_keys(text)

#    elem = driver.find_element_by_css_selector('.xml_model-solution .xml_internal_description')
#    elem = driver.find_elements_by_class_name('xml_model-solution_comment')
    # elem[ms_index].send_keys(text)


# ms_index: 0-based
# file_index: 1-based
def add_file_to_model_solution(ms_index, file_index):
    change_tab("ms_tab")
    # There seems to be a bug in the geckodriver:
    # The following code does not run with Firefox!

    elem = driver.find_elements_by_class_name('xml_model-solution_filename')

    # the option has to get the focus in order to fill the list!
    (elem[ms_index]).send_keys(Keys.NULL)
    time.sleep(timeoutAddFileToMs);
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


def set_test_description(test_index, text): # 0-based
    elem = driver.find_element_by_css_selector('#test_' + str(test_index+1) + ' .xml_description')
    elem.send_keys(text)

def set_test_comment(test_index, text): # 0-based
    elem = driver.find_element_by_css_selector('#test_' + str(test_index+1) + ' .xml_internal_description')
    elem.send_keys(text)


def set_checkbox_value(elem, value):
    is_checked = elem.get_attribute('checked')
    # convert from string to bool
    bool_is_checked = False
    if is_checked == 'true':
        bool_is_checked = True
    if bool_is_checked != value:
        elem.click()

#def set_test_public(test_index, public):
#    elem = driver.find_elements_by_class_name('xml_pr_public')
    #select = Select(elem[test_index])
    #select.select_by_visible_text(public)
    ###select.select_by_value(value) # unfortunately does not work
#    set_checkbox_value(elem[test_index], public == 'True')
    #is_checked = elem[test_index].get_attribute('checked')
    ## convert
    #bool_is_checked = False
    #if is_checked == 'true':
    #    bool_is_checked = True
    #shall_be_checked = (public == 'True')
    #if bool_is_checked != shall_be_checked:
    #    elem[test_index].click()


#def set_test_required(test_index, required):
#    elem = driver.find_elements_by_class_name('xml_pr_required')
    #select = Select(elem[test_index])
    #####select.select_by_value(value) # unfortunately does not work
    #select.select_by_visible_text(required)
#    set_checkbox_value(elem[test_index], required == 'True')

    #is_checked = elem[test_index].get_attribute('checked')
    #shall_be_checked = (required == 'True')
    #if is_checked != shall_be_checked:
    #    elem[test_index].click()


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
    time.sleep(timeoutSetFileTest);
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
    elem = driver.find_element_by_id("addCompilerTest").click()


#def set_jct_flags(jct_index, flags): # 0-based
#    elem = driver.find_elements_by_class_name('xml_pr_CompilerFlags')
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(flags)
#    set_input_value(elem[jct_index], flags)

#def set_jct_output_flags(jct_index, flags): # 0-based
#    elem = driver.find_elements_by_class_name('xml_pr_CompilerOutputFlags')
#    set_input_value(elem[jct_index], flags)
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(flags)

#def set_jct_libs(jct_index, libs): # 0-based
#    elem = driver.find_elements_by_class_name('xml_pr_CompilerLibs')
    # elem[jct_index].clear()
    # elem[jct_index].send_keys(libs)
#    set_input_value(elem[jct_index], libs)


#def set_jct_file_pattern(jct_index, pattern): # 0-based
#    elem = driver.find_elements_by_class_name('xml_pr_CompilerFPatt')
#    set_input_value(elem[jct_index], pattern)

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
    elem = driver.find_element_by_id("addJUnitTest").click()


#def set_junit_description(junit_index, text): # 0-based
#    elem = driver.find_elements_by_class_name('xml_pr_configDescription')
#    set_input_value(elem[junit_index], text)

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
    #time.sleep(2)


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
            subelement.setAttribute('uuid', 'deleted')


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
            subelement.setAttribute('uuid', 'deleted')

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





def is_problem_file1_equal_to_file2_except_for_version(file1, file2):

    f1 = open(file1)
    line1 = f1.readline()
    f2 = open(file2)
    line2 = f2.readline()
    while line1:
        line1 = f1.readline()
        line2 = f2.readline()
        if line1.startswith('<!-- generated with ProFormA editor version'):
            continue
        if line1 != line2:
            print 'problem file line diff'
            print line1
            print line2
            f1.close()
            f2.close()
            return False

    f1.close()
    f2.close()

    return True



def perform_xml_lint_check(task_xml):
    filename = "xmllint.exe"
    if os.path.isfile(filename):
        os.system("xmllint --noout --schema ../taskxml1.0.1.xsd " + task_xml);

    pass
    # xmllint --noout --schema schema.xsd file.xml
