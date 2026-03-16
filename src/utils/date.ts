/**
 * 日期时间格式化工具
 */

/**
 * 将ISO时间格式化为 "YYYY-MM-DD HH:mm:ss"
 * @param isoString - ISO格式的日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 将ISO时间格式化为 "YYYY-MM-DD"
 * @param isoString - ISO格式的日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 将ISO时间格式化为 "HH:mm:ss"
 * @param isoString - ISO格式的日期字符串
 * @returns 格式化后的时间字符串
 */
export function formatTime(isoString: string): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
