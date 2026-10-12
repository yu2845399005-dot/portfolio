(function () {
  const stage = document.querySelector(".demo-stage");
  const viewport = document.getElementById("phoneViewport");
  const scaler = document.getElementById("phoneScaler");
  const surface = document.getElementById("appSurface");
  const home = document.getElementById("assistantHome");
  const conversation = document.getElementById("conversationView");
  const conversationScroll = conversation.querySelector(".conversation-scroll");
  const conversationPrompt = document.getElementById("conversationPrompt");
  const conversationTime = document.getElementById("conversationTime");
  const analysisStatus = document.getElementById("analysisStatus");
  const analysisSteps = document.getElementById("analysisSteps");
  const analysisPhase = document.getElementById("analysisPhase");
  const analysisStepOne = document.getElementById("analysisStepOne");
  const analysisStepTwo = document.getElementById("analysisStepTwo");
  const assistantAnswer = document.getElementById("assistantAnswer");
  const answerText = document.getElementById("answerText");
  const followUpSuggestions = document.getElementById("followUpSuggestions");
  const followUpButton = document.getElementById("followUpButton");
  const followUpRound = document.getElementById("followUpRound");
  const followUpPrompt = document.getElementById("followUpPrompt");
  const followUpAnalysisStatus = document.getElementById("followUpAnalysisStatus");
  const followUpAnalysisSteps = document.getElementById("followUpAnalysisSteps");
  const followUpAnalysisPhase = document.getElementById("followUpAnalysisPhase");
  const followUpAnalysisStepOne = document.getElementById("followUpAnalysisStepOne");
  const followUpAnalysisStepTwo = document.getElementById("followUpAnalysisStepTwo");
  const followUpAssistantAnswer = document.getElementById("followUpAssistantAnswer");
  const followUpAnswerText = document.getElementById("followUpAnswerText");
  const answerActions = document.getElementById("answerActions");
  const dislikeButton = document.getElementById("dislikeButton");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackBackdrop = document.getElementById("feedbackBackdrop");
  const feedbackClose = document.getElementById("feedbackClose");
  const feedbackOptions = Array.from(document.querySelectorAll("[data-feedback-option]"));
  const feedbackText = document.getElementById("feedbackText");
  const feedbackCount = document.getElementById("feedbackCount");
  const feedbackSubmit = document.getElementById("feedbackSubmit");
  const benefitPill = document.getElementById("benefitPill");
  const benefitLabel = benefitPill.querySelector("span");
  const form = document.getElementById("chatForm");
  const bottomCompose = form.closest(".bottom-compose");
  const input = document.getElementById("chatInput");
  const inputSuggestions = document.getElementById("inputSuggestions");
  const suggestionButtons = Array.from(inputSuggestions.querySelectorAll("button"));
  const iosKeyboard = document.getElementById("iosKeyboard");
  const keyboardHitLayer = document.getElementById("keyboardHitLayer");
  const mic = document.getElementById("micButton");
  const voiceComposer = document.getElementById("voiceComposer");
  const voiceTranscript = document.getElementById("voiceTranscript");
  const voiceWaveform = document.getElementById("voiceWaveform");
  const voiceStop = document.getElementById("voiceStop");
  const voiceSend = document.getElementById("voiceSend");
  const plus = document.getElementById("plusButton");
  const sheet = document.getElementById("attachmentSheet");
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const island = document.getElementById("dynamicIsland");
  const introOnboarding = document.getElementById("introOnboarding");
  const introCta = document.getElementById("introCta");
  const time = document.getElementById("statusTime");
  const rotatingPrompt = document.querySelector(".floating-question");
  const rotatingPromptLabel = rotatingPrompt.querySelector("span");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const primaryAnalysisUi = {
    status: analysisStatus,
    steps: analysisSteps,
    phase: analysisPhase,
    stepOne: analysisStepOne,
    stepTwo: analysisStepTwo,
    answer: assistantAnswer,
    answerText,
    actions: null
  };
  const followUpAnalysisUi = {
    status: followUpAnalysisStatus,
    steps: followUpAnalysisSteps,
    phase: followUpAnalysisPhase,
    stepOne: followUpAnalysisStepOne,
    stepTwo: followUpAnalysisStepTwo,
    answer: followUpAssistantAnswer,
    answerText: followUpAnswerText,
    actions: answerActions
  };
  const spinnerIcon = "./assets/live-assistant-demo/analysis-spinner.svg";
  const checkIcon = "./assets/live-assistant-demo/analysis-check.svg";
  let toastTimer;
  let analysisRun = 0;
  let voiceRun = 0;
  let promptIndex = 0;
  const voicePhrase = "How was yesterday’s live performance? Could you help me figure out?";
  const voiceRecognitionStages = [
    { text: "How", progress: "24%", delay: 420 },
    { text: "How was", progress: "34%", delay: 380 },
    { text: "How was yesterday’s", progress: "47%", delay: 480 },
    { text: "How was yesterday’s live", progress: "61%", delay: 460 },
    { text: voicePhrase, progress: "78%", delay: 560 }
  ];
  const promptOptions = [
    { label: "Why low reach?", prompt: "Why is my LIVE reach low?" },
    { label: "Boost my LIVE?", prompt: "How can I improve my next LIVE?" },
    { label: "My LIVE report?", prompt: "Show me my weekly LIVE report" },
    { label: "Check appeal status?", prompt: "What is the status of my recent appeal?" }
  ];
  const suggestionCatalog = [
    {
      match: /yesterday|performance|stream/i,
      items: [
        { text: "How was yesterday’s live performance?", accent: "How was yesterday’s" },
        { text: "How was yesterday’s live streaming?", accent: "How was yesterday’s" }
      ]
    },
    {
      match: /report|weekly/i,
      items: [
        { text: "Show me my weekly LIVE report", accent: "weekly LIVE report" },
        { text: "Summarize my recent LIVE report", accent: "recent LIVE report" }
      ]
    },
    {
      match: /reach|audience|viewer|retention/i,
      items: [
        { text: "Why is my LIVE reach low?", accent: "LIVE reach" },
        { text: "How can I improve viewer retention?", accent: "viewer retention" }
      ]
    },
    {
      match: /appeal|status/i,
      items: [
        { text: "Check my recent appeal status", accent: "appeal status" },
        { text: "What should I do while my appeal is reviewed?", accent: "appeal" }
      ]
    }
  ];
  const defaultSuggestions = [
    { text: "How can I improve my next LIVE?", accent: "improve my next LIVE" },
    { text: "How can I grow my LIVE audience?", accent: "grow my LIVE audience" }
  ];

  function fitPhone() {
    const availableWidth = Math.max(280, window.innerWidth - 28);
    const availableHeight = Math.max(560, window.innerHeight - 54);
    const scale = Math.min(1, availableWidth / 414, availableHeight / 852);
    scaler.style.setProperty("--phone-scale", scale.toFixed(4));
    viewport.style.width = `${414 * scale}px`;
    viewport.style.height = `${852 * scale}px`;
  }

  function updateTime() {
    const now = new Date();
    time.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  }

  function formatMessageTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  }

  function showToast(message, variant = "") {
    clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.toggle("feedback-success", variant === "feedback-success");
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function resetFeedbackForm() {
    feedbackOptions.forEach((option, index) => {
      const selected = index < 2;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    feedbackText.value = "";
    feedbackCount.textContent = "0";
  }

  function openFeedback() {
    closeKeyboard();
    surface.scrollTop = 0;
    stage.scrollTop = 0;
    resetFeedbackForm();
    feedbackModal.hidden = false;
    feedbackModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => feedbackModal.classList.add("is-visible"));
    });
  }

  function closeFeedback() {
    if (feedbackModal.hidden) return;
    feedbackText.blur();
    keepFeedbackViewportPinned();
    feedbackModal.classList.remove("is-visible");
    feedbackModal.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      feedbackModal.hidden = true;
    }, reducedMotion.matches ? 20 : 580);
  }

  function keepFeedbackViewportPinned() {
    surface.scrollTop = 0;
    requestAnimationFrame(() => {
      surface.scrollTop = 0;
    });
  }

  function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function resetVoiceDemo() {
    voiceRun += 1;
    bottomCompose.classList.remove("voice-active", "voice-listening", "voice-finishing", "voice-result");
    form.classList.remove("voice-result");
    form.removeAttribute("aria-hidden");
    voiceComposer.setAttribute("aria-hidden", "true");
    voiceTranscript.textContent = "Listening…";
    voiceTranscript.parentElement.classList.remove("has-text");
    voiceWaveform.style.setProperty("--voice-progress", "14%");
    voiceSend.disabled = true;
  }

  function finishVoiceRecognition(runId = voiceRun) {
    if (runId !== voiceRun || !bottomCompose.classList.contains("voice-active")) return;
    const completionId = ++voiceRun;
    voiceTranscript.textContent = voicePhrase;
    voiceTranscript.parentElement.classList.add("has-text");
    voiceWaveform.style.setProperty("--voice-progress", "78%");
    bottomCompose.classList.remove("voice-listening");
    bottomCompose.classList.add("voice-finishing", "voice-result");
    input.value = voicePhrase;
    form.classList.add("has-text", "voice-result");
    form.removeAttribute("aria-hidden");
    voiceComposer.setAttribute("aria-hidden", "true");
    voiceSend.disabled = true;

    setTimeout(() => {
      if (completionId !== voiceRun) return;
      bottomCompose.classList.remove("voice-active", "voice-finishing");
    }, reducedMotion.matches ? 10 : 360);
  }

  async function runVoiceRecognition(runId) {
    if (reducedMotion.matches) {
      finishVoiceRecognition(runId);
      return;
    }

    for (const stage of voiceRecognitionStages) {
      await delay(stage.delay);
      if (runId !== voiceRun) return;
      voiceTranscript.textContent = stage.text;
      voiceTranscript.parentElement.classList.add("has-text");
      voiceWaveform.style.setProperty("--voice-progress", stage.progress);
    }

    await delay(620);
    finishVoiceRecognition(runId);
  }

  function startVoiceDemo() {
    if (introOnboarding.classList.contains("is-visible")) return;
    closeKeyboard();
    const runId = ++voiceRun;
    bottomCompose.classList.remove("voice-finishing", "voice-result", "suggestions-visible");
    form.classList.remove("voice-result");
    bottomCompose.classList.add("voice-active", "voice-listening");
    form.setAttribute("aria-hidden", "true");
    voiceComposer.setAttribute("aria-hidden", "false");
    voiceTranscript.textContent = "Listening…";
    voiceTranscript.parentElement.classList.remove("has-text");
    voiceWaveform.style.setProperty("--voice-progress", "14%");
    input.value = "";
    form.classList.remove("has-text");
    voiceSend.disabled = true;
    runVoiceRecognition(runId);
  }

  function openKeyboard() {
    if (introOnboarding.classList.contains("is-visible")) return;
    surface.classList.add("keyboard-open");
    iosKeyboard.setAttribute("aria-hidden", "false");
  }

  function closeKeyboard(blurInput = true) {
    surface.classList.remove("keyboard-open");
    iosKeyboard.setAttribute("aria-hidden", "true");
    inputSuggestions.classList.remove("has-suggestions");
    bottomCompose.classList.remove("suggestions-visible");
    if (blurInput) input.blur();
  }

  function suggestionItemsFor(value) {
    const query = value.trim();
    if (query.length < 2) return [];
    return (suggestionCatalog.find((group) => group.match.test(query)) || { items: defaultSuggestions }).items;
  }

  function renderSuggestion(button, item, value) {
    const copy = button.querySelector(".suggestion-copy");
    const query = value.trim();
    const start = item.text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    copy.textContent = "";
    if (!query || start < 0) {
      copy.textContent = item.text;
    } else {
      copy.append(document.createTextNode(item.text.slice(0, start)));
      const mark = document.createElement("mark");
      mark.textContent = item.text.slice(start, start + query.length);
      copy.append(mark, document.createTextNode(item.text.slice(start + query.length)));
    }
    button.dataset.completion = item.text;
  }

  function updateComposerState() {
    const hasText = input.value.trim().length > 0;
    form.classList.toggle("has-text", hasText);
    const items = suggestionItemsFor(input.value);
    suggestionButtons.forEach((button, index) => {
      button.hidden = !items[index];
      if (items[index]) renderSuggestion(button, items[index], input.value);
    });
    const suggestionsVisible = surface.classList.contains("keyboard-open") && items.length > 0;
    inputSuggestions.classList.toggle("has-suggestions", suggestionsVisible);
    bottomCompose.classList.toggle("suggestions-visible", suggestionsVisible);
  }

  function replaceSelection(text) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
    const nextPosition = start + text.length;
    input.focus({ preventScroll: true });
    input.setSelectionRange(nextPosition, nextPosition);
    updateComposerState();
  }

  function deleteBeforeCursor() {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    if (start !== end) {
      input.value = `${input.value.slice(0, start)}${input.value.slice(end)}`;
      input.setSelectionRange(start, start);
    } else if (start > 0) {
      input.value = `${input.value.slice(0, start - 1)}${input.value.slice(end)}`;
      input.setSelectionRange(start - 1, start - 1);
    }
    updateComposerState();
  }

  function showIntroOnboarding() {
    introOnboarding.hidden = false;
    introOnboarding.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => introOnboarding.classList.add("is-visible"));
    });
  }

  function dismissIntroOnboarding() {
    if (!introOnboarding.classList.contains("is-visible")) return;
    introCta.disabled = true;
    introOnboarding.classList.remove("is-visible");
    introOnboarding.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      introOnboarding.hidden = true;
      introCta.disabled = false;
    }, reducedMotion.matches ? 20 : 700);
  }

  function setAnalysisStep(step, state) {
    const icon = step.querySelector("img");
    const label = step.querySelector("span");
    step.hidden = state === "hidden";
    step.classList.toggle("is-visible", state !== "hidden");
    step.classList.toggle("is-active", state === "active");
    step.classList.toggle("is-complete", state === "complete");
    icon.src = state === "complete" ? checkIcon : spinnerIcon;
    label.textContent = `${step.dataset.label}${state === "active" ? "..." : ""}`;
  }

  function resetAnalysisUi(ui) {
    ui.phase.textContent = "Thinking";
    ui.phase.classList.add("phase-sheen");
    ui.status.classList.remove("is-resolving");
    ui.steps.hidden = false;
    ui.steps.classList.remove("is-retiring");
    setAnalysisStep(ui.stepOne, "hidden");
    setAnalysisStep(ui.stepTwo, "hidden");
    ui.answer.classList.remove("is-visible", "is-typing");
    ui.answer.hidden = true;
    ui.answer.setAttribute("aria-hidden", "true");
    ui.answerText.textContent = "";
    if (ui.actions) {
      ui.actions.classList.remove("is-visible");
      ui.actions.hidden = true;
    }
  }

  function resetFollowUpRound() {
    resetAnalysisUi(followUpAnalysisUi);
    followUpRound.hidden = true;
    followUpRound.setAttribute("aria-hidden", "true");
    followUpRound.classList.remove("is-visible");
    followUpPrompt.textContent = "";
  }

  function resetAnalysis() {
    resetAnalysisUi(primaryAnalysisUi);
    followUpSuggestions.classList.remove("is-visible");
    followUpSuggestions.classList.remove("is-leaving");
    followUpSuggestions.hidden = true;
    resetFollowUpRound();
    conversationScroll.scrollTop = 0;
  }

  function answerFor(prompt) {
    if (/viewer retention|retain viewers/i.test(prompt)) {
      return "To improve viewer retention, make the first 30 seconds immediately useful: open with one clear promise, preview the result viewers will get, and keep your first topic focused before moving on.";
    }
    if (/health score/i.test(prompt)) {
      return "To improve your LIVE health score, review recent policy notices before going LIVE, keep minors and restricted content off camera, and use a clear moderation plan throughout the stream.";
    }
    if (/viewer|room|traffic|audience|reach/i.test(prompt)) {
      return "A minor previously appeared on camera during your LIVE. This is not permitted. As a result, your LIVE health score decreased, which may have affected your LIVE’s reach and recommendation traffic.";
    }
    if (/weekly|report/i.test(prompt)) {
      return "Your weekly LIVE report shows that viewer retention dropped during the first 30 seconds. Try opening with a clearer hook, previewing the main benefit early, and pinning one focused topic before you go LIVE.";
    }
    if (/vip|support|appeal/i.test(prompt)) {
      return "I found your recent appeal. It is still being reviewed, so there is nothing else you need to submit right now. I’ll keep the case details organized and help you with the next step when the status changes.";
    }
    return "I reviewed your recent LIVE data. The clearest opportunity is to make the opening more specific, surface the viewer benefit earlier, and keep the first topic focused so people know why they should stay.";
  }

  function followUpFor(prompt) {
    if (/viewer|room|traffic|audience|reach/i.test(prompt)) return "Improve my LIVE score?";
    if (/weekly|report/i.test(prompt)) return "Improve viewer retention?";
    if (/vip|support|appeal/i.test(prompt)) return "What happens next?";
    return "Improve my LIVE score?";
  }

  function scrollConversation() {
    requestAnimationFrame(() => {
      conversationScroll.scrollTop = conversationScroll.scrollHeight;
    });
  }

  async function typeAnswer(message, runId, ui = primaryAnalysisUi, completion = "suggestions") {
    const segments = typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(message), (item) => item.segment)
      : Array.from(message);

    ui.answer.hidden = false;
    ui.answer.classList.add("is-visible", "is-typing");
    ui.answer.setAttribute("aria-hidden", "false");
    scrollConversation();

    if (reducedMotion.matches) {
      ui.answerText.textContent = message;
    } else {
      for (const character of segments) {
        if (runId !== analysisRun) return;
        ui.answerText.textContent += character;
        if (ui.answerText.textContent.length % 5 === 0) scrollConversation();
        await delay(/[,.!?]/.test(character) ? 70 : 22);
      }
    }

    if (runId === analysisRun) {
      ui.answer.classList.remove("is-typing");
      ui.phase.textContent = "LIVE Assistant";
      ui.phase.classList.remove("phase-sheen");
      ui.status.classList.add("is-resolving");
      ui.steps.classList.add("is-retiring");
      await delay(reducedMotion.matches ? 10 : 420);
      if (runId !== analysisRun) return;
      setAnalysisStep(ui.stepOne, "hidden");
      setAnalysisStep(ui.stepTwo, "hidden");
      ui.steps.hidden = true;
      ui.steps.classList.remove("is-retiring");
      ui.status.classList.remove("is-resolving");
      if (completion === "actions" && ui.actions) {
        ui.actions.hidden = false;
        requestAnimationFrame(() => ui.actions.classList.add("is-visible"));
      } else {
        followUpSuggestions.hidden = false;
        followUpSuggestions.classList.add("is-visible");
      }
      scrollConversation();
    }
  }

  async function runAnalysis(prompt, runId, ui = primaryAnalysisUi, completion = "suggestions") {
    const quick = reducedMotion.matches;
    await delay(quick ? 10 : 620);
    if (runId !== analysisRun) return;
    setAnalysisStep(ui.stepOne, "active");

    await delay(quick ? 10 : 980);
    if (runId !== analysisRun) return;
    setAnalysisStep(ui.stepOne, "complete");
    ui.phase.textContent = "Searching";

    await delay(quick ? 10 : 180);
    if (runId !== analysisRun) return;
    setAnalysisStep(ui.stepTwo, "active");

    await delay(quick ? 10 : 1180);
    if (runId !== analysisRun) return;
    setAnalysisStep(ui.stepTwo, "complete");

    await delay(quick ? 10 : 320);
    if (runId !== analysisRun) return;
    ui.phase.textContent = "Answering";

    await delay(quick ? 10 : 240);
    if (runId !== analysisRun) return;
    await typeAnswer(answerFor(prompt), runId, ui, completion);
  }

  function sendPrompt(prompt) {
    const clean = prompt.trim();
    if (!clean) return;
    const runId = ++analysisRun;

    resetVoiceDemo();

    home.classList.remove("conversation-active");
    resetAnalysis();
    conversation.setAttribute("aria-hidden", "false");
    conversationPrompt.textContent = clean;
    conversationTime.textContent = formatMessageTime(new Date());
    const followUp = followUpFor(clean);
    followUpButton.querySelector("span").textContent = followUp;
    followUpButton.dataset.followUp = followUp;
    benefitLabel.textContent = "Fast Appeal";
    benefitPill.dataset.toast = "Fast Appeal gives priority help with your recent LIVE appeal.";
    closeKeyboard(false);
    input.value = "";
    input.blur();
    form.classList.remove("has-text");
    stage.scrollTop = 0;

    requestAnimationFrame(() => {
      stage.scrollTop = 0;
      requestAnimationFrame(() => {
        home.classList.add("conversation-active");
        runAnalysis(clean, runId, primaryAnalysisUi, "suggestions");
      });
    });
  }

  function sendFollowUpPrompt(prompt) {
    const clean = prompt.trim();
    if (!clean) return;
    if (!home.classList.contains("conversation-active")) {
      sendPrompt(clean);
      return;
    }

    const runId = ++analysisRun;
    resetVoiceDemo();
    resetAnalysisUi(followUpAnalysisUi);
    followUpPrompt.textContent = clean;
    followUpSuggestions.classList.remove("is-visible");
    followUpSuggestions.classList.add("is-leaving");
    followUpRound.hidden = false;
    followUpRound.setAttribute("aria-hidden", "false");
    closeKeyboard(false);
    input.value = "";
    input.blur();
    form.classList.remove("has-text");

    setTimeout(() => {
      followUpSuggestions.hidden = true;
      followUpSuggestions.classList.remove("is-leaving");
    }, reducedMotion.matches ? 10 : 280);

    requestAnimationFrame(() => {
      followUpRound.classList.add("is-visible");
      scrollConversation();
      setTimeout(() => runAnalysis(clean, runId, followUpAnalysisUi, "actions"), reducedMotion.matches ? 10 : 360);
    });
  }

  function returnHome() {
    closeKeyboard();
    resetVoiceDemo();
    if (!home.classList.contains("conversation-active")) {
      showToast("You’re on LIVE Assistant home.");
      return;
    }

    analysisRun += 1;
    home.classList.remove("conversation-active");
    conversation.setAttribute("aria-hidden", "true");
    benefitLabel.textContent = "VIP support";
    benefitPill.dataset.toast = "VIP Support gives priority help for LIVE creators.";
    input.value = "";
    form.classList.remove("has-text");
    resetAnalysis();
  }

  window.addEventListener("resize", fitPhone);
  fitPhone();
  updateTime();
  setInterval(updateTime, 30000);
  setTimeout(showIntroOnboarding, reducedMotion.matches ? 0 : 140);

  setInterval(() => {
    if (home.classList.contains("conversation-active") || introOnboarding.classList.contains("is-visible")) return;
    promptIndex = (promptIndex + 1) % promptOptions.length;
    const nextPrompt = promptOptions[promptIndex];

    if (reducedMotion.matches) {
      rotatingPromptLabel.textContent = nextPrompt.label;
      rotatingPrompt.dataset.prompt = nextPrompt.prompt;
      return;
    }

    rotatingPrompt.classList.add("is-changing");
    setTimeout(() => {
      rotatingPromptLabel.textContent = nextPrompt.label;
      rotatingPrompt.dataset.prompt = nextPrompt.prompt;
      rotatingPrompt.classList.remove("is-changing");
    }, 180);
  }, 2750);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendPrompt(input.value);
  });

  input.addEventListener("input", () => {
    updateComposerState();
  });

  input.addEventListener("focus", () => {
    openKeyboard();
    updateComposerState();
  });

  form.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openKeyboard();
    input.focus({ preventScroll: true });
    updateComposerState();
  });

  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sendPrompt(button.dataset.completion || "");
    });
  });

  followUpButton.addEventListener("click", () => {
    sendFollowUpPrompt(followUpButton.dataset.followUp || "");
  });

  dislikeButton.addEventListener("click", openFeedback);
  feedbackBackdrop.addEventListener("click", closeFeedback);
  feedbackClose.addEventListener("click", closeFeedback);
  feedbackOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selected = !option.classList.contains("is-selected");
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
  feedbackText.addEventListener("input", () => {
    keepFeedbackViewportPinned();
    feedbackCount.textContent = String(feedbackText.value.length);
  });
  feedbackText.addEventListener("focus", keepFeedbackViewportPinned);
  feedbackSubmit.addEventListener("click", () => {
    keepFeedbackViewportPinned();
    closeFeedback();
    setTimeout(() => {
      keepFeedbackViewportPinned();
      showToast("Thank you for your feedback!", "feedback-success");
    }, reducedMotion.matches ? 20 : 620);
  });

  keyboardHitLayer.addEventListener("pointerdown", (event) => event.preventDefault());
  keyboardHitLayer.addEventListener("click", (event) => {
    const keyButton = event.target.closest("[data-key]");
    if (!keyButton) return;
    const key = keyButton.dataset.key;
    if (key === "Backspace") {
      deleteBeforeCursor();
    } else if (key === "Enter") {
      if (input.value.trim()) form.requestSubmit();
    } else if (key === "Shift" || key === "123" || key === "Emoji") {
      input.focus({ preventScroll: true });
    } else {
      const character = input.value.length === 0 ? key.toUpperCase() : key;
      replaceSelection(character);
    }
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendPrompt(button.dataset.prompt || ""));
  });

  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(button.dataset.toast || "Ready");
      sheet.classList.remove("open");
      sheet.setAttribute("aria-hidden", "true");
    });
  });

  plus.addEventListener("click", () => {
    const open = sheet.classList.toggle("open");
    sheet.setAttribute("aria-hidden", String(!open));
  });

  mic.addEventListener("click", startVoiceDemo);

  voiceStop.addEventListener("click", () => {
    finishVoiceRecognition();
  });

  voiceSend.addEventListener("click", () => {
    if (!voiceSend.disabled) sendPrompt(voiceTranscript.textContent);
  });

  island.addEventListener("click", () => {
    island.classList.add("expanded");
    setTimeout(() => island.classList.remove("expanded"), 1700);
  });

  introCta.addEventListener("click", dismissIntroOnboarding);

  document.getElementById("backButton").addEventListener("click", () => {
    returnHome();
  });

  // Check outside taps before the composer moves upward. Using `click` here
  // can retarget a quick tap to the content underneath after the keyboard
  // transition starts, which immediately closes the keyboard again.
  surface.addEventListener("pointerdown", (event) => {
    if (!sheet.contains(event.target) && !plus.contains(event.target)) {
      sheet.classList.remove("open");
      sheet.setAttribute("aria-hidden", "true");
    }
    if (
      surface.classList.contains("keyboard-open") &&
      !form.contains(event.target) &&
      !inputSuggestions.contains(event.target) &&
      !iosKeyboard.contains(event.target)
    ) {
      closeKeyboard();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && feedbackModal.classList.contains("is-visible")) {
      closeFeedback();
      return;
    }
    if (event.key === "Escape" && surface.classList.contains("keyboard-open")) closeKeyboard();
  });

})();
