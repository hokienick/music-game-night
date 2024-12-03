// Ensure the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const roomCodeInput = document.querySelector(".room-code-input");

    roomCodeInput.addEventListener("input", (event) => {
        // Ensure all characters are uppercase and limit input to alphanumeric characters
        const input = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        event.target.value = input.slice(0, 4); // Limit to 4 characters
    });
});