// booking.js - Système de gestion des réservations (CRUD)

class BookingManager {
  constructor() {
    this.destinations = [];
    this.accommodations = [];
    this.spacecraft = [];
    this.loadData();
  }

  // Charger les données depuis les fichiers JSON
  async loadData() {
    try {
      const [destRes, accomRes, spaceRes] = await Promise.all([
        fetch("destinations.json"),
        fetch("accommodations.json"),
        fetch("spacecraft.json"),
      ]);

      const destData = await destRes.json();
      const accomData = await accomRes.json();
      const spaceData = await spaceRes.json();

      this.destinations = destData.destinations;
      this.accommodations = accomData.accommodations;
      this.spacecraft = spaceData.spacecraft;
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
    }
  }

  // CREATE - Créer une nouvelle réservation
  createBooking(bookingData) {
    // Validation
    this.validateBookingData(bookingData);

    // Vérifier si l'utilisateur est connecté
    if (!authManager.isAuthenticated()) {
      throw new Error("Vous devez être connecté pour réserver");
    }

    const user = authManager.getCurrentUser();

    // Créer la réservation
    const booking = {
      id:
        "booking_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Détails du voyage
      destination: bookingData.destination,
      departureDate: bookingData.departureDate,
      returnDate: bookingData.returnDate || null,
      duration: bookingData.duration || null,

      // Passagers
      passengers: bookingData.passengers || [],
      numberOfPassengers: bookingData.numberOfPassengers || 1,

      // Hébergement
      accommodation: bookingData.accommodation,

      // Informations de contact
      contactInfo: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },

      // Options et extras
      specialRequirements: bookingData.specialRequirements || "",
      extras: bookingData.extras || [],

      // Prix
      basePrice: bookingData.basePrice || 0,
      totalPrice: bookingData.totalPrice || 0,
      currency: bookingData.currency || "USD",

      // Référence
      bookingReference: this.generateBookingReference(),
    };

    // Sauvegarder la réservation
    const bookings = this.getAllBookings();
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Mettre à jour les réservations de l'utilisateur
    this.updateUserBookings(user.id, booking.id);

    return booking;
  }

  // READ - Lire toutes les réservations
  getAllBookings() {
    const bookingsStr = localStorage.getItem("bookings");
    return bookingsStr ? JSON.parse(bookingsStr) : [];
  }

  // READ - Lire une réservation par ID
  getBookingById(bookingId) {
    const bookings = this.getAllBookings();
    return bookings.find((b) => b.id === bookingId);
  }

  // READ - Lire les réservations d'un utilisateur
  getUserBookings(userId) {
    const bookings = this.getAllBookings();
    return bookings.filter((b) => b.userId === userId);
  }

  // READ - Lire les réservations de l'utilisateur actuel
  getCurrentUserBookings() {
    const user = authManager.getCurrentUser();
    if (!user) return [];
    return this.getUserBookings(user.id);
  }

  // UPDATE - Mettre à jour une réservation
  updateBooking(bookingId, updates) {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);

    if (index === -1) {
      throw new Error("Réservation introuvable");
    }

    // Vérifier que l'utilisateur est le propriétaire
    const user = authManager.getCurrentUser();
    if (bookings[index].userId !== user.id) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette réservation");
    }

    // Mettre à jour
    bookings[index] = {
      ...bookings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("bookings", JSON.stringify(bookings));
    return bookings[index];
  }

  // DELETE - Annuler une réservation
  cancelBooking(bookingId) {
    return this.updateBooking(bookingId, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });
  }

  // DELETE - Supprimer définitivement une réservation
  deleteBooking(bookingId) {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);

    if (index === -1) {
      throw new Error("Réservation introuvable");
    }

    // Vérifier que l'utilisateur est le propriétaire
    const user = authManager.getCurrentUser();
    if (bookings[index].userId !== user.id) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette réservation");
    }

    // Supprimer
    bookings.splice(index, 1);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    return true;
  }

  // Recherche et filtrage
  searchBookings(filters) {
    let bookings = this.getCurrentUserBookings();

    if (filters.destination) {
      bookings = bookings.filter((b) =>
        b.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    if (filters.status) {
      bookings = bookings.filter((b) => b.status === filters.status);
    }

    if (filters.dateFrom) {
      bookings = bookings.filter(
        (b) => new Date(b.departureDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      bookings = bookings.filter(
        (b) => new Date(b.departureDate) <= new Date(filters.dateTo)
      );
    }

    return bookings;
  }

  // Validation des données de réservation
  validateBookingData(data) {
    const errors = [];

    // Destination
    if (!data.destination) {
      errors.push("La destination est requise");
    }

    // Date de départ
    if (!data.departureDate) {
      errors.push("La date de départ est requise");
    } else {
      const depDate = new Date(data.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (depDate < today) {
        errors.push("La date de départ ne peut pas être dans le passé");
      }
    }

    // Informations de contact
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push("Le prénom est invalide (min 2 caractères)");
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push("Le nom est invalide (min 2 caractères)");
    }

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push("L'email est invalide");
    }

    if (!data.phone || !this.validatePhone(data.phone)) {
      errors.push("Le numéro de téléphone est invalide");
    }

    // Passagers
    if (!data.numberOfPassengers || data.numberOfPassengers < 1) {
      errors.push("Le nombre de passagers doit être au moins 1");
    }

    // Hébergement
    if (!data.accommodation) {
      errors.push("Le type d'hébergement est requis");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  }

  // Valider l'email
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Valider le téléphone
  validatePhone(phone) {
    const regex = /^[\d\s\-\+\(\)]{8,}$/;
    return regex.test(phone);
  }

  // Générer une référence de réservation
  generateBookingReference() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "SV-";
    for (let i = 0; i < 8; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }

  // Calculer le prix total
  calculateTotalPrice(
    destination,
    accommodation,
    numberOfPassengers,
    extras = []
  ) {
    let basePrice = 0;

    // Prix de la destination
    const dest = this.destinations.find((d) => d.id === destination);
    if (dest) {
      basePrice += dest.price;
    }

    // Prix de l'hébergement
    const accom = this.accommodations.find((a) => a.id === accommodation);
    if (accom) {
      basePrice += accom.pricePerDay * 7; // Exemple: 7 jours
    }

    // Multiplier par le nombre de passagers
    let totalPrice = basePrice * numberOfPassengers;

    // Ajouter les extras
    extras.forEach((extra) => {
      totalPrice += extra.price || 0;
    });

    return totalPrice;
  }

  // Mettre à jour les réservations de l'utilisateur
  updateUserBookings(userId, bookingId) {
    const users = authManager.getUsers();
    const user = users.find((u) => u.id === userId);

    if (user) {
      if (!user.bookings) {
        user.bookings = [];
      }
      user.bookings.push(bookingId);
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  // Obtenir les statistiques des réservations
  getBookingStats() {
    const bookings = this.getCurrentUserBookings();

    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      upcoming: bookings.filter(
        (b) =>
          b.status === "confirmed" && new Date(b.departureDate) > new Date()
      ).length,
      past: bookings.filter(
        (b) =>
          b.status === "confirmed" && new Date(b.departureDate) <= new Date()
      ).length,
      totalSpent: bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };
  }

  // Obtenir la prochaine réservation
  getNextBooking() {
    const bookings = this.getCurrentUserBookings()
      .filter(
        (b) =>
          b.status === "confirmed" && new Date(b.departureDate) > new Date()
      )
      .sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));

    return bookings[0] || null;
  }
}

// Exporter l'instance globale
const bookingManager = new BookingManager();
