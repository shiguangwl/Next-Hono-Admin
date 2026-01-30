/**
 * UI 组件统一导出
 * @description 从 HeroUI 重新导出常用组件，便于项目内统一引用
 */

// 类型导出
export type { Selection } from "@heroui/react";
// 基础组件
// 表单组件
// 选择器组件
// 弹出层组件
// 导航组件
// 数据展示
// 状态组件
export {
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  CloseButton,
  Collection,
  ComboBox,
  Description,
  Dropdown,
  EmptyState,
  FieldError,
  Form,
  Header,
  Input,
  InputGroup,
  Kbd,
  Label,
  Link,
  ListBox,
  Modal,
  Popover,
  Select,
  Separator,
  Spinner,
  Surface,
  Switch,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
// 自定义组件
export { ErrorPage, type ErrorPageProps, type ErrorType } from "./error-page";
export { PageContainer, PageHeader, PageSection } from "./page-header";
export {
  ServiceUnavailable,
  type ServiceErrorType,
  type ServiceUnavailableProps,
} from "./service-unavailable";
