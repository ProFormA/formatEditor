/*
 * This is part of the proformaEditor which was created by the eCULT-Team
 * of Ostfalia University
 * http://ostfalia.de/cms/de/ecult/
 * The software is distributed under a CC BY-SA 3.0 Creative Commons license
 * https://creativecommons.org/licenses/by-sa/3.0/
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * contains functions and data relevant for handling java tests (i.e. submission is
 * a Java source code file)
 *
 * Created by KarinBorm on 21.03.2017.
 */


/*

 */


function java_codeWithoutComment(code) {
    var newCode = code.replace(/\/\*[\s\S]*?\*\//gm, "COMMENT1"); // comment with /* */
    var newCode = newCode.replace(/\/\/.*/g, "COMMENT2"); // comment with //
    return newCode;
}


/*
  function searches given text string (source code) for the classname and
  a package name. At first all comment lines are removed in order to avoid
  delivering data written in comment.
 */
function java_getClassAndPackage(code) {
    function java_getPackageName(code) {
        const package = code.match(/package([\s\S]*?);/);
        if (!package) return "";
        switch (package.length) {
            case 0:  return ""; // no package found
            case 1:  return package[0]; // unclear what it is, deliver everything
            default: return package[1].trim(); // found, expect package name as 2nd
        }
    }

    function java_getClasseName(code) {
        const className = code.match(/class([\s\S]*?)(\{|extends|implements)/);
        if (!className) return "";
        switch (className.length) {
            case 0:  return ""; // no className found???
            case 1:  return className[0]; // unclear what it is, deliver everything
            default: return className[1].trim(); // found, expect className name as 2nd
        }
    }

    // preset return value
    var out = { class:"?", package:"?" };
    var pureCode = java_codeWithoutComment(code);
    out.class = java_getClasseName(pureCode);
    out.package = java_getPackageName(pureCode);
    return out;
}