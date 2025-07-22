const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// ✅ Show welcome message on load
window.addEventListener('DOMContentLoaded', () => {
  appendMessage('bot', '👋 Welcome to <strong>Govt. Graduate College Jauharabad</strong>.<br>How may I help you?');
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  appendMessage('user', message);
  userInput.value = '';

  // Show loading spinner
  const loadingMsg = appendMessage('bot', '⏳ Please wait...');
  
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    // Remove loading
    chatBox.removeChild(loadingMsg);

    // Show bot reply
    appendMessage('bot', data.reply);
  } catch (err) {
    console.error(err);
    chatBox.removeChild(loadingMsg);
    appendMessage('bot', '⚠️ There was an error. Please try again later.');
  }
});

function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', role);

  // Format text: bold, italic, newlines
  const formattedText = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  msg.innerHTML = formattedText;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // useful for loading spinner reference
}
