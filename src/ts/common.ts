interface IVideoInfo {
    id: string;
    url: string;
    title: string;
    time: string;
    tags: string[];
    isFavorite: number;
    // date: Date;
    date: string;
    count: number;
    thumbnail: string;
    thumbnails: string[];
    
    style: string;          // サムネの表示方法（XHamster用）
}

var idbInfo: IDBInfo = {
    dbName: 'IDBLibraryTest',
    storeName: 'IDBLibrary',
    version: 1,
    key: { keyPath: 'id', autoIncrement: false },
    sort: [
        { key: ['date'], unique: false, order: 'prev' },
        { key: ['isFavorite', 'date'], unique: false, order: 'prev' }
    ]
};

interface ITagInfo {
    name: string;
    count: number;
    
    fontSize: number;       // タグクラウド用
}

var tagInfo: IDBInfo = {
    dbName: 'IDBTagCloud',
    storeName: 'TagCloud',
    version: 1,
    key: { keyPath: 'name', autoIncrement: false },
    sort: [{key: ['count'], unique:false, order: 'prev'}]
};

interface ICalInfo {
    date: string;
    ids: string[];
}

var calInfo: IDBInfo = {
    dbName: 'IDBCalendar',
    storeName: 'Calendar',
    version: 1,
    key: { keyPath: 'date', autoIncrement: false },
    sort: [{ key: ['date'], unique: false, order: 'prev' }]
};


interface HashTable<T> {
    [key: string]: T;
}

class MessageType {
    static register = 'register';
    static register_fav = 'register_fav';
    static register_tags = 'register_tags';
    static register_calendar = 'register_calendar';
    static register_import = 'register_import';
    static register_import_tags = 'register_import_tags';
    static register_import_calendar = 'register_import_calendar';

    static search = 'search';
    static search_id = 'search_id';
    static search_count = 'search_count';
    static search_tag = 'search_tag';
    static search_import_tag = 'search_import_tag';
    static search_calendar = 'search_calendar';
    static search_calendar_watch = 'search_calendar_watch';
    
    static fetch = 'fetch';
    static fetch_fav = 'fetch_fav';
    static fetch_tag = 'fetch_tag';
    static fetch_keyword = 'fetch_keyword';
    static fetch_calendar = 'fetch_calendar';
    
    static del = 'delete';
    static allDelete = 'allDelete';
    static destroy = 'destroy';
    
    static callApi_thumb = 'callApi_thumb';
}

interface IRequest {
    type: MessageType;
    value: any;
    values?: any[];
    search: {
        sort: ISortKey;
        range?: IDBKeyRange;
        derection?: string;
    };
    request?: any;
}

interface ISortKey {
    key: string[];
    order: string;
    unique: boolean;
}