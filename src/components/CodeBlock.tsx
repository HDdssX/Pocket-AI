import { memo, useEffect, useMemo, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  code: string;
  language?: string;
  deferHighlight?: boolean;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  csharp: 'csharp',
  cs: 'csharp',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  css: 'css',
  go: 'go',
  golang: 'go',
  html: 'xml',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  json: 'json',
  kotlin: 'kotlin',
  kt: 'kotlin',
  py: 'python',
  python: 'python',
  rs: 'rust',
  rust: 'rust',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  sql: 'sql',
  ts: 'typescript',
  typescript: 'typescript',
  yaml: 'yaml',
  yml: 'yaml',
};

function normalizeLanguage(language?: string): string {
  const compact = (language || '').trim().toLowerCase().replace(/^language-/, '');
  if (!compact) {
    return 'text';
  }
  return LANGUAGE_ALIASES[compact] ?? compact;
}

function displayLanguage(language: string): string {
  const labels: Record<string, string> = {
    bash: 'Bash',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    css: 'CSS',
    go: 'Go',
    html: 'HTML',
    java: 'Java',
    javascript: 'JavaScript',
    json: 'JSON',
    kotlin: 'Kotlin',
    python: 'Python',
    rust: 'Rust',
    sql: 'SQL',
    text: 'Text',
    typescript: 'TypeScript',
    xml: 'HTML',
    yaml: 'YAML',
  };
  return labels[language] ?? language.toUpperCase();
}

function inferLanguage(code: string, language?: string): string {
  const explicit = normalizeLanguage(language);
  if (explicit !== 'text') {
    return explicit;
  }

  const trimmed = code.trim();
  if (!trimmed) return 'text';
  if (/^\s*[{[]/.test(trimmed) && /[}\]]\s*$/.test(trimmed)) return 'json';
  if (/^\s*<(!doctype|html|div|span|script|style|[a-z][\w-]*[\s>])/i.test(trimmed)) return 'xml';
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/i.test(trimmed)) return 'sql';
  if (/^\s*(package\s+main|func\s+\w+\s*\()/m.test(trimmed)) return 'go';
  if (/^\s*(fn\s+\w+|let\s+mut|use\s+std::)/m.test(trimmed)) return 'rust';
  if (/^\s*(fun\s+\w+|val\s+\w+|var\s+\w+|class\s+\w+)/m.test(trimmed)) return 'kotlin';
  if (/^\s*(public\s+class|class\s+\w+|import\s+java\.)/m.test(trimmed)) return 'java';
  if (/^\s*(def\s+\w+|import\s+\w+|from\s+\w+\s+import|print\()/m.test(trimmed)) return 'python';
  if (/^\s*(const|let|var|function|import\s+.*from|export\s+)/m.test(trimmed)) return 'javascript';
  if (/^\s*(interface|type\s+\w+\s*=|enum\s+\w+)/m.test(trimmed)) return 'typescript';
  if (/^\s*(npm|npx|yarn|pnpm|git|cd|curl|adb|\$|export\s+|set\s+)/im.test(trimmed)) return 'bash';
  if (/^\s*[\w.-]+:\s+/m.test(trimmed)) return 'yaml';
  if (/[.#][\w-]+\s*\{[\s\S]*\}/.test(trimmed)) return 'css';
  return 'text';
}

export function normalizeCodeLanguage(language?: string): string {
  return normalizeLanguage(language);
}

function PlainCode({ code }: { code: string }) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.codeScroll}
      contentContainerStyle={styles.codeScrollContent}
    >
      <Text selectable style={styles.plainCode}>
        {code || ' '}
      </Text>
    </ScrollView>
  );
}

function CodeBlockComponent({ code, language }: Props) {
  const [copied, setCopied] = useState(false);
  const normalizedCode = code.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  const resolvedLanguage = useMemo(
    () => inferLanguage(normalizedCode, language),
    [language, normalizedCode]
  );

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyCode() {
    if (!normalizedCode.trim()) return;
    await Clipboard.setStringAsync(normalizedCode);
    setCopied(true);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.language} numberOfLines={1} ellipsizeMode="tail">
          {displayLanguage(resolvedLanguage)}
        </Text>
        <Pressable style={styles.copyButton} onPress={copyCode} accessibilityRole="button">
          <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
      <PlainCode code={normalizedCode} />
    </View>
  );
}

export const CodeBlock = memo(CodeBlockComponent);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minWidth: 240,
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: '#0B1220',
    marginTop: 4,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  language: {
    flexShrink: 1,
    marginRight: 12,
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '800',
  },
  copyButton: {
    flexShrink: 0,
    minHeight: 30,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  copyText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
  },
  codeScroll: {
    maxWidth: '100%',
    backgroundColor: '#0B1220',
  },
  codeScrollContent: {
    flexGrow: 0,
  },
  plainCode: {
    color: '#E5E7EB',
    backgroundColor: '#0B1220',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    includeFontPadding: false,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 40,
  },
});
