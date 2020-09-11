<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限层级">
            <template slot-scope="scope"> 
                <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                <el-tag type="success" v-if="scope.row.level==='1'">二级</el-tag>
                <el-tag type="danger" v-if="scope.row.level==='2'">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "rights",
  data() {
    return {
        rightsList:[]
    };
  },
  methods: {
      getRightsList(){
        this.$http.get("rights/list").then(data=>{
            if(data.data.meta.status!=200){
                this.$message.error("获取权限列表失败")
            }else{
                this.$message.success(data.data.meta.msg);
                this.rightsList=data.data.data;
            }
        })
      }
  },
  created() {
      this.getRightsList();
  },
};
</script>

<style lang="less" scoped>
</style>