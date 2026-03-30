import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type Result,
  type LoginResult,
  login,
  refreshToken
} from "@/api/system";
import { useMultiTagsStoreHook } from "./multiTags";
import {
  type DataInfo,
  setToken,
  removeToken,
  userKey,
  getToken
} from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data: { username: string; password: string }) {
      return new Promise<Result<LoginResult>>((resolve, reject) => {
        login(data)
          .then(res => {
            if (res.code === 200) {
              // 转换后端返回格式到前端存储格式
              // 从后端返回的perms字段获取权限（如果有），否则根据角色设置默认权限
              const userPerms = res.data.userInfo.perms || [];
              const permissions = userPerms.length > 0 ? userPerms : ["*:*:*"];

              const tokenData = {
                accessToken: res.data.token,
                expires: new Date(res.data.expiresAt * 1000), // 转换为Date对象
                refreshToken: res.data.token, // 后端暂无refreshToken，先用token代替
                avatar: res.data.userInfo.avatar || "",
                username: res.data.userInfo.username,
                nickname:
                  res.data.userInfo.nickname || res.data.userInfo.username,
                roles: res.data.userInfo.roles
                  ? res.data.userInfo.roles
                  : ["admin"],
                permissions: permissions
              };
              setToken(tokenData as any);

              // 更新store中的权限信息
              this.SET_PERMS(permissions);
              this.SET_ROLES(tokenData.roles);
            }
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data: {
      accessToken: string;
      refreshToken: string;
      expires: Date;
    }) {
      return new Promise<any>((resolve, _reject) => {
        // 调用后端刷新token接口
        refreshToken()
          .then(res => {
            if (res.code === 200 && res.data) {
              // 更新token信息
              const tokenData = {
                ...getToken(),
                accessToken: res.data.token || data.accessToken,
                refreshToken: res.data.token || data.refreshToken,
                expires: res.data.expiresAt
                  ? new Date(res.data.expiresAt * 1000)
                  : data.expires
              };
              setToken(tokenData as any);
              resolve({
                code: 200,
                data: tokenData
              });
            } else {
              // 如果后端未实现或返回错误，保持原token
              resolve({
                code: 200,
                data: {
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  expires: data.expires
                }
              });
            }
          })
          .catch(() => {
            // 后端未实现刷新接口，保持原token
            resolve({
              code: 200,
              data: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expires: data.expires
              }
            });
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
