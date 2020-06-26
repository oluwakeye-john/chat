navigator.serviceWorker.register("./sw.js");

const push = (title, text) => {
  navigator.serviceWorker.ready.then(function (registration) {
    registration.showNotification(title, {
      body: text,
      //   icon: '../images/touch/chrome-touch-icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      tag: "vibration-sample",
    });
  });
};

function notifyMe(title, text) {
  try {
    console.log(Notification.permission);
    if (Notification.permission === "granted") {
      push(title, text);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission(function (result) {
        if (result === "granted") {
          push(title, text);
        }
      });
    }
  } catch {
    console.log("Notification error");
  }
}
