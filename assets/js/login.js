// Simulação de preenchimento automático para facilitar seus testes
window.onload = function() {
    const emailField = doc
    .querySelector('input[type="email"]');
    const passField = document.querySelector('input[type="password"]');
    
    // Se quiser que já venha preenchido, descomente as linhas abaixo:
    emailField.value = "admin";
    passField.value = "123";
};