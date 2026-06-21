const groepenMap = {
    "kachel-3kw": { hotspot: "hw-groep1", code: "Groep 1", img: "foto-kachel-3kw.jpg", info: "Zet <strong>Groep 1</strong> uit. Dit schakelt de grote 3 kW kachel uit." },
    "televisie": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-televisie.jpg", info: "Zet <strong>Groep 2</strong> uit. Dit haalt de stroom van de TV en de laptop." },
    "wifi": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-wifi.jpg", info: "Zet <strong>Groep 2</strong> uit. Let op: hiermee valt ook het internet uit!" },
    "koelkasten": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-koelkasten.jpg", info: "Zet <strong>Groep 2</strong> uit. Let op: hiermee vallen de koelkasten uit." },
    "kachel-2kw": { hotspot: "hw-groep2", code: "Groep 2", img: "foto-kachel-2kw.jpg", info: "Zet <strong>Groep 2</strong> uit. Dit haalt de stroom van de 2 kW kachel." },
    "buitenlicht": { hotspot: "hw-groep3", code: "Groep 3", img: "foto-stroom-buiten.jpg", info: "Zet <strong>Groep 3</strong> uit. Dit haalt alle stroom buiten eraf." },
    "frituurpan": { hotspot: "hw-groep3", code: "Groep 3", img: "foto-frituurpan.jpg", info: "Zet <strong>Groep 3</strong> uit. Hiermee schakel je de frituurpan veilig uit." },
    "muziekbox": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-muziekbox.jpg", info: "Zet <strong>Groep 4</strong> uit. Dit stopt de stroom naar de Fenton box." },
    "ledstrips": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-ledstrips.jpg", info: "Zet <strong>Groep 4</strong> uit om de LED en partylichten uit te doen." },
    "discobol": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-discobol.jpg", info: "Zet <strong>Groep 4</strong> uit. <br><span style='color:#ef4444;'>⚠️ LET OP:</span> Hier zit ook het noodlicht op!" },
    "rookmachine": { hotspot: "hw-groep4", code: "Groep 4", img: "foto-rookmachine.jpg", info: "Zet <strong>Groep 4</strong> uit om de rookmachine veilig los te koppelen." }
};

function openTab(tabId) {
    clearHighlights();
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.add('active');
    
    const targetNav = document.querySelector(`.nav-item[data-target="${tabId}"]`);
    if(targetNav) targetNav.classList.add('active');
}

function switchTab(event, tabId) {
    if(event) event.preventDefault();
    openTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let currentTargetManual = null;
let activeMapElement = null;

function goToManual() {
    closeMapInfo(null, true);
    if(currentTargetManual) {
        openTab('tab-info');
        const targetDetails = document.getElementById(currentTargetManual);
        if(targetDetails) {
            targetDetails.open = true;
            handleAccordionToggle(targetDetails);
            setTimeout(() => {
                targetDetails.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetDetails.classList.add('card-highlight-pulse');
                setTimeout(() => targetDetails.classList.remove('card-highlight-pulse'), 2000);
            }, 300);
        }
    }
}

function goToMapAndHighlight(hotspotId) {
    openTab('tab-map');
    setTimeout(() => {
        const hotspot = document.getElementById(hotspotId);
        if(hotspot) {
            hotspot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            hotspot.click(); 
        }
    }, 300);
}

function showMapInfo(element, title, description, manualId = null) {
    const modal = document.getElementById('map-info-modal');
    if (!modal) return;
    
    // Verwijder oude highlights en highlight de nieuwe
    clearHighlights();
    if (element) {
        element.classList.add('highlight-pulse');
        activeMapElement = element;
    }
    
    document.getElementById('map-info-title').innerText = title;
    document.getElementById('map-info-desc').innerHTML = description; 
    
    const manualBtn = document.getElementById('map-manual-btn');
    if(manualId && manualBtn) {
        currentTargetManual = manualId;
        manualBtn.classList.remove('hidden');
    } else if (manualBtn) {
        manualBtn.classList.add('hidden');
    }
    
    modal.classList.add('show');
}

function closeMapInfo(event, forceClose = false) {
    if (forceClose || event.target.id === 'map-info-modal') {
        document.getElementById('map-info-modal').classList.remove('show');
        if (activeMapElement) {
            activeMapElement.classList.remove('highlight-pulse');
            activeMapElement = null;
        }
    }
}

function handleAccordionToggle(detailsElement) {
    if (!detailsElement.open) {
        clearHighlights();
        return;
    }
    const allAccordions = document.querySelectorAll('.modern-card');
    allAccordions.forEach(acc => {
        if (acc !== detailsElement && acc.open) acc.open = false;
    });

    const wizard = detailsElement.querySelector('.step-wizard');
    if (wizard) resetWizard(wizard.id);
    
    setTimeout(() => {
        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
}

let isTrajectUnlocked = false;

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
        if (wizardId === 'wiz-kortsluiting-traject' && currentStepIndex === 3 && direction === 1) {
            if (!isTrajectUnlocked) {
                let pw = prompt("🔒 BEVEILIGD: Om van de stroomkasten buiten af te blijven, is een wachtwoord nodig.\n\nWat is het wachtwoord?");
                if (pw === "niks") { 
                    isTrajectUnlocked = true; 
                } else {
                    if (pw !== null) alert("❌ Fout wachtwoord! Blijf van de terrein-kasten af en bel Theun.");
                    return; 
                }
            }
        }

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
            if (element) element.classList.add('highlight-active');
        });
    } else {
        const element = document.getElementById(highlightData.trim());
        if (element) element.classList.add('highlight-active');
    }
}

function clearHighlights() {
    const hotspots = document.querySelectorAll('.hotspot, .map-item, .map-external');
    hotspots.forEach(hotspot => hotspot.classList.remove('highlight-active', 'highlight-pulse'));
}

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
    if (data.img && resultImg) {
        resultImg.src = data.img;
        resultImg.classList.remove('hidden');
    }
    if(resultText) resultText.innerHTML = `<strong>Wat moet je doen:</strong> ${data.info}`;
    if(resultBox) resultBox.classList.remove('hidden');
    
    const element = document.getElementById(data.hotspot);
    if (element) element.classList.add('highlight-active');
}

function toggleVisual(forceOpen = false) {
    const content = document.getElementById('visual-content');
    const chevron = document.getElementById('visual-chevron');
    if (!content) return;
    if (content.classList.contains('hidden') || forceOpen === true) {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else if (forceOpen !== true) {
        content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
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
