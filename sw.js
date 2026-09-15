let tasksData = [
    { id: 't1', dateStr: '2026-09-30' },
    { id: 't2', dateStr: '2026-10-01' },
    { id: 't3', dateStr: '2026-10-02' },
    { id: 't4', dateStr: '2026-10-03' }
];

// Stato predefinito nel Service Worker (può essere sincronizzato)
let backgroundState = {};
tasksData.forEach(t => {
    backgroundState[t.id] = { done: false, lastNotified: null };
});

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// Riceve lo stato aggiornato quando l'utente clicca "Fatto" dalla pagina
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_STATE') {
        backgroundState = event.data.state;
    }
});

// Funzione periodica o simulata tramite controllo di eventi di sincronizzazione / fetch
// Nota: Per garantire che il telefono controlli anche a pagina chiusa, sui sistemi moderni
// si sfrutta l'interazione o i timer periodici supportati da Chrome su Android.
setInterval(() => {
    const now = new Date();

    tasksData.forEach(task => {
        let taskState = backgroundState[task.id];
        if (!taskState || taskState.done) return; // Se è segnato come fatto, blocca tutto

        let targetDateTime = new Date(task.dateStr + "T19:00:00");

        if (now >= targetDateTime) {
            let lastNotified = taskState.lastNotified ? new Date(taskState.lastNotified) : null;

            // Se non è mai stata mandata o sono passati almeno 10 minuti
            if (!lastNotified || (now - lastNotified >= 10 * 60 * 1000)) {
                self.registration.showNotification("⚠️ Promemoria Sitter!", {
                    body: `Ricordati di andare a fare Cat & Rabbit Sitter (${task.dateStr} ore 19:00)! Apri l'app e clicca 'Fatto' per fermare gli avvisi.`,
                    icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
                    requireInteraction: true
                });

                backgroundState[task.id].lastNotified = now.toISOString();
            }
        }
    });
}, 30000); // Controlla ogni 30 secondi