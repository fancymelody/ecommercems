<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 进度条 -->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top" label-width="100px">
                <!-- tab栏区域 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action表示图片要上传的地址 -->
                        <el-upload :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeIndex: '0',
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics:[]
                },
                addFormRules: {
                    goods_name: [
                        { required: true, message: '请输入商品名称', trigger: 'blur' }
                    ],
                    goods_price: [
                        { required: true, message: '请输入商品价格', trigger: 'blur' }
                    ],
                    goods_weight: [
                        { required: true, message: '请输入商品重量', trigger: 'blur' }
                    ],
                    goods_number: [
                        { required: true, message: '请输入商品数量', trigger: 'blur' }
                    ],
                    goods_cat: [
                        { required: true, message: '请选择商品分类', trigger: 'blur' }
                    ]
                },
                catelist: [],
                cateProps: {
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                manyTableData: [],
                onlyTableData: [],
                uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
                headerObj:{
                    Authorization:window.sessionStorage.getItem('token')
                }
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
                        console.log('分类列表' + res.data)
                        this.catelist = res.data.data
                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.error('获取失败')
                    })
            },
            handleChange() {
                console.log(this.addForm.goods_cat)
                if (this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            beforeTabLeave(activeName, oldActiveName) {
                //    console.log('即将离开的'+oldActiveName)
                //    console.log('即将进入的'+activeName)
                if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    this.$message.error('请先选择商品分类')
                    return false;
                }
                return true;
            },
            tabClicked() {
                // console.log(this.activeIndex)
                // 访问动态参数面板
                if (this.activeIndex === '1') {
                    //    console.log('动态参数面板')
                    this.$http
                        .get('categories/' + this.cateId + '/attributes', {
                            params: {
                                sel: 'many'
                            }
                        })
                        .then(res => {
                            //  console.log('动态参数列表'+res.data)
                            res.data.data.forEach(item => {
                                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                            })
                            this.manyTableData = res.data.data
                            console.log(this.manyTableData)
                        })
                        .catch(err => {
                            console.log(err)
                            this.$message.error('获取动态参数列表失败')
                        })
                } else if (this.activeIndex === '2') {
                    this.$http
                        .get('categories/' + this.cateId + '/attributes', {
                            params: {
                                sel: 'only'
                            }
                        })
                        .then(res => {
                            this.onlyTableData = res.data.data
                            console.log(this.onlyTableData)
                        })
                        .catch(err => {
                            console.log(err)
                            this.$message.error('获取动态参数列表失败')
                        })
                }
            },
            // 处理图片预览
            handlePreview() {

            },
            // 处理移除图片
            handleRemove() {

            },
            // 监听图片上传成功的事件
            handleSuccess(response){
               console.log(response)
            }
        },
        computed: {
            cateId() {
                if (this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2]
                }
                return null
            }
        }
    }
</script>

<style scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }
</style>