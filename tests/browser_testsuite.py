import editor
import runpy

# TODO... das geht leider so nicht

print "run 1. test"
editor.browser = "Firefox"
runpy.run_module('testsuite.py')


print "run 2. test"
editor.browser = "Chrome"
runpy.run_module('testsuite.py')
