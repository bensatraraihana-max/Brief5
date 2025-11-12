// app.js - Logique principale de l'application de réservation

class BookingApp {
  constructor() {
    this.selectedDestination = null;
    this.selectedAccommodation = null;
    this.passengers = [];
    this.extras = [];
    this.prices = {
      base: 0,
      accommodation: 0,
      extras: 0,
      total: 0,
    };

    this.init();
  }

  async init() {
    // Attendre que les données soient chargées
    await this.waitForData();

    // Initialiser les composants
    this.setupDestinations();
    this.setupAccommodations();
    this.setupDateInput();
    this.setupPassengers();
    this.setupExtras();
    this.setupFormSubmission();
    this.setupValidation();
    this.setupAutoSave();

    // Charger les données sauvegardées
    this.loadSavedData();
  }

  // Attendre que les données soient chargées
  async waitForData() {
    let attempts = 0;
    while (!bookingManager.destinations.length && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  // === CONFIGURATION DES DESTINATIONS ===
  setupDestinations() {
    const select = document.getElementById("destination");
    const destinationInfo = document.getElementById("destinationInfo");

    // Remplir le select
    bookingManager.destinations.forEach((dest) => {
      const option = document.createElement("option");
      option.value = dest.id;
      option.textContent = `${dest.name} - ${PriceValidator.formatPrice(
        dest.price,
        dest.currency
      )}`;
      option.dataset.destination = JSON.stringify(dest);
      select.appendChild(option);
    });

    // Gérer le changement de destination
    select.addEventListener("change", (e) => {
      if (e.target.value) {
        const dest = JSON.parse(
          e.target.selectedOptions[0].dataset.destination
        );
        this.selectedDestination = dest;

        // Afficher les informations
        destinationInfo.classList.remove("hidden");
        document.getElementById("dest-duration").textContent =
          dest.travelDuration;
        document.getElementById("dest-distance").textContent = dest.distance;
        document.getElementById("dest-gravity").textContent = dest.gravity;
        document.getElementById("dest-price").textContent =
          PriceValidator.formatPrice(dest.price, dest.currency);

        // Mettre à jour le résumé
        document.getElementById("summary-destination").textContent = dest.name;

        // Recalculer le prix
        this.calculatePrice();
      } else {
        destinationInfo.classList.add("hidden");
        this.selectedDestination = null;
      }
    });
  }

  // === CONFIGURATION DES HÉBERGEMENTS ===
  setupAccommodations() {
    const container = document.getElementById("accommodationOptions");

    // Afficher les 3 options principales
    const mainAccommodations = ["standard", "luxury", "zero-g"];
    const filteredAccommodations = bookingManager.accommodations.filter((a) =>
      mainAccommodations.includes(a.id)
    );

    filteredAccommodations.forEach((accom) => {
      const card = document.createElement("div");
      card.className = "accommodation-card p-4 rounded-lg";
      card.dataset.accommodationId = accom.id;
      card.innerHTML = `
        <h4 class="font-orbitron text-lg mb-2 text-neon-blue">${accom.name}</h4>
        <p class="text-sm text-gray-400 mb-3">${accom.shortDescription}</p>
        <div class="text-neon-blue font-bold">${PriceValidator.formatPrice(
          accom.pricePerDay,
          accom.currency
        )}/jour</div>
      `;

      card.addEventListener("click", () => {
        // Désélectionner les autres
        document
          .querySelectorAll(".accommodation-card")
          .forEach((c) => c.classList.remove("selected"));

        // Sélectionner celle-ci
        card.classList.add("selected");
        this.selectedAccommodation = accom;

        // Mettre à jour le résumé
        document.getElementById("summary-accommodation").textContent =
          accom.name;

        // Recalculer le prix
        this.calculatePrice();
      });

      container.appendChild(card);
    });
  }

  // === CONFIGURATION DE LA DATE ===
  setupDateInput() {
    const dateInput = document.getElementById("departureDate");
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum demain
    dateInput.min = today.toISOString().split("T")[0];

    dateInput.addEventListener("change", (e) => {
      const date = new Date(e.target.value);
      document.getElementById("summary-date").textContent =
        DateValidator.formatDate(date);
    });

    // Durée
    document.getElementById("duration").addEventListener("change", (e) => {
      document.getElementById(
        "summary-duration"
      ).textContent = `${e.target.value} jours`;
      this.calculatePrice();
    });
  }

  // === CONFIGURATION DES PASSAGERS ===
  setupPassengers() {
    const passengersList = document.getElementById("passengersList");
    const addBtn = document.getElementById("addPassengerBtn");
    const radios = document.querySelectorAll('[name="numberOfPassengers"]');

    // Initialiser avec 1 passager
    this.addPassengerForm(1);

    // Gérer le changement du nombre de passagers via radio
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const count = parseInt(e.target.value);
        document.getElementById("summary-passengers").textContent = count;

        // Ajuster le nombre de formulaires
        while (this.passengers.length < count) {
          this.addPassengerForm(this.passengers.length + 1);
        }
        while (this.passengers.length > count) {
          this.removePassengerForm();
        }

        this.calculatePrice();
      });
    });

    // Bouton ajouter passager
    addBtn.addEventListener("click", () => {
      const count = this.passengers.length + 1;
      document
        .querySelector(`[name="numberOfPassengers"][value="${count}"]`)
        ?.click() || this.addPassengerForm(count);

      // Mettre à jour le résumé
      document.getElementById("summary-passengers").textContent = count;
      this.calculatePrice();
    });
  }

  // Ajouter un formulaire de passager
  addPassengerForm(number) {
    const passengersList = document.getElementById("passengersList");

    const passengerCard = document.createElement("div");
    passengerCard.className =
      "passenger-card bg-space-purple/20 p-4 rounded-lg";
    passengerCard.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-orbitron text-lg">Passager ${number}</h4>
        ${
          number > 1
            ? '<button type="button" class="remove-passenger text-red-500 hover:text-red-400"><i class="fas fa-times"></i></button>'
            : ""
        }
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Prénom" class="form-input px-3 py-2" data-passenger="firstName">
        <input type="text" placeholder="Nom" class="form-input px-3 py-2" data-passenger="lastName">
        <input type="number" placeholder="Âge" min="0" max="150" class="form-input px-3 py-2" data-passenger="age">
        <input type="email" placeholder="Email (optionnel)" class="form-input px-3 py-2" data-passenger="email">
      </div>
    `;

    // Gérer la suppression
    const removeBtn = passengerCard.querySelector(".remove-passenger");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        passengerCard.remove();
        this.passengers.splice(number - 1, 1);
        this.renumberPassengers();

        // Mettre à jour le résumé
        document.getElementById("summary-passengers").textContent =
          this.passengers.length;
        this.calculatePrice();
      });
    }

    passengersList.appendChild(passengerCard);
    this.passengers.push({ number });
  }

  // Supprimer le dernier passager
  removePassengerForm() {
    const passengersList = document.getElementById("passengersList");
    const lastCard = passengersList.lastElementChild;
    if (lastCard) {
      lastCard.remove();
      this.passengers.pop();
    }
  }

  // Renuméroter les passagers après suppression
  renumberPassengers() {
    document.querySelectorAll(".passenger-card").forEach((card, index) => {
      card.querySelector("h4").textContent = `Passager ${index + 1}`;
    });
  }

  // === CONFIGURATION DES EXTRAS ===
  setupExtras() {
    const extrasPrices = {
      spacewalk: 5000,
      "vr-training": 2000,
      "photo-package": 1500,
    };

    document.querySelectorAll('[name="extras"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.extras.push({
            id: e.target.value,
            price: extrasPrices[e.target.value],
          });
        } else {
          this.extras = this.extras.filter((ex) => ex.id !== e.target.value);
        }
        this.calculatePrice();
      });
    });
  }

  // === CALCUL DU PRIX ===
  calculatePrice() {
    this.prices.base = 0;
    this.prices.accommodation = 0;
    this.prices.extras = 0;

    // Prix de la destination
    if (this.selectedDestination) {
      this.prices.base = this.selectedDestination.price;
    }

    // Prix de l'hébergement
    if (this.selectedAccommodation) {
      const duration = parseInt(document.getElementById("duration").value) || 7;
      this.prices.accommodation =
        this.selectedAccommodation.pricePerDay * duration;
    }

    // Prix des extras
    this.prices.extras = this.extras.reduce(
      (sum, extra) => sum + extra.price,
      0
    );

    // Nombre de passagers
    const numberOfPassengers = parseInt(
      document.querySelector('[name="numberOfPassengers"]:checked')?.value || 1
    );

    // Total
    this.prices.total =
      (this.prices.base + this.prices.accommodation) * numberOfPassengers +
      this.prices.extras;

    // Mettre à jour l'affichage
    this.updatePriceDisplay();
  }

  // Mettre à jour l'affichage des prix
  updatePriceDisplay() {
    document.getElementById("price-base").textContent =
      PriceValidator.formatPrice(this.prices.base);
    document.getElementById("price-accommodation").textContent =
      PriceValidator.formatPrice(this.prices.accommodation);
    document.getElementById("price-extras").textContent =
      PriceValidator.formatPrice(this.prices.extras);
    document.getElementById("price-total").textContent =
      PriceValidator.formatPrice(this.prices.total);
  }

  // === SOUMISSION DU FORMULAIRE ===
  setupFormSubmission() {
    const form = document.getElementById("bookingForm");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Vérifier l'authentification
      if (!authManager.isAuthenticated()) {
        authManager.showMessage(
          "Veuillez vous connecter pour réserver",
          "error"
        );
        setTimeout(() => {
          window.location.href = "login.html?return=booking.html";
        }, 1500);
        return;
      }

      try {
        // Collecter les données
        const formData = new FormData(form);
        const bookingData = {
          destination: formData.get("destination"),
          departureDate: formData.get("departureDate"),
          duration: parseInt(formData.get("duration")),
          numberOfPassengers: parseInt(formData.get("numberOfPassengers")),
          accommodation: this.selectedAccommodation?.id,
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          specialRequirements: formData.get("specialRequirements"),
          passengers: this.collectPassengersData(),
          extras: this.extras,
          basePrice: this.prices.base,
          totalPrice: this.prices.total,
          currency: "USD",
        };

        // Créer la réservation
        const booking = bookingManager.createBooking(bookingData);

        // Supprimer les données sauvegardées
        localStorage.removeItem("bookingDraft");

        // Afficher le message de succès
        authManager.showMessage("Réservation confirmée !", "success");

        // Générer et afficher le billet
        setTimeout(() => {
          ticketGenerator.showTicket(booking);

          // Rediriger vers le dashboard après 2 secondes
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 2000);
        }, 1000);
      } catch (error) {
        authManager.showMessage(error.message, "error");
      }
    });

    // Bouton sauvegarder
    document.getElementById("saveBooking").addEventListener("click", () => {
      this.saveDraft();
      authManager.showMessage("Brouillon sauvegardé !", "success");
    });
  }

  // Collecter les données des passagers
  collectPassengersData() {
    const passengers = [];
    document.querySelectorAll(".passenger-card").forEach((card) => {
      passengers.push({
        firstName: card.querySelector('[data-passenger="firstName"]').value,
        lastName: card.querySelector('[data-passenger="lastName"]').value,
        age: card.querySelector('[data-passenger="age"]').value,
        email: card.querySelector('[data-passenger="email"]').value,
      });
    });
    return passengers;
  }

  // === VALIDATION ===
  setupValidation() {
    setupRealtimeValidation("bookingForm", formValidator.getBookingFormRules());
  }

  // === SAUVEGARDE AUTOMATIQUE ===
  setupAutoSave() {
    // Sauvegarder toutes les 30 secondes
    setInterval(() => {
      if (authManager.isAuthenticated()) {
        this.saveDraft();
      }
    }, 30000);
  }

  // Sauvegarder un brouillon
  saveDraft() {
    const form = document.getElementById("bookingForm");
    const formData = new FormData(form);

    const draft = {
      destination: formData.get("destination"),
      departureDate: formData.get("departureDate"),
      duration: formData.get("duration"),
      numberOfPassengers: formData.get("numberOfPassengers"),
      accommodation: this.selectedAccommodation?.id,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialRequirements: formData.get("specialRequirements"),
      extras: Array.from(
        document.querySelectorAll('[name="extras"]:checked')
      ).map((cb) => cb.value),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("bookingDraft", JSON.stringify(draft));
  }

  // Charger les données sauvegardées
  loadSavedData() {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) return;

    try {
      const draft = JSON.parse(draftStr);

      // Restaurer les champs
      if (draft.destination) {
        document.getElementById("destination").value = draft.destination;
        document
          .getElementById("destination")
          .dispatchEvent(new Event("change"));
      }

      if (draft.departureDate) {
        document.getElementById("departureDate").value = draft.departureDate;
      }

      if (draft.duration) {
        document.getElementById("duration").value = draft.duration;
      }

      if (draft.numberOfPassengers) {
        document
          .querySelector(
            `[name="numberOfPassengers"][value="${draft.numberOfPassengers}"]`
          )
          ?.click();
      }

      if (draft.accommodation) {
        setTimeout(() => {
          const card = document.querySelector(
            `[data-accommodation-id="${draft.accommodation}"]`
          );
          card?.click();
        }, 100);
      }

      if (draft.firstName)
        document.querySelector('[name="firstName"]').value = draft.firstName;
      if (draft.lastName)
        document.querySelector('[name="lastName"]').value = draft.lastName;
      if (draft.email)
        document.querySelector('[name="email"]').value = draft.email;
      if (draft.phone)
        document.querySelector('[name="phone"]').value = draft.phone;
      if (draft.specialRequirements)
        document.querySelector('[name="specialRequirements"]').value =
          draft.specialRequirements;

      if (draft.extras) {
        draft.extras.forEach((extra) => {
          const checkbox = document.querySelector(
            `[name="extras"][value="${extra}"]`
          );
          if (checkbox) checkbox.checked = true;
        });
      }

      authManager.showMessage("Brouillon restauré", "success");
    } catch (error) {
      console.error("Erreur lors du chargement du brouillon:", error);
    }
  }
}

// Initialiser l'application au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  new BookingApp();
});
