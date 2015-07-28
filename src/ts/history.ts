/// <reference path="../typings/vue/vue.d.ts" />
/// <reference path="./common.ts" />

interface IExportLink {
    text: string;
    filename: string;
    href: string;
    downloadurl: string;
}

class XHistorys extends Vue {
    videos: IVideoInfo[] = [];
    page: number = 0;
    dispSize: number = 20;
    isLoadFinished = false;
    keywords = '';
    
    // sidebar
    exportData: any;
    link = <IExportLink>{};
    isFinishedExport: boolean;
    
    tags: ITagInfo[] = [];
    
    
    constructor() {
        super(false);

        this._init({
            // el: '#main',
            el: '#xhistorys',
            data: {
                isLoadFinished: this.isLoadFinished,
                page: this.page,
                dispSize: this.dispSize,
                videos: this.videos,
                isShowFavOnly: false,
                keyword: this.keywords,
                // sidebar
                link: this.link,
                isFinishedExport: false,
                tags: this.tags
            },
            methods: {
                fav: this.fav,
                del: this.del,
                thumbChange: this.thumbChange,
                thumbReset: this.thumbReset,
                search: this.search,
                showFirst: function() {
                    this.page = 0;
                },
                showPrev: function() {
                    if (this.isStartPage) return;
                    this.page--;
                },
                showNext: function() {
                    if (this.isEndPage) return;
                    this.page++;
                },
                showLast: function() {
                    this.page = Math.floor(this.videos.length / this.dispSize);
                },
                showPage: function(index: number) {
                    this.page = index;
                },
                showAllOrFav: function() {
                    this.isLoadFinished = false;
                    var _self = this;
                    this.isShowFavOnly = !this.isShowFavOnly;
                    _self.videos = [];

                    if (this.isShowFavOnly) {
                        this.showFavOnly();
                    } else {
                        // Uncaught TypeError: Cannot read property '__vue__' of null になるので暫定対応
                        // this.fetch();
                        window.location.reload(true);
                    }
                    this.page = 0;
                },
                isSplite: function(url: string): boolean {
                    switch (true) {
                        case /xvideos/.test(url):
                            return false;
                        case /xhamster/.test(url):
                            return true;
                        default:
                            return false;
                    }
                },
                // sidebar
                exportHistory: this.exportHistory,
                importHistory: this.importHistory,
                destroy: this.destroy
            },
            created: function() {
                this.isLoadFinished = false;
                console.log('histrot.js: created'),
                this.fetch(),
                this.createTags()
            },
            ready: function() {
                this.isLoadFinished = true;
            },
            computed: {
                displayVideos: function(): IVideoInfo[] {
                    var startPage = this.page * this.dispSize;
                    return this.videos.slice(startPage, startPage + this.dispSize);
                },
                isStartPage: function(): boolean {
                    return (this.page == 0);
                },
                isEndPage: function(): boolean {
                    return ((this.page + 1) * this.dispSize >= this.videos.length);
                },
                isValidFile: function(): boolean {
                    var importfile = (<HTMLInputElement>document.getElementById('import-file')).files[0];
                    if (importfile && getExtension(importfile.name) === 'json') {
                        return true;
                    } else {
                        return false;
                    }
                },
                pageCount: function(): number {
                    return Math.ceil(this.videos.length / this.dispSize);
                }
            },
            filters: {
                formatDate: function(date: string) {
                    // 秒を削除する
                    return date ? date.substr(0, date.lastIndexOf(':')) : '';
                }
            }
        });
    }

    /**
     * お気に入り
     * @param index
     */
    fav(data: any, index: number): void{
        var _self = this;
        var pageIndex = index + (this.page * this.dispSize);
        
        this.videos[pageIndex].isFavorite = this.videos[pageIndex].isFavorite ? 0 : 1; 
        
        chrome.runtime.sendMessage(
            {
                type: MessageType.register_fav,
                value: _self.videos[pageIndex]
            },
            function() { return true;}
            );
    }

    /**
     * 全件データ取得
     */
    fetch(): void {
        var _self = this;
        Promise.resolve()
            .then(() => {
                chrome.runtime.sendMessage(
                    {
                        type: MessageType.fetch,
                        value: null,
                        search: {
                            sort: { key: 'date', unique: false, order: 'prev' },
                        }
                    }
                    );

                chrome.runtime.onMessage.addListener(
                    function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                        if (request.type == MessageType.fetch + '_return') {
                            _self.videos.push(request.value);
                        }
                    }
                    );
            })
            .then(() => { 
                _self.isLoadFinished = true;
            });    
    }
    
    showFavOnly(): void {
        var _self = this;
        Promise.resolve()
            .then(() => {
                chrome.runtime.sendMessage(
                    {
                        type: MessageType.fetch_fav,
                        value: null,
                        search: {
                            sort: { key: ['isFavorite', 'date'], unique: false, order: 'prev' },
                            range: <IDBKeyRange>{ lower: [1, "0000/00/00 00:00:00"], upper: [1, "9999/99/99 23:59:59"], lowerOpen: false, upperOpen: false }

                        }
                    }
                    );

                chrome.runtime.onMessage.addListener(
                    function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                        if (request.type == MessageType.fetch_fav + '_return') {
                            _self.videos.push(request.value);
                        }
                    }
                    );
            })
            .then(() => {
                _self.isLoadFinished = true;
            });
    }

    /**
     * キーワード検索
     */
    search(words: string): void {
        this.isLoadFinished = false;
        this.keywords = words;
        var _self = this;
        _self.videos = [];

        if (words.trim().length == 0) {
            // 再表示
            window.location.reload(true);
            return;
        }

        Promise.resolve()
            .then(() => {
                chrome.runtime.sendMessage(
                    {
                        type: MessageType.fetch_keyword,
                        value: null,
                        search: {
                            sort: { key: 'date', unique: false, order: 'prev' },
                        }
                    }
                    );

                chrome.runtime.onMessage.addListener(
                    function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                        if (request.type == MessageType.fetch_keyword + '_return') {
                            var videoInfo: IVideoInfo = request.value;
                            if (videoInfo.title.toLowerCase().indexOf(words.toLowerCase()) > -1) {
                                _self.videos.push(request.value);
                            } else {
                                videoInfo.tags.forEach((tag) => {
                                    if (tag.toLowerCase().indexOf(words.toLowerCase()) > -1) {
                                        _self.videos.push(request.value);
                                    }
                                });
                            }
                        }
                    }
                    );
            })
            .then(() => {
                _self.isLoadFinished = true;
            });
    }
    
    
    
    /**
     * 対象履歴の削除
     * @param index
     */
    del(index: number): void{
        var _self = this;
        var pageIndex = index + (this.page * this.dispSize);
        
        chrome.runtime.sendMessage(
            {
                type: MessageType.del,
                value: { id: this.videos[pageIndex].id }
            }
            );
        
        chrome.runtime.onMessage.addListener(
            function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                if (request.type == MessageType.del + '_return') {
                    _self.videos.splice(pageIndex, 1);
                    // _self.videos.$remove(pageIndex);
                }
            }
        );
    }
   
    /**
     * オンマウスでサムネの切り替え
     */
    private thumbIntervalId: number;
    thumbChange(videoIndex: number): void{
        var _self = this;
        var index = (this.page * this.dispSize) + videoIndex;
        var thumbIndex = 1;
        this.thumbIntervalId = setInterval(function() {
            
            switch (true) {
                case /xvideos/.test(_self.videos[index].url):
                    _self.videos[index].thumbnail = _self.videos[index].thumbnails[thumbIndex];
                    thumbIndex = (thumbIndex + 1) % 30;
                    break;
                case /xhamster/.test(_self.videos[index].url):
                    var position = -160 * (thumbIndex - 1);
                    _self.videos[index].style = 'background-image:url(' + _self.videos[index].thumbnail + ');background-position:' + position + 'px,0px;';
                    thumbIndex = (thumbIndex + 1) % 10;
                    break;
            }
        }, 600);
    }
    
    thumbReset(videoIndex: number): void{
        var index = (this.page * this.dispSize) + videoIndex;
        clearInterval(this.thumbIntervalId);
        switch (true) {
            case /xvideos/.test(this.videos[index].url):
                this.videos[index].thumbnail = this.videos[index].thumbnails[0];
                break;
            case /xhamster/.test(this.videos[index].url):
                this.videos[index].style = 'background-image:url(' + this.videos[index].thumbnail +');background-position:0px,0px;';
                break;
        }
    }


    /**
     * Sidebar
     */
    createTags(): void {
        var LIMITS_TAGS = 40;
        var _self = this;
        
        new Promise((reslove, reject) => {
                chrome.runtime.sendMessage(
                    {
                        type: MessageType.fetch_tag,
                        value: null,
                        search: {
                            sort: { key: 'count', unique: false, order: 'prev' },
                        }
                    }
                    );

                var tagCount = 0;
                chrome.runtime.onMessage.addListener(
                    function(request: IRequest, sender: chrome.runtime.MessageSender, sendResponse: Function) {
                        if (request.type == MessageType.fetch_tag + '_return') {
                            if (tagCount < LIMITS_TAGS) {
                                _self.tags.push(request.value);
                                tagCount++;
                            } else {
                                reslove();
                            }
                        }
                    }
                    );
            })
            .then(() => {
                if (_self.tags.length <= 0) { return false; }

                var limits = _self.tags.length < LIMITS_TAGS ? _self.tags.length : LIMITS_TAGS;

                var maxSize = 38;
                var minSize = 12;

                var copyTags = _self.tags;

                var max = copyTags[0].count;
                var min = copyTags[limits - 1].count;

                _self.tags = [];
                for (let i = 0; i < limits; i++) {
                    var perc = (max === min) ? 1 : (copyTags[i].count - min) / (max - min);
                    var size = Math.round((maxSize - minSize) * perc + minSize);

                    _self.tags[i] = copyTags[i];
                    _self.tags[i].fontSize = size;
                }

                _self.tags.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            });
     }


    exportHistory(): void {
        var data = JSON.stringify(this.videos);
        var link: IExportLink = {
            text: 'Download',
            filename: 'history_' + getDate() + '.json',
            href: URL.createObjectURL(new Blob([data], { type: 'text/plain' })),
            downloadurl: ["text/plain", 'text', this.link.href].join(':')
        };
        this.link = link;
        this.isFinishedExport = true;
    }
    
    importHistory(): void {
        var importFile = (<HTMLInputElement>document.getElementById('import-file')).files[0];
        if (!importFile) {
            alert('インポートファイルを選択してください。');
            return;
        }
        var importJson: IVideoInfo[];
        var reader = new FileReader();

        this.videos = [];
        var _self = this;
        
        new Promise((resolve, reject) => {
                reader.readAsText(importFile);
                reader.onload = function() {
                    importJson = JSON.parse(reader.result)
                    resolve();
                }
            })
            .then(() => {
                return Promise.all([
                    new Promise((resolve, reject) => {
                        // 履歴用
                        chrome.runtime.sendMessage(
                            {
                                type: MessageType.register_import,
                                value: null,
                                values: importJson
                            }
                            );
    
                        _self.videos = importJson;
                    }),
                    // タグクラウド用
                    new Promise((resolve, reject) => {
                        var importTags: ITagInfo[] = [];
                        var hash: HashTable<ITagInfo> = {};
                        hash
                        importJson.forEach((videoInfo: IVideoInfo) => {
                            videoInfo.tags.forEach((tag) => {
                                if (hash[tag]) {
                                    hash[tag] = <ITagInfo>{ name: tag, count: hash[tag].count + 1, fontSize: 0 };
                                } else {
                                    hash[tag] = <ITagInfo>{ name: tag, count: 1, fontSize: 0 };
                                }
                            });
    
                        });
    
                        chrome.runtime.sendMessage(
                            {
                                type: MessageType.register_import_tags,
                                values: hash
                            },
                            function() {
                            }
                            );
                    })
            ]);
        });
    }
    
    destroy(): void{
        if (confirm('履歴を削除してもよろしいですか？')) {
            chrome.runtime.sendMessage(
                {
                    type: MessageType.destroy,
                    value: null
                }, function() {
                    return true;
                }
                );
            
            this.videos = [];
        }
    }    
}

var xhistorys = new XHistorys();

/**
 * Tagsの非表示対応
 * その他の場所をクリックしたらタグを非表示（Checkboxをoff）にする
 */
document.getElementById('xhistorys').addEventListener('mouseup', function() {
    var isShowTags = document.getElementsByClassName('is-showtags');
    for (let i = 0; i < isShowTags.length; i++){
        (<HTMLInputElement>isShowTags.item(i)).checked = false;
    }
});

/**
 * Chrome上の制約で、インラインでjsが書けないため、ここでsubmitを無効化する
 */
document.getElementById('header-form').addEventListener('submit', function(event) {
    event.preventDefault();
}, false);