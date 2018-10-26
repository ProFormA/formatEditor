/*
 * This proformaEditor was created by the eCULT-Team of Ostfalia University
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
 *
 * Author:
 * Karin Borm, Dr. Uta Priss
 */


const DEBUG_MODE = false;
const TEST_MODE  = false;

const codeversion   = '3.0.0 pre';                     // current version of this code


const version094    = 'taskxml0.9.4.xsd';                // name of schema files
const version101    = 'taskxml1.0.1.xsd';


function getDescriptionHtmlString(description, comment) {
    return "<p><label for='xml_description' class='leftlabel'>Description: </label>" +
    "<textarea rows='2'  class='xml_description' " +
    "title = 'Visible description'>"+description+"</textarea>" +
        //"<br>" +
        "</p><p>" +
        "<label for='xml_internal_description'  class='leftlabel'>Internal Description:</label>" +
    "<textarea rows='2'  class='xml_internal_description' " +
    "title = 'Internal description (not visible)'>"+comment+"</textarea></p>";
}

// without . (MyString.Java = java)
// to lowercase
function getExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// convert to mimetype that can be directely handeled by codemirror
function getMimeType(mimetype, filename) {
    const extension = getExtension(filename);
    switch (extension.toLowerCase()) {
        // case 'log':
        // case 'txt':
        case 'xml':  return 'application/xml';
        case 'html':  return 'text/html';
        default: return config.getMimetype(mimetype, extension);
    }
}

//////////////////////////////////////////////////////////////////////////////
/* Each newly exported task needs its own UUID.
 * This function generates and returns an UUID.
 */
function generateUUID(){
    var date = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c_value) {
        var rand = (date + Math.random()*16)%16 | 0;
        date = Math.floor(date/16);
        return (c_value == 'x' ? rand : (rand&0x3|0x8)).toString(16);
    });
    return uuid;
};


