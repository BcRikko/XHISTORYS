/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="./IDB.ts" />
/// <reference path="./background.ts" />
/// <reference path="./utils.ts" />


$(function() {
    var videoInfo = <IVideoInfo>{};

    var domain = location.hostname.toLowerCase();
    switch (true) {
        case /xvideos/.test(domain):
            videoInfo = getXVideosInfo();
            break;
        case /xhamster/.test(domain):
            videoInfo = getXHamsterInfo();
            break;
    }
    
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

    switch (true) {
        case /xvideos/.test(domain):
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
            break;
            
        case /xhamster/.test(domain):
            videoInfo.thumbnail = getThumbnailFromXHamster(videoInfo.id);
            videoInfo.thumbnails = [];
            videoInfo.style = 'background-image:url(' + videoInfo.thumbnail +');background-position:0px,0px;'
            break;
    }

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

/**
 * XVIDEOSの動画情報取得
 */
function getXVideosInfo(): IVideoInfo {
    var videoInfo = <IVideoInfo>{};
    
    videoInfo.id = location.pathname;
    videoInfo.url = location.origin + location.pathname;
    videoInfo.date = getDate();
    videoInfo.isFavorite = 0;   // false

    videoInfo.title = $('#main > h2')[0].childNodes[0].nodeValue.trim();
    videoInfo.time = $('#main h2 > span').text().replace('-', '').trim();

    var tags: string[] = [];
    $('#video-tags').find('a').each(function() {
        if ($(this).attr('href') != '/tags/') {
            tags.push($(this).text());
        }
    });
    videoInfo.tags = tags;
    
    return videoInfo;
}

/**
 * XHamsterの動画情報取得
 */
function getXHamsterInfo(): IVideoInfo {
    var videoInfo = <IVideoInfo>{};
    
    videoInfo.id = location.pathname;
    videoInfo.url = location.origin + location.pathname;
    videoInfo.date = getDate();
    videoInfo.isFavorite = 0;   // false

    videoInfo.title = $('.head > h1').text().trim();
    videoInfo.time = $('#videoUser > .item')[1].childNodes[1].nodeValue.trim();

    var tags: string[] = [];
    $('#channels').find('a').each(function() {
        tags.push($(this).text());
    });
    videoInfo.tags = tags;
    
    return videoInfo;
}


/**
 * XHamsterのサムネURL取得
 */
function getThumbnailFromXHamster(pathname: string): string {
    var baseUrl = 'http://ut00.xhcdn.com/t/{videoId_last3}/s_{videoId}.jpg';
    var videoId = pathname.match(/movies\/(.{7})/)[1];
    
    var thumbnailUrl
        = baseUrl
        .replace('{videoId_last3}', videoId.substr(videoId.length - 3, 3))
        .replace('{videoId}', videoId);

    return thumbnailUrl;
}