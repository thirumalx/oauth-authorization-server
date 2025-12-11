/**
 * Common JavaScript utilities for the Authorization Server
 */

/**
 * Auto-dismiss error and success messages after a specified duration
 * Messages will fade out smoothly and be removed from the DOM
 */
function autoDismissMessages() {
    const messages = document.querySelectorAll('.success-message, .error-message');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.transition = 'opacity 0.5s ease-out';
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 500); // Wait for fade-out transition to complete
        }, 5000); // Show message for 5 seconds
    });
}

// Initialize auto-dismiss when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    autoDismissMessages();
});
