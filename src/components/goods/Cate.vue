<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="cateList"
        style="width: 100%;margin-bottom: 20px;"
        row-key="cat_id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="商品分类名称" sortable width="180"></el-table-column>
        <el-table-column label="是否有效" sortable width="180">
          <template slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted==true" style="color:lightgreen;"></i>
            <i class="el-icon-error" v-if="scope.row.cat_deleted==false" style="color:red;"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序" sortable width="180">
          <template slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" size="mini" v-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="info" size="mini" v-if="scope.row.cat_level===2">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" sortable width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "cate",
  data() {
    return {
      cateList: [],
      queryInfo: {
        type: "",
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addCategoryDialogVisible: false,
      addCateForm: {
        //   分类名
        cat_name: "",
        //   分类父ID
        cat_pid: 0,
        //   分类等级
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //   父级分类数据的列表
      parentCateList: [],
      selectedKeys: []
    };
  },
  methods: {
    getCateList() {
      this.$http.get("categories", { params: this.queryInfo }).then(data => {
        if (data.data.meta.status != 200) {
          this.$message.error("获取商品分类列表失败");
        } else {
          this.$message.success("获取商品分类列表成功！");
          this.cateList = data.data.data.result;
          this.total = data.data.data.total;
        }
      });
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCategoryDialog() {
      this.getParentCateList();
      this.addCategoryDialogVisible = true;
    },
    getParentCateList() {
      this.$http
        .get("categories", { params: { type: 2 } })
        .then(({ data: res }) => {
          if (res.meta.status != 200) {
            this.$message.error("获取父级分类数据失败！");
          } else {
            this.$message.success("获取父级分类数据成功！");
            this.parentCateList = res.data;
            // 显示父级分类数据
            console.log(this.parentCateList);
          }
        });
    },
    parentCateChange() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return;
        else {
          this.$http
            .post("categories", this.addCateForm)
            .then(({ data: res }) => {
              if (res.meta.status != 201) {
                this.$message.error("添加分类失败");
              } else {
                this.$message.success("添加分类成功");
                this.getCateList();
                this.addCategoryDialogVisible = false;
              }
            });
        }
      });
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style lang="less" scoped>
// 自定义element树表格图标 https://www.cnblogs.com/lgnblog/p/12014758.html
/deep/.el-icon-arrow-right:before {
  content: "\e6d9";
}

/deep/.el-table__expand-icon--expanded .el-icon-arrow-right:before {
  content: "\e6d8" !important;
}

/deep/.el-table__expand-icon--expanded {
  -webkit-transform: rotate(0deg);

  transform: rotate(0deg);
}

/deep/.el-table__expand-icon {
  border: 1px solid #e7e7e7;

  padding: 1px;
}
</style>