

let dbVersion = 1;
let IDB = null;
let db;
let renderImg = () => { };
let requestURL = '';
let imageKey = ''

// 创建数据库
const createObjectStore = function (dataBase) {
  dataBase.createObjectStore("elephants");
};

function getImageFile(requestURL, imageKey, cb) {
  if (!requestURL) return;
  var xhr = new XMLHttpRequest(),
    blob;

  xhr.open("GET", requestURL, true);
  xhr.responseType = "blob";

  xhr.addEventListener("load", function () {
    if (xhr.status === 200) {
      setTimeout(() => {
        blob = xhr.response;
        putElephantInDb(blob, imageKey, cb);
      }, 2000)
    }
  }, true);

  xhr.send();
}

// 存入图片
function putElephantInDb(blob, imageKey, cb) {
  // 新建事务
  var transaction = db.transaction(["elephants"], 'readwrite');
  transaction.objectStore("elephants").add(blob, imageKey);

  transaction.objectStore("elephants").get(imageKey).onsuccess = function (event) {
    // 存完回调
    cb && cb(event.target.result)
  };
};

/**
 * 获取图片url
 * @param {*} key 
 */
function read(key, url, success) {
  var transaction = db.transaction(['elephants']);
  var objectStore = transaction.objectStore('elephants');
  var request = objectStore.get(key);

  request.onerror = function (event) {
    console.log('事务失败');
  };

  // 获取成功回调
  success = success || function (event) {
    if (request.result) {
      renderImg(request.result)
    } else {
      getImageFile(url);
    }
  };
  request.onsuccess = function (event) {
    success(event, request);
  };
}

/**
 * 初始化
 * @param {*} callback 
 */
const init = () => {
  // 打开数据库
  IDB = indexedDB.open("elephantFiles", dbVersion);
  IndexDBHook();
}

/**
 * indexedDB
 */
const IndexDBHook = () => {
  // 数据库打开成功
  IDB.onsuccess = function (event) {
    console.log("Success creating/accessing IndexedDB database");
    db = IDB.result;

    db.onerror = function (event) {
      console.log("Error creating/accessing IndexedDB database");
    };

    // if (db.version != dbVersion) {
    //   var setVersion = db.setVersion(dbVersion);
    //   setVersion.onsuccess = function () {
    //     createObjectStore(db);
    //     getImageFile();
    //   };
    // } else {
    //   read(imageKey)
    // }
  }

  IDB.onupgradeneeded = function (event) {
    createObjectStore(event.target.result);
  };
}

/**
 * 获取图片信息
 * @param {*} url 
 * @param {*} key 
 * @param {*} callback 
 */
const getImageInfo = (url, key, callback = () => { }) => {
  read(key, url, (result, request) => {
    if (request.result) {
      callback(request.result)
    } else {
      getImageFile(url, key);
    }
  })
}

export {
  init,
  read,
  getImageInfo
};