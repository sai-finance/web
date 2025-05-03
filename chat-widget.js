// chat-widget.js - FINAL Merged Version with Markdown Rendering & DOMPurify

// Import the Gradio Client library
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// --- DOM Element References ---
const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const closeChat = document.getElementById('close-chat');
const newChatButton = document.getElementById('new-chat');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const messagesContainer = document.getElementById('chat-messages');
const errorDisplay = document.getElementById('chat-error');
// Language Buttons
const langButtonEn = document.getElementById('lang-en');
const langButtonTa = document.getElementById('lang-ta');

// --- Global Variables ---
let gradioClient = null;
let isConnecting = false;
let isWaitingForResponse = false;
const gradioSpaceUrl = "https://maha001-sai-finance-assistant.hf.space/"; // Your Gradio Space URL
const API_ENDPOINT = "/chat"; // Default endpoint
let currentLanguage = 'en'; // Default language ('en' or 'ta')

// Language-specific placeholders
const placeholders = {
    en: "Ask a question...",
    ta: "கேள்வி கேளுங்கள்..." // Tamil placeholder
};

// --- Initialization Function ---
async function initChatWidget() {
    // Basic check for necessary libraries
    if (typeof Client === 'undefined') {
        console.error("Gradio Client library not loaded.");
        return;
    }
     if (typeof marked === 'undefined') {
        console.error("Marked.js library not loaded. Markdown rendering disabled.");
    }
     if (typeof DOMPurify === 'undefined') {
        console.warn("DOMPurify library not loaded. Markdown rendering will be less secure.");
    }

    console.log(`[@gradio/client] Version check: ${Client.version || 'N/A'}`);
    if (!chatToggle || !chatContainer || !messagesContainer || !chatInput || !sendButton || !newChatButton || !closeChat || !errorDisplay || !langButtonEn || !langButtonTa) {
        console.error("Chat widget Init failed: Missing one or more HTML elements.");
        return;
    }
    addEventListeners();
    setLanguage(currentLanguage); // Set initial language UI
    // Don't connect automatically, wait for user interaction
}

// --- Connection Logic ---
async function connectClient() {
    if (isConnecting || gradioClient) return;
    isConnecting = true;
    setLoadingState(true, "Connecting to Assistant..."); // More specific message
    console.log("[connectClient] Connecting to:", gradioSpaceUrl);
    try {
        // Explicitly specify protocol if needed, though usually included in URL
        gradioClient = await Client.connect(gradioSpaceUrl);
        console.log("[connectClient] Connected.");
        clearError();
        setLoadingState(false);
        if (messagesContainer && messagesContainer.children.length === 0) {
            // Display welcome based on current language
            appendMessage(currentLanguage === 'en' ? "Hi! I'm Subha AI, your Sai Finance assistant. How can I help you today?" : "வணக்கம்! நான் சுபா AI, உங்கள் சாய் ஃபைனான்ஸ் உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?", 'bot');
        }
        isConnecting = false;
    } catch (error) {
        console.error('[connectClient] CONNECTION FAILED:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown connection error.';
        // More user-friendly error
        showError(`Could not connect to the assistant (${errorMsg}). Please try again later.`);
        setLoadingState(false, "Connection failed");
        isConnecting = false;
        gradioClient = null; // Ensure client is null on failure
    }
}

// --- Set Language Function ---
function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'ta') {
        console.warn("Unsupported language:", lang);
        return;
    }
    currentLanguage = lang;
    console.log("[setLanguage] Language set to:", currentLanguage);

    if (langButtonEn && langButtonTa) {
        langButtonEn.classList.toggle('active', currentLanguage === 'en');
        langButtonTa.classList.toggle('active', currentLanguage === 'ta');
    }
    if (chatInput) {
        chatInput.placeholder = placeholders[currentLanguage] || placeholders['en'];
    }
    // Optional: Start new chat on language switch?
    // startNewChat(); // Uncomment if desired
}

// --- Event Listener Setup ---
function addEventListeners() {
    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (closeChat) closeChat.addEventListener('click', hideChat);
    if (newChatButton) newChatButton.addEventListener('click', startNewChat);
    if (sendButton) sendButton.addEventListener('click', handleSendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
        // Connect on first focus if not already connecting/connected
        chatInput.addEventListener('focus', () => { if (!gradioClient && !isConnecting) { connectClient(); } }, { once: true }); // Only trigger connect on first focus
    }
    if (langButtonEn) langButtonEn.addEventListener('click', () => setLanguage('en'));
    if (langButtonTa) langButtonTa.addEventListener('click', () => setLanguage('ta'));
}

// --- Chat Visibility ---
function toggleChat() {
    if (!chatContainer) return;
    const isHidden = chatContainer.classList.contains('hidden');
    chatContainer.classList.toggle('hidden');
    // If opening, try connecting and focus input
    if (isHidden) {
        if (!gradioClient && !isConnecting) {
            connectClient();
        }
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 50); // Short delay helps ensure focus works
        }
    }
}
function hideChat() { if (chatContainer) chatContainer.classList.add('hidden'); }

// --- New Chat Function ---
function startNewChat() {
    console.log("[startNewChat] Starting new session...");
    if (messagesContainer) messagesContainer.innerHTML = ''; // Clear messages
    clearError();
    // Provide initial message based on selected language
    appendMessage(currentLanguage === 'en' ? "New chat. How can I assist?" : "புதிய உரையாடல். நான் எப்படி உதவ முடியும்?", 'bot');
    if (chatInput) chatInput.value = '';
    setLoadingState(false); // Reset loading state
    if (chatInput) chatInput.focus();
    // Optional: Reconnect client if sessions are handled server-side or state needs reset
    // gradioClient = null; connectClient();
}

// --- Message Handling (Prepends Language Instruction) ---
async function handleSendMessage() {
    console.log("[handleSendMessage] Attempting send. State:", { isConnecting, isWaitingForResponse, hasClient: !!gradioClient, lang: currentLanguage });
    if (isConnecting) { console.warn("Send aborted: Still connecting."); return; }
    if (isWaitingForResponse) { console.warn("Send aborted: Waiting for previous response."); return; }
    if (!gradioClient) { console.error("Send failed: Gradio client not connected."); showError("Not connected. Please wait or click input field."); connectClient(); return; } // Attempt reconnect
    if (!chatInput || !messagesContainer) { console.error("Send failed: Missing Input/Message elements."); return; }

    const userMessageOriginal = chatInput.value.trim();
    if (!userMessageOriginal) return;

    appendMessage(userMessageOriginal, 'user');
    chatInput.value = '';
    scrollToBottom();
    setLoadingState(true, "Processing...");
    const thinkingIndicator = appendMessage("Thinking...", 'bot', true);
    clearError();

    let messageToSend;
    if (currentLanguage === 'ta') { messageToSend = `Please respond ONLY in Tamil (தமிழ்): ${userMessageOriginal}`; }
    else { messageToSend = `Please respond ONLY in English: ${userMessageOriginal}`; }

    const payload = { message: { "text": messageToSend, "files": [] } };
    console.log("[handleSendMessage] Calling predict with payload:", JSON.stringify(payload));

    try {
        const result = await gradioClient.predict(API_ENDPOINT, payload);
        console.log("[handleSendMessage] Received Result:", JSON.stringify(result));

        let botMessageText = null;
        // Adjust parsing based on actual Gradio component output structure
        if (result?.data?.[0]) {
            const firstItem = result.data[0];
             // Check if the output might be nested (e.g., within another array or object)
             if (Array.isArray(firstItem) && firstItem.length > 0 && typeof firstItem[0] === 'string') {
                botMessageText = String(firstItem[0]).trim(); // Handle [[response]] case
                 console.log("[handleSendMessage] Parsed nested array string.");
             } else if (typeof firstItem === 'string') {
                botMessageText = String(firstItem).trim(); // Handle [response] case
                console.log("[handleSendMessage] Parsed direct string.");
            } else {
                 console.warn("[handleSendMessage] result.data[0] is not a string or expected structure:", firstItem);
                 botMessageText = String(firstItem); // Fallback conversion
            }
        } else { console.warn("[handleSendMessage] Invalid result structure:", result); }

        if (thinkingIndicator) thinkingIndicator.remove();

        if (botMessageText) { appendMessage(botMessageText, 'bot'); }
        else { console.error("[handleSendMessage] Failed to parse valid message."); appendMessage('Sorry, I received an unclear response from the assistant.', 'bot'); showError("Received unclear response."); }

    } catch (error) {
        console.error('[handleSendMessage] ERROR during predict call:', error);
        if (thinkingIndicator) thinkingIndicator.remove();
        let errorMsg = 'Sorry, the assistant encountered a problem processing your request.'; // Default user-friendly message
        if (error instanceof Error) { errorMsg = `Error: ${error.message}`; } // Get specific message if available
        else if (typeof error === 'object' && error !== null && error.message) { errorMsg = `Error: ${error.message}`; }
        appendMessage(errorMsg, 'bot');
        showError("Couldn't get response. Please try again."); // Simple error for user
    } finally { setLoadingState(false); scrollToBottom(); }
}


// --- DOM Manipulation & State ---
function appendMessage(text, sender, isThinking = false) {
    if (!messagesContainer) { console.error("Cannot append: messagesContainer not found."); return null; }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isThinking) {
        messageDiv.classList.add('thinking');
        messageDiv.setAttribute('role', 'status'); // Accessibility for screen readers
    }

    const messageText = String(text || ''); // Ensure it's a string

    if (sender === 'bot' && typeof marked !== 'undefined') {
        try {
            // 1. Parse Markdown to HTML using marked.js
            const rawHtml = marked.parse(messageText);

            // 2. Sanitize the HTML using DOMPurify (assuming it's loaded)
            let cleanHtml = rawHtml; // Default to raw if sanitizer not found
            if (typeof DOMPurify !== 'undefined') {
                 cleanHtml = DOMPurify.sanitize(rawHtml);
                 // console.log("DOMPurify sanitized HTML."); // Optional: for debugging
            } else {
                 console.warn("DOMPurify not found. Rendering raw HTML from Markdown. Ensure source is trusted.");
                 // Basic script tag removal as a minimal fallback (less effective than DOMPurify)
                 cleanHtml = rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }

            // 3. Set the sanitized HTML content
            messageDiv.innerHTML = cleanHtml; // **** USE innerHTML to render HTML ****

        } catch (e) {
            console.error("Markdown parsing/sanitizing error:", e);
            messageDiv.textContent = messageText; // Fallback to textContent on error
        }
    } else {
        // User messages or if marked/DOMPurify unavailable, use textContent
        messageDiv.textContent = messageText;
    }

    messagesContainer.appendChild(messageDiv);
    // Don't scroll automatically if user has scrolled up
    // if (messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50) {
        scrollToBottom();
    // }
    return messageDiv;
}

function scrollToBottom() {
    // Add a small delay to allow the DOM to update before scrolling
    setTimeout(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 50);
}

function setLoadingState(isLoading, message = "...") { // Use simple "..." for loading
    isWaitingForResponse = isLoading;
    if (chatInput) {
        chatInput.disabled = isLoading;
        chatInput.placeholder = isLoading ? message : (placeholders[currentLanguage] || placeholders['en']);
    }
    if (sendButton) {
        sendButton.disabled = isLoading;
    }
}

function showError(message) {
    if (!errorDisplay) return;
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
    console.log("[showError] Error displayed:", message);
}

function clearError() {
    if (!errorDisplay) return;
    if (!errorDisplay.classList.contains('hidden')) {
        errorDisplay.classList.add('hidden');
        errorDisplay.textContent = '';
    }
}

// --- Start the Widget ---
document.addEventListener('DOMContentLoaded', initChatWidget);
