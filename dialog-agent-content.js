/* Editable case-study content. Geometry and copy come from Figma 234:59054. */
(() => {
  const assets = {
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
  const user = (zh, en) => `<p class="agent-user">${t(zh, en)}</p>`;
  const copy = (zh, en, className = "") => t(zh, en, "p", `agent-copy ${className}`.trim());
  const caption = (zh, en) => t(zh, en, "figcaption");
  const note = (title, titleEn, body, bodyEn, className = "") => `<aside class="design-note ${className}">${t(title, titleEn, "h4")}${t(body, bodyEn, "p")}</aside>`;
  const storyFacts = [
    ["题材：末世 / 异能觉醒 / 都市逆袭", "Genre: apocalypse / awakened powers / urban comeback"],
    ["主角：林峰，底层网管，扮猪吃虎，吞胶囊觉醒", "Lead: Lin Feng, an overlooked internet-café worker whose powers awaken after taking a capsule"],
    ["弱点：重病妹妹", "Vulnerability: his seriously ill younger sister"],
    ["反派：基地小队长（前期）→ 制药集团二代（中期）", "Antagonists: a base squad leader, then a pharmaceutical heir"],
    ["基调：先压抑后爆发；节奏偏升级流", "Tone: oppression followed by release; a progression-driven pace"],
    ["体量：10 集 × 90 秒", "Length: 10 episodes × 90 seconds"],
  ];
  const facts = (heading = "我已拆解完剧本：", headingEn = "I have analyzed the script:") => `${copy(heading, headingEn)}<ul class="agent-facts">${storyFacts.map(([zh, en]) => `<li>${t(zh, en)}</li>`).join("")}</ul>`;
  const input = (isLoading = false, quote = false) => `<footer class="agent-composer ${isLoading ? "is-generating" : ""}">
    ${quote ? `<div class="quoted-text">${image("quote")}${t("刹那间，瞳孔急剧收缩，脑海中仿佛电流穿过…", "His pupils contract; a current seems to surge through his mind…")}</div>` : ""}
    <div class="agent-input" role="textbox" aria-readonly="true" tabindex="0" data-zh-label="剧本内容输入区示意" data-en-label="Script input example">${t("描述你想要生成的剧本内容", "Describe the script you want to create")}</div>
    <div class="agent-input-tools"><span>${image("plus")}${image("model")}<b>Seedance 2.0</b></span><span class="input-credits">${image("credit")}<b>12</b><i class="send-icon ${isLoading ? "stop-icon" : ""}">${isLoading ? "" : image("send")}</i></span></div>
  </footer>`;
  const panel = (content, { className = "", loading = false, quote = false, history = false } = {}) => `<section class="agent-panel ${className}">
    <header class="agent-bar">${image("collapse", "collapse-icon")}${image("agent", "agent-avatar")}${t("短剧助手", "Drama Assistant", "strong")}<button class="history-toggle" type="button" aria-expanded="false" data-action="history" data-zh-label="查看历史修改" data-en-label="View version history">${image("clock")}</button></header>
    <div class="agent-thread">${content}</div>${input(loading, quote)}
    <div class="agent-history-overlay" hidden>${historyList()}</div>
  </section>`;
  function historyList() {
    return `<section class="version-list"><header>${t("历史修改", "Version history", "strong")}<button type="button" data-action="close-history" data-zh-label="关闭历史记录" data-en-label="Close version history">×</button></header>${["今天", "昨天"].map((day, dayIndex) => `<div class="version-day">${t(day, dayIndex ? "Yesterday" : "Today", "p")}${["末世+异能+底层逆袭是很有爽感的组合", "优化对白", "优化对白"].map((text, index) => `<article class="version-item" data-version="${dayIndex * 3 + index}"><time>5月29日 16:23</time><p>• ${t(text, index ? "Refine dialogue" : "Apocalypse, awakened powers and an underdog comeback")}</p><div class="version-actions"><button type="button" data-action="restore">${t("回到此版本", "Restore version")}</button><button type="button" data-action="compare">${t("查看修改", "View changes")}</button></div></article>`).join("")}</div>`).join("")}</section>`;
  }

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

  const options = [
    ["A 荒野直播逆袭", "A · Wilderness livestream comeback", "男频剧情流|硬核求生+直播打脸+逆袭成名，爽点最直接", "Hardcore survival, livestream drama and an underdog comeback"],
    ["B 荒野综艺人性修罗场", "B · Survival reality show", "在偶遇异兽被咬后身体发生奇怪变异", "An encounter with a mutant beast triggers a strange transformation"],
    ["C 荒野禁区悬疑逃生", "C · Escape from the forbidden zone", "一次基因突变导致身体强化获得增强", "A genetic mutation enhances the protagonist's abilities"],
    ["D 荒野获得系统", "D · A new survival system", "完成系统任务带来荒野末世能力", "Completing system tasks unlocks new survival powers"],
  ];
  const explorationContent = `${user("想做一个末世异能题材，主角是底层网管", "An apocalypse story about an internet-café worker with superpowers")}${copy("你希望触发核心剧情的关键是什么？", "What should trigger the central storyline?")}<div class="agent-options" role="group" aria-label="Story direction options">${options.map(([zh, en, detail, detailEn], index) => `<button type="button" class="agent-option ${index === 1 ? "selected" : ""}" data-action="option" aria-pressed="${index === 1}">${t(zh, en, "strong")}${t(detail, detailEn, "span")}${image("selected", "option-check")}</button>`).join("")}</div><label class="other-idea">${image("quote")}<input type="text" data-zh-placeholder="我有其他想法" data-en-placeholder="I have another idea" placeholder="我有其他想法" /></label><div class="agent-actions"><button class="primary" type="button" data-action="confirm-direction">${t("确认", "Confirm")}</button><button type="button" data-action="skip-direction">${t("跳过", "Skip")}</button></div><p class="demo-feedback" aria-live="polite"></p>`;
  mount("exploration", `<figure class="product-screen outline-screen"><div class="screen-bezel">${image("outline", "product-capture", "剧本大纲产品界面")}</div>${caption("剧本大纲", "Script outline")}</figure><figure class="chat-figure exploration-panel">${panel(explorationContent)}${caption("IM对话框", "Conversation panel")}</figure><div class="exploration-notes">${note("用户意图模糊", "Unclear intent", "没有关键核心剧情、爽点与节奏", "The core plot, payoff and pace are not yet defined")}${note("与用户共创", "Co-create with the user", "由爆款作品数据帮助用户发散\n允许用户自己输入想法", "Use successful works to help explore directions.\nLet creators contribute their own ideas.")}${note("用户确认或跳过", "Confirm or skip", "让用户掌握生成节奏与过程", "Keep creators in control of pace and process")}</div>`);

  const understandingContent = `${user("荒野综艺人性修罗场", "Survival reality show")}${copy("方向B: 荒野生存+悬疑禁区：参赛队伍误入异常禁区，不只有野兽和天灾，还有失踪者、旧营地、人为陷阱，求生升级为解谜逃生，男频/大众向，悬念更强。", "Direction B: a survival team enters a forbidden zone. Beasts, disasters, missing people and abandoned camps turn survival into a suspenseful escape.")}${user("OK，就这个吧", "OK, let's go with this")}${facts("我已收集完基础信息：", "I have collected the basic information:")}${copy("现在开始梳理故事设定", "Now organizing the story settings")}${copy("思考中...", "Thinking…", "loading-status")}`;
  mount("understanding", `<figure class="product-screen reflection-screen"><div class="screen-bezel">${image("reflection", "product-capture", "故事设定信息回显产品界面")}</div>${caption("信息回显", "Structured reflection")}</figure><figure class="chat-figure reflection-panel">${panel(understandingContent, { className: "has-glow" })}${caption("IM对话框", "Conversation panel")}</figure>${note("结构化表达", "Structured expression", "每个候选项要展示结果预期，例爽点、节奏、受众", "Show the expected payoff, pace and audience for every candidate.")}`);

  const documentPrompt = `<div class="document-attachment">${image("pdf", "pdf-preview")}<span>PDF</span></div>${user("帮我解析一下这个剧本", "Help me analyze this script")}`;
  const analyzed = `${facts()}${copy("剧本已经拆解完成，你可以在右边编辑或修改，确认后可以生产完成剧本", "The analysis is complete. Edit the document on the right, then confirm to generate the full script.")}`;
  const revised = `${user("我想修改一下剧情节奏", "I want to change the pacing")}${copy("那我将整体基调改成：", "I will adjust the overall tone:")}${copy("• 基调：先压抑后爆发；节奏偏反转，在剧情早期被欺压，妹妹也被欺负 → 剧情中期获得异能觉醒 → 进行逆袭，创建制药企业", "• Tone: oppression followed by release, with more reversals. Early hardship leads to awakened powers, a comeback and a new pharmaceutical enterprise.")}${copy("你觉得当前这种反转节奏合适吗", "Does this revised pacing work for you?")}${decisionButtons()}`;
  function decisionButtons(next = false) {
    return `<div class="agent-actions decision-actions"><button class="primary" type="button" data-action="accept">${t("使用", "Use")}${image("check")}</button><button type="button" data-action="discard">${t("丢弃", "Discard")}${image("cross")}</button>${next ? `<button type="button" data-action="next-change">${t("下一处", "Next change")} →</button>` : ""}</div><p class="demo-feedback" aria-live="polite"></p>`;
  }
  mount("confirmation", `<figure class="chat-figure confirmation-first"><div class="confirmation-label">${image("lightCheck")}${t("生成建议｜轻量确认", "Suggestion · lightweight confirmation")}</div>${panel(documentPrompt + analyzed)}${caption("已有剧本", "Existing script")}</figure><figure class="chat-figure confirmation-second"><div class="confirmation-label">${image("strongCheck")}${t("关键修改｜显式确认", "Key changes · explicit confirmation")}</div>${panel(analyzed + revised)}${caption("修改剧本", "Revised script")}</figure><div class="confirmation-path">${t("渐进式确认路径", "Progressive confirmation", "h4")}<ol>${[["确认理解是否准确", "Confirm understanding"], ["确认关键修改方向", "Confirm key changes"], ["确认最终剧本结果", "Confirm the final script"]].map(([zh, en]) => `<li>${t(zh, en)}</li>`).join("")}</ol></div>`);

  const scenes = [
    ["1-1 日 内 网吧大厅 【道具：智核胶囊（混在垃圾中）】", "1-1 · Day · Interior · Internet café · Prop: a discarded neural capsule"],
    ["△ 昏暗的网吧，键盘敲击声嘈杂。林峰穿着洗得发白的工装，正低头清理键盘里的烟灰。", "△ In a dim café filled with the clatter of keyboards, Lin Feng cleans cigarette ash from a keyboard in his faded uniform."],
    ["△ 一只穿着皮鞋的脚猛地踹翻垃圾桶，垃圾散落一地。王胖子：看什么看？还不快扫了！", "△ A leather shoe kicks over a bin. Rubbish spills across the floor. Wang: What are you looking at? Clean it up!"],
    ["△ 林峰低头，默默蹲下收拾。王胖子周围几个混混哄笑。苏晓（画外音）：王哥，别难为他了。", "△ Lin Feng kneels silently while the men laugh. Su Xiao, off-screen: Don't make things hard for him."],
    ["△ 王胖子转头，色眯眯地走向吧台内的苏晓，伸手欲摸她的脸。苏晓惊恐后退。林峰（猛地站起）：别动她！", "△ Wang approaches Su Xiao behind the counter. She recoils. Lin Feng stands abruptly: Don't touch her!"],
    ["△ 王胖子一拳打在林峰腹部，林峰痛苦跪地。混混们一拥而上，对着林峰拳打脚踢。林峰（os）：为什么……为什么我这么没用……", "△ Wang strikes Lin Feng in the stomach. He falls to his knees as the others attack. Lin Feng, internally: Why am I so powerless?"],
    ["△ 混混打累了，王胖子往林峰身上吐了口唾沫，转身带人离开。", "△ The men tire of the attack. Wang spits at Lin Feng and leads them away."],
    ["△ 林峰趴在地上，视线模糊。他在垃圾堆中摸到一个冰凉的金属小管——智核胶囊。", "△ Lin Feng lies on the floor, his vision blurred. Among the rubbish, he finds a cold metal tube: a neural capsule."],
    ["△ 出于本能或绝望，他颤抖着拧开，吞下了那颗蓝色的胶囊。", "△ Driven by instinct or desperation, he twists it open with shaking hands and swallows the blue capsule."],
    ["△ 刹那间，瞳孔急剧收缩，脑海中仿佛电流穿过，无数数据流在眼前闪过。【字幕：大脑神经元链接重组中……】林峰（痛苦嘶吼）：啊——！", "△ His pupils contract. A current surges through his mind and streams of data flash before his eyes. [Caption: Neural connections reorganizing…] Lin Feng cries out in pain."],
    ["1-2 夜 外 网吧后巷", "1-2 · Night · Exterior · Alley behind the café"],
    ["△ 林峰扶着墙走出后门，呼吸急促，但他惊奇地发现，刚才的剧痛消失了，取而代之的是感官的极度敏锐。", "△ Leaning against the wall, Lin Feng steps outside. The pain is gone, replaced by astonishingly sharp senses."],
    ["△ 他能听清百米外老鼠爬行的声音，能看清墙缝里的蚂蚁。", "△ He can hear a rat a hundred meters away and see ants in cracks in the wall."],
    ["△ 突然，身后传来脚步声。王胖子去而复返，手里拿着一根钢管。", "△ Footsteps sound behind him. Wang has returned, holding a steel pipe."],
    ["△ 王胖子举起钢管狠狠砸下。", "△ Wang raises the pipe and strikes."],
    ["△ 林峰没有躲闪，只是微微侧身，动作快得拉出了残影。他单手接住钢管。林峰（冷漠，眼神如刀）：滚。", "△ Lin Feng shifts slightly, moving so fast he leaves an afterimage. He catches the pipe in one hand. Lin Feng, coldly: Go."],
    ["△ 林峰轻轻一推，王胖子像断了线的风筝飞出三米远，重重撞在垃圾桶上。林峰看着自己的双手，胸口突然传来一阵绞痛。【字幕：警告！副作用检测中……生命倒计时开启。】", "△ A gentle push sends Wang into a bin three meters away. Lin Feng studies his hands as a sudden pain grips his chest. [Warning: Side effects detected. Countdown initiated.]"],
  ];
  const editorCopy = () => `<div class="script-document"><details open><summary>${t("1．耸的异兽巢穴", "1. The beast's lair")}</summary><div class="scene-copy">${scenes.map(([zh, en], i) => t(zh, en, "p", i === 9 ? "script-change" : "")).join("")}</div></details>${[["声震耳欲聋的嘶吼", "A deafening roar"], ["潜龙出渊 一拳撼天", "The hidden dragon rises"], ["网吧风云黑客揭秘", "Secrets of the internet café"], ["绝境之中遗言托付", "A final request"], ["暗网归来的复仇者", "Return from the dark web"], ["碎梦订婚宴", "The broken engagement"], ["雨夜的神秘邀约", "An invitation in the rain"], ["战神陨落英雄崛起", "A hero rises"], ["平稳悠长", "A lasting peace"]].map(([zh, en], index) => `<details><summary>${t(`${index + 2}．${zh}`, `${index + 2}. ${en}`)}</summary>${t("待生成", "Awaiting generation", "p")}</details>`).join("")}</div>`;
  const editResult = `${user("把主角的名字改为林川", "Change the protagonist's name to Lin Chuan")}${copy("好的，已经把所有主角的名字改成林川，修改的内容已经替换到右侧文档", "Done. I have changed the protagonist's name to Lin Chuan and updated the document on the right.")}${decisionButtons(true)}`;
  const scriptReady = `${user("生成分集大纲", "Generate episode outline")}${copy("剧本大纲已经完成，你可以在右边编辑或修改，确认后可以生成完整的剧本", "The episode outline is ready. Review it on the right, then confirm to generate the script.")}${user("生成剧本正文", "Generate script")}${copy("大纲一共20集，我将为你生成完成的剧本正文，预计耗时3分钟", "The outline contains 20 episodes. The full script will take approximately three minutes.")}${copy("剧本正文已经完成，你可以在右边编辑或修改，确认后可以将剧本拆解成资产，它将包括角色、场景、脚本等", "The full script is ready. Review and edit it on the right, then extract characters, scenes and other assets.")}${copy("你也可以继续在右边修改剧本，完成后再进行剧本拆解", "You can continue editing the script before extracting assets.")}`;
  function workspace(mode) {
    const isHistory = mode === "history";
    return `<div class="editor-window ${mode === "quote" ? "quote-mode" : ""} ${isHistory ? "history-mode" : ""}" data-editor-mode="${mode}">
      <div class="editor-toolbar"><span class="project-filename">${t("未命名：蚁穴为巢藏意真，双天宠妻神", "Untitled · A story of hidden powers")}</span><ol><li class="active">${t("1．剧本大纲", "1. Script")}</li><li>${t("2．资产库", "2. Assets")}</li><li>${t("3．分集视频", "3. Video")}</li></ol><span class="editor-account">${image("credit")} 1004</span></div>
      <div class="editor-body"><section class="editor-document-pane"><nav class="editor-tabs" aria-label="Script document tabs">${[["故事设定", "Story settings"], ["分集大纲", "Episode outline"], ["剧本正文", "Script"]].map(([zh, en], index) => `<button type="button" data-action="editor-tab" data-tab="${index}" aria-pressed="${index === 2}" class="${index === 2 ? "active" : ""}">${t(zh, en)}</button>`).join("")}<span>${t("改旁白剧本", "Rewrite narration")}</span></nav><div class="editor-document-scroll"><div class="episode-count">${t("共10集", "10 episodes")}</div>${editorCopy()}</div>${mode === "quote" ? `<button class="inline-quote" type="button" data-action="quote">${image("quote")}${t("引用", "Quote")}</button>` : ""}<div class="document-bottom"><span>${t("剧本内容整理完毕，将进行剧本资产的拆解", "Script organized. Ready to extract assets.")}</span><span class="asset-extract">${image("credit")}25 ${t("剧本资产拆解", "Extract assets")}</span></div></section>
      ${isHistory ? `<div class="editor-history-pane">${panel(scriptReady)}<div class="editor-history-drawer">${historyList()}</div></div>` : panel(mode === "quote" ? scriptReady : editResult, { quote: mode === "quote" })}</div>
      <span class="editor-status" aria-live="polite"></span>
    </div>`;
  }
  mount("editing", `<div class="editing-row">${note("高亮修改点", "Highlight changes", "让用户直观感受到修改的具体部分", "Make the exact changes immediately visible", "note-left")}<figure class="editor-figure">${workspace("changes")}${caption("AI识别修改", "AI-identified changes")}</figure>${note("向用户进行确认", "Ask for confirmation", "修改某些剧情，需要提醒用户进行确认", "Ask the user to confirm plot changes")}</div><div class="editing-row">${note("高亮引用", "Highlight the quotation", "让用户直观感受到修改的具体部分", "Show exactly which passage is being edited", "note-left")}<figure class="editor-figure">${workspace("quote")}${caption("用户手动引用", "User-selected quotation")}</figure>${note("对话引用", "Quote in the conversation", "定向修改某些剧情", "Make targeted changes to a selected passage")}</div>`);

  const generationContent = `${user("想做一个末世异能题材，主角是底层网管", "An apocalypse story about an internet-café worker with superpowers")}${facts("我已收集完基础信息：", "I have collected the basic information:")}${copy("现在开始梳理故事梗概", "Now organizing the story synopsis")}${copy("生成中...", "Generating…", "loading-status")}`;
  const loadingRevision = `${documentPrompt}${analyzed}${user("我想修改一下剧情节奏", "I want to change the pacing")}${copy("正在拆解意图", "Analyzing your intent")}${copy("分析当前剧本节奏", "Analyzing the current pacing", "loading-status loading-pill")}`;
  const references = `${user("想做一个末世异能题材，主角是底层网管", "An apocalypse story about an internet-café worker with superpowers")}${copy("为你提供更多的风格参考：", "Here are some more style references:")}<div class="reference-grid">${[1, 2, 3, 4].map((i) => image(`reference${i}`, "", `视觉风格参考 ${i}`)).join("")}</div>${copy("查看全部 ›", "View all ›", "view-references")}`;
  mount("loading", `<figure class="chat-figure">${panel(generationContent, { loading: true, className: "has-glow" })}${caption("生成中", "Generating")}</figure><figure class="chat-figure">${panel(loadingRevision)}${caption("修改剧本", "Revising script")}</figure><figure class="chat-figure">${panel(references)}${caption("修改剧本", "Style references")}</figure>`);
  mount("history", `<figure class="history-editor">${workspace("history")}${caption("历史记录", "Version history")}</figure><figure class="version-detail"><div class="version-detail-panel">${historyList()}<div class="version-preview"><p>${t("文本Part", "Text passage")}</p><div><button type="button" data-action="restore">${t("回到此版本", "Restore version")}</button><button type="button" data-action="compare">${t("查看修改", "View changes")}</button></div></div></div>${caption("历史记录", "Version history")}</figure><div class="history-notes">${note("修改对比", "Compare changes", "查看具体修改哪些部分，给用户具体清晰的呈现", "Show precisely which parts changed in each revision.")}${note("回到此版本", "Restore this version", "用户可以回溯到具体某一个修改的版本", "Return to any specific version of the script.")}</div>`);

  const directionArrow = document.querySelector(".direction-arrow");
  if (directionArrow) directionArrow.innerHTML = image("shiftArrow");
  document.querySelectorAll(".metric-arrow").forEach((arrow) => { arrow.innerHTML = image("metricArrow"); });
})();
