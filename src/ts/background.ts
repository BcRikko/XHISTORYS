/// <reference path="../typings/chrome/chrome.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="./IDB.ts" />

var idb = new IDBLibrary(idbInfo);
var idbTags = new IDBLibrary(tagInfo);

chrome.runtime.onMessage.addListener(
    function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
        var background = new Background();
        switch (request.type) {
            case MessageType.register:
            case MessageType.register_fav:
            case MessageType.register_import:
                background.register(request, sendResponse);
                break;
            case MessageType.search:
                background.search(request, sendResponse);
                break;
            case MessageType.search_count:
                background.searchForTabs(request, sendResponse);
                break;
            case MessageType.fetch:
            case MessageType.fetch_fav:
                background.fetch(request, sendResponse);
                break;
            case MessageType.del:
                background.del(request, sendResponse);
                break;
            case MessageType.allDelete:
                background.allDelete(request, sendResponse);
                break;
            case MessageType.destroy:
                background.destroy(request, sendResponse);
                break;
            case MessageType.callApi_thumb:
                background.callApi(request, sendResponse);
                break;
            case MessageType.register_tags:
            case MessageType.register_import_tags:
                background.registerTags(request, sendResponse);
                break;
            case MessageType.search_tag:
            case MessageType.search_import_tag:    
                background.searchTag(request, sendResponse);
                break;
            case MessageType.fetch_tag:
                background.fetchTag(request, sendResponse);
                break;
            default:
                // console.log('default:' + request.type);
                break;
        }
    }
    );

/**
 * Background用クラス
 */
class Background {
    /**
     * 登録
     * @param request
     * @param callback
     */
    register(request: IRequest, callback: Function): void {
        console.log('background.js: register');
        
        if (request.values) {
            for (let i = 0; i < request.values.length; i++) {
                idb.register(request.values[i]);
            }
        } else {
            idb.register(request.value);
        }    
        if (callback) {
            callback(request);
        }
    }

    registerTags(request: IRequest, callback: Function): void{
        console.log('background.js: registerTags');

        if (request.values) {
            // for (let i = 0; i < request.values.length; i++) {
            //     idbTags.register(request.values[i]);
            // }
            for (var key in request.values) {
                idbTags.register(request.values[key])
            }
        } else {
            idbTags.register(request.value);
        }  

        if (callback) {
            callback(request);
        }
    }
    
    /**
     * 検索
     * @param request
     * @param callback  ※基本はcallbackではなくsendMessageを返す
     */    
    search(request: IRequest, callback?: Function): void {
        console.log('background.js: search');
        idb.search(request.value.id, function(result:IVideoInfo) {
            chrome.runtime.sendMessage(
                {
                    type: request.type + '_return',
                    value: result
                }
                );
        });
    }

    searchTag(request: IRequest, callback?: Function): void{
        console.log('background.js: searchTag');
        idbTags.search(request.value, function(result: ITagInfo) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: request.type + '_return',
                    value: result
                }, function(response) { });
            });
        });
    }


    /**
     * 検索（Content Script用）
     * @param request
     * @param callback  ※基本はcallbackではなくsendMessageを返す
     */
    searchForTabs(request: IRequest, callback?: Function): void{
        idb.search(request.value.id, function(result: IVideoInfo) {
            console.log(result);
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: MessageType.search_count + '_return',
                    value: result
                }, function(response) { });
            });
        });
    }

    /**
     * 全検索
     * @param request
     * @param callback  ※基本はcallbackではなくsendMessageを返す
     */
    fetch(request: IRequest, callback?: Function): void {
        console.log('background.js: fetch');
        idb.fetch(request,
            function(result: IVideoInfo) {
                chrome.runtime.sendMessage(
                    {
                        type: request.type + '_return',
                        value: result
                    }
            );
        });
    }

    fetchTag(request: IRequest, callback?: Function): void{
        console.log('background.js: fetch_tag');
        idbTags.fetch(request,
            function(result: ITagInfo) {
                chrome.runtime.sendMessage(
                    {
                        type: request.type + '_return',
                        value: result
                    }
                );
            });
    }
    
    /**
     * 削除
     * @param request
     * @param callback
     */
    del(request: IRequest, callback?: Function): void {
        console.log('background.js: delete');
        idb.delete(request.value.id, function() {
            chrome.runtime.sendMessage(
                {
                    type: MessageType.del + '_return',
                    value: null
                }
                );
        });
    }

    /**
     * 全削除
     * @param request
     * @param callback
     */    
    allDelete(request: IRequest, callback: Function): void {
        console.log('background.js: allDelete');
        idb.allDelete();
        if (callback) {
            callback(request);
        }
    }

    /**
     * データベースの削除
     * @param request
     * @param callback
     */
    destroy(request: IRequest, callback?: Function): void {
        console.log('background.js: destroy');
        idb.destroy();
        idbTags.destroy();
        if (callback) {
            callback(request);
        }
    }
    
    /**
     * API呼び出し(サムネ取得)
     * @param request
     * @param callback(必須)
     */
    callApi(request: IRequest, callback: Function): void {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://api.erodouga-rin.net/thumbnails?url=' + request.value.url, false);
        req.send();
        
        if (req.status == 200) {
            var videoInfo = request.value;
            videoInfo.thumbnails = JSON.parse(req.responseText).thumbnails;
            
            if (callback) {
                callback(videoInfo);
            }
        }
    }
}


/**
 * BrowserActionによるページ起動
 */
chrome.browserAction.onClicked.addListener(function(tab: chrome.tabs.Tab): void {
    var url = "html/history.html";
    chrome.tabs.create({ url: url, windowId: tab.windowId });
});

