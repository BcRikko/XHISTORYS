/**
 * 現在時刻の取得（yyyy/MM/dd HH:mm:ss）
 */
function getDate(): string {
    var now = new Date();
    var date = now.getFullYear() + '/'
        + paddingForDate(now.getMonth() + 1) + '/'
        + paddingForDate(now.getDate()) + ' '
        + paddingForDate(now.getHours()) + ':'
        + paddingForDate(now.getMinutes()) + ':'
        + paddingForDate(now.getSeconds());
    return date;
}

function paddingForDate(date: number) {
    return (date < 10) ? '0' + date : date;
}

/**
 * 拡張子の取得
 * @param filename
 * @return 拡張子をLowerCaseで返す
 */
function getExtension(filename: string): string {
    var type = filename.split('.');
    return type[type.length - 1].toLocaleLowerCase();
}