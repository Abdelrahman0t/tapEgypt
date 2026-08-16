// TAP EGYPT — Web Application Engine (Authentic Desktop Marketplace & App Design System)

class TapEgyptApp {
  constructor() {
    this.properties = TAP_EGYPT_DATA.properties;
    this.locations = TAP_EGYPT_DATA.locations;
    this.developers = TAP_EGYPT_DATA.developers;
    
    // Application State
    this.currentMode = 'all';
    this.searchQuery = '';
    this.sortOption = 'default';
    this.wishlist = new Set(JSON.parse(localStorage.getItem('tapegypt_wishlist') || '[]'));
    
    this.filters = {
      downpaymentFrom: '', downpaymentTo: '',
      installmentsFrom: '', installmentsTo: '',
      priceFrom: '', priceTo: '',
      areaFrom: '', areaTo: '',
      location: '', developer: '', project: '',
      bedrooms: 'Any', bathrooms: 'Any',
      propertyType: '', floor: '', finishing: '', deliveryDate: '',
      licenses: new Set()
    };

    this.appLocations = [
      'Hacienda', 'Marina 1', 'Marina 2', '6 October', 'El Sheikh Zayed', 'El Sokhna', 'Madinaty'
    ];

    this.currentOfferIndex = 0;
    this.activeSlotIndex = 1;
    this.offerAutoPlayTimer = null;
    this.offerResetTimeout = null;
    this.isOfferSliding = false;
    this.isOfferSectionInView = false;
    this.offerObserver = null;
    this.devSliderIndex = 0;
    this.offerItems = [
      {
        id: "newgiza-seashell-playa-haze",
        title: "City Edge Developments",
        subtitle: "1st Row Lagoon Chalet • 185 m² • Ready to Move Immediately",
        tag: "TODAY'S SPECIAL DEAL",
        price: "19,000,000 EGP",
        dp: "16,840,000 EGP",
        specs: "3 Bedrooms • 3 Bathrooms • North Coast",
        image: "images/developers_images/karmell.png",
        slug: "newgiza-seashell-playa-haze-chalet"
      },
      {
        id: "sodic-vye-116",
        title: "SODIC - VYE Sheikh Zayed",
        subtitle: "Ground Floor Luxury Apartment + 40m² Private Garden",
        tag: "HOT RESALE DEAL",
        price: "8,428,000 EGP",
        dp: "5,605,000 EGP",
        specs: "2 Bedrooms • 2 Bathrooms • El Sheikh Zayed",
        image: "images/developers_images/playa.jpg",
        slug: "sodic-vye-ground-apartment"
      },
      {
        id: "zed-west-ora-studio",
        title: "ORA - ZED West Park View",
        subtitle: "Fully Finished Park-Front Studio • Prime Location",
        tag: "FEATURED OFFER",
        price: "4,966,456 EGP",
        dp: "4,340,000 EGP",
        specs: "1 Bedroom • 1 Bathroom • Sheikh Zayed Park",
        image: "images/zed_west.png",
        slug: "ora-zed-west-studio"
      },
      {
        id: "mountain-view-icity-townhouse",
        title: "Mountain View iCity",
        subtitle: "Prime Middle Townhouse • Lagoon Park View Phase",
        tag: "EXCLUSIVE LAUNCH",
        price: "11,677,000 EGP",
        dp: "10,500,000 EGP",
        specs: "3 Bedrooms • 3 Bathrooms • New Cairo",
        image: "images/mountain_view.png",
        slug: "mountain-view-icity-townhouse"
      }
    ];


    this.init();
  }

  init() {
    this.bindEvents();
    this.populateFilterDropdowns();
    this.setupSearchableSelects();
    this.setupScrollObserver();
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());

    // Close mobile nav dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('mobile-nav-dropdown');
      const wrapper = document.getElementById('mobile-menu-wrapper');
      if (dropdown && wrapper && !wrapper.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  setupScrollObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.06
    });

    this.observeScrollAnimations();
  }

  observeScrollAnimations() {
    if (!this.scrollObserver) return;

    const selectors = [
      '.hz-section-header',
      '.hz-section-title',
      '.hz-section-subtitle',
      '.why-choose-us-section',
      '.why-choose-card',
      '.todays-offer-section',
      '.todays-offer-header',
      '.broker-fullwidth-section',
      '.broker-fw-left',
      '.broker-fw-right',
      '.broker-value-card',
      '.featured-listings-section',
      '.app-fullwidth-showcase-section',
      '.app-showcase-img-col',
      '.app-showcase-content-col',
      '.app-resale-card',
      '.trusted-developers-section',
      '.dev-grid-logo-item',
      '.site-footer',
      '.footer-top-banner',
      '.footer-main-grid'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    elements.forEach((el) => {
      if (!el.classList.contains('scroll-reveal')) {
        if (el.classList.contains('broker-fw-left') || el.classList.contains('app-showcase-img-col')) {
          el.classList.add('scroll-reveal', 'reveal-slide-left');
        } else if (el.classList.contains('broker-fw-right') || el.classList.contains('app-showcase-content-col')) {
          el.classList.add('scroll-reveal', 'reveal-slide-right');
        } else if (el.classList.contains('app-resale-card') || el.classList.contains('why-choose-card') || el.classList.contains('dev-grid-logo-item') || el.classList.contains('broker-value-card')) {
          el.classList.add('scroll-reveal', 'reveal-slide-up');
        } else {
          el.classList.add('scroll-reveal');
        }

        if (el.parentElement) {
          const siblings = Array.from(el.parentElement.children);
          const index = siblings.indexOf(el);
          if (index >= 0 && index < 12) {
            const delay = (index % 4) * 0.08;
            el.style.transitionDelay = `${delay}s`;
          }
        }
      }

      if (!el.classList.contains('is-revealed')) {
        this.scrollObserver.observe(el);
      }
    });
  }

  handleRouting() {
    const hash = window.location.hash;
    const homeView = document.getElementById('home-view');
    const propertiesView = document.getElementById('properties-view');
    const detailView = document.getElementById('detail-view');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hash === '#/download' || hash === '#/app') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      if (isIOS) {
        window.location.href = "https://apps.apple.com/eg/app/tap-egypt/id1586677400";
      } else if (isAndroid) {
        window.location.href = "https://play.google.com/store/apps/details?id=com.triplea.TripleAProperties";
      } else {
        window.location.href = "https://apps.apple.com/eg/app/tap-egypt/id1586677400";
      }
      return;
    }

    if (hash.startsWith('#/properties/')) {
      const slug = hash.replace('#/properties/', '');
      const property = this.properties.find(p => p.slug === slug || p.id === slug);
      if (property) {
        this.pauseOfferAutoPlay();
        homeView.style.display = 'none';
        propertiesView.style.display = 'none';
        detailView.style.display = 'block';
        this.renderPropertyDetailView(property);
        return;
      }
    }

    if (hash === '#/properties' || hash.startsWith('#/properties?')) {
      this.pauseOfferAutoPlay();
      homeView.style.display = 'none';
      detailView.style.display = 'none';
      propertiesView.style.display = 'block';
      this.renderPropertiesView();
      return;
    }

    // Default: Homepage Landing View
    homeView.style.display = 'block';
    propertiesView.style.display = 'none';
    detailView.style.display = 'none';
    this.renderHomeView();
  }

  bindEvents() {
    // Search Fields
    document.querySelectorAll('.search-input-field').forEach(input => {
      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (window.location.hash === '#/properties') this.renderPropertiesView();
      });
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.location.hash = '#/properties';
      });
    });

    // Hero Advanced Filter Panel Toggle (Clicking `[ 🎛 ]` expands the panel!)
    const advToggleBtn = document.getElementById('btn-toggle-advanced-hero');
    const advPanel = document.getElementById('hero-advanced-panel');
    if (advToggleBtn && advPanel) {
      advToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = advPanel.classList.contains('open');
        if (isOpen) {
          advPanel.classList.remove('open');
          advToggleBtn.classList.remove('active');
          advToggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>`;
        } else {
          advPanel.classList.add('open');
          advToggleBtn.classList.add('active');
          advToggleBtn.innerHTML = `✕`;
        }
      });
    }

    // Price Slider Native Input
    const priceSlider = document.getElementById('hero-price-slider');
    const priceLabel = document.getElementById('hero-price-val-label');
    if (priceSlider && priceLabel) {
      priceSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.filters.priceTo = val;
        priceLabel.textContent = `0 - ${formatCurrencyEGP(val)}`;
        if (window.location.hash === '#/properties') this.renderPropertiesView();
      });
    }

    // City & Type Select Filters in Hero
    document.getElementById('hero-city-select')?.addEventListener('change', (e) => {
      this.filters.location = e.target.value;
      if (window.location.hash === '#/properties') this.renderPropertiesView();
    });

    document.getElementById('hero-type-select')?.addEventListener('change', (e) => {
      this.filters.propertyType = e.target.value;
      if (window.location.hash === '#/properties') this.renderPropertiesView();
    });

    // Sort Dropdown
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        this.renderPropertiesView();
      });
    }

    // Filter Drawer Triggers
    document.querySelectorAll('.btn-filter-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.toggleFilterDrawer(true));
    });

    // Bedroom & Bathroom Circle Pill Selectors
    document.querySelectorAll('#bedroom-circles-group .circle-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#bedroom-circles-group .circle-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.bedrooms = btn.dataset.value || btn.textContent.trim();
      });
    });

    document.querySelectorAll('#bathroom-circles-group .circle-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#bathroom-circles-group .circle-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.bathrooms = btn.dataset.value || btn.textContent.trim();
      });
    });

    const backdrop = document.getElementById('filter-drawer-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.toggleFilterDrawer(false);
      });
    }

    document.getElementById('reset-filter-btn')?.addEventListener('click', () => this.resetFilters());
    document.getElementById('apply-filter-btn')?.addEventListener('click', () => {
      this.applyFilterDrawerValues();
      this.toggleFilterDrawer(false);
      window.location.hash = '#/properties';
    });

    // Toast Triggers
    document.querySelectorAll('.trigger-toast').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showToast('TAP EGYPT Portal Action Triggered');
      });
    });

    document.querySelectorAll('.trigger-add-property').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openListingModal();
      });
    });

    // Persistent Notification Popover (Stays open when clicked/interacted with!)
    const bellBtn = document.getElementById('btn-nav-bell');
    const popover = document.getElementById('nav-bell-popover');

    if (bellBtn && popover) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.toggle('open');
      });

      // Prevent clicks inside popover from closing it
      popover.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Global click outside closes notification popover
    document.addEventListener('click', () => {
      if (popover && popover.classList.contains('open')) {
        popover.classList.remove('open');
      }
    });

    // Window Scroll Response: Transparent at Start -> White Surface on Scroll
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('site-navbar');
      if (navbar) {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.hero-mode-pill').forEach(btn => {
      if (btn.dataset.mode === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    
    if (window.location.hash === '#/properties') this.renderPropertiesView();
  }

  openListPropertyModal() {
    this.openListingModal();
  }

  submitBrokerListing(e) {
    e.preventDefault();
    const modal = document.getElementById('broker-list-modal');
    if (modal) modal.classList.remove('open');
    this.showToast('🎉 Your listing request was submitted! Our broker team will contact you shortly.');
  }

  filterByType(type) {
    this.filters.propertyType = type;
    window.location.hash = '#/properties';
  }

  toggleWishlist(propertyId, e) {
    if (e) e.stopPropagation();
    if (this.wishlist.has(propertyId)) {
      this.wishlist.delete(propertyId);
      this.showToast('Removed from Wishlist');
    } else {
      this.wishlist.add(propertyId);
      this.showToast('Saved to Wishlist');
    }
    localStorage.setItem('tapegypt_wishlist', JSON.stringify(Array.from(this.wishlist)));

    document.querySelectorAll(`.app-card-heart-btn[data-id="${propertyId}"]`).forEach(btn => {
      if (this.wishlist.has(propertyId)) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    this.updateFavHeaderCount();
  }

  shareProperty(slug, e) {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/properties/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('Property link copied to clipboard!');
      }).catch(() => {
        this.showToast('Property link copied!');
      });
    } else {
      this.showToast('Property link copied!');
    }
  }

  updateFavHeaderCount() {
    const badge = document.getElementById('header-fav-count');
    if (badge) {
      badge.textContent = this.wishlist.size;
    }
  }

  setPriceQuickFilter(minPrice, maxPrice) {
    this.filters.maxPrice = maxPrice;
    const slider = document.getElementById('hero-price-slider');
    const label = document.getElementById('hero-price-val-label');
    if (slider) slider.value = maxPrice;
    if (label) label.textContent = `${formatCurrencyEGP(minPrice)} - ${formatCurrencyEGP(maxPrice)}`;
    this.showToast(`Filtered Budget: ${formatCurrencyEGP(minPrice)} - ${formatCurrencyEGP(maxPrice)}`);
    window.location.hash = '#/properties';
  }

  toggleFilterDrawer(open) {
    const backdrop = document.getElementById('filter-drawer-backdrop');
    if (backdrop) {
      if (open) backdrop.classList.add('open');
      else backdrop.classList.remove('open');
    }
  }

  populateFilterDropdowns() {
    const heroCity = document.getElementById('hero-city-select');
    const heroType = document.getElementById('hero-type-select');

    const locSelect = document.getElementById('filter-location-select');
    const devSelect = document.getElementById('filter-developer-select');
    const projSelect = document.getElementById('filter-project-select');

    const citiesHTML = '<option value="">All Cities</option>' +
      this.locations.map(l => `<option value="${l.name}">${l.name}</option>`).join('');

    if (heroCity) heroCity.innerHTML = citiesHTML;
    if (locSelect) locSelect.innerHTML = citiesHTML;

    const types = ['Apartment', 'Ground Floor', 'Chalet', 'Penthouse', 'Villa', 'Twin House'];
    const typesHTML = '<option value="">All Types</option>' +
      types.map(t => `<option value="${t}">${t}</option>`).join('');

    if (heroType) heroType.innerHTML = typesHTML;

    if (devSelect) {
      devSelect.innerHTML = '<option value="">Select</option>' +
        this.developers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }

    if (projSelect) {
      const projects = Array.from(new Set(this.properties.map(p => p.title)));
      projSelect.innerHTML = '<option value="">Select</option>' +
        projects.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    this.updateAllSearchableSelects();
  }

  setupSearchableSelects() {
    const targetSelectIds = [
      'hero-city-select',
      'hero-type-select',
      'filter-location-select',
      'filter-developer-select',
      'filter-project-select',
      'filter-type-select'
    ];

    targetSelectIds.forEach(id => {
      const select = document.getElementById(id);
      if (select && !select.dataset.searchableInit) {
        this.initSingleSearchableSelect(select);
      }
    });

    if (!this.searchableSelectsGlobalBound) {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.searchable-select-wrapper')) {
          document.querySelectorAll('.searchable-select-wrapper.open').forEach(w => w.classList.remove('open'));
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.searchable-select-wrapper.open').forEach(w => w.classList.remove('open'));
        }
      });
      this.searchableSelectsGlobalBound = true;
    }
  }

  initSingleSearchableSelect(select) {
    if (!select || select.dataset.searchableInit === "true") return;
    select.dataset.searchableInit = "true";

    const wrapper = document.createElement('div');
    wrapper.className = 'searchable-select-wrapper';
    
    if (select.classList.contains('hero-select-field-white')) {
      wrapper.classList.add('hero-select-wrapper');
    }

    const firstOptText = select.options[0]?.text || 'Select...';

    wrapper.innerHTML = `
      <button type="button" class="searchable-select-trigger" aria-haspopup="listbox">
        <span class="searchable-select-label">${firstOptText}</span>
        <svg class="searchable-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="searchable-select-popover">
        <div class="searchable-select-search-wrap">
          <input type="text" class="searchable-select-search-input" placeholder="Search..." autocomplete="off">
        </div>
        <div class="searchable-select-options-list"></div>
      </div>
    `;

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.style.display = 'none';

    const trigger = wrapper.querySelector('.searchable-select-trigger');
    const searchInput = wrapper.querySelector('.searchable-select-search-input');
    const optionsList = wrapper.querySelector('.searchable-select-options-list');

    const renderOptions = (filterTerm = '') => {
      const options = Array.from(select.options);
      const term = filterTerm.toLowerCase().trim();
      
      const filtered = options.filter(opt => opt.text.toLowerCase().includes(term));

      if (filtered.length === 0) {
        optionsList.innerHTML = `<div class="searchable-select-no-results">No matching options found</div>`;
        return;
      }

      optionsList.innerHTML = filtered.map(opt => {
        const isSelected = opt.value === select.value || (!select.value && opt === select.options[select.selectedIndex]);
        return `
          <div class="searchable-select-option ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
            <span>${opt.text}</span>
            ${isSelected ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7C79" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
        `;
      }).join('');

      optionsList.querySelectorAll('.searchable-select-option').forEach(optEl => {
        optEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = optEl.dataset.value;
          select.value = val;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          wrapper.classList.remove('open');
          this.updateSearchableSelectUI(select);
        });
      });
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isAlreadyOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.searchable-select-wrapper.open').forEach(w => w.classList.remove('open'));

      if (!isAlreadyOpen) {
        wrapper.classList.add('open');
        searchInput.value = '';
        renderOptions('');
        setTimeout(() => searchInput.focus(), 40);
      }
    });

    searchInput.addEventListener('input', (e) => {
      renderOptions(e.target.value);
    });

    select.addEventListener('change', () => {
      this.updateSearchableSelectUI(select);
    });

    this.updateSearchableSelectUI(select);
  }

  updateSearchableSelectUI(select) {
    if (!select) return;
    const wrapper = select.closest('.searchable-select-wrapper');
    if (!wrapper) return;
    const labelSpan = wrapper.querySelector('.searchable-select-label');
    const selectedOpt = select.options[select.selectedIndex];
    if (labelSpan && selectedOpt) {
      labelSpan.textContent = selectedOpt.text;
    }
  }

  updateAllSearchableSelects() {
    document.querySelectorAll('select[data-searchable-init]').forEach(select => {
      const wrapper = select.closest('.searchable-select-wrapper');
      if (wrapper) {
        this.updateSearchableSelectUI(select);
      } else {
        this.initSingleSearchableSelect(select);
      }
    });
  }

  applyFilterDrawerValues() {
    this.filters.downpaymentFrom = document.getElementById('filter-dp-from')?.value || '';
    this.filters.downpaymentTo = document.getElementById('filter-dp-to')?.value || '';
    this.filters.installmentsFrom = document.getElementById('filter-inst-from')?.value || '';
    this.filters.installmentsTo = document.getElementById('filter-inst-to')?.value || '';
    this.filters.priceFrom = document.getElementById('filter-price-from')?.value || '';
    this.filters.priceTo = document.getElementById('filter-price-to')?.value || '';
    this.filters.areaFrom = document.getElementById('filter-area-from')?.value || '';
    this.filters.areaTo = document.getElementById('filter-area-to')?.value || '';

    this.filters.location = document.getElementById('filter-location-select')?.value || '';
    this.filters.developer = document.getElementById('filter-developer-select')?.value || '';
    this.filters.project = document.getElementById('filter-project-select')?.value || '';
    this.filters.propertyType = document.getElementById('filter-type-select')?.value || '';
    this.filters.floor = document.getElementById('filter-floor-select')?.value || '';
    this.filters.finishing = document.getElementById('filter-finishing-select')?.value || '';
    this.filters.deliveryDate = document.getElementById('filter-delivery-select')?.value || '';

    const activeBedPill = document.querySelector('#bedroom-circles-group .circle-pill.active');
    this.filters.bedrooms = activeBedPill ? (activeBedPill.dataset.value || activeBedPill.textContent.trim()) : 'Any';

    const activeBathPill = document.querySelector('#bathroom-circles-group .circle-pill.active');
    this.filters.bathrooms = activeBathPill ? (activeBathPill.dataset.value || activeBathPill.textContent.trim()) : 'Any';

    const selectedLicenses = new Set();
    document.querySelectorAll('.toggle-pill-switch:checked').forEach(cb => {
      selectedLicenses.add(cb.value);
    });
    this.filters.licenses = selectedLicenses;

    this.showToast('Search filters applied');
    this.renderPropertiesView();
  }

  resetFilters() {
    this.filters = {
      downpaymentFrom: '', downpaymentTo: '', installmentsFrom: '', installmentsTo: '',
      priceFrom: '', priceTo: '', areaFrom: '', areaTo: '',
      location: '', developer: '', project: '', bedrooms: 'Any', bathrooms: 'Any',
      propertyType: '', floor: '', finishing: '', deliveryDate: '',
      licenses: new Set()
    };
    this.searchQuery = '';
    
    ['filter-dp-from', 'filter-dp-to', 'filter-inst-from', 'filter-inst-to', 'filter-price-from', 'filter-price-to', 'filter-area-from', 'filter-area-to'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    ['filter-location-select', 'filter-developer-select', 'filter-project-select', 'filter-type-select', 'filter-floor-select', 'filter-finishing-select', 'filter-delivery-select', 'hero-city-select', 'hero-type-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    document.querySelectorAll('#bedroom-circles-group .circle-pill').forEach(b => {
      if (b.dataset.value === 'Any') b.classList.add('active');
      else b.classList.remove('active');
    });

    document.querySelectorAll('#bathroom-circles-group .circle-pill').forEach(b => {
      if (b.dataset.value === 'Any') b.classList.add('active');
      else b.classList.remove('active');
    });

    document.querySelectorAll('.toggle-pill-switch').forEach(cb => {
      cb.checked = false;
    });

    this.showToast('Search filters reset');
    if (window.location.hash === '#/properties') this.renderPropertiesView();
  }

  getFilteredProperties() {
    return this.properties.filter(p => {
      // 1. Rent vs Resale vs All tab filter
      if (this.currentMode === 'rent' && !p.isRent) return false;
      if (this.currentMode === 'resale' && p.isRent) return false;

      // 2. Keyword Search Query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        const fullText = `${p.title} ${p.developer} ${p.project || ''} ${p.location} ${p.propertyType} ${p.finishing || ''}`.toLowerCase();
        if (!fullText.includes(query)) return false;
      }

      // 3. Location Filter
      if (this.filters.location && this.filters.location !== 'All Cities' && this.filters.location !== '') {
        const targetLoc = this.filters.location.toLowerCase();
        const propLoc = (p.location || '').toLowerCase();
        if (!propLoc.includes(targetLoc) && !targetLoc.includes(propLoc)) return false;
      }

      // 4. Developer Filter
      if (this.filters.developer && this.filters.developer !== '') {
        const targetDev = this.filters.developer.toLowerCase();
        const propDev = (p.developer || '').toLowerCase();
        if (!propDev.includes(targetDev)) return false;
      }

      // 5. Project Filter (Matches p.project OR p.title)
      if (this.filters.project && this.filters.project !== '') {
        const targetProj = this.filters.project.toLowerCase();
        const propProj = `${p.project || ''} ${p.title || ''}`.toLowerCase();
        if (!propProj.includes(targetProj)) return false;
      }

      // 6. Property Type Filter
      if (this.filters.propertyType && this.filters.propertyType !== '') {
        const targetType = this.filters.propertyType.toLowerCase();
        const propType = (p.propertyType || '').toLowerCase();
        if (!propType.includes(targetType)) return false;
      }

      // 7. Bedrooms Filter
      if (this.filters.bedrooms && this.filters.bedrooms !== 'Any') {
        const valStr = this.filters.bedrooms.replace('+', '');
        const reqBeds = parseInt(valStr, 10);
        if (!isNaN(reqBeds)) {
          if (this.filters.bedrooms.includes('+')) {
            if (p.bedrooms < reqBeds) return false;
          } else {
            if (p.bedrooms !== reqBeds) return false;
          }
        }
      }

      // 8. Bathrooms Filter
      if (this.filters.bathrooms && this.filters.bathrooms !== 'Any') {
        const valStr = this.filters.bathrooms.replace('+', '');
        const reqBaths = parseInt(valStr, 10);
        if (!isNaN(reqBaths)) {
          if (this.filters.bathrooms.includes('+')) {
            if (p.bathrooms < reqBaths) return false;
          } else {
            if (p.bathrooms !== reqBaths) return false;
          }
        }
      }

      // 9. Floor Filter
      if (this.filters.floor && this.filters.floor !== '') {
        const targetFloor = this.filters.floor.toLowerCase();
        const propFloor = (p.floor || p.propertyType || '').toLowerCase();
        if (!propFloor.includes(targetFloor)) return false;
      }

      // 10. Finishing Status Filter
      if (this.filters.finishing && this.filters.finishing !== '') {
        const targetFin = this.filters.finishing.toLowerCase();
        const propFin = (p.finishing || '').toLowerCase();
        if (!propFin.includes(targetFin)) return false;
      }

      // 11. Delivery Date Filter
      if (this.filters.deliveryDate && this.filters.deliveryDate !== '') {
        const targetDel = this.filters.deliveryDate.toLowerCase();
        const propDel = (p.deliveryDate || '').toLowerCase();
        if (!propDel.includes(targetDel)) return false;
      }

      // 12. License Filter (Basic, Featured, Premium)
      if (this.filters.licenses && this.filters.licenses.size > 0) {
        const propLicense = p.license || (p.isPremium ? 'Premium' : 'Featured');
        if (!this.filters.licenses.has(propLicense)) return false;
      }

      // 13. Price Range Filter (Min & Max)
      if (this.filters.priceFrom && parseFloat(this.filters.priceFrom) > 0) {
        if (p.totalPrice < parseFloat(this.filters.priceFrom)) return false;
      }
      if (this.filters.priceTo && parseFloat(this.filters.priceTo) > 0) {
        if (p.totalPrice > parseFloat(this.filters.priceTo)) return false;
      }

      // 14. Downpayment Range Filter (Min & Max)
      if (this.filters.downpaymentFrom && parseFloat(this.filters.downpaymentFrom) > 0) {
        if ((p.downpayment || 0) < parseFloat(this.filters.downpaymentFrom)) return false;
      }
      if (this.filters.downpaymentTo && parseFloat(this.filters.downpaymentTo) > 0) {
        if ((p.downpayment || 0) > parseFloat(this.filters.downpaymentTo)) return false;
      }

      // 15. Area Range Filter (Min & Max m²)
      if (this.filters.areaFrom && parseFloat(this.filters.areaFrom) > 0) {
        if ((p.area || 0) < parseFloat(this.filters.areaFrom)) return false;
      }
      if (this.filters.areaTo && parseFloat(this.filters.areaTo) > 0) {
        if ((p.area || 0) > parseFloat(this.filters.areaTo)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (this.sortOption === 'low-price') return a.totalPrice - b.totalPrice;
      if (this.sortOption === 'high-price') return b.totalPrice - a.totalPrice;
      if (this.sortOption === 'favorites') return (this.wishlist.has(b.id) ? 1 : 0) - (this.wishlist.has(a.id) ? 1 : 0);
      return 0;
    });
  }

  // CATALOG CARD RENDERER — White Background Card with Hover Meta & Action Buttons on Image
  renderPropertyCardHTML(property, isRecommended = false) {
    const isWishlisted = this.wishlist.has(property.id);
    const badgeText = (property.license === 'Premium' || property.isPremium) ? 'Premium' : 'Featured';
    const badgeClass = badgeText === 'Premium' ? 'app-badge-premium' : 'app-badge-featured';
    const lastUpdated = property.lastUpdated || '2026-07-20';
    const dpText = property.downpayment ? `${formatCurrencyEGP(property.downpayment)}` : '0 EGP';
    const totalText = formatCurrencyEGP(property.totalPrice);

    return `
      <div class="app-resale-card" onclick="window.location.hash='#/properties/${property.slug}'">
        <!-- Top Image Container -->
        <div class="app-card-photo-wrap">
          <img src="${property.image}" alt="${property.title}" loading="lazy">
          
          <!-- Flush Corner Badge Tag -->
          <span class="app-card-badge ${badgeClass}">${badgeText}</span>

          <!-- Top Right Heart Action Button -->
          <div class="app-card-top-actions">
            <button class="app-card-action-btn app-card-heart-btn ${isWishlisted ? 'active' : ''}" data-id="${property.id}"
              onclick="app.toggleWishlist('${property.id}', event)" title="Save to Wishlist">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>

          <!-- Bottom Image Hover Bar: Date Left & Stars Right -->
          <div class="app-card-image-hover-bar">
            <div class="app-card-date-hover">Last updated :${lastUpdated}</div>
            <div class="app-card-stars-hover">★★★★★</div>
          </div>
        </div>

        <!-- White Background Body under Image -->
        <div class="app-card-white-body">
          <div class="app-card-title-main">${property.developer} - ${property.project || property.title}</div>
          <div class="app-card-subtitle-type">${property.propertyType}</div>

          <!-- Extra details shown in Row/List View Mode (Professional Corporate SVGs) -->
          <div class="app-card-row-extra-details">
            <div class="row-extra-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"/><path d="M21 9H9v12"/></svg>
              <span>${property.area} m² Area</span>
            </div>
            ${property.gardenArea ? `
              <div class="row-extra-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                <span>${property.gardenArea} m² Garden</span>
              </div>
            ` : ''}
            <div class="row-extra-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>${property.finishing}</span>
            </div>
            <div class="row-extra-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3"/></svg>
              <span>${property.deliveryDate}</span>
            </div>
            <div class="row-extra-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${property.location}</span>
            </div>
          </div>

          <div class="app-card-details-grid">
            <div class="app-card-col-left">
              <div class="app-card-spec-line">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-1.66-1.34-3-3-3z"/></svg>
                <span>${property.bedrooms} Bedrooms</span>
              </div>
              <div class="app-card-spec-line">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748B"><path d="M20 13V4.83C20 3.27 18.73 2 17.17 2c-.75 0-1.47.3-2 .83l-1.17 1.17c-.53.53-.83 1.25-.83 2V13h-2V6c0-1.66-1.34-3-3-3S5 4.34 5 6v7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-1z"/></svg>
                <span>${property.bathrooms} Bathrooms</span>
              </div>
            </div>

            <div class="app-card-col-right">
              <div class="app-card-price-line">
                <span class="price-lbl">Downpayment: </span>
                <span class="price-val">${dpText}</span>
              </div>
              <div class="app-card-price-line">
                <span class="price-lbl">Total Price: </span>
                <span class="price-val">${totalText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderHomeView() {
    const list = this.getFilteredProperties();

    // 1. Recommended Properties — 6 cards
    const recTarget = document.getElementById('featured-properties-target');
    if (recTarget) {
      recTarget.innerHTML = list.slice(0, 6).map(p => this.renderPropertyCardHTML(p, true)).join('');
    }

    // 2. Our Featured Listings — 3 cards (placed right on top of the mobile section)
    const ourFeatTarget = document.getElementById('our-featured-properties-target');
    if (ourFeatTarget) {
      const featuredList = list.slice(0, 3);
      ourFeatTarget.innerHTML = featuredList.map(p => this.renderPropertyCardHTML(p, true)).join('');
    }

    // 3. Today's Offer Peeking Carousel with 3-second auto-play loop
    this.renderTodaysOffers();

    // 4. Our Trusted Developers Logo Slider
    this.renderDeveloperSlider();

    setTimeout(() => this.observeScrollAnimations(), 30);
  }

  renderDeveloperSlider() {
    const container = document.getElementById('dev-grid-14-target');
    if (!container) return;

    container.innerHTML = this.developers.map(dev => `
      <div class="dev-grid-logo-item" onclick="app.filterByDeveloper('${dev.name}')" title="Filter by ${dev.name}">
        <img src="${dev.logoImg}" alt="${dev.name}" class="dev-grid-logo-img">
      </div>
    `).join('');
  }

  renderTodaysOffers() {
    const container = document.getElementById('todays-offer-slider-track');
    if (!container) return;

    if (!container.dataset.initialized) {
      container.dataset.initialized = "true";

      // 6-slot infinite loop rendering: [LastItem, Item0, Item1, Item2, Item3, FirstItem]
      this.loopOffers = [
        this.offerItems[3],
        ...this.offerItems,
        this.offerItems[0]
      ];

      container.innerHTML = `
        <div class="peeking-carousel-wrapper">
          <div id="peeking-offer-track" class="peeking-offer-track">
            ${this.loopOffers.map((offer, slotIdx) => `
              <div class="peeking-offer-card ${slotIdx === this.activeSlotIndex ? 'active' : ''}"
                onclick="window.location.hash='#/properties/${offer.slug}'">
                <img src="${offer.image}" alt="${offer.title}" class="peeking-offer-img" loading="lazy">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="peeking-offer-dots-row">
          ${this.offerItems.map((_, i) => `
            <span class="peeking-offer-dot ${i === (this.activeSlotIndex - 1) ? 'active' : ''}"
              onclick="app.goToOfferSlide(${i});"></span>
          `).join('')}
        </div>
      `;

      container.addEventListener('mouseenter', () => this.pauseOfferAutoPlay());
      container.addEventListener('mouseleave', () => {
        if (this.isOfferSectionInView) this.startOfferAutoPlay();
      });

      // 1. Wheel / Trackpad — only intercept HORIZONTAL scroll on touch devices
      container.addEventListener('wheel', (e) => {
        // Only intercept on touch/mobile devices
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (!isTouchDevice) return;

        // Only fire on clearly horizontal scroll — ignore vertical page scrolling
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5 && Math.abs(e.deltaX) > 15;
        if (!isHorizontal) return;

        e.preventDefault();
        const dir = e.deltaX > 0 ? 1 : -1;
        this.scrollOfferSlider(dir);
      }, { passive: false });

      // 2. Touch Swipe Gesture Engine — 1 swipe = EXACTLY 1 card step (resets timer!)
      let touchStartX = 0;
      let touchStartY = 0;

      container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.pauseOfferAutoPlay();
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Stricter horizontal check: must be decisively horizontal (not diagonal down-scroll)
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 40;
        if (isHorizontalSwipe) {
          const dir = deltaX < 0 ? 1 : -1;
          this.scrollOfferSlider(dir);
        } else if (this.isOfferSectionInView) {
          this.startOfferAutoPlay();
        }
      }, { passive: true });

      window.addEventListener('resize', () => {
        this.updateOfferSliderPosition(false);
      });
    }

    this.updateOfferSliderPosition(true);
    this.setupOfferIntersectionObserver();
  }

  setupOfferIntersectionObserver() {
    const section = document.querySelector('.todays-offer-section');
    if (!section) return;

    if (this.offerObserver) {
      this.offerObserver.disconnect();
    }

    this.offerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isOfferSectionInView = true;
          this.startOfferAutoPlay();
        } else {
          this.isOfferSectionInView = false;
          this.pauseOfferAutoPlay();
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    this.offerObserver.observe(section);
  }

  updateOfferSliderPosition(animate = true) {
    const track = document.getElementById('peeking-offer-track');
    if (!track) return;

    if (this.offerResetTimeout) {
      clearTimeout(this.offerResetTimeout);
      this.offerResetTimeout = null;
    }

    // Safety guard: clamp activeSlotIndex strictly within valid loop bounds [0, 5]
    if (this.activeSlotIndex > 5) this.activeSlotIndex = 5;
    if (this.activeSlotIndex < 0) this.activeSlotIndex = 0;

    const cards = track.querySelectorAll('.peeking-offer-card');

    if (!animate) {
      track.style.transition = 'none';
      cards.forEach(card => card.style.transition = 'none');
    } else {
      track.style.transition = 'transform 0.85s cubic-bezier(0.25, 1, 0.35, 1)';
      cards.forEach(card => card.style.transition = '');
    }

    const isMobile = window.innerWidth <= 768;
    const slidePercentage = isMobile ? 80 : 78;
    const gapPercentage = 2.5;
    const centerOffset = (100 - slidePercentage) / 2;
    const offset = centerOffset - this.activeSlotIndex * (slidePercentage + gapPercentage);

    track.style.transform = `translateX(${offset}%)`;

    let realIndex = this.activeSlotIndex - 1;
    if (realIndex < 0) realIndex = 3;
    if (realIndex > 3) realIndex = 0;

    cards.forEach((card, i) => {
      if (i === this.activeSlotIndex) card.classList.add('active');
      else card.classList.remove('active');
    });

    document.querySelectorAll('.peeking-offer-dot').forEach((dot, i) => {
      if (i === realIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (!animate) {
      // Add class to override CSS !important transition on mobile, then remove after snap
      track.classList.add('no-transition');
      cards.forEach(card => card.classList.add('no-transition'));
      void track.offsetHeight; // Force reflow so snap is instant
      requestAnimationFrame(() => {
        track.classList.remove('no-transition');
        cards.forEach(card => card.classList.remove('no-transition'));
      });
    }

    if (animate) {
      if (this.activeSlotIndex === 5) {
        this.offerResetTimeout = setTimeout(() => {
          this.activeSlotIndex = 1;
          this.updateOfferSliderPosition(false);
        }, 870);
      } else if (this.activeSlotIndex === 0) {
        this.offerResetTimeout = setTimeout(() => {
          this.activeSlotIndex = 4;
          this.updateOfferSliderPosition(false);
        }, 870);
      }
    }
  }

  startOfferAutoPlay() {
    if (!this.isOfferSectionInView) return;
    this.pauseOfferAutoPlay();

    this.offerAutoPlayTimer = setInterval(() => {
      this.scrollOfferSlider(1);
    }, 5000);
  }

  pauseOfferAutoPlay() {
    if (this.offerAutoPlayTimer) {
      clearInterval(this.offerAutoPlayTimer);
      this.offerAutoPlayTimer = null;
    }
  }

  goToOfferSlide(index) {
    if (this.isOfferSliding) return;
    this.isOfferSliding = true;
    setTimeout(() => { this.isOfferSliding = false; }, 850);

    this.activeSlotIndex = index + 1;
    this.updateOfferSliderPosition(true);
    if (this.isOfferSectionInView) {
      this.startOfferAutoPlay();
    }
  }

  scrollOfferSlider(direction) {
    if (this.isOfferSliding) return;
    this.isOfferSliding = true;
    setTimeout(() => { this.isOfferSliding = false; }, 850);

    // If currently at or beyond end slot 5 and moving forward, snap to 1 first so we slide to 2
    if (this.activeSlotIndex >= 5 && direction > 0) {
      this.activeSlotIndex = 1;
      this.updateOfferSliderPosition(false);
    } 
    // If currently at or below start slot 0 and moving backward, snap to 4 first so we slide to 3
    else if (this.activeSlotIndex <= 0 && direction < 0) {
      this.activeSlotIndex = 4;
      this.updateOfferSliderPosition(false);
    }

    this.activeSlotIndex += direction;
    this.updateOfferSliderPosition(true);
    if (this.isOfferSectionInView) {
      this.startOfferAutoPlay();
    }
  }

  filterByLocation(locationName) {
    this.filters.location = locationName;
    window.location.hash = '#/properties';
  }

  filterByDeveloper(developerName) {
    this.filters.developer = developerName;
    window.location.hash = '#/properties';
  }

  setSortOption(option) {
    if (this.sortOption === option) {
      this.sortOption = 'default';
    } else {
      this.sortOption = option;
    }
    this.renderPropertiesView();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const gridBtn = document.getElementById('btn-view-grid');
    const listBtn = document.getElementById('btn-view-list');
    const target = document.getElementById('properties-full-grid');

    if (gridBtn && listBtn) {
      if (mode === 'list') {
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
      } else {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
      }
    }

    if (target) {
      if (mode === 'list') {
        target.classList.add('list-view-mode');
      } else {
        target.classList.remove('list-view-mode');
      }
    }
  }

  renderPropertiesView() {
    const list = this.getFilteredProperties();
    const grid = document.getElementById('properties-full-grid');
    const countLabel = document.getElementById('properties-results-count');
    const tagsContainer = document.getElementById('active-filter-tags');

    const hasActiveFilters = Boolean(
      this.filters.location ||
      this.filters.developer ||
      this.filters.project ||
      this.filters.propertyType ||
      this.filters.priceTo ||
      this.filters.priceFrom ||
      this.filters.downpaymentTo ||
      this.searchQuery
    );

    if (countLabel) {
      if (hasActiveFilters) {
        countLabel.textContent = `${list.length} Results`;
        countLabel.style.display = 'block';
      } else {
        countLabel.style.display = 'none';
      }
    }

    // Ensure sort pill active state matches current sortOption
    document.querySelectorAll('.sort-pill-btn').forEach(btn => {
      if (btn.dataset.sort === this.sortOption && this.sortOption !== 'default') btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Active Filters Tag Bar — Shown ONLY when filters are active
    if (tagsContainer) {
      if (hasActiveFilters) {
        tagsContainer.style.display = 'flex';
        let tagsHTML = '';
        if (this.filters.location) {
          tagsHTML += `<div class="active-filter-chip">Location: ${this.filters.location} <span onclick="app.filters.location=''; app.renderPropertiesView();">×</span></div>`;
        }
        if (this.filters.developer) {
          tagsHTML += `<div class="active-filter-chip">Developer: ${this.filters.developer} <span onclick="app.filters.developer=''; app.renderPropertiesView();">×</span></div>`;
        }
        if (this.filters.propertyType) {
          tagsHTML += `<div class="active-filter-chip">Type: ${this.filters.propertyType} <span onclick="app.filters.propertyType=''; app.renderPropertiesView();">×</span></div>`;
        }
        if (this.searchQuery) {
          tagsHTML += `<div class="active-filter-chip">Keyword: "${this.searchQuery}" <span onclick="app.searchQuery=''; app.renderPropertiesView();">×</span></div>`;
        }
        tagsHTML += `<button class="btn-clear-all-text" onclick="app.resetFilters()">CLEAR ALL</button>`;
        tagsContainer.innerHTML = tagsHTML;
      } else {
        tagsContainer.style.display = 'none';
        tagsContainer.innerHTML = '';
      }
    }

    if (grid) {
      if (this.viewMode === 'list') {
        grid.classList.add('list-view-mode');
      } else {
        grid.classList.remove('list-view-mode');
      }

      if (list.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: #FFF; border-radius: 18px;">
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">No matching properties</h3>
            <p style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">Try expanding your search criteria.</p>
            <button class="btn-nav-teal" style="margin:0 auto; padding: 10px 24px;" onclick="app.resetFilters()">Reset Filters</button>
          </div>
        `;
      } else {
        grid.innerHTML = list.map(p => this.renderPropertyCardHTML(p)).join('');
      }
    }

    setTimeout(() => this.observeScrollAnimations(), 30);
  }

  renderPropertyDetailView(property) {
    const target = document.getElementById('detail-view-target');
    if (!target) return;

    this.activeDetailProperty = property;
    this.detailGallerySlide = 0;

    const galleryHTML = this.buildDetailGalleryHTML(property, 0);

    // Determine badge styling matching property card standards
    const licenseRaw = (property.license || 'Featured').toUpperCase();
    const badgeClass = licenseRaw.includes('PREMIUM') ? 'app-badge-premium' : 'app-badge-featured';
    const badgeText = licenseRaw.includes('PREMIUM') ? 'PREMIUM' : 'FEATURED';

    // Find 3 related properties in the same city/location
    const sameCityProps = (this.properties || []).filter(p => 
      p.id !== property.id && 
      p.location && 
      (p.location === property.location || p.location.includes(property.location) || property.location.includes(p.location))
    );
    const otherProps = (this.properties || []).filter(p => p.id !== property.id && !sameCityProps.includes(p));
    const relatedList = [...sameCityProps, ...otherProps].slice(0, 3);
    const relatedCardsHTML = relatedList.map(p => this.renderPropertyCardHTML(p)).join('');

    target.innerHTML = `
      <div class="detail-container-wrap" style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Desktop Dynamic Gallery (1-16 Photos, 4x4 Slider) -->
        ${galleryHTML}

        <!-- Property Header Block -->
        <div class="detail-header-block">
          <div class="detail-header-top-row">
            <div>
              <h1 class="detail-title-large">${property.title}</h1>
              <div class="detail-type-loc-line">Property Type : ${property.propertyType} • ${property.location}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="color: #F59E0B; font-size: 16px;">★★★★★</div>
              <span class="app-card-badge ${badgeClass}" style="position: static; font-size: 11px; padding: 5px 14px; border-radius: 6px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;">${badgeText}</span>
            </div>
          </div>

          <!-- Feature Chips with Card Row Mode Vector SVG Icons -->
          <div class="detail-feature-pills-flex">
            <div class="detail-app-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0E7C79"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-1.66-1.34-3-3-3z"/></svg>
              <span>${property.bedrooms} Bedrooms</span>
            </div>
            <div class="detail-app-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0E7C79"><path d="M20 13V4.83C20 3.27 18.73 2 17.17 2c-.75 0-1.47.3-2 .83l-1.17 1.17c-.53.53-.83 1.25-.83 2V13h-2V6c0-1.66-1.34-3-3-3S5 4.34 5 6v7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-1z"/></svg>
              <span>${property.bathrooms} Bathrooms</span>
            </div>
            <div class="detail-app-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"/><path d="M21 9H9v12"/></svg>
              <span>${property.area} m² Area</span>
            </div>
            ${property.gardenArea ? `
              <div class="detail-app-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                <span>${property.gardenArea} m² Garden</span>
              </div>
            ` : ''}
            <div class="detail-app-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>${property.finishing}</span>
            </div>
            <div class="detail-app-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3"/></svg>
              <span>${property.deliveryDate}</span>
            </div>
          </div>
        </div>

        <!-- 65% / 35% Desktop Body Grid -->
        <div class="detail-desktop-body-grid">
          
          <!-- LEFT COLUMN (65%) -->
          <div class="detail-left-content">
            
            <!-- Notes / About Section -->
            <div class="editorial-about-box">
              <h3 class="editorial-about-title">Notes</h3>
              <p class="editorial-about-paragraph">
                A ${property.finishing.toLowerCase()} ${property.propertyType.toLowerCase()} in <strong>${property.title}</strong> (${property.location}), featuring ${property.area} m² of indoor space${property.gardenArea ? ` with an additional ${property.gardenArea} m² private garden` : ''}.
              </p>
              <div style="margin-top: 14px; font-weight: 500; color: var(--text-primary);">
                ${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms · ${property.deliveryDate}
              </div>
            </div>

            <!-- Financial Summary Box -->
            <div class="financial-details-card">
              <h3 class="financial-details-title">PROPERTY DETAILS</h3>
              
              <div class="financial-grid-2col">
                <div class="financial-grid-cell">
                  <span class="cell-head">Area</span>
                  <span class="cell-val">${property.financialSummary.area}</span>
                </div>
                <div class="financial-grid-cell">
                  <span class="cell-head">Category</span>
                  <span class="cell-val">${property.financialSummary.category}</span>
                </div>

                <div class="financial-grid-cell">
                  <span class="cell-head">Total Price</span>
                  <span class="cell-val" style="font-weight: 600; color: var(--teal-primary);">${property.financialSummary.totalPrice}</span>
                </div>
                <div class="financial-grid-cell">
                  <span class="cell-head">Finishing</span>
                  <span class="cell-val">${property.financialSummary.finishing}</span>
                </div>

                <div class="financial-grid-cell">
                  <span class="cell-head">Downpayment</span>
                  <span class="cell-val">${property.financialSummary.downpayment}</span>
                </div>
                <div class="financial-grid-cell">
                  <span class="cell-head">Installments</span>
                  <span class="cell-val">${property.financialSummary.installments}</span>
                </div>

                <div class="financial-grid-cell">
                  <span class="cell-head">Garden / Roof / Land</span>
                  <span class="cell-val">${property.financialSummary.gardenRoofLand}</span>
                </div>
                <div class="financial-grid-cell">
                  <span class="cell-head">Delivery Date</span>
                  <span class="cell-val">${property.financialSummary.deliveryDate}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN (35% Sticky Pricing Card) -->
          <div class="detail-right-sticky-column">
            <div class="sticky-pricing-card">
              <div class="sticky-card-head">TOTAL PRICE</div>
              <div class="sticky-price-big">${formatCurrencyEGP(property.totalPrice)}</div>

              <div class="sticky-meta-pair">
                <span class="sticky-meta-label">Downpayment</span>
                <span class="sticky-meta-val">${formatCurrencyEGP(property.downpayment)}</span>
              </div>

              <div class="sticky-meta-pair">
                <span class="sticky-meta-label">Installment</span>
                <span class="sticky-meta-val">${formatCurrencyEGP(property.installments)}</span>
              </div>

              <div class="sticky-meta-pair">
                <span class="sticky-meta-label">Status</span>
                <span class="sticky-meta-val">${property.deliveryDate}</span>
              </div>

              <div class="sticky-action-buttons">
                <button class="btn-sticky-call" onclick="app.triggerCall('${property.agent.phone}')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  Call Now
                </button>
                <button class="btn-sticky-whatsapp" onclick="app.triggerWhatsApp('${property.agent.whatsapp}', '${property.title}')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Related Properties Section (3 Cards in Same City) -->
        <div class="related-properties-section" style="margin-top: 64px; padding-top: 40px; border-top: 1px solid #E2E8F0;padding:20px">
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">Related Properties in ${property.location}</h2>
            <p style="font-size: 14px; color: #64748B;">Similar verified properties available in ${property.location}</p>
          </div>
          <div class="property-app-grid">
            ${relatedCardsHTML}
          </div>
        </div>

      </div>
    `;
  }

  triggerCall(phone) {
    window.location.href = `tel:${phone}`;
  }

  triggerWhatsApp(phone, title) {
    const text = encodeURIComponent(`Hello, I am inquiring about listing: ${title} on TAP EGYPT marketplace.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  shareProperty(propertyId) {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      this.showToast('Property link copied to clipboard');
    }
  }

  downloadPropertyPDF(propertyId) {
    const property = this.properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const text = `TAP EGYPT PROPERTY SPECS\n\nTitle: ${property.title}\nType: ${property.propertyType}\nLocation: ${property.location}\nTotal Price: ${formatCurrencyEGP(property.totalPrice)}\nDownpayment: ${formatCurrencyEGP(property.downpayment)}\n\nNotes:\n${property.notes}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${property.slug}-specs.txt`;
    link.click();
    this.showToast('Downloaded property specs file');
  }

  showToast(message) {
    let toast = document.getElementById('toast-bar');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-bar';
      toast.className = 'toast-bar';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3500);
  }

  // HEADER UX MODAL HANDLERS
  openAuthModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  closeAuthModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  switchAuthTab(tab) {
    const loginBtn = document.getElementById('tab-login-btn');
    const signupBtn = document.getElementById('tab-signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (tab === 'login') {
      if (loginBtn) loginBtn.classList.add('active');
      if (signupBtn) signupBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
    } else {
      if (signupBtn) signupBtn.classList.add('active');
      if (loginBtn) loginBtn.classList.remove('active');
      if (signupForm) signupForm.style.display = 'block';
      if (loginForm) loginForm.style.display = 'none';
    }
  }

  handleAuthSubmit(type) {
    this.closeAuthModal();
    const userName = type === 'signup' 
      ? (document.getElementById('signup-name-input')?.value || 'Abdelrahman Tarek')
      : 'Abdelrahman Tarek';

    // Reveal App QR button & Saved Heart button when signed in
    const appQrBtn = document.querySelector('.nav-qr-wrapper');
    const savedBtn = document.querySelector('.btn-nav-saved-heart');
    if (appQrBtn) appQrBtn.style.display = 'block';
    if (savedBtn) savedBtn.style.display = 'flex';

    const authContainer = document.getElementById('nav-auth-container');
    if (authContainer) {
      authContainer.innerHTML = `
        <div class="user-profile-wrapper">
          <button class="btn-nav-user-chip">
            <span class="user-avatar-circle">${userName.charAt(0)}</span>
            <span>Hello, ${userName.split(' ')[0]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="user-popover-dropdown">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${userName}</div>
              <div class="user-dropdown-email">abdelrahman@tapegypt.com</div>
            </div>
            <div class="user-dropdown-item" onclick="app.openListingModal()">+ My Listed Units</div>
            <div class="user-dropdown-item" onclick="app.sortOption='favorites'; window.location.hash='#/properties';">❤️ Saved Properties (${this.wishlist.size})</div>
            <div class="user-dropdown-item" onclick="app.showToast('Account settings opened')">⚙️ Account Settings</div>
            <div class="user-dropdown-item" style="color: #EF4444; border-top: 1px solid var(--border-light);" onclick="location.reload()">🚪 Sign Out</div>
          </div>
        </div>
      `;
    }

    if (type === 'login') {
      this.showToast(`Welcome back, ${userName}!`);
    } else {
      this.showToast(`Welcome to TAP EGYPT, ${userName}! Account created.`);
    }
  }

  openListingModal() {
    const overlay = document.getElementById('listing-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  closeListingModal() {
    const overlay = document.getElementById('listing-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  handleListingSubmit(form) {
    const title = form.elements['title'].value;
    const price = Number(form.elements['price'].value) || 5000000;
    const type = form.elements['type'].value;
    const location = form.elements['location'].value;

    const newProp = {
      id: 'custom-' + Date.now(),
      slug: 'listing-' + Date.now(),
      title: title,
      totalPrice: price,
      downpayment: Math.round(price * 0.1),
      monthlyInstallment: Math.round((price * 0.9) / 84),
      location: location,
      propertyType: type === 'For Rent' ? 'Apartment' : 'Villa',
      deliveryDate: '2026',
      licenseType: 'Basic',
      featured: true,
      image: 'images/seashell_playa.png',
      bedrooms: 3,
      bathrooms: 2,
      area: 165,
      agent: { name: 'Direct Owner', phone: form.elements['phone'].value, whatsapp: form.elements['phone'].value }
    };

    this.properties.unshift(newProp);
    this.closeListingModal();
    this.showToast('Your property listing has been published live!');
    if (window.location.hash === '#/properties') this.renderPropertiesView();
  }

  openBlogModal() {
    const overlay = document.getElementById('blog-modal-overlay');
    if (overlay) overlay.classList.add('open');
  }

  closeBlogModal() {
    const overlay = document.getElementById('blog-modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  // DYNAMIC GALLERY GRID & 4x4 SLIDER ENGINE
  buildDetailGalleryHTML(property, slideIndex = 0) {
    const isWishlisted = this.wishlist.has(property.id);
    const gallery = (property.gallery && property.gallery.length > 0) ? property.gallery : [property.image];
    const totalPhotos = gallery.length;
    const pageSize = 4;
    const totalSlides = Math.ceil(totalPhotos / pageSize);
    const currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));
    const startIdx = currentSlide * pageSize;
    const currentGroup = gallery.slice(startIdx, startIdx + pageSize);

    let gridContentHTML = '';

    if (currentGroup.length === 1) {
      gridContentHTML = `
        <div class="gallery-layout-single" onclick="app.openLightbox(${startIdx})">
          <img src="${currentGroup[0]}" alt="${property.title}">
        </div>
      `;
    } else if (currentGroup.length === 2) {
      gridContentHTML = `
        <div class="gallery-layout-two">
          <div class="gallery-item-wrap" onclick="app.openLightbox(${startIdx})">
            <img src="${currentGroup[0]}" alt="${property.title} 1">
          </div>
          <div class="gallery-item-wrap" onclick="app.openLightbox(${startIdx + 1})">
            <img src="${currentGroup[1]}" alt="${property.title} 2">
          </div>
        </div>
      `;
    } else if (currentGroup.length === 3) {
      gridContentHTML = `
        <div class="gallery-layout-grid-3">
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx})">
            <img src="${currentGroup[0]}" alt="${property.title} 1">
          </div>
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx + 1})">
            <img src="${currentGroup[1]}" alt="${property.title} 2">
          </div>
          <div class="gallery-grid-item item-span-full" onclick="app.openLightbox(${startIdx + 2})">
            <img src="${currentGroup[2]}" alt="${property.title} 3">
          </div>
        </div>
      `;
    } else {
      // 4 photos in complete group (2 in a row!)
      const remainingCount = totalPhotos - (startIdx + 4);
      const showMoreOverlay = remainingCount > 0;

      gridContentHTML = `
        <div class="gallery-layout-grid-2x2">
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx})">
            <img src="${currentGroup[0]}" alt="${property.title} 1">
          </div>
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx + 1})">
            <img src="${currentGroup[1]}" alt="${property.title} 2">
          </div>
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx + 2})">
            <img src="${currentGroup[2]}" alt="${property.title} 3">
          </div>
          <div class="gallery-grid-item" onclick="app.openLightbox(${startIdx + 3})">
            <img src="${currentGroup[3]}" alt="${property.title} 4">
          </div>
        </div>
      `;
    }

    return `
      <div class="detail-desktop-gallery-wrapper">
        <!-- Top Action Buttons -->
        <div class="gallery-floating-left">
          <button class="circle-desktop-action-btn" onclick="window.history.back()" title="Back">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
        </div>

        <div class="gallery-floating-right">
          <button class="circle-desktop-action-btn" title="Download PDF" onclick="app.downloadPropertyPDF('${property.id}')">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </button>
          <button class="circle-desktop-action-btn" title="Share" onclick="app.shareProperty('${property.id}')">
            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </button>
          <button class="circle-desktop-action-btn ${isWishlisted ? 'active' : ''}" onclick="app.toggleWishlist('${property.id}', event)" title="Save">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>

        <!-- Dynamic Grid Content -->
        <div class="detail-gallery-grid-container">
          ${gridContentHTML}
        </div>

        <!-- Prev / Next Slider Floating Arrows -->
        ${totalSlides > 1 ? `
          <button class="gallery-slider-arrow prev-arrow ${currentSlide === 0 ? 'disabled' : ''}" onclick="app.changeGallerySlide(-1)" title="Previous Group">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button class="gallery-slider-arrow next-arrow ${currentSlide === totalSlides - 1 ? 'disabled' : ''}" onclick="app.changeGallerySlide(1)" title="Next Group">
            <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        ` : ''}

        <!-- Bottom Controls Bar -->
        <div class="gallery-bottom-controls">
          <div></div> <!-- Spacer -->

          <button class="gallery-view-all-btn" onclick="app.openLightbox(${startIdx})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
            <span>View All Photos (${totalPhotos})</span>
          </button>
        </div>
      </div>
    `;
  }

  changeGallerySlide(dir) {
    if (!this.activeDetailProperty) return;
    const gallery = (this.activeDetailProperty.gallery && this.activeDetailProperty.gallery.length > 0) ? this.activeDetailProperty.gallery : [this.activeDetailProperty.image];
    const totalSlides = Math.ceil(gallery.length / 4);
    
    let newSlide = (this.detailGallerySlide || 0) + dir;
    if (newSlide < 0 || newSlide >= totalSlides) return;
    
    this.detailGallerySlide = newSlide;
    const galleryWrap = document.querySelector('.detail-desktop-gallery-wrapper');
    if (galleryWrap) {
      galleryWrap.outerHTML = this.buildDetailGalleryHTML(this.activeDetailProperty, this.detailGallerySlide);
    }
  }

  // FULLSCREEN LIGHTBOX GALLERY MODAL
  openLightbox(index = 0) {
    if (!this.activeDetailProperty) return;
    const gallery = (this.activeDetailProperty.gallery && this.activeDetailProperty.gallery.length > 0) ? this.activeDetailProperty.gallery : [this.activeDetailProperty.image];
    this.lightboxIndex = index;

    let lightboxEl = document.getElementById('gallery-lightbox-modal');
    if (!lightboxEl) {
      lightboxEl = document.createElement('div');
      lightboxEl.id = 'gallery-lightbox-modal';
      lightboxEl.className = 'gallery-lightbox-modal';
      document.body.appendChild(lightboxEl);
    }

    this.renderLightboxContent(gallery);
  }

  renderLightboxContent(gallery) {
    const lightboxEl = document.getElementById('gallery-lightbox-modal');
    if (!lightboxEl) return;

    const currentImg = gallery[this.lightboxIndex] || gallery[0];
    const total = gallery.length;

    lightboxEl.innerHTML = `
      <div class="lightbox-overlay" onclick="app.closeLightbox()"></div>
      <div class="lightbox-content-container">
        <div class="lightbox-header">
          <span class="lightbox-counter">Photo ${this.lightboxIndex + 1} of ${total} — ${this.activeDetailProperty.title}</span>
          <button class="lightbox-close-btn" onclick="app.closeLightbox()">&times;</button>
        </div>

        <div class="lightbox-main-stage">
          ${total > 1 ? `
            <button class="lightbox-nav-btn prev" onclick="app.stepLightbox(-1)">&#10094;</button>
          ` : ''}
          <img src="${currentImg}" class="lightbox-active-img" alt="Photo ${this.lightboxIndex + 1}">
          ${total > 1 ? `
            <button class="lightbox-nav-btn next" onclick="app.stepLightbox(1)">&#10095;</button>
          ` : ''}
        </div>

        ${total > 1 ? `
          <div class="lightbox-thumb-strip">
            ${gallery.map((img, idx) => `
              <div class="lightbox-thumb-item ${idx === this.lightboxIndex ? 'active' : ''}" onclick="app.setLightboxIndex(${idx})">
                <img src="${img}" alt="Thumb ${idx + 1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    lightboxEl.classList.add('open');
  }

  stepLightbox(dir) {
    if (!this.activeDetailProperty) return;
    const gallery = (this.activeDetailProperty.gallery && this.activeDetailProperty.gallery.length > 0) ? this.activeDetailProperty.gallery : [this.activeDetailProperty.image];
    let newIdx = this.lightboxIndex + dir;
    if (newIdx < 0) newIdx = gallery.length - 1;
    if (newIdx >= gallery.length) newIdx = 0;
    this.lightboxIndex = newIdx;
    this.renderLightboxContent(gallery);
  }

  setLightboxIndex(idx) {
    this.lightboxIndex = idx;
    const gallery = (this.activeDetailProperty.gallery && this.activeDetailProperty.gallery.length > 0) ? this.activeDetailProperty.gallery : [this.activeDetailProperty.image];
    this.renderLightboxContent(gallery);
  }

  closeLightbox() {
    const lightboxEl = document.getElementById('gallery-lightbox-modal');
    if (lightboxEl) lightboxEl.classList.remove('open');
  }
}

// Global Init
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TapEgyptApp();
});

