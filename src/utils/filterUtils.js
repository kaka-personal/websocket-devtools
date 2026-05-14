/**
 * Filter messages based on direction, text content, and invert option
 * @param {Array} messages - Array of message objects
 * @param {Object} filters - Filter configuration
 * @param {string} filters.direction - 'all', 'outgoing', or 'incoming'
 * @param {string} filters.text - Text to filter by
 * @param {boolean} filters.invert - Whether to invert the text filter
 * @returns {Array} Filtered messages
 */
export const analyzeFilterPattern = (text = "") => {
  const trimmedText = text.trim();
  const regexPrefixMatch = trimmedText.match(/^(?:re|regex):(.*)$/is);

  if (!trimmedText) {
    return {
      mode: "empty",
      text: "",
      regex: null,
      error: null,
    };
  }

  const createRegexPattern = (pattern, flags = "", isExplicit = false) => {
    try {
      return {
        mode: "regex",
        text: trimmedText,
        regex: new RegExp(pattern, flags),
        error: null,
      };
    } catch (error) {
      if (!isExplicit) {
        return null;
      }

      return {
        mode: "invalid-regex",
        text: trimmedText,
        regex: null,
        error: error.message,
      };
    }
  };

  if (trimmedText.startsWith("/") && trimmedText.lastIndexOf("/") > 0) {
    const lastSlashIndex = trimmedText.lastIndexOf("/");
    const pattern = trimmedText.slice(1, lastSlashIndex);
    const flags = trimmedText.slice(lastSlashIndex + 1);
    const regexPattern = createRegexPattern(pattern, flags, true);
    if (regexPattern) {
      return regexPattern;
    }
  }

  if (regexPrefixMatch) {
    const regexPattern = createRegexPattern(regexPrefixMatch[1], "", true);
    if (regexPattern) {
      return regexPattern;
    }
  }

  const looksLikeRawRegex =
    /(^\^)|(\$$)|\\[dDsSwWbBtrnvf0]|(\.\*)|(\.\+)|(\[[^\]]*\])|(\{\d+,?\d*\})|(\|)|(\(\?:)|(\(\?=)|(\(\?!)/.test(
      trimmedText
    );

  if (looksLikeRawRegex) {
    const regexPattern = createRegexPattern(trimmedText);
    if (regexPattern) {
      return regexPattern;
    }
  }

  return {
    mode: "text",
    text: trimmedText.toLowerCase(),
    regex: null,
    error: null,
  };
};

const FIELD_TOKEN_PATTERN = /^[a-zA-Z_][\w.-]*:/;

const tokenizeFilterText = (text = "") => {
  return (
    text.match(
      /(?:[^\s":]+:(?:"[^"]*"|'[^']*'|\S+))|(?:"[^"]*"|'[^']*'|\S+)/g
    ) || []
  );
};

const stripWrappingQuotes = (value = "") => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const tryParseStructuredString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  if (
    !trimmedValue ||
    !(
      trimmedValue.startsWith("{") ||
      trimmedValue.startsWith("[")
    )
  ) {
    return null;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch (error) {
    return null;
  }
};

const toSearchableStructure = (value) => {
  const parsedValue = tryParseStructuredString(value);
  return parsedValue ?? value;
};

const parseFilterQuery = (text = "") => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      mode: "empty",
      terms: [],
    };
  }

  const tokens = tokenizeFilterText(trimmedText);
  const terms = tokens.map((token) => {
    if (FIELD_TOKEN_PATTERN.test(token) && !/^[a-zA-Z]+:\/\//.test(token)) {
      const separatorIndex = token.indexOf(":");
      const field = token.slice(0, separatorIndex);
      const rawValue = stripWrappingQuotes(token.slice(separatorIndex + 1));
      return {
        type: "field",
        field,
        filterPattern: analyzeFilterPattern(rawValue),
      };
    }

    return {
      type: "global",
      filterPattern: analyzeFilterPattern(stripWrappingQuotes(token)),
    };
  });

  return {
    mode: "query",
    terms,
  };
};

export const analyzeFilterFeedback = (text = "") => {
  const parsedQuery = parseFilterQuery(text);

  if (parsedQuery.mode === "empty") {
    return {
      mode: "empty",
      usesFieldSearch: false,
      hasRegex: false,
      error: null,
    };
  }

  const invalidRegexTerm = parsedQuery.terms.find(
    (term) => term.filterPattern.mode === "invalid-regex"
  );

  if (invalidRegexTerm) {
    return {
      mode: "invalid-regex",
      usesFieldSearch: parsedQuery.terms.some((term) => term.type === "field"),
      hasRegex: true,
      error: invalidRegexTerm.filterPattern.error,
    };
  }

  return {
    mode: "query",
    usesFieldSearch: parsedQuery.terms.some((term) => term.type === "field"),
    hasRegex: parsedQuery.terms.some(
      (term) => term.filterPattern.mode === "regex"
    ),
    error: null,
  };
};

const normalizeFilterValue = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const getNestedValueByPath = (value, pathSegments) => {
  const searchableValue = toSearchableStructure(value);

  if (!pathSegments.length) {
    return searchableValue;
  }

  let currentValue = searchableValue;
  for (const segment of pathSegments) {
    if (
      currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue) &&
      Object.prototype.hasOwnProperty.call(currentValue, segment)
    ) {
      currentValue = currentValue[segment];
      continue;
    }

    return undefined;
  }

  return currentValue;
};

const findValuesByFieldName = (value, fieldName, results = []) => {
  const searchableValue = toSearchableStructure(value);

  if (!searchableValue || typeof searchableValue !== "object") {
    return results;
  }

  if (Array.isArray(searchableValue)) {
    searchableValue.forEach((item) => findValuesByFieldName(item, fieldName, results));
    return results;
  }

  Object.entries(searchableValue).forEach(([key, childValue]) => {
    if (key === fieldName) {
      results.push(childValue);
    }
    findValuesByFieldName(childValue, fieldName, results);
  });

  return results;
};

const collectFieldValues = (target, fieldPath) => {
  const pathSegments = fieldPath.split(".").filter(Boolean);
  if (pathSegments.length === 0) {
    return [];
  }

  const candidates = [target, target?.data, target?.protobufDecoded];
  const values = [];

  candidates.forEach((candidate) => {
    const exactValue = getNestedValueByPath(candidate, pathSegments);
    if (exactValue !== undefined) {
      values.push(exactValue);
    }
  });

  if (pathSegments.length === 1) {
    candidates.forEach((candidate) => {
      findValuesByFieldName(candidate, pathSegments[0], values);
    });
  }

  const uniqueValues = [];
  const seenValues = new Set();

  values.forEach((value) => {
    const key = normalizeFilterValue(value);
    if (!seenValues.has(key)) {
      seenValues.add(key);
      uniqueValues.push(value);
    }
  });

  return uniqueValues;
};

const matchesFilterPattern = (value, filterPattern) => {
  if (filterPattern.mode === "empty") {
    return true;
  }

  const normalizedValue = normalizeFilterValue(value);

  if (filterPattern.mode === "regex") {
    filterPattern.regex.lastIndex = 0;
    return filterPattern.regex.test(normalizedValue);
  }

  if (filterPattern.mode === "invalid-regex") {
    return false;
  }

  return normalizedValue.toLowerCase().includes(filterPattern.text);
};

const matchesMessageFilter = (message, text = "") => {
  const parsedQuery = parseFilterQuery(text);

  if (parsedQuery.mode === "empty") {
    return true;
  }

  return parsedQuery.terms.every((term) => {
    if (term.type === "field") {
      const fieldValues = collectFieldValues(message, term.field);
      if (fieldValues.length === 0) {
        return false;
      }

      return fieldValues.some((value) =>
        matchesFilterPattern(value, term.filterPattern)
      );
    }

    return [message.data, message.protobufDecoded].some(
      (value) =>
        value !== undefined &&
        value !== null &&
        matchesFilterPattern(value, term.filterPattern)
    );
  });
};

export const filterMessages = (messages, filters) => {
  const { direction = "all", text = "", invert = false } = filters;

  return (
    messages
      .filter((msg) => {
        // Direction filter
        if (direction !== "all" && msg.direction !== direction) {
          return false;
        }

        // Text content filter
        if (text.trim()) {
          const matchesText = matchesMessageFilter(msg, text);

          // Apply invert logic
          if (invert) {
            return !matchesText; // Show messages that DON'T contain the text
          } else {
            return matchesText; // Show messages that DO contain the text
          }
        }

        return true;
      })
      // Remove duplicates using Set for O(n) performance
      .filter((msg, index, arr) => {
        if (index === 0) {
          arr._seenKeys = new Set();
        }
        const key = `${msg.timestamp}|${msg.data}|${msg.direction}`;
        if (arr._seenKeys.has(key)) {
          return false;
        }
        arr._seenKeys.add(key);
        return true;
      })
      // Sort by timestamp (newest first)
      .sort((a, b) => b.timestamp - a.timestamp)
  );
};

/**
 * Filter connections based on URL and invert option
 * @param {Array} connections - Array of connection objects
 * @param {Object} filters - Filter configuration
 * @param {string} filters.text - Text to filter by
 * @param {boolean} filters.invert - Whether to invert the filter
 * @returns {Array} Filtered connections
 */
export const filterConnections = (connections, filters) => {
  const { text = "", invert = false } = filters;
  const parsedQuery = parseFilterQuery(text);

  if (parsedQuery.mode === "empty") {
    return connections;
  }

  return connections.filter((conn) => {
    const matches = parsedQuery.terms.every((term) => {
      if (term.type === "field") {
        const fieldValues = collectFieldValues(conn, term.field);
        if (fieldValues.length === 0) {
          return false;
        }

        return fieldValues.some((value) =>
          matchesFilterPattern(value, term.filterPattern)
        );
      }

      return [conn.url, conn.id].some((value) =>
        matchesFilterPattern(value, term.filterPattern)
      );
    });

    return invert ? !matches : matches;
  });
};
