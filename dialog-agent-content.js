/* Editable case-study content. Geometry and copy come from Figma 234:59054. */
(() => {
  const assets = {
    exploration: "./assets/dialog-agent-project/hd/exploration-chat.png",
    understanding: "./assets/dialog-agent-project/hd/reflection-chat.png",
    confirmationOriginal: "./assets/dialog-agent-project/hd/confirmation-original.png",
    confirmationRevision: "./assets/dialog-agent-project/hd/confirmation-revision.png",
    editChanges: "./assets/dialog-agent-project/hd/editor-changes.png",
    editQuote: "./assets/dialog-agent-project/hd/editor-quote.png",
    loadingGeneration: "./assets/dialog-agent-project/hd/loading-generation.png",
    loadingRevision: "./assets/dialog-agent-project/hd/loading-revision.png",
    loadingReferences: "./assets/dialog-agent-project/hd/loading-references.png",
    historyEditor: "./assets/dialog-agent-project/hd/history-editor.png",
    historyDetail: "./assets/dialog-agent-project/hd/history-detail.png",
    historyPopover: "./assets/dialog-agent-project/hd/history-popover.png",
    avatar: "./assets/dialog-agent-project/ui/f7357.png",
    noviceArc: "./assets/dialog-agent-project/ui/2bbb7.png",
    expertArc: "./assets/dialog-agent-project/ui/4a4c0.png",
    leftBeam: "./assets/dialog-agent-project/ui/16842.svg",
    rightBeam: "./assets/dialog-agent-project/ui/85645.svg",
    agentCircle: "./assets/dialog-agent-project/ui/b50ca.svg",
    noviceCircle: "./assets/dialog-agent-project/ui/14e41.svg",
    expertCircle: "./assets/dialog-agent-project/ui/bae1d.svg",
    shiftArrow: "./assets/dialog-agent-project/ui/caa76.svg",
    metricArrow: "./assets/dialog-agent-project/ui/94876.svg",
    outline: "./assets/dialog-agent-project/ui/367fb.png",
    reflection: "./assets/dialog-agent-project/ui/23b7e.png",
    agent: "./assets/dialog-agent-project/ui/7b071.png",
    collapse: "./assets/dialog-agent-project/ui/dc5ef.svg",
    clock: "./assets/dialog-agent-project/ui/0dcc9.svg",
    plus: "./assets/dialog-agent-project/ui/16a0e.svg",
    model: "./assets/dialog-agent-project/ui/e7770.svg",
    credit: "./assets/dialog-agent-project/ui/0753b.svg",
    send: "./assets/dialog-agent-project/ui/eaa99.svg",
    selected: "./assets/dialog-agent-project/ui/bbd3b.svg",
    lightCheck: "./assets/dialog-agent-project/ui/619e5.svg",
    strongCheck: "./assets/dialog-agent-project/ui/fc524.svg",
    check: "./assets/dialog-agent-project/ui/2768b.svg",
    cross: "./assets/dialog-agent-project/ui/38fee.svg",
    pdf: "./assets/dialog-agent-project/ui/65647.png",
    loadingGlow: "./assets/dialog-agent-project/ui/56003.png",
    reference1: "./assets/dialog-agent-project/ui/e3de0.png",
    reference2: "./assets/dialog-agent-project/ui/62de9.png",
    reference3: "./assets/dialog-agent-project/ui/e4049.png",
    reference4: "./assets/dialog-agent-project/ui/98be5.png",
    quote: "./assets/dialog-agent-project/ui/ce912.svg",
  };
  const esc = (text) => String(text).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const t = (zh, en, tag = "span", className = "") => `<${tag}${className ? ` class="${className}"` : ""} data-zh="${esc(zh)}" data-en="${esc(en)}">${esc(zh)}</${tag}>`;
  const image = (name, className = "", alt = "") => `<img src="${assets[name]}" alt="${esc(alt)}"${className ? ` class="${className}"` : ""} loading="lazy" />`;
  const mount = (name, html) => { const node = document.querySelector(`[data-native="${name}"]`); if (node) node.innerHTML = html; };
  const caption = (zh, en) => t(zh, en, "figcaption");
  const note = (title, titleEn, body, bodyEn, className = "") => `<aside class="design-note ${className}">${t(title,titleEn,"h4")}${t(body,bodyEn,"p")}</aside>`;
  const shot = (name, alt) => image(name, "case-study-shot", alt);
  const interviews = [
    {
      title: ["短剧爱好创作者", "Short-drama enthusiast"],
      conclusion: ["需要引导式共创，避免直接生成削弱创作参与感", "Guided co-creation keeps creators involved"],
      messages: [
        ["你平时有了故事灵感之后，会怎么把它写成完整的短剧？", "When you have a story idea, how do you turn it into a complete short drama?"],
        ["我一般先把梗或者人物关系记下来，但真正开始写就容易卡住，不知道情节怎么往后接。有时候会找豆包聊，让它帮我", "I note down the premise and character relationships, but get stuck when I start writing. I sometimes talk to Doubao for help."],
        ["AI 生成的内容，你会直接拿来使用吗", "Do you use AI-generated content as it is?"],
        ["基本不会。它看起来像一个完整故事，但经常不是我真正想表达的，人物性格也容易跑偏。我会继续告诉它要怎么怎么调整", "Usually not. It looks complete, but often misses what I want to express and changes the characters. I have to keep explaining revisions."],
        ["那你希望 AI 用什么方式帮助你？", "How would you like AI to help?"],
        ["最好先问清楚题材、人物关系和结局，再给我几个剧情方向。我选一个之后，我们再一起往下写", "Ask about the genre, relationships and ending first, then offer a few directions. Once I choose, we can develop the story together."],
      ],
    },
    {
      title: ["专业影视创作者", "Professional screen creator"],
      conclusion: ["需要可控辅助，支持局部修改与版本追溯", "Controllable assistance, scoped edits and version history"],
      messages: [
        ["在专业创作过程中，你通常会在哪些环节使用 AI？", "Where do you use AI in your professional creative process?"],
        ["主要是在前期生产中。我不会让 AI 直接完成整个剧本，因为最终还是需要按照明确的创作目标来调整", "Mostly in pre-production. I do not ask AI to finish the whole script, because it still needs to follow clear creative goals."],
        ["目前使用 AI 时，最影响效率的问题是什么？", "What most affects your efficiency when using AI?"],
        ["最大的问题是不可控。我只想改一段台词，它可能把整场戏都重写；调整几轮之后，而且很难看出每一版具体改了什么。", "Lack of control. I ask for a line change and it rewrites the entire scene. After a few rounds, it is hard to tell what changed in each version."],
        ["你理想中的 AI 创作工具应该是什么样的？", "What would your ideal AI creation tool look like?"],
        ["已经确认的设定可以锁定，只修改我选中的部分，并且保留每次修改记录。这样 AI 才是真正辅助创作，而不是替我重新创作", "Lock approved settings, change only what I select and keep every revision. Then AI supports my work instead of rewriting it for me."],
      ],
    },
  ];
  mount("interviews", interviews.map((interview) => `<section class="research-column">${t(...interview.title, "h4")}<div class="interview-chat">${interview.messages.map(([zh, en], index) => `<div class="interview-message ${index % 2 ? "creator" : "team"}">${image("avatar", "interview-avatar")}<div class="interview-message-content">${index % 2 ? t("创作者A", "Creator A", "span", "interview-speaker") : t("Pippit产品团队", "Pippit product team", "span", "interview-speaker")}${t(zh, en, "p", "interview-bubble")}</div></div>`).join("")}</div>${t(...interview.conclusion, "p", "research-conclusion")}</section>`).join(""));

  const roleHeaders = [["角色", "Creator"], ["创作状态", "Starting point"], ["用户感知", "Creator need"], ["AI 职责", "AI responsibility"]];
  const roleRows = [
    [["新手创作者", "Beginner"], ["灵感探索", "Exploring ideas"], ["有方向，不知道怎么写成故事", "Has a direction, but needs help shaping a story"], ["引导用户补齐要素", "Guide the creator to fill in missing elements"]],
    [["剧本改编承接方", "Script adapter"], ["已有参考", "Has a reference"], ["知道要什么，微调节奏爽点", "Wants to refine pace and payoff"], ["分集改编细节微调", "Adapt episodes and refine details"]],
    [["资深创作者", "Experienced creator"], ["已有完整剧本", "Has a full script"], ["快速解析剧本", "Needs fast script analysis"], ["精准、局部修改", "Precise, scoped edits"]],
  ];
  mount("roles", `<table><thead><tr>${roleHeaders.map(([zh, en]) => `<th scope="col">${t(zh, en)}</th>`).join("")}</tr></thead><tbody>${roleRows.map((row) => `<tr>${row.map(([zh, en], index) => `<${index ? "td" : 'th scope="row"'} data-label="${esc(roleHeaders[index][0])}">${t(zh, en)}</${index ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table>`);

  mount("thinking", `<div class="thinking-decor" aria-hidden="true">${image("leftBeam", "thinking-beam beam-left")}${image("rightBeam", "thinking-beam beam-right")}${image("noviceArc", "thinking-arc arc-left")}${image("expertArc", "thinking-arc arc-right")}</div>
    ${t("降低门槛 · 提升效率 · 创作掌控", "Lower barriers · Improve efficiency · Creative control", "p", "thinking-purpose")}
    <div class="thinking-node novice-node">${image("noviceCircle", "node-background")}<div>${t("新手创作者", "Beginner creator", "h4")}${t("有创意灵感但缺乏经验需要 AI 引导完成创作", "Has an idea, but needs AI guidance to develop it", "p")}</div></div>
    <div class="thinking-node agent-node">${image("agentCircle", "node-background")}<div>${t("短剧对话", "Drama dialogue", "h4")}<p>Agent</p></div></div>
    <div class="thinking-node expert-node">${image("expertCircle", "node-background")}<div>${t("专业创作者", "Professional creator", "h4")}${t("成熟创作方法且需要AI 精准执行意图并修改", "Needs precise execution and edits within an established process", "p")}</div></div>
    <ul class="thinking-pills novice-pills">${[["灵感启发", "Inspiration"], ["剧情引导", "Story guidance"], ["降低门槛", "Lower barriers"]].map(([zh, en]) => t(zh, en, "li")).join("")}</ul>
    <ul class="thinking-pills expert-pills">${[["版本追溯", "Version history"], ["精准控制", "Precise control"], ["局部修改", "Scoped edits"]].map(([zh, en]) => t(zh, en, "li")).join("")}</ul>`);


  mount("exploration", `<figure class="product-screen outline-screen"><div class="screen-bezel">${image("outline","product-capture","剧本大纲产品界面")}</div>${caption("剧本大纲","Script outline")}</figure><figure class="chat-figure exploration-panel">${shot("exploration","灵感探索对话界面")}${caption("IM对话框","Conversation panel")}</figure><div class="exploration-notes">${note("用户意图模糊","Unclear intent","没有关键核心剧情、爽点与节奏","The core plot, payoff and pace are not yet defined")}${note("与用户共创","Co-create with the user","由爆款作品数据帮助用户发散\n允许用户自己输入想法","Use successful works to explore directions.\nLet creators contribute their own ideas.")}${note("用户确认或跳过","Confirm or skip","让用户掌握生成节奏与过程","Keep creators in control of pace and process")}</div>`);
  mount("understanding", `<figure class="product-screen reflection-screen"><div class="screen-bezel">${image("reflection","product-capture","故事设定信息回显产品界面")}</div>${caption("信息回显","Structured reflection")}</figure><figure class="chat-figure reflection-panel">${shot("understanding","信息回显与意图理解对话界面")}${caption("IM对话框","Conversation panel")}</figure>${note("结构化表达","Structured expression","每个候选项要展示结果预期，例爽点、节奏、受众","Show the expected payoff, pace and audience for every candidate.")}`);
  mount("confirmation", `<figure class="chat-figure"><div class="confirmation-label">${image("lightCheck")}${t("生成建议｜轻量确认","Suggestion · lightweight confirmation")}</div>${shot("confirmationOriginal","已有剧本：轻量确认界面")}${caption("已有剧本","Existing script")}</figure><figure class="chat-figure"><div class="confirmation-label">${image("strongCheck")}${t("关键修改｜显式确认","Key changes · explicit confirmation")}</div>${shot("confirmationRevision","关键修改：显式确认界面")}${caption("修改剧本","Revised script")}</figure><div class="confirmation-path">${t("渐进式确认路径","Progressive confirmation","h4")}<ol>${[["确认理解是否准确","Confirm understanding"],["确认关键修改方向","Confirm key changes"],["确认最终剧本结果","Confirm the final script"]].map(([zh,en])=>`<li>${t(zh,en)}</li>`).join("")}</ol></div>`);
  mount("editing", `<div class="editing-row">${note("高亮修改点","Highlight changes","让用户直观感受到修改的具体部分","Make the exact changes immediately visible","note-left")}<figure class="editor-figure">${shot("editChanges","剧本编辑：高亮修改位置高清界面")}${caption("AI识别修改","AI-identified changes")}</figure>${note("向用户进行确认","Ask for confirmation","修改某些剧情，需要提醒用户进行确认","Ask the user to confirm plot changes")}</div><div class="editing-row">${note("高亮引用","Highlight the quotation","让用户直观感受到修改的具体部分","Show exactly which passage is being edited","note-left")}<figure class="editor-figure">${shot("editQuote","剧本编辑：局部引用高清界面")}${caption("用户手动引用","User-selected quotation")}</figure>${note("对话引用","Quote in the conversation","定向修改某些剧情","Make targeted changes to a selected passage")}</div>`);
  mount("loading", [["loadingGeneration","生成中","Generating"],["loadingRevision","修改剧本","Revising script"],["loadingReferences","风格参考","Style references"]].map(([name,zh,en])=>`<figure class="chat-figure">${shot(name,zh+"高清界面")}${caption(zh,en)}</figure>`).join(""));
  mount("history", `<figure class="history-editor">${shot("historyEditor","剧本版本历史高清界面")}${caption("历史记录","Version history")}</figure><figure class="version-detail"><div class="history-static-detail">${shot("historyDetail","历史记录列表高清界面")}${image("historyPopover","history-static-popover","版本对比与恢复操作展示")}</div>${caption("历史记录","Version history")}</figure><div class="history-notes">${note("修改对比","Compare changes","查看具体修改哪些部分，给用户具体清晰的呈现","Show precisely which parts changed in each revision.")}${note("回到此版本","Restore this version","用户可以回溯到具体某一个修改的版本","Return to any specific version of the script.")}</div>`);
  const directionArrow=document.querySelector(".direction-arrow");
  if(directionArrow) directionArrow.innerHTML=image("shiftArrow");
  document.querySelectorAll(".metric-arrow").forEach(arrow=>{arrow.innerHTML=image("metricArrow");});
})();
