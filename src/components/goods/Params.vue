<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 头部警告区 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat-opt">
                <el-col>
                    <span>选择商品分类</span>
                    <el-cascader v-model="selectedKeys" :options="catelist" :props="cateProps" @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- Tab页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加参数</el-button>
                    <!-- 动态数据表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                                    @close="handleClose(i,scope.row)">
                                    {{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="tagInputRef" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                    @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                        添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                                    @close="handleClose(i,scope.row)">
                                    {{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="tagInputRef" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                    @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改参数的对话框 -->
        <el-dialog :title="'添加'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 获取的列表
                catelist: [],
                // 级联选择框配置对象
                cateProps: {
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                // 级联选择框双向绑定的
                selectedKeys: [],
                // 被激活的页签的名称
                activeName: 'many',
                // 动态参数数据
                manyTableData: [],
                // 静态参数数据
                onlyTableData: [],
                addDialogVisible: false,
                // 添加参数的表单对象
                addForm: {
                    attr_name: ''
                },
                addFormRules: {
                    attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
                },
                // 修改参数的表单对象
                editForm: {
                    attr_name: ''
                },
                editDialogVisible: false,
                editFormRules: {
                    attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
                },
                // 控制新增tag
                inputVisible: false,
                inputValue: ''
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            getCateList() {
                this.$http
                    .get('categories')
                    .then(res => {
                        this.catelist = res.data.data
                        // console.log(this.catelist)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            },
            // 获取参数面板内容函数
            getParamsData() {
                // 根据所选分类的id和当前所属的面板发起请求
                this.$http
                    .get('categories/' + this.cateId + '/attributes', {
                        params: {
                            sel: this.activeName
                        }
                    }).then(res => {
                        // console.log(res.data)
                        res.data.data.forEach(item => {
                            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                            // 控制文本框的显示与隐藏
                            item.inputVisible = false
                            item.inputValue = ''
                        });
                        console.log(res.data.data)
                        if (this.activeName === 'many') {
                            this.manyTableData = res.data.data
                        } else {
                            this.onlyTableData = res.data.data
                        }
                    }).catch(err => {
                        console.log(err)
                        this.$message.error('获取参数列表失败')
                    })
            },
            // 监听级联选择框变化
            handleChange() {
                // 只能选择三级的
                if (this.selectedKeys.length !== 3) {
                    this.selectedKeys = []
                    this.manyTableData = []
                    this.onlyTableData = []
                }
                console.log(this.selectedKeys)
                this.getParamsData()
            },
            // tab页签点击事件
            handleClick() {
                console.log(this.activeName)
                this.getParamsData()
            },
            // 监听添加对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 点击按钮,添加参数
            addParams() {
                this.$refs.addFormRef.validate(valid => {
                    if (!valid) return
                    this.$http
                        .post('categories/' + this.cateId + '/attributes', {
                            attr_name: this.addForm.attr_name,
                            attr_sel: this.activeName
                        })
                        .then(res => {
                            console.log(res.data)
                            this.$message.success('添加参数成功')
                            this.addDialogVisible = false
                            this.getParamsData()
                        })
                        .catch(err => {
                            console.log(err)
                            this.$message.error('添加参数失败')
                        })
                })
            },
            // 点击按钮,显示修改的对话框
            showEditDialog(attr_id) {
                this.$http
                    .get('categories/' + this.cateId + '/attributes/' + attr_id, {
                        params: {
                            attr_sel: this.activeName
                        }
                    })
                    .then(res => {
                        console.log(res.data)
                        this.editForm = res.data.data
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取参数信息失败')
                    })
                this.editDialogVisible = true
            },
            // 监听编辑对话框的关闭事件
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 点击按钮，修改参数
            editParams() {
                this.$refs.editFormRef.validate(valid => {
                    if (!valid) return;
                    this.$http
                        .put('categories/' + this.cateId + '/attributes/' + this.editForm.attr_id, {
                            attr_name: this.editForm.attr_name,
                            attr_sel: this.activeName
                        })
                        .then(res => {
                            console.log(res.data)
                            this.$message.success('编辑参数成功')
                            this.getParamsData()
                            this.editDialogVisible = false
                        })
                        .catch(err => {
                            console.log(err)
                            this.$message.error('编辑参数失败')
                        })
                })
            },
            // 点击按钮,删除属性
            async deleteParams(attr_id) {
                const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => console.log(err))
                if (confirmResult !== 'confirm') {
                    return this.$message.info('用户已取消删除')
                }
                this.$http
                    .delete('categories/' + this.cateId + '/attributes/' + attr_id)
                    .then(res => {
                        console.log(res.data)
                        this.$message.success('删除成功')
                        this.getParamsData()
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('删除失败')
                    })
            },
            // 文本框失去焦点或按下enter都会触发
            handleInputConfirm(row) {
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = ''
                    row.inputVisible = false
                    return
                }
                // 如果没有return,则证明输入的内容,需要做后续处理
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue = ''
                row.inputVisible = false
                this.saveAttrs(row)
            },
            // 点击按钮,提示文本输入框
            showInput(row) {
                row.inputVisible = true
                // 让文本框自动获得焦点
                // $nextTick方法的作用:当页面上元素被重新渲染之后,才会执行回调函数中的代码
                this.$nextTick(_ => {
                    this.$refs.tagInputRef.$refs.input.focus();
                });
            },
            // 将attr_vals操作保存数据库
            saveAttrs(row) {
                this.$http
                    .put('categories/' + this.cateId + '/attributes/' + row.attr_id, {
                        attr_name: row.attr_name,
                        attr_sel: row.attr_sel,
                        attr_vals: row.attr_vals.join(' ')
                    })
                    .then(res => {
                        console.log(res.data)
                        this.$message.success('修改参数成功')
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('修改参数失败')
                    })
            },
            // 删除tag
            handleClose(i, row) {
                row.attr_vals.splice(i, 1)
                this.saveAttrs(row)
            }
        },
        computed: {
            // 如果按钮需要被禁用,则返回true
            isBtnDisabled() {
                if (this.selectedKeys.length !== 3) {
                    return true;
                }
                return false;
            },
            // 当前选中的三级分类的id
            cateId() {
                if (this.selectedKeys.length === 3) {
                    return this.selectedKeys[2]
                }
                return null;
            },
            titleText() {
                if (this.activeName === 'many') {
                    return '动态参数'
                }
                return '静态属性'
            }
        }
    }
</script>

<style scoped>
    .cat-opt {
        margin: 15px 0;
    }

    .el-tag {
        margin: 10px;
    }

    .input-new-tag {
        width: 120px;
    }
</style>