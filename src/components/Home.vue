<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button @click="logout" type="info">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" 
                :unique-opened="true" :collapse="isCollapse" :collapse-transition="false"
                :default-active="activePath" router>
                    <!-- 一级菜单 -->
                    <el-submenu :index="firstItem.id+''" v-for="firstItem in menuList" :key="firstItem.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[firstItem.id]"></i>
                            <!-- 文本 -->
                            <span>{{firstItem.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+secondItem.path" v-for="secondItem in firstItem.children"
                            :key="secondItem.id" @click="saveNavState('/'+secondItem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{secondItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右边内容主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data() {
            return {
                menuList: [],
                iconsObj: {
                    '125': 'iconfont icon-user',
                    '103': 'iconfont icon-tijikongjian',
                    '101': 'iconfont icon-shangpin',
                    '102': 'iconfont icon-danju',
                    '145': 'iconfont icon-baobiao'
                },
                isCollapse:false,
                activePath:''
            }
        },
        created() {
            this.getMenuList()
            this.activePath=window.sessionStorage.getItem('activePath')
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push('/login')
            },
            async getMenuList() {
                const { data: res } = await this.$http.get('menus')
                if (res.meta.status !== 200) {
                    return this.$message.error(res.meta.msg);
                } else {
                    this.menuList = res.data
                }
                //    console.log(res)
                // console.log(this.menuList)
            },
            // 菜单的折叠与展开
            toggleCollapse(){
                this.isCollapse=!this.isCollapse
            },
            //保存链接的激活状态
            saveNavState(activePath){
                window.sessionStorage.setItem('activePath',activePath)
                this.activePath=activePath
            }
        }
    }
</script>

<style scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;
    }

    .el-header div {
        display: flex;
        align-items: center;
    }

    .el-header div span {
        margin-left: 15px;
    }

    .el-aside {
        background-color: #333744;
    }
    .toggle-button{
        background-color: #4A5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
    .el-aside .el-menu {
        border-right: none;
    }

    .el-main {
        background-color: #eaedf1;
    }

    .iconfont {
        margin-right: 10px;
    }
</style>