<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select"
                        @clear="getUserList" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <!-- 作用域插槽 -->
                    <!-- {{scope.row}} -->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="190px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">
                        </el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)">
                        </el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <!-- prop为验证规则对应的字段名 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑用户对话框 -->
        <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <!-- prop为验证规则对应的字段名 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
            <div>
                <p>当前的用户:{{userInfo.username}}</p>
                <p>当前的角色:{{userInfo.role_name}}</p>
                <p>分配新角色:
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                queryInfo: {
                    query: '',
                    //当前的页数
                    pagenum: 1,
                    //当前每页显示多少条数据
                    pagesize: 5
                },
                userlist: [],
                total: 0,
                //控制添加用户对话框的显示与隐藏
                addDialogVisible: false,
                //添加用户的表单数据
                addForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                // 添加表单的验证规则对象
                addFormRules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '用户名长度在 3 到 10个字符', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '用户名长度在 6 到 15个字符', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号', trigger: 'blur' }
                    ]
                },
                // 编辑用户对话框
                editDialogVisible: false,
                editForm: {},
                editFormRules: {
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机号', trigger: 'blur' }
                    ]
                },
                setRoleDialogVisible: false,
                userInfo: '',
                rolelist: [],
                selectedRoleId:''
            }
        },
        created() {
            this.getUserList()
        },
        methods: {
            async getUserList() {
                const { data: res } = await this.$http.get('users', { params: this.queryInfo })
                if (res.meta.status !== 200) {
                    this.$message.error(res.meta.msg);
                } else {
                    this.userlist = res.data.users
                    this.total = res.data.total
                }
                // console.log(res)
            },
            // 监听pagesize改变的事件,回调参数为新的每页条数
            handleSizeChange(newSize) {
                console.log(newSize)
                this.queryInfo.pagesize = newSize
                this.getUserList()
            },
            //监听当前页码值
            handleCurrentChange(newPage) {
                console.log(newPage)
                this.queryInfo.pagenum = newPage
                this.getUserList()
            },
            //监听switch开关状态的改变
            async userStateChanged(userinfo) {
                console.log(userinfo)
                console.log(userinfo.id)
                // 反引号模板字符串（可以使用多行字符串和字符串插值功能）以下两种均可
                //const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
                const { data: res } = await this.$http.put('users/' + userinfo.id + '/state/' + userinfo.mg_state)
                console.log(res)
                if (res.meta.status !== 200) {
                    userinfo.mg_state = !userinfo.mg_state
                    return this.$message.error('更新用户状态失败')
                } else {
                    this.$message.success('更新用户状态成功')
                }
            },
            // 监听添加用户对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 监听修改用户对话框的关闭事件
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 点击按钮,添加新用户
            addUser() {
                this.$refs.addFormRef.validate(async valid => {
                    // console.log(valid)
                    if (valid) {
                        const { data: res } = await this.$http.post('users', this.addForm)
                        if (res.meta.status !== 201) {
                            this.$message.error('添加用户失败')
                        } else {
                            this.$message.success('添加用户成功')
                            this.addDialogVisible = false
                            this.getUserList()
                        }
                    }
                })
            },
            // 修改按钮
            editUser() {
                this.$refs.editFormRef.validate(async valid => {
                    // console.log(valid)
                    if (valid) {
                        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                            email: this.editForm.email,
                            mobile: this.editForm.mobile
                        })
                        if (res.meta.status !== 200) {
                            this.$message.error('修改用户失败')
                        } else {
                            this.$message.success('修改用户成功')
                            this.editDialogVisible = false
                            this.getUserList()
                        }
                    }
                })
            },
            // 打开编辑用户对话框
            showEditDialog(id) {
                // console.log(id)
                this.$http
                    .get('users/' + id)
                    .then(response => {
                        // console.log(response.data.data)
                        this.editForm = response.data.data
                        this.editDialogVisible = true
                    })
                    .catch(err => {
                        this.$message.error('查询失败')
                        console.error(err);
                    });
            },
            // 删除用户
            async deleteUser(id) {
                console.log("删除用户id")
                console.log(id)
                const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                // console.log(confirmResult)
                if (confirmResult === "confirm") {
                    this.$http
                        .delete('users/' + id)
                        .then(response => {
                            console.log(response)
                            this.$message.success("删除成功")
                            this.getUserList()
                        })
                        .catch(err => {
                            this.$message.error("删除失败")
                        })
                } else {
                    this.$message.info('已取消删除')
                }
            },
            // 分配角色对话框
            setRole(userInfo) {
                this.userInfo = userInfo
                // 获取所有的角色列表
                this.$http
                    .get('roles')
                    .then(res => {
                        this.rolelist = res.data.data
                        // console.log(this.rolelist)
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取角色列表失败')
                    })
                this.setRoleDialogVisible = true
            },
            // 点击按钮,分配角色
            saveRoleInfo(){
                if(!this.selectedRoleId){
                    this.$message.error('请选择要分配的角色')
                }
                this.$http
                .put('users/'+this.userInfo.id+'/role',{rid:this.selectedRoleId})
                .then(res=>{
                    console.log(res.data)
                    this.$message.success('成功分配角色')
                    this.getUserList()
                    this.setRoleDialogVisible=false
                })
                .catch(err=>{
                    console.log(err)
                    this.$message.error('分配角色失败')
                })
            },
            // 监听分配角色对话框关闭事件
            setRoleDialogClosed(){
                this.selectedRoleId=''
                this.userInfo=''
            }
        }
    }
</script>

<style scoped>

</style>