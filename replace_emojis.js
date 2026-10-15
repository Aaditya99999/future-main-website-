const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

const emojiMap = {
  '🎯': '<i data-lucide="target"></i>',
  '💻': '<i data-lucide="monitor"></i>',
  '⚡': '<i data-lucide="zap"></i>',
  '🤖': '<i data-lucide="bot"></i>',
  '🎓': '<i data-lucide="graduation-cap"></i>',
  '📈': '<i data-lucide="trending-up"></i>',
  '🛡️': '<i data-lucide="shield-check"></i>',
  '⚙️': '<i data-lucide="settings"></i>',
  '🧠': '<i data-lucide="brain"></i>',
  '📊': '<i data-lucide="bar-chart"></i>',
  '🔗': '<i data-lucide="link"></i>',
  '👨‍💼': '<i data-lucide="briefcase"></i>',
  '🤝': '<i data-lucide="handshake"></i>',
  '🔍': '<i data-lucide="search"></i>',
  '📱': '<i data-lucide="smartphone"></i>',
  '📝': '<i data-lucide="pen-tool"></i>',
  '📸': '<i data-lucide="camera"></i>',
  '🛒': '<i data-lucide="shopping-cart"></i>',
  '📍': '<i data-lucide="map-pin"></i>',
  '🚀': '<i data-lucide="rocket"></i>',
  '💡': '<i data-lucide="lightbulb"></i>',
  '✅': '<i data-lucide="check-circle"></i>',
  '💬': '<i data-lucide="message-square"></i>',
  '🏆': '<i data-lucide="award"></i>',
  '🛍️': '<i data-lucide="shopping-bag"></i>'
};

// Add lucide script to head if not present
if (!content.includes('lucide@latest')) {
  content = content.replace('</head>', '  <script src="https://unpkg.com/lucide@latest"></script>\n</head>');
}

// Replace emojis
for (const [emoji, iconHtml] of Object.entries(emojiMap)) {
  const regex = new RegExp(emoji, 'g');
  content = content.replace(regex, iconHtml);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Emojis replaced successfully.');
