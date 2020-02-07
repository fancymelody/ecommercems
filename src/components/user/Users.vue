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
                    <el-input placeholder="请输入内容" class="input-with-select">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary">添加用户</el-button>
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
                        <el-switch v-model="scope.row.mg_state"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="190px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" size="mini" icon="el-icon-delete"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" size="mini" icon="el-icon-setting"></el-button>
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
                    pagesize: 2
                },
                userlist: [],
                total: 0
            }
        },
        created() {
            this.getUserList()
        },
        methods: {
            async getUserList() {
                const { data: res } = await this.$http.get('users', { params: this.queryInfo })
                if (res.meta.status !== 200) {
                    this.$message.console.error(res.meta.msg);
                } else {
                    this.userlist = res.data.users
                    this.total = res.data.total
                }
                console.log(res)
            },
            // 监听pagesize改变的事件,回调参数为新的每页条数
            handleSizeChange(newSize){
                console.log(newSize)
                this.queryInfo.pagesize=newSize
                this.getUserList()
            },
            //监听当前页码值
            handleCurrentChange(newPage){
                console.log(newPage)
                this.queryInfo.pagenum=newPage
                this.getUserList()
            }
        }
    }
</script>

<style scoped>

</style>