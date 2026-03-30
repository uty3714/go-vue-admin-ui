const Layout = () => import("@/layout/index.vue");

export default {
  path: "/profile",
  name: "Profile",
  component: Layout,
  redirect: "/profile/index",
  meta: {
    title: "个人中心",
    showLink: false,
    rank: 99
  },
  children: [
    {
      path: "/profile/index",
      name: "ProfileIndex",
      component: () => import("@/views/profile/index.vue"),
      meta: {
        title: "个人中心"
      }
    }
  ]
} satisfies RouteConfigsTable;
