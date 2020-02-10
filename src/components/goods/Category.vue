<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index
                index-text="#" border>
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: green;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%" @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- options指定级联选择器数据源 -->
                    <!-- props用来指定配置对象 -->
                    <el-cascader expandTrigger="hover" :options="parentCateList" :props="cascaderProps"
                     v-model="selectedKeys" @change="parentCateChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 查询条件
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                //商品分类的数据列表,默认为空
                catelist: [],
                total: 0,
                // 为table指定列
                columns: [
                    {
                        label: '分类名称',
                        prop: 'cat_name'
                    },
                    {
                        label: '是否有效',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'isok'
                    },
                    {
                        label: '排序',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'order'
                    },
                    {
                        label: '操作',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用模板名称
                        template: 'opt'
                    }
                ],
                addCatedialogVisible: false,
                // 添加分类的数据对象
                addCateForm: {
                    cat_name: '',
                    // 父级分类的id
                    cat_pid: 0,
                    // 分类的等级
                    cat_level: 0
                },
                // 添加分类表单rules
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器的配置对象
                cascaderProps:{
                    value:'cat_id',
                    label:'cat_name',
                    children:'children'
                },
                // 选中的父级分类的id数组
                selectedKeys:[]
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            // 获取分类列表
            getCateList() {
                this.$http
                    .get('categories', {
                        params: this.queryInfo
                    })
                    .then(res => {
                        // console.log(res.data)
                        this.catelist = res.data.data.result
                        this.total = res.data.data.total
                        // console.log(this.catelist)
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取分类列表失败')
                    })
            },
            // 监听pagesize改变的事件
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCateList()
            },
            // 监听pagenum的改变
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCateList()
            },
            // 点击按钮,打开添加分类对话框
            showAddCateDialog() {
                this.addCatedialogVisible = true
                this.getParentCateList()
            },
            // 获取父级分类的数据列表
            getParentCateList() {
                this.$http
                    .get('categories', {
                        params: { type: 2 }
                    })
                    .then(res => {
                        // console.log(res.data.data)
                        this.parentCateList = res.data.data
                        // console.log(this.parentCateList)
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取数据失败')
                    })
            },
            // 选择项发生变化触发
            parentCateChange(){
                console.log(this.selectedKeys)
                // 如果selectedKeys.length大于0,则说明选中了父级
                if(this.selectedKeys.length>0){
                    this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
                    this.addCateForm.cat_level=this.selectedKeys.length
                }else{
                    this.addCateForm.cat_pid=0
                    this.addCateForm.cat_level=0
                }
            },
            // 添加新分类按钮
            addCate(){
                console.log(this.addCateForm)
                this.$refs.addCateFormRef.validate(valid=>{
                    if(!valid){
                        this.$message.error('预校验失败')
                    }
                    this.$http
                    .post('categories',this.addCateForm)
                    .then(res=>{
                        console.log(res.data)
                        this.$message.success('添加成功')
                        this.getCateList()
                        this.addCatedialogVisible=false
                    })
                    .catch(err=>{
                        console.log(err)
                        this.$message.error('添加失败')
                    })
                })
            },
            // 监听添加分类对话框关闭
            addCateDialogClosed(){
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys=[]
                this.addCateForm.cat_level=0
                this.addCateForm.cat_pid=0
            }
        }
    }
</script>

<style scoped>
.el-cascader{
    width:100%;
}
</style>