(function () {
    var toolbarElem = document.getElementById('toolbar');
    var wysiwygElem = document.getElementById('wysiwyg');

    var editor = ace.edit("html");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/html");
    editor.getSession().setUseWrapMode(true);

    /**
     * html から dom element を生成します
     * @param {string} html
     * @return {Node}
     */
    function createElement(html) {
        var parent = document.createElement('div');
        parent.innerHTML = html;
        return parent.firstChild;
    }

    /**
     * @param {string} name
     * @param f
     */
    function addToolbarButton(name, f) {
        var elem = createElement(
            '<button type="button" class="btn btn-default">' + name + '</button>');
        elem.addEventListener('click', f);

        toolbarElem.appendChild(elem);
    }

    /**
     * @param {Node} node
     * @param {number} position
     * @return {Node[]}
     */
    function splitTextNode(node, position) {
        /** @type {string} */
        var text = node.textContent;
        var textList = [text.slice(0, position), text.slice(position)];
        return textList.map(function (a) {
            return document.createTextNode(a)
        });
    }

    /**
     * キャレット位置へノードを挿入します
     * @param {Node} node
     */
    function insertNode(node) {
        // selection は複数の range を持つことができます。
        // range はドキュメントの一部を表します。
        var selection = window.getSelection();

        if (!selection.isCollapsed) {
            console.log('範囲選択時は未対応');
            return;
        }

        var anchorNode = selection.anchorNode;
        if (anchorNode.nodeType === 1) { // 要素リストの中に挿入する場合
            if (anchorNode.childNodes.length === 0) {
                anchorNode.appendChild(node);
            } else {
                anchorNode.insertBefore(
                    node,
                    anchorNode.childNodes[selection.anchorOffset]);
            }
        } else if (anchorNode.nodeType === 3) { // テキストの途中に挿入する場合
            var textNodes = splitTextNode(anchorNode, selection.anchorOffset);
            /** @type {Node} */
            var parentElement = anchorNode.parentNode;
            textNodes.forEach(function (a) {
                parentElement.insertBefore(a, anchorNode);
            });
            parentElement.insertBefore(node, textNodes[1]);
            parentElement.removeChild(anchorNode);
        }
    }

    function insertTable() {
        insertNode(createElement(
            '<table>' +
            '<tr><th>ヘッダ1</th><th>ヘッダ2</th></tr>' +
            '<tr><td>要素1</td><td>要素2</td></tr>' +
            '</table>'
        ));
    }

    function insertOl() {
        insertNode(createElement(
            '<ol><li>アイテム1</li><li>アイテム2</li></ol>'
        ));
    }

    function insertImage() {
        insertNode(createElement(
            '<img class="mini" src="http://up.gc-img.net/post_img_web/2014/10/obRAZJMFv9XQgSp_6058.jpeg">'
        ));
    }

    function insertUser() {
        var frag = document.createDocumentFragment();
        frag.appendChild(createElement('<span class="user-name">@user</span>'));
        frag.appendChild(createElement(' '));
        insertNode(frag);
    }

    function getParentElement(node, tagName) {
        if (!node || node === wysiwygElem) {
            return null;
        }

        if (node.tagName === tagName) {
            return node;
        }
        return getParentElement(node.parentNode, tagName);
    }

    function processTab() {
        var selection = window.getSelection();
        if (!selection.isCollapsed) {
            console.log('範囲選択時は未対応');
            return;
        }

        var anchorNode = selection.anchorNode;
        var tableElem = getParentElement(anchorNode, 'TBODY');
        if (tableElem) {
            tableElem.appendChild(
                createElement('<table><tbody><tr>' +
                    '<td><br></td>' +
                    '<td><br></td>' +
                    '</tr></tbody></table>').firstChild.firstChild
            );
        }
    }

    function wysiwygToHtml() {
        editor.setValue(wysiwygElem.innerHTML);
    }

    wysiwygElem.addEventListener('keydown', function (e) {
        console.log(e);
        var key = e.keyCode;
        if (key === 50) { // @
            insertUser();
            e.preventDefault();
        } else if (key === 9) { // tab
            processTab();
            e.preventDefault();
        }
    });

    addToolbarButton('table', function () {
        insertTable();
    });

    addToolbarButton('ol', function () {
        insertOl()
    });

    addToolbarButton('画像', function () {
        insertImage();
    });

    addToolbarButton('ソースの取得', function () {
        wysiwygToHtml();
    });

    wysiwygElem.appendChild(createElement("<p><br>"));
})
();
