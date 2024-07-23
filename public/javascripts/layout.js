// Gestione dell'evento keydown per backspace e invio
document.addEventListener('keydown', function (event) {
    if (event.key === 'Backspace') {
        let activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            event.preventDefault();
            window.history.back();
        }
    } else if (event.key === 'Enter') {
        let activeElement = document.activeElement;
        if (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A')
            activeElement.click();
    }
});
