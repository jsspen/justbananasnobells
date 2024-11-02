// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjosAVlpJZDSTkSi0xPIK77Z1YVhilQaU",
  authDomain: "justbananas-52bf9.firebaseapp.com",
  databaseURL: "https://justbananas-52bf9-default-rtdb.firebaseio.com",
  projectId: "justbananas-52bf9",
  storageBucket: "justbananas-52bf9.appspot.com",
  messagingSenderId: "318911824684",
  appId: "1:318911824684:web:190fef41135cf946ac2289",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("shoppingList");

// Select DOM elements
const form = document.getElementById("item-form");
const shoppingList = document.querySelector("#shopping-list tbody");
const clearBtn = document.getElementById("clear-completed");
const storeFilter = document.getElementById("store-filter");

// Add item to Firebase
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const item = {
    name: document.getElementById("item-name").value,
    quantity: document.getElementById("quantity").value,
    store: document.getElementById("store").value,
    notes: document.getElementById("notes").value,
    completed: false,
    timestamp: Date.now(),
  };
  db.push(item);
  form.reset();
});

// Render items from Firebase
db.on("value", (snapshot) => {
  shoppingList.innerHTML = "";
  const stores = new Set();
  const items = [];

  snapshot.forEach((child) => {
    const item = child.val();
    item.id = child.key;
    items.push(item);
    stores.add(item.store.trim());
  });

  // Sort items: incomplete first
  items.sort((a, b) => a.completed - b.completed || a.timestamp - b.timestamp);

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = item.completed ? "completed" : "";

    // Checkbox
    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.addEventListener("change", () => {
      db.child(item.id).update({
        completed: checkbox.checked,
        timestamp: Date.now(),
      });
    });
    tdCheckbox.appendChild(checkbox);
    tr.appendChild(tdCheckbox);

    // Item Name
    const tdName = document.createElement("td");
    tdName.textContent = item.name;
    tr.appendChild(tdName);

    // Quantity
    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = item.quantity;
    tr.appendChild(tdQuantity);

    // Store
    const tdStore = document.createElement("td");
    tdStore.textContent = item.store.trim();
    tr.appendChild(tdStore);

    // Notes
    const tdNotes = document.createElement("td");
    tdNotes.textContent = item.notes;
    tr.appendChild(tdNotes);

    shoppingList.appendChild(tr);
  });

  // Populate store filter dropdown
  populateStoreFilter(stores);
});

// Populate Store Filter
function populateStoreFilter(stores) {
  storeFilter.innerHTML = '<option value="all">All</option>';
  stores.forEach((store) => {
    const option = document.createElement("option");
    option.value = store;
    option.textContent = store;
    storeFilter.appendChild(option);
  });
}

// Clear completed items
clearBtn.addEventListener("click", () => {
  db.orderByChild("completed")
    .equalTo(true)
    .once("value", (snapshot) => {
      snapshot.forEach((child) => {
        db.child(child.key).remove();
      });
    });
});

// Filter items by store
storeFilter.addEventListener("change", () => {
  const filter = storeFilter.value;
  if (filter === "all") {
    db.on("value", () => {}); // Reset listener
  } else {
    db.on("value", (snapshot) => {
      shoppingList.innerHTML = "";
      const items = [];
      snapshot.forEach((child) => {
        const item = child.val();
        if (item.store.trim() === filter) {
          item.id = child.key;
          items.push(item);
        }
      });
      items.sort(
        (a, b) => a.completed - b.completed || a.timestamp - b.timestamp
      );
      items.forEach((item) => {
        const tr = document.createElement("tr");
        tr.className = item.completed ? "completed" : "";

        // Checkbox
        const tdCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.completed;
        checkbox.addEventListener("change", () => {
          db.child(item.id).update({
            completed: checkbox.checked,
            timestamp: Date.now(),
          });
        });
        tdCheckbox.appendChild(checkbox);
        tr.appendChild(tdCheckbox);

        // Item Name
        const tdName = document.createElement("td");
        tdName.textContent = item.name;
        tr.appendChild(tdName);

        // Quantity
        const tdQuantity = document.createElement("td");
        tdQuantity.textContent = item.quantity;
        tr.appendChild(tdQuantity);

        // Store
        const tdStore = document.createElement("td");
        tdStore.textContent = item.store.trim();
        tr.appendChild(tdStore);

        // Notes
        const tdNotes = document.createElement("td");
        tdNotes.textContent = item.notes;
        tr.appendChild(tdNotes);

        shoppingList.appendChild(tr);
      });
    });
  }
});
