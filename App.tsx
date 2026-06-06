import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Animated,
  Appearance,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeEventEmitter,
  NativeModules,
  PanResponder,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type {
  AlertButton,
  ColorSchemeName,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponderGestureState,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Camera,
  Edit3,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Menu,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Send,
  Settings,
  Square,
  Trash2,
  X,
} from 'lucide-react-native';

import { MessageBubble } from './src/components/MessageBubble';
import {
  captureImageAttachment,
  clearAllAttachmentFiles,
  deleteAttachmentRecords,
  pickDocumentAttachments,
  pickImageAttachments,
  persistSharedImageAttachments,
  sweepOrphanedAttachments,
} from './src/lib/files';
import type { SharedImageInput } from './src/lib/files';
import { makeId } from './src/lib/ids';
import {
  API_PRESETS,
  API_PROTOCOL_OPTIONS,
  apiProtocolLabel,
  classifyModel,
  DEFAULT_LANGUAGE,
  DEFAULT_PROFILE,
  getEndpointHint,
  getModelHint,
  getProtocolStorageHint,
  getReasoningEffortHint,
  modelSupportsReasoning,
  MODEL_SUGGESTIONS,
  REASONING_EFFORT_OPTIONS,
} from './src/lib/models';
import {
  createAssistantTurn,
  createConversationTitle,
  fetchAvailableModels,
  getApiErrorMessage,
  getApiErrorStatus,
  testApiConnection,
} from './src/lib/openai';
import {
  clearPersistedState,
  deleteApiKey,
  deleteProfileApiKey,
  EMPTY_STATE,
  loadProfileApiKey,
  migrateLegacyApiKey,
  loadPersistedState,
  saveProfileApiKey,
  savePersistedState,
} from './src/lib/storage';
import type {
  ApiProfile,
  AttachmentRecord,
  ChatMessage,
  ChatMessageVariant,
  ConversationRecord,
  PendingAttachment,
  PersistedState,
  ReasoningEffort,
  ThemeMode,
  UiLanguage,
} from './src/types';
import { getContentPlugins } from './src/plugins';

type LanguageCopy = {
  eyebrow: string;
  title: string;
  settings: string;
  settingsTitle: string;
  settingsSubtitle: string;
  back: string;
  generalSection: string;
  apiSection: string;
  recordsSection: string;
  storageSection: string;
  apiProfilesTitle: string;
  apiProfilesSubtitle: string;
  manageApiProfiles: string;
  newApiProfile: string;
  activeApiProfile: string;
  selectedApiProfile: string;
  deleteApiProfile: string;
  deleteApiProfileTitle: string;
  deleteApiProfileMessage: string;
  cannotDeleteOnlyApiProfile: string;
  testApiConnection: string;
  testingApiConnection: string;
  testConnectionSuccessTitle: string;
  testConnectionSuccessMessage: (latencyMs: number, endpoint: string, sampleText: string) => string;
  testConnectionFailedTitle: string;
  privacySection: string;
  localStorageTitle: string;
  localStorageDescription: string;
  pluginsSection: string;
  pluginsTitle: string;
  pluginsDescription: string;
  aboutSection: string;
  createdBy: string;
  themeSection: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  versionLabel: string;
  checkLatestVersion: string;
  checkingLatestVersion: string;
  latestVersionTitle: string;
  latestVersionCurrent: string;
  latestVersionAvailable: (version: string) => string;
  latestVersionFailedTitle: string;
  latestVersionFailedMessage: string;
  github: string;
  blog: string;
  email: string;
  language: string;
  chinese: string;
  english: string;
  openSessions: string;
  newSession: string;
  currentSession: string;
  noSession: string;
  localEncrypted: string;
  directApi: string;
  modelHintLabel: string;
  activeModel: string;
  switchModel: string;
  modelPickerTitle: string;
  fetchModels: string;
  fetchingModels: string;
  modelsEmpty: string;
  modelsFetchFailed: string;
  basicApiSettings: string;
  advancedApiSettings: string;
  showAdvancedSettings: string;
  hideAdvancedSettings: string;
  currentValue: string;
  profileLabel: string;
  apiPreset: string;
  endpointMode: string;
  baseUrl: string;
  baseUrlHint: string;
  advancedConfigHint: string;
  insecureHttpWarning: string;
  apiKey: string;
  model: string;
  reasoningEffort: string;
  fetchReasoningEfforts: string;
  reasoningEffortsReady: string;
  reasoningEffortsUnavailable: string;
  reasoningEffortCustomPlaceholder: string;
  reasoningEffortInvalid: string;
  responseStorage: string;
  storageEnabled: string;
  storageDisabled: string;
  projectId: string;
  organization: string;
  systemPrompt: string;
  clearLocalData: string;
  clearLocalHint: string;
  close: string;
  save: string;
  saving: string;
  sessionsTitle: string;
  sessionsEmpty: string;
  sessionSearchPlaceholder: string;
  sessionsNoMatches: string;
  renameSession: string;
  renameSessionTitle: string;
  renameSessionPlaceholder: string;
  exportSession: string;
  copiedSessionExport: string;
  selectSessions: string;
  cancelSelection: string;
  copySelectedSessions: string;
  deleteSelectedSessions: string;
  selectedSessionsCount: (count: number) => string;
  selectedSessionsDeleteMessage: (count: number) => string;
  expandComposer: string;
  done: string;
  delete: string;
  deleteSessionTitle: string;
  deleteSessionMessage: string;
  clearDataTitle: string;
  clearDataMessage: string;
  cancel: string;
  clear: string;
  composerPlaceholder: string;
  attachMenu: string;
  camera: string;
  image: string;
  file: string;
  send: string;
  sending: string;
  queuedAttachments: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  noActiveSessionTitle: string;
  noActiveSessionBody: string;
  imagePickerFailed: string;
  imagePickerFailedFallback: string;
  filePickerFailed: string;
  filePickerFailedFallback: string;
  apiKeyRequiredTitle: string;
  apiKeyRequiredMessage: string;
  sendFailed: string;
  stopGenerating: string;
  generationStopped: string;
  apiErrorNetwork: string;
  apiErrorUnauthorized: string;
  apiErrorForbidden: string;
  apiErrorNotFound: string;
  apiErrorRateLimited: string;
  apiErrorBadRequest: string;
  apiErrorServer: string;
  apiErrorTimeout: string;
  apiErrorRawPrefix: string;
  clearFailed: string;
  clearFailedFallback: string;
  loading: string;
  sessionCount: (count: number) => string;
  sessionMeta: (model: string, count: number) => string;
};

type SharedImageNativeModule = {
  getInitialImages?: () => Promise<SharedImageInput[]>;
  clear?: () => void;
};

function getSharedImageUri(input: SharedImageInput): string {
  return typeof input === 'string' ? input : input.uri;
}

const COPY: Record<UiLanguage, LanguageCopy> = {
  zh: {
    eyebrow: '本地优先 AI 聊天',
    title: 'Pocket AI',
    settings: '设置',
    settingsTitle: '设置',
    settingsSubtitle: '管理语言、会话和 API 配置。密钥只保存在本机。',
    back: '返回',
    generalSection: '通用',
    apiSection: 'API 配置',
    recordsSection: '聊天记录',
    storageSection: '聊天记录存储',
    apiProfilesTitle: 'API 配置',
    apiProfilesSubtitle: '可以保存多个 API 配置，点完成会自动保存并作为当前聊天使用。',
    manageApiProfiles: '管理 API 配置',
    newApiProfile: '新增配置',
    activeApiProfile: '当前使用',
    selectedApiProfile: '正在编辑',
    deleteApiProfile: '删除配置',
    deleteApiProfileTitle: '删除 API 配置？',
    deleteApiProfileMessage: '这会删除该配置和它保存的 API key，不会删除聊天记录。',
    cannotDeleteOnlyApiProfile: '至少需要保留一个 API 配置。',
    testApiConnection: '测试连接',
    testingApiConnection: '测试中...',
    testConnectionSuccessTitle: '连接可用',
    testConnectionSuccessMessage: (latencyMs, endpoint, sampleText) =>
      `接口已响应，用时 ${latencyMs}ms。\n\n${endpoint}${sampleText ? `\n\n返回示例：${sampleText}` : ''}`,
    testConnectionFailedTitle: '连接测试失败',
    privacySection: '隐私与本地数据',
    localStorageTitle: '聊天记录保存位置',
    localStorageDescription:
      '聊天记录、会话列表和 API 配置会加密后保存在本机应用私有存储（AsyncStorage: ai-chat-pocket.state.v1）。加密密钥和 API key 保存在系统 SecureStore/Keystore；导入的附件会复制到应用私有文件目录。卸载应用或清空本地数据会删除这些内容。',
    pluginsSection: '插件',
    pluginsTitle: '内置内容插件',
    pluginsDescription: '插件会在消息显示前做轻量处理，例如用 KaTeX 保留 LaTeX/密码学公式的字体和版式。',
    aboutSection: '关于',
    createdBy: '共创维护',
    themeSection: '外观',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '跟随系统',
    versionLabel: '当前版本',
    checkLatestVersion: '检查最新版本',
    checkingLatestVersion: '检查中...',
    latestVersionTitle: '版本检查',
    latestVersionCurrent: '已是最新版本。',
    latestVersionAvailable: (version) => `发现新版本：${version}`,
    latestVersionFailedTitle: '检查失败',
    latestVersionFailedMessage: '无法从 GitHub 获取最新版本信息。',
    github: 'GitHub',
    blog: '博客',
    email: '邮箱',
    language: '界面语言',
    chinese: '中文',
    english: 'English',
    openSessions: '管理会话',
    newSession: '新建会话',
    currentSession: '当前会话',
    noSession: '暂无会话',
    localEncrypted: '本地加密',
    directApi: '直连 API',
    modelHintLabel: '模型说明',
    activeModel: '当前模型',
    switchModel: '切换模型',
    modelPickerTitle: '选择模型',
    fetchModels: '重新获取模型',
    fetchingModels: '获取中...',
    modelsEmpty: '暂无可选模型，请先获取或手动输入。',
    modelsFetchFailed: '获取模型失败',
    basicApiSettings: '常用配置',
    advancedApiSettings: '高级配置',
    showAdvancedSettings: '展开高级配置',
    hideAdvancedSettings: '收起高级配置',
    currentValue: '当前',
    profileLabel: '配置名称',
    apiPreset: '服务商预设',
    endpointMode: '接口类型',
    baseUrl: 'Base URL',
    baseUrlHint: '这里只填 API 根地址，接口类型会决定自动拼接 `/responses` 或 `/chat/completions`。',
    advancedConfigHint:
      'Project ID 和 Organization 是 OpenAI 账号/项目路由字段，DeepSeek 一般留空。系统提示词会作为长期规则随上下文发送，例如：“你是我的中文学习助手，回答先给结论，再给例子。”',
    insecureHttpWarning: '当前使用的是 HTTP。API key、消息和附件不会经过 TLS 加密，建议网关支持后切换到 HTTPS。',
    apiKey: 'API Key',
    model: '模型',
    reasoningEffort: '推理强度',
    fetchReasoningEfforts: '获取推理强度',
    reasoningEffortsReady: '已根据当前接口和模型更新可选推理强度。',
    reasoningEffortsUnavailable: '当前模型未识别到推理强度参数，建议保持关闭。',
    reasoningEffortCustomPlaceholder: '输入其他值，如 medium/high',
    reasoningEffortInvalid: '无效推理强度，未应用。',
    responseStorage: '服务端响应存储',
    storageEnabled: '开启',
    storageDisabled: '关闭',
    projectId: 'Project ID',
    organization: 'Organization',
    systemPrompt: '系统提示词',
    clearLocalData: '清空本地数据',
    clearLocalHint: '会删除本机保存的 API key、加密后的会话记录、复制的附件以及本地状态。',
    close: '关闭',
    save: '保存',
    saving: '保存中...',
    sessionsTitle: '会话',
    sessionsEmpty: '还没有保存的会话。',
    sessionSearchPlaceholder: '搜索会话或消息...',
    sessionsNoMatches: '没有匹配的会话。',
    renameSession: '重命名',
    renameSessionTitle: '重命名会话',
    renameSessionPlaceholder: '输入新的会话名称',
    exportSession: '复制导出',
    copiedSessionExport: '已复制为 Markdown。',
    selectSessions: '选择',
    cancelSelection: '取消选择',
    copySelectedSessions: '复制所选',
    deleteSelectedSessions: '删除所选',
    selectedSessionsCount: (count) => `已选 ${count} 个`,
    selectedSessionsDeleteMessage: (count) => `确定删除选中的 ${count} 个会话？`,
    expandComposer: '大屏编辑',
    done: '完成',
    delete: '删除',
    deleteSessionTitle: '删除会话？',
    deleteSessionMessage: '这会删除该会话的本地消息记录，以及为它复制到应用目录里的附件。',
    clearDataTitle: '清空全部本地数据？',
    clearDataMessage: '这会删除保存的 API key、本地聊天记录、复制的附件和加密状态。',
    cancel: '取消',
    clear: '清空',
    composerPlaceholder: '问点什么...',
    attachMenu: '添加附件',
    camera: '拍照',
    image: '图片',
    file: '文件',
    send: '发送',
    sending: '发送中...',
    queuedAttachments: '待发送附件',
    emptyStateTitle: '开始对话',
    emptyStateBody: '支持文本、图片和文件输入。会话历史保存在本机，可随时管理 API 配置和本地会话。',
    noActiveSessionTitle: '还没有激活会话',
    noActiveSessionBody: '先新建一个会话，保存 API key，然后就可以开始聊天。',
    imagePickerFailed: '选择图片失败',
    imagePickerFailedFallback: '无法读取所选图片。',
    filePickerFailed: '选择文件失败',
    filePickerFailedFallback: '无法读取所选文件。',
    apiKeyRequiredTitle: '需要 API key',
    apiKeyRequiredMessage: '请先在设置里保存 API key。',
    sendFailed: '发送失败',
    stopGenerating: '停止生成',
    generationStopped: '已停止生成。',
    apiErrorNetwork: '网络请求失败。请检查手机网络、Base URL、代理或网关证书。',
    apiErrorUnauthorized: '鉴权失败。请检查 API key 是否正确，是否属于当前服务商或项目。',
    apiErrorForbidden: '当前账号或项目没有权限访问这个模型/接口。',
    apiErrorNotFound: '接口或模型不存在。请检查 Base URL、接口类型和模型名称。',
    apiErrorRateLimited: '请求过于频繁或额度不足。请稍后重试，或检查账号额度。',
    apiErrorBadRequest: '请求参数不兼容。请检查接口类型、模型名称、附件类型和推理强度。',
    apiErrorServer: '服务端暂时不可用。请稍后重试，或切换到其他配置。',
    apiErrorTimeout: '请求超时。请检查网络，或换用更快的模型/网关。',
    apiErrorRawPrefix: '原始错误',
    clearFailed: '清空失败',
    clearFailedFallback: '无法清空本地数据。',
    loading: '正在载入本地聊天数据...',
    sessionCount: (count) => `${count} 个会话`,
    sessionMeta: (model, count) => `${model} | ${count} 条消息`,
  },
  en: {
    eyebrow: 'LOCAL-FIRST AI CHAT',
    title: 'Pocket AI',
    settings: 'Settings',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage language, sessions, and API configuration. Your key stays on this device.',
    back: 'Back',
    generalSection: 'General',
    apiSection: 'API Configuration',
    recordsSection: 'Chat History',
    storageSection: 'Chat Storage',
    apiProfilesTitle: 'API Profiles',
    apiProfilesSubtitle: 'Save multiple API profiles. Done saves and applies the edited profile automatically.',
    manageApiProfiles: 'Manage API profiles',
    newApiProfile: 'New profile',
    activeApiProfile: 'Current',
    selectedApiProfile: 'Editing',
    deleteApiProfile: 'Delete profile',
    deleteApiProfileTitle: 'Delete API profile?',
    deleteApiProfileMessage: 'This deletes the profile and its saved API key, but keeps chat history.',
    cannotDeleteOnlyApiProfile: 'Keep at least one API profile.',
    testApiConnection: 'Test connection',
    testingApiConnection: 'Testing...',
    testConnectionSuccessTitle: 'Connection works',
    testConnectionSuccessMessage: (latencyMs, endpoint, sampleText) =>
      `Endpoint responded in ${latencyMs}ms.\n\n${endpoint}${sampleText ? `\n\nSample: ${sampleText}` : ''}`,
    testConnectionFailedTitle: 'Connection test failed',
    privacySection: 'Privacy & Local Data',
    localStorageTitle: 'Where chats are stored',
    localStorageDescription:
      'Chats, sessions, and API profiles are encrypted into this app private storage (AsyncStorage: ai-chat-pocket.state.v1). The encryption key and API keys are stored in system SecureStore/Keystore; imported attachments are copied into the app private file directory. Uninstalling the app or clearing local data removes them.',
    pluginsSection: 'Plugins',
    pluginsTitle: 'Built-in content plugins',
    pluginsDescription: 'Plugins lightly transform messages before display, such as preserving LaTeX and cryptography formula typography with KaTeX.',
    aboutSection: 'About',
    createdBy: 'Co-maintainers',
    themeSection: 'Appearance',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    versionLabel: 'Current version',
    checkLatestVersion: 'Check latest version',
    checkingLatestVersion: 'Checking...',
    latestVersionTitle: 'Version check',
    latestVersionCurrent: 'You are on the latest version.',
    latestVersionAvailable: (version) => `New version available: ${version}`,
    latestVersionFailedTitle: 'Check failed',
    latestVersionFailedMessage: 'Unable to fetch the latest version from GitHub.',
    github: 'GitHub',
    blog: 'Blog',
    email: 'Email',
    language: 'Interface language',
    chinese: 'Chinese',
    english: 'English',
    openSessions: 'Manage sessions',
    newSession: 'New session',
    currentSession: 'Current session',
    noSession: 'No active session',
    localEncrypted: 'Local encrypted',
    directApi: 'Direct API',
    modelHintLabel: 'Model notes',
    activeModel: 'Active model',
    switchModel: 'Switch model',
    modelPickerTitle: 'Choose model',
    fetchModels: 'Refetch models',
    fetchingModels: 'Fetching...',
    modelsEmpty: 'No models yet. Fetch models or type one manually.',
    modelsFetchFailed: 'Unable to fetch models',
    basicApiSettings: 'Basic settings',
    advancedApiSettings: 'Advanced settings',
    showAdvancedSettings: 'Show advanced settings',
    hideAdvancedSettings: 'Hide advanced settings',
    currentValue: 'Current',
    profileLabel: 'Profile label',
    apiPreset: 'Provider preset',
    endpointMode: 'Endpoint mode',
    baseUrl: 'Base URL',
    baseUrlHint: 'Enter only the API root. The endpoint mode decides whether `/responses` or `/chat/completions` is appended.',
    advancedConfigHint:
      'Project ID and Organization are OpenAI account/project routing fields; leave them empty for DeepSeek. The system prompt is sent as a long-lived rule, for example: "You are my Chinese learning assistant. Answer with a short conclusion, then examples."',
    insecureHttpWarning: 'You are using HTTP. Your API key, messages, and attachments are not protected by TLS. Switch to HTTPS when your gateway supports it.',
    apiKey: 'API key',
    model: 'Model',
    reasoningEffort: 'Reasoning effort',
    fetchReasoningEfforts: 'Fetch efforts',
    reasoningEffortsReady: 'Reasoning effort choices were updated for this endpoint and model.',
    reasoningEffortsUnavailable: 'No reasoning effort parameter was detected for this model. Keep it off.',
    reasoningEffortCustomPlaceholder: 'Enter another value, e.g. medium/high',
    reasoningEffortInvalid: 'Invalid reasoning effort. Not applied.',
    responseStorage: 'Server response storage',
    storageEnabled: 'Enabled',
    storageDisabled: 'Disabled',
    projectId: 'Project ID',
    organization: 'Organization',
    systemPrompt: 'System prompt',
    clearLocalData: 'Clear all local data',
    clearLocalHint: 'This removes the saved API key, encrypted chat history, copied attachments, and local app state.',
    close: 'Close',
    save: 'Save',
    saving: 'Saving...',
    sessionsTitle: 'Sessions',
    sessionsEmpty: 'No saved sessions yet.',
    sessionSearchPlaceholder: 'Search sessions or messages...',
    sessionsNoMatches: 'No matching sessions.',
    renameSession: 'Rename',
    renameSessionTitle: 'Rename session',
    renameSessionPlaceholder: 'Enter a new session name',
    exportSession: 'Copy export',
    copiedSessionExport: 'Copied as Markdown.',
    selectSessions: 'Select',
    cancelSelection: 'Cancel selection',
    copySelectedSessions: 'Copy selected',
    deleteSelectedSessions: 'Delete selected',
    selectedSessionsCount: (count) => `${count} selected`,
    selectedSessionsDeleteMessage: (count) => `Delete ${count} selected sessions?`,
    expandComposer: 'Expand editor',
    done: 'Done',
    delete: 'Delete',
    deleteSessionTitle: 'Delete session?',
    deleteSessionMessage: 'This removes the local messages and copied attachments for this session.',
    clearDataTitle: 'Clear all local data?',
    clearDataMessage: 'This deletes the saved API key, local chat history, copied attachments, and encrypted state on this device.',
    cancel: 'Cancel',
    clear: 'Clear',
    composerPlaceholder: 'Ask anything...',
    attachMenu: 'Add attachment',
    camera: 'Camera',
    image: 'Image',
    file: 'File',
    send: 'Send',
    sending: 'Sending...',
    queuedAttachments: 'Queued attachments',
    emptyStateTitle: 'Start chatting',
    emptyStateBody: 'Use text, images, or files. Chat history stays on-device, with local session and API profile management.',
    noActiveSessionTitle: 'No active session',
    noActiveSessionBody: 'Create a session, save an API key, and start chatting.',
    imagePickerFailed: 'Image picker failed',
    imagePickerFailedFallback: 'Unable to read the selected image.',
    filePickerFailed: 'File picker failed',
    filePickerFailedFallback: 'Unable to read the selected file.',
    apiKeyRequiredTitle: 'API key required',
    apiKeyRequiredMessage: 'Save your API key in settings first.',
    sendFailed: 'Send failed',
    stopGenerating: 'Stop generating',
    generationStopped: 'Generation stopped.',
    apiErrorNetwork: 'Network request failed. Check phone connectivity, Base URL, proxy, or gateway certificate.',
    apiErrorUnauthorized: 'Authentication failed. Check that the API key matches this provider and project.',
    apiErrorForbidden: 'This account or project cannot access the selected model or endpoint.',
    apiErrorNotFound: 'Endpoint or model not found. Check Base URL, endpoint mode, and model name.',
    apiErrorRateLimited: 'Too many requests or insufficient quota. Try later or check account quota.',
    apiErrorBadRequest: 'Request parameters are incompatible. Check endpoint mode, model name, attachments, and reasoning effort.',
    apiErrorServer: 'The provider is temporarily unavailable. Try later or switch profiles.',
    apiErrorTimeout: 'Request timed out. Check the network, or use a faster model/gateway.',
    apiErrorRawPrefix: 'Raw error',
    clearFailed: 'Clear failed',
    clearFailedFallback: 'Unable to clear local data.',
    loading: 'Loading local chat vault...',
    sessionCount: (count) => `${count} sessions`,
    sessionMeta: (model, count) => `${model} | ${count} messages`,
  },
};

const STREAMING_FLUSH_INTERVAL_MS = 220;
const STREAMING_SCROLL_INTERVAL_MS = 260;
const CHAT_BOTTOM_FOLLOW_THRESHOLD = 96;
const APP_VERSION = '1.1.0';
const LATEST_RELEASE_URL = 'https://api.github.com/repos/HDdssX/Pocket-AI/releases/latest';
const DRAWER_SWIPE_SLOPE = 0.35;
const DRAWER_SWIPE_MIN_DISTANCE = 5;
const SESSION_CLOSE_SWIPE_SLOPE = 0.08;
const SESSION_CLOSE_SWIPE_MIN_DISTANCE = 1;
const COMPOSER_VISIBLE_BOTTOM_GAP = 8;

type SettingsSection = 'root' | 'api' | 'language' | 'theme' | 'records' | 'storage' | 'plugins' | 'about';

type SlideFadePresenceProps = {
  children: ReactNode;
  distance?: number;
  from?: 'top' | 'bottom';
  style?: StyleProp<ViewStyle>;
  visible: boolean;
};

function isLooseDirectionalSwipe(
  gestureState: PanResponderGestureState,
  direction: 'left' | 'right',
  minDistance = DRAWER_SWIPE_MIN_DISTANCE
): boolean {
  const signedDx = direction === 'right' ? gestureState.dx : -gestureState.dx;
  if (signedDx < minDistance) {
    return false;
  }

  const absX = Math.abs(gestureState.dx);
  const absY = Math.abs(gestureState.dy);
  return absX > absY * DRAWER_SWIPE_SLOPE || Math.abs(gestureState.vx) > 0.14;
}

function isLooseDirectionalDelta(
  dx: number,
  dy: number,
  direction: 'left' | 'right',
  minDistance = DRAWER_SWIPE_MIN_DISTANCE
): boolean {
  const signedDx = direction === 'right' ? dx : -dx;
  if (signedDx < minDistance) {
    return false;
  }

  return Math.abs(dx) > Math.abs(dy) * DRAWER_SWIPE_SLOPE;
}

function isSensitiveSessionCloseSwipe(gestureState: PanResponderGestureState): boolean {
  const signedDx = -gestureState.dx;
  if (signedDx < SESSION_CLOSE_SWIPE_MIN_DISTANCE) {
    return false;
  }

  const absX = Math.abs(gestureState.dx);
  const absY = Math.abs(gestureState.dy);
  return absX > absY * SESSION_CLOSE_SWIPE_SLOPE || signedDx > 4 || Math.abs(gestureState.vx) > 0.03;
}

function isSensitiveSessionCloseDelta(dx: number, dy: number): boolean {
  const signedDx = -dx;
  if (signedDx < SESSION_CLOSE_SWIPE_MIN_DISTANCE) {
    return false;
  }

  return Math.abs(dx) > Math.abs(dy) * SESSION_CLOSE_SWIPE_SLOPE || signedDx > 4;
}

function SlideFadePresence({
  children,
  distance = 14,
  from = 'bottom',
  style,
  visible,
}: SlideFadePresenceProps) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    let active = true;
    if (visible) {
      setMounted(true);
    }

    const start = () => {
      progress.stopAnimation();
      Animated.timing(progress, {
        toValue: visible ? 1 : 0,
        duration: visible ? 180 : 130,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (active && finished && !visible) {
          setMounted(false);
        }
      });
    };

    if (visible) {
      requestAnimationFrame(start);
    } else {
      start();
    }

    return () => {
      active = false;
      progress.stopAnimation();
    };
  }, [progress, visible]);

  if (!mounted) {
    return null;
  }

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [from === 'top' ? -distance : distance, 0],
  });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

type AppTheme = {
  scheme: 'light' | 'dark';
  gradient: readonly [string, string, string];
  statusBar: 'dark-content' | 'light-content';
  text: string;
  muted: string;
  subtle: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  strong: string;
  primary: string;
  primarySoft: string;
  dangerSoft: string;
  divider: string;
  input: string;
  placeholder: string;
  userBubble: string;
  userBorder: string;
};

const LIGHT_THEME: AppTheme = {
  scheme: 'light',
  gradient: ['#FFFFFF', '#F6F8FB', '#EEF3F8'],
  statusBar: 'dark-content',
  text: '#111827',
  muted: '#64748B',
  subtle: '#334155',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#D8E0EA',
  strong: '#111827',
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  dangerSoft: '#FEF2F2',
  divider: '#E6ECF2',
  input: '#FFFFFF',
  placeholder: '#78869D',
  userBubble: '#DBEAFE',
  userBorder: '#93C5FD',
};

const DARK_THEME: AppTheme = {
  scheme: 'dark',
  gradient: ['#0B1020', '#111827', '#172033'],
  statusBar: 'light-content',
  text: '#E5E7EB',
  muted: '#94A3B8',
  subtle: '#CBD5E1',
  surface: '#111827',
  surfaceAlt: '#1F2937',
  border: '#334155',
  strong: '#F8FAFC',
  primary: '#60A5FA',
  primarySoft: '#172554',
  dangerSoft: '#3F1D24',
  divider: '#334155',
  input: '#111827',
  placeholder: '#94A3B8',
  userBubble: '#1E3A8A',
  userBorder: '#2563EB',
};

function resolveTheme(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): AppTheme {
  const scheme = mode === 'system' ? systemScheme ?? 'light' : mode;
  return scheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

function compareVersions(first: string, second: string): number {
  const a = first.replace(/^v/i, '').split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const b = second.replace(/^v/i, '').split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index++) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function normalizeSystemColorScheme(value: ColorSchemeName | null | undefined): 'light' | 'dark' | null {
  return value === 'dark' || value === 'light' ? value : null;
}

function createConversation(profile: ApiProfile, defaultTitle: string): ConversationRecord {
  const now = new Date().toISOString();
  return {
    id: makeId('conversation'),
    title: defaultTitle,
    model: profile.model,
    assistantKind: classifyModel(profile.model),
    createdAt: now,
    updatedAt: now,
    pinned: false,
    previousResponseId: null,
    messages: [],
  };
}

function trimTitle(value: string, defaultTitle: string): string {
  const compact = value.trim().replace(/\s+/g, ' ');
  if (!compact) return defaultTitle;
  return compact.length > 36 ? `${compact.slice(0, 36)}...` : compact;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function upsertConversation(
  conversations: ConversationRecord[],
  conversation: ConversationRecord
): ConversationRecord[] {
  const next = conversations.filter((item) => item.id !== conversation.id);
  return [conversation, ...next];
}

function sortConversationsForList(conversations: ConversationRecord[]): ConversationRecord[] {
  return [...conversations].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function getConversationAttachments(conversation: ConversationRecord): AttachmentRecord[] {
  return conversation.messages.flatMap((message) => message.attachments);
}

function getAllConversationAttachments(conversations: ConversationRecord[]): AttachmentRecord[] {
  return conversations.flatMap(getConversationAttachments);
}

function normalizeMessageVariants(message: ChatMessage, assistantMessage?: ChatMessage): ChatMessageVariant[] {
  const existing = message.variants && message.variants.length > 0
    ? message.variants
    : [
        {
          id: makeId('variant'),
          text: message.text,
          createdAt: message.createdAt,
          attachments: message.attachments,
          assistantMessageId: assistantMessage?.id,
          assistantText: assistantMessage?.text,
          assistantResponseId: assistantMessage?.responseId,
          assistantError: assistantMessage?.error,
        },
      ];

  const activeIndex = Math.min(Math.max(message.activeVariantIndex ?? 0, 0), existing.length - 1);
  const normalized = [...existing];
  normalized[activeIndex] = {
    ...normalized[activeIndex],
    text: message.text,
    createdAt: message.createdAt,
    attachments: message.attachments,
    assistantMessageId: assistantMessage?.id ?? normalized[activeIndex].assistantMessageId,
    assistantText: assistantMessage?.text ?? normalized[activeIndex].assistantText,
    assistantResponseId: assistantMessage?.responseId ?? normalized[activeIndex].assistantResponseId,
    assistantError: assistantMessage?.error ?? normalized[activeIndex].assistantError,
  };
  return normalized;
}

function sanitizeProfile(profile: ApiProfile): ApiProfile {
  const model = profile.model.trim() || DEFAULT_PROFILE.model;
  const reasoningEffort = profile.reasoningEffort ?? DEFAULT_PROFILE.reasoningEffort;
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    id: profile.id || makeId('profile'),
    label: profile.label.trim() || DEFAULT_PROFILE.label,
    apiProtocol: profile.apiProtocol ?? DEFAULT_PROFILE.apiProtocol,
    baseUrl: profile.baseUrl.trim() || DEFAULT_PROFILE.baseUrl,
    model,
    projectId: profile.projectId.trim(),
    organization: profile.organization.trim(),
    systemPrompt: profile.systemPrompt.trim(),
    reasoningEffort,
    cachedModels: uniqueStrings([model, ...(profile.cachedModels ?? [])]),
    cachedReasoningEfforts: uniqueStrings([reasoningEffort, ...(profile.cachedReasoningEfforts ?? [])]) as ReasoningEffort[],
  };
}

function getActiveProfile(state: PersistedState): ApiProfile {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) ?? state.profile;
}

function upsertProfile(profiles: ApiProfile[], profile: ApiProfile): ApiProfile[] {
  const exists = profiles.some((item) => item.id === profile.id);
  if (!exists) {
    return [...profiles, profile];
  }
  return profiles.map((item) => (item.id === profile.id ? profile : item));
}

function applyApiPreset(profile: ApiProfile, preset: (typeof API_PRESETS)[number]): ApiProfile {
  return {
    ...profile,
    apiProtocol: preset.apiProtocol,
    baseUrl: preset.baseUrl,
    model: preset.model,
    storeResponses: preset.storeResponses,
    reasoningEffort: preset.reasoningEffort,
    cachedModels: [preset.model],
    cachedReasoningEfforts: [preset.reasoningEffort],
    projectId: preset.id === 'deepseek' ? '' : profile.projectId,
    organization: preset.id === 'deepseek' ? '' : profile.organization,
  };
}

function inferReasoningEffortOptions(profile: ApiProfile): ReasoningEffort[] {
  const model = profile.model.trim().toLowerCase();
  if (!modelSupportsReasoning(profile.model)) {
    return ['none'];
  }

  if (profile.apiProtocol === 'chatCompletions') {
    if (model.startsWith('deepseek-v4') || model === 'deepseek-reasoner') {
      return ['none', 'high', 'xhigh'];
    }
    return ['none'];
  }

  if (model.startsWith('gpt-5') || /^o\d/.test(model)) {
    return REASONING_EFFORT_OPTIONS;
  }

  return ['none'];
}

function getCachedModelsForProfile(profile: ApiProfile): string[] {
  return uniqueStrings([profile.model, ...(profile.cachedModels ?? [])]);
}

function getCachedReasoningEffortsForProfile(profile: ApiProfile): ReasoningEffort[] {
  return uniqueStrings([profile.reasoningEffort, ...(profile.cachedReasoningEfforts ?? [])]) as ReasoningEffort[];
}

function profileHasAdvancedValues(profile: ApiProfile): boolean {
  return (
    profile.projectId.trim().length > 0 ||
    profile.organization.trim().length > 0 ||
    profile.systemPrompt.trim().length > 0 ||
    profile.storeResponses
  );
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function conversationMatchesQuery(conversation: ConversationRecord, query: string): boolean {
  if (!query) {
    return true;
  }

  const searchable = [
    conversation.title,
    conversation.model,
    ...conversation.messages.map((message) => message.text),
    ...conversation.messages.flatMap((message) => message.attachments.map((attachment) => attachment.name)),
  ]
    .join('\n')
    .toLowerCase();

  return searchable.includes(query);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatRelativeTime(value: string, language: UiLanguage): string {
  const date = new Date(value);
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return value;
  }

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) {
    return language === 'zh' ? '刚刚' : 'Just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return language === 'zh' ? `${minutes}分钟前` : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return language === 'zh' ? `${hours}小时前` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return language === 'zh' ? `${days}天前` : `${days}d ago`;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatConversationMarkdown(conversation: ConversationRecord): string {
  const lines = [
    `# ${conversation.title}`,
    '',
    `- Model: ${conversation.model}`,
    `- Created: ${formatDateTime(conversation.createdAt)}`,
    `- Updated: ${formatDateTime(conversation.updatedAt)}`,
    '',
  ];

  for (const message of conversation.messages) {
    lines.push(`## ${message.role === 'user' ? 'User' : 'Assistant'} - ${formatDateTime(message.createdAt)}`);
    lines.push('');
    lines.push(message.text.trim() || '(empty)');
    if (message.error) {
      lines.push('');
      lines.push(`Error: ${message.error}`);
    }
    if (message.attachments.length > 0) {
      lines.push('');
      lines.push('Attachments:');
      for (const attachment of message.attachments) {
        lines.push(`- ${attachment.kind}: ${attachment.name}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

function MenuIcon({ color = '#1F2937' }: { color?: string }) {
  return <Menu size={20} color={color} strokeWidth={2.3} />;
}

function PlusIcon({ light = false, color }: { light?: boolean; color?: string }) {
  return <Plus size={20} color={color ?? (light ? '#FFFFFF' : '#1F2937')} strokeWidth={2.4} />;
}

function MoreIcon({ color = '#1F2937' }: { color?: string }) {
  return <MoreHorizontal size={21} color={color} strokeWidth={2.4} />;
}

function SearchIcon({ color = '#111827' }: { color?: string }) {
  return <Search size={20} color={color} strokeWidth={2.3} />;
}

function SettingsIcon({ color = '#111827' }: { color?: string }) {
  return <Settings size={20} color={color} strokeWidth={2.3} />;
}

function DirectionIcon({ direction, light = false, color: iconColor }: { direction: 'up' | 'down' | 'left' | 'right'; light?: boolean; color?: string }) {
  const color = iconColor ?? (light ? '#FFFFFF' : '#334155');
  if (direction === 'left') return <ChevronLeft size={18} color={color} strokeWidth={2.5} />;
  if (direction === 'right') return <ChevronRight size={18} color={color} strokeWidth={2.5} />;
  return <ChevronUp size={18} color={color} strokeWidth={2.5} style={direction === 'down' ? styles.iconRotateDown : undefined} />;
}

function SendIcon({ light = true }: { light?: boolean }) {
  return <Send size={16} color={light ? '#FFFFFF' : '#2563EB'} strokeWidth={2.4} />;
}

function StopIcon() {
  return <Square size={13} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.2} />;
}

function CheckIcon() {
  return <Check size={15} color="#FFFFFF" strokeWidth={3} />;
}

function PinIcon({ light = false }: { light?: boolean }) {
  return <Pin size={16} color={light ? '#E5E7EB' : '#2563EB'} strokeWidth={2.4} />;
}

function EditIcon() {
  return <Edit3 size={17} color="#E5E7EB" strokeWidth={2.3} />;
}

function TrashIcon() {
  return <Trash2 size={17} color="#FCA5A5" strokeWidth={2.3} />;
}

function GitHubIcon({ color = '#24292F' }: { color?: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 98 96" fill="none">
      <Path
        fill={color}
        d="M48.9 0C21.9 0 0 22 0 49.1c0 21.7 14 40 33.4 46.5 2.4.5 3.3-1.1 3.3-2.4v-8.4c-13.6 3-16.5-6.6-16.5-6.6-2.2-5.7-5.4-7.2-5.4-7.2-4.4-3 .3-2.9.3-2.9 4.9.3 7.5 5.1 7.5 5.1 4.3 7.5 11.4 5.3 14.2 4.1.4-3.2 1.7-5.3 3.1-6.6-10.9-1.2-22.3-5.5-22.3-24.3 0-5.4 1.9-9.8 5-13.2-.5-1.2-2.2-6.2.5-13 0 0 4.1-1.3 13.4 5 3.9-1.1 8.1-1.6 12.3-1.6s8.4.6 12.3 1.6c9.3-6.3 13.4-5 13.4-5 2.7 6.8 1 11.8.5 13 3.1 3.4 5 7.8 5 13.2 0 18.9-11.5 23.1-22.4 24.3 1.8 1.5 3.3 4.5 3.3 9.1v13.4c0 1.3.9 2.9 3.4 2.4C84 89.1 98 70.7 98 49.1 97.9 22 75.9 0 48.9 0Z"
      />
    </Svg>
  );
}

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const composerDockRef = useRef<View>(null);
  const composerLiftFrameRef = useRef<number | null>(null);
  const composerKeyboardResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composerLiftTranslateY = useRef(new Animated.Value(0)).current;
  const composerLiftAnimationIdRef = useRef(0);
  const composerLiftMeasureIdRef = useRef(0);
  const composerAutoLiftTargetRef = useRef(0);
  const composerAutoLiftCurrentRef = useRef(0);
  const keyboardVisibleRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const autoFollowScrollRef = useRef(true);
  const skipNextPersistRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef('');
  const streamingFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingConversationIdRef = useRef<string | null>(null);
  const regenerateAssistantMessageRef = useRef<(messageId: string) => void>(() => undefined);
  const handledSharedImageUrisRef = useRef(new Set<string>());
  const sessionDrawerTranslateX = useRef(new Animated.Value(-Math.max(1, Math.min(windowWidth, 520)))).current;
  const sessionDrawerHiddenOffsetRef = useRef(360);
  const sessionDrawerAnimationIdRef = useRef(0);
  const sessionDrawerClosingRef = useRef(false);
  const sessionDrawerCloseFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerGestureOpeningRef = useRef(false);
  const settingsPanelTranslateX = useRef(new Animated.Value(0)).current;
  const settingsContentProgress = useRef(new Animated.Value(1)).current;
  const settingsContentAnimationIdRef = useRef(0);
  const settingsPanelHiddenOffsetRef = useRef(360);
  const settingsPanelAnimationIdRef = useRef(0);
  const settingsPanelCloseFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsReturnTargetRef = useRef<'chat' | 'drawer'>('chat');
  const settingsTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const settingsTouchHasClosedRef = useRef(false);
  const sessionTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const sessionTouchActiveRef = useRef(false);
  const sessionTouchLastDxRef = useRef(0);
  const bottomSheetTranslateY = useRef(new Animated.Value(420)).current;
  const bottomSheetBackdropOpacity = useRef(new Animated.Value(0)).current;
  const bottomSheetAnimationIdRef = useRef(0);
  const bottomSheetCloseFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSheetContentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [persisted, setPersisted] = useState<PersistedState>(EMPTY_STATE);
  const [apiKey, setApiKey] = useState('');
  const [draftProfile, setDraftProfile] = useState<ApiProfile>(DEFAULT_PROFILE);
  const [composerText, setComposerText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [testingProfile, setTestingProfile] = useState(false);
  const [sending, setSending] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatMenuVisible, setChatMenuVisible] = useState(false);
  const [sessionsVisible, setSessionsVisible] = useState(false);
  const [apiProfilesVisible, setApiProfilesVisible] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [bottomSheetMode, setBottomSheetMode] = useState<'models' | 'profiles' | null>(null);
  const [bottomSheetContentReady, setBottomSheetContentReady] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [checkingVersion, setCheckingVersion] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark' | null>(() =>
    normalizeSystemColorScheme(Appearance.getColorScheme())
  );
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('root');
  const [settingsContentMotion, setSettingsContentMotion] = useState<'forward' | 'back' | 'rootEnter'>('forward');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [sessionSearchVisible, setSessionSearchVisible] = useState(false);
  const [sessionSearchRaised, setSessionSearchRaised] = useState(false);
  const [sessionSelectionMode, setSessionSelectionMode] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [sessionContextMenuId, setSessionContextMenuId] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [draftSessionTitle, setDraftSessionTitle] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [advancedApiSettingsOpen, setAdvancedApiSettingsOpen] = useState(false);
  const [reasoningEffortOptions, setReasoningEffortOptions] = useState<ReasoningEffort[]>(['none']);
  const [reasoningEffortsFetched, setReasoningEffortsFetched] = useState(false);
  const handleRegenerateMessage = useCallback((messageId: string) => {
    regenerateAssistantMessageRef.current(messageId);
  }, []);

  const uiLanguage = persisted.uiLanguage;
  const copy = COPY[uiLanguage];
  const theme = resolveTheme(persisted.themeMode, systemColorScheme);
  const isDark = theme.scheme === 'dark';
  const activeProfile = getActiveProfile(persisted);
  const activeConversation =
    persisted.conversations.find((item) => item.id === persisted.activeConversationId) ?? null;
  const activeLastMessage = activeConversation?.messages[activeConversation.messages.length - 1] ?? null;
  const activeLastMessageTextLength = activeLastMessage?.text.length ?? 0;
  const normalizedSessionSearch = normalizeSearchText(sessionSearchQuery);
  const sortedConversations = sortConversationsForList(persisted.conversations);
  const visibleConversations = sortedConversations.filter((conversation) =>
    conversationMatchesQuery(conversation, normalizedSessionSearch)
  );
  const renamingConversation =
    persisted.conversations.find((conversation) => conversation.id === renamingConversationId) ?? null;
  const sessionContextConversation =
    persisted.conversations.find((conversation) => conversation.id === sessionContextMenuId) ?? null;
  const sessionDrawerWidth = Math.max(1, Math.min(windowWidth, 520));
  sessionDrawerHiddenOffsetRef.current = sessionDrawerWidth;
  settingsPanelHiddenOffsetRef.current = Math.max(windowWidth, 320);
  const sessionDrawerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          isSensitiveSessionCloseSwipe(gestureState),
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isSensitiveSessionCloseSwipe(gestureState),
        onPanResponderGrant: () => {
          sessionDrawerTranslateX.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          sessionDrawerTranslateX.setValue(
            Math.max(-sessionDrawerHiddenOffsetRef.current, Math.min(0, gestureState.dx))
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -SESSION_CLOSE_SWIPE_MIN_DISTANCE || gestureState.vx < -0.03) {
            closeSessionsDrawer();
            return;
          }
          Animated.timing(sessionDrawerTranslateX, {
            toValue: 0,
            duration: 170,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.timing(sessionDrawerTranslateX, {
            toValue: 0,
            duration: 170,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [sessionDrawerTranslateX, windowWidth]
  );
  const chatOpenDrawerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (sessionsVisible || settingsVisible || apiProfilesVisible || modelPickerVisible || chatMenuVisible) {
            return false;
          }
          return isLooseDirectionalSwipe(gestureState, 'right', 7);
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (sessionsVisible || settingsVisible || apiProfilesVisible || modelPickerVisible || chatMenuVisible) {
            return false;
          }
          return isLooseDirectionalSwipe(gestureState, 'right', 7);
        },
        onPanResponderGrant: () => {
          drawerGestureOpeningRef.current = true;
          sessionDrawerTranslateX.stopAnimation();
          setSessionsVisible(true);
          sessionDrawerTranslateX.setValue(-sessionDrawerHiddenOffsetRef.current);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = Math.min(0, -sessionDrawerHiddenOffsetRef.current + Math.max(0, gestureState.dx));
          sessionDrawerTranslateX.setValue(nextX);
        },
        onPanResponderRelease: (_, gestureState) => {
          drawerGestureOpeningRef.current = false;
          if (gestureState.dx > windowWidth * 0.14 || gestureState.vx > 0.38) {
            openSessionsDrawer();
            return;
          }
          closeSessionsDrawer();
        },
        onPanResponderTerminate: () => {
          drawerGestureOpeningRef.current = false;
          closeSessionsDrawer();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [
      apiProfilesVisible,
      chatMenuVisible,
      modelPickerVisible,
      sessionDrawerTranslateX,
      sessionsVisible,
      settingsVisible,
      windowWidth,
    ]
  );
  const chatSceneTranslateX = sessionDrawerTranslateX.interpolate({
    inputRange: [-sessionDrawerWidth, 0],
    outputRange: [0, sessionDrawerWidth],
    extrapolate: 'clamp',
  });
  const settingsContentTranslateX = settingsContentProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [settingsContentMotion === 'rootEnter' ? -28 : 34, 0],
    extrapolate: 'clamp',
  });
  const androidStatusInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const compactWindow = windowHeight < 560;
  const topBarExtraInset = Platform.OS === 'android' ? Math.max(androidStatusInset + 8, compactWindow ? 18 : 32) : 12;
  const modalTopInset = Platform.OS === 'android' ? Math.max(androidStatusInset + 12, compactWindow ? 24 : 36) : 12;
  const drawerTopInset = Platform.OS === 'android' ? Math.max(androidStatusInset + 24, compactWindow ? 38 : 52) : 22;
  const composerLineCount = composerText.split('\n').length;
  const composerNeedsExpand = composerText.length >= 220 || composerLineCount >= 7;
  const composerSingleLine = composerLineCount <= 1 && composerText.length < 40;
  const composerBottomInset = Platform.OS === 'android' ? (compactWindow ? 4 : 8) : 10;
  const sessionSearchNeedsRaise = sessionSearchQuery.length > 28 || sessionSearchQuery.includes('\n');
  const sessionSearchIsRaised = sessionSearchRaised && sessionSearchNeedsRaise;
  const drawerBlankSwipeFooterHeight = visibleConversations.length < 6 ? Math.max(180, windowHeight * 0.28) : 56;
  const renderDrawerSession = useCallback(
    ({ item: conversation }: { item: ConversationRecord }) => {
      const active = conversation.id === activeConversation?.id;
      const selected = selectedSessionIds.includes(conversation.id);
      return (
        <Pressable
          style={[
            styles.drawerSessionItem,
            active && styles.drawerSessionItemActive,
            selected && [styles.drawerSessionItemSelected, { backgroundColor: theme.primarySoft }],
            { borderBottomColor: active ? theme.primary : theme.divider },
          ]}
          onPress={() => openConversation(conversation.id)}
          onLongPress={() => {
            if (!sessionSelectionMode) {
              setSessionContextMenuId(conversation.id);
            }
          }}
          delayLongPress={320}
        >
          <View style={styles.drawerSessionMain}>
            {sessionSelectionMode && (
              <View style={[styles.sessionSelectMark, { backgroundColor: theme.surface, borderColor: theme.border }, selected && styles.sessionSelectMarkActive]}>
                {selected && <CheckIcon />}
              </View>
            )}
            <View style={styles.sessionMeta}>
              <View style={styles.drawerSessionTitleRow}>
                {conversation.pinned && <PinIcon />}
                <Text style={[styles.drawerSessionTitle, { color: theme.text }]} numberOfLines={1}>
                  {conversation.title}
                </Text>
                <Text style={[styles.drawerSessionTime, { color: theme.muted }]} numberOfLines={1}>
                  {formatRelativeTime(conversation.updatedAt, uiLanguage)}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [activeConversation?.id, selectedSessionIds, sessionSelectionMode, theme.border, theme.divider, theme.muted, theme.primary, theme.primarySoft, theme.surface, theme.text, uiLanguage]
  );

  useEffect(() => {
    (async () => {
      const state = await loadPersistedState();
      const key = await migrateLegacyApiKey(state.activeProfileId);
      setPersisted(state);
      setDraftProfile(getActiveProfile(state));
      setApiKey(key);
      sweepOrphanedAttachments(getAllConversationAttachments(state.conversations)).catch(() => undefined);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    savePersistedState(persisted).catch(() => undefined);
  }, [persisted, ready]);

  useEffect(() => {
    if (!ready || persisted.conversations.length === 0) {
      return;
    }
    if (
      persisted.activeConversationId &&
      persisted.conversations.some((conversation) => conversation.id === persisted.activeConversationId)
    ) {
      return;
    }

    setPersisted((current) => {
      if (
        current.conversations.length === 0 ||
        (current.activeConversationId &&
          current.conversations.some((conversation) => conversation.id === current.activeConversationId))
      ) {
        return current;
      }
      const newest = [...current.conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      return {
        ...current,
        activeConversationId: newest.id,
      };
    });
  }, [persisted.activeConversationId, persisted.conversations, ready]);

  useEffect(() => {
    if (!sessionsVisible) {
      return;
    }
    if (drawerGestureOpeningRef.current) {
      return;
    }
    openSessionsDrawer();
  }, [sessionDrawerTranslateX, sessionsVisible, windowWidth]);

  useEffect(() => {
    if (sessionsVisible || drawerGestureOpeningRef.current) {
      return;
    }
    sessionDrawerTranslateX.setValue(-sessionDrawerHiddenOffsetRef.current);
  }, [sessionDrawerTranslateX, sessionsVisible, windowWidth]);

  useEffect(() => {
    if (!settingsVisible) {
      return;
    }
    const hiddenOffset = settingsPanelHiddenOffsetRef.current;
    settingsPanelTranslateX.setValue(hiddenOffset);
    Animated.timing(settingsPanelTranslateX, {
      toValue: 0,
      duration: 190,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [settingsPanelTranslateX, settingsVisible, windowWidth]);

  useEffect(() => {
    if (!sessionSearchNeedsRaise && sessionSearchRaised) {
      setSessionSearchRaised(false);
    }
  }, [sessionSearchNeedsRaise, sessionSearchRaised]);

  useEffect(() => {
    const listenerId = composerLiftTranslateY.addListener(({ value }) => {
      composerAutoLiftCurrentRef.current = Math.max(0, -value);
    });
    return () => {
      composerLiftTranslateY.removeListener(listenerId);
      composerLiftTranslateY.stopAnimation();
    };
  }, [composerLiftTranslateY]);

  useEffect(() => {
    updateComposerAutoLift();
  }, [
    attachmentMenuVisible,
    composerLineCount,
    composerText.length,
    pendingAttachments.length,
    windowHeight,
    windowWidth,
  ]);

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
      keyboardVisibleRef.current = true;
      if (composerKeyboardResetTimerRef.current) {
        clearTimeout(composerKeyboardResetTimerRef.current);
        composerKeyboardResetTimerRef.current = null;
      }
      updateComposerAutoLift();
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      resetComposerAutoLift();
      composerKeyboardResetTimerRef.current = setTimeout(() => {
        composerKeyboardResetTimerRef.current = null;
        resetComposerAutoLift();
      }, 180);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [
    attachmentMenuVisible,
    composerLineCount,
    composerText.length,
    pendingAttachments.length,
    windowHeight,
    windowWidth,
  ]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) {
      return;
    }
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: !sending });
    });
    shouldScrollToBottomRef.current = false;
  }, [
    activeConversation?.id,
    activeConversation?.messages.length,
    activeLastMessage?.id,
    activeLastMessageTextLength,
    pendingAttachments.length,
    settingsVisible,
    sessionsVisible,
    apiProfilesVisible,
  ]);

  useEffect(
    () => () => {
      if (streamingFlushTimerRef.current) {
        clearTimeout(streamingFlushTimerRef.current);
      }
      if (streamingScrollTimerRef.current) {
        clearTimeout(streamingScrollTimerRef.current);
      }
      if (sessionDrawerCloseFallbackRef.current) {
        clearTimeout(sessionDrawerCloseFallbackRef.current);
      }
      if (settingsPanelCloseFallbackRef.current) {
        clearTimeout(settingsPanelCloseFallbackRef.current);
      }
      if (bottomSheetCloseFallbackRef.current) {
        clearTimeout(bottomSheetCloseFallbackRef.current);
      }
      if (bottomSheetContentTimerRef.current) {
        clearTimeout(bottomSheetContentTimerRef.current);
      }
      if (composerLiftFrameRef.current !== null) {
        cancelAnimationFrame(composerLiftFrameRef.current);
        composerLiftFrameRef.current = null;
      }
      if (composerKeyboardResetTimerRef.current) {
        clearTimeout(composerKeyboardResetTimerRef.current);
        composerKeyboardResetTimerRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(normalizeSystemColorScheme(colorScheme));
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!ready || Platform.OS !== 'android') return;
    const sharedImageModule = NativeModules.SharedImage as SharedImageNativeModule | undefined;
    if (!sharedImageModule) return;

    let mounted = true;
    const appendSharedImages = async (inputs: SharedImageInput[]) => {
      const nextInputs = inputs.filter((input) => {
        const uri = getSharedImageUri(input);
        if (!uri || handledSharedImageUrisRef.current.has(uri)) {
          return false;
        }
        handledSharedImageUrisRef.current.add(uri);
        return true;
      });
      if (nextInputs.length === 0) {
        return;
      }

      try {
        const attachments = await persistSharedImageAttachments(nextInputs);
        if (mounted && attachments.length > 0) {
          setPendingAttachments((current) => [...current, ...attachments]);
        }
      } catch (error) {
        if (mounted) {
          Alert.alert(copy.imagePickerFailed, error instanceof Error ? error.message : copy.imagePickerFailedFallback);
        }
      } finally {
        sharedImageModule.clear?.();
      }
    };

    sharedImageModule
      .getInitialImages?.()
      .then((images) => {
        if (mounted && Array.isArray(images)) {
          void appendSharedImages(images);
        }
      })
      .catch(() => undefined);

    const emitter = new NativeEventEmitter(NativeModules.SharedImage);
    const subscription = emitter.addListener('SharedImages', (images: SharedImageInput[]) => {
      if (Array.isArray(images)) {
        void appendSharedImages(images);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [copy.imagePickerFailed, copy.imagePickerFailedFallback, ready]);

  function updateConversations(nextConversations: ConversationRecord[], nextActiveId: string | null) {
    shouldScrollToBottomRef.current = true;
    autoFollowScrollRef.current = true;
    setPersisted((current) => ({
      ...current,
      conversations: nextConversations,
      activeConversationId: nextActiveId,
    }));
  }

  function isChatScrollNearBottom(metrics: NativeScrollEvent): boolean {
    const visibleBottom = metrics.contentOffset.y + metrics.layoutMeasurement.height;
    return visibleBottom >= metrics.contentSize.height - CHAT_BOTTOM_FOLLOW_THRESHOLD;
  }

  function handleChatScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    autoFollowScrollRef.current = isChatScrollNearBottom(event.nativeEvent);
  }

  function animateComposerAutoLiftTo(nextLift: number, force = false) {
    const normalizedLift = Math.max(0, Math.round(nextLift));
    const animationId = composerLiftAnimationIdRef.current + 1;
    if (
      !force &&
      Math.abs(normalizedLift - composerAutoLiftTargetRef.current) <= 1 &&
      Math.abs(normalizedLift - composerAutoLiftCurrentRef.current) <= 1
    ) {
      return;
    }

    composerLiftAnimationIdRef.current = animationId;
    composerAutoLiftTargetRef.current = normalizedLift;
    composerLiftTranslateY.stopAnimation((value) => {
      if (animationId !== composerLiftAnimationIdRef.current) {
        return;
      }
      composerAutoLiftCurrentRef.current = Math.max(0, -value);
      if (!force && Math.abs(normalizedLift - composerAutoLiftCurrentRef.current) <= 1) {
        composerLiftTranslateY.setValue(-normalizedLift);
        composerAutoLiftCurrentRef.current = normalizedLift;
        return;
      }
      Animated.timing(composerLiftTranslateY, {
        toValue: -normalizedLift,
        duration: normalizedLift === 0 ? 190 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (
          finished &&
          animationId === composerLiftAnimationIdRef.current &&
          Math.abs(normalizedLift - composerAutoLiftTargetRef.current) <= 1
        ) {
          composerLiftTranslateY.setValue(-normalizedLift);
          composerAutoLiftCurrentRef.current = normalizedLift;
        }
      });
    });
  }

  function resetComposerAutoLift() {
    keyboardVisibleRef.current = false;
    composerLiftMeasureIdRef.current += 1;
    if (composerLiftFrameRef.current !== null) {
      cancelAnimationFrame(composerLiftFrameRef.current);
      composerLiftFrameRef.current = null;
    }
    if (composerKeyboardResetTimerRef.current) {
      clearTimeout(composerKeyboardResetTimerRef.current);
      composerKeyboardResetTimerRef.current = null;
    }
    animateComposerAutoLiftTo(0, true);
  }

  function updateComposerAutoLift() {
    if (!keyboardVisibleRef.current) {
      resetComposerAutoLift();
      return;
    }

    if (composerLiftFrameRef.current !== null) {
      cancelAnimationFrame(composerLiftFrameRef.current);
    }

    const measureId = composerLiftMeasureIdRef.current + 1;
    composerLiftMeasureIdRef.current = measureId;
    composerLiftFrameRef.current = requestAnimationFrame(() => {
      composerLiftFrameRef.current = null;
      if (!keyboardVisibleRef.current || measureId !== composerLiftMeasureIdRef.current) {
        return;
      }
      composerDockRef.current?.measureInWindow((_x, y, _width, height) => {
        if (!keyboardVisibleRef.current || measureId !== composerLiftMeasureIdRef.current) {
          return;
        }
        const desiredGap = compactWindow ? Math.max(4, COMPOSER_VISIBLE_BOTTOM_GAP - 3) : COMPOSER_VISIBLE_BOTTOM_GAP;
        const bottomGap = windowHeight - (y + height);
        const currentLift = composerAutoLiftCurrentRef.current;
        const maxLift = Math.max(0, Math.round(windowHeight * 0.35));
        const nextLift = Math.min(maxLift, Math.max(0, Math.round(currentLift + desiredGap - bottomGap)));
        animateComposerAutoLiftTo(nextLift, nextLift === 0);
      });
    });
  }

  function ensureConversation(): ConversationRecord {
    if (activeConversation) {
      return activeConversation;
    }

    const created = createConversation(activeProfile, copy.newSession);
    updateConversations([created, ...persisted.conversations], created.id);
    return created;
  }

  async function openSettings(returnTarget: 'chat' | 'drawer' = 'chat') {
    setChatMenuVisible(false);
    const animationId = settingsPanelAnimationIdRef.current + 1;
    settingsPanelAnimationIdRef.current = animationId;
    if (settingsPanelCloseFallbackRef.current) {
      clearTimeout(settingsPanelCloseFallbackRef.current);
      settingsPanelCloseFallbackRef.current = null;
    }
    settingsPanelTranslateX.stopAnimation();
    settingsContentProgress.stopAnimation();
    settingsContentProgress.setValue(1);
    setSettingsContentMotion('forward');
    settingsReturnTargetRef.current = returnTarget;
    setDraftProfile(activeProfile);
    resetApiProfileEditor(activeProfile);
    setSettingsSection('root');
    setSettingsVisible(true);
    setApiKey(await loadProfileApiKey(activeProfile.id));
  }

  function closeSettingsPanel(options: { returnToDrawer?: boolean } = {}) {
    const canReturnToDrawer = options.returnToDrawer ?? true;
    const animationId = settingsPanelAnimationIdRef.current + 1;
    settingsPanelAnimationIdRef.current = animationId;
    if (settingsPanelCloseFallbackRef.current) {
      clearTimeout(settingsPanelCloseFallbackRef.current);
    }
    settingsPanelTranslateX.stopAnimation();
    const finishClose = () => {
      if (settingsPanelAnimationIdRef.current !== animationId) {
        return;
      }
      if (settingsPanelCloseFallbackRef.current) {
        clearTimeout(settingsPanelCloseFallbackRef.current);
        settingsPanelCloseFallbackRef.current = null;
      }
      const shouldReturnToDrawer = canReturnToDrawer && settingsReturnTargetRef.current === 'drawer';
      if (shouldReturnToDrawer) {
        setSessionsVisible(true);
      }
      setSettingsVisible(false);
      setSettingsSection('root');
      settingsContentProgress.setValue(1);
      setSettingsContentMotion('forward');
      settingsReturnTargetRef.current = 'chat';
    };
    settingsPanelCloseFallbackRef.current = setTimeout(finishClose, 260);
    Animated.timing(settingsPanelTranslateX, {
      toValue: settingsPanelHiddenOffsetRef.current,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(finishClose);
  }

  function animateSettingsContentIn(motion: 'forward' | 'rootEnter') {
    const animationId = settingsContentAnimationIdRef.current + 1;
    settingsContentAnimationIdRef.current = animationId;
    settingsContentProgress.stopAnimation();
    setSettingsContentMotion(motion);
    settingsContentProgress.setValue(0);
    requestAnimationFrame(() => {
      if (settingsContentAnimationIdRef.current !== animationId) {
        return;
      }
      Animated.timing(settingsContentProgress, {
        toValue: 1,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }

  function navigateToSettingsSection(section: SettingsSection) {
    if (settingsSection === section) {
      return;
    }
    setSettingsSection(section);
    animateSettingsContentIn(section === 'root' ? 'rootEnter' : 'forward');
  }

  function goBackFromSettings() {
    if (settingsSection !== 'root') {
      const animationId = settingsContentAnimationIdRef.current + 1;
      settingsContentAnimationIdRef.current = animationId;
      settingsContentProgress.stopAnimation();
      setSettingsContentMotion('back');
      Animated.timing(settingsContentProgress, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || settingsContentAnimationIdRef.current !== animationId) {
          return;
        }
        setSettingsSection('root');
        animateSettingsContentIn('rootEnter');
      });
      return;
    }
    closeSettingsPanel();
  }

  function openBottomSheet(mode: 'models' | 'profiles') {
    const animationId = bottomSheetAnimationIdRef.current + 1;
    bottomSheetAnimationIdRef.current = animationId;
    if (bottomSheetCloseFallbackRef.current) {
      clearTimeout(bottomSheetCloseFallbackRef.current);
      bottomSheetCloseFallbackRef.current = null;
    }
    if (bottomSheetContentTimerRef.current) {
      clearTimeout(bottomSheetContentTimerRef.current);
      bottomSheetContentTimerRef.current = null;
    }
    bottomSheetTranslateY.stopAnimation();
    bottomSheetBackdropOpacity.stopAnimation();
    bottomSheetTranslateY.setValue(Math.max(windowHeight, 420));
    bottomSheetBackdropOpacity.setValue(0);
    setBottomSheetContentReady(mode !== 'profiles');
    setBottomSheetMode(mode);
    setModelPickerVisible(mode === 'models');
    setApiProfilesVisible(mode === 'profiles');
    if (mode === 'profiles') {
      bottomSheetContentTimerRef.current = setTimeout(() => {
        if (bottomSheetAnimationIdRef.current === animationId) {
          setBottomSheetContentReady(true);
        }
        bottomSheetContentTimerRef.current = null;
      }, 210);
    }
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(bottomSheetBackdropOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bottomSheetTranslateY, {
          toValue: 0,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && bottomSheetAnimationIdRef.current === animationId) {
          bottomSheetTranslateY.setValue(0);
          bottomSheetBackdropOpacity.setValue(1);
        }
      });
    });
  }

  function closeBottomSheet(animate = true) {
    const animationId = bottomSheetAnimationIdRef.current + 1;
    bottomSheetAnimationIdRef.current = animationId;
    if (bottomSheetCloseFallbackRef.current) {
      clearTimeout(bottomSheetCloseFallbackRef.current);
    }
    if (bottomSheetContentTimerRef.current) {
      clearTimeout(bottomSheetContentTimerRef.current);
      bottomSheetContentTimerRef.current = null;
    }
    bottomSheetTranslateY.stopAnimation();
    bottomSheetBackdropOpacity.stopAnimation();
    const finishClose = () => {
      if (bottomSheetAnimationIdRef.current !== animationId) {
        return;
      }
      if (bottomSheetCloseFallbackRef.current) {
        clearTimeout(bottomSheetCloseFallbackRef.current);
        bottomSheetCloseFallbackRef.current = null;
      }
      bottomSheetTranslateY.setValue(Math.max(windowHeight, 420));
      bottomSheetBackdropOpacity.setValue(0);
      setBottomSheetMode(null);
      setModelPickerVisible(false);
      setApiProfilesVisible(false);
      setBottomSheetContentReady(true);
    };
    if (!animate) {
      finishClose();
      return;
    }
    bottomSheetCloseFallbackRef.current = setTimeout(finishClose, 260);
    Animated.parallel([
      Animated.timing(bottomSheetBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(bottomSheetTranslateY, {
        toValue: Math.max(windowHeight, 420),
        duration: 190,
        useNativeDriver: true,
      }),
    ]).start(finishClose);
  }

  function handleSettingsTouchStart(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    settingsTouchStartRef.current = { x: pageX, y: pageY };
    settingsTouchHasClosedRef.current = false;
  }

  function maybeNavigateSettingsFromTouch(event: GestureResponderEvent): boolean {
    const start = settingsTouchStartRef.current;
    if (!start || settingsTouchHasClosedRef.current) {
      return false;
    }

    const { pageX, pageY } = event.nativeEvent;
    const dx = pageX - start.x;
    const dy = pageY - start.y;
    if (!isLooseDirectionalDelta(dx, dy, 'right', 56)) {
      return false;
    }

    if (dx > 0) {
      settingsTouchHasClosedRef.current = true;
      goBackFromSettings();
      return true;
    }

    return false;
  }

  function handleSettingsTouchMove(event: GestureResponderEvent) {
    maybeNavigateSettingsFromTouch(event);
  }

  function handleSettingsTouchEnd() {
    settingsTouchStartRef.current = null;
    settingsTouchHasClosedRef.current = false;
  }

  function settleSessionDrawerAfterTouch() {
    if (!sessionTouchActiveRef.current) {
      return;
    }

    const shouldClose = sessionTouchLastDxRef.current < -SESSION_CLOSE_SWIPE_MIN_DISTANCE;
    if (shouldClose) {
      closeSessionsDrawer();
      return;
    }

    Animated.timing(sessionDrawerTranslateX, {
      toValue: 0,
      duration: 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function handleSessionTouchStart(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    sessionTouchStartRef.current = { x: pageX, y: pageY };
    sessionTouchActiveRef.current = false;
    sessionTouchLastDxRef.current = 0;
    sessionDrawerTranslateX.stopAnimation();
  }

  function handleSessionTouchMove(event: GestureResponderEvent) {
    const start = sessionTouchStartRef.current;
    if (!start) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const dx = pageX - start.x;
    const dy = pageY - start.y;
    if (!sessionTouchActiveRef.current && !isSensitiveSessionCloseDelta(dx, dy)) {
      return;
    }

    sessionTouchActiveRef.current = true;
    sessionTouchLastDxRef.current = dx;
    sessionDrawerTranslateX.setValue(Math.max(-sessionDrawerHiddenOffsetRef.current, Math.min(0, dx)));
  }

  function handleSessionTouchEnd() {
    settleSessionDrawerAfterTouch();
    sessionTouchStartRef.current = null;
    sessionTouchActiveRef.current = false;
    sessionTouchLastDxRef.current = 0;
  }

  function openApiProfiles() {
    const profile = activeProfile;
    setDraftProfile(profile);
    resetApiProfileEditor(profile);
    navigateToSettingsSection('api');
    loadProfileApiKey(profile.id).then(setApiKey).catch(() => setApiKey(''));
  }

  async function selectDraftApiProfile(profile: ApiProfile) {
    setDraftProfile(profile);
    setApiKey(await loadProfileApiKey(profile.id));
    resetApiProfileEditor(profile);
  }

  function createNewApiProfile() {
    const profile: ApiProfile = {
      ...DEFAULT_PROFILE,
      id: makeId('profile'),
      label: `${DEFAULT_PROFILE.label} ${persisted.profiles.length + 1}`,
    };
    setPersisted((current) => ({
      ...current,
      profiles: [...current.profiles, profile],
    }));
    setDraftProfile(profile);
    setApiKey('');
    resetApiProfileEditor(profile);
  }

  function applyUiLanguage(language: UiLanguage) {
    setPersisted((current) => ({
      ...current,
      uiLanguage: language,
    }));
  }

  function applyThemeMode(themeMode: ThemeMode) {
    setPersisted((current) => ({
      ...current,
      themeMode,
    }));
  }

  async function checkLatestVersion() {
    setCheckingVersion(true);
    try {
      const response = await fetch(LATEST_RELEASE_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub HTTP ${response.status}`);
      }
      const payload = await response.json() as { tag_name?: string; html_url?: string; name?: string };
      const latest = (payload.tag_name || payload.name || '').replace(/^v/i, '').trim();
      if (!latest) {
        throw new Error('No release tag');
      }
      if (compareVersions(latest, APP_VERSION) > 0) {
        const buttons: AlertButton[] = [{ text: copy.close, style: 'cancel' }];
        if (payload.html_url) {
          buttons.push({
            text: copy.github,
            onPress: () => openExternalUrl(payload.html_url as string),
          });
        }
        Alert.alert(copy.latestVersionTitle, copy.latestVersionAvailable(latest), buttons);
      } else {
        Alert.alert(copy.latestVersionTitle, `${copy.latestVersionCurrent}\n\n${copy.versionLabel}: v${APP_VERSION}`);
      }
    } catch {
      Alert.alert(copy.latestVersionFailedTitle, copy.latestVersionFailedMessage);
    } finally {
      setCheckingVersion(false);
    }
  }

  async function handleSaveApiProfile() {
    let profile = sanitizeProfile(draftProfile);
    setSavingProfile(true);
    try {
      const key = apiKey.trim();
      await saveProfileApiKey(profile.id, key);
      const nextReasoningEfforts = getCachedReasoningEffortsForProfile({
        ...profile,
        cachedReasoningEfforts: inferReasoningEffortOptions(profile),
      });
      profile = {
        ...profile,
        cachedReasoningEfforts: nextReasoningEfforts,
      };
      if (key) {
        try {
          const result = await fetchAvailableModels({ profile, apiKey: key });
          profile = {
            ...profile,
            cachedModels: uniqueStrings([profile.model, ...result.models]),
          };
        } catch {
          profile = {
            ...profile,
            cachedModels: getCachedModelsForProfile(profile),
          };
        }
      }
      setPersisted((current) => {
        const profiles = upsertProfile(current.profiles, profile);
        return {
          ...current,
          activeProfileId: profile.id,
          profiles,
          profile,
        };
      });
      setDraftProfile(profile);
      setAvailableModels(getCachedModelsForProfile(profile));
      setReasoningEffortOptions(getCachedReasoningEffortsForProfile(profile));
      closeBottomSheet();
    } finally {
      setSavingProfile(false);
    }
  }

  function resetApiProfileEditor(profile: ApiProfile) {
    setAdvancedApiSettingsOpen(profileHasAdvancedValues(profile));
    setAvailableModels(getCachedModelsForProfile(profile));
    setReasoningEffortOptions(getCachedReasoningEffortsForProfile(profile));
    setReasoningEffortsFetched(false);
  }

  function refreshReasoningEffortOptions(profile: ApiProfile = draftProfile) {
    const options = inferReasoningEffortOptions(profile);
    setReasoningEffortOptions(options);
    setReasoningEffortsFetched(true);
    setDraftProfile((current) => ({
      ...current,
      cachedReasoningEfforts: options,
    }));

    if (!options.includes(profile.reasoningEffort)) {
      setDraftProfile((current) => ({ ...current, reasoningEffort: options[0] ?? 'none' }));
    }
  }

  function updateDraftProfileWithReasoningReset(updater: (current: ApiProfile) => ApiProfile) {
    setReasoningEffortsFetched(false);
    setDraftProfile((current) => {
      const next = updater(current);
      return {
        ...next,
        cachedModels: getCachedModelsForProfile(next),
        cachedReasoningEfforts: getCachedReasoningEffortsForProfile(next),
      };
    });
  }

  function applyReasoningEffort(effort: ReasoningEffort) {
    setDraftProfile((current) => ({
      ...current,
      reasoningEffort: effort,
      cachedReasoningEfforts: uniqueStrings([effort, ...(current.cachedReasoningEfforts ?? [])]) as ReasoningEffort[],
    }));
    setReasoningEffortOptions((current) => uniqueStrings([effort, ...current]) as ReasoningEffort[]);
  }

  function getAdvancedApiSummary(profile: ApiProfile): string {
    const activeItems = [
      profile.storeResponses ? copy.storageEnabled : copy.storageDisabled,
      profile.projectId ? copy.projectId : '',
      profile.organization ? copy.organization : '',
      profile.systemPrompt ? copy.systemPrompt : '',
    ];
    return activeItems.filter(Boolean).join(' | ');
  }

  function openExternalUrl(url: string) {
    Linking.openURL(url).catch(() => undefined);
  }

  function formatApiError(error: unknown): string {
    const status = getApiErrorStatus(error);
    const rawMessage = getApiErrorMessage(error);
    const lowered = rawMessage.toLowerCase();
    let friendly = '';

    if (status === 401) {
      friendly = copy.apiErrorUnauthorized;
    } else if (status === 403) {
      friendly = copy.apiErrorForbidden;
    } else if (status === 404) {
      friendly = copy.apiErrorNotFound;
    } else if (status === 400 || status === 422) {
      friendly = copy.apiErrorBadRequest;
    } else if (status === 429) {
      friendly = copy.apiErrorRateLimited;
    } else if (status && status >= 500) {
      friendly = copy.apiErrorServer;
    } else if (lowered.includes('timeout') || lowered.includes('timed out')) {
      friendly = copy.apiErrorTimeout;
    } else if (
      lowered.includes('network request failed') ||
      lowered.includes('failed to fetch') ||
      lowered.includes('network')
    ) {
      friendly = copy.apiErrorNetwork;
    }

    if (!friendly) {
      return rawMessage;
    }

    return `${friendly}\n\n${copy.apiErrorRawPrefix}: ${rawMessage}`;
  }

  async function handleTestApiProfile() {
    const profile = sanitizeProfile(draftProfile);
    const key = apiKey.trim();
    if (!key) {
      Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      return;
    }

    setTestingProfile(true);
    try {
      const result = await testApiConnection({ profile, apiKey: key });
      Alert.alert(
        copy.testConnectionSuccessTitle,
        copy.testConnectionSuccessMessage(result.latencyMs, result.endpoint, result.sampleText)
      );
    } catch (error) {
      Alert.alert(copy.testConnectionFailedTitle, formatApiError(error));
    } finally {
      setTestingProfile(false);
    }
  }

  async function deleteApiProfile(profileId: string) {
    if (persisted.profiles.length <= 1) {
      Alert.alert(copy.deleteApiProfileTitle, copy.cannotDeleteOnlyApiProfile);
      return;
    }

    await deleteProfileApiKey(profileId);
    setPersisted((current) => {
      const profiles = current.profiles.filter((profile) => profile.id !== profileId);
      const activeProfileId =
        current.activeProfileId === profileId ? profiles[0].id : current.activeProfileId;
      const profile = profiles.find((item) => item.id === activeProfileId) ?? profiles[0];
      return {
        ...current,
        profiles,
        activeProfileId,
        profile,
      };
    });

    if (draftProfile.id === profileId) {
      const nextProfile = persisted.profiles.find((profile) => profile.id !== profileId) ?? DEFAULT_PROFILE;
      setDraftProfile(nextProfile);
      setApiKey(await loadProfileApiKey(nextProfile.id));
    }
  }

  function confirmDeleteApiProfile(profileId: string) {
    Alert.alert(copy.deleteApiProfileTitle, copy.deleteApiProfileMessage, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.delete,
        style: 'destructive',
        onPress: () => {
          void deleteApiProfile(profileId);
        },
      },
    ]);
  }

  function appendPendingAttachments(attachments: PendingAttachment[]) {
    if (attachments.length > 0) {
      setPendingAttachments((current) => [...current, ...attachments]);
      setAttachmentMenuVisible(false);
    }
  }

  async function attachFromCamera() {
    try {
      appendPendingAttachments(await captureImageAttachment());
    } catch (error) {
      Alert.alert(copy.imagePickerFailed, error instanceof Error ? error.message : copy.imagePickerFailedFallback);
    }
  }

  async function attachImages() {
    try {
      appendPendingAttachments(await pickImageAttachments());
    } catch (error) {
      Alert.alert(copy.imagePickerFailed, error instanceof Error ? error.message : copy.imagePickerFailedFallback);
    }
  }

  async function attachFiles() {
    try {
      appendPendingAttachments(await pickDocumentAttachments());
    } catch (error) {
      Alert.alert(copy.filePickerFailed, error instanceof Error ? error.message : copy.filePickerFailedFallback);
    }
  }

  async function fetchModelsForProfile(profile: ApiProfile = activeProfile, key = apiKey) {
    if (!key.trim()) {
      openSettings();
      Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      return;
    }

    setFetchingModels(true);
    try {
      const result = await fetchAvailableModels({ profile, apiKey: key.trim() });
      const nextModels = uniqueStrings([profile.model, ...result.models]);
      setAvailableModels(nextModels);
      setPersisted((current) => {
        const currentProfile = current.profiles.find((item) => item.id === profile.id) ?? getActiveProfile(current);
        const updatedProfile = { ...currentProfile, cachedModels: nextModels };
        const profiles = upsertProfile(current.profiles, updatedProfile);
        return {
          ...current,
          profiles,
          profile: current.activeProfileId === updatedProfile.id ? updatedProfile : current.profile,
        };
      });
      if (result.models.length === 0) {
        Alert.alert(copy.modelPickerTitle, copy.modelsEmpty);
      }
    } catch (error) {
      Alert.alert(copy.modelsFetchFailed, error instanceof Error ? error.message : copy.modelsFetchFailed);
    } finally {
      setFetchingModels(false);
    }
  }

  async function fetchModelsForDraftProfile() {
    const profile = sanitizeProfile(draftProfile);
    const key = apiKey.trim();
    if (!key) {
      Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      return;
    }

    setFetchingModels(true);
    try {
      const result = await fetchAvailableModels({ profile, apiKey: key });
      const nextModels = uniqueStrings([profile.model, ...result.models]);
      setAvailableModels(nextModels);
      setDraftProfile((current) => ({ ...current, model: profile.model, cachedModels: nextModels }));
      if (result.models.length === 0) {
        Alert.alert(copy.modelPickerTitle, copy.modelsEmpty);
      }
    } catch (error) {
      Alert.alert(copy.modelsFetchFailed, error instanceof Error ? error.message : copy.modelsFetchFailed);
    } finally {
      setFetchingModels(false);
    }
  }

  function openModelPicker() {
    setAvailableModels(getCachedModelsForProfile(activeProfile));
    openBottomSheet('models');
  }

  function applyModelToActiveProfile(model: string) {
    const nextModel = model.trim();
    if (!nextModel) {
      return;
    }
    setPersisted((current) => {
      const profile = getActiveProfile(current);
      const updatedProfile: ApiProfile = { ...profile, model: nextModel, cachedModels: uniqueStrings([nextModel, ...(profile.cachedModels ?? [])]) };
      const profiles = upsertProfile(current.profiles, updatedProfile);
      return {
        ...current,
        profiles,
        profile: updatedProfile,
      };
    });
    setDraftProfile((current) => ({ ...current, model: nextModel }));
    closeBottomSheet();
  }

  function flushStreamingText() {
    const conversationId = streamingConversationIdRef.current;
    const messageId = streamingMessageIdRef.current;
    if (!conversationId || !messageId) {
      return;
    }

    const nextText = streamingTextRef.current;
    scheduleStreamingScroll();
    skipNextPersistRef.current = true;
    setPersisted((current) => ({
      ...current,
      conversations: current.conversations.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              updatedAt: new Date().toISOString(),
              messages: item.messages.map((message) =>
                message.id === messageId ? { ...message, text: nextText } : message
              ),
            }
          : item
      ),
    }));
  }

  function scheduleStreamingFlush() {
    if (streamingFlushTimerRef.current) {
      return;
    }

    streamingFlushTimerRef.current = setTimeout(() => {
      streamingFlushTimerRef.current = null;
      flushStreamingText();
    }, STREAMING_FLUSH_INTERVAL_MS);
  }

  function scheduleStreamingScroll() {
    if (!sending || !streamingMessageIdRef.current) {
      return;
    }
    if (!autoFollowScrollRef.current) {
      return;
    }
    if (streamingScrollTimerRef.current) {
      return;
    }

    streamingScrollTimerRef.current = setTimeout(() => {
      streamingScrollTimerRef.current = null;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }, STREAMING_SCROLL_INTERVAL_MS);
  }

  function clearStreamingFlushTimer() {
    if (streamingFlushTimerRef.current) {
      clearTimeout(streamingFlushTimerRef.current);
      streamingFlushTimerRef.current = null;
    }
    if (streamingScrollTimerRef.current) {
      clearTimeout(streamingScrollTimerRef.current);
      streamingScrollTimerRef.current = null;
    }
  }

  function removePendingAttachment(id: string) {
    setAttachmentMenuVisible(false);
    const attachment = pendingAttachments.find((item) => item.id === id);
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
    if (attachment) {
      deleteAttachmentRecords([attachment]).catch(() => undefined);
    }
  }

  function createUserMessage(text: string, attachments: AttachmentRecord[]): ChatMessage {
    return {
      id: makeId('msg'),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
      attachments,
    };
  }

  function createAssistantMessage(
    text: string,
    responseId: string,
    attachments: AttachmentRecord[] = []
  ): ChatMessage {
    return {
      id: makeId('msg'),
      role: 'assistant',
      text,
      createdAt: new Date().toISOString(),
      attachments,
      responseId,
    };
  }

  function handleStopGenerating() {
    abortControllerRef.current?.abort();
  }

  async function handleSend() {
    if (sending) return;

    const trimmed = composerText.trim();
    if (!trimmed && pendingAttachments.length === 0) {
      return;
    }
    if (!apiKey.trim()) {
      openSettings();
      Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      return;
    }

    const conversation = ensureConversation();
    const baseConversations = activeConversation
      ? persisted.conversations
      : upsertConversation(persisted.conversations, conversation);
    const userMessage = createUserMessage(trimmed, pendingAttachments);
    const title =
      conversation.messages.length === 0
        ? trimTitle(trimmed || pendingAttachments[0]?.name || copy.newSession, copy.newSession)
        : conversation.title;

    const optimisticConversation: ConversationRecord = {
      ...conversation,
      title,
      model: activeProfile.model,
      assistantKind: classifyModel(activeProfile.model),
      updatedAt: userMessage.createdAt,
      messages: [...conversation.messages, userMessage],
    };
    const streamingAssistantMessage = createAssistantMessage('', '');
    const streamingConversation: ConversationRecord = {
      ...optimisticConversation,
      messages: [...optimisticConversation.messages, streamingAssistantMessage],
    };

    const optimisticConversations = upsertConversation(baseConversations, streamingConversation);
    updateConversations(optimisticConversations, conversation.id);

    setComposerText('');
    setPendingAttachments([]);
    setAttachmentMenuVisible(false);
    setSending(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    streamingTextRef.current = '';
    streamingConversationIdRef.current = conversation.id;
    streamingMessageIdRef.current = streamingAssistantMessage.id;

    try {
      const turn = await createAssistantTurn({
        profile: activeProfile,
        apiKey: apiKey.trim(),
        conversation,
        nextUserMessage: userMessage,
        signal: abortController.signal,
        onTextDelta: (delta) => {
          streamingTextRef.current += delta;
          scheduleStreamingFlush();
        },
      });
      clearStreamingFlushTimer();
      const assistantMessage: ChatMessage = {
        ...streamingAssistantMessage,
        text: turn.assistantText || streamingTextRef.current || '(empty response)',
        responseId: turn.responseId,
        attachments: turn.attachments,
        createdAt: new Date().toISOString(),
      };
      const completedConversation: ConversationRecord = {
        ...optimisticConversation,
        previousResponseId: turn.responseId,
        updatedAt: assistantMessage.createdAt,
        messages: [...optimisticConversation.messages, assistantMessage],
      };
      updateConversations(upsertConversation(optimisticConversations, completedConversation), conversation.id);

      if (conversation.messages.length === 0) {
        void createConversationTitle({
          profile: activeProfile,
          apiKey: apiKey.trim(),
          userText: trimmed,
          assistantText: assistantMessage.text,
          language: uiLanguage,
        }).then((generatedTitle) => {
          if (generatedTitle.trim()) {
            renameConversation(conversation.id, generatedTitle);
          }
        });
      }
    } catch (error) {
      clearStreamingFlushTimer();
      if (abortController.signal.aborted) {
        const stoppedMessage: ChatMessage = {
          ...streamingAssistantMessage,
          text: streamingTextRef.current || copy.generationStopped,
          createdAt: new Date().toISOString(),
        };
        const stoppedConversation: ConversationRecord = {
          ...optimisticConversation,
          updatedAt: stoppedMessage.createdAt,
          messages: [...optimisticConversation.messages, stoppedMessage],
        };
        updateConversations(upsertConversation(optimisticConversations, stoppedConversation), conversation.id);
        return;
      }

      const message = formatApiError(error);
      const failedConversation: ConversationRecord = {
        ...optimisticConversation,
        updatedAt: new Date().toISOString(),
        messages: [
          ...optimisticConversation.messages,
          {
            id: makeId('msg'),
            role: 'assistant',
            text: 'Request failed.',
            createdAt: new Date().toISOString(),
            attachments: [],
            error: message,
          },
        ],
      };
      updateConversations(upsertConversation(optimisticConversations, failedConversation), conversation.id);
      Alert.alert(copy.sendFailed, message);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      streamingConversationIdRef.current = null;
      streamingMessageIdRef.current = null;
      streamingTextRef.current = '';
      setSending(false);
    }
  }

  async function regenerateAssistantMessage(messageId: string) {
    if (sending || !activeConversation) {
      return;
    }
    if (!apiKey.trim()) {
      openSettings();
      Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      return;
    }

    const assistantIndex = activeConversation.messages.findIndex(
      (message) => message.id === messageId && message.role === 'assistant'
    );
    if (assistantIndex <= 0) {
      return;
    }

    let userIndex = assistantIndex - 1;
    while (userIndex >= 0 && activeConversation.messages[userIndex].role !== 'user') {
      userIndex -= 1;
    }
    if (userIndex < 0) {
      return;
    }

    const nextUserMessage = activeConversation.messages[userIndex];
    const previousMessages = activeConversation.messages.slice(0, userIndex);
    const preservedMessages = activeConversation.messages.slice(0, userIndex + 1);
    const removedMessages = activeConversation.messages.slice(userIndex + 1);
    const previousResponseId =
      [...previousMessages].reverse().find((message) => message.role === 'assistant' && message.responseId)?.responseId ??
      null;
    const contextConversation: ConversationRecord = {
      ...activeConversation,
      messages: previousMessages,
      previousResponseId,
    };
    const streamingAssistantMessage = createAssistantMessage('', '');
    const optimisticConversation: ConversationRecord = {
      ...activeConversation,
      model: activeProfile.model,
      assistantKind: classifyModel(activeProfile.model),
      updatedAt: new Date().toISOString(),
      messages: [...preservedMessages, streamingAssistantMessage],
    };

    await deleteAttachmentRecords(removedMessages.flatMap((message) => message.attachments)).catch(() => undefined);
    updateConversations(upsertConversation(persisted.conversations, optimisticConversation), activeConversation.id);
    setChatMenuVisible(false);
    setAttachmentMenuVisible(false);
    setSending(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    streamingTextRef.current = '';
    streamingConversationIdRef.current = activeConversation.id;
    streamingMessageIdRef.current = streamingAssistantMessage.id;

    try {
      const turn = await createAssistantTurn({
        profile: activeProfile,
        apiKey: apiKey.trim(),
        conversation: contextConversation,
        nextUserMessage,
        signal: abortController.signal,
        onTextDelta: (delta) => {
          streamingTextRef.current += delta;
          scheduleStreamingFlush();
        },
      });
      clearStreamingFlushTimer();
      const assistantMessage: ChatMessage = {
        ...streamingAssistantMessage,
        text: turn.assistantText || streamingTextRef.current || '(empty response)',
        responseId: turn.responseId,
        attachments: turn.attachments,
        createdAt: new Date().toISOString(),
      };
      const completedConversation: ConversationRecord = {
        ...optimisticConversation,
        previousResponseId: turn.responseId,
        updatedAt: assistantMessage.createdAt,
        messages: [...preservedMessages, assistantMessage],
      };
      updateConversations(upsertConversation(persisted.conversations, completedConversation), activeConversation.id);
    } catch (error) {
      clearStreamingFlushTimer();
      const fallbackText = abortController.signal.aborted ? copy.generationStopped : 'Request failed.';
      const regeneratedMessage: ChatMessage = {
        ...streamingAssistantMessage,
        text: streamingTextRef.current || fallbackText,
        createdAt: new Date().toISOString(),
        error: abortController.signal.aborted ? undefined : formatApiError(error),
      };
      const failedConversation: ConversationRecord = {
        ...optimisticConversation,
        updatedAt: regeneratedMessage.createdAt,
        messages: [...preservedMessages, regeneratedMessage],
      };
      updateConversations(upsertConversation(persisted.conversations, failedConversation), activeConversation.id);
      if (!abortController.signal.aborted) {
        Alert.alert(copy.sendFailed, regeneratedMessage.error ?? copy.sendFailed);
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      streamingConversationIdRef.current = null;
      streamingMessageIdRef.current = null;
      streamingTextRef.current = '';
      setSending(false);
    }
  }

  async function editUserMessage(messageId: string, nextText: string) {
    if (sending || !activeConversation) {
      return;
    }
    const trimmed = nextText.trim();
    if (!trimmed || !apiKey.trim()) {
      if (!apiKey.trim()) {
        openSettings();
        Alert.alert(copy.apiKeyRequiredTitle, copy.apiKeyRequiredMessage);
      }
      return;
    }

    const userIndex = activeConversation.messages.findIndex(
      (message) => message.id === messageId && message.role === 'user'
    );
    if (userIndex < 0) {
      return;
    }

    const currentUserMessage = activeConversation.messages[userIndex];
    const assistantIndex = activeConversation.messages.findIndex(
      (message, index) => index > userIndex && message.role === 'assistant'
    );
    const currentAssistantMessage = assistantIndex >= 0 ? activeConversation.messages[assistantIndex] : undefined;
    const variants = normalizeMessageVariants(currentUserMessage, currentAssistantMessage);
    const nextVariantIndex = variants.length;
    const editedUserMessage: ChatMessage = {
      ...currentUserMessage,
      text: trimmed,
      attachments: currentUserMessage.attachments,
      activeVariantIndex: nextVariantIndex,
      variants: [
        ...variants,
        {
          id: makeId('variant'),
          text: trimmed,
          createdAt: new Date().toISOString(),
          attachments: currentUserMessage.attachments,
        },
      ],
    };
    const previousMessages = activeConversation.messages.slice(0, userIndex);
    const afterAssistantIndex = assistantIndex >= 0 ? assistantIndex + 1 : userIndex + 1;
    const suffixMessages = activeConversation.messages.slice(afterAssistantIndex);
    const removedMessages = assistantIndex >= 0
      ? [activeConversation.messages[assistantIndex], ...suffixMessages]
      : suffixMessages;
    const previousResponseId =
      [...previousMessages].reverse().find((message) => message.role === 'assistant' && message.responseId)?.responseId ??
      null;
    const contextConversation: ConversationRecord = {
      ...activeConversation,
      messages: previousMessages,
      previousResponseId,
    };
    const streamingAssistantMessage = createAssistantMessage('', '');
    const optimisticConversation: ConversationRecord = {
      ...activeConversation,
      model: activeProfile.model,
      assistantKind: classifyModel(activeProfile.model),
      updatedAt: new Date().toISOString(),
      messages: [...previousMessages, editedUserMessage, streamingAssistantMessage],
      previousResponseId,
    };

    await deleteAttachmentRecords(removedMessages.flatMap((message) => message.attachments)).catch(() => undefined);
    updateConversations(upsertConversation(persisted.conversations, optimisticConversation), activeConversation.id);
    setChatMenuVisible(false);
    setAttachmentMenuVisible(false);
    setSending(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    streamingTextRef.current = '';
    streamingConversationIdRef.current = activeConversation.id;
    streamingMessageIdRef.current = streamingAssistantMessage.id;

    try {
      const turn = await createAssistantTurn({
        profile: activeProfile,
        apiKey: apiKey.trim(),
        conversation: contextConversation,
        nextUserMessage: editedUserMessage,
        signal: abortController.signal,
        onTextDelta: (delta) => {
          streamingTextRef.current += delta;
          scheduleStreamingFlush();
        },
      });
      clearStreamingFlushTimer();
      const assistantMessage: ChatMessage = {
        ...streamingAssistantMessage,
        text: turn.assistantText || streamingTextRef.current || '(empty response)',
        responseId: turn.responseId,
        attachments: turn.attachments,
        createdAt: new Date().toISOString(),
      };
      const completedUserMessage: ChatMessage = {
        ...editedUserMessage,
        variants: editedUserMessage.variants?.map((variant, index) =>
          index === nextVariantIndex
            ? {
                ...variant,
                assistantMessageId: assistantMessage.id,
                assistantText: assistantMessage.text,
                assistantResponseId: assistantMessage.responseId,
                assistantError: assistantMessage.error,
              }
            : variant
        ),
      };
      const completedConversation: ConversationRecord = {
        ...optimisticConversation,
        previousResponseId: turn.responseId,
        updatedAt: assistantMessage.createdAt,
        messages: [...previousMessages, completedUserMessage, assistantMessage],
      };
      updateConversations(upsertConversation(persisted.conversations, completedConversation), activeConversation.id);
    } catch (error) {
      clearStreamingFlushTimer();
      const assistantMessage: ChatMessage = {
        ...streamingAssistantMessage,
        text: streamingTextRef.current || (abortController.signal.aborted ? copy.generationStopped : 'Request failed.'),
        createdAt: new Date().toISOString(),
        error: abortController.signal.aborted ? undefined : formatApiError(error),
      };
      const failedUserMessage: ChatMessage = {
        ...editedUserMessage,
        variants: editedUserMessage.variants?.map((variant, index) =>
          index === nextVariantIndex
            ? {
                ...variant,
                assistantMessageId: assistantMessage.id,
                assistantText: assistantMessage.text,
                assistantResponseId: assistantMessage.responseId,
                assistantError: assistantMessage.error,
              }
            : variant
        ),
      };
      const failedConversation: ConversationRecord = {
        ...optimisticConversation,
        updatedAt: assistantMessage.createdAt,
        messages: [...previousMessages, failedUserMessage, assistantMessage],
      };
      updateConversations(upsertConversation(persisted.conversations, failedConversation), activeConversation.id);
      if (!abortController.signal.aborted) {
        Alert.alert(copy.sendFailed, assistantMessage.error ?? copy.sendFailed);
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      streamingConversationIdRef.current = null;
      streamingMessageIdRef.current = null;
      streamingTextRef.current = '';
      setSending(false);
    }
  }

  function switchUserMessageVariant(messageId: string, direction: -1 | 1) {
    if (!activeConversation) {
      return;
    }
    const userIndex = activeConversation.messages.findIndex(
      (message) => message.id === messageId && message.role === 'user'
    );
    if (userIndex < 0) {
      return;
    }
    const currentUserMessage = activeConversation.messages[userIndex];
    const assistantIndex = activeConversation.messages.findIndex(
      (message, index) => index > userIndex && message.role === 'assistant'
    );
    const currentAssistantMessage = assistantIndex >= 0 ? activeConversation.messages[assistantIndex] : undefined;
    const variants = normalizeMessageVariants(currentUserMessage, currentAssistantMessage);
    if (variants.length <= 1) {
      return;
    }
    const currentIndex = Math.min(Math.max(currentUserMessage.activeVariantIndex ?? 0, 0), variants.length - 1);
    const nextIndex = (currentIndex + direction + variants.length) % variants.length;
    const nextVariant = variants[nextIndex];
    const nextUserMessage: ChatMessage = {
      ...currentUserMessage,
      text: nextVariant.text,
      createdAt: nextVariant.createdAt,
      attachments: nextVariant.attachments,
      variants,
      activeVariantIndex: nextIndex,
    };
    const nextMessages = [...activeConversation.messages];
    nextMessages[userIndex] = nextUserMessage;
    if (assistantIndex >= 0) {
      nextMessages[assistantIndex] = {
        ...nextMessages[assistantIndex],
        text: nextVariant.assistantText ?? '',
        responseId: nextVariant.assistantResponseId,
        error: nextVariant.assistantError,
      };
    }
    const previousResponseId =
      [...nextMessages].reverse().find((message) => message.role === 'assistant' && message.responseId)?.responseId ??
      null;
    updateConversations(
      upsertConversation(persisted.conversations, {
        ...activeConversation,
        previousResponseId,
        updatedAt: new Date().toISOString(),
        messages: nextMessages,
      }),
      activeConversation.id
    );
  }

  regenerateAssistantMessageRef.current = (messageId: string) => {
    void regenerateAssistantMessage(messageId);
  };

  async function createNewSession() {
    await deleteAttachmentRecords(pendingAttachments).catch(() => undefined);
    const conversation = createConversation(activeProfile, copy.newSession);
    updateConversations([conversation, ...persisted.conversations], conversation.id);
    setComposerText('');
    setPendingAttachments([]);
    setAttachmentMenuVisible(false);
    setChatMenuVisible(false);
    closeSessionsDrawer(false);
    closeSettingsPanel({ returnToDrawer: false });
  }

  function openSessionsDrawer() {
    const animationId = sessionDrawerAnimationIdRef.current + 1;
    sessionDrawerAnimationIdRef.current = animationId;
    sessionDrawerClosingRef.current = false;
    setChatMenuVisible(false);
    setAttachmentMenuVisible(false);
    if (sessionDrawerCloseFallbackRef.current) {
      clearTimeout(sessionDrawerCloseFallbackRef.current);
      sessionDrawerCloseFallbackRef.current = null;
    }
    sessionDrawerTranslateX.stopAnimation();
    if (!sessionsVisible) {
      sessionDrawerTranslateX.setValue(-sessionDrawerHiddenOffsetRef.current);
    }
    setSessionsVisible(true);
    requestAnimationFrame(() => {
      Animated.timing(sessionDrawerTranslateX, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && sessionDrawerAnimationIdRef.current === animationId) {
          sessionDrawerTranslateX.setValue(0);
        }
      });
    });
  }

  function closeSessionsDrawer(animate = true) {
    if (animate && sessionDrawerClosingRef.current) {
      return;
    }

    const animationId = sessionDrawerAnimationIdRef.current + 1;
    sessionDrawerAnimationIdRef.current = animationId;
    sessionDrawerClosingRef.current = animate;
    drawerGestureOpeningRef.current = false;
    if (sessionDrawerCloseFallbackRef.current) {
      clearTimeout(sessionDrawerCloseFallbackRef.current);
    }
    sessionDrawerTranslateX.stopAnimation();
    const finishClose = () => {
      if (sessionDrawerAnimationIdRef.current !== animationId) {
        return;
      }
      if (sessionDrawerCloseFallbackRef.current) {
        clearTimeout(sessionDrawerCloseFallbackRef.current);
        sessionDrawerCloseFallbackRef.current = null;
      }
      sessionDrawerClosingRef.current = false;
      sessionDrawerTranslateX.setValue(-sessionDrawerHiddenOffsetRef.current);
      setSessionsVisible(false);
      setSessionSelectionMode(false);
      setSelectedSessionIds([]);
      setSessionSearchVisible(false);
      setSessionSearchQuery('');
      setSessionSearchRaised(false);
    };
    if (!animate) {
      finishClose();
      return;
    }
    sessionDrawerCloseFallbackRef.current = setTimeout(finishClose, 260);
    Animated.timing(sessionDrawerTranslateX, {
      toValue: -sessionDrawerHiddenOffsetRef.current,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(finishClose);
  }

  function openSettingsFromSessions() {
    void openSettings('drawer');
  }

  function toggleSessionSelection(conversationId: string) {
    setSelectedSessionIds((current) =>
      current.includes(conversationId)
        ? current.filter((id) => id !== conversationId)
        : [...current, conversationId]
    );
  }

  function toggleSessionSelectionMode() {
    setSessionSelectionMode((current) => {
      if (current) {
        setSelectedSessionIds([]);
      }
      return !current;
    });
  }

  async function copySelectedSessionExports() {
    const selected = sortedConversations.filter((conversation) => selectedSessionIds.includes(conversation.id));
    if (selected.length === 0) {
      return;
    }
    await Clipboard.setStringAsync(selected.map(formatConversationMarkdown).join('\n\n---\n\n'));
    Alert.alert(copy.copySelectedSessions, copy.copiedSessionExport);
    setSessionSelectionMode(false);
    setSelectedSessionIds([]);
  }

  function toggleSessionSearch() {
    setSessionSearchVisible((visible) => {
      if (visible) {
        setSessionSearchQuery('');
        setSessionSearchRaised(false);
      }
      return !visible;
    });
  }

  async function deleteSelectedSessions() {
    const selectedIds = new Set(selectedSessionIds);
    if (selectedIds.size === 0) {
      return;
    }

    const selectedConversations = persisted.conversations.filter((conversation) => selectedIds.has(conversation.id));
    await deleteAttachmentRecords(selectedConversations.flatMap(getConversationAttachments)).catch(() => undefined);
    const conversations = persisted.conversations.filter((conversation) => !selectedIds.has(conversation.id));
    const nextActiveId = selectedIds.has(persisted.activeConversationId ?? '')
      ? conversations[0]?.id ?? null
      : persisted.activeConversationId;
    updateConversations(conversations, nextActiveId);
    setSelectedSessionIds([]);
    setSessionSelectionMode(false);
  }

  function confirmDeleteSelectedSessions() {
    const count = selectedSessionIds.length;
    if (count === 0) {
      return;
    }

    Alert.alert(copy.deleteSessionTitle, copy.selectedSessionsDeleteMessage(count), [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.delete,
        style: 'destructive',
        onPress: () => {
          void deleteSelectedSessions();
        },
      },
    ]);
  }

  function togglePinConversation(conversationId: string) {
    setPersisted((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              pinned: !conversation.pinned,
            }
          : conversation
      ),
    }));
    setSessionContextMenuId(null);
  }

  async function shareActiveConversation() {
    setChatMenuVisible(false);
    if (!activeConversation) {
      return;
    }
    await Share.share({
      title: activeConversation.title,
      message: formatConversationMarkdown(activeConversation),
    }).catch(() => undefined);
  }

  function confirmDeleteActiveConversation() {
    setChatMenuVisible(false);
    if (!activeConversation) {
      return;
    }
    confirmDeleteConversation(activeConversation.id);
  }

  function openConversation(conversationId: string) {
    if (sessionSelectionMode) {
      toggleSessionSelection(conversationId);
      return;
    }
    shouldScrollToBottomRef.current = true;
    setPersisted((current) => ({
      ...current,
      activeConversationId: conversationId,
    }));
    setSelectedSessionIds([]);
    setSessionSelectionMode(false);
    closeSessionsDrawer();
  }

  function renameConversation(conversationId: string, title: string) {
    const nextTitle = trimTitle(title, copy.newSession);
    setPersisted((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: nextTitle,
              updatedAt: new Date().toISOString(),
            }
          : conversation
      ),
    }));
  }

  function promptRenameConversation(conversation: ConversationRecord) {
    setSessionContextMenuId(null);
    setRenamingConversationId(conversation.id);
    setDraftSessionTitle(conversation.title);
  }

  function closeRenameModal() {
    setRenamingConversationId(null);
    setDraftSessionTitle('');
  }

  function saveRenamedConversation() {
    if (!renamingConversationId) {
      return;
    }
    renameConversation(renamingConversationId, draftSessionTitle);
    closeRenameModal();
  }

  async function copyConversationExport(conversation: ConversationRecord) {
    await Clipboard.setStringAsync(formatConversationMarkdown(conversation));
    Alert.alert(copy.exportSession, copy.copiedSessionExport);
  }

  async function deleteConversation(conversationId: string) {
    const conversation = persisted.conversations.find((item) => item.id === conversationId);
    if (conversation) {
      await deleteAttachmentRecords(getConversationAttachments(conversation)).catch(() => undefined);
    }
    const conversations = persisted.conversations.filter((item) => item.id !== conversationId);
    const nextActiveId =
      persisted.activeConversationId === conversationId ? conversations[0]?.id ?? null : persisted.activeConversationId;
    setSelectedSessionIds((current) => current.filter((id) => id !== conversationId));
    updateConversations(conversations, nextActiveId);
  }

  function confirmDeleteConversation(conversationId: string) {
    setSessionContextMenuId(null);
    Alert.alert(copy.deleteSessionTitle, uiLanguage === 'zh' ? '确定删除该会话？' : 'Delete this conversation?', [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.delete,
        style: 'destructive',
        onPress: () => {
          void deleteConversation(conversationId);
        },
      },
    ]);
  }

  async function clearLocalData() {
    setSavingProfile(true);
    try {
      await Promise.all([
        clearPersistedState(),
        deleteApiKey(),
        ...persisted.profiles.map((profile) => deleteProfileApiKey(profile.id)),
        clearAllAttachmentFiles(),
      ]);
      skipNextPersistRef.current = true;
      setPersisted(EMPTY_STATE);
      setDraftProfile(DEFAULT_PROFILE);
      setApiKey('');
      setComposerText('');
      setPendingAttachments([]);
      closeSettingsPanel({ returnToDrawer: false });
      closeSessionsDrawer(false);
      closeBottomSheet(false);
      setSettingsSection('root');
    } catch (error) {
      Alert.alert(copy.clearFailed, error instanceof Error ? error.message : copy.clearFailedFallback);
    } finally {
      setSavingProfile(false);
    }
  }

  function confirmClearLocalData() {
    Alert.alert(copy.clearDataTitle, copy.clearDataMessage, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.clear,
        style: 'destructive',
        onPress: () => {
          void clearLocalData();
        },
      },
    ]);
  }

  function renderSettingsRoot() {
    const items: Array<{ key: SettingsSection; title: string; subtitle: string }> = [
      {
        key: 'api',
        title: copy.apiSection,
        subtitle: `${activeProfile.label} · ${activeProfile.model}`,
      },
      {
        key: 'storage',
        title: copy.storageSection,
        subtitle: copy.localStorageTitle,
      },
      {
        key: 'language',
        title: copy.language,
        subtitle: uiLanguage === 'zh' ? copy.chinese : copy.english,
      },
      {
        key: 'theme',
        title: copy.themeSection,
        subtitle:
          persisted.themeMode === 'dark'
            ? copy.themeDark
            : persisted.themeMode === 'light'
              ? copy.themeLight
              : copy.themeSystem,
      },
      {
        key: 'about',
        title: copy.aboutSection,
        subtitle: copy.createdBy,
      },
    ];

    return (
      <>
        {items.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.settingsNavItem, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            onPress={() => {
              if (item.key === 'api') {
                openApiProfiles();
                return;
              }
              navigateToSettingsSection(item.key);
            }}
          >
            <View style={styles.settingsNavText}>
              <Text style={[styles.settingsNavTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.settingsNavSubtitle, { color: theme.muted }]} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
                <DirectionIcon direction="right" color={theme.muted} />
          </Pressable>
        ))}
      </>
    );
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.loadingTitle}>Pocket AI</Text>
        <Text style={styles.loadingText}>{copy.loading}</Text>
      </SafeAreaView>
    );
  }

  const composerDisabled = false;
  const canSend = !!composerText.trim() || pendingAttachments.length > 0;
  const usingInsecureHttp = draftProfile.baseUrl.trim().toLowerCase().startsWith('http://');
  const themedPanel = { backgroundColor: theme.surfaceAlt, borderColor: theme.border };
  const themedFieldInput = { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text };
  const themedSelected = { backgroundColor: theme.primarySoft, borderColor: theme.primary };
  const themedMutedText = { color: theme.muted };
  const themedSubtleText = { color: theme.subtle };

  return (
    <LinearGradient colors={theme.gradient} style={styles.root}>
        <StatusBar barStyle={theme.statusBar} />
      <Animated.View style={[styles.mainScene, { transform: [{ translateX: chatSceneTranslateX }] }]}>
        <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
          keyboardVerticalOffset={0}
          style={styles.flex}
        >
          <View style={[styles.topBar, { paddingTop: topBarExtraInset }]}>
            <Pressable
              style={[styles.iconAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={openSessionsDrawer}
              accessibilityRole="button"
              accessibilityLabel={copy.openSessions}
            >
              <MenuIcon color={theme.text} />
            </Pressable>
            <Pressable style={styles.sessionSwitcher} onPress={openModelPicker}>
              <View style={[styles.modelPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{activeProfile.model}</Text>
              </View>
            </Pressable>
            <View style={styles.topActions}>
              <Pressable
                style={[styles.iconAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={createNewSession}
                accessibilityRole="button"
                accessibilityLabel={copy.newSession}
              >
                <PlusIcon color={theme.text} />
              </Pressable>
              <Pressable
                style={[styles.iconAction, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setChatMenuVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel="Conversation menu"
              >
                <MoreIcon color={theme.text} />
              </Pressable>
            </View>
          </View>

          {chatMenuVisible && <Pressable style={styles.chatMenuDismiss} onPress={() => setChatMenuVisible(false)} />}
          <SlideFadePresence
            visible={chatMenuVisible}
            from="top"
            style={[styles.chatMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
                <Pressable
                  style={[styles.chatMenuItem, !activeConversation && styles.disabledAction]}
                  onPress={() => {
                    void shareActiveConversation();
                  }}
                  disabled={!activeConversation}
                >
                  <Text style={[styles.chatMenuText, { color: theme.text }]}>{uiLanguage === 'zh' ? '分享' : 'Share'}</Text>
                </Pressable>
                <Pressable
                  style={[styles.chatMenuItem, !activeConversation && styles.disabledAction]}
                  onPress={confirmDeleteActiveConversation}
                  disabled={!activeConversation}
                >
                  <Text style={[styles.chatMenuText, styles.chatMenuDangerText]}>{copy.delete}</Text>
                </Pressable>
          </SlideFadePresence>

          <View style={styles.chatShell} {...chatOpenDrawerPanResponder.panHandlers}>
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              onScroll={handleChatScroll}
              scrollEventThrottle={80}
              onContentSizeChange={scheduleStreamingScroll}
            >
              {activeConversation ? (
                activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      language={uiLanguage}
                      colorScheme={theme.scheme}
                      isStreaming={sending && message.id === streamingMessageIdRef.current}
                      onRegenerate={handleRegenerateMessage}
                      onEditUserMessage={editUserMessage}
                      onSwitchVariant={switchUserMessageVariant}
                    />
                  ))
                ) : (
                  <View style={styles.emptyStateCard}>
                    <Text style={[styles.emptyStateTitle, { color: theme.text }]}>{activeConversation.title}</Text>
                    <Text style={[styles.emptyStateText, { color: theme.muted }]}>{copy.emptyStateBody}</Text>
                  </View>
                )
              ) : (
                <View style={styles.emptyStateCard}>
                  <Text style={[styles.emptyStateTitle, { color: theme.text }]}>{copy.noActiveSessionTitle}</Text>
                  <Text style={[styles.emptyStateText, { color: theme.muted }]}>{copy.noActiveSessionBody}</Text>
                </View>
              )}

            </ScrollView>

            <Animated.View
              ref={composerDockRef}
              onLayout={updateComposerAutoLift}
              style={[
                styles.composerDock,
                { marginBottom: composerBottomInset },
                { transform: [{ translateY: composerLiftTranslateY }] },
              ]}
            >
              {pendingAttachments.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pendingRail}
                >
                  {pendingAttachments.map((attachment) => (
                    <Pressable
                      key={attachment.id}
                      style={[styles.pendingChip, themedPanel]}
                      onPress={() => removePendingAttachment(attachment.id)}
                    >
                      <Text style={[styles.pendingChipType, { color: theme.primary }]}>{attachment.kind.toUpperCase()}</Text>
                      <Text style={[styles.pendingChipText, { color: theme.subtle }]} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
                <View style={styles.composerRow}>
                <Pressable
                  style={[
                    styles.attachButton,
                    { backgroundColor: theme.surfaceAlt, borderColor: attachmentMenuVisible ? theme.primary : theme.border },
                    attachmentMenuVisible && styles.attachButtonActive,
                  ]}
                  onPress={() => setAttachmentMenuVisible((visible) => !visible)}
                  disabled={composerDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={copy.attachMenu}
                >
                  <PlusIcon color={theme.text} />
                </Pressable>
                <View style={[styles.composerInputWrap, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  {composerNeedsExpand && (
                    <Pressable
                      style={styles.composerExpandButton}
                      onPress={() => setComposerExpanded(true)}
                      disabled={composerDisabled}
                      accessibilityRole="button"
                      accessibilityLabel={copy.expandComposer}
                    >
                      <Maximize2 size={17} color={theme.subtle} strokeWidth={2.2} />
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.composerOverlayButton, styles.composerOverlaySend, (!sending && !canSend) && styles.disabledAction]}
                    onPress={sending ? handleStopGenerating : handleSend}
                    disabled={!sending && !canSend}
                    accessibilityRole="button"
                    accessibilityLabel={sending ? copy.stopGenerating : copy.send}
                  >
                    {sending ? <StopIcon /> : <SendIcon />}
                  </Pressable>
                  <TextInput
                    value={composerText}
                    onChangeText={setComposerText}
                    onFocus={() => {
                      keyboardVisibleRef.current = true;
                      updateComposerAutoLift();
                    }}
                    onBlur={resetComposerAutoLift}
                    editable={!composerDisabled}
                    multiline
                    scrollEnabled
                    placeholder={copy.composerPlaceholder}
                    placeholderTextColor={theme.placeholder}
                    style={[
                      styles.composerInput,
                      styles.composerInputWithActions,
                      composerSingleLine && styles.composerInputSingleLine,
                      { color: theme.text },
                    ]}
                    textAlignVertical={composerSingleLine ? 'center' : 'top'}
                  />
                </View>
              </View>
              <SlideFadePresence
                visible={attachmentMenuVisible && !composerDisabled}
                from="bottom"
                style={styles.attachOptionRow}
              >
                  <Pressable style={[styles.attachOption, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={attachFromCamera}>
                    <Camera size={18} color="#2563EB" strokeWidth={2.3} />
                    <Text style={[styles.attachOptionText, { color: theme.text }]}>{copy.camera}</Text>
                  </Pressable>
                  <Pressable style={[styles.attachOption, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={attachImages}>
                    <ImageIcon size={18} color="#2563EB" strokeWidth={2.3} />
                    <Text style={[styles.attachOptionText, { color: theme.text }]}>{copy.image}</Text>
                  </Pressable>
                  <Pressable style={[styles.attachOption, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={attachFiles}>
                    <FileText size={18} color="#2563EB" strokeWidth={2.3} />
                    <Text style={[styles.attachOptionText, { color: theme.text }]}>{copy.file}</Text>
                  </Pressable>
              </SlideFadePresence>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </Animated.View>

      <Modal visible={settingsVisible} animationType="none" onRequestClose={goBackFromSettings}>
        <Animated.View
          style={[styles.settingsScreen, { backgroundColor: theme.surface, transform: [{ translateX: settingsPanelTranslateX }] }]}
          onStartShouldSetResponderCapture={() => false}
          onMoveShouldSetResponderCapture={(event) => maybeNavigateSettingsFromTouch(event)}
          onTouchStart={handleSettingsTouchStart}
          onTouchMove={handleSettingsTouchMove}
          onTouchEnd={handleSettingsTouchEnd}
          onTouchCancel={handleSettingsTouchEnd}
        >
          <SafeAreaView style={[styles.settingsScreenSafe, { paddingTop: modalTopInset, backgroundColor: theme.surface }]}>
            <View style={styles.settingsHeader}>
              {settingsSection !== 'root' && (
                <Pressable style={[styles.backButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]} onPress={goBackFromSettings}>
                  <DirectionIcon direction="left" color={theme.muted} />
                </Pressable>
              )}
              <View style={styles.modalHeading}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {settingsSection === 'root'
                    ? copy.settingsTitle
                    : settingsSection === 'api'
                      ? copy.apiSection
                    : settingsSection === 'language'
                      ? copy.language
                      : settingsSection === 'theme'
                        ? copy.themeSection
                      : settingsSection === 'storage'
                        ? copy.storageSection
                        : copy.aboutSection}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>{copy.settingsSubtitle}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.settingsScreenScroll}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              <Animated.View
                style={[
                  styles.settingsContentScene,
                  {
                    opacity: settingsContentProgress,
                    transform: [{ translateX: settingsContentTranslateX }],
                  },
                ]}
              >
              {settingsSection === 'root' && renderSettingsRoot()}

              {settingsSection === 'api' && (
                <>
                  <View style={styles.formSectionHeader}>
                    <Text style={[styles.sectionLabel, { color: theme.primary }]}>{copy.apiProfilesTitle}</Text>
                    <Pressable style={styles.modalPrimarySmall} onPress={createNewApiProfile}>
                      <Text style={styles.modalPrimaryText}>{copy.newApiProfile}</Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.inlineHint, themedMutedText]}>{copy.apiProfilesSubtitle}</Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileChipRow}>
                    {persisted.profiles.map((profile) => {
                      const isActive = profile.id === persisted.activeProfileId;
                      const isEditing = profile.id === draftProfile.id;
                      return (
                        <Pressable
                          key={profile.id}
                          style={[
                            styles.profileChip,
                            themedPanel,
                            isEditing && [styles.profileChipSelected, themedSelected],
                          ]}
                          onPress={() => {
                            void selectDraftApiProfile(profile);
                          }}
                        >
                          <Text style={[styles.profileChipTitle, { color: theme.text }, isEditing && { color: theme.primary }]}>
                            {profile.label}
                          </Text>
                          <Text style={[styles.profileChipMeta, { color: theme.muted }, isEditing && { color: theme.primary }]} numberOfLines={1}>
                            {isActive ? copy.activeApiProfile : profile.model}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.formSectionHeader}>
                    <Text style={[styles.sectionLabel, { color: theme.primary }]}>{copy.basicApiSettings}</Text>
                    <Text style={[styles.sectionValue, themedMutedText]} numberOfLines={1}>
                      {draftProfile.model}
                    </Text>
                  </View>
                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.profileLabel}</Text>
                  <TextInput
                    value={draftProfile.label}
                    onChangeText={(value) => setDraftProfile((current) => ({ ...current, label: value }))}
                    style={[styles.fieldInput, themedFieldInput]}
                    placeholder="My API"
                    placeholderTextColor={theme.placeholder}
                  />

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.apiPreset}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                    {API_PRESETS.map((preset) => {
                      const selected =
                        draftProfile.apiProtocol === preset.apiProtocol &&
                        draftProfile.baseUrl === preset.baseUrl &&
                        draftProfile.model === preset.model;
                      return (
                        <Pressable
                          key={preset.id}
                          style={[styles.suggestionChip, themedPanel, selected && [styles.selectedChip, themedSelected]]}
                          onPress={() => updateDraftProfileWithReasoningReset((current) => applyApiPreset(current, preset))}
                        >
                          <Text style={[styles.suggestionChipText, themedSubtleText, selected && { color: theme.primary }]}>
                            {preset.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.endpointMode}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                    {API_PROTOCOL_OPTIONS.map((protocol) => (
                      <Pressable
                        key={protocol}
                        style={[styles.suggestionChip, themedPanel, draftProfile.apiProtocol === protocol && [styles.selectedChip, themedSelected]]}
                        onPress={() => updateDraftProfileWithReasoningReset((current) => ({ ...current, apiProtocol: protocol }))}
                      >
                        <Text style={[styles.suggestionChipText, themedSubtleText, draftProfile.apiProtocol === protocol && { color: theme.primary }]}>
                          {apiProtocolLabel(protocol, uiLanguage)}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Text style={[styles.inlineHint, themedMutedText]}>{getEndpointHint(draftProfile.apiProtocol, uiLanguage)}</Text>

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.baseUrl}</Text>
                  <TextInput
                    value={draftProfile.baseUrl}
                    onChangeText={(value) => setDraftProfile((current) => ({ ...current, baseUrl: value }))}
                    style={[styles.fieldInput, themedFieldInput]}
                    autoCapitalize="none"
                    placeholder="https://api.openai.com/v1"
                    placeholderTextColor={theme.placeholder}
                  />
                  <Text style={[styles.inlineHint, themedMutedText]}>{copy.baseUrlHint}</Text>
                  {usingInsecureHttp && <Text style={styles.warningText}>{copy.insecureHttpWarning}</Text>}

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.apiKey}</Text>
                  <TextInput
                    value={apiKey}
                    onChangeText={setApiKey}
                    style={[styles.fieldInput, themedFieldInput]}
                    autoCapitalize="none"
                    secureTextEntry
                    placeholder="sk-..."
                    placeholderTextColor={theme.placeholder}
                  />

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.model}</Text>
                  <TextInput
                    value={draftProfile.model}
                    onChangeText={(value) => updateDraftProfileWithReasoningReset((current) => ({ ...current, model: value }))}
                    style={[styles.fieldInput, themedFieldInput]}
                    autoCapitalize="none"
                    placeholder="gpt-5.4"
                    placeholderTextColor={theme.placeholder}
                  />
                  <Pressable
                    style={[styles.inlineUtilityButton, themedPanel, fetchingModels && styles.disabledAction]}
                    onPress={() => {
                      void fetchModelsForDraftProfile();
                    }}
                    disabled={fetchingModels}
                  >
                    <Text style={[styles.inlineUtilityButtonText, { color: theme.primary }]}>
                      {fetchingModels ? copy.fetchingModels : copy.fetchModels}
                    </Text>
                  </Pressable>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                    {uniqueStrings([draftProfile.model, ...(draftProfile.cachedModels ?? []), ...availableModels, ...MODEL_SUGGESTIONS]).map((model) => (
                      <Pressable
                        key={model}
                        style={[styles.suggestionChip, themedPanel, draftProfile.model === model && [styles.selectedChip, themedSelected]]}
                        onPress={() => updateDraftProfileWithReasoningReset((current) => ({ ...current, model }))}
                      >
                        <Text style={[styles.suggestionChipText, themedSubtleText, draftProfile.model === model && { color: theme.primary }]}>
                          {model}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Text style={[styles.inlineHint, themedMutedText]}>{getModelHint(draftProfile.model, uiLanguage)}</Text>

                  <View style={[styles.compactSettingCard, themedPanel]}>
                    <View style={styles.compactSettingHeader}>
                      <View style={styles.compactSettingTitleWrap}>
                        <Text style={[styles.compactSettingTitle, { color: theme.text }]}>{copy.reasoningEffort}</Text>
                        <Text style={[styles.compactSettingSubtitle, themedMutedText]}>
                          {copy.currentValue}: {draftProfile.reasoningEffort}
                        </Text>
                      </View>
                      <Pressable style={[styles.inlineUtilityButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => refreshReasoningEffortOptions(draftProfile)}>
                        <Text style={[styles.inlineUtilityButtonText, { color: theme.primary }]}>{copy.fetchReasoningEfforts}</Text>
                      </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                      {reasoningEffortOptions.map((effort) => (
                        <Pressable
                          key={effort}
                          style={[styles.suggestionChip, { backgroundColor: theme.surface, borderColor: theme.border }, draftProfile.reasoningEffort === effort && [styles.selectedChip, themedSelected]]}
                          onPress={() => applyReasoningEffort(effort)}
                        >
                          <Text style={[styles.suggestionChipText, themedSubtleText, draftProfile.reasoningEffort === effort && { color: theme.primary }]}>
                            {effort}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    <Text style={[styles.inlineHint, themedMutedText]}>
                      {reasoningEffortsFetched
                        ? inferReasoningEffortOptions(draftProfile).length > 1
                          ? copy.reasoningEffortsReady
                          : copy.reasoningEffortsUnavailable
                        : getReasoningEffortHint(draftProfile.model, draftProfile.reasoningEffort, uiLanguage)}
                    </Text>
                  </View>

                  <Pressable
                    style={[styles.advancedToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setAdvancedApiSettingsOpen((current) => !current)}
                  >
                    <View style={styles.advancedToggleTextWrap}>
                      <Text style={[styles.advancedToggleTitle, { color: theme.text }]}>{copy.advancedApiSettings}</Text>
                      <Text style={[styles.advancedToggleSubtitle, themedMutedText]} numberOfLines={1}>
                        {getAdvancedApiSummary(draftProfile)}
                      </Text>
                    </View>
                    <Text style={[styles.advancedToggleAction, { color: theme.primary }]}>
                      {advancedApiSettingsOpen ? copy.hideAdvancedSettings : copy.showAdvancedSettings}
                    </Text>
                  </Pressable>

                  <SlideFadePresence visible={advancedApiSettingsOpen} from="top" style={[styles.advancedPanel, themedPanel]}>
                      {draftProfile.apiProtocol === 'responses' && (
                        <>
                          <View style={styles.switchRow}>
                            <View style={styles.switchTextWrap}>
                              <Text style={[styles.switchTitle, { color: theme.text }]}>{copy.responseStorage}</Text>
                              <Text style={[styles.switchSubtitle, themedMutedText]}>
                                {draftProfile.storeResponses ? copy.storageEnabled : copy.storageDisabled}
                              </Text>
                            </View>
                            <Pressable
                              style={[styles.compactSwitch, draftProfile.storeResponses && styles.compactSwitchOn]}
                              onPress={() => setDraftProfile((current) => ({ ...current, storeResponses: !current.storeResponses }))}
                            >
                              <View style={[styles.compactSwitchThumb, draftProfile.storeResponses && styles.compactSwitchThumbOn]} />
                            </Pressable>
                          </View>
                          <Text style={[styles.inlineHint, themedMutedText]}>
                            {getProtocolStorageHint(draftProfile.apiProtocol, draftProfile.storeResponses, uiLanguage)}
                          </Text>
                        </>
                      )}

                      <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.projectId}</Text>
                      <TextInput
                        value={draftProfile.projectId}
                        onChangeText={(value) => setDraftProfile((current) => ({ ...current, projectId: value }))}
                        style={[styles.fieldInput, themedFieldInput]}
                        autoCapitalize="none"
                        placeholder="Optional"
                        placeholderTextColor={theme.placeholder}
                      />

                      <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.organization}</Text>
                      <TextInput
                        value={draftProfile.organization}
                        onChangeText={(value) => setDraftProfile((current) => ({ ...current, organization: value }))}
                        style={[styles.fieldInput, themedFieldInput]}
                        autoCapitalize="none"
                        placeholder="Optional"
                        placeholderTextColor={theme.placeholder}
                      />

                      <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.systemPrompt}</Text>
                      <TextInput
                        value={draftProfile.systemPrompt}
                        onChangeText={(value) => setDraftProfile((current) => ({ ...current, systemPrompt: value }))}
                        style={[styles.fieldInput, themedFieldInput, styles.fieldInputMultiline]}
                        multiline
                        placeholder="Optional long-lived instruction"
                        placeholderTextColor={theme.placeholder}
                      />
                      <Text style={[styles.inlineHint, themedMutedText]}>{copy.advancedConfigHint}</Text>
                  </SlideFadePresence>

                  <View style={styles.profileUtilityRow}>
                    <Pressable
                      style={[styles.secondaryActionCard, themedPanel, testingProfile && styles.disabledAction]}
                      onPress={handleTestApiProfile}
                      disabled={testingProfile || savingProfile}
                    >
                      <Text style={[styles.secondaryActionLabel, { color: theme.text }]}>
                        {testingProfile ? copy.testingApiConnection : copy.testApiConnection}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.dangerButtonCompact}
                      onPress={() => confirmDeleteApiProfile(draftProfile.id)}
                      disabled={testingProfile || savingProfile}
                    >
                      <Text style={styles.dangerButtonText}>{copy.deleteApiProfile}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalPrimary, savingProfile && styles.disabledAction]}
                      onPress={handleSaveApiProfile}
                      disabled={savingProfile}
                    >
                      <Text style={styles.modalPrimaryText}>{savingProfile ? copy.saving : copy.done}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {settingsSection === 'language' && (
                <View style={[styles.settingOptionGroup, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Pressable
                    style={[
                      styles.settingOption,
                      { borderBottomColor: theme.border },
                      uiLanguage === 'zh' && [styles.settingOptionSelected, themedSelected],
                    ]}
                    onPress={() => applyUiLanguage('zh')}
                  >
                    <View style={[styles.settingOptionRadio, { backgroundColor: theme.surface, borderColor: theme.border }, uiLanguage === 'zh' && styles.settingOptionRadioSelected]}>
                      {uiLanguage === 'zh' && <View style={styles.settingOptionRadioDot} />}
                    </View>
                    <Text style={[styles.settingOptionText, { color: theme.text }]}>{copy.chinese}</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.settingOption,
                      { borderBottomColor: theme.border },
                      uiLanguage === 'en' && [styles.settingOptionSelected, themedSelected],
                    ]}
                    onPress={() => applyUiLanguage('en')}
                  >
                    <View style={[styles.settingOptionRadio, { backgroundColor: theme.surface, borderColor: theme.border }, uiLanguage === 'en' && styles.settingOptionRadioSelected]}>
                      {uiLanguage === 'en' && <View style={styles.settingOptionRadioDot} />}
                    </View>
                    <Text style={[styles.settingOptionText, { color: theme.text }]}>{copy.english}</Text>
                  </Pressable>
                </View>
              )}

              {settingsSection === 'theme' && (
                <View style={[styles.settingOptionGroup, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  {([
                    { mode: 'system' as const, label: copy.themeSystem },
                    { mode: 'light' as const, label: copy.themeLight },
                    { mode: 'dark' as const, label: copy.themeDark },
                  ]).map((option) => (
                    <Pressable
                      key={option.mode}
                      style={[
                        styles.settingOption,
                        { borderBottomColor: theme.border },
                        persisted.themeMode === option.mode && [styles.settingOptionSelected, themedSelected],
                      ]}
                      onPress={() => applyThemeMode(option.mode)}
                    >
                      <View style={[styles.settingOptionRadio, { backgroundColor: theme.surface, borderColor: theme.border }, persisted.themeMode === option.mode && styles.settingOptionRadioSelected]}>
                        {persisted.themeMode === option.mode && <View style={styles.settingOptionRadioDot} />}
                      </View>
                      <Text style={[styles.settingOptionText, { color: theme.text }]}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {settingsSection === 'storage' && (
                <>
                  <View style={[styles.infoPanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                    <Text style={[styles.infoPanelTitle, { color: theme.text }]}>{copy.localStorageTitle}</Text>
                    <Text style={[styles.infoPanelText, { color: theme.muted }]}>{copy.localStorageDescription}</Text>
                  </View>
                  <Pressable style={styles.dangerButton} onPress={confirmClearLocalData} disabled={savingProfile}>
                    <Text style={styles.dangerButtonText}>{copy.clearLocalData}</Text>
                  </Pressable>
                  <Text style={[styles.inlineHint, { color: theme.muted }]}>{copy.clearLocalHint}</Text>
                </>
              )}

              {settingsSection === 'plugins' && (
                <View style={styles.infoPanel}>
                  <Text style={styles.infoPanelTitle}>{copy.pluginsTitle}</Text>
                  <Text style={styles.infoPanelText}>{copy.pluginsDescription}</Text>
                  <View style={styles.pluginRow}>
                    {getContentPlugins().map((plugin) => (
                      <View key={plugin.id} style={styles.pluginBadge}>
                        <Text style={styles.pluginBadgeText}>{plugin.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {settingsSection === 'about' && (
                <>
                  <View style={[styles.infoPanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                    <Text style={[styles.infoPanelTitle, { color: theme.text }]}>{copy.createdBy}</Text>
                    <View style={styles.contactRow}>
                      <Pressable
                        style={[styles.contactChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => openExternalUrl('https://github.com/fanshanng')}
                      >
                        <GitHubIcon color={theme.text} />
                        <Text style={[styles.contactText, { color: theme.subtle }]}>fanshanng</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.contactChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => openExternalUrl('https://github.com/HDdssX')}
                      >
                        <GitHubIcon color={theme.text} />
                        <Text style={[styles.contactText, { color: theme.subtle }]}>HDdss</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[styles.infoPanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                    <Text style={[styles.infoPanelTitle, { color: theme.text }]}>{copy.versionLabel}</Text>
                    <Text style={[styles.infoPanelText, { color: theme.muted }]}>v{APP_VERSION}</Text>
                    <Pressable
                      style={[styles.inlineUtilityButton, themedPanel, styles.versionCheckButton, checkingVersion && styles.disabledAction]}
                      onPress={() => {
                        void checkLatestVersion();
                      }}
                      disabled={checkingVersion}
                    >
                      <Text style={[styles.inlineUtilityButtonText, { color: theme.primary }]}>
                        {checkingVersion ? copy.checkingLatestVersion : copy.checkLatestVersion}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
              </Animated.View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Modal>

      <Modal visible={modelPickerVisible} animationType="none" transparent onRequestClose={() => closeBottomSheet()}>
        <View style={styles.modalSheetRoot} pointerEvents={bottomSheetMode === 'models' ? 'auto' : 'none'}>
          <Animated.View style={[styles.modalBackdropLayer, { opacity: bottomSheetBackdropOpacity }]} />
          <Pressable style={styles.modalDismissArea} onPress={() => closeBottomSheet()} />
          <Animated.View style={[styles.modalCardCompact, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ translateY: bottomSheetTranslateY }] }]}>
            <View style={styles.sessionHeader}>
              <View style={styles.modalHeading}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{copy.modelPickerTitle}</Text>
              </View>
              <Pressable
                style={[styles.modalPrimarySmall, styles.modelFetchButton, fetchingModels && styles.disabledAction]}
                onPress={() => {
                  void fetchModelsForProfile(activeProfile, apiKey);
                }}
                disabled={fetchingModels}
              >
                <Text style={styles.modalPrimaryText}>{fetchingModels ? copy.fetchingModels : copy.fetchModels}</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modelListContent}
            >
              {availableModels.length === 0 ? (
                <Text style={[styles.emptySessionText, { color: theme.muted }]}>{copy.modelsEmpty}</Text>
              ) : (
                availableModels.map((model) => (
                  <Pressable
                    key={model}
                    style={[
                      styles.modelOption,
                      { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                      activeProfile.model === model && [styles.modelOptionSelected, themedSelected],
                    ]}
                    onPress={() => applyModelToActiveProfile(model)}
                  >
                    <Text style={[styles.modelOptionText, { color: theme.text }, activeProfile.model === model && { color: theme.primary }]}>
                      {model}
                    </Text>
                    {activeProfile.model === model && <Text style={styles.profileStateActive}>{copy.activeModel}</Text>}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={apiProfilesVisible} animationType="none" transparent onRequestClose={() => closeBottomSheet()}>
        <View style={styles.modalSheetRoot} pointerEvents={bottomSheetMode === 'profiles' ? 'auto' : 'none'}>
          <Animated.View style={[styles.modalBackdropLayer, { opacity: bottomSheetBackdropOpacity }]} />
          <Pressable style={styles.modalDismissArea} onPress={() => closeBottomSheet()} />
          <Animated.View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ translateY: bottomSheetTranslateY }] }]}>
            <View style={styles.sessionHeader}>
              <View style={styles.modalHeading}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{copy.apiProfilesTitle}</Text>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>{copy.apiProfilesSubtitle}</Text>
              </View>
              <Pressable style={styles.modalPrimarySmall} onPress={createNewApiProfile}>
                <Text style={styles.modalPrimaryText}>{copy.newApiProfile}</Text>
              </Pressable>
            </View>

            {!bottomSheetContentReady ? (
              <View style={styles.modalWarmup}>
                <Text style={[styles.modalWarmupText, { color: theme.muted }]}>{copy.loading}</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.modalScroll}
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileChipRow}>
                  {persisted.profiles.map((profile) => {
                    const isActive = profile.id === persisted.activeProfileId;
                    const isEditing = profile.id === draftProfile.id;
                    return (
                      <Pressable
                        key={profile.id}
                        style={[
                          styles.profileChip,
                          themedPanel,
                          isEditing && [styles.profileChipSelected, themedSelected],
                        ]}
                        onPress={() => {
                          void selectDraftApiProfile(profile);
                        }}
                      >
                        <Text style={[styles.profileChipTitle, { color: theme.text }, isEditing && { color: theme.primary }]}>
                          {profile.label}
                        </Text>
                        <Text style={[styles.profileChipMeta, { color: theme.muted }, isEditing && { color: theme.primary }]} numberOfLines={1}>
                          {isActive ? copy.activeApiProfile : profile.model}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

              <View style={styles.formSectionHeader}>
                <Text style={[styles.sectionLabel, { color: theme.primary }]}>{copy.basicApiSettings}</Text>
                <Text style={[styles.sectionValue, themedMutedText]} numberOfLines={1}>
                  {draftProfile.model}
                </Text>
              </View>
              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.profileLabel}</Text>
              <TextInput
                value={draftProfile.label}
                onChangeText={(value) => setDraftProfile((current) => ({ ...current, label: value }))}
                style={[styles.fieldInput, themedFieldInput]}
                placeholder="My API"
                placeholderTextColor={theme.placeholder}
              />

              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.apiPreset}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                {API_PRESETS.map((preset) => {
                  const selected =
                    draftProfile.apiProtocol === preset.apiProtocol &&
                    draftProfile.baseUrl === preset.baseUrl &&
                    draftProfile.model === preset.model;
                  return (
                    <Pressable
                      key={preset.id}
                      style={[styles.suggestionChip, themedPanel, selected && [styles.selectedChip, themedSelected]]}
                      onPress={() => updateDraftProfileWithReasoningReset((current) => applyApiPreset(current, preset))}
                    >
                      <Text style={[styles.suggestionChipText, themedSubtleText, selected && { color: theme.primary }]}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.endpointMode}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                {API_PROTOCOL_OPTIONS.map((protocol) => (
                  <Pressable
                    key={protocol}
                    style={[styles.suggestionChip, themedPanel, draftProfile.apiProtocol === protocol && [styles.selectedChip, themedSelected]]}
                    onPress={() => updateDraftProfileWithReasoningReset((current) => ({ ...current, apiProtocol: protocol }))}
                  >
                    <Text
                      style={[
                        styles.suggestionChipText,
                        themedSubtleText,
                        draftProfile.apiProtocol === protocol && { color: theme.primary },
                      ]}
                    >
                      {apiProtocolLabel(protocol, uiLanguage)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={[styles.inlineHint, themedMutedText]}>{getEndpointHint(draftProfile.apiProtocol, uiLanguage)}</Text>

              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.baseUrl}</Text>
              <TextInput
                value={draftProfile.baseUrl}
                onChangeText={(value) => setDraftProfile((current) => ({ ...current, baseUrl: value }))}
                style={[styles.fieldInput, themedFieldInput]}
                autoCapitalize="none"
                placeholder="https://api.openai.com/v1"
                placeholderTextColor={theme.placeholder}
              />
              <Text style={[styles.inlineHint, themedMutedText]}>{copy.baseUrlHint}</Text>
              {usingInsecureHttp && <Text style={styles.warningText}>{copy.insecureHttpWarning}</Text>}

              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.apiKey}</Text>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                style={[styles.fieldInput, themedFieldInput]}
                autoCapitalize="none"
                secureTextEntry
                placeholder="sk-..."
                placeholderTextColor={theme.placeholder}
              />

              <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.model}</Text>
              <TextInput
                value={draftProfile.model}
                onChangeText={(value) => updateDraftProfileWithReasoningReset((current) => ({ ...current, model: value }))}
                style={[styles.fieldInput, themedFieldInput]}
                autoCapitalize="none"
                placeholder="gpt-5.4"
                placeholderTextColor={theme.placeholder}
              />
              <Pressable
                style={[styles.inlineUtilityButton, themedPanel, fetchingModels && styles.disabledAction]}
                onPress={() => {
                  void fetchModelsForDraftProfile();
                }}
                disabled={fetchingModels}
              >
                <Text style={[styles.inlineUtilityButtonText, { color: theme.primary }]}>
                  {fetchingModels ? copy.fetchingModels : copy.fetchModels}
                </Text>
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                {uniqueStrings([draftProfile.model, ...(draftProfile.cachedModels ?? []), ...availableModels, ...MODEL_SUGGESTIONS]).map((model) => (
                  <Pressable
                    key={model}
                    style={[styles.suggestionChip, themedPanel, draftProfile.model === model && [styles.selectedChip, themedSelected]]}
                    onPress={() => updateDraftProfileWithReasoningReset((current) => ({ ...current, model }))}
                  >
                    <Text style={[styles.suggestionChipText, themedSubtleText, draftProfile.model === model && { color: theme.primary }]}>
                      {model}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={[styles.inlineHint, themedMutedText]}>{getModelHint(draftProfile.model, uiLanguage)}</Text>

              <View style={[styles.compactSettingCard, themedPanel]}>
                <View style={styles.compactSettingHeader}>
                  <View style={styles.compactSettingTitleWrap}>
                    <Text style={[styles.compactSettingTitle, { color: theme.text }]}>{copy.reasoningEffort}</Text>
                    <Text style={[styles.compactSettingSubtitle, themedMutedText]}>
                      {copy.currentValue}: {draftProfile.reasoningEffort}
                    </Text>
                  </View>
                  <Pressable style={[styles.inlineUtilityButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => refreshReasoningEffortOptions(draftProfile)}>
                    <Text style={[styles.inlineUtilityButtonText, { color: theme.primary }]}>{copy.fetchReasoningEfforts}</Text>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
                  {reasoningEffortOptions.map((effort) => (
                    <Pressable
                      key={effort}
                      style={[styles.suggestionChip, { backgroundColor: theme.surface, borderColor: theme.border }, draftProfile.reasoningEffort === effort && [styles.selectedChip, themedSelected]]}
                      onPress={() => applyReasoningEffort(effort)}
                    >
                      <Text
                        style={[
                          styles.suggestionChipText,
                          themedSubtleText,
                          draftProfile.reasoningEffort === effort && { color: theme.primary },
                        ]}
                      >
                        {effort}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={[styles.inlineHint, themedMutedText]}>
                  {reasoningEffortsFetched
                    ? inferReasoningEffortOptions(draftProfile).length > 1
                      ? copy.reasoningEffortsReady
                      : copy.reasoningEffortsUnavailable
                    : getReasoningEffortHint(draftProfile.model, draftProfile.reasoningEffort, uiLanguage)}
                </Text>
              </View>

              <Pressable
                style={[styles.advancedToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setAdvancedApiSettingsOpen((current) => !current)}
              >
                <View style={styles.advancedToggleTextWrap}>
                  <Text style={[styles.advancedToggleTitle, { color: theme.text }]}>{copy.advancedApiSettings}</Text>
                  <Text style={[styles.advancedToggleSubtitle, themedMutedText]} numberOfLines={1}>
                    {getAdvancedApiSummary(draftProfile)}
                  </Text>
                  {/*
                    {draftProfile.storeResponses ? copy.storageEnabled : copy.storageDisabled}
                    {draftProfile.projectId ? ` · ${copy.projectId}` : ''}
                    {draftProfile.organization ? ` · ${copy.organization}` : ''}
                    {draftProfile.systemPrompt ? ` · ${copy.systemPrompt}` : ''}
                  */}
                </View>
                <Text style={[styles.advancedToggleAction, { color: theme.primary }]}>
                  {advancedApiSettingsOpen ? copy.hideAdvancedSettings : copy.showAdvancedSettings}
                </Text>
              </Pressable>

              <SlideFadePresence visible={advancedApiSettingsOpen} from="top" style={[styles.advancedPanel, themedPanel]}>
                  {draftProfile.apiProtocol === 'responses' && (
                    <>
                      <View style={styles.switchRow}>
                        <View style={styles.switchTextWrap}>
                          <Text style={[styles.switchTitle, { color: theme.text }]}>{copy.responseStorage}</Text>
                          <Text style={[styles.switchSubtitle, themedMutedText]}>
                            {draftProfile.storeResponses ? copy.storageEnabled : copy.storageDisabled}
                          </Text>
                        </View>
                        <Pressable
                          style={[styles.compactSwitch, draftProfile.storeResponses && styles.compactSwitchOn]}
                          onPress={() => setDraftProfile((current) => ({ ...current, storeResponses: !current.storeResponses }))}
                        >
                          <View style={[styles.compactSwitchThumb, draftProfile.storeResponses && styles.compactSwitchThumbOn]} />
                        </Pressable>
                      </View>
                      <Text style={[styles.inlineHint, themedMutedText]}>
                        {getProtocolStorageHint(draftProfile.apiProtocol, draftProfile.storeResponses, uiLanguage)}
                      </Text>
                    </>
                  )}

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.projectId}</Text>
                  <TextInput
                    value={draftProfile.projectId}
                    onChangeText={(value) => setDraftProfile((current) => ({ ...current, projectId: value }))}
                    style={[styles.fieldInput, themedFieldInput]}
                    autoCapitalize="none"
                    placeholder="Optional"
                    placeholderTextColor={theme.placeholder}
                  />

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.organization}</Text>
                  <TextInput
                    value={draftProfile.organization}
                    onChangeText={(value) => setDraftProfile((current) => ({ ...current, organization: value }))}
                    style={[styles.fieldInput, themedFieldInput]}
                    autoCapitalize="none"
                    placeholder="Optional"
                    placeholderTextColor={theme.placeholder}
                  />

                  <Text style={[styles.fieldLabel, themedSubtleText]}>{copy.systemPrompt}</Text>
                  <TextInput
                    value={draftProfile.systemPrompt}
                    onChangeText={(value) => setDraftProfile((current) => ({ ...current, systemPrompt: value }))}
                    style={[styles.fieldInput, themedFieldInput, styles.fieldInputMultiline]}
                    multiline
                    placeholder="Optional long-lived instruction"
                    placeholderTextColor={theme.placeholder}
                  />
                  <Text style={[styles.inlineHint, themedMutedText]}>{copy.advancedConfigHint}</Text>
              </SlideFadePresence>

                <View style={styles.profileUtilityRow}>
                  <Pressable
                    style={[styles.secondaryActionCard, themedPanel, testingProfile && styles.disabledAction]}
                    onPress={handleTestApiProfile}
                    disabled={testingProfile || savingProfile}
                  >
                    <Text style={[styles.secondaryActionLabel, { color: theme.text }]}>
                      {testingProfile ? copy.testingApiConnection : copy.testApiConnection}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.dangerButtonCompact}
                    onPress={() => confirmDeleteApiProfile(draftProfile.id)}
                    disabled={testingProfile || savingProfile}
                  >
                    <Text style={styles.dangerButtonText}>{copy.deleteApiProfile}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalGhost, { borderColor: theme.border }]} onPress={() => closeBottomSheet()}>
                <Text style={[styles.modalGhostText, { color: theme.subtle }]}>{copy.close}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalPrimary, (!bottomSheetContentReady || savingProfile) && styles.disabledAction]}
                onPress={handleSaveApiProfile}
                disabled={!bottomSheetContentReady || savingProfile}
              >
                <Text style={styles.modalPrimaryText}>{savingProfile ? copy.saving : copy.done}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={composerExpanded} animationType="slide" onRequestClose={() => setComposerExpanded(false)}>
        <SafeAreaView style={[styles.fullComposerScreen, { backgroundColor: theme.surface }]}>
          <View style={styles.fullComposerHeader}>
            <Pressable style={[styles.fullComposerClose, themedPanel]} onPress={() => setComposerExpanded(false)}>
              <X size={19} color={theme.text} strokeWidth={2.4} />
            </Pressable>
          </View>
          <TextInput
            value={composerText}
            onChangeText={setComposerText}
            editable={!composerDisabled}
            multiline
            autoFocus
            scrollEnabled
            placeholder={copy.composerPlaceholder}
            placeholderTextColor={theme.placeholder}
            style={[styles.fullComposerInput, themedFieldInput]}
            textAlignVertical="top"
          />
          <View style={styles.fullComposerActions}>
            <Pressable
              style={[styles.fullComposerSend, (!sending && !canSend) && styles.disabledAction]}
              onPress={() => {
                setComposerExpanded(false);
                if (sending) {
                  handleStopGenerating();
                } else {
                  void handleSend();
                }
              }}
              disabled={!sending && !canSend}
            >
              {sending ? <StopIcon /> : <SendIcon />}
              <Text style={styles.fullComposerSendText}>{sending ? copy.stopGenerating : copy.send}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {sessionsVisible && (
        <View
          style={styles.drawerModalRoot}
          pointerEvents="box-none"
          onTouchStart={handleSessionTouchStart}
          onTouchMove={handleSessionTouchMove}
          onTouchEnd={handleSessionTouchEnd}
          onTouchCancel={handleSessionTouchEnd}
        >
          <Animated.View style={[styles.drawerMainDismissLayer, { transform: [{ translateX: chatSceneTranslateX }] }]}>
            <Pressable
              style={styles.drawerUnderlayPressable}
              onPress={() => closeSessionsDrawer()}
              {...sessionDrawerPanResponder.panHandlers}
              onTouchStart={handleSessionTouchStart}
              onTouchMove={handleSessionTouchMove}
              onTouchEnd={handleSessionTouchEnd}
              onTouchCancel={handleSessionTouchEnd}
            />
          </Animated.View>
          <Animated.View
            style={[styles.drawerBackdrop, { width: sessionDrawerWidth, transform: [{ translateX: sessionDrawerTranslateX }] }]}
            {...sessionDrawerPanResponder.panHandlers}
            onTouchStart={handleSessionTouchStart}
            onTouchMove={handleSessionTouchMove}
            onTouchEnd={handleSessionTouchEnd}
            onTouchCancel={handleSessionTouchEnd}
          >
            <SafeAreaView
              style={[styles.sessionDrawer, { backgroundColor: theme.surface }]}
              onTouchStart={handleSessionTouchStart}
              onTouchMove={handleSessionTouchMove}
              onTouchEnd={handleSessionTouchEnd}
              onTouchCancel={handleSessionTouchEnd}
            >
              <View style={[styles.drawerHeader, { paddingTop: drawerTopInset }]}>
                <View style={styles.drawerHeaderActions}>
                  <Pressable
                    style={[
                      styles.drawerIconButton,
                      { backgroundColor: theme.surface, borderColor: sessionSearchVisible ? theme.primary : theme.border },
                      sessionSearchVisible && styles.drawerIconButtonActive,
                    ]}
                    onPress={toggleSessionSearch}
                    accessibilityRole="button"
                    accessibilityLabel={copy.sessionSearchPlaceholder}
                  >
                    <SearchIcon color={theme.text} />
                  </Pressable>
                  <Pressable
                    style={[styles.drawerIconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={openSettingsFromSessions}
                    accessibilityRole="button"
                    accessibilityLabel={copy.settings}
                  >
                    <SettingsIcon color={theme.text} />
                  </Pressable>
                </View>
              </View>

              <SlideFadePresence visible={sessionSearchVisible} from="top" style={styles.drawerSearchWrap}>
                  {sessionSearchNeedsRaise && (
                    <Pressable
                      style={[styles.drawerSearchRaiseButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => setSessionSearchRaised((raised) => !raised)}
                      accessibilityRole="button"
                      accessibilityLabel={copy.expandComposer}
                    >
                      <DirectionIcon direction={sessionSearchIsRaised ? 'down' : 'up'} color={theme.muted} />
                    </Pressable>
                  )}
                  <TextInput
                    value={sessionSearchQuery}
                    onChangeText={setSessionSearchQuery}
                    style={[
                      styles.drawerSearchInput,
                      sessionSearchNeedsRaise && styles.drawerSearchInputWithRaise,
                      sessionSearchIsRaised && styles.drawerSearchInputRaised,
                      { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder={copy.sessionSearchPlaceholder}
                    placeholderTextColor={theme.placeholder}
                    autoFocus
                    multiline={sessionSearchIsRaised}
                    scrollEnabled={sessionSearchIsRaised}
                    textAlignVertical="top"
                  />
              </SlideFadePresence>

              <View style={styles.drawerSectionHeader}>
                <View style={styles.drawerSectionTitleWrap}>
                  <Text style={[styles.drawerSectionLabel, { color: theme.text }]}>{copy.recordsSection}</Text>
                </View>
                <Pressable
                  style={[
                    styles.drawerHeaderButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    sessionSelectionMode && [styles.drawerHeaderButtonActive, themedSelected],
                    persisted.conversations.length === 0 && styles.disabledAction,
                  ]}
                  onPress={toggleSessionSelectionMode}
                  disabled={persisted.conversations.length === 0}
                >
                  <Text
                    style={[
                      styles.drawerHeaderButtonText,
                      { color: theme.subtle },
                      sessionSelectionMode && { color: theme.primary },
                    ]}
                  >
                    {sessionSelectionMode ? copy.cancelSelection : copy.selectSessions}
                  </Text>
                </Pressable>
                {sessionSelectionMode && (
                  <Pressable
                    style={[styles.drawerCopyButton, selectedSessionIds.length === 0 && styles.disabledAction]}
                    onPress={() => {
                      void copySelectedSessionExports();
                    }}
                    disabled={selectedSessionIds.length === 0}
                  >
                    <Text style={styles.drawerCopyButtonText}>{copy.copySelectedSessions}</Text>
                  </Pressable>
                )}
                {sessionSelectionMode && (
                  <Pressable
                    style={[styles.drawerDeleteButton, selectedSessionIds.length === 0 && styles.disabledAction]}
                    onPress={confirmDeleteSelectedSessions}
                    disabled={selectedSessionIds.length === 0}
                  >
                    <Text style={styles.drawerDeleteButtonText}>{copy.deleteSelectedSessions}</Text>
                  </Pressable>
                )}
              </View>
              {sessionSelectionMode && (
                <Text style={[styles.drawerSelectionText, { color: theme.muted }]}>{copy.selectedSessionsCount(selectedSessionIds.length)}</Text>
              )}

              <FlatList
                {...sessionDrawerPanResponder.panHandlers}
                style={styles.drawerHistoryScroll}
                contentContainerStyle={styles.drawerHistoryContent}
                data={visibleConversations}
                keyExtractor={(conversation) => conversation.id}
                renderItem={renderDrawerSession}
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                keyboardShouldPersistTaps="handled"
                onTouchStart={handleSessionTouchStart}
                onTouchMove={handleSessionTouchMove}
                onTouchEnd={handleSessionTouchEnd}
                onTouchCancel={handleSessionTouchEnd}
                nestedScrollEnabled
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={Platform.OS === 'android'}
                ListFooterComponent={
                  <View
                    collapsable={false}
                    style={[styles.drawerHistoryFooterSwipeArea, { minHeight: drawerBlankSwipeFooterHeight }]}
                    {...sessionDrawerPanResponder.panHandlers}
                    onTouchStart={handleSessionTouchStart}
                    onTouchMove={handleSessionTouchMove}
                    onTouchEnd={handleSessionTouchEnd}
                    onTouchCancel={handleSessionTouchEnd}
                  />
                }
                ListEmptyComponent={
                  <Text style={[styles.emptySessionText, { color: theme.muted }]}>
                    {persisted.conversations.length === 0 ? copy.sessionsEmpty : copy.sessionsNoMatches}
                  </Text>
                }
              />

              <Pressable
                style={[
                  styles.drawerNewChatButton,
                  {
                    backgroundColor: isDark ? theme.primary : '#111827',
                    shadowColor: isDark ? '#000000' : '#0F172A',
                  },
                ]}
                onPress={createNewSession}
              >
                <PlusIcon light />
                <Text style={styles.drawerNewChatText}>{copy.newSession}</Text>
              </Pressable>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      <Modal visible={!!sessionContextConversation} animationType="fade" transparent onRequestClose={() => setSessionContextMenuId(null)}>
        <Pressable style={styles.contextMenuBackdrop} onPress={() => setSessionContextMenuId(null)}>
          <View style={styles.sessionContextMenu}>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                if (sessionContextConversation) {
                  togglePinConversation(sessionContextConversation.id);
                }
              }}
            >
              <View style={styles.contextMenuIconWrap}>
                <PinIcon light />
              </View>
              <Text style={styles.contextMenuText}>
                {sessionContextConversation?.pinned
                  ? uiLanguage === 'zh' ? '取消置顶' : 'Unpin'
                  : uiLanguage === 'zh' ? '置顶' : 'Pin'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                if (sessionContextConversation) {
                  promptRenameConversation(sessionContextConversation);
                }
              }}
            >
              <View style={styles.contextMenuIconWrap}>
                <EditIcon />
              </View>
              <Text style={styles.contextMenuText}>{copy.renameSession}</Text>
            </Pressable>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => {
                if (sessionContextConversation) {
                  confirmDeleteConversation(sessionContextConversation.id);
                }
              }}
            >
              <View style={styles.contextMenuIconWrap}>
                <TrashIcon />
              </View>
              <Text style={[styles.contextMenuText, styles.contextMenuDangerText]}>{copy.delete}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!renamingConversation} animationType="fade" transparent>
        <View style={styles.modalBackdropCentered}>
          <View style={[styles.renameCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{copy.renameSessionTitle}</Text>
            <TextInput
              value={draftSessionTitle}
              onChangeText={setDraftSessionTitle}
              style={[styles.fieldInput, themedFieldInput, styles.renameInput]}
              placeholder={copy.renameSessionPlaceholder}
              placeholderTextColor={theme.placeholder}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalGhost, { borderColor: theme.border }]} onPress={closeRenameModal}>
                <Text style={[styles.modalGhostText, { color: theme.subtle }]}>{copy.cancel}</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={saveRenamedConversation}>
                <Text style={styles.modalPrimaryText}>{copy.save}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  mainScene: {
    flex: 1,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  sessionSwitcher: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  modelPill: {
    maxWidth: '100%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '800',
    flexShrink: 1,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatMenuDismiss: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9,
  },
  chatMenu: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 66 : 74,
    right: 14,
    zIndex: 10,
    minWidth: 150,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  chatMenuItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  chatMenuText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  chatMenuDangerText: {
    color: '#DC2626',
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRotateDown: {
    transform: [{ rotate: '180deg' }],
  },
  chatShell: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  emptyStateCard: {
    marginTop: 36,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  emptyStateTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  pendingRail: {
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 6,
  },
  pendingChip: {
    maxWidth: 180,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#D7DEE8',
  },
  pendingChipType: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  pendingChipText: {
    color: '#334155',
    fontSize: 13,
  },
  composerDock: {
    marginHorizontal: 12,
    marginTop: 0,
  },
  composerRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  composerInputWrap: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    padding: 3,
  },
  composerInput: {
    width: '100%',
    minHeight: 38,
    maxHeight: 210,
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
    paddingLeft: 9,
    paddingRight: 41,
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: Platform.OS === 'android' ? 6 : 7,
    textAlignVertical: 'top',
  },
  composerInputWithActions: {
    paddingRight: 41,
  },
  composerInputSingleLine: {
    paddingTop: Platform.OS === 'android' ? 0 : 8,
    paddingBottom: Platform.OS === 'android' ? 0 : 7,
    includeFontPadding: false,
  },
  composerOverlayActions: {
    position: 'absolute',
    top: 5,
    right: 5,
    bottom: 5,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  composerOverlayButton: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E0EA',
  },
  composerExpandButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 3,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  composerOverlaySend: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  attachOptionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  attachOption: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  attachOptionText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
  },
  fullComposerScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 28 : 10,
    paddingBottom: 14,
  },
  fullComposerHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  fullComposerTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 19,
    fontWeight: '900',
  },
  fullComposerClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullComposerInput: {
    flex: 1,
    marginTop: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    color: '#111827',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fullComposerActions: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
  },
  fullComposerGhost: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D8E0EA',
  },
  fullComposerGhostText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },
  fullComposerSend: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
  },
  fullComposerSendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledAction: {
    opacity: 0.6,
  },
  modalSheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  drawerModalRoot: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  drawerUnderlay: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  drawerUnderlayPressable: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  drawerMainDismissLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 21,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
    elevation: 12,
  },
  sessionDrawer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 20 : 8,
  },
  drawerDismissArea: {
    flex: 1,
  },
  modalDismissArea: {
    flex: 1,
    width: '100%',
  },
  modalBackdropCentered: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  contextMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
    justifyContent: 'center',
    paddingHorizontal: 42,
  },
  sessionContextMenu: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
    borderRadius: 20,
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#273449',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  contextMenuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  contextMenuIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextMenuText: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  contextMenuDangerText: {
    color: '#FCA5A5',
  },
  modalCard: {
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCardCompact: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingsScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  settingsScreenSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },
  settingsScreenScroll: {
    flex: 1,
    marginTop: 18,
  },
  settingsContentScene: {
    flexGrow: 1,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginTop: 2,
  },
  modalHeading: {
    flex: 1,
    paddingRight: 12,
  },
  modalSubtitle: {
    color: '#64748B',
    marginTop: 8,
    lineHeight: 19,
  },
  modalScroll: {
    marginTop: 18,
  },
  modalWarmup: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWarmupText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionLabel: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldInputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inlineUtilityButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  versionCheckButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  inlineUtilityButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },
  settingsNavItem: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsNavText: {
    flex: 1,
  },
  settingsNavTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  settingsNavSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 5,
  },
  drawerHeader: {
    minHeight: 54,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  drawerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerIconButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  drawerHeaderHint: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  drawerHeaderButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHeaderButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  drawerHeaderButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },
  drawerHeaderButtonTextActive: {
    color: '#2563EB',
  },
  drawerSearchWrap: {
    position: 'relative',
    marginHorizontal: 22,
    marginTop: 10,
  },
  drawerSearchInput: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
  },
  drawerSearchInputWithRaise: {
    paddingRight: 46,
  },
  drawerSearchInputRaised: {
    minHeight: 102,
    maxHeight: 146,
  },
  drawerSearchRaiseButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0EA',
  },
  drawerSectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  drawerSectionTitleWrap: {
    flex: 1,
    minWidth: 132,
  },
  drawerSectionLabel: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  drawerCopyButton: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerCopyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  drawerDeleteButton: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerDeleteButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },
  drawerSelectionText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 22,
    marginBottom: 6,
  },
  drawerHistoryScroll: {
    flex: 1,
  },
  drawerHistoryContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 2,
    paddingBottom: 108,
  },
  drawerHistoryFooterSwipeArea: {
    width: '100%',
  },
  drawerSessionItem: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    minHeight: 48,
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: '#E6ECF2',
    backgroundColor: 'transparent',
  },
  drawerSessionItemActive: {
    borderBottomColor: '#BFDBFE',
    backgroundColor: 'transparent',
  },
  drawerSessionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  drawerSessionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 28,
  },
  drawerSessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: 8,
  },
  drawerSessionTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  drawerSessionTime: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
  drawerSessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 9,
    marginLeft: 4,
  },
  sessionSelectMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionSelectMarkActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  drawerNewChatButton: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'android' ? 24 : 28,
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: '#111827',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  drawerNewChatText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  modelListContent: {
    paddingBottom: 10,
  },
  modelOption: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modelOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modelOptionText: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  modelOptionTextSelected: {
    color: '#1D4ED8',
  },
  renameInput: {
    marginTop: 16,
  },
  renameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingOptionGroup: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  settingOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  settingOptionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  settingOptionRadioSelected: {
    borderColor: '#2563EB',
  },
  settingOptionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  settingOptionText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  secondaryActionLabel: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
  },
  profileSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileSummaryTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  profileSummaryBadge: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  profileSummaryText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  profileSummaryAction: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  infoPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 10,
  },
  infoPanelTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  infoPanelText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  pluginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pluginBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pluginBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  contactChip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  contactIcon: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '900',
  },
  contactText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  profileChipRow: {
    gap: 8,
    paddingBottom: 12,
  },
  profileChip: {
    width: 138,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  profileChipSelected: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  profileChipTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  profileChipTitleSelected: {
    color: '#1D4ED8',
  },
  profileChipMeta: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  profileChipMetaSelected: {
    color: '#2563EB',
  },
  formSectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
  },
  sectionValue: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  profileList: {
    gap: 10,
    marginBottom: 12,
  },
  profileItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileItemSelected: {
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  profileItemMain: {
    flex: 1,
  },
  profileItemTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  profileItemSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },
  profileStateText: {
    minWidth: 48,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  profileStateActive: {
    color: '#1D4ED8',
  },
  suggestionRow: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  suggestionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedChip: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
  },
  selectedChipText: {
    color: '#1D4ED8',
  },
  binaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  binaryChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  binaryChipText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  compactSettingCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  compactSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compactSettingTitleWrap: {
    flex: 1,
  },
  compactSettingTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  compactSettingSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  advancedToggle: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advancedToggleTextWrap: {
    flex: 1,
  },
  advancedToggleTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  advancedToggleSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  advancedToggleAction: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  advancedPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  switchRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  switchSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  compactSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'center',
  },
  compactSwitchOn: {
    backgroundColor: '#2563EB',
  },
  compactSwitchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  compactSwitchThumbOn: {
    alignSelf: 'flex-end',
  },
  inlineHint: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  warningText: {
    color: '#B45309',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  dangerButton: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dangerButtonCompact: {
    flex: 1,
    marginTop: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  profileUtilityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  dangerButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalGhost: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalGhostText: {
    color: '#334155',
    fontWeight: '700',
  },
  modalPrimary: {
    borderRadius: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalPrimarySmall: {
    borderRadius: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelFetchButton: {
    minHeight: 46,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptySessionText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
  sessionItem: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sessionActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
  },
  sessionMeta: {
    flex: 1,
  },
  sessionTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  sessionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionActionText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
});
