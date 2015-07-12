// /// <reference path="../typings/jasmine/jasmine.d.ts" />
// /// <reference path="../ts/IDB.ts" />

// //import IDBLibrary = require('../ts/IDB');

// interface IVideoInfo {
//     url: string;
//     title: string;
//     time: string;
//     tags: string[]
// }


// describe('IDBライブラリのテスト', () => {
//     var idb: IDBLibrary;
//     var idbInfo: IDBInfo = {
//         dbName: 'IDBLibraryTest',
//         storeName: 'IDBLibrary',
//         version: 1,
//         key: { keyPath: 'url', autoIncrement: false }
//     };

//     beforeEach((done) => {
//         idb = new IDBLibrary(idbInfo);
//         done();
//     }, 1000);

//     var result: IVideoInfo;
//     var videoInfo: IVideoInfo = {
//         url: "123/abc",
//         title: "データ登録して検索する",
//         time: "1h 00m",
//         tags: ['tag1', 'tag2', 'tag3']
//     };
        
//     it('単純な登録', (done) => {
//         setTimeout(function() {
//             idb.register(videoInfo);
//             idb.search('123/abc', function(value: any) { result = value; });
            
//             // expect(videoInfo).toEqual(result);
//             console.log('6');
//             console.log(result);
//             done();
//         }, 1000);
//     });
    
    
//     afterEach(() => {
//         setTimeout(
//             function() { 
//                 console.log('destroy')
//                 idb.destroy();
//             },
//             2000
//             );
//     });
// });

// // describe('IDBライブラリのテスト', () => {
// //     var idb: IDBLibrary;
// //     var isFinish = false;
    
// //     beforeEach((done) => {
// //         var idbInfo: IDBInfo = {
// //             dbName: 'IDBLibraryTest',
// //             storeName: 'IDBLibrary',
// //             version: 1,
// //             key: { keyPath: 'url', autoIncrement: false }
// //         };
// //         isFinish = true;
// //         idb = new IDBLibrary(idbInfo);
// //         done();
// //     },
// //         1000
// //         );


// //     // beforeEach(() => {
// //     //     var idbInfo: IDBInfo = {
// //     //         dbName: 'IDBLibraryTest',
// //     //         storeName: 'IDBLibrary',
// //     //         version: 1,
// //     //         key: { keyPath: 'url', autoIncrement: false }
// //     //     };
// //     //     idb = new IDBLibrary(idbInfo);
// //     // });

// //     // afterEach(() => {
// //     //     window.setTimeout(
// //     //         function() { idb.destroy() },
// //     //         2000
// //     //         );
// //     // });

// //     it('データ登録して検索する', () => {
// //         var videoInfo: IVideoInfo = {
// //             url: "123/abc",
// //             title: "データ登録して検索する",
// //             time: "1h 00m",
// //             tags: ['tag1', 'tag2', 'tag3']
// //         };

        
// //         window.setTimeout(
// //             function() {
// //                 idb.register(videoInfo);
// //             },
// //             1000
// //             );

// //         var result: IVideoInfo;
// //         window.setTimeout(
// //             function() { idb.search('123/abc', function(value: any) { result = value; }) },
// //             1500
// //             );
// //         window.setTimeout(
// //             function() {
// //                 console.log(result);
// //                 console.log(videoInfo);
// //             },
// //             1800
// //             );
// //         expect(result).toEqual(videoInfo);
        
// //     });
// // });