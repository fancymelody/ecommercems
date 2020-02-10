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
                    <el-cascader v-model="selectedKeys" expandTrigger="hover" :options="catelist" :props="cateProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!-- Tab页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="动态参数" name="first">
                    <el-button size="mini" type="primary" :disabled="isBtnDisabled">添加参数</el-button>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="second">
                    <el-button size="mini" type="primary" :disabled="isBtnDisabled">添加属性</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-card>
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
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                // 级联选择框双向绑定的
                selectedKeys: [],
                // 被激活的页签的名称
                activeName:'first'
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
                        console.log(this.catelist)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            },
            // 监听级联选择框变化
            handleChange() {
                // 只能选择三级的
                if (this.selectedKeys.length !== 3) {
                    this.selectedKeys = []
                }
                console.log(this.selectedKeys)
            },
            // tab页签点击事件
            handleClick(){
                console.log(this.activeName)
            }
        },
        computed:{
            // 如果按钮需要被禁用,则返回true
            isBtnDisabled(){
                if(this.selectedKeys.length!==3){
                    return true;
                }
                return false;
            }
        }
    }
</script>

<style scoped>
    .cat-opt {
        margin: 15px 0;
    }
</style>