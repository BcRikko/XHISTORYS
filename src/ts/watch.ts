/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="./IDB.ts" />
/// <reference path="./background.ts" />
/// <reference path="./utils.ts" />


$(function() {
    var videoInfo: IVideoInfo = <IVideoInfo>{};
    // var idb = new IDBLibrary(idbInfo);

    videoInfo.id = location.pathname;
    videoInfo.url = location.href;
    videoInfo.date = getDate();
    videoInfo.title = $('#main > h2')[0].childNodes[0].nodeValue.trim();
    videoInfo.time = $('#main h2 > span').text().replace('-', '').trim();
    videoInfo.isFavorite = 0;   // false
    
    var tags: string[] = [];
    $('#video-tags').find('a').each(function() {
        if ($(this).attr('href') != '/tags/') {
            tags.push($(this).text())
        }
    });
    videoInfo.tags = tags;


    var alreadyInfo: IVideoInfo;
    // 視聴回数のカウント
    var count = 1;
    chrome.runtime.sendMessage(
        {
            type: MessageType.search_count,
            value: videoInfo
        }
        );
    chrome.runtime.onMessage.addListener(
        function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
            if (request.type == MessageType.search_count + '_return') {
                alreadyInfo = request.value;
                if (request.value.count > 0) {
                    count = request.value.count + 1;
                }
            }
        }
        );

    // サムネ取得（Api呼び出し）
    chrome.runtime.sendMessage(
        {
            type: MessageType.callApi_thumb,
            value: videoInfo
        }, function(value: IVideoInfo) {
            videoInfo = value;
            videoInfo.thumbnail = value.thumbnails[0];
        }
        );
    
    
    // 登録
    setTimeout(function() {
        videoInfo.count = count;
        if (alreadyInfo) {
            videoInfo.isFavorite = alreadyInfo.isFavorite;
        } else {
            videoInfo.isFavorite = 0;   // false
        }
        chrome.runtime.sendMessage(
            {
                type: MessageType.register,
                value: videoInfo
            },
            function() {
            });
    }, 1500);
});

