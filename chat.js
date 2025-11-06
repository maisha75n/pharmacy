// Chat Management
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentConversationId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    setupChatInput();
    
    // Initialize with a default conversation if none exists
    if (conversations.length === 0) {
        createNewConversation('Support Team');
    }
});

function setupChatInput() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
}

function createNewConversation(name) {
    const conversation = {
        id: Date.now(),
        name: name,
        messages: [],
        lastMessage: null,
        unread: 0
    };
    conversations.push(conversation);
    saveConversations();
    loadConversations();
    selectConversation(conversation.id);
}

function selectConversation(id) {
    currentConversationId = id;
    const conversation = conversations.find(c => c.id === id);
    
    if (conversation) {
        document.getElementById('chatTitle').textContent = conversation.name;
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendButton').disabled = false;
        
        loadMessages(conversation.messages);
        
        // Mark as read
        conversation.unread = 0;
        saveConversations();
        loadConversations();
    }
}

function sendMessage() {
    if (!currentConversationId) return;
    
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) return;
    
    const message = {
        id: Date.now(),
        text: messageText,
        sender: 'You',
        timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(message);
    conversation.lastMessage = messageText;
    conversation.lastMessageTime = new Date().toISOString();
    
    saveConversations();
    loadMessages(conversation.messages);
    loadConversations();
    
    messageInput.value = '';
    
    // Simulate response (optional)
    setTimeout(() => {
        const response = {
            id: Date.now() + 1,
            text: 'Thank you for your message. We will get back to you soon.',
            sender: conversation.name,
            timestamp: new Date().toISOString()
        };
        conversation.messages.push(response);
        conversation.lastMessage = response.text;
        conversation.lastMessageTime = response.timestamp;
        saveConversations();
        loadMessages(conversation.messages);
        loadConversations();
    }, 1000);
}

function loadMessages(messages) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-message">No messages yet. Start the conversation!</div>';
        return;
    }
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'You' ? 'message-sent' : 'message-received'}`;
        messageDiv.innerHTML = `
            <div class="message-sender">${message.sender}</div>
            <div class="message-text">${message.text}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadConversations() {
    conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const conversationsList = document.getElementById('conversationsList');
    conversationsList.innerHTML = '';
    
    if (conversations.length === 0) {
        conversationsList.innerHTML = '<div class="empty-message">No conversations</div>';
        return;
    }
    
    // Sort by last message time
    conversations.sort((a, b) => {
        const timeA = a.lastMessageTime || 0;
        const timeB = b.lastMessageTime || 0;
        return timeB - timeA;
    });
    
    conversations.forEach(conversation => {
        const conversationDiv = document.createElement('div');
        conversationDiv.className = `conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        conversationDiv.onclick = () => selectConversation(conversation.id);
        
        const lastMessage = conversation.lastMessage || 'No messages yet';
        const lastTime = conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : '';
        
        conversationDiv.innerHTML = `
            <div class="conversation-name">${conversation.name}</div>
            <div class="conversation-preview">${lastMessage}</div>
            <div class="conversation-time">${lastTime}</div>
            ${conversation.unread > 0 ? `<span class="unread-badge">${conversation.unread}</span>` : ''}
        `;
        conversationsList.appendChild(conversationDiv);
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

