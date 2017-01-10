from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.support.ui import Select
import os.path

import testconfig

driver = 0


def openBrowser():
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
    print the_path
    editor_path = the_path + "/../proformaEditor101.html"
    print editor_path

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