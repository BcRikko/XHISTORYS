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
}

var idbInfo: IDBInfo = {
    dbName: 'IDBLibraryTest',
    storeName: 'IDBLibrary',
    version: 1,
    key: { keyPath: 'id', autoIncrement: false },
    sort: [{key: ['date'], unique: false, order: 'prev'}, {key: ['isFavorite', 'date'], unique: false, order: 'prev'}]
};

class MessageType {
    static register = 'register';
    static register_fav = 'register_fav';
    static register_import = 'register_import';

    static search = 'search';
    static search_count = 'search_count';
    
    static fetch = 'fetch';
     static fetch_fav = 'fetch_fav';
    
    static del = 'delete';
    static allDelete = 'allDelete';
    static destroy = 'destroy';
    
    static callApi_thumb = 'callApi_thumb';
}

interface IRequest {
    type: MessageType;
    value: IVideoInfo;
    values?: IVideoInfo[];
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