// Database koppeling tussen zone-stopcontacten en groepen
const groepenMap = {
    "stopcontacten-bar": { hotspot: "hw-groep1", code: "Groep 1", img: "foto-bar-stopcontacten.jpg", info: "Schakel <strong>Groep 1</strong> uit. Dit maakt alle stopcontacten direct onder/rondom de bar spanningsloos." },
    "stroom-koeling": { hotspot: "hw-groep1", code: "Groep 1", img: "foto-keukenblok-koeling.jpg", info: "Schakel <strong>Groep 1</strong> uit. Dit haalt de spanning van de stroompunten voor de grote hoofdkoelkast en de flessenkoelkast." },
    "stopcontacten-muur-links": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-stopcontacten-muur.jpg", info: "Schakel <strong>Groep 2</strong> uit. Dit maakt de volledige rij stopcontacten op de linker houten wand spanningsloos." },
    "stroom-mediahoek": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-mediahoek.jpg", info: "Schakel <strong>Groep 2</strong> uit. Dit schakelt de stroompunten uit van de TV en media." },
    "stroompunten-plafond": { hotspot: "hw-groep3", code: "Groep 3", img: "foto-plafond-aansluiting.jpg", info: "Schakel <strong>Groep 3</strong> uit. Dit haalt de spanning van de plafond-stroompunten." },
    "stroom-kachels": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-stroom-verwarming.jpg", info: "Schakel <strong>Groep 4</strong> uit. Dit ontkoppelt de stroomtoevoer naar de kachels." },
    "stroom-buiten": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-stroom-buiten.jpg", info: "Schakel <strong>Groep 4</strong> uit. Hiermee haal je de spanning van de buitenstopcontacten." }
};

/**
 * Switch-functionaliteit App-Navigatie onderaan het scherm
 */
function switchTab(event, tabId) {
    clearHighlights();
    
    // De content switchen
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Actieve iconen in Bottom Nav instellen
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => btn.classList.remove('active'));
    
    // Voorkom error als het een element was via A-tag
    if (document.getElementById(tabId)) {
        document.getElementById(tabId).classList.add('active');
        event.currentTarget.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Groepenkiezer logica
 */
function findRequiredBreaker() {
    clearHighlights();
    const select = document.getElementById('appliance-select');
    const resultBox = document.getElementById('selector-result');
    const resultText = document.getElementById('result-text');
    const resultImg = document.getElementById('result-img');
    
    if (!select || !select.value || !groepenMap[select.value]) {
        if(resultBox) resultBox.classList.add('hidden');
        if(resultImg) resultImg.classList.add('hidden');
        return;
    }
    
    const data = groepenMap[select.value];
    
    if (data.img) {
        resultImg.src = data.img;
        resultImg.classList.remove('hidden');
    } else {
        resultImg.classList.add('hidden');
    }

    resultText.innerHTML = `<strong>Vereiste actie:</strong> ${data.info} (<span class="text-blue">${data.code}</span>)`;
    resultBox.classList.remove('hidden');
    
    const element = document.getElementById(data.hotspot);
    if (element) {
        element.classList.add('highlight-active');
    }
}

/**
 * Globale variabele voor status externe traject-beveiliging
 */
let isTrajectUnlocked = false;

/**
 * Toggle voor de Sticky Meterkast Afbeelding bovenaan
 */
function toggleVisual(forceOpen = false) {
    const content = document.getElementById('visual-content');
    const chevron = document.getElementById('visual-chevron');
    
    if (!content) return; // Beveiliging voor pagina's waar hij niet op staat

    if (content.classList.contains('hidden') || forceOpen === true) {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else if (forceOpen !== true) {
        content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
}

/**
 * Stappen-wizards logica met geïntegreerde wachtwoord ('niks') check
 */
function navigateWizard(wizardId, direction) {
    const wizard = document.getElementById(wizardId);
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.wizard-step');
    let currentStepIndex = -1;

    for (let i = 0; i < steps.length; i++) {
        if (steps[i].classList.contains('active')) {
            currentStepIndex = i;
            break;
        }
    }

    if (currentStepIndex === -1) return;
    const newStepIndex = currentStepIndex + direction;

    if (newStepIndex >= 0 && newStepIndex < steps.length) {
        
        // INTERCEPTIE: Stap 4 (index 3) naar stap 5 (index 4) bij trajectcontrole
        if (wizardId === 'wiz-kortsluiting-traject' && currentStepIndex === 3 && direction === 1) {
            if (!isTrajectUnlocked) {
                let pw = prompt("🔒 BEVEILIGD: De volgende stappen bevatten gevoelige informatie over de stroomvoorziening op het terrein.\n\nVoer het wachtwoord in:");
                
                // Het wachtwoord veranderd naar "niks"
                if (pw === "niks") { 
                    isTrajectUnlocked = true; // Ontgrendeld!
                } else {
                    if (pw !== null) {
                        alert("❌ Onjuist wachtwoord. Toegang tot het externe terrein geweigerd.");
                    }
                    return; // Blokkeer navigatie
                }
            }
        }

        // Voer de daadwerkelijke stapwissel uit
        steps[currentStepIndex].classList.remove('active');
        steps[newStepIndex].classList.add('active');

        const prevBtn = wizard.querySelector('.btn-prev');
        const nextBtn = wizard.querySelector('.btn-next');

        if (prevBtn) prevBtn.disabled = (newStepIndex === 0);
        if (nextBtn) nextBtn.disabled = (newStepIndex === steps.length - 1);

        applyStepHighlight(steps[newStepIndex]);
    }
}

function resetWizard(wizardId) {
    const wizard = document.getElementById(wizardId);
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.wizard-step');
    steps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
            applyStepHighlight(step);
        } else {
            step.classList.remove('active');
        }
    });

    const prevBtn = wizard.querySelector('.btn-prev');
    const nextBtn = wizard.querySelector('.btn-next');

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = (steps.length <= 1);
}

function applyStepHighlight(stepElement) {
    clearHighlights();
    const highlightData = stepElement.getAttribute('data-highlight');
    if (!highlightData) return;

    if (highlightData.includes(',')) {
        const targetIds = highlightData.split(',');
        targetIds.forEach(id => {
            const element = document.getElementById(id.trim());
            if (element) {
                element.classList.add('highlight-active');
            }
        });
    } else {
        const element = document.getElementById(highlightData.trim());
        if (element) {
            element.classList.add('highlight-active');
        }
    }
}

function handleAccordionToggle(detailsElement) {
    const select = document.getElementById('appliance-select');
    if (select) {
        select.value = "";
        const resBox = document.getElementById('selector-result');
        if(resBox) resBox.classList.add('hidden');
    }

    if (!detailsElement.open) {
        clearHighlights();
        return;
    }

    const allAccordions = document.querySelectorAll('.modern-card');
    allAccordions.forEach(acc => {
        if (acc !== detailsElement && acc.open) {
            acc.open = false;
        }
    });

    const wizard = detailsElement.querySelector('.step-wizard');
    if (wizard) {
        resetWizard(wizard.id);
    }
}

function highlightHotspot(id) {
    clearHighlights();
    const element = document.getElementById(id);
    if (element) element.classList.add('highlight-active');
}

function clearHighlights() {
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(hotspot => {
        hotspot.classList.remove('highlight-active');
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = "auto";
    }
};
