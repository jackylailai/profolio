(() => {
  const TEXT_ATTRIBUTES = new Set(["aria-label", "alt", "title", "placeholder"]);
  const SKIP_TEXT_TAGS = new Set(["script", "style", "svg", "noscript"]);
  const VOID_TAGS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  const refs = {
    openFile: document.querySelector("[data-open-file]"),
    saveFile: document.querySelector("[data-save-file]"),
    downloadFile: document.querySelector("[data-download-file]"),
    fileInput: document.querySelector("[data-file-input]"),
    fileName: document.querySelector("[data-file-name]"),
    entryCount: document.querySelector("[data-entry-count]"),
    dirtyState: document.querySelector("[data-dirty-state]"),
    apiState: document.querySelector("[data-api-state]"),
    searchInput: document.querySelector("[data-search-input]"),
    typeFilter: document.querySelector("[data-type-filter]"),
    entryList: document.querySelector("[data-entry-list]"),
    selectedKind: document.querySelector("[data-selected-kind]"),
    selectedTitle: document.querySelector("[data-selected-title]"),
    editorText: document.querySelector("[data-editor-text]"),
    selectedLocation: document.querySelector("[data-selected-location]"),
    selectedLength: document.querySelector("[data-selected-length]"),
    selectedState: document.querySelector("[data-selected-state]"),
    previousEntry: document.querySelector("[data-previous-entry]"),
    nextEntry: document.querySelector("[data-next-entry]"),
    refreshPreview: document.querySelector("[data-refresh-preview]"),
    preview: document.querySelector("[data-preview]"),
    message: document.querySelector("[data-editor-message]"),
  };

  const state = {
    source: "",
    fileHandle: null,
    fileName: "",
    entries: [],
    selectedId: "",
    query: "",
    filter: "all",
    dirty: false,
    previewTimer: 0,
  };

  const decoder = document.createElement("textarea");
  const directWriteSupported = "showOpenFilePicker" in window;

  const setMessage = (message, kind = "") => {
    refs.message.textContent = message;
    refs.message.dataset.kind = kind;
  };

  const decodeHtml = (value) => {
    decoder.innerHTML = value;
    return decoder.value;
  };

  const escapeHtmlText = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const escapeHtmlAttribute = (value) =>
    escapeHtmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

  const snippet = (value, maxLength = 120) => {
    const text = normalizeWhitespace(value);
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
  };

  const humanize = (value) => {
    if (!value) return "Document";
    if (value === "top") return "Hero";
    return value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const lineNumberFor = (source, index) => source.slice(0, index).split(/\r\n|\r|\n/).length;

  const getEntry = () => state.entries.find((entry) => entry.id === state.selectedId) || null;

  const hasEntryChanged = (entry) => entry.current !== entry.original;

  const computeDirty = () => state.entries.some(hasEntryChanged);

  const findTagEnd = (source, start) => {
    let quote = "";
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === quote) quote = "";
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }
      if (char === ">") return index;
    }
    return -1;
  };

  const getTagInfo = (tagSource) => {
    const match = tagSource.match(/^<\s*(\/)?\s*([a-zA-Z][\w:-]*)/);
    if (!match) return null;
    const name = match[2].toLowerCase();
    return {
      name,
      isClosing: Boolean(match[1]),
      isSelfClosing: /\/\s*>$/.test(tagSource) || VOID_TAGS.has(name),
    };
  };

  const parseAttributes = (tagSource, tagStart) => {
    const attributes = [];
    const attrPattern = /([^\s"'<>/=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let match = attrPattern.exec(tagSource);

    while (match) {
      const quotedValue = match[2];
      const value = match[3] ?? match[4] ?? "";
      const valueStartInMatch = match[0].indexOf(quotedValue[0]) + 1;
      const start = tagStart + match.index + valueStartInMatch;

      attributes.push({
        name: match[1],
        lowerName: match[1].toLowerCase(),
        rawValue: value,
        value: decodeHtml(value),
        start,
        end: start + value.length,
      });

      match = attrPattern.exec(tagSource);
    }

    return attributes;
  };

  const toAttributeMap = (attributes) => {
    const map = new Map();
    attributes.forEach((attribute) => {
      map.set(attribute.lowerName, attribute.value);
    });
    return map;
  };

  const describeTag = (tagName, attrMap) => {
    const id = attrMap.get("id");
    const name = attrMap.get("name");
    const property = attrMap.get("property");
    if (id) return `${tagName}#${id}`;
    if (name) return `${tagName}[name="${name}"]`;
    if (property) return `${tagName}[property="${property}"]`;
    return tagName;
  };

  const shouldIncludeAttribute = (tagName, attribute, attrMap) => {
    if (TEXT_ATTRIBUTES.has(attribute.lowerName)) return true;
    if (tagName !== "meta" || attribute.lowerName !== "content") return false;

    const metaKey = `${attrMap.get("name") || ""} ${attrMap.get("property") || ""}`.toLowerCase();
    return /\b(description|title|site_name)\b/.test(metaKey);
  };

  const shouldSkipText = (value) => {
    const normalized = normalizeWhitespace(value);
    return !normalized || /^[-=]{4,}$/.test(normalized);
  };

  const extractEntries = (source) => {
    const entries = [];
    const sectionStack = [];
    const skipStack = [];

    const currentSection = () => sectionStack.at(-1) || { id: "document", label: "Document" };

    const addEntry = (entry) => {
      entries.push({
        id: `entry-${entries.length}`,
        index: entries.length,
        current: entry.value,
        original: entry.value,
        line: lineNumberFor(source, entry.start),
        ...entry,
      });
    };

    const addTextEntry = (start, end) => {
      if (skipStack.length > 0 || start >= end) return;

      const raw = source.slice(start, end);
      const leadingWhitespace = raw.match(/^\s*/)?.[0].length ?? 0;
      const trailingWhitespace = raw.match(/\s*$/)?.[0].length ?? 0;
      const textStart = start + leadingWhitespace;
      const textEnd = end - trailingWhitespace;

      if (textStart >= textEnd) return;

      const value = decodeHtml(source.slice(textStart, textEnd));
      if (shouldSkipText(value)) return;

      const section = currentSection();
      addEntry({
        type: "text",
        value,
        start: textStart,
        end: textEnd,
        sectionId: section.id,
        sectionLabel: section.label,
        label: `${section.label} text`,
      });
    };

    let index = 0;
    let textStart = 0;

    while (index < source.length) {
      if (source[index] !== "<") {
        index += 1;
        continue;
      }

      addTextEntry(textStart, index);

      if (source.startsWith("<!--", index)) {
        const commentEnd = source.indexOf("-->", index + 4);
        index = commentEnd === -1 ? source.length : commentEnd + 3;
        textStart = index;
        continue;
      }

      const tagEnd = findTagEnd(source, index);
      if (tagEnd === -1) break;

      const tagSource = source.slice(index, tagEnd + 1);
      const tagInfo = getTagInfo(tagSource);

      if (tagInfo) {
        if (tagInfo.isClosing) {
          if (SKIP_TEXT_TAGS.has(tagInfo.name)) {
            const lastIndex = skipStack.lastIndexOf(tagInfo.name);
            if (lastIndex !== -1) skipStack.splice(lastIndex, 1);
          } else if (tagInfo.name === "section" && sectionStack.length > 0) {
            sectionStack.pop();
          }
        } else {
          const attributes = parseAttributes(tagSource, index);
          const attrMap = toAttributeMap(attributes);
          const sectionId = tagInfo.name === "section" ? attrMap.get("id") || "section" : currentSection().id;
          const sectionLabel =
            tagInfo.name === "section"
              ? attrMap.get("aria-label") || humanize(sectionId)
              : currentSection().label;

          if (skipStack.length === 0 && !SKIP_TEXT_TAGS.has(tagInfo.name)) {
            attributes.forEach((attribute) => {
              if (!shouldIncludeAttribute(tagInfo.name, attribute, attrMap) || shouldSkipText(attribute.value)) {
                return;
              }

              addEntry({
                type: "attribute",
                value: attribute.value,
                start: attribute.start,
                end: attribute.end,
                sectionId,
                sectionLabel,
                tagName: tagInfo.name,
                attrName: attribute.name,
                label: `${describeTag(tagInfo.name, attrMap)} ${attribute.name}`,
              });
            });
          }

          if (SKIP_TEXT_TAGS.has(tagInfo.name) && !tagInfo.isSelfClosing) {
            skipStack.push(tagInfo.name);
          }

          if (tagInfo.name === "section" && !tagInfo.isSelfClosing) {
            sectionStack.push({ id: sectionId, label: sectionLabel });
          }
        }
      }

      index = tagEnd + 1;
      textStart = index;
    }

    addTextEntry(textStart, source.length);
    return entries;
  };

  const filteredEntries = () => {
    const query = state.query.trim().toLowerCase();
    return state.entries.filter((entry) => {
      if (state.filter === "text" && entry.type !== "text") return false;
      if (state.filter === "attribute" && entry.type !== "attribute") return false;
      if (state.filter === "changed" && !hasEntryChanged(entry)) return false;
      if (!query) return true;

      return [entry.current, entry.original, entry.label, entry.sectionLabel]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  };

  const renderList = () => {
    refs.entryList.replaceChildren();
    const entries = filteredEntries();

    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = state.entries.length === 0 ? "Open an HTML file to load editable wording." : "No fields match.";
      refs.entryList.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "entry-row";
      row.dataset.entryId = entry.id;
      row.classList.toggle("is-active", entry.id === state.selectedId);
      row.classList.toggle("is-changed", hasEntryChanged(entry));

      const meta = document.createElement("span");
      meta.className = "entry-row-meta";

      const location = document.createElement("span");
      location.textContent = `${entry.sectionLabel} · ${entry.type}`;
      const line = document.createElement("span");
      line.textContent = `L${entry.line}`;
      meta.append(location, line);

      const text = document.createElement("span");
      text.className = "entry-row-snippet";
      text.textContent = snippet(entry.current);

      row.append(meta, text);
      fragment.append(row);
    });

    refs.entryList.append(fragment);
  };

  const renderSelectedEntry = () => {
    const entry = getEntry();
    const visibleEntries = filteredEntries();
    const visibleIndex = entry ? visibleEntries.findIndex((item) => item.id === entry.id) : -1;

    refs.editorText.disabled = !entry;
    refs.previousEntry.disabled = visibleIndex <= 0;
    refs.nextEntry.disabled = visibleIndex === -1 || visibleIndex >= visibleEntries.length - 1;

    if (!entry) {
      refs.selectedKind.textContent = "// Field";
      refs.selectedTitle.textContent = "No field selected";
      refs.editorText.value = "";
      refs.selectedLocation.textContent = "Line -";
      refs.selectedLength.textContent = "0 chars";
      refs.selectedState.textContent = "Unchanged";
      return;
    }

    refs.selectedKind.textContent = `// ${entry.sectionLabel} · ${entry.type}`;
    refs.selectedTitle.textContent = entry.label;
    refs.editorText.value = entry.current;
    refs.selectedLocation.textContent = `Line ${entry.line}`;
    refs.selectedLength.textContent = `${entry.current.length} chars`;
    refs.selectedState.textContent = hasEntryChanged(entry) ? "Changed" : "Unchanged";
  };

  const renderStats = () => {
    const changedCount = state.entries.filter(hasEntryChanged).length;
    state.dirty = changedCount > 0;

    refs.fileName.textContent = state.fileName || "No file loaded";
    refs.entryCount.textContent = `${state.entries.length} fields`;
    refs.dirtyState.textContent = state.dirty ? `${changedCount} unsaved` : "Saved";
    refs.apiState.textContent = directWriteSupported
      ? "Direct write available in this browser"
      : "Direct write unavailable; use Download";

    refs.saveFile.disabled = !state.fileHandle || !state.entries.length || !state.dirty;
    refs.downloadFile.disabled = !state.entries.length;
    refs.refreshPreview.disabled = !state.entries.length;
  };

  const render = () => {
    renderList();
    renderSelectedEntry();
    renderStats();
  };

  const selectEntry = (entryId) => {
    state.selectedId = entryId;
    render();
  };

  const applyEntriesToSource = () => {
    const replacements = state.entries
      .filter(hasEntryChanged)
      .sort((a, b) => b.start - a.start);

    return replacements.reduce((source, entry) => {
      const escapedValue = entry.type === "attribute" ? escapeHtmlAttribute(entry.current) : escapeHtmlText(entry.current);
      return `${source.slice(0, entry.start)}${escapedValue}${source.slice(entry.end)}`;
    }, state.source);
  };

  const refreshPreview = () => {
    if (!state.source) {
      refs.preview.removeAttribute("srcdoc");
      return;
    }

    refs.preview.srcdoc = applyEntriesToSource();
  };

  const schedulePreview = () => {
    window.clearTimeout(state.previewTimer);
    state.previewTimer = window.setTimeout(refreshPreview, 180);
  };

  const loadSource = (source, fileName, fileHandle = null) => {
    state.source = source;
    state.fileName = fileName;
    state.fileHandle = fileHandle;
    state.entries = extractEntries(source);
    state.selectedId = state.entries[0]?.id || "";
    state.query = "";
    state.filter = "all";
    refs.searchInput.value = "";
    refs.typeFilter.value = "all";

    setMessage(`${state.entries.length} editable fields loaded from ${fileName}.`, "success");
    render();
    refreshPreview();
  };

  const openWithFilePicker = async () => {
    const [fileHandle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "HTML files",
          accept: { "text/html": [".html", ".htm"] },
        },
      ],
    });
    const file = await fileHandle.getFile();
    loadSource(await file.text(), file.name, fileHandle);
  };

  const openWithFallbackInput = () => {
    refs.fileInput.value = "";
    refs.fileInput.click();
  };

  const verifyPermission = async (fileHandle) => {
    const options = { mode: "readwrite" };
    if ((await fileHandle.queryPermission(options)) === "granted") return true;
    return (await fileHandle.requestPermission(options)) === "granted";
  };

  const saveFile = async () => {
    if (!state.fileHandle) {
      setMessage("Direct file save needs Chrome or Edge with a file opened through Open HTML.", "warn");
      return;
    }

    if (!(await verifyPermission(state.fileHandle))) {
      setMessage("File write permission was not granted.", "warn");
      return;
    }

    const output = applyEntriesToSource();
    const writable = await state.fileHandle.createWritable();
    await writable.write(output);
    await writable.close();

    const fileName = state.fileName;
    const fileHandle = state.fileHandle;
    loadSource(output, fileName, fileHandle);
    setMessage(`${fileName} saved.`, "success");
  };

  const downloadFile = () => {
    if (!state.source) return;

    const blob = new Blob([applyEntriesToSource()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = state.fileName || "index.html";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Updated HTML downloaded.", "success");
  };

  refs.openFile.addEventListener("click", async () => {
    try {
      if (directWriteSupported) {
        await openWithFilePicker();
      } else {
        openWithFallbackInput();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessage(error.message || "Unable to open file.", "warn");
      }
    }
  });

  refs.fileInput.addEventListener("change", async () => {
    const [file] = refs.fileInput.files;
    if (!file) return;
    loadSource(await file.text(), file.name, null);
  });

  refs.saveFile.addEventListener("click", async () => {
    try {
      await saveFile();
    } catch (error) {
      setMessage(error.message || "Unable to save file.", "warn");
    }
  });

  refs.downloadFile.addEventListener("click", downloadFile);
  refs.refreshPreview.addEventListener("click", refreshPreview);

  refs.entryList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-entry-id]");
    if (!row) return;
    selectEntry(row.dataset.entryId);
  });

  refs.editorText.addEventListener("input", () => {
    const entry = getEntry();
    if (!entry) return;
    entry.current = refs.editorText.value;
    render();
    schedulePreview();
  });

  refs.searchInput.addEventListener("input", () => {
    state.query = refs.searchInput.value;
    render();
  });

  refs.typeFilter.addEventListener("change", () => {
    state.filter = refs.typeFilter.value;
    render();
  });

  const moveSelection = (direction) => {
    const entries = filteredEntries();
    const currentIndex = entries.findIndex((entry) => entry.id === state.selectedId);
    const nextEntry = entries[currentIndex + direction];
    if (nextEntry) selectEntry(nextEntry.id);
  };

  refs.previousEntry.addEventListener("click", () => moveSelection(-1));
  refs.nextEntry.addEventListener("click", () => moveSelection(1));

  window.addEventListener("beforeunload", (event) => {
    if (!computeDirty()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  renderStats();
})();
