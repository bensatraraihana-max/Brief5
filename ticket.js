// ticket.js - Générateur de billets imprimables

class TicketGenerator {
  constructor() {
    this.ticketTemplate = this.createTicketTemplate();
  }

  // Créer le template de billet
  createTicketTemplate() {
    return `
      <div class="space-ticket" style="
        max-width: 800px;
        margin: 2rem auto;
        background: linear-gradient(135deg, #0a0a18 0%, #1a1a2e 50%, #16213e 100%);
        border: 2px solid #0ea5e9;
        border-radius: 15px;
        padding: 2rem;
        color: white;
        font-family: 'Exo 2', sans-serif;
        position: relative;
        overflow: hidden;
      ">
        <!-- Header avec logo et statut -->
        <div class="ticket-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px dashed #0ea5e9;
        ">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: linear-gradient(to right, #0ea5e9, #8b5cf6);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            ">
              🚀
            </div>
            <div>
              <h1 style="
                font-family: 'Orbitron', sans-serif;
                font-size: 1.5rem;
                margin: 0;
                text-shadow: 0 0 10px rgba(14, 165, 233, 0.7);
              ">SpaceVoyager</h1>
              <p style="margin: 0; color: #0ea5e9; font-size: 0.875rem;">Space Tourism</p>
            </div>
          </div>
          <div class="ticket-status" style="
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: bold;
            font-size: 0.875rem;
          ">
            ✓ CONFIRMÉ
          </div>
        </div>

        <!-- Référence de réservation -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="font-size: 0.875rem; color: #9ca3af; margin-bottom: 0.5rem;">
            Référence de réservation
          </div>
          <div class="booking-reference" style="
            font-family: 'Orbitron', sans-serif;
            font-size: 2rem;
            letter-spacing: 0.2em;
            color: #0ea5e9;
            text-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
          ">
            {{bookingReference}}
          </div>
        </div>

        <!-- Détails du voyage -->
        <div class="journey-details" style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        ">
          <div class="detail-section">
            <h3 style="
              font-family: 'Orbitron', sans-serif;
              color: #0ea5e9;
              font-size: 1rem;
              margin-bottom: 1rem;
            ">DESTINATION</h3>
            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
              {{destinationName}}
            </div>
            <div style="color: #9ca3af; font-size: 0.875rem;">
              {{destinationPlanet}}
            </div>
          </div>

          <div class="detail-section">
            <h3 style="
              font-family: 'Orbitron', sans-serif;
              color: #0ea5e9;
              font-size: 1rem;
              margin-bottom: 1rem;
            ">DATE DE DÉPART</h3>
            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
              {{departureDate}}
            </div>
            <div style="color: #9ca3af; font-size: 0.875rem;">
              {{departureTime}}
            </div>
          </div>
        </div>

        <!-- Informations passager -->
        <div style="
          background: rgba(26, 26, 46, 0.5);
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        ">
          <h3 style="
            font-family: 'Orbitron', sans-serif;
            color: #0ea5e9;
            font-size: 1rem;
            margin-bottom: 1rem;
          ">INFORMATIONS PASSAGER</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <div style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.25rem;">Nom complet</div>
              <div style="font-weight: bold;">{{passengerName}}</div>
            </div>
            <div>
              <div style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.25rem;">Email</div>
              <div style="font-weight: bold;">{{passengerEmail}}</div>
            </div>
            <div>
              <div style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.25rem;">Téléphone</div>
              <div style="font-weight: bold;">{{passengerPhone}}</div>
            </div>
            <div>
              <div style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 0.25rem;">Nombre de passagers</div>
              <div style="font-weight: bold;">{{numberOfPassengers}}</div>
            </div>
          </div>
        </div>

        <!-- Détails de l'hébergement -->
        <div style="
          background: rgba(26, 26, 46, 0.5);
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        ">
          <h3 style="
            font-family: 'Orbitron', sans-serif;
            color: #0ea5e9;
            font-size: 1rem;
            margin-bottom: 1rem;
          ">HÉBERGEMENT</h3>
          <div style="font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem;">
            {{accommodationType}}
          </div>
          <div style="color: #9ca3af; font-size: 0.875rem;">
            {{accommodationDescription}}
          </div>
        </div>

        <!-- Prix -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(to right, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 10px;
          margin-bottom: 2rem;
        ">
          <div style="font-size: 1.25rem; font-weight: bold;">Prix Total</div>
          <div style="
            font-family: 'Orbitron', sans-serif;
            font-size: 2rem;
            font-weight: bold;
            color: #0ea5e9;
          ">
            {{totalPrice}} {{currency}}
          </div>
        </div>

        <!-- QR Code -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div class="qr-code-container" style="
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            display: inline-block;
          ">
            <div class="qr-code" style="
              width: 150px;
              height: 150px;
              background: linear-gradient(45deg, #0ea5e9, #8b5cf6);
              border-radius: 8px;
            "></div>
          </div>
          <div style="color: #9ca3af; font-size: 0.875rem; margin-top: 1rem;">
            Scannez ce code à l'embarquement
          </div>
        </div>

        <!-- Instructions -->
        <div style="
          border-top: 2px dashed #0ea5e9;
          padding-top: 1.5rem;
          color: #9ca3af;
          font-size: 0.875rem;
          line-height: 1.6;
        ">
          <p style="margin: 0 0 0.5rem 0;"><strong>Instructions importantes :</strong></p>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li>Présentez-vous 3 heures avant le départ au port spatial</li>
            <li>Apportez une pièce d'identité valide</li>
            <li>Certificat médical requis pour les voyages de plus de 7 jours</li>
            <li>Formation de sécurité obligatoire avant l'embarquement</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(14, 165, 233, 0.3);
          color: #9ca3af;
          font-size: 0.75rem;
        ">
          SpaceVoyager - Making Space Travel Accessible to Everyone<br>
          Contact: info@spacevoyager.com | +1 (800) SPACE-TRIP
        </div>
      </div>
    `;
  }

  // Générer un billet à partir d'une réservation
  generateTicket(booking) {
    let html = this.ticketTemplate;

    // Récupérer les détails de la destination
    const destination = bookingManager.destinations.find(
      (d) => d.id === booking.destination
    );
    const accommodation = bookingManager.accommodations.find(
      (a) => a.id === booking.accommodation
    );

    // Remplacer les variables
    const replacements = {
      bookingReference: booking.bookingReference || "N/A",
      destinationName: destination ? destination.name : booking.destination,
      destinationPlanet: destination ? destination.planet : "",
      departureDate: DateValidator.formatDate(booking.departureDate),
      departureTime: "09:00 UTC",
      passengerName: `${booking.contactInfo.firstName} ${booking.contactInfo.lastName}`,
      passengerEmail: booking.contactInfo.email,
      passengerPhone: booking.contactInfo.phone,
      numberOfPassengers: booking.numberOfPassengers || 1,
      accommodationType: accommodation
        ? accommodation.name
        : booking.accommodation,
      accommodationDescription: accommodation
        ? accommodation.shortDescription
        : "",
      totalPrice: PriceValidator.formatPrice(
        booking.totalPrice,
        booking.currency
      ),
      currency: booking.currency || "USD",
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    return html;
  }

  // Afficher le billet dans une modal
  showTicket(booking) {
    const ticketHtml = this.generateTicket(booking);

    // Créer la modal
    const modal = document.createElement("div");
    modal.className = "ticket-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      overflow-y: auto;
      padding: 2rem;
    `;

    modal.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; position: relative;">
        <button class="close-modal" style="
          position: absolute;
          top: -40px;
          right: 0;
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        ">✕ Fermer</button>
        
        <div class="ticket-actions" style="
          text-align: center;
          margin-bottom: 1rem;
        ">
          <button class="print-ticket" style="
            background: linear-gradient(to right, #0ea5e9, #8b5cf6);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin: 0 0.5rem;
          ">🖨️ Imprimer</button>
          
          <button class="download-ticket" style="
            background: linear-gradient(to right, #8b5cf6, #ec4899);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin: 0 0.5rem;
          ">💾 Télécharger PDF</button>
        </div>
        
        ${ticketHtml}
      </div>
    `;

    document.body.appendChild(modal);

    // Événements
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector(".print-ticket").addEventListener("click", () => {
      this.printTicket(modal.querySelector(".space-ticket"));
    });

    modal.querySelector(".download-ticket").addEventListener("click", () => {
      this.downloadTicket(booking);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Imprimer le billet
  printTicket(ticketElement) {
    const printWindow = window.open("", "", "height=800,width=800");
    printWindow.document.write(
      "<html><head><title>Billet SpaceVoyager</title>"
    );
    printWindow.document.write(
      "<style>@media print { body { margin: 0; } }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(ticketElement.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  // Télécharger le billet en PDF (simulation)
  downloadTicket(booking) {
    const ticketHtml = this.generateTicket(booking);
    const blob = new Blob([ticketHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SpaceVoyager-Ticket-${booking.bookingReference}.html`;
    a.click();

    URL.revokeObjectURL(url);

    // Afficher un message de succès
    authManager.showMessage("Billet téléchargé avec succès !", "success");
  }

  // Envoyer le billet par email (simulation)
  emailTicket(booking) {
    // Dans un vrai système, cela appellerait une API backend
    console.log("Envoi du billet à:", booking.contactInfo.email);
    authManager.showMessage(
      `Billet envoyé à ${booking.contactInfo.email}`,
      "success"
    );
  }
}

// Exporter l'instance globale
const ticketGenerator = new TicketGenerator();
