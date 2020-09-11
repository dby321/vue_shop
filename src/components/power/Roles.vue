<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="roleList" style="width: 100%" border stripe>
        <!-- 设置展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',index1===0?'bdtop':'','vcenter']"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                  :class="[index2===0?'':'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="角色操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 属性控件 -->
      <el-tree
        :data="rightList"
        :props="setRightTreeProps"
        ref="setRightTreeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightList: [],
      setRightTreeProps: {
        label: "authName",
        children: "children"
      },
      defKeys: [],
      roleId:""
    };
  },
  methods: {
    getRoleList() {
      this.$http.get("roles").then(data => {
        console.log(data);
        if (data.data.meta.status != 200) {
          this.$message.error("获取角色列表失败！");
        } else {
          this.$message.success(data.data.meta.msg);
          this.roleList = data.data.data;
          console.log(data.data.data);
        }
      });
    },
    removeRightById(role, rightId) {
      this.$confirm("此操作将永久删除该权限, 是否继续?", "删除权限", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(data => {
            if (data.data.meta.status != 200) {
              this.$message({
                type: "error",
                message: "删除失败"
              });
            } else {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              //   this.getRoleList();
              role.children = data.data.data;
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    showSetRightDialog(role) {
        this.roleId=role.id;
      this.$http.get("rights/tree").then(data => {
        if (data.data.meta.status != 200) {
          this.$message.error("获取权限列表失败");
        } else {
          this.$message.success("获取权限列表成功");
          this.rightList = data.data.data;
          this.getLeafKeys(role, this.defKeys);
        }
      });
      this.setRightDialogVisible = true;
    },
    // 通过递归形式获得所有角色三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr);
        });
      }
    },
    setRightDialogClosed(){
        this.defKeys=[];
    },
    allotRights(){
        const keys=[...this.$refs.setRightTreeRef.getCheckedKeys(),...this.$refs.setRightTreeRef.getHalfCheckedKeys()];
        const idStr=keys.join(",");
        this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr}).then(data=>{
            if(data.data.meta.status!=200){
                this.$message.error("分配权限失败！");
            }else{
                this.$message.success("分配权限成功！");
                this.getRoleList();
                this.setRightDialogVisible=false;
            }
        })
    }
  },
  created() {
    this.getRoleList();
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>