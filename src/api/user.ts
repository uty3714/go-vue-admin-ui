import type { Result, LoginResult } from "./system";

// 类型别名，保持与原始代码兼容
export type UserResult = Result<LoginResult>;

// 重新导出system中的方法，保持兼容性
export { login as getLogin } from "./system";
