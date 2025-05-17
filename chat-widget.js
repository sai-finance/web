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
        showError("Chat feature unavailable (Client lib missing).");
        if(chatToggle) chatToggle.disabled = true;
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
        if(chatToggle) chatToggle.disabled = true; // Disable toggle if essential parts are missing
        showError("Chat widget setup error.");
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
    setLoadingState(true, "Connecting...");
    console.log("[connectClient] Connecting to:", gradioSpaceUrl);
    try {
        gradioClient = await Client.connect(gradioSpaceUrl);
        console.log("[connectClient] Connected.");
        clearError();
        setLoadingState(false);
        if (messagesContainer && messagesContainer.children.length === 0) {
            appendMessage(currentLanguage === 'en' ? "Hi! I'm Subha, your Sai Finance assistant. How can I help you today?" : "வணக்கம்! நான் சுபா, உங்கள் சாய் ஃபைனான்ஸ் உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?", 'bot');
        }
        chatToggle.setAttribute('aria-expanded', 'true');
    } catch (error) {
        console.error('[connectClient] CONNECTION FAILED:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown connection error.';
        showError(`Could not connect: ${errorMsg}. Please try again.`);
        setLoadingState(false, "Connection failed");
        gradioClient = null;
    } finally {
        isConnecting = false;
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
        chatInput.setAttribute('aria-label', `Type your message for Subha AI in ${currentLanguage === 'en' ? 'English' : 'Tamil'}`);
    }
    // Consider if a new chat should start on language switch or if context should be maintained/translated.
    // For simplicity, current behavior: new chat provides a fresh start in the new language.
    // if (messagesContainer.children.length > 0) { // Only if chat has started
    //     startNewChat();
    // }
}

// --- Event Listener Setup ---
function addEventListeners() {
    if (chatToggle) chatToggle.addEventListener('click', toggleChat);
    if (closeChat) closeChat.addEventListener('click', hideChat);
    if (newChatButton) newChatButton.addEventListener('click', startNewChat);
    if (sendButton) sendButton.addEventListener('click', handleSendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } });
        chatInput.addEventListener('focus', () => { if (!gradioClient && !isConnecting) { connectClient(); } }, { once: true });
    }
    if (langButtonEn) langButtonEn.addEventListener('click', () => setLanguage('en'));
    if (langButtonTa) langButtonTa.addEventListener('click', () => setLanguage('ta'));
}

// --- Chat Visibility ---
function toggleChat() {
    if (!chatContainer || !chatToggle) return;
    const isHidden = chatContainer.classList.contains('hidden');
    chatContainer.classList.toggle('hidden');
    chatToggle.setAttribute('aria-expanded', String(!isHidden));

    if (!isHidden) { // If chat is now open
        if (!gradioClient && !isConnecting) {
            connectClient();
        }
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 50);
        }
    }
}
function hideChat() {
    if (chatContainer) chatContainer.classList.add('hidden');
    if (chatToggle) chatToggle.setAttribute('aria-expanded', 'false');
}

// --- New Chat Function ---
function startNewChat() {
    console.log("[startNewChat] Starting new session...");
    if (messagesContainer) messagesContainer.innerHTML = '';
    clearError();
    appendMessage(currentLanguage === 'en' ? "New chat. How can I assist?" : "புதிய உரையாடல். நான் எப்படி உதவ முடியும்?", 'bot');
    if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }
    setLoadingState(false);
    // Optional: If sessions are strictly managed server-side and need a full reset.
    // if (gradioClient) {
    //     // gradioClient.resetSession(); // or similar if API supports
    // }
}

// --- Message Handling ---
async function handleSendMessage() {
    console.log("[handleSendMessage] Attempting send. State:", { isConnecting, isWaitingForResponse, hasClient: !!gradioClient, lang: currentLanguage });
    if (isConnecting) { console.warn("Send aborted: Still connecting."); return; }
    if (isWaitingForResponse) { console.warn("Send aborted: Waiting for previous response."); return; }
    if (!gradioClient) {
        showError("Not connected. Trying to connect...");
        await connectClient(); // Attempt to connect
        if (!gradioClient) { // If still not connected after attempt
             showError("Connection failed. Please try again.");
             return;
        }
    }
    if (!chatInput || !messagesContainer) { console.error("Send failed: Missing Input/Message elements."); return; }

    const userMessageOriginal = chatInput.value.trim();
    if (!userMessageOriginal) return;

    appendMessage(userMessageOriginal, 'user');
    chatInput.value = '';
    scrollToBottom();
    setLoadingState(true, "Thinking...");
    const thinkingIndicator = appendMessage("Thinking...", 'bot', true);
    clearError();

    let messageToSend;
    if (currentLanguage === 'ta') { messageToSend = `Please respond ONLY in Tamil (தமிழ்): ${userMessageOriginal}`; }
    else { messageToSend = `Please respond ONLY in English: ${userMessageOriginal}`; }

    const payload = { message: { "text": messageToSend, "files": [] } }; // Ensure payload matches Gradio expectation
    console.log("[handleSendMessage] Calling predict with payload:", JSON.stringify(payload));

    try {
        const result = await gradioClient.predict(API_ENDPOINT, payload);
        console.log("[handleSendMessage] Received Result:", JSON.stringify(result));

        let botMessageText = null;
        if (result?.data?.[0]) {
            const firstItem = result.data[0];
             if (Array.isArray(firstItem) && firstItem.length > 0 && typeof firstItem[0] === 'string') {
                botMessageText = String(firstItem[0]).trim();
             } else if (typeof firstItem === 'string') {
                botMessageText = String(firstItem).trim();
            } else {
                 console.warn("[handleSendMessage] result.data[0] is not a string or expected structure:", firstItem);
                 botMessageText = String(firstItem); // Fallback
            }
        } else { console.warn("[handleSendMessage] Invalid result structure:", result); }

        if (thinkingIndicator) thinkingIndicator.remove();

        if (botMessageText) { appendMessage(botMessageText, 'bot'); }
        else {
            console.error("[handleSendMessage] Failed to parse valid message.");
            appendMessage('Sorry, I received an unclear response.', 'bot');
            showError("Received unclear response.");
        }

    } catch (error) {
        console.error('[handleSendMessage] ERROR during predict call:', error);
        if (thinkingIndicator) thinkingIndicator.remove();
        let errorMsg = 'Sorry, an error occurred while processing your request.';
        if (error instanceof Error) { errorMsg = `Error: ${error.message}`; }
        else if (typeof error === 'object' && error !== null && error.message) { errorMsg = `Error: ${error.message}`; }
        appendMessage(errorMsg, 'bot');
        showError("Couldn't get response. Please try again.");
    } finally { setLoadingState(false); scrollToBottom(); }
}


// --- DOM Manipulation & State ---
function appendMessage(text, sender, isThinking = false) {
    if (!messagesContainer) { console.error("Cannot append: messagesContainer not found."); return null; }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isThinking) {
        messageDiv.classList.add('thinking');
        messageDiv.setAttribute('role', 'status');
    }

    const messageText = String(text || '');

    if (sender === 'bot' && typeof marked !== 'undefined') {
        try {
            const rawHtml = marked.parse(messageText);
            let cleanHtml = rawHtml;
            if (typeof DOMPurify !== 'undefined') {
                 cleanHtml = DOMPurify.sanitize(rawHtml);
            } else {
                 console.warn("DOMPurify not found. Rendering raw HTML from Markdown. Ensure source is trusted.");
                 cleanHtml = rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
            messageDiv.innerHTML = cleanHtml;
        } catch (e) {
            console.error("Markdown parsing/sanitizing error:", e);
            messageDiv.textContent = messageText;
        }
    } else {
        messageDiv.textContent = messageText;
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

function scrollToBottom() {
    setTimeout(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 50);
}

function setLoadingState(isLoading, message = "...") {
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