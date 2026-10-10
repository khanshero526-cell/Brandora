// BRANDORA - Admin Login
(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBN4ht6ktmWlLm_QwpJp4-K_9Ghwmlye8c",
        authDomain: "brandora-82748.firebaseapp.com",
        databaseURL: "https://brandora-82748-default-rtdb.firebaseio.com",
        projectId: "brandora-82748",
        storageBucket: "brandora-82748.firebasestorage.app",
        messagingSenderId: "535562047751",
        appId: "1:535562047751:web:ff03cc5dd490103b1f75a2"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();

    const style = document.createElement("style");
    style.textContent = `
        #adminSection { display: none !important; }
        #adminLoginBox {
            max-width: 420px;
            margin: 40px auto;
            padding: 24px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-family: Arial, sans-serif;
        }
        #adminLoginBox input {
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            margin: 12px 0;
        }
        #adminLoginBox button {
            padding: 12px 18px;
            cursor: pointer;
        }
        #adminLoginMessage { overflow-wrap: anywhere; }
    `;
    document.head.appendChild(style);

    const box = document.createElement("div");
    box.id = "adminLoginBox";
    box.innerHTML = `
        <h2>Admin Login</h2>
        <p>Sirf store admin yahan login kare.</p>
        <form id="adminLoginForm">
            <input id="adminEmail" type="email"
                placeholder="Admin email" autocomplete="username" required>
            <input id="adminPassword" type="password"
                placeholder="Password" autocomplete="current-password" required>
            <button type="submit">Login</button>
        </form>
        <p id="adminLoginMessage" role="status"></p>
        <button id="adminLogoutButton" type="button" hidden>Logout</button>
    `;

    const adminSection = document.getElementById("adminSection");
    if (adminSection) {
        adminSection.parentNode.insertBefore(box, adminSection);
    }

    const message = document.getElementById("adminLoginMessage");
    const form = document.getElementById("adminLoginForm");
    const logoutButton = document.getElementById("adminLogoutButton");

    function showAdminLink() {
        const links = document.querySelectorAll(
            '.admin-nav-link, a[href="#adminSection"]'
        );
        links.forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                box.scrollIntoView({ behavior: "smooth" });
            });
        });
    }

    showAdminLink();

    auth.onAuthStateChanged(user => {
        if (user && adminSection) {
            adminSection.style.setProperty("display", "block", "important");
            box.querySelector("h2").textContent = "Admin Account";
            form.hidden = true;
            message.textContent = "Login successful.";
            logoutButton.hidden = false;
        } else if (adminSection) {
            adminSection.style.setProperty("display", "none", "important");
            box.querySelector("h2").textContent = "Admin Login";
            form.hidden = false;
            message.textContent = "";
            logoutButton.hidden = true;
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        message.textContent = "Logging in...";

        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            form.reset();
            message.textContent = "Login successful.";
        } catch (error) {
            message.textContent =
                "Login failed. Email/password check karo.";
        }
    });

    logoutButton.addEventListener("click", async function () {
        try {
            await auth.signOut();
            message.textContent = "You have logged out.";
            box.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            message.textContent = "Logout nahi ho saka. Dobara try karo.";
        }
    });EXOTIC
