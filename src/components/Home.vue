<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/img/4a1cab38-303a-4969-99a1-fcf9c5578dfb.jpg" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <el-button class="toggle-button" type="primary" icon="el-icon-more" @click="toggleCollapse"></el-button>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#359bff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- 由于item.id是数值型，需要类型转换成字符串 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      menuList: [],
      iconsObj: {
        "125": "fa fa-users",
        "103": "fa fa-cube",
        "101": "fa fa-shopping-bag",
        "102": "fa fa-file-text",
        "145": "fa fa-area-chart"
      },
      isCollapse:false,
      activePath:""
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    getMenuList() {
      this.$http.get("menus").then(data => {
        console.log("获取左侧菜单", data);
        if (data.data.meta.status != 200) {
          this.$message.error(data.data.meta.msg);
        } else {
          this.menuList = data.data.data;
          console.log("左侧菜单数据", this.menuList);
        }
      });
    },
    // 点击按钮切换折叠和展开
    toggleCollapse(){
        this.isCollapse=!this.isCollapse;
    },
    saveNavState(activePath){
        window.sessionStorage.setItem("activePath",activePath);
        this.activePath=activePath;
    }
  },
  created() {
    this.getMenuList();
    this.activePath=window.sessionStorage.getItem("activePath");
  }
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  width: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    > div {
      display: flex;
      align-items: center;
      img {
        height: 100%;
      }
      span {
        color: #fff;
        font-size: 20px;
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;

    .toggle-button {
      position: relative;
      left: 50%;
      transform: translate(-50%);
      width: 100%;
      background-color:#333744;
      border:0;
    }
    .el-menu {
      border-right: 0;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
}
.fa {
  margin-right: 10px;
}
</style>