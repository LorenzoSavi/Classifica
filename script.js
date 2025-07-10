class ClassificaManager {
    constructor() {
        this.teams = [];
        this.revealedCount = 0;
        this.revealOrder = [6, 5, 4, 3, 1, 2];
        this.positions = {};
        
        this.updatePositions();
        this.init();
    }

    updatePositions() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Posizioni precise per evitare sovrapposizioni
        this.positions = {
            // Posizioni basse (4°, 5°, 6°)
            6: { x: 60, y: screenHeight - 160 },
            5: { x: 140, y: screenHeight - 160 },
            4: { x: 220, y: screenHeight - 160 },
            // Posizioni podio (sopra i gradini)
            3: { x: screenWidth/2 + 57, y: screenHeight - 200 }, // Sopra gradino 3°
            1: { x: screenWidth/2 - 50, y: screenHeight - 240 }, // Sopra gradino 1°
            2: { x: screenWidth/2 - 157, y: screenHeight - 220 }  // Sopra gradino 2°
        };
    }

    init() {
        this.loadTeamScores();
        this.createCards();
        this.setupEventListeners();
        this.startSuspenseAnimation();
    }

    loadTeamScores() {
        const scores = JSON.parse(localStorage.getItem('teamScores') || '{}');
        
        this.teams = [
            { name: 'Fucsia', score: scores.fucsia || 0, color: '#ff00aa', class: 'fucsia' },
            { name: 'Verdi', score: scores.verdi || 0, color: '#00cc66', class: 'verdi' },
            { name: 'Blu', score: scores.blu || 0, color: '#007bff', class: 'blu' },
            { name: 'Gialli', score: scores.gialli || 0, color: '#ffcc00', class: 'gialli' },
            { name: 'Rossi', score: scores.rossi || 0, color: '#e53935', class: 'rossi' },
            { name: 'Arancioni', score: scores.arancioni || 0, color: '#ff6600', class: 'arancioni' }
        ];

        // Ordina per punteggio (dal più alto al più basso)
        this.teams.sort((a, b) => b.score - a.score);
        
        // Assegna posizioni (1° = indice 0, 2° = indice 1, etc.)
        this.teams.forEach((team, index) => {
            team.position = index + 1;
        });
    }

    createCards() {
        const container = document.getElementById('cardsContainer');
        
        this.teams.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = 'card suspense';
            card.dataset.teamIndex = index;
            
            // Posizione iniziale casuale (evitando zona podio)
            const randomX = Math.random() * (window.innerWidth - 120);
            const randomY = Math.random() * (window.innerHeight - 400) + 100;
            
            card.style.left = randomX + 'px';
            card.style.top = randomY + 'px';
            
            card.innerHTML = `
                <div class="card-front">
                    <div>???</div>
                </div>
                <div class="card-back ${team.class}">
                    <div class="team-name">${team.name}</div>
                    <div class="team-score">${team.score}</div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    setupEventListeners() {
        document.getElementById('revealBtn').addEventListener('click', () => {
            this.revealNextPosition();
        });
    }

    startSuspenseAnimation() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            // Animazione ritardata per ogni carta
            setTimeout(() => {
                card.style.animationDelay = (index * 0.5) + 's';
            }, index * 100);
        });
    }

    revealNextPosition() {
        if (this.revealedCount >= 6) return;

        const positionToReveal = this.revealOrder[this.revealedCount];
        const teamToReveal = this.teams.find(team => team.position === positionToReveal);
        const cardIndex = this.teams.indexOf(teamToReveal);
        
        const card = document.querySelector(`[data-team-index="${cardIndex}"]`);
        
        // Ferma l'animazione di suspense
        card.classList.remove('suspense');
        
        // Animazione speciale per il 1° posto
        if (positionToReveal === 1) {
            this.revealFirstPlace(card, teamToReveal);
        } else {
            this.revealNormalPosition(card, teamToReveal, positionToReveal);
        }

        this.revealedCount++;
        this.updateRevealButton();
    }

    revealFirstPlace(card, team) {
        // Effetto confetti
        this.createConfetti();
        
        // Mantieni colore vincente
        const cardBack = card.querySelector('.card-back');
        cardBack.classList.add('winner');
        
        // Animazione spettacolare
        card.classList.add('first-place-reveal');
        
        // Muovi alla posizione dopo l'animazione
        setTimeout(() => {
            card.classList.add('moving-to-position');
            const targetPos = this.positions[1];
            card.style.left = targetPos.x + 'px';
            card.style.top = targetPos.y + 'px';
            card.style.zIndex = '10';
            
            setTimeout(() => {
                card.classList.add('revealed');
                this.announcePosition(team, 1);
            }, 800);
        }, 1200);
    }

    revealNormalPosition(card, team, position) {
        // Carte non vincenti diventano bianche con immagine
        const cardBack = card.querySelector('.card-back');
        cardBack.classList.add('non-winner');
        
        card.classList.add('moving-to-position');
        
        // Muovi alla posizione
        const targetPos = this.positions[position];
        card.style.left = targetPos.x + 'px';
        card.style.top = targetPos.y + 'px';
        card.style.zIndex = '10';
        
        // Dopo il movimento, rivela la carta
        setTimeout(() => {
            card.classList.add('revealed', 'revealing');
            this.announcePosition(team, position);
        }, 800);
    }

    createConfetti() {
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.background = colors[Math.random() * colors.length | 0];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 50);
        }
    }

    updateRevealButton() {
        const btn = document.getElementById('revealBtn');
        if (this.revealedCount >= 6) {
            btn.textContent = '🎉 Classifica Completata!';
            btn.disabled = true;
        } else {
            const nextPos = this.revealOrder[this.revealedCount];
            if (nextPos === 1) {
                btn.textContent = '👑 RIVELA IL VINCITORE!';
                btn.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
                btn.style.color = '#333';
                btn.style.animation = 'pulse 1s ease-in-out infinite';
            } else {
                btn.textContent = `🎲 Rivela ${this.getPositionName(nextPos)}`;
            }
        }
    }

    getPositionName(position) {
        const names = {
            1: '1° Posto',
            2: '2° Posto', 
            3: '3° Posto',
            4: '4° Posto',
            5: '5° Posto',
            6: '6° Posto'
        };
        return names[position];
    }

    announcePosition(team, position) {
        // Effetto audio/visivo per l'annuncio
        console.log(`🏆 ${this.getPositionName(position)}: ${team.name} con ${team.score} punti!`);
        
        // Qui potresti aggiungere effetti sonori o popup
        if (position <= 3) {
            this.createFireworks();
        }
    }

    createFireworks() {
        // Semplice effetto fuochi d'artificio
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.style.position = 'absolute';
                firework.style.width = '4px';
                firework.style.height = '4px';
                firework.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
                firework.style.borderRadius = '50%';
                firework.style.left = (window.innerWidth/2) + (Math.random() * 200 - 100) + 'px';
                firework.style.top = (window.innerHeight/2) + (Math.random() * 200 - 100) + 'px';
                firework.style.animation = 'firework 1s ease-out forwards';
                document.body.appendChild(firework);
                
                setTimeout(() => firework.remove(), 1000);
            }, i * 100);
        }
    }
}

// Aggiungi CSS per animazione pulsante
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
        100% { transform: translateX(-50%) scale(1); }
    }
    
    @keyframes firework {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Gestione resize con aggiornamento posizioni
window.addEventListener('resize', () => {
    if (window.classificaManager) {
        window.classificaManager.updatePositions();
        
        // Riposiziona carte già rivelate
        const revealedCards = document.querySelectorAll('.card.revealed');
        revealedCards.forEach(card => {
            const teamIndex = parseInt(card.dataset.teamIndex);
            const team = window.classificaManager.teams[teamIndex];
            const targetPos = window.classificaManager.positions[team.position];
            card.style.left = targetPos.x + 'px';
            card.style.top = targetPos.y + 'px';
        });
    }
});

// Inizializza quando la pagina è carica
document.addEventListener('DOMContentLoaded', () => {
    window.classificaManager = new ClassificaManager();
});
