<template>
    <div id="roles">
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
                            v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children"
                                    :key="item2.id">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id"
                                            closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                        <!-- 分配权限按钮 -->
                        <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">
                            分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%"
        @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree ref="treeRef" :data="rightlist" node-key="id" :props="rightProps" 
            :default-expand-all="true" :default-checked-keys="defKeys" show-checkbox></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allocRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //获得的角色列表数据
                rolelist: [],
                // 控制分配权限的对话框是否关闭
                setRightDialogVisible: false,
                // 获取的权限列表数据
                rightlist: [],
                // 树形控件的属性绑定事件
                rightProps: {
                    label: 'authName',
                    children: 'children'
                },
                // 默认选中的节点id值数组
                defKeys:[],
                roleId:''
            }
        },
        created() {
            this.getRoleList()
        },
        methods: {
            getRoleList() {
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
            },
            // 根据id删除对应的权限
            async removeRightById(role, rightId) {
                // console.log(role)
                const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confirmResult === "confirm") {
                    this.$http
                        .delete('roles/' + role.id + '/rights/' + rightId)
                        .then(res => {
                            // console.log(res)
                            this.$message.success("删除成功")
                            //this.getRoleList()页面会完整渲染
                            this.getRoleList()
                            // 返回的data, 是当前角色下最新的权限数据
                            // role.children=res.data
                        })
                        .catch(err => {
                            this.$message.error("删除失败")
                        })
                } else {
                    this.$message.info('已取消删除')
                }
            },
            // 展示分配权限的对话框
            showSetRightDialog(role) {
                this.roleId=role.id
                //获取所有权限
                this.$http
                    .get('rights/tree')
                    .then(res => {
                        this.rightlist = res.data.data
                        // console.log(this.rightlist)
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取权限列表失败')
                    })
                this.getLeafKeys(role,this.defKeys)
                this.setRightDialogVisible = true
            },
            // 通过递归的形式,获取角色下所有三级权限的id,并保存到数组中
            getLeafKeys(node,arr){
                // 如果当前结点不包括children属性,证明是三级结点
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item => {
                    this.getLeafKeys(item,arr)
                });
            },
            // 监听分配权限对话框关闭
            setRightDialogClosed(){
               this.defKeys=[]
            },
            // 点击为角色分配权限
            allocRights(role){
                const keys=[...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
                // console.log(keys)
                const idStr=keys.join(',')
                this.$http
                .post('roles/'+this.roleId+'/rights',{rids:idStr})
                .then(res=>{
                    this.$message.success('分配角色成功')
                    this.getRoleList()
                    this.setRightDialogVisible=false
                })
                .catch(err=>{
                    console.log(err)
                    this.$message.error('分配角色失败')
                })
            }
        }
    }
</script>

<style scoped>
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