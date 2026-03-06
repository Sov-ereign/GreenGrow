const fs = require('fs');
const path = 'Client/src/components/RecommendationsPanel.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  /conditionTrend\?: string \| null;\n\s*\} \| null;/g,
  `conditionTrend?: string | null;
    careActions?: string[];
  } | null;`
);

c = c.replace(
  /const handleOpenChat = \(plantId: string, sessionKey\?: string \| null\) => \{[\s\S]*? \.catch\(\(\) => navigate\(\`\/chat\?plantId=\$\{plantId\}\`\)\);\n  \};/g,
  `const handleOpenChat = (plantId: string, sessionKey?: string | null, uploadUrlParam = false) => {
    const uploadQuery = uploadUrlParam ? "&upload=true" : "";
    if (sessionKey) {
      navigate(\`/chat/\${sessionKey}?plantId=\${plantId}\${uploadQuery}\`);
      return;
    }
    fetch(apiUrl(\`/api/chat/sessions/by-plant/\${plantId}\`), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => navigate(\`/chat/\${data.sessionKey}?plantId=\${plantId}\${uploadQuery}\`))
      .catch(() => navigate(\`/chat?plantId=\${plantId}\${uploadQuery}\`));
  };`
);

// We want to rewrite the middle part of the card (between `<HealthMeter score={score} />` and `mt-3 flex flex-wrap gap-2`).
// Let's replace the whole interior of the card to exactly match what the user wants.

const newCardInterior = `              {score > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <HealthMeter score={score} />
                </div>
              )}

              {plant.latestAssessment?.careActions && plant.latestAssessment.careActions.length > 0 && (
                <div className="bg-white/70 rounded-xl border border-slate-100 p-3 space-y-2 mt-2">
                  <p className="text-xs font-semibold text-slate-700">Recommended actions</p>
                  <ul className="space-y-1.5">
                    {plant.latestAssessment.careActions.slice(0, 3).map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-800">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton
                  label="Open chat"
                  icon={MessageCircle}
                  onClick={() =>
                    handleOpenChat(
                      plant.id,
                      plant.latestSessionKey || plant.linkedChatId
                    )
                  }
                />
                <ActionButton
                  label="Upload image"
                  icon={ImageIcon}
                  onClick={() =>
                    handleOpenChat(
                      plant.id,
                      plant.latestSessionKey || plant.linkedChatId,
                      true
                    )
                  }
                />`;

c = c.replace(
  /              <div className="flex items-center gap-3 mb-3">[\s\S]*?<ActionButton\n\s*label="Upload image"[\s\S]*?\}\n\s*\/>/g,
  newCardInterior
);

// Remove default "Awaiting data" in time. If missing, hide it.
// Modify card header slightly.
c = c.replace(
  /                      <p className="text-xs text-slate-500">\n\s*\{plant\.cropType \|\| "Crop"\} • \{time \|\| "Awaiting data"\}\n\s*<\/p>/g,
  `                      <p className="text-xs text-slate-500">
                        {plant.cropType}{time ? \` • \${time}\` : ""}
                      </p>`
);

c = c.replace(
  /const score = healthScore\(plant\);/g,
  `const score = plant.latestAssessment ? healthScore(plant) : 0;`
);

// We need to hide Next check date if it doesn't exist
// The badge `NextCheckBadge date={nextCheck}` is always rendered. `formatShortDate` returns "Not set".
// Let's modify formatShortDate to return null if missing and hide the badge.
c = c.replace(
  /const formatShortDate = \(iso\?: string\) => \{\n\s*if \(\!iso\) return "Not set";\n\s*const d = new Date\(iso\);\n\s*if \(Number\.isNaN\(d\.getTime\(\)\)\) return "Not set";\n\s*return d\.toLocaleDateString\(undefined, \{ month: "short", day: "numeric" \}\);\n\s*\};/g,
  `const formatShortDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };`
);

c = c.replace(
  /<NextCheckBadge date=\{nextCheck\} \/>/g,
  `{nextCheck && <NextCheckBadge date={nextCheck} />}`
);

fs.writeFileSync(path, c);
console.log('done');
