(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: window.location.origin + '/api/v1/booking',
    widgetVersion: '1.0.0',
    themes: {
      default: {
        primaryColor: '#3B82F6',
        secondaryColor: '#F3F4F6',
        textColor: '#1F2937',
        borderRadius: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      dark: {
        primaryColor: '#6366F1',
        secondaryColor: '#374151',
        textColor: '#F9FAFB',
        borderRadius: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        textColor: '#000000',
        borderRadius: '0px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    }
  };

  // Widget class
  class RepairBookingWidget {
    constructor(widgetId, theme = 'default') {
      this.widgetId = widgetId;
      this.theme = CONFIG.themes[theme] || CONFIG.themes.default;
      this.container = null;
      this.currentStep = 1;
      this.formData = {};
      this.timeSlots = [];
      
      this.init();
    }

    init() {
      this.createContainer();
      this.loadWidgetConfig();
      this.render();
    }

    createContainer() {
      const containerId = `repair-booking-widget-${this.widgetId}`;
      this.container = document.getElementById(containerId);
      
      if (!this.container) {
        console.error('Booking widget container not found:', containerId);
        return;
      }

      this.container.innerHTML = '';
      this.container.style.cssText = `
        font-family: ${this.theme.fontFamily};
        color: ${this.theme.textColor};
        background: ${this.theme.secondaryColor};
        border-radius: ${this.theme.borderRadius};
        padding: 20px;
        max-width: 500px;
        margin: 0 auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
    }

    async loadWidgetConfig() {
      try {
        const response = await fetch(`${CONFIG.apiUrl}/widget/${this.widgetId}`);
        const data = await response.json();
        
        if (data.success) {
          this.config = data.data;
          this.loadTimeSlots();
        } else {
          this.showError('Failed to load booking widget');
        }
      } catch (error) {
        console.error('Error loading widget config:', error);
        this.showError('Failed to load booking widget');
      }
    }

    async loadTimeSlots() {
      try {
        const today = new Date();
        const response = await fetch(`${CONFIG.apiUrl}/timeslots/${this.widgetId}?date=${today.toISOString().split('T')[0]}`);
        const data = await response.json();
        
        if (data.success) {
          this.timeSlots = data.data;
        }
      } catch (error) {
        console.error('Error loading time slots:', error);
      }
    }

    render() {
      if (!this.container) return;

      this.container.innerHTML = `
        <div class="booking-widget">
          <div class="widget-header">
            <h2 style="margin: 0 0 10px 0; color: ${this.theme.textColor};">
              ${this.config?.organization?.name || 'Repair Service'}
            </h2>
            <p style="margin: 0 0 20px 0; color: ${this.theme.textColor}; opacity: 0.7;">
              Book your device repair appointment
            </p>
          </div>
          
          <div class="widget-content">
            ${this.renderStep()}
          </div>
          
          <div class="widget-footer">
            <div class="step-indicator">
              ${this.renderStepIndicator()}
            </div>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }

    renderStep() {
      switch (this.currentStep) {
        case 1:
          return this.renderCustomerInfo();
        case 2:
          return this.renderDeviceInfo();
        case 3:
          return this.renderAppointmentInfo();
        case 4:
          return this.renderConfirmation();
        default:
          return this.renderCustomerInfo();
      }
    }

    renderCustomerInfo() {
      return `
        <div class="step-content">
          <h3 style="margin: 0 0 20px 0; color: ${this.theme.textColor};">
            Contact Information
          </h3>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Full Name *</label>
            <input type="text" id="customerName" required 
                   style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email *</label>
            <input type="email" id="customerEmail" required 
                   style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Phone *</label>
            <input type="tel" id="customerPhone" required 
                   style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
          </div>
          
          <button onclick="widget.nextStep()" 
                  style="background: ${this.theme.primaryColor}; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;">
            Next: Device Information
          </button>
        </div>
      `;
    }

    renderDeviceInfo() {
      return `
        <div class="step-content">
          <h3 style="margin: 0 0 20px 0; color: ${this.theme.textColor};">
            Device Information
          </h3>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Device Type *</label>
            <select id="deviceType" required 
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
              <option value="">Select device type</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Tablet">Tablet</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Smart Watch">Smart Watch</option>
              <option value="Gaming Console">Gaming Console</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Device Model *</label>
            <input type="text" id="deviceModel" required placeholder="e.g., iPhone 12, Samsung Galaxy S21"
                   style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Issue Description *</label>
            <textarea id="issueDescription" required rows="4" 
                      placeholder="Please describe the issue with your device..."
                      style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px; resize: vertical;"></textarea>
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Urgency Level</label>
            <select id="urgency" 
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
              <option value="medium">Medium (1-3 days)</option>
              <option value="high">High (Same day)</option>
              <option value="urgent">Urgent (ASAP)</option>
              <option value="low">Low (1 week)</option>
            </select>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button onclick="widget.prevStep()" 
                    style="background: #6B7280; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Previous
            </button>
            <button onclick="widget.nextStep()" 
                    style="background: ${this.theme.primaryColor}; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Next: Appointment
            </button>
          </div>
        </div>
      `;
    }

    renderAppointmentInfo() {
      return `
        <div class="step-content">
          <h3 style="margin: 0 0 20px 0; color: ${this.theme.textColor};">
            Appointment Details
          </h3>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Preferred Date *</label>
            <input type="date" id="preferredDate" required 
                   min="${new Date().toISOString().split('T')[0]}"
                   style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Preferred Time *</label>
            <select id="preferredTime" required 
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px;">
              <option value="">Select time</option>
              ${this.timeSlots.map(slot => `<option value="${slot}">${slot}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Additional Notes</label>
            <textarea id="additionalNotes" rows="3" 
                      placeholder="Any additional information or special requests..."
                      style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 14px; resize: vertical;"></textarea>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button onclick="widget.prevStep()" 
                    style="background: #6B7280; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Previous
            </button>
            <button onclick="widget.nextStep()" 
                    style="background: ${this.theme.primaryColor}; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Review & Submit
            </button>
          </div>
        </div>
      `;
    }

    renderConfirmation() {
      return `
        <div class="step-content">
          <h3 style="margin: 0 0 20px 0; color: ${this.theme.textColor};">
            Confirm Your Booking
          </h3>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0;">Contact Information</h4>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${this.formData.customerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${this.formData.customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${this.formData.customerPhone}</p>
            
            <h4 style="margin: 15px 0 10px 0;">Device Information</h4>
            <p style="margin: 5px 0;"><strong>Device:</strong> ${this.formData.deviceType} ${this.formData.deviceModel}</p>
            <p style="margin: 5px 0;"><strong>Issue:</strong> ${this.formData.issueDescription}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> ${this.formData.urgency}</p>
            
            <h4 style="margin: 15px 0 10px 0;">Appointment</h4>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${this.formData.preferredDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${this.formData.preferredTime}</p>
            ${this.formData.additionalNotes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${this.formData.additionalNotes}</p>` : ''}
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button onclick="widget.prevStep()" 
                    style="background: #6B7280; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Previous
            </button>
            <button onclick="widget.submitBooking()" 
                    style="background: #10B981; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; flex: 1;">
              Submit Booking
            </button>
          </div>
        </div>
      `;
    }

    renderStepIndicator() {
      const steps = ['Contact', 'Device', 'Appointment', 'Confirm'];
      return steps.map((step, index) => `
        <div style="display: inline-block; margin-right: 20px; text-align: center;">
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${index < this.currentStep ? this.theme.primaryColor : '#E5E7EB'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin: 0 auto 5px;">
            ${index + 1}
          </div>
          <div style="font-size: 12px; color: ${index < this.currentStep ? this.theme.primaryColor : '#9CA3AF'};">
            ${step}
          </div>
        </div>
      `).join('');
    }

    attachEventListeners() {
      // Add any additional event listeners here
    }

    nextStep() {
      if (this.validateCurrentStep()) {
        this.saveCurrentStepData();
        this.currentStep++;
        this.render();
      }
    }

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.render();
      }
    }

    validateCurrentStep() {
      const requiredFields = this.getRequiredFieldsForStep();
      
      for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
          this.showError(`Please fill in the ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
      
      return true;
    }

    getRequiredFieldsForStep() {
      switch (this.currentStep) {
        case 1:
          return ['customerName', 'customerEmail', 'customerPhone'];
        case 2:
          return ['deviceType', 'deviceModel', 'issueDescription'];
        case 3:
          return ['preferredDate', 'preferredTime'];
        default:
          return [];
      }
    }

    saveCurrentStepData() {
      const fields = this.getRequiredFieldsForStep();
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          this.formData[fieldId] = field.value;
        }
      });
      
      // Also save optional fields
      const optionalFields = ['urgency', 'additionalNotes'];
      optionalFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value) {
          this.formData[fieldId] = field.value;
        }
      });
    }

    async submitBooking() {
      try {
        this.showLoading('Submitting booking...');
        
        const response = await fetch(`${CONFIG.apiUrl}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            widgetId: this.widgetId,
            ...this.formData
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.showSuccess(data.data.message);
        } else {
          this.showError(data.error || 'Failed to submit booking');
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        this.showError('Failed to submit booking. Please try again.');
      }
    }

    showError(message) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="color: #EF4444; font-size: 16px; margin-bottom: 10px;">❌</div>
          <div style="color: #EF4444; font-size: 14px;">${message}</div>
          <button onclick="widget.render()" 
                  style="background: ${this.theme.primaryColor}; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 15px;">
            Try Again
          </button>
        </div>
      `;
    }

    showSuccess(message) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="color: #10B981; font-size: 48px; margin-bottom: 15px;">✅</div>
          <h3 style="color: ${this.theme.textColor}; margin: 0 0 10px 0;">Booking Confirmed!</h3>
          <p style="color: ${this.theme.textColor}; margin: 0 0 20px 0; opacity: 0.8;">${message}</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Booking ID:</strong> ${this.formData.bookingId || 'N/A'}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket Number:</strong> ${this.formData.ticketNumber || 'N/A'}</p>
          </div>
        </div>
      `;
    }

    showLoading(message) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="color: ${this.theme.primaryColor}; font-size: 24px; margin-bottom: 15px;">⏳</div>
          <div style="color: ${this.theme.textColor}; font-size: 14px;">${message}</div>
        </div>
      `;
    }
  }

  // Initialize widget when script loads
  function initWidget() {
    const script = document.currentScript;
    const widgetId = script.getAttribute('data-widget-id');
    const theme = script.getAttribute('data-theme') || 'default';
    
    if (widgetId) {
      window.widget = new RepairBookingWidget(widgetId, theme);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();






