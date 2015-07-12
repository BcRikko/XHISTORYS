// 保存先：C:\Users\username\AppData\Local\Google\Chrome\User Data\Default\IndexedDB

/// <reference path="../typings/chrome/chrome.d.ts" />
/// <reference path="./common.ts" />



interface IDBInfo {
    dbName: string;
    storeName: string;
    version: number;
    key: { keyPath: string; autoIncrement: boolean; };
    sort: ISortKey[]; 
}

class IDBLibrary {
    private _idb: IDBDatabase;
    private _idbInfo: IDBInfo;
    
    /**
     * コンストラクタ
     * @param dbInfo IDBの情報
     */
    constructor(dbInfo: IDBInfo) {
        this._idbInfo = dbInfo;
        var req = indexedDB.open(this._idbInfo.dbName, this._idbInfo.version);
        
        req.onupgradeneeded = () => {
            this._idb = req.result;
            var store = this._idb.createObjectStore(this._idbInfo.storeName, this._idbInfo.key);
            this._idbInfo.sort.forEach(function(sort: ISortKey) {
                store.createIndex(sort.key, sort.key, { unique: sort.unique });
            });
            
            
            console.log("success:onupgradeneeded");
        }
        
        req.onsuccess = () => {
            this._idb = req.result;
            
            console.log("success:onsuccess");
        }
    }
    
    /**
     * 登録
     * @param value     登録する情報（JSON） 
     */
    register(value: any): void {
        var tran = this._idb.transaction(this._idbInfo.storeName, 'readwrite');
        var store = tran.objectStore(this._idbInfo.storeName);
    
        var req = store.put(value);

        req.onsuccess = () => {
            console.log("success:register");
        }

        req.onerror = () => {
            throw 'error:register' + req.error.toString();
        }
    }
    
    /**
     * 検索
     * @param key       検索キー
     * @param callback  検索結果に対する処理
     */
    search(key: any, callback:Function): void {
        var tran = this._idb.transaction(this._idbInfo.storeName, 'readonly');
        var store = tran.objectStore(this._idbInfo.storeName);
        
        var req = store.get(key);
        
        req.onsuccess = () => {
            var result = req.result;

            if (result && callback) {
                callback(result);
            } else {
                console.log('対象データは存在しません。')
            }

            console.log('success:search');
        }
    }

    /**
     * フェッチ
     * @param callback  検索結果に対する処理
     */
    fetch(request:IRequest, callback: Function): void {
        var tran = this._idb.transaction(this._idbInfo.storeName, 'readonly');
        var store = tran.objectStore(this._idbInfo.storeName);
        
        var range: IDBKeyRange;
        if (request.search && request.search.range) {
            range = IDBKeyRange.bound(
                request.search.range.lower,
                request.search.range.upper,
                request.search.range.lowerOpen,
                request.search.range.upperOpen
                );
        }    
        var req: IDBRequest;
        if (request.search && request.search.sort) {
            req = store.index(request.search.sort.key).openCursor(range, request.search.sort.order);
        } else {
            req = store.openCursor();
        } 
        req.onsuccess = function() {
            var cursor = <IDBCursorWithValue>req.result;
            if (cursor && callback) {
                callback(cursor.value);
                cursor.continue();
            }
        }
        
        req.onerror = () => {
             throw 'error:fetch' + req.error.toString();
        }
    }
    
    /**
     * 削除
     * @param key       削除するキー
     */
    delete(key: any, callback?: Function): void{
        var tran = this._idb.transaction(this._idbInfo.storeName, 'readwrite');
        var store = tran.objectStore(this._idbInfo.storeName);
        
        var req = store.delete(key);

        req.onsuccess = () => {
            if (callback) {
                callback();
            }
            console.log("success:delete");
        }
        
        req.onerror = () => {
            throw 'error:delete' + req.error.toString();
        }
    }
    
    /**
     * 全件削除
     */
    allDelete(): void{
        var tran = this._idb.transaction(this._idbInfo.storeName, 'readwrite');
        var store = tran.objectStore(this._idbInfo.storeName);
        
        var req = store.clear();

        req.onsuccess = () => {
            console.log("success:allDelete");
        }
        
        req.onerror = () => {
            throw 'error:allDelete' + req.error.toString();
        }
        
    }
    
    /**
     * データベースの削除
     */
    destroy(): void{
        var req = indexedDB.deleteDatabase(this._idbInfo.dbName);

        req.onsuccess = () => {
            console.log("success:destroy");
        }
        
        req.onerror = () => {
            throw 'error:destroy' + req.error.toString();
        }
    }
    
}