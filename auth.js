// auth.js - Système d'authentification simulé

class AuthManager {
  constructor() {
    this.currentUser = this.loadCurrentUser();
    this.initializeAuth();
  }

  // Initialisation
  initializeAuth() {
    this.updateUIForAuthState();
    this.setupAuthListeners();
  }

  // Charger l'utilisateur actuel depuis localStorage
  loadCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Sauvegarder l'utilisateur actuel
  saveCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  // Connexion simulée
  login(email, password) {
    // Validation basique
    if (!email || !password) {
      throw new Error("Email et mot de passe requis");
    }

    if (!this.validateEmail(email)) {
      throw new Error("Email invalide");
    }

    // Rechercher ou créer l'utilisateur
    let users = this.getUsers();
    let user = users.find((u) => u.email === email);

    if (!user) {
      // Créer un nouvel utilisateur pour la démo
      user = {
        id: "user_" + Date.now(),
        email: email,
        name: email.split("@")[0],
        createdAt: new Date().toISOString(),
        bookings: [],
      };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Simuler une vérification de mot de passe
    // Dans un vrai système, cela serait fait côté serveur
    if (password.length < 4) {
      throw new Error("Mot de passe trop court (min 4 caractères)");
    }

    // Connexion réussie
    this.saveCurrentUser(user);
    this.updateUIForAuthState();

    return user;
  }

  // Déconnexion
  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.updateUIForAuthState();
    window.location.href = "index.html";
  }

  // Inscription
  register(email, password, name) {
    if (!email || !password || !name) {
      throw new Error("Tous les champs sont requis");
    }

    if (!this.validateEmail(email)) {
      throw new Error("Email invalide");
    }

    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    let users = this.getUsers();

    // Vérifier si l'email existe déjà
    if (users.find((u) => u.email === email)) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Créer le nouvel utilisateur
    const user = {
      id: "user_" + Date.now(),
      email: email,
      name: name,
      createdAt: new Date().toISOString(),
      bookings: [],
    };

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    // Connecter automatiquement
    this.saveCurrentUser(user);
    this.updateUIForAuthState();

    return user;
  }

  // Récupérer tous les utilisateurs
  getUsers() {
    const usersStr = localStorage.getItem("users");
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Valider l'email
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Mettre à jour l'interface selon l'état de connexion
  updateUIForAuthState() {
    const loginLinks = document.querySelectorAll('[data-auth="login"]');
    const logoutLinks = document.querySelectorAll('[data-auth="logout"]');
    const userInfo = document.querySelectorAll('[data-auth="user-info"]');

    if (this.isAuthenticated()) {
      // Masquer les liens de connexion
      loginLinks.forEach((el) => (el.style.display = "none"));

      // Afficher les liens de déconnexion
      logoutLinks.forEach((el) => (el.style.display = "block"));

      // Afficher les infos utilisateur
      userInfo.forEach((el) => {
        el.style.display = "block";
        el.textContent = this.currentUser.name || this.currentUser.email;
      });
    } else {
      // Afficher les liens de connexion
      loginLinks.forEach((el) => (el.style.display = "block"));

      // Masquer les liens de déconnexion
      logoutLinks.forEach((el) => (el.style.display = "none"));

      // Masquer les infos utilisateur
      userInfo.forEach((el) => (el.style.display = "none"));
    }
  }

  // Configurer les écouteurs d'événements
  setupAuthListeners() {
    // Formulaire de connexion
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin(e.target);
      });
    }

    // Formulaire d'inscription
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister(e.target);
      });
    }

    // Boutons de déconnexion
    document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  }

  // Gérer la soumission du formulaire de connexion
  handleLogin(form) {
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
      this.login(email, password);
      this.showMessage("Connexion réussie !", "success");

      // Rediriger après un court délai
      setTimeout(() => {
        const returnUrl =
          new URLSearchParams(window.location.search).get("return") ||
          "index.html";
        window.location.href = returnUrl;
      }, 1000);
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Gérer la soumission du formulaire d'inscription
  handleRegister(form) {
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const name = form.querySelector('[name="name"]').value;

    try {
      this.register(email, password, name);
      this.showMessage("Inscription réussie !", "success");

      // Rediriger après un court délai
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  // Afficher un message
  showMessage(message, type = "info") {
    // Créer un élément de message
    const messageEl = document.createElement("div");
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      background: ${
        type === "success" ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)"
      };
      color: white;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageEl);

    // Retirer après 3 secondes
    setTimeout(() => {
      messageEl.style.animation = "slideOut 0.3s ease";
      setTimeout(() => messageEl.remove(), 300);
    }, 3000);
  }

  // Protéger une page (rediriger si non connecté)
  requireAuth() {
    if (!this.isAuthenticated()) {
      const currentPage = window.location.pathname.split("/").pop();
      window.location.href = `login.html?return=${currentPage}`;
      return false;
    }
    return true;
  }
}

// Exporter l'instance globale
const authManager = new AuthManager();

// Ajouter les styles d'animation
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
