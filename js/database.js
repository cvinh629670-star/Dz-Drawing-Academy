const request = (operation) => new Promise((resolve, reject) => {
  operation.onsuccess = () => resolve(operation.result);
  operation.onerror = () => reject(operation.error);
});
let database;
export async function openDatabase() {
  const opening = indexedDB.open('dz-drawing-academy', 1);
  opening.onupgradeneeded = () => opening.result.createObjectStore('academy');
  database = await request(opening);
}
export function read(key) {
  return request(database.transaction('academy').objectStore('academy').get(key));
}
export function entries() {
  return new Promise((resolve, reject) => {
    const records = [];
    const cursor = database.transaction('academy').objectStore('academy').openCursor();
    cursor.onerror = () => reject(cursor.error);
    cursor.onsuccess = () => {
      if (!cursor.result) return resolve(records);
      records.push([cursor.result.key, cursor.result.value]);
      cursor.result.continue();
    };
  });
}
export function write(records, replace = false) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction('academy', 'readwrite');
    const store = tx.objectStore('academy');
    if (replace) store.clear();
    for (const [key, value] of records) store.put(value, key);
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error ?? Error('Giao dịch đã hủy'));
  });
}
export const put = (key, value) => write([[key, value]]);
export function change(key, update) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction('academy', 'readwrite');
    const store = tx.objectStore('academy');
    const row = store.get(key);
    let value, failure;
    row.onsuccess = () => {
      try { value = update(row.result); store.put(value, key); }
      catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve(value);
    tx.onabort = () => reject(failure ?? tx.error);
  });
}
