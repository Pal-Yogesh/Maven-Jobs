function fetchDataWithTimeout(url, timeoutMs) {
  const fetchPromise = fetch(url);

  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

fetchDataWithTimeout('https://jsonplaceholder.typicode.com/users', 10000)
  .then(response => response.json())
  .then(data => console.log('Data received:', data))
  .catch(error => console.error('Error:', error.message));


const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Promise one resolved"), 500);
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Promise two resolved"), 100);
});

Promise.race([promise1, promise2])
  .then((value) => {
    console.log(value);
  });
// Expected output: "Promise two resolved"
