// validation.js - Système de validation côté client

class FormValidator {
  constructor() {
    this.rules = {
      required: (value) => value && value.trim() !== "",
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^[\d\s\-\+\(\)]{8,}$/.test(value),
      minLength: (value, length) => value && value.length >= length,
      maxLength: (value, length) => value && value.length <= length,
      min: (value, min) => parseFloat(value) >= min,
      max: (value, max) => parseFloat(value) <= max,
      date: (value) => !isNaN(Date.parse(value)),
      futureDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      pattern: (value, pattern) => new RegExp(pattern).test(value),
      match: (value, matchValue) => value === matchValue,
    };

    this.messages = {
      required: "Ce champ est requis",
      email: "Email invalide",
      phone: "Numéro de téléphone invalide",
      minLength: "Minimum {0} caractères requis",
      maxLength: "Maximum {0} caractères autorisés",
      min: "La valeur minimale est {0}",
      max: "La valeur maximale est {0}",
      date: "Date invalide",
      futureDate: "La date doit être dans le futur",
      pattern: "Format invalide",
      match: "Les valeurs ne correspondent pas",
    };
  }

  // Valider un champ unique
  validateField(field, rules) {
    const value = field.value;
    const errors = [];

    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      const rule = this.rules[ruleName];

      if (!rule) continue;

      let isValid;
      if (typeof ruleValue === "boolean" && ruleValue) {
        isValid = rule(value);
      } else {
        isValid = rule(value, ruleValue);
      }

      if (!isValid) {
        let message = this.messages[ruleName];
        if (typeof ruleValue !== "boolean") {
          message = message.replace("{0}", ruleValue);
        }
        errors.push(message);
      }
    }

    return errors;
  }

  // Valider un formulaire complet
  validateForm(form, validationRules) {
    const errors = {};
    let isValid = true;

    // Supprimer les anciens messages d'erreur
    this.clearErrors(form);

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const field = form.querySelector(`[name="${fieldName}"]`);

      if (!field) continue;

      const fieldErrors = this.validateField(field, rules);

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        isValid = false;
        this.showFieldError(field, fieldErrors[0]);
      }
    }

    return { isValid, errors };
  }

  // Afficher une erreur sur un champ
  showFieldError(field, message) {
    field.classList.add("error");

    // Créer ou mettre à jour le message d'erreur
    let errorEl = field.parentElement.querySelector(".error-message");

    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "error-message";
      field.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.style.cssText = `
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    `;

    // Style du champ en erreur
    field.style.borderColor = "#ef4444";
  }

  // Supprimer l'erreur d'un champ
  clearFieldError(field) {
    field.classList.remove("error");
    field.style.borderColor = "";

    const errorEl = field.parentElement.querySelector(".error-message");
    if (errorEl) {
      errorEl.remove();
    }
  }

  // Supprimer toutes les erreurs d'un formulaire
  clearErrors(form) {
    form.querySelectorAll(".error").forEach((field) => {
      this.clearFieldError(field);
    });
  }

  // Validation en temps réel
  setupRealtimeValidation(form, validationRules) {
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const field = form.querySelector(`[name="${fieldName}"]`);

      if (!field) continue;

      // Valider lors du blur (perte de focus)
      field.addEventListener("blur", () => {
        const errors = this.validateField(field, rules);
        if (errors.length > 0) {
          this.showFieldError(field, errors[0]);
        } else {
          this.clearFieldError(field);
        }
      });

      // Supprimer l'erreur lors de la saisie
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) {
          const errors = this.validateField(field, rules);
          if (errors.length === 0) {
            this.clearFieldError(field);
          }
        }
      });
    }
  }

  // Règles de validation communes pour les formulaires
  getBookingFormRules() {
    return {
      destination: { required: true },
      departureDate: { required: true, date: true, futureDate: true },
      firstName: { required: true, minLength: 2, maxLength: 50 },
      lastName: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      numberOfPassengers: { required: true, min: 1, max: 10 },
      accommodation: { required: true },
    };
  }

  getLoginFormRules() {
    return {
      email: { required: true, email: true },
      password: { required: true, minLength: 4 },
    };
  }

  getRegisterFormRules() {
    return {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, email: true },
      password: { required: true, minLength: 6 },
      confirmPassword: { required: true, minLength: 6 },
    };
  }
}

// Classe utilitaire pour la validation des passagers
class PassengerValidator {
  static validate(passengers) {
    const errors = [];

    if (!passengers || passengers.length === 0) {
      errors.push("Au moins un passager est requis");
      return errors;
    }

    passengers.forEach((passenger, index) => {
      const passengerErrors = [];

      if (!passenger.firstName || passenger.firstName.trim().length < 2) {
        passengerErrors.push("Prénom invalide");
      }

      if (!passenger.lastName || passenger.lastName.trim().length < 2) {
        passengerErrors.push("Nom invalide");
      }

      if (passenger.age && (passenger.age < 0 || passenger.age > 150)) {
        passengerErrors.push("Âge invalide");
      }

      if (
        passenger.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)
      ) {
        passengerErrors.push("Email invalide");
      }

      if (passengerErrors.length > 0) {
        errors.push(`Passager ${index + 1}: ${passengerErrors.join(", ")}`);
      }
    });

    return errors;
  }
}

// Classe utilitaire pour la validation des dates
class DateValidator {
  static isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
  }

  static isFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  static isAfter(date1, date2) {
    return new Date(date1) > new Date(date2);
  }

  static isBefore(date1, date2) {
    return new Date(date1) < new Date(date2);
  }

  static getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static formatDate(date, locale = "fr-FR") {
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Classe utilitaire pour la validation des prix
class PriceValidator {
  static isValidPrice(price) {
    return !isNaN(price) && price >= 0;
  }

  static formatPrice(price, currency = "USD") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(price);
  }

  static calculateDiscount(originalPrice, discountPercent) {
    const discount = (originalPrice * discountPercent) / 100;
    return originalPrice - discount;
  }
}

// Exporter les instances et classes
const formValidator = new FormValidator();

// Fonction helper pour valider rapidement un formulaire
function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return { isValid: false, errors: {} };

  return formValidator.validateForm(form, rules);
}

// Fonction helper pour setup la validation en temps réel
function setupRealtimeValidation(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return;

  formValidator.setupRealtimeValidation(form, rules);
}
