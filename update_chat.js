const fs = require('fs');

// Patch Chat.tsx
let chatPath = 'Client/src/pages/Chat.tsx';
let chatSrc = fs.readFileSync(chatPath, 'utf8');

chatSrc = chatSrc.replace(
  /<AgriSmartAssistant\n\s*initialSessionId=\{activeSessionId\}\n\s*initialPlantId=\{initialPlantId\}\n\s*onSessionChange=\{handleSessionChange\}\n\s*\/>/g,
  `<AgriSmartAssistant
          initialSessionId={activeSessionId}
          initialPlantId={initialPlantId}
          onSessionChange={handleSessionChange}
          initialAutoUpload={searchParams.get("upload") === "true"}
        />`
);
fs.writeFileSync(chatPath, chatSrc);


// Patch ChatInterface.tsx
let intfPath = 'Client/src/components/ChatInterface.tsx';
let intfSrc = fs.readFileSync(intfPath, 'utf8');

intfSrc = intfSrc.replace(
  /interface ChatInterfaceProps \{\n\s*initialSessionId\?: string \| null;\n\s*initialPlantId\?: string \| null;\n\s*onSessionChange\?: \(sessionId: string \| null\) => void;\n\}/g,
  `interface ChatInterfaceProps {
  initialSessionId?: string | null;
  initialPlantId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
  initialAutoUpload?: boolean;
}`
);

intfSrc = intfSrc.replace(
  /export default function AgriSmartAssistant\(\{\n\s*initialSessionId = null,\n\s*initialPlantId = null,\n\s*onSessionChange,\n\}: ChatInterfaceProps\) \{/g,
  `export default function AgriSmartAssistant({
  initialSessionId = null,
  initialPlantId = null,
  onSessionChange,
  initialAutoUpload = false,
}: ChatInterfaceProps) {`
);

let effectToAdd = `  // Auto-trigger image upload if passed
  useEffect(() => {
    if (initialAutoUpload) {
      const timer = setTimeout(() => {
        imageInputRef.current?.click();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialAutoUpload]);

  useEffect(() => {
    return () => {`;

intfSrc = intfSrc.replace(
  /  useEffect\(\(\) => \{\n\s*return \(\) => \{/g,
  effectToAdd
);

fs.writeFileSync(intfPath, intfSrc);
console.log('Chat patches applied');
