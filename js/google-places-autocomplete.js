/* ========================================
   GOOGLE PLACES AUTocomplete - USA Addresses Only
   ======================================== */

let shippingAutocomplete = null;
let billingAutocomplete = null;
let googlePlacesLoaded = false;

/**
 * Initialize Google Places API
 * Called by Google Places API callback
 */
function initGooglePlaces() {
    console.log('[Google Places] API loaded');
    googlePlacesLoaded = true;
    
    // Initialize autocomplete for shipping address
    initShippingAutocomplete();
    
    // Initialize autocomplete for billing address (when visible)
    // Will be called when billing address fields are shown
}

/**
 * Initialize Google Places Autocomplete for Shipping Address
 */
function initShippingAutocomplete() {
    const streetInput = document.getElementById('streetAddress');
    if (!streetInput) {
        console.warn('[Google Places] Shipping address input not found');
        return;
    }
    
    // Create autocomplete instance restricted to USA
    shippingAutocomplete = new google.maps.places.Autocomplete(streetInput, {
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
    });
    
    // When place is selected, fill in address fields
    shippingAutocomplete.addListener('place_changed', function() {
        fillShippingAddressFromPlace(shippingAutocomplete.getPlace());
    });
    
    console.log('[Google Places] Shipping autocomplete initialized');
}

/**
 * Initialize Google Places Autocomplete for Billing Address
 */
function initBillingAutocomplete() {
    const billingStreetInput = document.getElementById('billingStreet');
    if (!billingStreetInput) {
        console.warn('[Google Places] Billing address input not found');
        return;
    }
    
    // If already initialized, don't reinitialize
    if (billingAutocomplete) {
        return;
    }
    
    // Create autocomplete instance restricted to USA
    billingAutocomplete = new google.maps.places.Autocomplete(billingStreetInput, {
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
    });
    
    // When place is selected, fill in address fields
    billingAutocomplete.addListener('place_changed', function() {
        fillBillingAddressFromPlace(billingAutocomplete.getPlace());
    });
    
    console.log('[Google Places] Billing autocomplete initialized');
}

/**
 * Parse Google Places address components and extract street, city, state, zip
 */
function parseAddressComponents(addressComponents) {
    const address = {
        streetNumber: '',
        streetName: '',
        street: '',
        city: '',
        state: '',
        zip: ''
    };
    
    if (!addressComponents || !Array.isArray(addressComponents)) {
        return address;
    }
    
    addressComponents.forEach(function(component) {
        const type = component.types[0];
        
        switch (type) {
            case 'street_number':
                address.streetNumber = component.long_name;
                break;
            case 'route':
                address.streetName = component.long_name;
                break;
            case 'locality':
                address.city = component.long_name;
                break;
            case 'administrative_area_level_1':
                address.state = component.short_name; // Use short form (e.g., "CA" instead of "California")
                break;
            case 'postal_code':
                address.zip = component.long_name;
                break;
        }
    });
    
    // Combine street number and street name
    if (address.streetNumber && address.streetName) {
        address.street = address.streetNumber + ' ' + address.streetName;
    } else if (address.streetName) {
        address.street = address.streetName;
    } else if (address.streetNumber) {
        address.street = address.streetNumber;
    }
    
    return address;
}

/**
 * Fill shipping address fields from Google Places result
 */
function fillShippingAddressFromPlace(place) {
    if (!place || !place.address_components) {
        console.warn('[Google Places] Invalid place result');
        return;
    }
    
    const address = parseAddressComponents(place.address_components);
    
    // Fill shipping address fields
    const streetInput = document.getElementById('streetAddress');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zipCode');
    
    if (streetInput && address.street) {
        streetInput.value = address.street;
    }
    
    if (cityInput && address.city) {
        cityInput.value = address.city;
    }
    
    if (stateInput && address.state) {
        stateInput.value = address.state;
    }
    
    if (zipInput && address.zip) {
        zipInput.value = address.zip;
    }
    
    // Ensure country is set to US
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.value = 'US';
    }
    
    console.log('[Google Places] Shipping address filled:', address);
    
    // Trigger validation if needed
    if (streetInput) {
        const event = new Event('input', { bubbles: true });
        streetInput.dispatchEvent(event);
    }
}

/**
 * Fill billing address fields from Google Places result
 */
function fillBillingAddressFromPlace(place) {
    if (!place || !place.address_components) {
        console.warn('[Google Places] Invalid place result');
        return;
    }
    
    const address = parseAddressComponents(place.address_components);
    
    // Fill billing address fields
    const billingStreetInput = document.getElementById('billingStreet');
    const billingCityInput = document.getElementById('billingCity');
    const billingStateInput = document.getElementById('billingState');
    const billingZipInput = document.getElementById('billingZip');
    
    if (billingStreetInput && address.street) {
        billingStreetInput.value = address.street;
    }
    
    if (billingCityInput && address.city) {
        billingCityInput.value = address.city;
    }
    
    if (billingStateInput && address.state) {
        billingStateInput.value = address.state;
    }
    
    if (billingZipInput && address.zip) {
        billingZipInput.value = address.zip;
    }
    
    console.log('[Google Places] Billing address filled:', address);
    
    // Trigger validation if needed
    if (billingStreetInput) {
        const event = new Event('input', { bubbles: true });
        billingStreetInput.dispatchEvent(event);
    }
}

/**
 * Check if Google Places is loaded, and initialize if needed
 */
function ensureGooglePlacesReady() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        if (!googlePlacesLoaded) {
            googlePlacesLoaded = true;
            initGooglePlaces();
        }
    }
}

// Export functions to window
window.initGooglePlaces = initGooglePlaces;
window.initShippingAutocomplete = initShippingAutocomplete;
window.initBillingAutocomplete = initBillingAutocomplete;
window.fillShippingAddressFromPlace = fillShippingAddressFromPlace;
window.fillBillingAddressFromPlace = fillBillingAddressFromPlace;
window.ensureGooglePlacesReady = ensureGooglePlacesReady;
