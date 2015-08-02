/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

/// <reference path="./common.ts" />
/// <reference path="./IDB.ts" />
/// <reference path="./background.ts" />
/// <reference path="./utils.ts" />


$(function() {
    var videoInfo = <IVideoInfo>{}; // 登録情報
    var alreadyInfo: IVideoInfo;    // 既存履歴の情報
    var count = 1;                  // 視聴回数のカウント

    var domain = location.hostname.toLowerCase();
    switch (true) {
        case /xvideos/.test(domain):
            videoInfo = getXVideosInfo();
            break;
        case /xhamster/.test(domain):
            videoInfo = getXHamsterInfo();
            break;
    }

    Promise.resolve()
        .then(() => {
            // 履歴を検索し、視聴回数をカウントする
            return new Promise((resolve, reject) => {
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

                            if (alreadyInfo) {
                                if (request.value.count > 0) {
                                    count = request.value.count + 1;
                                }
                            }
                            resolve();
                        }
                    }
                    );
            })
        })
        .then(() => {
            // サムネの取得
            return new Promise((resolve, reject) => {
                switch (true) {
                    case /xvideos/.test(domain):
                        // サムネ取得（Api呼び出し）
                        chrome.runtime.sendMessage(
                            {
                                type: MessageType.callApi_thumb,
                                value: videoInfo
                            }, function(value: IVideoInfo) {
                                videoInfo = value;
                                videoInfo.thumbnail = value.thumbnails[0] ? value.thumbnails[0] : '';
                                resolve();
                            }
                            );
                        break;

                    case /xhamster/.test(domain):
                        videoInfo.thumbnail = getThumbnailFromXHamster(videoInfo.id);
                        videoInfo.thumbnails = [];
                        videoInfo.style = 'background-image:url(' + videoInfo.thumbnail + ');background-position:0px,0px;'
                        resolve();
                        break;
                }
            });
        })
        .then(() => {
            return Promise.all([
                // 視聴履歴の登録
                new Promise((resolve, reject) => {
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
                    resolve();
                }),
                
                // タグクラウドの登録
                new Promise((resolve, reject) => {
                    if (alreadyInfo) return;
                    videoInfo.tags.forEach((tag) => {
                        var tagCount = 1;

                        new Promise((resolve, reject) => {
                            chrome.runtime.sendMessage(
                                {
                                    type: MessageType.search_tag,
                                    value: tag
                                }
                                );

                            chrome.runtime.onMessage.addListener(
                                function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                                    if (request.type == MessageType.search_tag + '_return') {
                                        if (request.value && request.value.count > 0) {
                                            tagCount = request.value.count + 1;
                                        }
                                        resolve();
                                    }
                                }
                                );
                        })
                        .then(() => {
                            chrome.runtime.sendMessage(
                                {
                                    type: MessageType.register_tags,
                                    value: <ITagInfo>{ name: tag, count: tagCount, fontSize: 0 }
                                },
                                function() {
                                });
                        });
                    });
                }),
                
                // カレンダーの登録
                new Promise((resolve, reject) => {
                    var today = videoInfo.date.substr(0, 10);
                    var calendar: ICalInfo;
                    
                    new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage(
                            {
                                type: MessageType.search_calendar_watch,
                                value: today
                            }
                            );
                        chrome.runtime.onMessage.addListener(
                            function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                                if (request.type == MessageType.search_calendar_watch + '_return') {
                                    if (request.value) {
                                        var ids = (<ICalInfo>request.value).ids;
                                        ids.push(videoInfo.id);

                                        calendar = { date: today, ids: ids };
                                    }
                                    else {
                                        calendar = { date: today, ids: [videoInfo.id] };
                                    }
                                    resolve();
                                }
                            }
                            );
                    })
                    .then(() => {
                        chrome.runtime.sendMessage(
                            {
                                type: MessageType.register_calendar,
                                value: calendar
                            },
                            function() {
                            });
                    });
                })
            ])
        });
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
            tags.push($(this).text().toLowerCase());
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
        tags.push($(this).text().toLowerCase());
    });
    videoInfo.tags = tags;
    
    return videoInfo;
}


/**
 * XHamsterのサムネURL取得
 */
function getThumbnailFromXHamster(pathname: string): string {
    var baseUrl = 'http://ut00.xhcdn.com/t/{videoId_last3}/s_{videoId}.jpg';
    var videoId = pathname.match(/movies\/(.*)\//)[1];
    
    var thumbnailUrl
        = baseUrl
        .replace('{videoId_last3}', videoId.substr(videoId.length - 3, 3))
        .replace('{videoId}', videoId);

    return thumbnailUrl;
}